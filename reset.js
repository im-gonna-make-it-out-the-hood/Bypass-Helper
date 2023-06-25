const { Client, Intents } = require('discord.js');

const token = '';
const clientId = '';
const guildId = ''; // Optional: Specify the guild ID if the commands are specific to a guild

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', async () => {
  console.log('Bot is ready!');

  // Fetch the existing commands
  const commands = await client.api.applications(clientId).guilds(guildId).commands.get();

  // Delete each command
  commands.forEach(async (command) => {
    await client.api.applications(clientId).guilds(guildId).commands(command.id).delete();
    console.log(`Deleted command: ${command.name}`);
  });

  console.log('All commands have been removed!');
});


client.login(token);
