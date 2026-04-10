/**
 * Auto-generated from Fluxer OpenAPI spec — do not edit by hand.
 * Run: node tools/generate-types.mjs > src/types.generated.ts
 */

export type Snowflake = string;

// ─── Bitflag Enums ──────────────────────────────────────────────

export enum MessageFlags {
  /** Do not include embeds when serialising this message */
  SUPPRESS_EMBEDS = 4,
  /** This message will not trigger push or desktop notifications */
  SUPPRESS_NOTIFICATIONS = 4096,
  /** This message is a voice message */
  VOICE_MESSAGE = 8192,
  /** Display attachments in a compact format */
  COMPACT_ATTACHMENTS = 131072,
}

export enum UserFlags {
  /** User is a staff member */
  STAFF = 1,
  /** User is a community test program member */
  CTP_MEMBER = 2,
  /** User is a partner */
  PARTNER = 4,
  /** User is a bug hunter */
  BUG_HUNTER = 8,
  /** Bot accepts friend requests from users */
  FRIENDLY_BOT = 16,
  /** Bot requires manual approval for friend requests */
  FRIENDLY_BOT_MANUAL_APPROVAL = 32,
}

export enum SystemChannelFlags {
  /** Suppress member join notifications in system channel */
  SUPPRESS_JOIN_NOTIFICATIONS = 1,
}

export enum AttachmentFlags {
  /** Attachment is marked as a spoiler */
  IS_SPOILER = 8,
  /** Attachment contains explicit media content */
  CONTAINS_EXPLICIT_MEDIA = 16,
  /** Attachment is animated */
  IS_ANIMATED = 32,
}

export enum EmbedMediaFlags {
  /** Embed media contains explicit content */
  CONTAINS_EXPLICIT_MEDIA = 16,
  /** Embed media is animated */
  IS_ANIMATED = 32,
}

export enum MemberProfileFlags {
  /** Guild member avatar is unset */
  AVATAR_UNSET = 1,
  /** Guild member banner is unset */
  BANNER_UNSET = 2,
}

export enum GuildOperations {
  /** Allow push notifications for this guild */
  PUSH_NOTIFICATIONS = 1,
  /** Allow @everyone mentions in this guild */
  EVERYONE_MENTIONS = 2,
  /** Enable typing indicator events */
  TYPING_EVENTS = 4,
  /** Allow creation of instant invites */
  INSTANT_INVITES = 8,
  /** Allow sending messages in the guild */
  SEND_MESSAGE = 16,
  /** Allow adding reactions to messages */
  REACTIONS = 32,
  /** Enable member list update events */
  MEMBER_LIST_UPDATES = 64,
}

// ─── Enums ─────────────────────────────────────────────────────

export enum GuildVerificationLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export enum GuildMFALevel {
  NONE = 0,
  ELEVATED = 1,
}

export enum NSFWLevel {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3,
}

export enum GuildExplicitContentFilter {
  DISABLED = 0,
  MEMBERS_WITHOUT_ROLES = 1,
  ALL_MEMBERS = 2,
}

export enum DefaultMessageNotifications {
  ALL_MESSAGES = 0,
  ONLY_MENTIONS = 1,
}

export enum AuditLogActionType {
  GUILD_UPDATE = 1,
  CHANNEL_CREATE = 10,
  CHANNEL_UPDATE = 11,
  CHANNEL_DELETE = 12,
  CHANNEL_OVERWRITE_CREATE = 13,
  CHANNEL_OVERWRITE_UPDATE = 14,
  CHANNEL_OVERWRITE_DELETE = 15,
  MEMBER_KICK = 20,
  MEMBER_PRUNE = 21,
  MEMBER_BAN_ADD = 22,
  MEMBER_BAN_REMOVE = 23,
  MEMBER_UPDATE = 24,
  MEMBER_ROLE_UPDATE = 25,
  MEMBER_MOVE = 26,
  MEMBER_DISCONNECT = 27,
  BOT_ADD = 28,
  ROLE_CREATE = 30,
  ROLE_UPDATE = 31,
  ROLE_DELETE = 32,
  INVITE_CREATE = 40,
  INVITE_UPDATE = 41,
  INVITE_DELETE = 42,
  WEBHOOK_CREATE = 50,
  WEBHOOK_UPDATE = 51,
  WEBHOOK_DELETE = 52,
  EMOJI_CREATE = 60,
  EMOJI_UPDATE = 61,
  EMOJI_DELETE = 62,
  STICKER_CREATE = 90,
  STICKER_UPDATE = 91,
  STICKER_DELETE = 92,
  MESSAGE_DELETE = 72,
  MESSAGE_BULK_DELETE = 73,
  MESSAGE_PIN = 74,
  MESSAGE_UNPIN = 75,
}

