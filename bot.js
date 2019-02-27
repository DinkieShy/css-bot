const Discord = require("discord.js");
const client = new Discord.Client();
var re = /([0-9]+)d([0-9]+)([\+?|\-?]?[0-9]*)/;
var acceptedRoleNames = ['first-year', 'second-year', 'third-year', 'postgraduate', 'alumni', 'noncompsci'];
var auth = require('./auth.json');
var execFile = require('child_process').execFile;
var https = require('https');
var emojis = require("./emojis.json");
var fs = require("fs");
var pollMessages = [];
var helpMessage = "Commands:\n!DinkbotHelp  or !help - display this menu\n!roll xdy or !r xdy - roll x amount of y sided die\n!Ping - Pong!\n!Pong - Ping!\n!changerole [role] - Change your role! enter !changerole to find out what roles you can swap around\n!studentfinance - How many days are left until the next student finance payment?\n!poll - get info on how to make a poll!\n\nCommands are *not* case sensitive!";

client.login(auth.token);

client.on('ready', function(){
	console.log(`Logged in as ${client.user.tag}!`);
	loadPolls();
	for(var i = 0; i < pollUsers.length; i++){
		for(var ii = 0; ii < pollUsers[i].polls.length; ii++){
			client.channels.get(pollUsers[i].polls[ii].channel).fetchMessage(pollUsers[i].polls[ii].message).then(message =>{
      pollMessages.push(message);
			console.log("Poll message fetched");
    });
		}
	}
});

