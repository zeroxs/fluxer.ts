# fluxer.ts

Lightweight, TypeScript-first SDK for building [Fluxer](https://fluxer.gg) bots.

- **Small** — single package, one dependency (`ws`), ~60KB compiled
- **TypeScript-first** — 870+ lines of type definitions generated from the Fluxer OpenAPI spec
- **Simple API** — connect, listen, send — no unnecessary abstractions
- **Built for Fluxer** — handles Fluxer-specific gateway behavior (guild `properties`, v1 gateway protocol)
- **Complete** — 94 route builders, 40+ gateway events, 66 convenience methods, 35 permission constants

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
  embeds: [{ type: 'rich', title: 'My Embed', description: 'Content here', color: 0x7c6fff }],
});

// Reply to a message
await client.replyTo(message, 'Got it!');

// Edit / delete
await client.editMessage(channelId, messageId, 'Updated content');
await client.deleteMessage(channelId, messageId);

// Bulk delete (2-100 messages)
await client.bulkDelete(channelId, messageIds);

// Fetch messages
const messages = await client.fetchMessages(channelId, { limit: 50 });
const single = await client.fetchMessage(channelId, messageId);

// Typing indicator
await client.sendTyping(channelId);
```

### Reactions

```typescript
// Add / remove reactions
await client.react(channelId, messageId, '👍');
await client.unreact(channelId, messageId, '👍');

// Remove another user's reaction
await client.removeReaction(channelId, messageId, '👍', userId);

// Remove all reactions
await client.removeAllReactions(channelId, messageId);
await client.removeAllReactionsForEmoji(channelId, messageId, '👍');

// Fetch who reacted
const users = await client.fetchReactions(channelId, messageId, '👍');
```

### Pins

```typescript
await client.pinMessage(channelId, messageId);
await client.unpinMessage(channelId, messageId);
const pins = await client.fetchPinnedMessages(channelId);
```

### Guilds

```typescript
// Fetch guild info
const guild = await client.fetchGuild(guildId);

// Edit guild
await client.editGuild(guildId, { name: 'New Name' });

// Access cached guilds
for (const [id, guild] of client.guilds) {
  console.log(guild.name);
}

// Audit log
const log = await client.fetchAuditLog(guildId, { limit: 50 });

// Vanity URL
const vanity = await client.fetchVanityUrl(guildId);
```

### Members

```typescript
// Fetch members
const members = await client.fetchMembers(guildId, { limit: 100 });
const member = await client.fetchMember(guildId, userId);

// Edit member
await client.editMember(guildId, userId, { nick: 'Cool Name' });

// Kick
await client.kickMember(guildId, userId);

// Set bot nickname
await client.setNickname(guildId, 'Bot Name');
```

### Roles

```typescript
const roles = await client.fetchRoles(guildId);

// Create / edit / delete
const role = await client.createRole(guildId, { name: 'Moderator', color: 0x3498db });
await client.editRole(guildId, roleId, { name: 'Admin' });
await client.deleteRole(guildId, roleId);

// Add / remove from member
await client.addRole(guildId, userId, roleId);
await client.removeRole(guildId, userId, roleId);
```

### Bans

```typescript
await client.banMember(guildId, userId, { reason: 'Rule violation' });
await client.unbanMember(guildId, userId);
const bans = await client.fetchBans(guildId);
```

### Channels

```typescript
const channel = await client.fetchChannel(channelId);
const guildChannels = await client.fetchGuildChannels(guildId);

// Create / edit / delete
const ch = await client.createChannel(guildId, { name: 'general', type: 0 });
await client.editChannel(channelId, { topic: 'Updated topic' });
await client.deleteChannel(channelId);

// Permission overwrites
await client.editPermission(channelId, roleId, { type: 0, allow: '1024', deny: '0' });
await client.deletePermission(channelId, roleId);
```

### Emojis & Stickers

```typescript
const emojis = await client.fetchEmojis(guildId);
const emoji = await client.createEmoji(guildId, { name: 'cool', image: 'data:image/png;base64,...' });
await client.editEmoji(guildId, emojiId, { name: 'cooler' });
await client.deleteEmoji(guildId, emojiId);

const stickers = await client.fetchStickers(guildId);
const sticker = await client.createSticker(guildId, {
  name: 'cool', description: 'A cool sticker', tags: 'cool',
  file: { name: 'sticker.png', data: stickerBuffer },
});
await client.editSticker(guildId, stickerId, { name: 'cooler' });
await client.deleteSticker(guildId, stickerId);
```

### Invites

```typescript
const invite = await client.createInvite(channelId, { max_age: 86400 });
const channelInvites = await client.fetchChannelInvites(channelId);
const guildInvites = await client.fetchGuildInvites(guildId);
const info = await client.fetchInvite('abc123');
await client.deleteInvite('abc123');
```

### Webhooks

```typescript
const webhook = await client.createWebhook(channelId, { name: 'My Webhook' });
await client.editWebhook(webhookId, { name: 'Updated' });
await client.executeWebhook(webhookId, token, 'Hello from webhook!');
await client.deleteWebhook(webhookId);

