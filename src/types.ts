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