client.on('message', function(message){
	if (message.content.toLowerCase().substring(0, 1) == '!'){
    var args = message.content.toLowerCase().substring(1).split(' ');
    var cmd = args[0];
    args = args.splice(1);
    switch(cmd){
			case 'poll':
				if(args.length == 0){
					message.channel.send("How to use !poll:\n\nType !poll followed by your question, i.e. \"!poll is this command awesome?\"\nThen add up to 10 options on new lines, for example\n\"!poll is this command awesome?\nYes\nYes\nYes\nYes\"\n\nThen, when you're done, type !endpoll and choose which poll to end to count up the votes!");
				}
				else{
					createPoll(message);
				}
			break;

			case 'endpoll':
				if(pollUsers[getPollUser(message.author.id)].polls.length > 0){
					displayPolls(message);
				}
				else{
					message.channel.send("You don't have any active polls!");
				}
			break;

			case 'studentfinance':
				https.get('https://studentfinancecountdown.com/json/left/', function(res){ //ping the url and get a response
					var body = '';
					res.on('data', function(chunk){ //Compile chunks, data not always received at the same time
						body += chunk;
					});
					res.on('end', function(){ //Print the message once all data collected
						const embed = {
						  "title": "Which will be " + JSON.parse(body).payload['next'],
						  "description": JSON.parse(body).payload['after'],
						  "url": "https://studentfinancecountdown.com",
						  "color": 11344330,
						  "thumbnail": {
						    "url": "https://place-hold.it/160/36383D/ff40ff?text=" + JSON.parse(body).payload['days'] + "&fontsize=85"
						  },
						  "author": {
						    "name": "Next payment is in " + JSON.parse(body).payload['days'] + " days!",
						    "url": "https://studentfinancecountdown.com",
						    "icon_url": "https://studentfinancecountdown.com/assets/icon.png"
						  },
						  "footer": {
						    "text": "studentfinancecountdown.com"
						  }
						};
						message.channel.send({ embed });
					});
				}).on('error', function(e){
					console.log('Got an error: ', e);
					message.channel.send('Uh oh, something went wrong! Tell Dinkie, Zach or Adam to check the console!');
					//Nothing should go wrong on the bot's end, so hopefully Dinkie doesn't need to hear about this!
				});
			break;

			case 'changerole':
				if(message.content.split(' ')[1]){
					//Check if the bot is allowed to use the requested role
					console.log(message.content.split(' ')[1]);
					var requestedRole = message.guild.roles.filter(g=>g.name == message.content.split(' ')[1]);
					var guildRolesKeyArray = message.guild.roles.keyArray();
					if(requestedRole.keyArray().length == 0){
						message.reply("That role either doesn't exist or I'm not allowed to assign it. The accepted roles are: " + acceptedRoleNames);
						return;
					}
					//Check if the user already has the requested role
					var rolesAlreadyOwned = message.member.roles;
					for(var i = 0; i < rolesAlreadyOwned.keyArray().length; i++){
						console.log(rolesAlreadyOwned.get(rolesAlreadyOwned.keyArray()[i]).name + ": " + requestedRole.get(requestedRole.keyArray()[0]).name);
						if(rolesAlreadyOwned.keyArray()[i] == requestedRole.keyArray()[0]){
							message.reply("you already have that role!");
							return;
						}
					}
					//remove the current role and assign the requested one
					for(var i = 0; i < guildRolesKeyArray.length; i++){
						if(acceptedRoleNames.includes(message.guild.roles.get(guildRolesKeyArray[i]).name) && rolesAlreadyOwned.keyArray().includes(guildRolesKeyArray[i]) && requestedRole.keyArray()[0] != guildRolesKeyArray[i]){
							message.member.removeRole(message.guild.roles.get(guildRolesKeyArray[i]));
						}
						else if(acceptedRoleNames.includes(message.guild.roles.get(guildRolesKeyArray[i]).name) && requestedRole.keyArray()[0] == guildRolesKeyArray[i]){
							message.member.addRole(message.guild.roles.get(guildRolesKeyArray[i]));
						}
					}

					message.reply('enjoy your new role!');
				}
				else{
					message.channel.send("The available roles are: " + acceptedRoleNames);
				}
			break;
			case 'restart':
				if(message.author.username == "Dinkie Shy" || message.member.roles.find("name", "css-committee") != undefined){
					message.channel.send("Shutting down");
					console.log("Shutting down");
					setTimeout(function(){process.exit()}, 3000);
				}
				else{
					message.channel.send("Only Dinkie can do that!");
				}
			break;
      case 'ping':
        message.channel.send("My current response time is: " + client.ping + "ms");
      break;
			case 'pong':
				message.channel.send('Ping!');
			break;
			case 'roll':
				var roll = re.exec(message.content.toLowerCase().slice(6, message.content.toLowerCase().length));
				if (roll != null){
					var rolls = rollDie(parseInt(roll[1]), parseInt(roll[2]), roll[3]);
					var toSend = message.author + " rolled: " + rolls[0].toString() + "=" + rolls[1].toString();
					message.channel.send(toSend.toString());
				}
				else{
					message.channel.send('Invalid formula!');
				}
			break;
			case 'r':
				var roll = re.exec(message.content.toLowerCase().slice(3, message.content.toLowerCase().length));
				if (roll != null){
					var rolls = rollDie(parseInt(roll[1]), parseInt(roll[2]), roll[3]);
					var toSend = message.author + " rolled: " + rolls[0].toString() + "=" + rolls[1].toString();
					message.channel.send(toSend.toString());
				}
				else{
					message.channel.send('Invalid formula!');
				}
			break;
			case 'help':
				message.channel.send(helpMessage);
			break;
    }
  }
});

//Poll object
//	author
//	options
//	question
//	displayPolls()
//	setTimeout in constructor to automatically end the poll
//	endTime
//
//List of poll objects in 2D array, first associated by user id and then associated by poll message id

var pollUsers = [];
var numToEmoji = [":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:"];

function createPoll(message){
	var userMakingPoll = getPollUser(message.author.id);
	if(userMakingPoll == -1){
		pollUsers.push(new PollUser(message));
		userMakingPoll = getPollUser(message.author.id);
	}
	var newPoll = message.content.replace("!poll ", "").split('\n');
	pollUsers[userMakingPoll].polls.push(new Poll(message, newPoll[0]));
	var embed = {
		title: '\n\n**__' + newPoll[0] + "__**\n\n",
		fields:[],
		footer:{"text":"React with the emoji you choose!"},
		"thumbnail": {
			"url": message.author.avatarURL
		}
	};
	if(newPoll.length > 11){
		message.reply('Error: too many options! You can have a maximum of 10!');
	}
	else{
		var pollReactions;
		for(var i = 0; i < newPoll.length-1; i++){
			pollUsers[userMakingPoll].polls[pollUsers[userMakingPoll].polls.length-1].options.push({count:0, question:newPoll[i+1]});
			embed.fields.push({"name": "Option " + i,"value":numToEmoji[i] + ": " + newPoll[i+1]});
		}
		console.log('Created poll:\n' + embed);
		message.channel.send({embed}).then(async function(newPollMessage){
			pollUsers[userMakingPoll].polls[pollUsers[userMakingPoll].polls.length-1].message = newPollMessage.id;
			savePolls();
			for(var i = 0; i < newPoll.length-1;){
				await newPollMessage.react(i.toString() + "%E2%83%A3").catch(console.error).then(i++);
				console.log("added emoji");
			}
		});
	}
	message.delete();
}