export enum WebhookType {
  INCOMING = 1,
  CHANNEL_FOLLOWER = 2,
}

export enum MessageReferenceType {
  DEFAULT = 0,
  FORWARD = 1,
}

export enum RelationshipType {
  FRIEND = 1,
  BLOCKED = 2,
  INCOMING_REQUEST = 3,
  OUTGOING_REQUEST = 4,
}

export enum JoinSourceType {
  CREATOR = 0,
  INSTANT_INVITE = 1,
  VANITY_URL = 2,
  BOT_INVITE = 3,
  ADMIN_FORCE_ADD = 4,
}

// ─── Core Objects ─────────────────────────────────────────────

export interface User {
  /** The unique identifier (snowflake) for this user */
  id: Snowflake;
  /** The username of the user, not unique across the platform */
  username: string;
  /** The four-digit discriminator tag of the user */
  discriminator: string;
  /** The display name of the user, if set */
  global_name: string | null;
  /** The hash of the user avatar image */
  avatar: string | null;
  /** The dominant avatar color of the user as an integer */
  avatar_color: number | null;
  /** Whether the user is a bot account */
  bot?: boolean;
  /** Whether the user is an official system user */
  system?: boolean;
  flags: UserFlags;
}

export interface Guild {
  /** The unique identifier for this guild */
  id: Snowflake;
  /** The name of the guild */
  name: string;
  /** The hash of the guild icon */
  icon?: string | null;
  /** The hash of the guild banner */
  banner?: string | null;
  /** The width of the guild banner in pixels */
  banner_width?: number | null;
  /** The height of the guild banner in pixels */
  banner_height?: number | null;
  /** The hash of the guild splash screen */
  splash?: string | null;
  /** The width of the guild splash in pixels */
  splash_width?: number | null;
  /** The height of the guild splash in pixels */
  splash_height?: number | null;
  /** The alignment of the splash card */
  splash_card_alignment: number;
  /** The hash of the embedded invite splash */
  embed_splash?: string | null;
  /** The width of the embedded invite splash in pixels */
  embed_splash_width?: number | null;
  /** The height of the embedded invite splash in pixels */
  embed_splash_height?: number | null;
  /** The vanity URL code for the guild */
  vanity_url_code?: string | null;
  /** The ID of the guild owner */
  owner_id: Snowflake;
  /** The ID of the channel where system messages are sent */
  system_channel_id?: Snowflake | null;
  system_channel_flags: SystemChannelFlags;
  /** The ID of the rules channel */
  rules_channel_id?: Snowflake | null;
  /** The ID of the AFK voice channel */
  afk_channel_id?: Snowflake | null;
  /** AFK timeout in seconds before moving users to the AFK channel */
  afk_timeout: number;
  /** Array of guild feature flags */
  features: string[];
  /** Required verification level for members to participate */
  verification_level: GuildVerificationLevel;
  /** Required MFA level for moderation actions */
  mfa_level: GuildMFALevel;
  /** The NSFW level of the guild */
  nsfw_level: NSFWLevel;
  /** Level of content filtering for explicit media */
  explicit_content_filter: GuildExplicitContentFilter;
  /** Default notification level for new members */
  default_message_notifications: DefaultMessageNotifications;
  disabled_operations: GuildOperations;
  /** ISO8601 timestamp controlling how far back members without Read Message History can access messages. When null, no historical access is allowed. */
  message_history_cutoff?: string | null;
  permissions?: string | null;
}

