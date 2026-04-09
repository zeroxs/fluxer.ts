# fluxer.ts

Lightweight, TypeScript-first SDK for building [Fluxer](https://fluxer.gg) bots.

- **Small** — single package, one dependency (`ws`), ~22KB compiled
- **TypeScript-first** — full type definitions, no `any`
- **Simple API** — connect, listen, send — no unnecessary abstractions
- **Built for Fluxer** — handles Fluxer-specific gateway behavior (guild `properties`, v1 gateway protocol)

## Install

```bash
npm install fluxer.ts
```

## Quick Start

```typescript
import { Client, GatewayIntents } from 'fluxer.ts';

const client = new Client({
  intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
});

client.on('ready', (user, guilds) => {
  console.log(`Connected as ${user.username} in ${guilds.length} guilds`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await client.sendMessage(message.channel_id, 'Pong!');
  }
});

client.login('your-bot-token');
```

## Features

### Messages

```typescript
// Send a message
await client.sendMessage(channelId, 'Hello!');

// Send with embeds
await client.sendMessage(channelId, {
  content: 'Check this out',
  embeds: [{ title: 'My Embed', description: 'Content here', color: 0x7c6fff }],
});

// Reply to a message
await client.replyTo(message, 'Got it!');

// Edit a message
await client.editMessage(channelId, messageId, 'Updated content');

// Delete a message
await client.deleteMessage(channelId, messageId);

// React
await client.react(channelId, messageId, '👍');

// Typing indicator
await client.sendTyping(channelId);
```

### Guilds

```typescript
// Access cached guilds (populated on connect)
for (const [id, guild] of client.guilds) {
  console.log(guild.name);
}

// Fetch members
const members = await client.fetchMembers(guildId);

// Fetch roles
const roles = await client.fetchRoles(guildId);

// Set bot nickname
await client.setNickname(guildId, 'Cool Bot');
```

### Events

```typescript
client.on('ready', (user, guilds) => { });
client.on('messageCreate', (message) => { });
client.on('messageUpdate', (message) => { });
client.on('messageDelete', ({ id, channel_id }) => { });
// client.on('interactionCreate') — not yet supported by Fluxer
client.on('guildCreate', (guild) => { });
client.on('guildDelete', ({ id }) => { });
client.on('guildMemberAdd', (member) => { });
client.on('guildMemberRemove', ({ guild_id, user }) => { });
client.on('channelCreate', (channel) => { });
client.on('channelUpdate', (channel) => { });
client.on('channelDelete', (channel) => { });
client.on('messageReactionAdd', (data) => { });
client.on('messageReactionRemove', (data) => { });
client.on('typingStart', (data) => { });
client.on('error', (error) => { });
client.on('debug', (message) => { });
```

### REST API (Direct)

```typescript
import { REST, Routes } from 'fluxer.ts';

const rest = new REST({ token: 'your-token' });

// Any endpoint
const user = await rest.get(Routes.currentUser());
const channels = await rest.get(Routes.guildChannels(guildId));
```

### Gateway Intents

```typescript
import { GatewayIntents, IntentsAll } from 'fluxer.ts';

// Specific intents
const intents = GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent;

// All intents
const client = new Client({ intents: IntentsAll });
```

## How it differs from @fluxerjs/core

| | fluxer.ts | @fluxerjs/core |
|---|---|---|
| Size | ~22KB | ~809KB |
| Packages | 1 | 7 (monorepo) |
| Dependencies | 1 (ws) | 6 |
| TypeScript | Source + declarations | Declarations only |
| Fluxer-specific | Yes (properties, v1 gateway) | Discord.js port |

## License

MIT
