import type { Snowflake } from './types.js';

/** REST API route builders — all relative to /v1 */
export const Routes = {

  // ─── Instance & Gateway ────────────────────────────────────────

  instance: () => '/.well-known/fluxer' as const,
  gatewayBot: () => '/gateway/bot' as const,

  // ─── Channels ──────────────────────────────────────────────────

  channel: (id: Snowflake) => `/channels/${id}` as const,

  // Messages
  channelMessages: (id: Snowflake) => `/channels/${id}/messages` as const,
  channelMessage: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/messages/${msgId}` as const,
  channelMessageAck: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/messages/${msgId}/ack` as const,
  channelBulkDelete: (id: Snowflake) => `/channels/${id}/messages/bulk-delete` as const,
  channelScheduleMessage: (id: Snowflake) => `/channels/${id}/messages/schedule` as const,

  // Attachments
  channelMessageAttachment: (chId: Snowflake, msgId: Snowflake, attId: Snowflake) =>
    `/channels/${chId}/messages/${msgId}/attachments/${attId}` as const,

  // Reactions
  channelMessageReactions: (chId: Snowflake, msgId: Snowflake) =>
    `/channels/${chId}/messages/${msgId}/reactions` as const,
  channelMessageReaction: (chId: Snowflake, msgId: Snowflake, emoji: string) =>
    `/channels/${chId}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}` as const,
  channelMessageReactionMe: (chId: Snowflake, msgId: Snowflake, emoji: string) =>
    `/channels/${chId}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}/@me` as const,
  channelMessageReactionUser: (chId: Snowflake, msgId: Snowflake, emoji: string, userId: Snowflake) =>
    `/channels/${chId}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}/${userId}` as const,

  // Pins
  channelPins: (id: Snowflake) => `/channels/${id}/messages/pins` as const,
  channelPinsAck: (id: Snowflake) => `/channels/${id}/pins/ack` as const,
  channelPin: (chId: Snowflake, msgId: Snowflake) => `/channels/${chId}/pins/${msgId}` as const,

  // Permissions
  channelPermission: (chId: Snowflake, ovId: Snowflake) => `/channels/${chId}/permissions/${ovId}` as const,

  // Group DM recipients
  channelRecipient: (chId: Snowflake, userId: Snowflake) => `/channels/${chId}/recipients/${userId}` as const,

  // Typing
  channelTyping: (id: Snowflake) => `/channels/${id}/typing` as const,

  // Voice
  channelRtcRegions: (id: Snowflake) => `/channels/${id}/rtc-regions` as const,

  // Calls
  channelCall: (id: Snowflake) => `/channels/${id}/call` as const,
  channelCallEnd: (id: Snowflake) => `/channels/${id}/call/end` as const,
  channelCallRing: (id: Snowflake) => `/channels/${id}/call/ring` as const,
  channelCallStopRinging: (id: Snowflake) => `/channels/${id}/call/stop-ringing` as const,

  // Invites (channel-scoped)
  channelInvites: (id: Snowflake) => `/channels/${id}/invites` as const,

  // Webhooks (channel-scoped)
  channelWebhooks: (id: Snowflake) => `/channels/${id}/webhooks` as const,

  // ─── Guilds ────────────────────────────────────────────────────

  guilds: () => '/guilds' as const,
  guild: (id: Snowflake) => `/guilds/${id}` as const,
  guildDelete: (id: Snowflake) => `/guilds/${id}/delete` as const,

  // Channels
  guildChannels: (id: Snowflake) => `/guilds/${id}/channels` as const,

  // Members
  guildMembers: (id: Snowflake) => `/guilds/${id}/members` as const,
  guildMemberSearch: (id: Snowflake) => `/guilds/${id}/members-search` as const,
  guildMemberMe: (id: Snowflake) => `/guilds/${id}/members/@me` as const,
  guildMember: (gId: Snowflake, uId: Snowflake) => `/guilds/${gId}/members/${uId}` as const,
  guildMemberRole: (gId: Snowflake, uId: Snowflake, rId: Snowflake) =>
    `/guilds/${gId}/members/${uId}/roles/${rId}` as const,

  // Roles
  guildRoles: (id: Snowflake) => `/guilds/${id}/roles` as const,
  guildRole: (gId: Snowflake, rId: Snowflake) => `/guilds/${gId}/roles/${rId}` as const,
  guildRoleHoistPositions: (id: Snowflake) => `/guilds/${id}/roles/hoist-positions` as const,

  // Bans
  guildBans: (id: Snowflake) => `/guilds/${id}/bans` as const,
  guildBan: (gId: Snowflake, uId: Snowflake) => `/guilds/${gId}/bans/${uId}` as const,

  // Emojis
  guildEmojis: (id: Snowflake) => `/guilds/${id}/emojis` as const,
  guildEmojiBulk: (id: Snowflake) => `/guilds/${id}/emojis/bulk` as const,
  guildEmoji: (gId: Snowflake, eId: Snowflake) => `/guilds/${gId}/emojis/${eId}` as const,

  // Stickers
  guildStickers: (id: Snowflake) => `/guilds/${id}/stickers` as const,
  guildStickerBulk: (id: Snowflake) => `/guilds/${id}/stickers/bulk` as const,
  guildSticker: (gId: Snowflake, sId: Snowflake) => `/guilds/${gId}/stickers/${sId}` as const,

  // Audit logs
  guildAuditLogs: (id: Snowflake) => `/guilds/${id}/audit-logs` as const,

  // Invites & webhooks (guild-scoped)
  guildInvites: (id: Snowflake) => `/guilds/${id}/invites` as const,
  guildWebhooks: (id: Snowflake) => `/guilds/${id}/webhooks` as const,

  // Vanity URL
  guildVanityUrl: (id: Snowflake) => `/guilds/${id}/vanity-url` as const,

  // Guild settings
  guildDetachedBanner: (id: Snowflake) => `/guilds/${id}/detached-banner` as const,
  guildTextChannelFlexibleNames: (id: Snowflake) => `/guilds/${id}/text-channel-flexible-names` as const,
  guildTransferOwnership: (id: Snowflake) => `/guilds/${id}/transfer-ownership` as const,

  // Discovery (guild-scoped)
  guildDiscovery: (id: Snowflake) => `/guilds/${id}/discovery` as const,

  // ─── Users ─────────────────────────────────────────────────────

  currentUser: () => '/users/@me' as const,
  currentUserGuilds: () => '/users/@me/guilds' as const,
  currentUserChannels: () => '/users/@me/channels' as const,
  currentUserGuildSettings: (gId: Snowflake) => `/users/@me/guilds/${gId}/settings` as const,
  leaveGuild: (gId: Snowflake) => `/users/@me/guilds/${gId}` as const,
  user: (id: Snowflake) => `/users/${id}` as const,
  userProfile: (id: Snowflake) => `/users/${id}/profile` as const,

  // Notes
  currentUserNotes: () => '/users/@me/notes' as const,
  currentUserNote: (targetId: Snowflake) => `/users/@me/notes/${targetId}` as const,

  // Mentions
  currentUserMentions: () => '/users/@me/mentions' as const,
  currentUserMention: (msgId: Snowflake) => `/users/@me/mentions/${msgId}` as const,

  // DM pin
  currentUserChannelPin: (chId: Snowflake) => `/users/@me/channels/${chId}/pin` as const,

  // Relationships
  currentUserRelationships: () => '/users/@me/relationships' as const,
  currentUserRelationship: (userId: Snowflake) => `/users/@me/relationships/${userId}` as const,

  // Settings
  currentUserSettings: () => '/users/@me/settings' as const,

  // ─── Invites ───────────────────────────────────────────────────

  invite: (code: string) => `/invites/${code}` as const,

  // ─── Webhooks ──────────────────────────────────────────────────

  webhook: (id: Snowflake) => `/webhooks/${id}` as const,
  webhookWithToken: (id: Snowflake, token: string) => `/webhooks/${id}/${token}` as const,
  webhookExecute: (id: Snowflake, token: string) => `/webhooks/${id}/${token}` as const,
  webhookMessage: (id: Snowflake, token: string, msgId: Snowflake) =>
    `/webhooks/${id}/${token}/messages/${msgId}` as const,
  webhookGithub: (id: Snowflake, token: string) => `/webhooks/${id}/${token}/github` as const,
  webhookSentry: (id: Snowflake, token: string) => `/webhooks/${id}/${token}/sentry` as const,
  webhookSlack: (id: Snowflake, token: string) => `/webhooks/${id}/${token}/slack` as const,

  // ─── Search ────────────────────────────────────────────────────

  searchMessages: () => '/search/messages' as const,

  // ─── Discovery ─────────────────────────────────────────────────

  discoveryCategories: () => '/discovery/categories' as const,
  discoveryGuilds: () => '/discovery/guilds' as const,
  discoveryGuildJoin: (gId: Snowflake) => `/discovery/guilds/${gId}/join` as const,

  // ─── Packs ─────────────────────────────────────────────────────

  packs: () => '/packs' as const,
  pack: (id: Snowflake) => `/packs/${id}` as const,
  packInstall: (id: Snowflake) => `/packs/${id}/install` as const,
  packCreate: (type: string) => `/packs/${type}` as const,
  packInvites: (id: Snowflake) => `/packs/${id}/invites` as const,

  // Pack emojis
  packEmojis: (packId: Snowflake) => `/packs/emojis/${packId}` as const,
  packEmojiBulk: (packId: Snowflake) => `/packs/emojis/${packId}/bulk` as const,
  packEmoji: (packId: Snowflake, emojiId: Snowflake) => `/packs/emojis/${packId}/${emojiId}` as const,

  // Pack stickers
  packStickers: (packId: Snowflake) => `/packs/stickers/${packId}` as const,
  packStickerBulk: (packId: Snowflake) => `/packs/stickers/${packId}/bulk` as const,
  packSticker: (packId: Snowflake, stickerId: Snowflake) =>
    `/packs/stickers/${packId}/${stickerId}` as const,

  // ─── Streams ───────────────────────────────────────────────────

  streamPreview: (key: string) => `/streams/${key}/preview` as const,
  streamUpdate: (key: string) => `/streams/${key}/stream` as const,

} as const;