export interface Channel {
  /** The unique identifier (snowflake) for this channel */
  id: Snowflake;
  guild_id?: Snowflake;
  /** The name of the channel */
  name?: string;
  /** The topic of the channel */
  topic?: string | null;
  /** The URL associated with the channel */
  url?: string | null;
  /** The icon hash of the channel (for group DMs) */
  icon?: string | null;
  /** The ID of the owner of the channel (for group DMs) */
  owner_id?: Snowflake | null;
  /** The type of the channel */
  type: number;
  position?: number;
  /** The ID of the parent category for this channel */
  parent_id?: Snowflake | null;
  /** The bitrate of the voice channel in bits per second */
  bitrate?: number | null;
  /** The maximum number of users allowed in the voice channel */
  user_limit?: number | null;
  /** The voice region ID for the voice channel */
  rtc_region?: string | null;
  /** The ID of the last message sent in this channel */
  last_message_id?: Snowflake | null;
  /** The ISO 8601 timestamp of when the last pinned message was pinned */
  last_pin_timestamp?: string | null;
  /** The permission overwrites for this channel */
  permission_overwrites?: PermissionOverwrite[];
  /** The recipients of the DM channel */
  recipients?: User[];
  /** Whether the channel is marked as NSFW */
  nsfw?: boolean;
  rate_limit_per_user?: number;
  /** Custom nicknames for users in this channel (for group DMs) */
  nicks?: Record<string, string>;
}

export interface Message {
  /** The unique identifier (snowflake) for this message */
  id: Snowflake;
  /** The ID of the channel this message was sent in */
  channel_id: Snowflake;
  author: User;
  /** The ID of the webhook that sent this message */
  webhook_id?: Snowflake | null;
  /** The type of message */
  type: number;
  flags: MessageFlags;
  /** The text content of the message */
  content: string;
  /** The ISO 8601 timestamp of when the message was created */
  timestamp: string;
  /** The ISO 8601 timestamp of when the message was last edited */
  edited_timestamp?: string | null;
  /** Whether the message is pinned */
  pinned: boolean;
  /** Whether the message mentions @everyone */
  mention_everyone: boolean;
  /** Whether the message was sent as text-to-speech */
  tts?: boolean;
  /** The users mentioned in the message */
  mentions?: User[] | null;
  /** The role IDs mentioned in the message */
  mention_roles?: string[] | null;
  /** The embeds attached to the message */
  embeds?: Embed[] | null;
  /** The files attached to the message */
  attachments?: Attachment[] | null;
  /** The stickers sent with the message */
  stickers?: MessageSticker[] | null;
  /** The reactions on the message */
  reactions?: Reaction[] | null;
  /** Reference data for replies or forwards */
  message_reference?: MessageReference | null;
  /** Snapshots of forwarded messages */
  message_snapshots?: unknown[] | null;
  /** A client-provided value for message deduplication */
  nonce?: string | null;
  /** Call information if this message represents a call */
  call?: MessageCall | null;
  /** The message that this message is replying to or forwarding */
  referenced_message?: MessageBase | null;
  /** The guild ID (present on gateway dispatch events) */
  guild_id?: Snowflake;
  /** Partial member data (present on gateway dispatch events) */
  member?: GuildMember;
}

