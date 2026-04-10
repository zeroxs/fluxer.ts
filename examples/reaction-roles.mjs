/**
 * Reaction Roles — assign roles when users react to a message.
 *
 * Setup:
 *   1. Post a message in your roles channel
 *   2. Set ROLES_MESSAGE_ID to that message's ID
 *   3. Configure the REACTION_ROLES map below
 *   4. Run the bot — users react to get roles, unreact to lose them
 *
 * Usage:
 *   FLUXER_TOKEN=your-token node reaction-roles.mjs
 */

import { Client, GatewayIntents } from 'fluxer.ts';

const client = new Client({
  intents:
    GatewayIntents.Guilds |
    GatewayIntents.GuildMessages |
    GatewayIntents.GuildMessageReactions |
    GatewayIntents.GuildMembers,
});

// ─── Configuration ─────────────────────────────────────────────

// The message users react to for roles
const ROLES_MESSAGE_ID = process.env.ROLES_MESSAGE_ID || 'YOUR_MESSAGE_ID_HERE';

// Map emoji → role ID
const REACTION_ROLES = {
  '🎮': 'GAMER_ROLE_ID',
  '🎨': 'ARTIST_ROLE_ID',
  '🎵': 'MUSIC_ROLE_ID',
  '📢': 'ANNOUNCEMENTS_ROLE_ID',
};

// ─── Events ────────────────────────────────────────────────────

client.on('ready', (user, guilds) => {
  console.log(`Reaction roles bot ready — ${user.username}`);
  console.log(`Watching message: ${ROLES_MESSAGE_ID}`);
  console.log(`Configured roles: ${Object.keys(REACTION_ROLES).join(' ')}`);
});

client.on('messageReactionAdd', async ({ guild_id, channel_id, message_id, user_id, emoji }) => {
  if (message_id !== ROLES_MESSAGE_ID) return;

  const emojiKey = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
  const roleId = REACTION_ROLES[emojiKey];
  if (!roleId) return;

  try {
    await client.addRole(guild_id, user_id, roleId);
    console.log(`+ Gave role ${roleId} to ${user_id} (reacted ${emojiKey})`);
  } catch (err) {
    console.error(`Failed to add role: ${err.message}`);
  }
});

client.on('messageReactionRemove', async ({ guild_id, channel_id, message_id, user_id, emoji }) => {
  if (message_id !== ROLES_MESSAGE_ID) return;

  const emojiKey = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
  const roleId = REACTION_ROLES[emojiKey];
  if (!roleId) return;

  try {
    await client.removeRole(guild_id, user_id, roleId);
    console.log(`- Removed role ${roleId} from ${user_id} (unreacted ${emojiKey})`);
  } catch (err) {
    console.error(`Failed to remove role: ${err.message}`);
  }
});

client.on('error', (err) => console.error('Error:', err.message));

client.login(process.env.FLUXER_TOKEN);
