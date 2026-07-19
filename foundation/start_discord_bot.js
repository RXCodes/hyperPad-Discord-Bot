// starts the discord bot
let discord_token = process.env.DISCORD_TOKEN;
if (!discord_token) {
    throw new Error('Discord token is not provided as an environment variable!');
}

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.login(discord_token).then(r => {
    console.log("Discord bot logged in: " + r);
});