function PollUser(message){
	this.id = message.author.id;
	this.polls = [];
}

function Poll(message, question){
	this.author = message.author.id;
	this.question = question;
	this.channel = message.channel.id;
	this.guild = message.guild.id;
	this.message;
	this.options = [];
}

function displayPolls(message, offset = 0, pollsToRemove = []){
	var embed = {
		title:"Which poll would you like to end?",
		fields:[],
		footer:{text:"React with the emoji of the poll question you want to end"}
	};
	for(var i = offset; i < offset + 5 && i < pollUsers[getPollUser(message.author.id)].polls.length; i++){
		embed.fields.push({"name": "Poll " + i,"value":numToEmoji[i-offset+1] + ": " + pollUsers[getPollUser(message.author.id)].polls[i].question});
	}
	message.channel.send({embed}).then(async function(newMessage){
		var done;
		var filter = (reaction, user) => user.id == message.author.id
		var collector = newMessage.createReactionCollector(filter);
		collector.on('collect', r => {
			if(r.emoji.name == emojis["white_check_mark"]){
				done = true;
				collector.stop();
			}
			else if(r.emoji.name == emojis["arrow_right"]){
				done = false;
				collector.stop();
				displayPolls(message, offset+5, pollsToRemove);
			}
			else if(r.emoji.name == emojis["arrow_left"]){
				done = false;
				collector.stop();
				displayPolls(message, offset-5, pollsToRemove);
			}
			else if(pollsToRemove.indexOf(parseInt(r.emoji.identifier[0])-1+offset) == -1){
				pollsToRemove.push(parseInt(r.emoji.identifier[0])-1+offset);
			}
		});
		collector.on('end', function(){
			if(done){
				pollsToRemove.sort(function(a, b){return b-a});
				for(var i = 0; i < pollsToRemove.length; i++){
					endPoll(pollUsers[getPollUser(message.author.id)].polls[pollsToRemove[i]], message);
					pollUsers[getPollUser(message.author.id)].polls.splice(pollsToRemove[i], 1);
				}
				savePolls();
				if(pollsToRemove.length > 0){
					message.channel.send("Successfully ended polls!");
				}
			}
			newMessage.delete();
		});
		if(offset - 5 >= 0){
			await newMessage.react(emojis["arrow_left"]).catch(console.error);
		}
		for(var i = offset; i < pollUsers[getPollUser(message.author.id)].polls.length && i < offset + 5;){
			await newMessage.react((i-offset+1).toString() + "%E2%83%A3").then(i++).catch(console.error);
		}
		if(pollUsers[getPollUser(message.author.id)].polls.length > offset + 5){
			await newMessage.react(emojis["arrow_right"]).catch(console.error);
		}
		done = await newMessage.react(emojis["white_check_mark"]).catch(console.error);
	});
}

function endPoll(pollToEnd, message){
	var embed = {
		title:"The results are in!\n" + pollToEnd.question,
		fields:[]
	};
	for(var i = 0; i < pollToEnd.options.length; i++){
		if(pollToEnd.options[i].count != 1){
			embed.fields.push({"name":pollToEnd.options[i].question, "value":" has " + pollToEnd.options[i].count + " votes!"});
		}
		else{
			embed.fields.push({"name":pollToEnd.options[i].question, "value":" has " + pollToEnd.options[i].count + " vote!"});
		}
	}
	client.guilds.get(pollToEnd.guild).channels.get(pollToEnd.channel).send({embed});
	savePolls();
}

