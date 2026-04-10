/**
 * fluxer.ts type definitions.
 *
 * Core API types are auto-generated from the Fluxer OpenAPI spec.
 * SDK-specific types (gateway, send options, channel types) are defined here.
 */

// Re-export all generated API types
export * from './types.generated.js';

// Re-export with overrides where the generator's output needs SDK refinement
import type { Snowflake, Embed } from './types.generated.js';

// ─── Constants ─────────────────────────────────────────────────

/** Fluxer epoch: 2015-01-01 00:00:00 UTC */
export const FLUXER_EPOCH = 1420070400000;

// ─── Permissions ──────────────────────────────────────────────
// Fluxer permission bitfield values. Use with roles and channel overwrites.
// Values are bigints because some exceed 32-bit range.

export const Permissions = {
  CreateInstantInvite:  0x1n,
  KickMembers:          0x2n,
  BanMembers:           0x4n,
  Administrator:        0x8n,
  ManageChannels:       0x10n,
  ManageGuild:          0x20n,
  AddReactions:         0x40n,
  ViewAuditLog:         0x80n,
  PrioritySpeaker:      0x100n,
  Stream:               0x200n,
  ViewChannel:          0x400n,
  SendMessages:         0x800n,
  SendTTSMessages:      0x1000n,
  ManageMessages:       0x2000n,
  EmbedLinks:           0x4000n,
  AttachFiles:          0x8000n,
  ReadMessageHistory:   0x10000n,
  MentionEveryone:      0x20000n,
  UseExternalEmojis:    0x40000n,
  Connect:              0x100000n,
  Speak:                0x200000n,
  MuteMembers:          0x400000n,
  DeafenMembers:        0x800000n,
  MoveMembers:          0x1000000n,
  UseVAD:               0x2000000n,
  ChangeNickname:       0x4000000n,
  ManageNicknames:      0x8000000n,
  ManageRoles:          0x10000000n,
  ManageWebhooks:       0x20000000n,
  ManageExpressions:    0x40000000n,
  UseExternalStickers:  0x2000000000n,
  ModerateMembers:      0x10000000000n,
  CreateExpressions:    0x80000000000n,
  PinMessages:          0x8000000000000n,
  BypassSlowmode:       0x10000000000000n,
  UpdateRtcRegion:      0x20000000000000n,
} as const;

/** Check if a permission bitfield includes a specific permission. */
export function hasPermission(permissions: bigint | string, perm: bigint): boolean {
  const bits = typeof permissions === 'string' ? BigInt(permissions) : permissions;
  if (bits & Permissions.Administrator) return true;
  return (bits & perm) === perm;
}

/** Combine multiple permissions into a single bitfield. */
export function combinePermissions(...perms: bigint[]): bigint {
  return perms.reduce((a, b) => a | b, 0n);
}

// ─── Channel Types ─────────────────────────────────────────────
// Not present in the OpenAPI spec as an enum, but essential for SDK consumers.

export enum ChannelType {
  GuildText = 0,
  DM = 1,
  GuildVoice = 2,
  GroupDM = 3,
  GuildCategory = 4,
  GuildLink = 5,
  GuildLinkExtended = 998,
}

// ─── Message Types ─────────────────────────────────────────────
// Not present in the OpenAPI spec as an enum.

export enum MessageType {
  Default = 0,
  RecipientAdd = 1,
  RecipientRemove = 2,
  Call = 3,
  ChannelNameChange = 4,
  ChannelIconChange = 5,
  ChannelPinnedMessage = 6,
  UserJoin = 7,
  Reply = 19,
}

// ─── Gateway ───────────────────────────────────────────────────

export enum GatewayOpcode {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  VoiceServerPing = 5,
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
  GatewayError = 12,
  LazyRequest = 14,
}

export interface GatewayPayload {
  op: GatewayOpcode;
  d: unknown;
  s: number | null;
  t: string | null;
}

// ─── Send Options ──────────────────────────────────────────────

export interface MessageSendOptions {
  content?: string;
  embeds?: Embed[];
  files?: Array<{ name: string; data: Buffer | ArrayBuffer; filename?: string }>;
  attachments?: Array<{ id: number; filename: string }>;
  flags?: number;
  message_reference?: { channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake };
}

/** Options for executing a webhook — extends MessageSendOptions with webhook-specific fields. */
export interface WebhookSendOptions extends MessageSendOptions {
  /** Override the webhook's display name for this message. */
  username?: string;
  /** Override the webhook's avatar URL for this message. */
  avatar_url?: string;
}

// ─── Voice State ───────────────────────────────────────────────

export interface VoiceState {
  guild_id?: Snowflake;
  channel_id: Snowflake | null;
  user_id: Snowflake;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_video: boolean;
  suppress: boolean;
}