export interface MessageBase {
  /** The unique identifier (snowflake) for this message */
  id: Snowflake;
  /** The ID of the channel this message was sent in */
  channel_id: Snowflake;
  author: User;
  /** The ID of the webhook that sent this message */
  webhook_id?: Snowflake | null;
  /** The type of message */
  type: number;
  flags: MessageFlags;
  /** The text content of the message */
  content: string;
  /** The ISO 8601 timestamp of when the message was created */
  timestamp: string;
  /** The ISO 8601 timestamp of when the message was last edited */
  edited_timestamp?: string | null;
  /** Whether the message is pinned */
  pinned: boolean;
  /** Whether the message mentions @everyone */
  mention_everyone: boolean;
  /** Whether the message was sent as text-to-speech */
  tts?: boolean;
  /** The users mentioned in the message */
  mentions?: User[] | null;
  /** The role IDs mentioned in the message */
  mention_roles?: string[] | null;
  /** The embeds attached to the message */
  embeds?: Embed[] | null;
  /** The files attached to the message */
  attachments?: Attachment[] | null;
  /** The stickers sent with the message */
  stickers?: MessageSticker[] | null;
  /** The reactions on the message */
  reactions?: Reaction[] | null;
  /** Reference data for replies or forwards */
  message_reference?: MessageReference | null;
  /** Snapshots of forwarded messages */
  message_snapshots?: unknown[] | null;
  /** A client-provided value for message deduplication */
  nonce?: string | null;
  /** Call information if this message represents a call */
  call?: MessageCall | null;
}

export interface GuildMember {
  user: User;
  /** The nickname of the member in this guild */
  nick?: string | null;
  /** The hash of the member guild-specific avatar */
  avatar?: string | null;
  /** The hash of the member guild-specific banner */
  banner?: string | null;
  /** The accent colour of the member guild profile as an integer */
  accent_color?: number | null;
  /** Array of role IDs the member has */
  roles: string[];
  /** ISO8601 timestamp of when the user joined the guild */
  joined_at: string;
  /** Whether the member is muted in voice channels */
  mute: boolean;
  /** Whether the member is deafened in voice channels */
  deaf: boolean;
  /** ISO8601 timestamp until which the member is timed out */
  communication_disabled_until?: string | null;
  profile_flags?: MemberProfileFlags | null;
}

export interface Role {
  /** The unique identifier for this role */
  id: Snowflake;
  /** The name of the role */
  name: string;
  /** The colour of the role as an integer */
  color: number;
  /** The position of the role in the role hierarchy */
  position: number;
  /** The position of the role in the hoisted member list */
  hoist_position?: number | null;
  /** The permissions bitfield for the role */
  permissions: string;
  /** Whether this role is displayed separately in the member list */
  hoist: boolean;
  /** Whether this role can be mentioned by anyone */
  mentionable: boolean;
  /** The unicode emoji for this role */
  unicode_emoji?: string | null;
}

// ─── Sub-Objects ──────────────────────────────────────────────

export interface Attachment {
  /** The unique identifier for this attachment */
  id: Snowflake;
  /** The name of the attached file */
  filename: string;
  /** The title of the attachment */
  title?: string | null;
  /** The description of the attachment */
  description?: string | null;
  /** The MIME type of the attachment */
  content_type?: string | null;
  /** The hash of the attachment content */
  content_hash?: string | null;
  /** The size of the attachment in bytes */
  size: number;
  /** The URL of the attachment */
  url?: string | null;
  /** The proxied URL of the attachment */
  proxy_url?: string | null;
  /** The width of the attachment in pixels (for images/videos) */
  width?: number | null;
  /** The height of the attachment in pixels (for images/videos) */
  height?: number | null;
  /** The base64 encoded placeholder image for lazy loading */
  placeholder?: string | null;
  flags: AttachmentFlags;
  /** Whether the attachment is flagged as NSFW */
  nsfw?: boolean | null;
  /** The duration of the media in seconds */
  duration?: number | null;
  /** The base64 encoded audio waveform data */
  waveform?: string | null;
  /** The ISO 8601 timestamp when the attachment URL expires */
  expires_at?: string | null;
  /** Whether the attachment URL has expired */
  expired?: boolean | null;
}