const channelHooks = await client.fetchChannelWebhooks(channelId);
const guildHooks = await client.fetchGuildWebhooks(guildId);
```

### Users

```typescript
const user = await client.fetchUser(userId);
const dm = await client.createDM(userId);
await client.sendMessage(dm.id, 'Hello!');
```

### Lifecycle

```typescript
// Connect
await client.login('your-bot-token');

// Leave a guild
await client.leaveGuild(guildId);

// Disconnect
client.destroy();
```

### Events

```typescript
// Session
client.on('ready', (user, guilds) => { });

// Messages
client.on('messageCreate', (message) => { });
client.on('messageUpdate', (message) => { });
client.on('messageDelete', ({ id, channel_id }) => { });
client.on('messageDeleteBulk', ({ ids, channel_id }) => { });

// Reactions
client.on('messageReactionAdd', (data) => { });
client.on('messageReactionRemove', (data) => { });
client.on('messageReactionRemoveAll', (data) => { });
client.on('messageReactionRemoveEmoji', (data) => { });

// Guilds
client.on('guildCreate', (guild) => { });
client.on('guildUpdate', (guild) => { });
client.on('guildDelete', ({ id }) => { });

// Members
client.on('guildMemberAdd', (member) => { });
client.on('guildMemberUpdate', (member) => { });
client.on('guildMemberRemove', ({ guild_id, user }) => { });

// Roles
client.on('guildRoleCreate', ({ guild_id, role }) => { });
client.on('guildRoleUpdate', ({ guild_id, role }) => { });
client.on('guildRoleDelete', ({ guild_id, role_id }) => { });
client.on('guildRoleUpdateBulk', ({ guild_id, roles }) => { });

// Bans
client.on('guildBanAdd', ({ guild_id, user }) => { });
client.on('guildBanRemove', ({ guild_id, user }) => { });

// Emojis & Stickers
client.on('guildEmojisUpdate', ({ guild_id, emojis }) => { });
client.on('guildStickersUpdate', ({ guild_id, stickers }) => { });

// Channels
client.on('channelCreate', (channel) => { });
client.on('channelUpdate', (channel) => { });
client.on('channelUpdateBulk', (channels) => { });
client.on('channelDelete', (channel) => { });
client.on('channelPinsUpdate', (data) => { });

// Invites
client.on('inviteCreate', ({ code, channel_id }) => { });
client.on('inviteDelete', ({ code, channel_id }) => { });

// Webhooks
client.on('webhooksUpdate', ({ guild_id, channel_id }) => { });

// Voice
client.on('voiceStateUpdate', (state) => { });
client.on('voiceServerUpdate', (data) => { });

// Typing & Presence
client.on('typingStart', (data) => { });
client.on('presenceUpdate', (data) => { });
client.on('userUpdate', (user) => { });

// System
client.on('error', (error) => { });
client.on('debug', (message) => { });

// Raw — any unhandled gateway event
client.on('raw', (event, data) => { });
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

## Type Generation

Types are auto-generated from the Fluxer OpenAPI spec:

```bash
node tools/generate-types.mjs > src/types.generated.ts
```

The generator reads `reference/openapi.json` and outputs TypeScript interfaces and enums for all bot-relevant API objects. Modify `tools/generate-types.mjs` to add schemas or change mappings.

## Permissions (v0.3.0+)

```typescript
import { Permissions, hasPermission, combinePermissions } from 'fluxer.ts';

// Check permissions — no more hardcoding bit values
if (hasPermission(member.permissions, Permissions.ManageMessages)) {
  // can delete and pin messages
}

// Administrator bypasses everything automatically
hasPermission(adminPerms, Permissions.SendMessages); // always true

// Combine for role creation
const modPerms = combinePermissions(
  Permissions.KickMembers,
  Permissions.BanMembers,
  Permissions.ManageMessages,
);
await client.createRole(guildId, { name: 'Mod', permissions: modPerms.toString() });
```

All 35 Fluxer permission values included. See the [permissions guide](docs/permissions.md) for the full reference.

## Examples

Ready-to-run bot examples in [`examples/`](examples/):

- **[basic-bot.mjs](examples/basic-bot.mjs)** — Simplest possible bot. Responds to `!ping`. Start here.
- **[moderation-bot.mjs](examples/moderation-bot.mjs)** — Kick, ban, timeout, purge, lock/unlock with permission checks.
- **[reaction-roles.mjs](examples/reaction-roles.mjs)** — Assign roles when users react to a message.

## Documentation

- **[Getting Started](docs/getting-started.md)** — Zero to working bot in 5 minutes.
- **[Permissions Guide](docs/permissions.md)** — Complete guide to the Permissions API.

## How it differs from @fluxerjs/core

| | fluxer.ts | @fluxerjs/core |
|---|---|---|
| Size | ~60KB | ~809KB |
| Packages | 1 | 7 (monorepo) |
| Dependencies | 1 (ws) | 6 |
| TypeScript | Source + declarations | Declarations only |
| Fluxer-specific | Yes (properties, v1 gateway) | Discord.js port |
| API types | Generated from OpenAPI spec | Manual |
| Events | 40+ | Unknown |
| Client methods | 65 | Unknown |

## License

MIT
