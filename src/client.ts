/** High-level Fluxer client — ties REST and Gateway together with a clean event API. */

import { EventEmitter } from 'events';
import { REST } from './rest.js';
import { Gateway } from './gateway.js';
import { Routes } from './routes.js';
import type {
  Snowflake, User, Guild, GuildMember, Channel, Message,
  MessageSendOptions, Embed, Role,
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
    owner_id: (props.owner_id ?? '') as Snowflake,
    system_channel_id: (props.system_channel_id ?? null) as Snowflake | null,
    rules_channel_id: (props.rules_channel_id ?? null) as Snowflake | null,
    afk_channel_id: (props.afk_channel_id ?? null) as Snowflake | null,
    afk_timeout: (props.afk_timeout ?? 0) as number,
    features: (props.features ?? []) as string[],
    verification_level: (props.verification_level ?? 0) as number,
    mfa_level: (props.mfa_level ?? 0) as number,
    nsfw_level: (props.nsfw_level ?? 0) as number,
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

export interface ClientEvents {
  ready: [user: User, guilds: Guild[]];
  messageCreate: [message: Message];
  messageUpdate: [message: Partial<Message> & { id: Snowflake; channel_id: Snowflake }];
  messageDelete: [data: { id: Snowflake; channel_id: Snowflake; guild_id?: Snowflake }];
  // interactionCreate: [interaction: Interaction]; // Not yet supported by Fluxer
  guildCreate: [guild: Guild];
  guildUpdate: [guild: Guild];
  guildDelete: [data: { id: Snowflake }];
  guildMemberAdd: [member: GuildMember & { guild_id: Snowflake }];
  guildMemberUpdate: [member: Partial<GuildMember> & { guild_id: Snowflake; user: User }];
  guildMemberRemove: [data: { guild_id: Snowflake; user: User }];
  channelCreate: [channel: Channel];
  channelUpdate: [channel: Channel];
  channelDelete: [channel: Channel];
  messageReactionAdd: [data: { user_id: Snowflake; channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake; emoji: { id: Snowflake | null; name: string } }];
  messageReactionRemove: [data: { user_id: Snowflake; channel_id: Snowflake; message_id: Snowflake; guild_id?: Snowflake; emoji: { id: Snowflake | null; name: string } }];
  typingStart: [data: { channel_id: Snowflake; guild_id?: Snowflake; user_id: Snowflake; timestamp: number }];
  presenceUpdate: [data: unknown];
  error: [error: Error];
  debug: [message: string];
}

// ─── Client Options ─────────────────────────────────────────────

export interface ClientOptions {
  /** Gateway intents bitmask. Use GatewayIntents or IntentsAll. */
  intents?: number;
  /** Base URL for REST API. Default: https://api.fluxer.gg/v1 */
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
  private pendingGuilds: Set<Snowflake> | null = null;
  private readyEmitted = false;

  constructor(private options: ClientOptions = {}) {
    super();
    this.intents = options.intents ?? IntentsAll;
    this.rest = new REST({ token: '', baseUrl: options.apiBase });
  }

  /** Connect to the gateway and start receiving events. */
  async login(token: string): Promise<void> {
    this.token = token;
    this.rest = new REST({ token, baseUrl: this.options.apiBase });

    // Get gateway URL
    const gatewayInfo = await this.rest.get<{ url: string }>(Routes.gatewayBot());
    const gatewayUrl = gatewayInfo.url;

    this.gateway = new Gateway({ token, intents: this.intents, gatewayUrl });
    this.gateway.on('dispatch', (event: string, data: unknown) => this.handleEvent(event, data));
    this.gateway.on('error', (err: Error) => this.emit('error', err));
    this.gateway.on('debug', (msg: string) => this.emit('debug', msg));
    this.gateway.connect();
  }

  /** Disconnect from the gateway. */
  destroy(): void {
    this.gateway?.destroy();
  }

  // ─── Event Handling ─────────────────────────────────────────

  private handleEvent(event: string, data: unknown): void {
    const d = data as Record<string, unknown>;

    switch (event) {
      case 'READY': {
        const ready = d as unknown as { user: User; guilds: Array<{ id: Snowflake }> };
        this.user = ready.user;
        // Fluxer sends READY with guild stubs, then GUILD_CREATE for each.
        // Wait briefly for GUILD_CREATE events before emitting ready.
        // Fluxer sends empty guilds array in READY, guilds come via GUILD_CREATE.
        // Wait for GUILD_CREATE events before emitting ready.
        this.pendingGuilds = new Set();
        this.readyEmitted = false;
        // Emit ready after a short delay to collect GUILD_CREATE events
        setTimeout(() => {
          if (!this.readyEmitted) {
            this.readyEmitted = true;
            this.pendingGuilds = null;
            this.emit('ready', this.user, [...this.guilds.values()]);
          }
        }, 2000);
        break;
      }
      case 'MESSAGE_CREATE':
        this.emit('messageCreate', d as unknown as Message);
        break;
      case 'MESSAGE_UPDATE':
        this.emit('messageUpdate', d as unknown as Partial<Message> & { id: Snowflake; channel_id: Snowflake });
        break;
      case 'MESSAGE_DELETE':
        this.emit('messageDelete', d as unknown as { id: Snowflake; channel_id: Snowflake; guild_id?: Snowflake });
        break;
      // INTERACTION_CREATE — not yet supported by Fluxer
      case 'GUILD_CREATE': {
        const guild = normalizeGuild(d);
        this.guilds.set(guild.id, guild);
        // Cache channels from guild payload
        const channels = (d as { channels?: Channel[] }).channels;
        if (channels) for (const ch of channels) this.channels.set(ch.id, ch);
        // During initial load, don't emit guildCreate — ready will fire with all guilds
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
      case 'GUILD_MEMBER_ADD':
        this.emit('guildMemberAdd', d as unknown as GuildMember & { guild_id: Snowflake });
        break;
      case 'GUILD_MEMBER_UPDATE':
        this.emit('guildMemberUpdate', d as unknown as Partial<GuildMember> & { guild_id: Snowflake; user: User });
        break;
      case 'GUILD_MEMBER_REMOVE':
        this.emit('guildMemberRemove', d as unknown as { guild_id: Snowflake; user: User });
        break;
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
      case 'CHANNEL_DELETE': {
        const ch = d as unknown as Channel;
        this.channels.delete(ch.id);
        this.emit('channelDelete', ch);
        break;
      }
      case 'MESSAGE_REACTION_ADD':
        this.emit('messageReactionAdd', d as unknown as ClientEvents['messageReactionAdd'][0]);
        break;
      case 'MESSAGE_REACTION_REMOVE':
        this.emit('messageReactionRemove', d as unknown as ClientEvents['messageReactionRemove'][0]);
        break;
      case 'TYPING_START':
        this.emit('typingStart', d as unknown as ClientEvents['typingStart'][0]);
        break;
      case 'PRESENCE_UPDATE':
        this.emit('presenceUpdate', d);
        break;
    }
  }

  // ─── Convenience Methods ──────────────────────────────────────

  /** Send a message to a channel. */
  async sendMessage(channelId: Snowflake, content: string | MessageSendOptions): Promise<Message> {
    const body = typeof content === 'string' ? { content } : content;
    const files = typeof content === 'object' ? content.files : undefined;
    return this.rest.post<Message>(Routes.channelMessages(channelId), { body, files });
  }

  /** Reply to a message (shows as reply in client). */
  async replyTo(message: Message, content: string | MessageSendOptions): Promise<Message> {
    const body = typeof content === 'string' ? { content } : { ...content };
    (body as Record<string, unknown>).message_reference = {
      channel_id: message.channel_id,
      message_id: message.id,
      guild_id: message.guild_id,
    };
    return this.rest.post<Message>(Routes.channelMessages(message.channel_id), { body });
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

  /** Send typing indicator. */
  async sendTyping(channelId: Snowflake): Promise<void> {
    await this.rest.post(Routes.channelTyping(channelId));
  }

  /** React to a message. */
  async react(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.rest.put(`${Routes.channelMessageReaction(channelId, messageId, emoji)}/@me`);
  }

  /** Fetch guild members. */
  async fetchMembers(guildId: Snowflake, limit = 100): Promise<GuildMember[]> {
    return this.rest.get<GuildMember[]>(`${Routes.guildMembers(guildId)}?limit=${limit}`);
  }

  /** Fetch guild roles. */
  async fetchRoles(guildId: Snowflake): Promise<Role[]> {
    return this.rest.get<Role[]>(Routes.guildRoles(guildId));
  }

  /** Fetch channel messages. */
  async fetchMessages(channelId: Snowflake, options?: { limit?: number; before?: Snowflake; after?: Snowflake }): Promise<Message[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.before) params.set('before', options.before);
    if (options?.after) params.set('after', options.after);
    const qs = params.toString();
    return this.rest.get<Message[]>(`${Routes.channelMessages(channelId)}${qs ? `?${qs}` : ''}`);
  }

  // Interactions/slash commands — not yet supported by Fluxer.
  // Methods will be added when the platform supports them.

  /** Set bot nickname in a guild. */
  async setNickname(guildId: Snowflake, nickname: string | null): Promise<void> {
    await this.rest.patch(Routes.guildMember(guildId, '@me'), { body: { nick: nickname } });
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
