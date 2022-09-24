require('dotenv').config();
// const DB.openDB = require('./functions/open_db');

// imports
const { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder, messageLink,  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType  } = require('discord.js');
const { token } = require('./config.json');
const sqlite = require('aa-sqlite');

// function imports
const { createTablesIfNotExist } = require('./lib/createTablesIfNotExist');
const { addUsersToWorkingArray } = require('./lib/addUsersToWorkingArray');
const { addUserToDB } = require('./lib/addUserToDB');
const { generateMatchSession } = require('./lib/generateMatchSession')

const { openDB, closeDB } = require('./lib/DB');
const { generateMatchID } = require('./lib/generateMatchID');
const { checkIfInMatch } = require('./lib/checkIfInMatch');

// intents
const client = new Client({intents: [""]});

// bot login with token
client.login(token)

// for tracking users who have used the bot to reduce the amount of DB queries. will run on startup once.
// probably not a good idea but oh well. we'll see how it goes when I add 300 dummy users
let userIDs = [];
let activeMatches = [];

// run once on startup
client.once('ready', async () => {

	console.log(`--- ${client.user.username} is starting up! ---`);

	try {
		// if tables don't exist then create them
		console.log("Creating/Checking DB tables")

		// users table
		await createTablesIfNotExist("users", "(PK_id INTEGER, name TEXT)");
		//smash ultimate data
		await createTablesIfNotExist("ultimate", "(match_id INTEGER, date INTEGER, player_1 INTEGER, player_2 INTEGER, result INTEGER, both_reported INTEGER, notes TEXT)");


		// populate array with users table from DB
		// console.log("-- Populating working array with DB users --");
		await addUsersToWorkingArray(userIDs);
		// console.log("array has been populated!");
		

		// all success!
		console.log(`----- ${client.user.username} is ready! -----`);
	} catch(e){
		console.log("borked in setup somewhere... :(")
	}

});


// slash command listener
// ephemeral: true (only show the user who ran the command)
client.on('interactionCreate', async interaction => {
	// skip if not a chat command
	if (!interaction.isChatInputCommand()) return;
    
	const { commandName } = interaction;
	const user = interaction.user.username;
	const id = interaction.user.id;

	// if user doesn't exist in database, add it for tracking
	if (!userIDs.includes(parseInt(interaction.user.id))) {
		await addUserToDB(id, user, userIDs);
	}
	
	// slash commands
	if (commandName === 'suh') {
		interaction.reply(`Suh ${user}`);

	} else if (commandName === 'mommy') {
		const file = new AttachmentBuilder('https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/13-penguin-call-1524251368.jpg?crop=0.667xw:1.00xh;0.166xw,0&resize=480:*');
		interaction.reply({content: `Open up, ${user} ;)`, files: [file] , ephemeral: true});

		// match start command ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} else if (commandName === 'box') {

		const challenger = interaction; // person starting the match
		const opponent = interaction.options.getMentionable('opponent'); // person being challenged
		const game = interaction.options.getString('games'); 

		const gamelist = {'ultimate': "Smash Ultimate", 'dbfz': "Dragon Ball FighterZ"}
		console.log(interaction.id + "in command use")
		
		// create challenge
			// send invitation to opponent and request confirmation
				// only DM user if they turn on DMs
				// use embed with reaction button or on screen button
				// create another command to set flag on match to active

			// once match is active, create embed to report match results.
				// match results are pushed to database and cleared from activeMatches
				// for date entry use const d = new Date();   date = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getHours() +":" + d.getMinutes()

		let matchID = await generateMatchSession(challenger, opponent, game, activeMatches);			

		if (matchID !== "") {

			let embedID = interaction.id;
			// each button will contain this data in it's customId
			// used to compare buttons to sessions
			let btnData = `${challenger.user.id} ${opponent.user.id} ${matchID} ${embedID}`;

			// sent to challenger
			const challengerEmbed = new EmbedBuilder()
			.addFields(
				{ name: 'Match Request', value: `<@${challenger.user.id}> sent a challenge request to <@${opponent.user.id}>`},
				{ name: 'Game', value: `${gamelist[game]}`, inline: true },
				{ name: 'Status', value: `Awaiting response`, inline: true },
			);

			const cancelButton = new ActionRowBuilder()
			.addComponents(
					//cancel match request
				new ButtonBuilder()
					.setCustomId(`matchCancel ${btnData}`)
					.setLabel('Cancel match request')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(false)
			);

			const challengeMessage = await interaction.reply({
				embeds: [challengerEmbed],
				components: [cancelButton],
				// content: `Sent your challenge request to ${opponent.user.username} ;)`,
				ephemeral: true,
				fetchReply: true,
				}
			);

			// sent to opponent // add checkingif you can DM code 50007 is failed to send message

			const acceptDenyButtons = new ActionRowBuilder()
			.addComponents(
						//accept button
				new ButtonBuilder()
					.setCustomId(`matchAccept ${btnData}`)
					.setLabel('Accept!')
					.setStyle(ButtonStyle.Success)
					.setDisabled(false),
						// decline button
				new ButtonBuilder()
					.setCustomId(`matchDecline ${btnData}`)
					.setLabel('Decline')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(false),
			);

			const opponentEmbed = new EmbedBuilder()
			.addFields(
				{ name: 'Match Request', value: `Received a match request from <@${challenger.user.id}>`},
				{ name: 'Game', value: `${gamelist[game]}`, inline: true },
				{ name: 'Status', value: `Awaiting response`, inline: true },
				{ name: 'Accept?', value: `Accept or decline by reacting below!`},
			);

			const opponentMessage = await client.users.cache.get(opponent.user.id).send({
				embeds: [opponentEmbed],
				components: [acceptDenyButtons],
			});


		} else {
			interaction.reply({
				content: `Match with ${opponent.user.username} was not created :(`,
				ephemeral: true});
		}

	}
});


// button listener
client.on('interactionCreate', async btnPress => {
	if (!btnPress.isButton()) return;
	
	console.log(btnPress.user.id);
	console.log(btnPress.customId);

	let btnType = btnPress.customId.split(" ")[0];
	let btnChallenger = btnPress.customId.split(" ")[1];
	let btnOpponent = btnPress.customId.split(" ")[2];
	let btnMatchID = btnPress.customId.split(" ")[3];
	let embedID = btnPress.customId.split(" ")[4];


	// if button is matchAccept. change to function
	if (btnPress.customId.split(" ")[0] == 'matchAccept') {
		console.log("accepted");

		let validButton = false;

		for (let i = 0; i < activeMatches.length; i++) {

			if (activeMatches[i]['matchID'] == btnMatchID && activeMatches[0]['accepted'] == false) {
				validButton = true;
				activeMatches[0]['accepted'] = true;
				
				// console.log(btnPress.component)

				console.log(activeMatches[0]['accepted']);

				break;
			}
		}

		if (validButton == true) {

			console.log("button was indeed validitionined")

			// create match ID. 
			// push to matchHistory in DB with result null

		} else {
			console.log("DED BUTTON")
			
			await btnPress.reply({
				content: "Not a valid button! Try asking them to send a new match"
			})
		}
	}
});