function savePolls(){
  fs.writeFileSync("./pollUsers.json", JSON.stringify(pollUsers));
}

function loadPolls(){
  try{
    pollUsers = JSON.parse(fs.readFileSync("./pollUsers.json"));
  }
  catch(error){
    var date = new Date();
    fs.appendFileSync("./errorReadingPollFiles.json", "\n\n" + date.toString() + "\n");
    fs.appendFileSync("./errorReadingPollFiles.json", error);
    console.error(error);
    pollUsers = [];
  }
}

function getPollUser(id){
  for(var i = 0; i < pollUsers.length; i++){
    if(pollUsers[i].id == id){
      return i;
    }
  }
  return -1;
}

client.on('messageReactionAdd', (reaction, user) =>{
	for(var i = 0; i < pollUsers.length; i++){
		for(var ii = 0; ii < pollUsers[i].polls.length; ii++){
			if(reaction.message.id == pollUsers[i].polls[ii].message){
				if(user.bot == false && parseInt(reaction.emoji.identifier) < pollUsers[i].polls[ii].options.length){
					pollUsers[i].polls[ii].options[parseInt(reaction.emoji.identifier)].count += 1;
				}
			}
		}
	}
});

client.on('messageReactionRemove', (reaction, user) =>{
	for(var i = 0; i < pollUsers.length; i++){
		for(var ii = 0; ii < pollUsers[i].polls.length; ii++){
			if(reaction.message.id == pollUsers[i].polls[ii].message){
				if(user.bot == false && parseInt(reaction.emoji.identifier) < pollUsers[i].polls[ii].options.length){
					pollUsers[i].polls[ii].options[parseInt(reaction.emoji.identifier)].count -= 1;
				}
			}
		}
	}
});

function rollDie(numberOfDice, numberOfSides, modifier){
	var toSend = "";
	var total = 0;
	if (modifier == ""){
		modifier = 0;
	}
	else{
		modifier = parseInt(modifier);
	}
	if (numberOfDice > 1){
		toSend = [];
		for (var i = 0; i < numberOfDice; i++){
			var nextroll = Math.round(Math.random()*numberOfSides);
			total += nextroll + modifier;
			toSend.push("[" + (nextroll).toString()+ (modifier == 0 ? "": "+" + modifier.toString()) + "]");
		}
	}
	else{
		var nextroll = Math.round(Math.random()*numberOfSides)
		total += nextroll + modifier;
		toSend = "[" + nextroll.toString() + (modifier == 0 ? "": "+" + modifier.toString()) + "]";
	}
	return [toSend, total];
}

client.on('messageUpdate', function(oldMessage, newMessage){ //Audit log
	auditChannel = oldMessage.guild.channels.find('name', 'audit-log');
	if(auditChannel != undefined && oldMessage.content != newMessage.content){
		var time = "";
		time += newMessage.createdAt.getDate() + "/" + (newMessage.createdAt.getMonth()+1);
		time += " at " + newMessage.createdAt.getHours() + ":" + newMessage.createdAt.getMinutes() + ":" + newMessage.createdAt.getSeconds();
		auditChannel.send({
			embed:{
				color: 4947400,
				author:{
					name: oldMessage.author.username,
					icon_url: oldMessage.author.avatarURL
				},
				title: `Message Edited on ${time} in ${newMessage.channel.name}`,
				fields: [
					{
						name: "Old message",
						value: oldMessage.content
					},
					{
						name: "New message",
						value: newMessage.content
					}
				]
			}
		});
	}
});

client.on('messageDelete', function(message){
	auditChannel = message.guild.channels.find('name', 'audit-log');
	if(auditChannel != undefined && message.author.bot == false){
		var time = "";
		time += message.createdAt.getDate() + "/" + (message.createdAt.getMonth()+1);
		time += " at " + message.createdAt.getHours() + ":" + message.createdAt.getMinutes() + ":" + message.createdAt.getSeconds();
		auditChannel.send({
			embed:{
				color: 4947400,
				author:{
					name: message.author.username,
					icon_url: message.author.avatarURL
				},
				title: `Message Deleted on ${time} in ${message.channel.name}`,
				fields: [
					{
						name: "Message content",
						value: message.content
					}
				]
			}
		});
	}
});
