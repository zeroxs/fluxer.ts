/** Snowflake ID — 64-bit unsigned integer as string */
export type Snowflake = string;

/** Fluxer epoch: 2015-01-01 00:00:00 UTC */
export const FLUXER_EPOCH = 1420070400000;

// ─── Users ──────────────────────────────────────────────────────

export interface User {
  id: Snowflake;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  avatar_color?: number | null;
  flags?: number | null;
  bot?: boolean;
  system?: boolean;
  banner?: string | null;
}

// ─── Channels ───────────────────────────────────────────────────

export enum ChannelType {
  GuildText = 0,
  DM = 1,
  GuildVoice = 2,
  GroupDM = 3,
  GuildCategory = 4,
  GuildLink = 5,
  GuildLinkExtended = 998,
}

export interface ChannelOverwrite {
  id: Snowflake;
  type: 0 | 1; // 0 = role, 1 = member
  allow: string;
  deny: string;
}

export interface Channel {
  id: Snowflake;
  type: ChannelType | number;
  guild_id?: Snowflake | null;
  name: string | null;
  topic?: string | null;
  url?: string | null;
  position?: number;
  parent_id: Snowflake | null;
  bitrate?: number | null;
  user_limit?: number | null;
  last_message_id?: Snowflake | null;
  permission_overwrites?: ChannelOverwrite[];
  nsfw?: boolean;
  rate_limit_per_user?: number;
  recipients?: User[];
}

// ─── Guilds ─────────────────────────────────────────────────────

export interface Guild {
  id: Snowflake;
  name: string;
  icon: string | null;
  banner: string | null;
  owner_id: Snowflake;
  system_channel_id?: Snowflake | null;
  rules_channel_id?: Snowflake | null;
  afk_channel_id?: Snowflake | null;
  afk_timeout: number;
  features: string[];
  verification_level: number;
  mfa_level: number;
  nsfw_level: number;
  permissions?: string | null;
}

export interface GuildMember {
  user: User;
  nick?: string | null;
  avatar?: string | null;
  roles: Snowflake[];
  joined_at: string;
  mute?: boolean;
  deaf?: boolean;
  communication_disabled_until?: string | null;
  premium_since?: string | null;
}

export interface Role {
  id: Snowflake;
  name: string;
  color: number;
  position: number;
  permissions: string;
  hoist: boolean;
  mentionable: boolean;
  unicode_emoji?: string | null;
}

// ─── Messages ───────────────────────────────────────────────────

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

export enum MessageFlags {
  SuppressEmbeds = 1 << 2,
  SuppressNotifications = 1 << 12,
  VoiceMessage = 1 << 13,
}

export interface Attachment {
  id: Snowflake;
  filename: string;
  title?: string | null;
  description?: string | null;
  content_type?: string | null;
  size: number;
  url?: string | null;
  proxy_url?: string | null;
  width?: number | null;
  height?: number | null;
  flags?: number | null;
}

export interface EmbedAuthor { name?: string; url?: string; icon_url?: string; }
export interface EmbedFooter { text: string; icon_url?: string; }
export interface EmbedMedia { url: string; proxy_url?: string | null; width?: number | null; height?: number | null; }
export interface EmbedField { name: string; value: string; inline?: boolean; }

export interface Embed {
  type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
  url?: string | null;
  title?: string | null;
  color?: number | null;
  timestamp?: string | null;
  description?: string | null;
  author?: EmbedAuthor | null;
  image?: EmbedMedia | null;
  thumbnail?: EmbedMedia | null;
  footer?: EmbedFooter | null;
  fields?: EmbedField[] | null;
  video?: EmbedMedia | null;
}

export interface MessageReference {
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake | null;
  type?: number;
}

export interface Reaction {
  emoji: { id: Snowflake | null; name: string; animated?: boolean | null };
  count: number;
  me?: boolean | null;
}

export interface Message {
  id: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake | null;
  author: User;
  webhook_id?: Snowflake | null;
  type: MessageType;
  flags: number;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  pinned: boolean;
  mention_everyone?: boolean;
  tts?: boolean;
  mentions?: User[] | null;
  mention_roles?: Snowflake[] | null;
  embeds?: Embed[] | null;
  attachments?: Attachment[] | null;
  reactions?: Reaction[] | null;
  message_reference?: MessageReference | null;
  referenced_message?: Message | null;
  nonce?: string | null;
  member?: GuildMember | null;
}

// ─── Interactions ───────────────────────────────────────────────

export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
  MessageComponent = 3,
  Autocomplete = 4,
  ModalSubmit = 5,
}

export enum ApplicationCommandType {
  ChatInput = 1,
  User = 2,
  Message = 3,
}

export interface InteractionOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: InteractionOption[];
  focused?: boolean;
}

export interface Interaction {
  id: Snowflake;
  type: InteractionType;
  application_id: Snowflake;
  guild_id?: Snowflake | null;
  channel_id?: Snowflake | null;
  member?: GuildMember | null;
  user?: User | null;
  token: string;
  data?: {
    id?: Snowflake;
    name?: string;
    type?: ApplicationCommandType;
    options?: InteractionOption[];
    custom_id?: string;
    component_type?: number;
    values?: string[];
    components?: unknown[];
    resolved?: unknown;
  };
}

export enum InteractionCallbackType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
  AutocompleteResult = 8,
  Modal = 9,
}

// ─── Webhooks ───────────────────────────────────────────────────

export interface Webhook {
  id: Snowflake;
  type: number;
  guild_id?: Snowflake | null;
  channel_id: Snowflake;
  name: string | null;
  avatar: string | null;
  token?: string;
}

// ─── Emoji / Sticker ────────────────────────────────────────────

export interface Emoji {
  id: Snowflake;
  name: string;
  animated: boolean;
}

export interface Sticker {
  id: Snowflake;
  name: string;
  description: string;
  tags: string[];
  animated: boolean;
}

// ─── Gateway ────────────────────────────────────────────────────

export enum GatewayOpcode {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
}

export interface GatewayPayload {
  op: GatewayOpcode;
  d: unknown;
  s: number | null;
  t: string | null;
}

// ─── Send Options ───────────────────────────────────────────────

export interface MessageSendOptions {
  content?: string;
  embeds?: Embed[];
  files?: Array<{ name: string; data: Buffer | ArrayBuffer; filename?: string }>;
  attachments?: Array<{ id: number; filename: string }>;
  flags?: number;
  message_reference?: MessageReference;
}
