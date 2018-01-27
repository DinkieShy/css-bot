const Discord = require("discord.js");
const client = new Discord.Client();
var re = /([0-9]+)d([0-9]+)([\+?|\-?]?[0-9]*)/;
var acceptedRoleNames = ['TestRole1', 'TestRole2', 'TestRole3'];
var auth = require('./auth.json');
var execFile = require('child_process').execFile;

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
			case 'studentfinance':
				http.get('https://studentfinancecountdown.com/json/left/', function(res){
					var body = '';
					res.on('data', function(chunk){
						body += chunk;
					});
					res.on('end', function(){
						message.channel.send('The next student finance payment is in ' + JSON.parse(body) + ' days!');
					});
				}).on('error', function(e){
					console.log('Got an error: ', e);
					message.channel.send('Uh oh, something went wrong! Tell Dinkie, Zach or Adam to check the console!');
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
			// case 'nudge':
				// var ii;
				// if(message.isMemberMentioned){
					// console.log('Nudge');
					// var userIDs = message.mentions.users.keyArray();
					// for(var i = 0; i < userIDs.length; i++){
						// message.mentions.users.get(userIDs[i]).send(`${message.author} wants your attention in ${message.channel}!`);
					// }
				// }
				// else{
					// message.channel.send('You need to tag someone!');
				// }
			// break;
			case 'shutdown':
				if(message.author.username == "Dinkie Shy"){
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
				message.channel.send("Commands:\n!DinkbotHelp - display this menu\n!bf [insert brainfuck here]  interprets brainfuck! Try converting a string here: https://copy.sh/brainfuck/text.html !\n!roll xdy or !r xdy - roll x amount of y sided die\n!Ping - Pong!\n!Pong - Ping!\n!nudge @user - Sends the tagged user(s) a ping in dm, in case they muted the channel\n!changerole [role] - Change your role! enter !changerole to find out what roles you can swap around");
			break;
			// case 'bf':
				// result = '';
				// code = message.content.toLowerCase().slice(4, message.content.toLowerCase().length);
				// console.log('code: ' + code);
				// var script = execFile(__dirname  + '/scripts/BFInterpreter.exe', [code]);
				// script.stdout.on('data', function(data, err){
					// if(err){
						// console.log('data in err: ' + err);
					// }
					// if(data != undefined){
						// result += data.toString();
						// console.log(('result so far: ' + result));
						// console.log(('data in: ' + data));
					// }
				// });
				// script.on('close', function(err){
					// if(err){
						// console.log(('data out err: ' + err));
					// }
					// console.log(('result: ' + typeof result + " " + result));
					// console.log('ready to output');
					// message.channel.send(result);
				// });
			// break;
			case 'echo':
				newMessage = message.content.toLowerCase().slice(6, message.content.toLowerCase().length);
				message.channel.send(newMessage);
			break;
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