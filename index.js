require('dotenv').config();
// const DB.openDB = require('./functions/open_db');

// imports
const { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder, messageLink,  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, BaseGuildTextChannel, TextChannel, Guild, GuildChannelManager  } = require('discord.js');
const { token } = require('./config.json');
const sqlite = require('aa-sqlite');

// function imports
const { createTablesIfNotExist } = require('./lib/createTablesIfNotExist');
const { addUsersToWorkingArray } = require('./lib/addUsersToWorkingArray');
const { addUserToDB } = require('./lib/addUserToDB');
const { generateMatchSession } = require('./lib/generateMatchSession')
const { pushMatchToDB } = require('./lib/pushMatchToDB')


const { getDate } = require('./lib/getDate')
const { openDB, closeDB } = require('./lib/DB');
const { generateMatchID } = require('./lib/generateMatchID');
const { checkIfInMatch } = require('./lib/checkIfInMatch');

// intents
const client = new Client({intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,

]});

// bot login with token
client.login(token)


let userIDs = [];
let activeMatches = [];

// run once on startup
client.once('ready', async () => {

	console.log(`--- ${client.user.username} is starting up! ---`);

	try {
		// if tables don't exist then create them
		console.log("Creating/Checking DB tables")

		// columns must be added as "NAME TYPE". this input is strict.
		// any new columns added here will be added to the table

		// users table
		await createTablesIfNotExist("users", "PK_id INTEGER,name TEXT");
		//smash ultimate data
		await createTablesIfNotExist("ultimate", "match_id INTEGER,date TEXT,result INTEGER,player_1 INTEGER,player_1_reported INTEGER,player_2 INTEGER,player_2_reported INTEGER,both_reported INTEGER,active INTEGER,notes TEXT");

		// populate array with users table from DB
		await addUsersToWorkingArray(userIDs);
		
		// all success!
		console.log(`----- ${client.user.username} is ready! -----`);
	} catch(e){
		console.log("borked in setup somewhere... :(")
	}

});


// slash command listener
// ephemeral: true (only show the user who ran the command)
client.on('interactionCreate', async chatCommand => {
	// skip if not a chat command
	if (!chatCommand.isChatInputCommand()) return;
    
	const { commandName } = chatCommand;
	const user = chatCommand.user.username;
	const id = chatCommand.user.id;
	
	// if user doesn't exist in database, add it for tracking
	if (!userIDs.includes(parseInt(chatCommand.user.id))) {
		await addUserToDB(id, user, userIDs);
	}
	
	// slash commands
	if (commandName === 'suh') {
		chatCommand.reply(`Suh ${user}`);
		
		

		

	} else if (commandName === 'mommy') {
		const file = new AttachmentBuilder('https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/13-penguin-call-1524251368.jpg?crop=0.667xw:1.00xh;0.166xw,0&resize=480:*');
		chatCommand.reply({content: `Open up, ${user} ;)`, files: [file] , ephemeral: true});

		// match start command ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} else if (commandName === 'box') {

		const challenger = chatCommand; // person starting the match
		const opponent = chatCommand.options.getMentionable('opponent'); // person being challenged
		const game = chatCommand.options.getString('games'); 

		const gamelist = {'ultimate': "Smash Ultimate", 'dbfz': "Dragon Ball FighterZ"}
		
		
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

			let embedID = chatCommand.id;
			// each button will contain this data in it's customId
			// used to compare buttons to sessions
			let btnData = `${challenger.user.id} ${opponent.user.id} ${matchID} ${embedID} ${game}`;

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

			const challengeMessage = await chatCommand.reply({
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
			




			// create button collector in here???? READ UP ON DOCUMENTATION FOR THAT. COULD SOLVE THE ISSUE OF DELETING THE EMBEDS





		} else {
			chatCommand.reply({
				content: `Match with ${opponent.user.username} was not created :(`,
				ephemeral: true});
		}

	}
});


// button listener
client.on('interactionCreate', async btnPress => {
	if (!btnPress.isButton()) return;
	

	let btnType = btnPress.customId.split(" ")[0];
	let challengerId = parseInt(btnPress.customId.split(" ")[1]);
	let opponentId = parseInt(btnPress.customId.split(" ")[2]);
	let btnMatchID = parseInt(btnPress.customId.split(" ")[3]);
	let embedID = parseInt(btnPress.customId.split(" ")[4]);
	let game = btnPress.customId.split(" ")[5];


	// if button is matchAccept. 
	if (btnType == 'matchAccept') {
		console.log("accepted");

		let validButton = false;

		for (let i = 0; i < activeMatches.length; i++) {

			if (activeMatches[i]['matchID'] == btnMatchID && activeMatches[0]['accepted'] == false) {
				validButton = true;
				activeMatches[0]['accepted'] = true;
				activeMatches[0]['active'] = true;
				
				break;
			}
		}

		if (validButton == true) {
			console.log("button was indeed validitionined")

			// active matches discord category 1023643386902741083
			console.log(activeMatches);

			// log the match
			await pushMatchToDB(challengerId, opponentId, game, activeMatches, btnMatchID);

			// create the match text channel 
				// only the 2 players can see it
				// has a timeout
				// has embed for tracking wins per player

			// send embed to each player with match channel link

			await btnPress.guild.channels.create(('Text', { //Create a channel
				type: 'text', //Make sure the channel is a text channel
				permissionOverwrites: [{ //Set permission overwrites
					id: btnPress.guild.id,
					allow: ['VIEW_CHANNEL'],
				}]
			}))
			

		} else {

			console.log("DED BUTTON")
			
			await btnPress.reply({
				content: "Not a valid button! Try asking them to send a new match"
			})
			
		}
	}
});