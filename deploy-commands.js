const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json')



// add /command here then configure the command in index.js.
const commands = [
    new SlashCommandBuilder().setName('suh').setDescription('suhdude'),
	new SlashCommandBuilder().setName('mommy').setDescription('??????????????'),



]
.map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);


rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);







