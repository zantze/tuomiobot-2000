const Discord = require('discord.js');
var blessed = require('neo-blessed');

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const client = new Discord.Client();
const auth = require('../auth.json')

const db = require('./db');

const tbMessage = require('./models/message');
const tbReaction = require('./models/reaction');

let parsedGuilds = [];

let logs = [];

const sendMessage = (channel, message) => {
  channel.send(message);
}

const getMessage = (currentChannel, messageId) => {
  console.log(`fetching ${messageId}`);
  currentChannel.fetchMessage(messageId).then( (message) => {
    currentChannel.send(`hmm... looks like some dumb shit posted by ${message.author.username}`);
    console.log(message);
  })
}

const getReactions = (message) => {
  let reactions = [];
  message.reactions.array().forEach(reaction => {
    reactions.push({
      emote_id: reaction._emoji.id,
      emote_name: reaction._emoji.name,
      count: reaction.count,
      message: message.id,
    });
  })

  return reactions;
}

const insertReactions = (reactions) => {
  reactions.forEach( reaction => {
    tbReaction.methods.insertReaction(reaction);
  });
}

const getMessages = (currentChannel, channelId, msg) => {
  let guildId = msg.channel.guild.id;

  let channel = client.guilds.find( guild => guild.id === guildId)
  .channels.find( channel => channel.id === channelId);

  currentChannel.send(`Channel name is #${channel.name}. Fetching messages now uwu`);

  fetchMessages(channel).then( result => {
    console.log("yeah");
  })
  .catch( error => {
    console.log('oh noo')
    console.log(error); 
  });

}

const fetchMessages = (channel, lastMessage, iteration) => {
  if (iteration === undefined) {
    iteration = 0;
  }

  let request = {
    limit: 100
  };

  if (lastMessage !== undefined)
    request.before = lastMessage;

  return channel.fetchMessages(request).then( messages => {

    if (messages.length === 0) {
      return "Ok!";
    }

    messageId = messages.last().id;
    messages.array().forEach(message => {
      tbMessage.methods.insertMessage({
        id: message.id,
        message: message.content,
        author: message.author.id,
        channel: message.channel.id,
        created: message.createdAt,
      });

      const reactions = getReactions(message);
      if (reactions.length > 0) {
        insertReactions(reactions);
      }
    });

    console.log(iteration, messageId);

    iteration++;
    if (messages.length < 100) {
      return "Ok!";
    }

    return fetchMessages(channel, messageId, iteration)
  })
}

client.on('ready', () => {
  log(`Logged in as ${client.user.tag}!`);
  log('connected as id ' + db.threadId);

  client.guilds.forEach( guild => {
    let pushGuild = {
      id: guild.id,
      name: guild.name,
      channels: []
    };

    guild.channels.forEach( channel => {
      pushGuild.channels.push({
        name: channel.name,
        id: channel.id
      });
    });
    
    parsedGuilds.push(pushGuild)
  });

  serversBox.setItems(guildsToStrings(parsedGuilds));
});

client.on('message', msg => {
  console.log(msg);

  let loadCommand = 'bot, load ';
  let inspectCommand = 'bot, tell me about message number ';

  const message = msg.content.toLowerCase();

  if (message.includes('morning')) {

  }

  if (msg.content.includes(loadCommand)) {
    const channelId = msg.content.substring(loadCommand.length)

    msg.reply('comin right up');
    getMessages(msg.channel, channelId, msg)
  }

  if (msg.content.includes(inspectCommand)) {
    const messageId = msg.content.substring(inspectCommand.length)
    msg.reply('looks interesting :3');
    getMessage(msg.channel, messageId)
  }
});

client.login(auth.token);

const guildsToStrings = (guildArray) => {
  names = [];
  guildArray.forEach( guild => {
    names.push(guild.name);
  });

  return names;
}

//
// ui shit 
//

var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'my window title';

var serversBox = blessed.list({
  top: 'top',
  left: 'left',
  width: '30%',
  height: '100%',
  items: guildsToStrings(parsedGuilds),
  keys: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'white',
      fg: 'black'
    }
  }
});

screen.append(serversBox); 
  
serversBox.on('select', (selected) => {
  channelsBox.setItems(guildsToStrings(parsedGuilds[serversBox.getItemIndex(selected)].channels));

});

var channelsBox = blessed.list({
  top: 'top',
  left: '30%',
  width: '30%',
  height: '100%',
  items: [],
  keys: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'white',
      fg: 'black'
    }
  }
});

screen.append(channelsBox); 
serversBox.focus();

var messageBox = blessed.textbox({
  top: 'bottom',
  left: '60%',
  width: '30%',
  height: '10%',
  inputOnFocus: true,
  keys: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'white',
      fg: 'black'
    }
  }
});

messageBox.on('submit', () => {
  let serverId = parsedGuilds[serversBox.selected].id;
  let channelId = parsedGuilds[serversBox.selected].channels[channelsBox.selected].id;
  logger.log('info', 'huh', client.guilds);
  /*sendMessage(client.guilds[serverId].channels[channelId], messageBox.getValue());
  messageBox.clearValue();
  messageBox.unfocus();*/
})

screen.append(messageBox);

var actionsBox = blessed.list({
  top: '10%',
  left: '60%',
  width: '30%',
  height: '30%',
  items: ['download channel', 'something else'],
  keys: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'white',
      fg: 'black'
    }
  }
});
screen.append(actionsBox);

var logBox = blessed.list({
  top: '40%',
  left: '60%',  
  width: '30%',
  height: '60%',
  items: logs,
  keys: false,  
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
  }
});
screen.append(logBox);

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

let currentFocus = 0;
const switchFocus = () => {
  let focuses = [serversBox, channelsBox, messageBox, actionsBox];
  currentFocus++;
  if (currentFocus >= focuses.length)
    currentFocus = 0;

  focuses[currentFocus].focus();
}

screen.key(['tab'], function(ch, key) {
  switchFocus();
});
  
const log = (text, color) => {
  logs.push(text);
  logBox.setItems(logs);
}
// ui shit