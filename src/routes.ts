import type { Snowflake } from './types.js';

/** REST API route builders — all relative to /v1 */
export const Routes = {
  // Channels
  channel: (id: Snowflake) => `/channels/${id}` as const,
  channelMessages: (id: Snowflake) => `/channels/${id}/messages` as const,
  channelMessage: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/messages/${msgId}` as const,
  channelMessageAttachment: (chId: Snowflake, msgId: Snowflake, attId: Snowflake) => `/channels/${chId}/messages/${msgId}/attachments/${attId}` as const,
  channelMessageReactions: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/messages/${msgId}/reactions` as const,
  channelMessageReaction: (chId: Snowflake, msgId: Snowflake, emoji: string) => `/channels/${chId}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}` as const,
  channelPins: (id: Snowflake) => `/channels/${id}/messages/pins` as const,
  channelPin: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/pins/${msgId}` as const,
  channelBulkDelete: (id: Snowflake) => `/channels/${id}/messages/bulk-delete` as const,
  channelWebhooks: (id: Snowflake) => `/channels/${id}/webhooks` as const,
  channelTyping: (id: Snowflake) => `/channels/${id}/typing` as const,
  channelInvites: (id: Snowflake) => `/channels/${id}/invites` as const,
  channelPermission: (chId: Snowflake, ovId: Snowflake) => `/channels/${chId}/permissions/${ovId}` as const,

  // Guilds
  guilds: () => '/guilds' as const,
  guild: (id: Snowflake) => `/guilds/${id}` as const,
  guildChannels: (id: Snowflake) => `/guilds/${id}/channels` as const,
  guildMembers: (id: Snowflake) => `/guilds/${id}/members` as const,
  guildMember: (gId: Snowflake, uId: Snowflake) => `/guilds/${gId}/members/${uId}` as const,
  guildMemberRole: (gId: Snowflake, uId: Snowflake, rId: Snowflake) => `/guilds/${gId}/members/${uId}/roles/${rId}` as const,
  guildRoles: (id: Snowflake) => `/guilds/${id}/roles` as const,
  guildRole: (gId: Snowflake, rId: Snowflake) => `/guilds/${gId}/roles/${rId}` as const,
  guildBans: (id: Snowflake) => `/guilds/${id}/bans` as const,
  guildBan: (gId: Snowflake, uId: Snowflake) => `/guilds/${gId}/bans/${uId}` as const,
  guildInvites: (id: Snowflake) => `/guilds/${id}/invites` as const,
  guildAuditLogs: (id: Snowflake) => `/guilds/${id}/audit-logs` as const,
  guildEmojis: (id: Snowflake) => `/guilds/${id}/emojis` as const,
  guildEmoji: (gId: Snowflake, eId: Snowflake) => `/guilds/${gId}/emojis/${eId}` as const,
  guildStickers: (id: Snowflake) => `/guilds/${id}/stickers` as const,
  guildSticker: (gId: Snowflake, sId: Snowflake) => `/guilds/${gId}/stickers/${sId}` as const,
  guildWebhooks: (id: Snowflake) => `/guilds/${id}/webhooks` as const,
  guildVanityUrl: (id: Snowflake) => `/guilds/${id}/vanity-url` as const,

  // Invites
  invite: (code: string) => `/invites/${code}` as const,

  // Webhooks
  webhook: (id: Snowflake) => `/webhooks/${id}` as const,
  webhookExecute: (id: Snowflake, token: string) => `/webhooks/${id}/${token}` as const,
  webhookMessage: (id: Snowflake, token: string, msgId: Snowflake) => `/webhooks/${id}/${token}/messages/${msgId}` as const,

  // Users
  user: (id: Snowflake) => `/users/${id}` as const,
  currentUser: () => '/users/@me' as const,
  currentUserGuilds: () => '/users/@me/guilds' as const,
  leaveGuild: (gId: Snowflake) => `/users/@me/guilds/${gId}` as const,
  userChannels: () => '/users/@me/channels' as const,
  userProfile: (id: Snowflake, guildId?: Snowflake) => `/users/${id}/profile${guildId ? `?guild_id=${guildId}` : ''}`,

  // Applications / Interactions
  applicationCommands: (appId: Snowflake) => `/applications/${appId}/commands` as const,
  applicationCommand: (appId: Snowflake, cmdId: Snowflake) => `/applications/${appId}/commands/${cmdId}` as const,
  interactionCallback: (intId: Snowflake, token: string) => `/interactions/${intId}/${token}/callback` as const,

  // Gateway
  gatewayBot: () => '/gateway/bot' as const,

  // Instance
  instance: () => '/instance' as const,
} as const;
