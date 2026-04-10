# Getting Started with fluxer.ts

Build your first Fluxer bot in under 5 minutes.

## Prerequisites

- Node.js 18+
- A Fluxer bot token ([create one on fluxer.gg](https://fluxer.gg))

## Install

```bash
mkdir my-bot && cd my-bot
npm init -y
npm install fluxer.ts
```

## Your First Bot

Create `bot.mjs`:

```javascript
import { Client, GatewayIntents } from 'fluxer.ts';

const client = new Client({
  intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
});

client.on('ready', (user, guilds) => {
  console.log(`${user.username} is online in ${guilds.length} guilds!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await client.replyTo(message, 'Pong! 🏓');
  }
});

client.login('your-token-here');
```

Run it:

```bash
node bot.mjs
```

That's it. Your bot is online and responding to `!ping`.

## What Just Happened?

1. **`Client`** wraps both the REST API and the WebSocket gateway. One import, one object.
2. **`GatewayIntents`** tells Fluxer what events you care about. Only subscribe to what you need.
3. **`client.on('ready', ...)`** fires when the gateway connection is established and your bot is online.
4. **`client.on('messageCreate', ...)`** fires for every new message in channels your bot can see.
5. **`client.replyTo(message, ...)`** sends a reply that shows up as a reply in the Fluxer client. It also returns the sent `Message` object.

## Core Concepts

### Sending Messages

```javascript
// Simple text
await client.sendMessage(channelId, 'Hello!');

// With embeds
await client.sendMessage(channelId, {
  content: 'Check this out:',
  embeds: [{
    type: 'rich',
    title: 'My Embed',
    description: 'Embeds are just plain objects — no builder needed.',
    color: 0x7c6fff,
  }],
});

// Reply to a message
await client.replyTo(message, 'Got it!');
```

### Intents

Intents are a bitmask. Combine them with `|`:

```javascript
const intents =
  GatewayIntents.Guilds |          // Guild create/update/delete events
  GatewayIntents.GuildMessages |   // Message events in guilds
  GatewayIntents.MessageContent;   // Actual message text (privileged)
```

Use `IntentsAll` if you want everything (not recommended for production).

### Events

fluxer.ts emits typed events. The most common:

| Event | Fires when... |
|-------|---------------|
| `ready` | Bot is connected and ready |
| `messageCreate` | A new message is sent |
| `messageUpdate` | A message is edited |
| `messageDelete` | A message is deleted |
| `guildMemberAdd` | Someone joins a guild |
| `guildMemberRemove` | Someone leaves a guild |
| `messageReactionAdd` | A reaction is added |
| `messageReactionRemove` | A reaction is removed |
| `error` | Something went wrong |
| `raw` | Any unhandled gateway event |

### Permissions (v0.3.0+)

```javascript
import { Permissions, hasPermission, combinePermissions } from 'fluxer.ts';

// Check if a member can manage messages
if (hasPermission(member.permissions, Permissions.ManageMessages)) {
  // they can!
}

// Administrator bypasses all permission checks automatically
hasPermission(adminPerms, Permissions.SendMessages); // always true

// Combine permissions into a bitfield
const modPerms = combinePermissions(
  Permissions.KickMembers,
  Permissions.BanMembers,
  Permissions.ManageMessages,
);
```

### Error Handling

```javascript
client.on('error', (err) => {
  console.error('Bot error:', err.message);
});

// The gateway automatically reconnects on disconnect.
// You don't need to handle reconnection yourself.
```

## Next Steps

- Browse the [examples](../examples/) for real bot patterns
- Read the [permissions guide](./permissions.md) for moderation bots
- Check the [README](../README.md) for the full API surface
- See the [API reference](../reference/api-reference.md) for all 299 endpoints
