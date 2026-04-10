/** WebSocket gateway client for Fluxer. Handles connection, heartbeat, resume, and reconnection. */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { GatewayOpcode, type GatewayPayload } from './types.js';

const GATEWAY_VERSION = 1;
const RECONNECT_INITIAL = 1000;
const RECONNECT_MAX = 45000;

export interface GatewayOptions {
  token: string;
  intents: number;
  gatewayUrl: string;
}

export class Gateway extends EventEmitter {
  private ws: WebSocket | null = null;
  private token: string;
  private intents: number;
  private gatewayUrl: string;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatJitterTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatAck = true;
  private sessionId: string | null = null;
  private seq: number | null = null;
  private resumeUrl: string | null = null;
  private destroying = false;
  private reconnecting = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = RECONNECT_INITIAL;

  constructor(options: GatewayOptions) {
    super();
    this.token = options.token;
    this.intents = options.intents;
    this.gatewayUrl = options.gatewayUrl;
  }

  connect(): void {
    this.reconnecting = false;
    const url = this.resumeUrl ?? this.gatewayUrl;
    const fullUrl = `${url}?v=${GATEWAY_VERSION}&encoding=json`;

    this.ws = new WebSocket(fullUrl);
    this.ws.on('open', () => this.emit('debug', `Connected to ${url}`));
    this.ws.on('message', (data: WebSocket.RawData) => this.onMessage(data));
    this.ws.on('close', (code: number, reason: Buffer) => this.onClose(code, reason.toString()));
    this.ws.on('error', (err: Error) => this.emit('error', err));
  }

  destroy(): void {
    this.destroying = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close(1000);
      this.ws = null;
    }
  }

  private onMessage(raw: WebSocket.RawData): void {
    let payload: GatewayPayload;
    try {
      payload = JSON.parse(raw.toString());
    } catch (err) {
      this.emit('debug', `Failed to parse gateway message: ${err}`);
      return;
    }

    if (payload.s != null) this.seq = payload.s;

    switch (payload.op) {
      case GatewayOpcode.Hello: {
        const interval = (payload.d as { heartbeat_interval: number }).heartbeat_interval;
        this.emit('debug', `Hello received, heartbeat interval: ${interval}ms`);
        this.startHeartbeat(interval);
        if (this.sessionId) {
          this.emit('debug', 'Resuming session');
          this.resume();
        } else {
          this.emit('debug', 'Identifying');
          this.identify();
        }
        break;
      }

      case GatewayOpcode.HeartbeatAck:
        this.heartbeatAck = true;
        this.emit('debug', 'Heartbeat acknowledged');
        break;

      case GatewayOpcode.Heartbeat:
        this.sendHeartbeat();
        break;

      case GatewayOpcode.Dispatch:
        this.handleDispatch(payload.t!, payload.d);
        break;

      case GatewayOpcode.Reconnect:
        this.emit('debug', 'Server requested reconnect');
        this.reconnect();
        break;

      case GatewayOpcode.InvalidSession:
        this.emit('debug', `Invalid session (resumable: ${payload.d})`);
        if (payload.d) {
          setTimeout(() => this.resume(), 1000 + Math.random() * 4000);
        } else {
          this.sessionId = null;
          this.seq = null;
          this.resumeUrl = null;
          setTimeout(() => this.identify(), 1000 + Math.random() * 4000);
        }
        break;
    }
  }

  private handleDispatch(event: string, data: unknown): void {
    if (event === 'READY') {
      const ready = data as { session_id: string; resume_gateway_url?: string; user: unknown; guilds: unknown[] };
      this.sessionId = ready.session_id;
      this.resumeUrl = ready.resume_gateway_url ?? null;
      this.reconnectDelay = RECONNECT_INITIAL;
    }

    if (event === 'RESUMED') {
      this.reconnectDelay = RECONNECT_INITIAL;
      this.emit('debug', 'Session resumed');
    }

    this.emit('dispatch', event, data);
  }

  private identify(): void {
    this.send({
      op: GatewayOpcode.Identify,
      d: {
        token: this.token,
        intents: this.intents,
        properties: {
          os: process.platform,
          browser: 'fluxer-sdk',
          device: 'fluxer-sdk',
        },
      },
      s: null,
      t: null,
    });
  }

  private resume(): void {
    this.send({
      op: GatewayOpcode.Resume,
      d: {
        token: this.token,
        session_id: this.sessionId,
        seq: this.seq,
      },
      s: null,
      t: null,
    });
  }

  private send(payload: GatewayPayload): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private sendHeartbeat(): void {
    const seq = this.seq ?? null;
    this.emit('debug', `Heartbeat sent (seq: ${seq})`);
    this.send({ op: GatewayOpcode.Heartbeat, d: seq, s: null, t: null });
  }

  private startHeartbeat(interval: number): void {
    this.stopHeartbeat();
    this.heartbeatAck = true;
    // Send first heartbeat with jitter
    this.heartbeatJitterTimeout = setTimeout(() => {
      this.heartbeatJitterTimeout = null;
      this.sendHeartbeat();
    }, interval * Math.random());
    this.heartbeatTimer = setInterval(() => {
      if (!this.heartbeatAck) {
        this.emit('debug', 'Heartbeat not acknowledged — reconnecting');
        this.reconnect();
        return;
      }
      this.heartbeatAck = false;
      this.sendHeartbeat();
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatJitterTimeout) {
      clearTimeout(this.heartbeatJitterTimeout);
      this.heartbeatJitterTimeout = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private onClose(code: number, reason: string): void {
    this.stopHeartbeat();
    this.emit('debug', `Connection closed: ${code} ${reason}`);

    if (this.destroying) return;

    // Non-recoverable close codes
    const fatal = [4004, 4010, 4011, 4012, 4013, 4014];
    if (fatal.includes(code)) {
      this.emit('error', new Error(`Fatal gateway close: ${code} ${reason}`));
      return;
    }

    // Invalid resume — clear session so next connect does a fresh identify
    if (code === 4002 || code === 4007) {
      this.sessionId = null;
      this.seq = null;
      this.resumeUrl = null;
    }

    this.reconnect();
  }

  private reconnect(): void {
    if (this.reconnecting || this.destroying) return;
    this.reconnecting = true;

    this.stopHeartbeat();
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close(4000);
      this.ws = null;
    }

    const delay = this.reconnectDelay + Math.random() * 1000;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, RECONNECT_MAX);

    this.emit('debug', `Reconnecting in ${Math.round(delay)}ms`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }
}
