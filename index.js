const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json')

const getMessage = (currentChannel, messageId) => {
  currentChannel.fetchMessage(messageId).then( (message) => {
    currentChannel.send(`hmm... looks like some dumb shit posted by ${message.author.username}`);
    console.log(message.reactions.first().users);
  })
}

const getReactions = (message) => {
  let reactions = [];
  message.reactions.array().forEach(reaction => {
    reactions.push({
      reactionId: reaction._emoji.id,
      reactionName: reaction._emoji.name,
      reactionCount: reaction.count,
      messageId: message.id,
    });
  })

  return reactions;
}

const getMessages =  (currentChannel, channelId) => {
  let channel = client.guilds.find( guild => guild.name === '... :3')
  .channels.find( channel => channel.id === channelId);

  currentChannel.send(`Channel name is #${channel.name}. Fetching messages now uwu`);

  fetchMessages(channel).then( result => {
    console.log("yeah");
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

    messageId = messages.last().id;
    messages.array().forEach(message => {
      console.log(message.content);
    });

    console.log(iteration, messageId);

    iteration++;
    if (messages.length < 100 || iteration > 5) {
      return "Ok!";
    }

    return fetchMessages(channel, messageId, iteration)
  })
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let loadCommand = 'bot, load ';
  let inspectCommand = 'bot, tell me about message number ';

  if (msg.content.includes(loadCommand)) {
    const channelId = msg.content.substring(loadCommand.length)
    msg.reply('comin right up');
    getMessages(msg.channel, channelId)
  }

  if (msg.content.includes(inspectCommand)) {
    const messageId = msg.content.substring(inspectCommand.length)
    msg.reply('looks interesting :3');
    getMessage(msg.channel, messageId)
  }
});

client.login(auth.token);