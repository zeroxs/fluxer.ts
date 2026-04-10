/**
 * Basic Bot — the simplest possible fluxer.ts bot.
 *
 * Responds to !ping and !hello. That's it.
 * Start here if you've never built a Fluxer bot before.
 *
 * Usage:
 *   FLUXER_TOKEN=your-token node basic-bot.mjs
 */

import { Client, GatewayIntents } from 'fluxer.ts';

const client = new Client({
  intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
});

client.on('ready', (user, guilds) => {
  console.log(`Logged in as ${user.username} in ${guilds.length} guilds`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await client.replyTo(message, 'Pong! 🏓');
  }

  if (message.content === '!hello') {
    await client.sendMessage(message.channel_id, `Hey ${message.author.username}! 👋`);
  }
});

client.login(process.env.FLUXER_TOKEN);
