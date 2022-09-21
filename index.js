require('dotenv').config();

// imports
const { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { token } = require('./config.json');
const sqlite3 = require('sqlite3').verbose();

// intents
const client = new Client({intents: [""]});

// intents and what they're for 
// n/a 

// bot login with token
client.login(token)

// working variables || db.run to execute SQL statements
let db = new sqlite3.Database('./data/SquareUp.sqlite', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the SquareUp database.');
  });

// for tracking users who have used the bot to reduce the amount of DB queries. will run on startup once.
let userIDs = [];

db.all(`SELECT id FROM users`,(err, rows) => {
	if (err) {
	  throw err;
	}
	rows.map((row) => {
	userIDs.push(row.id)
	});
  });;


// run once on startup
client.once('ready', () => {
	console.log(`${client.user.username} is ready!`);

	// if tables don't exist then create them
	db.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)`)

});



// bot commands 
// "interaction" is the obj that stores the user's information
    // use interaction.user.id for DB ids. 

client.on('interactionCreate', async interaction => {
    // skip if not a chat command
	if (!interaction.isChatInputCommand()) return;
    
	const { commandName } = interaction;

	// if user doesn't exist, add it for tracking
	if (!userIDs.includes(interaction.user.id)) {
		db.run(`INSERT INTO users (id,name)
		VALUES (${interaction.user.id}, "${interaction.user.username}");`);
		userIDs.push(interaction.user.id); // add to our list
		console.log(`Added the new user ${interaction.user.id} to userIDs`)
	} 

	// commands
	if (commandName === 'suh') {
		await interaction.reply(`Suh ${interaction.user.username}`);

	} else if (commandName === 'mommy') {

		const file = new AttachmentBuilder('https://i.imgur.com/rBO8BVH.jpg');

		await interaction.reply({files: [file] });
	}

});



