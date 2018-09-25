const Discord = require("discord.js");
const client = new Discord.Client();
var re = /([0-9]+)d([0-9]+)([\+?|\-?]?[0-9]*)/;
var acceptedRoleNames = ['first-year', 'second-year', 'third-year', 'postgraduate', 'alumni', 'noncompsci'];
var auth = require('./auth.json');
var execFile = require('child_process').execFile;
var https = require('https');
var helpMessage = "Commands:\n!DinkbotHelp  or !help - display this menu\n!roll xdy or !r xdy - roll x amount of y sided die\n!Ping - Pong!\n!Pong - Ping!\n!changerole [role] - Change your role! enter !changerole to find out what roles you can swap around\n!studentfinance - How many days are left until the next student finance payment?\n\nCommands are *not* case sensitive!";

client.login(auth.token);

client.on('ready', function(){
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', function(message){
	if (message.content.toLowerCase().substring(0, 1) == '!'){
        var args = message.content.toLowerCase().substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd){
			case 'poll':
				if(pollMessage == ""){
					pollAuthor = message.author.username;
					pollFunction(message);
				}
				else{
					message.channel.send("There's already an active poll!");
				}
			break;
			case 'endpoll':
				console.log('end poll');
				if(message.author.username == pollAuthor){
					console.log('ending poll');
					newMessage = "The poll has ended and the results are in!\n```" + poll[0] + "```\n";
					for(var i = 0; i < poll.length-1; i++){
						newMessage += numToEmoji[i] + "`: " + poll[i+1] + " has: " + options[i.toString() + "%E2%83%A3"] + " votes!`\n";
					}
					message.channel.send(newMessage);
					pollMessage = "";
				}
			break;
			case 'studentfinance':
				https.get('https://studentfinancecountdown.com/json/left/', function(res){ //ping the url and get a response
					var body = '';
					res.on('data', function(chunk){ //Compile chunks, data not always received at the same time
						body += chunk;
					});
					res.on('end', function(){ //Print the message once all data collected
						message.channel.send('The next student finance payment is in ' + JSON.parse(body).payload['days'] + ' days!');
						//JSON.parse(body).payload returns an array, [seconds, days]
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
                message.channel.send('Pong!');
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
			case 'dinkbothelp':
				message.channel.send(helpMessage);
			break;
			case 'help':
				message.channel.send(helpMessage);
			break;
			case 'poll':
				if(pollMessage == ""){
					pollAuthor = message.author.username;
					pollFunction(message);
				}
				else{
					message.channel.send("There's already an active poll!");
				}
			break;
			case 'endpoll':
				console.log('end poll');
				if(message.author.username == pollAuthor){
					console.log('ending poll');
					newMessage = "The poll has ended and the results are in!\n```" + poll[0] + "```\n";
					for(var i = 0; i < poll.length-1; i++){
						newMessage += numToEmoji[i] + "`: " + poll[i+1] + " has: " + options[i.toString() + "%E2%83%A3"] + " votes!`\n";
					}
					message.channel.send(newMessage);
					pollMessage = "";
				}
			break;
         }
     }
});

var options = [];
var numToEmoji = [":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:"];
var pollMessage = "";
var pollAuthor;
var poll;

function pollFunction(message){
	poll = message.content.replace("!poll ", "").split('\n');
	var question = poll[0];
	options = [];
	var newMessage = 'React with the emoji of the option you choose!\n```' + question + "```\n";
	if(poll.length > 11){
		message.reply('Error: too many options! You can use a maximum of 10!');
	}
	else{
		var pollReactions;
		for(var i = 0; i < poll.length-1; i++){
			options[i.toString() + "%E2%83%A3"] = 0;
			newMessage += numToEmoji[i] + '`: ' + poll[i+1] + "`\n";
		}
		console.log('Created poll:\n' + newMessage);
		message.channel.send(newMessage).then(newPollMessage => {
			pollMessage = newPollMessage;
		});
	}
}

client.on('messageReactionAdd', (reaction, user) =>{
	console.log('reaction added!');
	console.log(reaction.emoji.identifier);
	if(reaction.message.content = pollMessage){
		options[reaction.emoji.identifier] += 1;
	}
});

client.on('messageReactionRemove', (reaction, user) =>{
	console.log('reaction added!');
	console.log(reaction.emoji.identifier);
	if(reaction.message.content = pollMessage){
		options[reaction.emoji.identifier] -= 1;
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
