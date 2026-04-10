/**
 * Moderation Bot — kick, ban, timeout, purge, and lock commands.
 *
 * Shows how to use the Permissions enum, member management,
 * bulk delete, and channel permission overwrites.
 *
 * Usage:
 *   FLUXER_TOKEN=your-token node moderation-bot.mjs
 */

import { Client, GatewayIntents, Permissions, hasPermission } from 'fluxer.ts';

const client = new Client({
  intents:
    GatewayIntents.Guilds |
    GatewayIntents.GuildMessages |
    GatewayIntents.MessageContent |
    GatewayIntents.GuildMembers,
});

// ─── Helpers ───────────────────────────────────────────────────

/** Find a mentioned user ID in message content. */
function findMention(content) {
  const match = content.match(/<@!?(\d+)>/);
  return match ? match[1] : null;
}

/** Check if the message author has the required permission. */
function requirePermission(member, perm) {
  if (!member?.permissions) return false;
  return hasPermission(member.permissions, perm);
}

// ─── Commands ──────────────────────────────────────────────────

client.on('ready', (user, guilds) => {
  console.log(`Moderation bot ready — ${user.username} in ${guilds.length} guilds`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild_id) return;

  const args = message.content.split(/\s+/);
  const command = args[0]?.toLowerCase();

  // ── !kick @user ──────────────────────────────────────────────

  if (command === '!kick') {
    if (!requirePermission(message.member, Permissions.KickMembers)) {
      return client.replyTo(message, '❌ You need the Kick Members permission.');
    }

    const targetId = findMention(message.content);
    if (!targetId) return client.replyTo(message, 'Usage: `!kick @user`');

    await client.kickMember(message.guild_id, targetId);
    await client.replyTo(message, `✅ Kicked <@${targetId}>.`);
  }

  // ── !ban @user [duration_seconds] ────────────────────────────

  if (command === '!ban') {
    if (!requirePermission(message.member, Permissions.BanMembers)) {
      return client.replyTo(message, '❌ You need the Ban Members permission.');
    }

    const targetId = findMention(message.content);
    if (!targetId) return client.replyTo(message, 'Usage: `!ban @user [duration_seconds]`');

    const duration = parseInt(args[2]) || undefined;
    await client.banMember(message.guild_id, targetId, {
      reason: 'Banned via moderation bot',
      ban_duration_seconds: duration,
    });
    const durationText = duration ? ` for ${duration}s` : '';
    await client.replyTo(message, `✅ Banned <@${targetId}>${durationText}.`);
  }

  // ── !timeout @user <minutes> ─────────────────────────────────

  if (command === '!timeout') {
    if (!requirePermission(message.member, Permissions.ModerateMembers)) {
      return client.replyTo(message, '❌ You need the Moderate Members permission.');
    }

    const targetId = findMention(message.content);
    const minutes = parseInt(args[2]);
    if (!targetId || !minutes) return client.replyTo(message, 'Usage: `!timeout @user <minutes>`');

    const until = new Date(Date.now() + minutes * 60_000).toISOString();
    await client.editMember(message.guild_id, targetId, { communication_disabled_until: until });
    await client.replyTo(message, `✅ Timed out <@${targetId}> for ${minutes} minute(s).`);
  }

  // ── !purge <count> ───────────────────────────────────────────

  if (command === '!purge') {
    if (!requirePermission(message.member, Permissions.ManageMessages)) {
      return client.replyTo(message, '❌ You need the Manage Messages permission.');
    }

    const count = Math.min(parseInt(args[1]) || 10, 100);
    const messages = await client.fetchMessages(message.channel_id, { limit: count });
    const ids = messages.map(m => m.id);

    // bulkDelete handles 0, 1, or 2-100 messages gracefully
    await client.bulkDelete(message.channel_id, ids);
    const notice = await client.sendMessage(message.channel_id, `✅ Purged ${ids.length} message(s).`);

    // Auto-delete the confirmation after 3 seconds
    setTimeout(() => client.deleteMessage(message.channel_id, notice.id).catch(() => {}), 3000);
  }

  // ── !lock / !unlock ──────────────────────────────────────────

  if (command === '!lock' || command === '!unlock') {
    if (!requirePermission(message.member, Permissions.ManageChannels)) {
      return client.replyTo(message, '❌ You need the Manage Channels permission.');
    }

    const guild = await client.fetchGuild(message.guild_id);
    const everyoneRoleId = guild.id; // @everyone role ID = guild ID

    if (command === '!lock') {
      await client.editPermission(message.channel_id, everyoneRoleId, {
        type: 0,
        deny: Permissions.SendMessages.toString(),
      });
      await client.replyTo(message, '🔒 Channel locked.');
    } else {
      // Unlock by setting allow instead of deny
      await client.editPermission(message.channel_id, everyoneRoleId, {
        type: 0,
        allow: Permissions.SendMessages.toString(),
        deny: '0',
      });
      await client.replyTo(message, '🔓 Channel unlocked.');
    }
  }
});

client.on('error', (err) => console.error('Error:', err.message));

client.login(process.env.FLUXER_TOKEN);
