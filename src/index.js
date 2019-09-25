const Discord = require('discord.js');

const client = new Discord.Client();
const auth = require('../auth.json')

const db = require('./db');

const tbMessage = require('./models/message');
const tbReaction = require('./models/reaction');

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