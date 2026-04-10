# Permissions Guide

fluxer.ts v0.3.0 includes a complete `Permissions` enum with all Fluxer permission bitfield values, plus helpers for checking and combining them.

## The Problem

Fluxer stores permissions as string-encoded 64-bit integers. Without constants, you end up writing code like this:

```javascript
// Don't do this
await client.editPermission(channelId, roleId, { type: 0, deny: '2048' });
// What is 2048? Who knows? Good luck debugging this in 3 months.
```

## The Solution

```javascript
import { Permissions, hasPermission, combinePermissions } from 'fluxer.ts';

await client.editPermission(channelId, roleId, {
  type: 0,
  deny: Permissions.SendMessages.toString(),
});
// Clear, readable, correct.
```

## Available Permissions

| Permission | Value | Description |
|-----------|-------|-------------|
| `CreateInstantInvite` | `0x1` | Create instant invites |
| `KickMembers` | `0x2` | Kick members |
| `BanMembers` | `0x4` | Ban members |
| `Administrator` | `0x8` | Full access, bypasses all checks |
| `ManageChannels` | `0x10` | Edit and manage channels |
| `ManageGuild` | `0x20` | Edit guild settings |
| `AddReactions` | `0x40` | Add reactions to messages |
| `ViewAuditLog` | `0x80` | View the audit log |
| `PrioritySpeaker` | `0x100` | Priority speaker in voice |
| `Stream` | `0x200` | Go live |
| `ViewChannel` | `0x400` | View a channel |
| `SendMessages` | `0x800` | Send messages |
| `SendTTSMessages` | `0x1000` | Send TTS messages |
| `ManageMessages` | `0x2000` | Delete and pin messages |
| `EmbedLinks` | `0x4000` | Auto-embed links |
| `AttachFiles` | `0x8000` | Upload files |
| `ReadMessageHistory` | `0x10000` | Read message history |
| `MentionEveryone` | `0x20000` | Use @everyone and @here |
| `UseExternalEmojis` | `0x40000` | Use emojis from other guilds |
| `Connect` | `0x100000` | Connect to voice |
| `Speak` | `0x200000` | Speak in voice |
| `MuteMembers` | `0x400000` | Mute members in voice |
| `DeafenMembers` | `0x800000` | Deafen members in voice |
| `MoveMembers` | `0x1000000` | Move members between voice channels |
| `UseVAD` | `0x2000000` | Use voice activity detection |
| `ChangeNickname` | `0x4000000` | Change own nickname |
| `ManageNicknames` | `0x8000000` | Change other members' nicknames |
| `ManageRoles` | `0x10000000` | Manage roles |
| `ManageWebhooks` | `0x20000000` | Manage webhooks |
| `ManageExpressions` | `0x40000000` | Manage guild expressions |
| `UseExternalStickers` | `0x2000000000` | Use stickers from other guilds |
| `ModerateMembers` | `0x10000000000` | Timeout users |
| `CreateExpressions` | `0x80000000000` | Create guild expressions |
| `PinMessages` | `0x8000000000000` | Pin messages |
| `BypassSlowmode` | `0x10000000000000` | Bypass slowmode |
| `UpdateRtcRegion` | `0x20000000000000` | Update voice region |

## Checking Permissions

```javascript
import { hasPermission, Permissions } from 'fluxer.ts';

// Check a single permission
if (hasPermission(member.permissions, Permissions.ManageMessages)) {
  // Can delete/pin messages
}

// Administrator bypasses everything automatically
hasPermission(adminRole.permissions, Permissions.KickMembers); // true
```

`hasPermission` accepts both `bigint` and `string` (the format returned by the API).

## Combining Permissions

```javascript
import { combinePermissions, Permissions } from 'fluxer.ts';

const moderator = combinePermissions(
  Permissions.KickMembers,
  Permissions.BanMembers,
  Permissions.ManageMessages,
  Permissions.ModerateMembers,
);

// Use in role creation
await client.createRole(guildId, {
  name: 'Moderator',
  color: 0x3498db,
  permissions: moderator.toString(),
});
```

## Common Patterns

### Lock/Unlock a Channel

```javascript
const everyoneRoleId = guild.id; // @everyone role ID = guild ID

// Lock
await client.editPermission(channelId, everyoneRoleId, {
  type: 0,
  deny: Permissions.SendMessages.toString(),
});

// Unlock
await client.editPermission(channelId, everyoneRoleId, {
  type: 0,
  allow: Permissions.SendMessages.toString(),
  deny: '0',
});
```

### Permission Gate a Command

```javascript
client.on('messageCreate', async (message) => {
  if (message.content === '!purge') {
    if (!hasPermission(message.member?.permissions, Permissions.ManageMessages)) {
      return client.replyTo(message, '❌ You need Manage Messages permission.');
    }
    // ... do the purge
  }
});
```

### Timeout a Member

```javascript
// Timeout for 10 minutes
const until = new Date(Date.now() + 10 * 60_000).toISOString();
await client.editMember(guildId, userId, {
  communication_disabled_until: until,
});

// Remove timeout
await client.editMember(guildId, userId, {
  communication_disabled_until: null,
});
```

## Notes

- Permission values are `bigint` because some exceed 32-bit range.
- When passing to the API (role creation, permission overwrites), convert with `.toString()`.
- The API returns permissions as strings — `hasPermission` handles both formats.
