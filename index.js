require('dotenv').config();

// imports
const { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder, messageLink,  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType  } = require('discord.js');
const { token } = require('./config.json');
// const sqlite3 = require('sqlite3').verbose(); // sqlite3 doesn't support async/await
const sqlite = require('aa-sqlite');

// tables that will be created and used

// import these commands later
// change to DBconn(wrap try/catch) later

const openDB = async() => {
	try {
		await sqlite.open("./data/SquareUp.sqlite");
		// console.log("-- Opened DB connection --")
	} catch (error) {
		console.error("Couldn't open DB connection");
		sqlite.close();
	}
}

const createTablesIfNotExist = async(table) => {

	await openDB();

	try {		
		// console.log("checking/creating tables")
		await sqlite.run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER, name TEXT)`);
		// console.log("Tables exist!")
		return true
	} catch (error) {
		// console.log("error at table check/creation")
		console.error(error);
		sqlite.close();
	}
	
	sqlite.close();
};

const addUsersToWorkingArray = async(eventArray) => {

	await openDB();
	
    try {
		// console.log("adding users to working array");
		
		await sqlite.each(`SELECT id FROM users`, [], (user) => {
			eventArray.push(user.id)
		}); 
		
		
	} catch {
		console.log("vvv borked in adding users to array vvv");
		return false
	}

	sqlite.close();

} 

const addUserToDB = async(userid, username) => {

	await openDB();

		try {
			await sqlite.run(`INSERT INTO users (id,name)
			VALUES (${parseInt(userid)}, "${username}");`);
			userIDs.push(parseInt(userid));

		} catch (error) {
			// console.log(`Couldn't add user ${username} to DB`);
		}
	
	sqlite.close();

}

const generateMatchID = () => {
	let id = Math.floor(Math.random() * Date.now());
	return id
}

const checkIfInMatch = (player) => {
	// returns true if in match 
	let inMatch = false;

	// console.log("checking if in match")
	
	if (activeMatches.length == 0) {
		return inMatch 
	}  else {
		
		// console.log(`checking if ${player.user.id} is in match`)

		for (let i = 0; i < activeMatches.length; i++) {

			if (player.user.id == activeMatches[i]['p1']['id']  || player.user.id == activeMatches[i]['p2']['id'] ) {
					// console.log(`${player.user.username} already in game!!`)
					inMatch = true;
					break;
					}
			}
		}
	return inMatch	
}

const generateMatchSession = async(challenger, opponent, game) => {

	// console.log("generating match session");
	
	
	if (checkIfInMatch(challenger) || checkIfInMatch(opponent)) {
		// console.log("checkifinmatch returned true")
		
		return ""
		
	} else {
		// console.log("MAKING MATCH SESSION")
		let id = generateMatchID();
		try {
			
			
			activeMatches.push({ 
			'matchID': id, 'game': game,
			'p1': {'name': challenger.user.username, 'id': challenger.user.id},
			'p2': {'name': opponent.user.username, 'id': opponent.user.id},
			'active': false, 'accepted': false, 'result': null });

		} catch (error) {
			// console.log("Could not make match!!")
		}

		return id;

	}
}

// import these commands later

// function imports
	// do the thing here

// intents
const client = new Client({intents: [""]});

// bot login with token
client.login(token)

// for tracking users who have used the bot to reduce the amount of DB queries. will run on startup once.
// probably not a good idea but oh well. we'll see how it goes when I add 300 dummy users
let userIDs = [];
let activeMatches = []; // format: OBJ, { matchID: get.Date(), P1: requester.id, P2: opponed.id, result: null }

// run once on startup
client.once('ready', async () => {

	// console.log(`--- ${client.user.username} is starting up! ---`);

	try {
		// if tables don't exist then create them
		// console.log("Creating/Checking DB tables")
		await createTablesIfNotExist("users");

		await createTablesIfNotExist("matchHistory");


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

// bot commands 
// "interaction" is the obj that stores the user's information
// use interaction.user.id for DB ids. 
// ephemeral: true (only show the user who ran the command)

client.on('interactionCreate', async interaction => {
	
	// skip if not a chat command
	if (!interaction.isChatInputCommand()) return;
    
	
	// if user doesn't exist, add it for tracking
	if (!userIDs.includes(parseInt(interaction.user.id))) {
		await addUserToDB(interaction.user.id, interaction.user.username);
		// console.log(`Added the new user ${interaction.user.username} to userIDs`);
	} 
	
	const { commandName } = interaction;
	const user = interaction.user.username;
	const id = interaction.user.id;
	
	
	
	// commands
	// is there a better way to add many IDs and match them?
	if (commandName === 'suh') {
		interaction.reply(`Suh ${user}`);

	} else if (commandName === 'mommy') {

		const file = new AttachmentBuilder('https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/13-penguin-call-1524251368.jpg?crop=0.667xw:1.00xh;0.166xw,0&resize=480:*');

		interaction.reply({content: `Open up, ${user} ;)`, files: [file] , ephemeral: true});




		// match start command ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		// match start command ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} else if (commandName === 'box') {


		const challenger = interaction; // person starting the match
		const opponent = interaction.options.getMentionable('opponent'); // person being challenged
		const game = interaction.options.getString('games'); // game

		
		const gamelist = {'ultimate': "Smash Ultimate", 'dbfz': "Dragon Ball FighterZ"}

		
		// create challenge

		// send invitation to opponent and request confirmation
			// only DM user if they turn on DMs
			// use embed with reaction button or on screen button
			// create another command to set flag on match to active


		// once match is active, create embed to report match results.
			// match results are pushed to database and cleared from activeMatches


		let matchID = await generateMatchSession(challenger, opponent, game);			

		if (matchID !== "") {






			let btnData = `${challenger.user.id} ${opponent.user.id} ${matchID}`;


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




// button collector kinda
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;
	
	
	console.log(interaction.user.id);
	console.log(interaction.customId);

	let btnType = interaction.customId.split(" ")[0];
	let btnChallenger = interaction.customId.split(" ")[1];
	let btnOpponent = interaction.customId.split(" ")[2];
	let btnMatchID = interaction.customId.split(" ")[3];

	console.log(btnType);

	// if match accepted
	if (interaction.customId.split(" ")[0] == 'matchAccept') {
		console.log("accepted");

		for (let i = 0; i < activeMatches.length; i++) {

			if (activeMatches[i]['matchID'] == btnMatchID) {
				activeMatches[0]['accepted'] = true;
				

				console.log(interaction.component)
				interaction.component.setDisabled(true);

				interaction.component

				console.log(activeMatches[0]['accepted']);





				break;
			}
		}

	}


});