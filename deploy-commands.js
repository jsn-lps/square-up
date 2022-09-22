const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json')



// add /command here then configure the command in index.js.
const commands = [
    new SlashCommandBuilder().setName('suh').setDescription('suhdude'),
	
	new SlashCommandBuilder().setName('mommy').setDescription('??????????????'),


	// box command for initiating a match
	new SlashCommandBuilder().setName('box').setDescription('Challenge someone to a match')
	.addMentionableOption(option => option.setName('opponent')
	.setDescription('Type the name of the person you want to challenge')
	.setRequired(true))
	.addStringOption(option =>
		option.setName('games')
			.setDescription('Which game')
			.setRequired(true)
			.addChoices(
				{ name: 'Smash', value: 'ultimate' },
				{ name: 'Dragon Ball FighterZ', value: 'dbfz' },
			))




,]
.map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);


rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);