export interface Embed {
  /** The type of embed (e.g., rich, image, video, gifv, article, link) */
  type?: string;
  /** The URL of the embed */
  url?: string | null;
  /** The title of the embed */
  title?: string | null;
  /** The color code of the embed sidebar */
  color?: number | null;
  /** The ISO 8601 timestamp of the embed content */
  timestamp?: string | null;
  /** The description of the embed */
  description?: string | null;
  /** The author information of the embed */
  author?: EmbedAuthor | null;
  /** The image of the embed */
  image?: EmbedMedia | null;
  /** The thumbnail of the embed */
  thumbnail?: EmbedMedia | null;
  /** The footer of the embed */
  footer?: EmbedFooter | null;
  /** The fields of the embed */
  fields?: EmbedField[] | null;
  /** The provider of the embed (e.g., YouTube, Twitter) */
  provider?: EmbedAuthor | null;
  /** The video of the embed */
  video?: EmbedMedia | null;
  /** The audio of the embed */
  audio?: EmbedMedia | null;
  /** Whether the embed is flagged as NSFW */
  nsfw?: boolean | null;
  /** Internal nested embeds generated by unfurlers */
  children?: EmbedChild[] | null;
}

export interface EmbedChild {
  /** The type of embed (e.g., rich, image, video, gifv, article, link) */
  type?: string;
  /** The URL of the embed */
  url?: string | null;
  /** The title of the embed */
  title?: string | null;
  /** The color code of the embed sidebar */
  color?: number | null;
  /** The ISO 8601 timestamp of the embed content */
  timestamp?: string | null;
  /** The description of the embed */
  description?: string | null;
  /** The author information of the embed */
  author?: EmbedAuthor | null;
  /** The image of the embed */
  image?: EmbedMedia | null;
  /** The thumbnail of the embed */
  thumbnail?: EmbedMedia | null;
  /** The footer of the embed */
  footer?: EmbedFooter | null;
  /** The fields of the embed */
  fields?: EmbedField[] | null;
  /** The provider of the embed (e.g., YouTube, Twitter) */
  provider?: EmbedAuthor | null;
  /** The video of the embed */
  video?: EmbedMedia | null;
  /** The audio of the embed */
  audio?: EmbedMedia | null;
  /** Whether the embed is flagged as NSFW */
  nsfw?: boolean | null;
}

export interface EmbedAuthor {
  /** The name of the author */
  name: string;
  /** The URL of the author */
  url?: string | null;
  /** The URL of the author icon */
  icon_url?: string | null;
  /** The proxied URL of the author icon */
  proxy_icon_url?: string | null;
}

export interface EmbedMedia {
  /** The URL of the media */
  url: string;
  /** The proxied URL of the media */
  proxy_url?: string | null;
  /** The MIME type of the media */
  content_type?: string | null;
  /** The hash of the media content */
  content_hash?: string | null;
  /** The width of the media in pixels */
  width?: number | null;
  /** The height of the media in pixels */
  height?: number | null;
  /** The description of the media */
  description?: string | null;
  /** The base64 encoded placeholder image for lazy loading */
  placeholder?: string | null;
  /** The duration of the media in seconds */
  duration?: number | null;
  flags?: EmbedMediaFlags;
}

export interface EmbedFooter {
  /** The footer text */
  text: string;
  /** The URL of the footer icon */
  icon_url?: string | null;
  /** The proxied URL of the footer icon */
  proxy_icon_url?: string | null;
}

export interface EmbedField {
  /** The name of the field */
  name: string;
  /** The value of the field */
  value: string;
  /** Whether the field should be displayed inline */
  inline?: boolean;
}

export interface Reaction {
  /** The emoji used for the reaction */
  emoji: { id?: Snowflake | null; name: string; animated?: boolean | null };
  /** The total number of times this reaction has been used */
  count: number;
  /** Whether the current user has reacted with this emoji */
  me?: boolean | null;
}

export interface MessageReference {
  /** The ID of the channel containing the referenced message */
  channel_id: Snowflake;
  /** The ID of the referenced message */
  message_id: Snowflake;
  /** The ID of the guild containing the referenced message */
  guild_id?: Snowflake | null;
  type: MessageReferenceType;
}

export interface MessageSticker {
  /** The unique identifier of the sticker */
  id: Snowflake;
  /** The name of the sticker */
  name: string;
  /** Whether the sticker is animated */
  animated: boolean;
}

