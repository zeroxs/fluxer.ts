/** High-level Fluxer client — ties REST and Gateway together with a clean event API. */

import { EventEmitter } from 'events';
import { REST } from './rest.js';
import { Gateway } from './gateway.js';
import { Routes } from './routes.js';
import type {
  Snowflake, User, Guild, GuildMember, Channel, Message, Role,
  MessageSendOptions, WebhookSendOptions, Embed, Emoji, Sticker, Webhook, GuildBan,
  AuditLogEntry, GuildInvite, GuildInviteMetadata, VoiceState, PinnedMessage,
  PermissionOverwrite,
} from './types.js';

// ─── Helpers ────────────────────────────────────────────────────

/** Fluxer nests guild info in a `properties` sub-object. Normalize to flat Guild. */
function normalizeGuild(data: Record<string, unknown>): Guild {
  const props = (data.properties ?? data) as Record<string, unknown>;
  return {
    id: (data.id ?? props.id) as Snowflake,
    name: (props.name ?? 'Unknown') as string,
    icon: (props.icon ?? null) as string | null,
    banner: (props.banner ?? null) as string | null,
    banner_width: (props.banner_width ?? null) as number | null,
    banner_height: (props.banner_height ?? null) as number | null,
    splash: (props.splash ?? null) as string | null,
    splash_width: (props.splash_width ?? null) as number | null,
    splash_height: (props.splash_height ?? null) as number | null,
    splash_card_alignment: (props.splash_card_alignment ?? 0) as number,
    embed_splash: (props.embed_splash ?? null) as string | null,
    embed_splash_width: (props.embed_splash_width ?? null) as number | null,
    embed_splash_height: (props.embed_splash_height ?? null) as number | null,
    vanity_url_code: (props.vanity_url_code ?? null) as string | null,
    owner_id: (props.owner_id ?? '') as Snowflake,
    system_channel_id: (props.system_channel_id ?? null) as Snowflake | null,
    system_channel_flags: (props.system_channel_flags ?? 0) as number,
    rules_channel_id: (props.rules_channel_id ?? null) as Snowflake | null,
    afk_channel_id: (props.afk_channel_id ?? null) as Snowflake | null,
    afk_timeout: (props.afk_timeout ?? 0) as number,
    features: (props.features ?? []) as string[],
    verification_level: (props.verification_level ?? 0) as number,
    mfa_level: (props.mfa_level ?? 0) as number,
    nsfw_level: (props.nsfw_level ?? 0) as number,
    explicit_content_filter: (props.explicit_content_filter ?? 0) as number,
    default_message_notifications: (props.default_message_notifications ?? 0) as number,
    disabled_operations: (props.disabled_operations ?? 0) as number,
    message_history_cutoff: (props.message_history_cutoff ?? null) as string | null,
    permissions: (props.permissions ?? null) as string | null,
  };
}

// ─── Gateway Intents ────────────────────────────────────────────

export const GatewayIntents = {
  Guilds:                 1 << 0,
  GuildMembers:           1 << 1,
  GuildModeration:        1 << 2,
  GuildEmojisAndStickers: 1 << 3,
  GuildIntegrations:      1 << 4,
  GuildWebhooks:          1 << 5,
  GuildInvites:           1 << 6,
  GuildVoiceStates:       1 << 7,
  GuildPresences:         1 << 8,
  GuildMessages:          1 << 9,
  GuildMessageReactions:  1 << 10,
  GuildMessageTyping:     1 << 11,
  DirectMessages:         1 << 12,
  DirectMessageReactions: 1 << 13,
  DirectMessageTyping:    1 << 14,
  MessageContent:         1 << 15,
  GuildScheduledEvents:   1 << 16,
} as const;

/** All non-privileged intents */
export const IntentsAll = Object.values(GatewayIntents).reduce((a, b) => a | b, 0);

// ─── Client Events ──────────────────────────────────────────────

export type EmojiData = { id: Snowflake | null; name: string; animated?: boolean };

export interface ClientEvents {
  ready: [user: User, guilds: Guild[]];

  // Messages
  messageCreate: [message: Message];
  messageUpdate: [message: Partial<Message> & { id: Snowflake; channel_id: Snowflake }];
  messageDelete: [data: { id: Snowflake; channel_id: Snowflake; guild_id?: Snowflake }];
  messageDeleteBulk: [data: { ids: Snowflake[]; channel_id: Snowflake; guild_id?: Snowflake }];

