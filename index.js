require('dotenv').config();

// imports
const { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { token } = require('./config.json');
// const sqlite3 = require('sqlite3').verbose(); // sqlite3 doesn't support async/await
const sqlite = require('aa-sqlite');


// change to DBconn(wrap try/catch) later
const openDB = async() => {
	try {
		await sqlite.open("./data/SquareUp.sqlite");
		console.log("-- Opened DB connection --")
	} catch (error) {
		console.error("Couldn't open DB connection");
		sqlite.close();
	}
}



const createTablesIfNotExist = async(table) => {

	await openDB();

	try {
		console.log("checking/creating tables")
		await sqlite.run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER, name TEXT)`);
		console.log("Tables exist!")
		return true
	} catch (error) {
		console.log("error at table check/creation")
		console.error(error);
		sqlite.close();
	}
	
	sqlite.close();
};


const addUsersToWorkingArray = async(eventArray) => {

	await openDB();
	
    try {
		console.log("adding users to working array");
		
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
			console.log(`Couldn't add user ${username} to DB`);
		}
	
	sqlite.close();

}


// function imports
// do the thing here


// intents
const client = new Client({intents: [""]});


// bot login with token
client.login(token)


// for tracking users who have used the bot to reduce the amount of DB queries. will run on startup once.
// probably not a good idea but oh well. we'll see how it goes when I add 300 dummy users
let userIDs = [];



// run once on startup
client.once('ready', async () => {
	
	console.log(`--- ${client.user.username} is starting up! ---`);

	try {
		// if tables don't exist then create them
		console.log("Creating/Checking DB tables")
		await createTablesIfNotExist(`users`);


		// populate array with users table from DB
		console.log("-- Populating working array with DB users --");
		await addUsersToWorkingArray(userIDs);
		console.log("array has been populated!");
		

		// all success!
		console.log(`----- ${client.user.username} is ready! -----`);
	} catch(e){
		console.log("borked in setup somewhere... :(")
	}


});



// bot commands 
// "interaction" is the obj that stores the user's information
// use interaction.user.id for DB ids. 

client.on('interactionCreate', async interaction => {
	// skip if not a chat command

	if (!interaction.isChatInputCommand()) return;
    
	const { commandName } = interaction;

	// if user doesn't exist, add it for tracking
	if (!userIDs.includes(parseInt(interaction.user.id))) {
		await addUserToDB(interaction.user.id, interaction.user.username);
		console.log(`Added the new user ${interaction.user.username} to userIDs`);
	} 

	// commands
	// is there a better way to add many IDs and match them?
	if (commandName === 'suh') {
		await interaction.reply(`Suh ${interaction.user.username}`);

	} else if (commandName === 'mommy') {

		const file = new AttachmentBuilder('https://i.imgur.com/rBO8BVH.jpg');

		await interaction.reply({files: [file] });
	}

});



