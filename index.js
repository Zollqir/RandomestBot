const Discord = require('discord.js');
const random = require("./node-random-master/main.js");
const bot = new Discord.Client();

const token = 'NjEwNzgzODMzMDkxOTk3NzE3.G4tHLY.htOvj0U7Lrqn-8YVTKH-Xv-8NE3ZdNDOFgPn-c';

var channel;
var output;

bot.on('ready', () => 
{
	console.log('Randomest bot online!');
})

bot.login(token);

bot.on('message', msg =>
	{
		if(msg.content.substring(0, 5) == '!roll') //if a message starts with '!roll'
		{
			channel = msg.channel;
			var command = msg.content.substring(5);
			output = [];
			command = command.replace(/ /g, ''); //remove all whitespace
			if (!command.match(/^[0-9d+-]+$/)) //if there are any characters in the command other than numbers, +, -, or the letter d, then do nothing
				return;

			command = command.replace(/-/g, '+-'); //replace all - signs with '+-' (makes parsing the string easier)
			var splitCommand = command.split("+");
			if (splitCommand[0] == '')
				splitCommand.shift();
			for (var i = 0; i < splitCommand.length; i++)
			{
				if (splitCommand[i].substring(0, 1) == '-')
					output.push(splitCommand[i]);
				else
					output.push('+' + splitCommand[i]);
			}

			var rands = 0;		//count how many random numbers are needed
			for (i = 0; i < output.length; i++)
			{
				if (isNaN(output[i])) //if currently at not a number (assumed to be of the form +XdY or -XdY)
				{
					var X = output[i].substring(1, output[i].indexOf('d'));
					rands += parseInt(X); //add X to the number of required random numbers
				}
			}
					

			var options =
			{
						secure: true,	//Makes the request secure
						num: rands,			//Requesting rands integers
						min: 1,			
						max: 200,//Integers in the range 1-200 (will use modulo later to get correct range for dice)
						col: 1,			//Arranged in one column
						base: 10, 		//base 10 numbers
						rnd: "new"		//Use true random number generation via atmospheric noise
			}
			
			function callBack(integers)
			{
				var i = 0;
				var signs = [];
				for (var j = 0; j < output.length; j++)
				{
					signs[j] = output[j].substring(0, 1);
					if (isNaN(output[j])) //for each dice roll
					{
						var X = parseInt(output[j].substring(1, output[j].indexOf('d'))); //number of dice
						var Y = parseInt(output[j].substring(output[j].indexOf('d')+1)); //size of dice
						var dice = []
						for (var k = 0; k < X; k++) //for each die
						{
							dice.push((integers[i] % (Y)) + 1); //roll the die
							i++; //increment to the next random number
						}

						output[j] = dice; //replace +XdY or -XdY with +[d1, d2, ...] or -[d1, d2, ...] 
					}
				}

				var sum = 0;
				var string = '``';

				for (var j = 0; j < output.length; j++)
				{
					if (!Array.isArray(output[j])) //If a number
					{
						string += output[j];
						sum += parseInt(output[j]);
					}
					else
					{
						string += signs[j] + '[' + output[j] + ']';
						for (var k = 0; k < output[j].length; k++)
						{
							if (signs[j] == '+')
								sum += output[j][k];
							else
								sum -= output[j][k];
						}
							
					}
				}

				string += '`` = ' + sum;

				channel.send(string);
			}
			random.generateIntegers(callBack, options);	
		}
	})