  // Reactions
  messageReactionAdd: [data: { user_id: Snowflake; channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake; emoji: EmojiData }];
  messageReactionRemove: [data: { user_id: Snowflake; channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake; emoji: EmojiData }];
  messageReactionRemoveAll: [data: { channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake }];
  messageReactionRemoveEmoji: [data: { channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake; emoji: EmojiData }];

  // Guilds
  guildCreate: [guild: Guild];
  guildUpdate: [guild: Guild];
  guildDelete: [data: { id: Snowflake }];

  // Members
  guildMemberAdd: [member: GuildMember & { guild_id: Snowflake }];
  guildMemberUpdate: [member: Partial<GuildMember> & { guild_id: Snowflake; user: User }];
  guildMemberRemove: [data: { guild_id: Snowflake; user: User }];

  // Roles
  guildRoleCreate: [data: { guild_id: Snowflake; role: Role }];
  guildRoleUpdate: [data: { guild_id: Snowflake; role: Role }];
  guildRoleUpdateBulk: [data: { guild_id: Snowflake; roles: Role[] }];
  guildRoleDelete: [data: { guild_id: Snowflake; role_id: Snowflake }];

  // Bans
  guildBanAdd: [data: { guild_id: Snowflake; user: User }];
  guildBanRemove: [data: { guild_id: Snowflake; user: User }];

  // Emojis & Stickers
  guildEmojisUpdate: [data: { guild_id: Snowflake; emojis: Emoji[] }];
  guildStickersUpdate: [data: { guild_id: Snowflake; stickers: Sticker[] }];

  // Channels
  channelCreate: [channel: Channel];
  channelUpdate: [channel: Channel];
  channelUpdateBulk: [channels: Channel[]];
  channelDelete: [channel: Channel];
  channelPinsUpdate: [data: { channel_id: Snowflake; guild_id?: Snowflake; last_pin_timestamp?: string | null }];

  // Invites
  inviteCreate: [data: { channel_id: Snowflake; guild_id?: Snowflake; code: string; inviter?: User }];
  inviteDelete: [data: { channel_id: Snowflake; guild_id?: Snowflake; code: string }];

  // Webhooks
  webhooksUpdate: [data: { guild_id: Snowflake; channel_id: Snowflake }];

  // Voice
  voiceStateUpdate: [state: VoiceState];
  voiceServerUpdate: [data: { guild_id: Snowflake; token: string; endpoint: string }];

  // Typing
  typingStart: [data: { channel_id: Snowflake; guild_id?: Snowflake; user_id: Snowflake; timestamp: number }];

  // User
  userUpdate: [user: User];

  // Presence
  presenceUpdate: [data: unknown];

  // System
  error: [error: Error];
  debug: [message: string];

  // Raw — for any unhandled event
  raw: [event: string, data: unknown];
}

// ─── Client Options ─────────────────────────────────────────────

export interface ClientOptions {
  /** Gateway intents bitmask. Use GatewayIntents or IntentsAll. */
  intents?: number;
  /** Base URL for REST API. Default: https://api.fluxer.app/v1 */
  apiBase?: string;
}

// ─── Client ─────────────────────────────────────────────────────

export class Client extends EventEmitter {
  rest: REST;
  user!: User;
  guilds = new Map<Snowflake, Guild>();
  channels = new Map<Snowflake, Channel>();

