require('dotenv').config();

// imports
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// intents
const client = new Client({intents: [""]});

// intents and what they're for 
// n/a 


// run once on startup
client.once('ready', () => {
console.log(`${client.user.username} is ready!`);
});

// bot login with token
client.login(token)

// bot commands 
// interaction is the obj that stores the user's information
    // use interaction.user.id for DB ids. 

client.on('interactionCreate', async interaction => {
    // skip if not a chat command
	if (!interaction.isChatInputCommand()) return;
    
	const { commandName } = interaction;
    
	if (commandName === 'suh') {
		await interaction.reply(`Suh ${interaction.user.username}`);
	} 

});