export interface MessageCall {
  /** The user IDs of participants in the call */
  participants: string[];
  /** The ISO 8601 timestamp of when the call ended */
  ended_timestamp?: string | null;
}

export interface PermissionOverwrite {
  /** The unique identifier for the role or user this overwrite applies to */
  id: Snowflake;
  /** The type of entity the overwrite applies to */
  type: number;
  /** The bitwise value of allowed permissions */
  allow: string;
  /** The bitwise value of denied permissions */
  deny: string;
}

export interface Emoji {
  /** The unique identifier for this emoji */
  id: Snowflake;
  /** The name of the emoji */
  name: string;
  /** Whether this emoji is animated */
  animated: boolean;
}

export interface PartialChannel {
  /** The unique identifier (snowflake) for this channel */
  id: Snowflake;
  /** The name of the channel */
  name?: string | null;
  /** The type of the channel */
  type: number;
  /** The recipients of the DM channel */
  recipients?: { username: string }[];
}

// ─── Guild Management ─────────────────────────────────────────

export interface GuildBan {
  user: User;
  /** The reason for the ban */
  reason?: string | null;
  /** The ID of the moderator who issued the ban */
  moderator_id: Snowflake;
  /** ISO8601 timestamp of when the ban was issued */
  banned_at: string;
  /** ISO8601 timestamp of when the ban expires (null if permanent) */
  expires_at?: string | null;
}

export interface AuditLogEntry {
  /** The unique identifier for this audit log entry */
  id: Snowflake;
  action_type: AuditLogActionType;
  /** The user ID of the user who performed the action */
  user_id?: Snowflake | null;
  /** The ID of the affected entity (user, channel, role, invite code, etc.) */
  target_id?: string | null;
  /** The reason provided for the action */
  reason?: string;
  /** Additional options depending on action type */
  options?: { channel_id?: string; count?: number; delete_member_days?: string; id?: string; integration_type?: number; message_id?: string; members_removed?: number; role_name?: string; type?: number; inviter_id?: string; max_age?: number; max_uses?: number; temporary?: boolean; uses?: number };
  /** Changes made to the target */
  changes?: AuditLogChange[];
}

export interface AuditLogChange {
  /** The field that changed */
  key: string;
  /** Value before the change */
  old_value?: string | number | boolean | string[] | number[] | { added: string[]; removed: string[] } | null;
  /** Value after the change */
  new_value?: string | number | boolean | string[] | number[] | { added: string[]; removed: string[] } | null;
}

export interface Sticker {
  /** The unique identifier for this sticker */
  id: Snowflake;
  /** The name of the sticker */
  name: string;
  /** The description of the sticker */
  description: string;
  /** Autocomplete/suggestion tags for the sticker */
  tags: string[];
  /** Whether this sticker is animated */
  animated: boolean;
}

export interface VanityURL {
  /** The vanity URL code for the guild */
  code?: string | null;
  /** The number of times this vanity URL has been used */
  uses: number;
}

export interface MemberSearchResult {
  /** Composite ID (guildId:userId) */
  id: string;
  /** Guild ID */
  guild_id: string;
  /** User ID */
  user_id: string;
  /** Username */
  username: string;
  /** Zero-padded 4-digit discriminator */
  discriminator: string;
  /** Global display name */
  global_name: string | null;
  /** Guild nickname */
  nickname: string | null;
  /** Role IDs */
  role_ids: string[];
  /** Unix timestamp of when the member joined */
  joined_at: number;
  /** Supplemental members-search-only metadata that is not part of the base guild member payload */
  supplemental: { join_source_type?: JoinSourceType | null; source_invite_code: string | null; inviter_id: string | null };
  /** Whether the user is a bot */
  is_bot: boolean;
}

// ─── Webhooks ─────────────────────────────────────────────────

export interface Webhook {
  /** The unique identifier (snowflake) for the webhook */
  id: Snowflake;
  /** The ID of the guild this webhook belongs to */
  guild_id: Snowflake;
  /** The ID of the channel this webhook posts to */
  channel_id: Snowflake;
  /** The display name of the webhook */
  name: string;
  /** The hash of the webhook avatar image */
  avatar?: string | null;
  /** The secure token used to execute the webhook */
  token: string;
  user: User;
}