  private gateway: Gateway | null = null;
  private intents: number;
  private token = '';
  private destroyed = false;
  private readyEmitted = false;
  private readyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private options: ClientOptions = {}) {
    super();
    this.intents = options.intents ?? IntentsAll;
    this.rest = new REST({ token: '', baseUrl: options.apiBase });
  }

  /** Connect to the gateway and start receiving events. */
  async login(token: string): Promise<void> {
    // Clean up any existing connection
    this.gateway?.destroy();
    this.gateway = null;

    this.token = token;
    this.rest = new REST({ token, baseUrl: this.options.apiBase });

    const gatewayInfo = await this.rest.get<{ url: string }>(Routes.gatewayBot());

    // Check if destroy() was called during the REST fetch
    if (this.destroyed) return;

    this.gateway = new Gateway({ token, intents: this.intents, gatewayUrl: gatewayInfo.url });
    this.gateway.on('dispatch', (event: string, data: unknown) => this.handleEvent(event, data));
    this.gateway.on('error', (err: Error) => this.emit('error', err));
    this.gateway.on('debug', (msg: string) => this.emit('debug', msg));
    this.gateway.connect();
  }

  /** Disconnect from the gateway. */
  destroy(): void {
    this.destroyed = true;
    this.gateway?.destroy();
    this.gateway = null;
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
  }

  // ─── Event Handling ─────────────────────────────────────────

  private handleEvent(event: string, data: unknown): void {
    const d = data as Record<string, unknown>;

    switch (event) {
      // ── Session ──
      case 'READY': {
        const ready = d as unknown as { user: User; guilds: Array<{ id: Snowflake }> };
        this.user = ready.user;
        // Fluxer sends empty guilds in READY, then GUILD_CREATE for each.
        this.readyEmitted = false;
        // Clear any previous ready timeout (prevents double-fire on rapid reconnects)
        if (this.readyTimeout) clearTimeout(this.readyTimeout);
        this.readyTimeout = setTimeout(() => {
          this.readyTimeout = null;
          if (!this.readyEmitted) {
            this.readyEmitted = true;
            this.emit('ready', this.user, [...this.guilds.values()]);
          }
        }, 2000);
        break;
      }

      // ── Messages ──
      case 'MESSAGE_CREATE':
        this.emit('messageCreate', d as unknown as Message);
        break;
      case 'MESSAGE_UPDATE':
        this.emit('messageUpdate', d as unknown as ClientEvents['messageUpdate'][0]);
        break;
      case 'MESSAGE_DELETE':
        this.emit('messageDelete', d as unknown as ClientEvents['messageDelete'][0]);
        break;
      case 'MESSAGE_DELETE_BULK':
        this.emit('messageDeleteBulk', d as unknown as ClientEvents['messageDeleteBulk'][0]);
        break;

      // ── Reactions ──
      case 'MESSAGE_REACTION_ADD':
        this.emit('messageReactionAdd', d as unknown as ClientEvents['messageReactionAdd'][0]);
        break;
      case 'MESSAGE_REACTION_REMOVE':
        this.emit('messageReactionRemove', d as unknown as ClientEvents['messageReactionRemove'][0]);
        break;
      case 'MESSAGE_REACTION_REMOVE_ALL':
        this.emit('messageReactionRemoveAll', d as unknown as ClientEvents['messageReactionRemoveAll'][0]);
        break;
      case 'MESSAGE_REACTION_REMOVE_EMOJI':
        this.emit('messageReactionRemoveEmoji', d as unknown as ClientEvents['messageReactionRemoveEmoji'][0]);
        break;

      // ── Guilds ──
      case 'GUILD_CREATE': {
        const guild = normalizeGuild(d);
        this.guilds.set(guild.id, guild);
        const channels = (d as { channels?: Channel[] }).channels;
        if (channels) for (const ch of channels) this.channels.set(ch.id, ch);
        if (!this.readyEmitted) break;
        this.emit('guildCreate', guild);
        break;
      }
      case 'GUILD_UPDATE': {
        const guild = normalizeGuild(d);
        this.guilds.set(guild.id, guild);
        this.emit('guildUpdate', guild);
        break;
      }
      case 'GUILD_DELETE':
        this.guilds.delete((d as { id: Snowflake }).id);
        this.emit('guildDelete', d as { id: Snowflake });
        break;

      // ── Members ──
      case 'GUILD_MEMBER_ADD':
        this.emit('guildMemberAdd', d as unknown as ClientEvents['guildMemberAdd'][0]);
        break;
      case 'GUILD_MEMBER_UPDATE':
        this.emit('guildMemberUpdate', d as unknown as ClientEvents['guildMemberUpdate'][0]);
        break;
      case 'GUILD_MEMBER_REMOVE':
        this.emit('guildMemberRemove', d as unknown as ClientEvents['guildMemberRemove'][0]);
        break;

      // ── Roles ──
      case 'GUILD_ROLE_CREATE':
        this.emit('guildRoleCreate', d as unknown as ClientEvents['guildRoleCreate'][0]);
        break;
      case 'GUILD_ROLE_UPDATE':
        this.emit('guildRoleUpdate', d as unknown as ClientEvents['guildRoleUpdate'][0]);
        break;
      case 'GUILD_ROLE_UPDATE_BULK':
        this.emit('guildRoleUpdateBulk', d as unknown as ClientEvents['guildRoleUpdateBulk'][0]);
        break;
      case 'GUILD_ROLE_DELETE':
        this.emit('guildRoleDelete', d as unknown as ClientEvents['guildRoleDelete'][0]);
        break;

      // ── Bans ──
      case 'GUILD_BAN_ADD':
        this.emit('guildBanAdd', d as unknown as ClientEvents['guildBanAdd'][0]);
        break;
      case 'GUILD_BAN_REMOVE':
        this.emit('guildBanRemove', d as unknown as ClientEvents['guildBanRemove'][0]);
        break;

      // ── Emojis & Stickers ──
      case 'GUILD_EMOJIS_UPDATE':
        this.emit('guildEmojisUpdate', d as unknown as ClientEvents['guildEmojisUpdate'][0]);
        break;
      case 'GUILD_STICKERS_UPDATE':
        this.emit('guildStickersUpdate', d as unknown as ClientEvents['guildStickersUpdate'][0]);
        break;

      // ── Channels ──
      case 'CHANNEL_CREATE': {
        const ch = d as unknown as Channel;
        this.channels.set(ch.id, ch);
        this.emit('channelCreate', ch);
        break;
      }
      case 'CHANNEL_UPDATE': {
        const ch = d as unknown as Channel;
        this.channels.set(ch.id, ch);
        this.emit('channelUpdate', ch);
        break;
      }
      case 'CHANNEL_UPDATE_BULK':
        this.emit('channelUpdateBulk', d as unknown as Channel[]);
        break;
      case 'CHANNEL_DELETE': {
        const ch = d as unknown as Channel;
        this.channels.delete(ch.id);
        this.emit('channelDelete', ch);
        break;
      }
      case 'CHANNEL_PINS_UPDATE':
        this.emit('channelPinsUpdate', d as unknown as ClientEvents['channelPinsUpdate'][0]);
        break;

      // ── Invites ──
      case 'INVITE_CREATE':
        this.emit('inviteCreate', d as unknown as ClientEvents['inviteCreate'][0]);
        break;
      case 'INVITE_DELETE':
        this.emit('inviteDelete', d as unknown as ClientEvents['inviteDelete'][0]);
        break;

      // ── Webhooks ──
      case 'WEBHOOKS_UPDATE':
        this.emit('webhooksUpdate', d as unknown as ClientEvents['webhooksUpdate'][0]);
        break;

      // ── Voice ──
      case 'VOICE_STATE_UPDATE':
        this.emit('voiceStateUpdate', d as unknown as VoiceState);
        break;
      case 'VOICE_SERVER_UPDATE':
        this.emit('voiceServerUpdate', d as unknown as ClientEvents['voiceServerUpdate'][0]);
        break;

      // ── Typing ──
      case 'TYPING_START':
        this.emit('typingStart', d as unknown as ClientEvents['typingStart'][0]);
        break;

      // ── User ──
      case 'USER_UPDATE':
        this.emit('userUpdate', d as unknown as User);
        break;

      // ── Presence ──
      case 'PRESENCE_UPDATE':
        this.emit('presenceUpdate', d);
        break;

      // ── Catch-all ──
      default:
        this.emit('raw', event, d);
        break;
    }
  }

  // ─── Messages ─────────────────────────────────────────────────

  /** Send a message to a channel. */
  async sendMessage(channelId: Snowflake, content: string | MessageSendOptions): Promise<Message> {
    const body = typeof content === 'string' ? { content } : content;
    const files = typeof content === 'object' ? content.files : undefined;
    return this.rest.post<Message>(Routes.channelMessages(channelId), { body, files });
  }

  /** Reply to a message (shows as reply in client). */
  async replyTo(message: Message, content: string | MessageSendOptions): Promise<Message> {
    const body = typeof content === 'string' ? { content } : { ...content };
    const files = typeof content === 'object' ? content.files : undefined;
    (body as Record<string, unknown>).message_reference = {
      channel_id: message.channel_id,
      message_id: message.id,
      guild_id: message.guild_id,
    };
    return this.rest.post<Message>(Routes.channelMessages(message.channel_id), { body, files });
  }

  /** Edit a message. */
  async editMessage(channelId: Snowflake, messageId: Snowflake, content: string | { content?: string; embeds?: Embed[] }): Promise<Message> {
    const body = typeof content === 'string' ? { content } : content;
    return this.rest.patch<Message>(Routes.channelMessage(channelId, messageId), { body });
  }

  /** Delete a message. */
  async deleteMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channelMessage(channelId, messageId));
  }

  /** Bulk delete messages (1-100 messages, max 14 days old). Gracefully handles single messages. */
  async bulkDelete(channelId: Snowflake, messageIds: Snowflake[]): Promise<void> {
    if (messageIds.length === 0) return;
    if (messageIds.length === 1) {
      await this.rest.delete(Routes.channelMessage(channelId, messageIds[0]));
      return;
    }
    await this.rest.post(Routes.channelBulkDelete(channelId), { body: { message_ids: messageIds } });
  }

  /** Fetch channel messages. */
  async fetchMessages(channelId: Snowflake, options?: { limit?: number; before?: Snowflake; after?: Snowflake; around?: Snowflake }): Promise<Message[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.before) params.set('before', options.before);
    if (options?.after) params.set('after', options.after);
    if (options?.around) params.set('around', options.around);
    const qs = params.toString();
    return this.rest.get<Message[]>(`${Routes.channelMessages(channelId)}${qs ? `?${qs}` : ''}`);
  }

  /** Fetch a single message. */
  async fetchMessage(channelId: Snowflake, messageId: Snowflake): Promise<Message> {
    return this.rest.get<Message>(Routes.channelMessage(channelId, messageId));
  }

  /** Send typing indicator. */
  async sendTyping(channelId: Snowflake): Promise<void> {
    await this.rest.post(Routes.channelTyping(channelId));
  }

  // ─── Reactions ────────────────────────────────────────────────

  /** React to a message. */
  async react(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.rest.put(Routes.channelMessageReactionMe(channelId, messageId, emoji));
  }

  /** Remove own reaction from a message. */
  async unreact(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.rest.delete(Routes.channelMessageReactionMe(channelId, messageId, emoji));
  }

  /** Remove another user's reaction. */
  async removeReaction(channelId: Snowflake, messageId: Snowflake, emoji: string, userId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channelMessageReactionUser(channelId, messageId, emoji, userId));
  }

  /** Remove all reactions for a specific emoji. */
  async removeAllReactionsForEmoji(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.rest.delete(Routes.channelMessageReaction(channelId, messageId, emoji));
  }

  /** Remove all reactions from a message. */
  async removeAllReactions(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channelMessageReactions(channelId, messageId));
  }

  /** Fetch users who reacted with a specific emoji. */
  async fetchReactions(channelId: Snowflake, messageId: Snowflake, emoji: string, options?: { limit?: number; after?: Snowflake }): Promise<User[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.after) params.set('after', options.after);
    const qs = params.toString();
    return this.rest.get<User[]>(`${Routes.channelMessageReaction(channelId, messageId, emoji)}${qs ? `?${qs}` : ''}`);
  }

  // ─── Pins ─────────────────────────────────────────────────────

  /** Pin a message. */
  async pinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    await this.rest.put(Routes.channelPin(channelId, messageId));
  }

  /** Unpin a message. */
  async unpinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channelPin(channelId, messageId));
  }

  /** Fetch pinned messages. */
  async fetchPinnedMessages(channelId: Snowflake): Promise<PinnedMessage[]> {
    const data = await this.rest.get<{ items: PinnedMessage[]; has_more: boolean }>(Routes.channelPins(channelId));
    return data.items;
  }

  // ─── Channels ─────────────────────────────────────────────────

  /** Fetch a channel. */
  async fetchChannel(channelId: Snowflake): Promise<Channel> {
    return this.rest.get<Channel>(Routes.channel(channelId));
  }

  /** Create a channel in a guild. */
  async createChannel(guildId: Snowflake, options: { name: string; type?: number; topic?: string; parent_id?: Snowflake; position?: number; nsfw?: boolean; bitrate?: number; user_limit?: number; rate_limit_per_user?: number; permission_overwrites?: PermissionOverwrite[] }): Promise<Channel> {
    return this.rest.post<Channel>(Routes.guildChannels(guildId), { body: options });
  }

  /** Edit a channel. */
  async editChannel(channelId: Snowflake, options: { name?: string; topic?: string; position?: number; nsfw?: boolean; bitrate?: number; user_limit?: number; rate_limit_per_user?: number; parent_id?: Snowflake | null; permission_overwrites?: PermissionOverwrite[] }): Promise<Channel> {
    return this.rest.patch<Channel>(Routes.channel(channelId), { body: options });
  }

  /** Delete a channel. */
  async deleteChannel(channelId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channel(channelId));
  }

  /** Edit channel permission overwrite. */
  async editPermission(channelId: Snowflake, overwriteId: Snowflake, options: { type: number; allow?: string; deny?: string }): Promise<void> {
    await this.rest.put(Routes.channelPermission(channelId, overwriteId), { body: options });
  }

  /** Delete channel permission overwrite. */
  async deletePermission(channelId: Snowflake, overwriteId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.channelPermission(channelId, overwriteId));
  }

  /** Fetch guild channels. */
  async fetchGuildChannels(guildId: Snowflake): Promise<Channel[]> {
    return this.rest.get<Channel[]>(Routes.guildChannels(guildId));
  }

  // ─── Guilds ───────────────────────────────────────────────────

  /** Fetch a guild. */
  async fetchGuild(guildId: Snowflake): Promise<Guild> {
    const data = await this.rest.get<Record<string, unknown>>(Routes.guild(guildId));
    return normalizeGuild(data);
  }

  /** Edit guild settings. */
  async editGuild(guildId: Snowflake, options: Record<string, unknown>): Promise<Guild> {
    const data = await this.rest.patch<Record<string, unknown>>(Routes.guild(guildId), { body: options });
    return normalizeGuild(data);
  }

  /** Leave a guild. */
  async leaveGuild(guildId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.leaveGuild(guildId));
  }

  /** Fetch guild audit log. */
  async fetchAuditLog(guildId: Snowflake, options?: { user_id?: Snowflake; action_type?: number; before?: Snowflake; limit?: number }): Promise<{ audit_log_entries: AuditLogEntry[] }> {
    const params = new URLSearchParams();
    if (options?.user_id) params.set('user_id', options.user_id);
    if (options?.action_type != null) params.set('action_type', String(options.action_type));
    if (options?.before) params.set('before', options.before);
    if (options?.limit) params.set('limit', String(options.limit));
    const qs = params.toString();
    return this.rest.get(`${Routes.guildAuditLogs(guildId)}${qs ? `?${qs}` : ''}`);
  }

  /** Fetch guild vanity URL. */
  async fetchVanityUrl(guildId: Snowflake): Promise<{ code: string | null; uses: number }> {
    return this.rest.get(Routes.guildVanityUrl(guildId));
  }

  // ─── Members ──────────────────────────────────────────────────

  /** Fetch guild members. */
  async fetchMembers(guildId: Snowflake, options?: { limit?: number; after?: Snowflake }): Promise<GuildMember[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.after) params.set('after', options.after);
    const qs = params.toString();
    return this.rest.get<GuildMember[]>(`${Routes.guildMembers(guildId)}${qs ? `?${qs}` : ''}`);
  }

  /** Fetch a single guild member. */
  async fetchMember(guildId: Snowflake, userId: Snowflake): Promise<GuildMember> {
    return this.rest.get<GuildMember>(Routes.guildMember(guildId, userId));
  }

  /** Edit a guild member. */
  async editMember(guildId: Snowflake, userId: Snowflake, options: { nick?: string | null; roles?: Snowflake[]; mute?: boolean; deaf?: boolean; communication_disabled_until?: string | null }): Promise<GuildMember> {
    return this.rest.patch<GuildMember>(Routes.guildMember(guildId, userId), { body: options });
  }

  /** Kick a member from a guild. */
  async kickMember(guildId: Snowflake, userId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildMember(guildId, userId));
  }

  /** Set bot nickname in a guild. */
  async setNickname(guildId: Snowflake, nickname: string | null): Promise<void> {
    await this.rest.patch(Routes.guildMemberMe(guildId), { body: { nick: nickname } });
  }

  /** Search guild members by username/nickname. */
  async searchMembers(guildId: Snowflake, query: string, options?: { limit?: number }): Promise<GuildMember[]> {
    const params = new URLSearchParams({ query });
    if (options?.limit) params.set('limit', String(options.limit));
    return this.rest.get<GuildMember[]>(`${Routes.guildMemberSearch(guildId)}?${params}`);
  }

  // ─── Roles ────────────────────────────────────────────────────

  /** Fetch guild roles. */
  async fetchRoles(guildId: Snowflake): Promise<Role[]> {
    return this.rest.get<Role[]>(Routes.guildRoles(guildId));
  }

  /** Create a guild role. */
  async createRole(guildId: Snowflake, options?: { name?: string; permissions?: string; color?: number; hoist?: boolean; mentionable?: boolean; unicode_emoji?: string }): Promise<Role> {
    return this.rest.post<Role>(Routes.guildRoles(guildId), { body: options ?? {} });
  }

  /** Edit a guild role. */
  async editRole(guildId: Snowflake, roleId: Snowflake, options: { name?: string; permissions?: string; color?: number; hoist?: boolean; mentionable?: boolean; unicode_emoji?: string | null }): Promise<Role> {
    return this.rest.patch<Role>(Routes.guildRole(guildId, roleId), { body: options });
  }

  /** Delete a guild role. */
  async deleteRole(guildId: Snowflake, roleId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildRole(guildId, roleId));
  }

  /** Add a role to a member. */
  async addRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
    await this.rest.put(Routes.guildMemberRole(guildId, userId, roleId));
  }

  /** Remove a role from a member. */
  async removeRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId));
  }

  // ─── Bans ─────────────────────────────────────────────────────

  /** Ban a member from a guild. */
  async banMember(guildId: Snowflake, userId: Snowflake, options?: { reason?: string; delete_message_days?: number; ban_duration_seconds?: number }): Promise<void> {
    await this.rest.put(Routes.guildBan(guildId, userId), { body: options ?? {} });
  }

  /** Unban a user from a guild. */
  async unbanMember(guildId: Snowflake, userId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildBan(guildId, userId));
  }

  /** Fetch guild bans. */
  async fetchBans(guildId: Snowflake): Promise<GuildBan[]> {
    return this.rest.get<GuildBan[]>(Routes.guildBans(guildId));
  }

  // ─── Emojis ───────────────────────────────────────────────────

  /** Fetch guild emojis. */
  async fetchEmojis(guildId: Snowflake): Promise<Emoji[]> {
    return this.rest.get<Emoji[]>(Routes.guildEmojis(guildId));
  }

  /** Create a guild emoji. */
  async createEmoji(guildId: Snowflake, options: { name: string; image: string }): Promise<Emoji> {
    return this.rest.post<Emoji>(Routes.guildEmojis(guildId), { body: options });
  }

  /** Edit a guild emoji. */
  async editEmoji(guildId: Snowflake, emojiId: Snowflake, options: { name?: string }): Promise<Emoji> {
    return this.rest.patch<Emoji>(Routes.guildEmoji(guildId, emojiId), { body: options });
  }

  /** Delete a guild emoji. */
  async deleteEmoji(guildId: Snowflake, emojiId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildEmoji(guildId, emojiId));
  }

  // ─── Stickers ─────────────────────────────────────────────────

  /** Fetch guild stickers. */
  async fetchStickers(guildId: Snowflake): Promise<Sticker[]> {
    return this.rest.get<Sticker[]>(Routes.guildStickers(guildId));
  }

  /** Create a guild sticker. */
  async createSticker(guildId: Snowflake, options: { name: string; description: string; tags: string; file: { name: string; data: Buffer | ArrayBuffer } }): Promise<Sticker> {
    return this.rest.post<Sticker>(Routes.guildStickers(guildId), {
      body: { name: options.name, description: options.description, tags: options.tags },
      files: [options.file],
    });
  }

  /** Edit a guild sticker. */
  async editSticker(guildId: Snowflake, stickerId: Snowflake, options: { name?: string; description?: string; tags?: string }): Promise<Sticker> {
    return this.rest.patch<Sticker>(Routes.guildSticker(guildId, stickerId), { body: options });
  }

  /** Delete a guild sticker. */
  async deleteSticker(guildId: Snowflake, stickerId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.guildSticker(guildId, stickerId));
  }

  // ─── Invites ──────────────────────────────────────────────────

  /** Create a channel invite. */
  async createInvite(channelId: Snowflake, options?: { max_age?: number; max_uses?: number; temporary?: boolean }): Promise<GuildInvite> {
    return this.rest.post<GuildInvite>(Routes.channelInvites(channelId), { body: options ?? {} });
  }

  /** Fetch invites for a channel. */
  async fetchChannelInvites(channelId: Snowflake): Promise<GuildInviteMetadata[]> {
    return this.rest.get<GuildInviteMetadata[]>(Routes.channelInvites(channelId));
  }

  /** Fetch invites for a guild. */
  async fetchGuildInvites(guildId: Snowflake): Promise<GuildInviteMetadata[]> {
    return this.rest.get<GuildInviteMetadata[]>(Routes.guildInvites(guildId));
  }

  /** Fetch an invite by code. */
  async fetchInvite(code: string): Promise<GuildInvite> {
    return this.rest.get<GuildInvite>(Routes.invite(code));
  }

  /** Delete an invite by code. */
  async deleteInvite(code: string): Promise<void> {
    await this.rest.delete(Routes.invite(code));
  }

  // ─── Webhooks ─────────────────────────────────────────────────

  /** Create a webhook in a channel. */
  async createWebhook(channelId: Snowflake, options: { name: string; avatar?: string | null }): Promise<Webhook> {
    return this.rest.post<Webhook>(Routes.channelWebhooks(channelId), { body: options });
  }

  /** Fetch a webhook. */
  async fetchWebhook(webhookId: Snowflake): Promise<Webhook> {
    return this.rest.get<Webhook>(Routes.webhook(webhookId));
  }

  /** Edit a webhook. */
  async editWebhook(webhookId: Snowflake, options: { name?: string; avatar?: string | null; channel_id?: Snowflake }): Promise<Webhook> {
    return this.rest.patch<Webhook>(Routes.webhook(webhookId), { body: options });
  }

  /** Delete a webhook. */
  async deleteWebhook(webhookId: Snowflake): Promise<void> {
    await this.rest.delete(Routes.webhook(webhookId));
  }

  /** Execute a webhook. Returns the message if `wait` is true. */
  async executeWebhook(webhookId: Snowflake, token: string, content: string | WebhookSendOptions, options?: { wait?: boolean }): Promise<Message | void> {
    const body = typeof content === 'string' ? { content } : content;
    const files = typeof content === 'object' ? content.files : undefined;
    const qs = options?.wait ? '?wait=true' : '';
    const result = await this.rest.post<Message>(Routes.webhookExecute(webhookId, token) + qs, { body, files });
    return options?.wait ? result : undefined;
  }

  /** Fetch channel webhooks. */
  async fetchChannelWebhooks(channelId: Snowflake): Promise<Webhook[]> {
    return this.rest.get<Webhook[]>(Routes.channelWebhooks(channelId));
  }

  /** Fetch guild webhooks. */
  async fetchGuildWebhooks(guildId: Snowflake): Promise<Webhook[]> {
    return this.rest.get<Webhook[]>(Routes.guildWebhooks(guildId));
  }

  // ─── Users ────────────────────────────────────────────────────

  /** Fetch a user by ID. */
  async fetchUser(userId: Snowflake): Promise<User> {
    return this.rest.get<User>(Routes.user(userId));
  }

  /** Create a DM channel with a user. */
  async createDM(userId: Snowflake): Promise<Channel> {
    return this.rest.post<Channel>(Routes.currentUserChannels(), { body: { recipient_id: userId } });
  }

  // ─── Typed Event Emitter ──────────────────────────────────────

  override on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
  override on(event: string, listener: (...args: unknown[]) => void): this;
  override on(event: string, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  override once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
  override once(event: string, listener: (...args: unknown[]) => void): this;
  override once(event: string, listener: (...args: unknown[]) => void): this {
    return super.once(event, listener);
  }

  override emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
  override emit(event: string, ...args: unknown[]): boolean;
  override emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }
}