export interface WebhookWithToken {
  /** The unique identifier (snowflake) for the webhook */
  id: Snowflake;
  /** The ID of the guild this webhook belongs to */
  guild_id: Snowflake;
  /** The ID of the channel this webhook posts to */
  channel_id: Snowflake;
  /** The display name of the webhook */
  name: string;
  /** The hash of the webhook avatar image */
  avatar?: string | null;
  /** The secure token used to execute the webhook */
  token: string;
}

// ─── Invites ──────────────────────────────────────────────────

export interface GuildInvite {
  /** The unique invite code */
  code: string;
  /** The type of invite (guild) */
  type: number;
  /** The guild this invite is for */
  guild: { id: Snowflake; name: string; icon?: string | null; banner?: string | null; banner_width?: number | null; banner_height?: number | null; splash?: string | null; splash_width?: number | null; splash_height?: number | null; splash_card_alignment: number; embed_splash?: string | null; embed_splash_width?: number | null; embed_splash_height?: number | null; features: string[] };
  channel: PartialChannel;
  /** The user who created the invite */
  inviter?: User | null;
  /** The approximate total member count of the guild */
  member_count: number;
  /** The approximate online member count of the guild */
  presence_count: number;
  /** ISO8601 timestamp of when the invite expires */
  expires_at?: string | null;
  /** Whether the invite grants temporary membership */
  temporary: boolean;
}

export interface GuildInviteMetadata {
  /** The unique invite code */
  code: string;
  /** The type of invite (guild) */
  type: number;
  /** The guild this invite is for */
  guild: { id: Snowflake; name: string; icon?: string | null; banner?: string | null; banner_width?: number | null; banner_height?: number | null; splash?: string | null; splash_width?: number | null; splash_height?: number | null; splash_card_alignment: number; embed_splash?: string | null; embed_splash_width?: number | null; embed_splash_height?: number | null; features: string[] };
  channel: PartialChannel;
  /** The user who created the invite */
  inviter?: User | null;
  /** The approximate total member count of the guild */
  member_count: number;
  /** The approximate online member count of the guild */
  presence_count: number;
  /** ISO8601 timestamp of when the invite expires */
  expires_at?: string | null;
  /** Whether the invite grants temporary membership */
  temporary: boolean;
  /** ISO8601 timestamp of when the invite was created */
  created_at: string;
  /** The number of times this invite has been used */
  uses: number;
  /** The maximum number of times this invite can be used */
  max_uses: number;
  /** The duration in seconds before the invite expires */
  max_age: number;
}

export interface GroupDMInvite {
  /** The unique invite code */
  code: string;
  /** The type of invite (group DM) */
  type: number;
  channel: PartialChannel;
  /** The user who created the invite */
  inviter?: User | null;
  /** The current member count of the group DM */
  member_count: number;
  /** ISO8601 timestamp of when the invite expires */
  expires_at?: string | null;
  /** Whether the invite grants temporary membership */
  temporary: boolean;
}

// ─── Packs ────────────────────────────────────────────────────

export interface Pack {
  /** The unique identifier (snowflake) for the pack */
  id: Snowflake;
  /** The display name of the pack */
  name: string;
  /** The description of the pack */
  description: string | null;
  /** The type of expression pack (emoji or sticker) */
  type: string;
  /** The ID of the user who created the pack */
  creator_id: Snowflake;
  /** ISO8601 timestamp of when the pack was created */
  created_at: string;
  /** ISO8601 timestamp of when the pack was last updated */
  updated_at: string;
  /** ISO8601 timestamp of when the pack was installed by the user */
  installed_at?: string;
}

// ─── Pins ─────────────────────────────────────────────────────

export interface PinnedMessage {
  message: MessageBase;
  /** The ISO 8601 timestamp of when the message was pinned */
  pinned_at: string;
}

