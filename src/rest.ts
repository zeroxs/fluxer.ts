/** Lightweight REST client for the Fluxer API. Built on native fetch. */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const API_BASE = 'https://api.fluxer.app/v1';
const PKG_VERSION = (() => {
  try {
    const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf-8')).version;
  } catch {
    return 'unknown';
  }
})();
const USER_AGENT = `fluxer.ts (https://github.com/zeroxs/fluxer.ts, ${PKG_VERSION})`;

export class FluxerAPIError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    public readonly method: string,
    public readonly path: string,
  ) {
    super(`${method} ${path} → ${status}`);
    this.name = 'FluxerAPIError';
  }
}

export class RateLimitError extends Error {
  constructor(
    public readonly retryAfter: number,
    public readonly method: string,
    public readonly path: string,
    public readonly global: boolean = false,
  ) {
    super(`Rate limited on ${method} ${path} — retry after ${retryAfter}ms`);
    this.name = 'RateLimitError';
  }
}

export interface RESTOptions {
  token: string;
  baseUrl?: string;
  maxRetries?: number;
}

export class REST {
  private token: string;
  private baseUrl: string;
  private maxRetries: number;

  constructor(options: RESTOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl ?? API_BASE;
    this.maxRetries = options.maxRetries ?? 3;
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request('GET', path);
  }

  async post<T = unknown>(path: string, options?: { body?: unknown; files?: Array<{ name: string; data: Buffer | ArrayBuffer; filename?: string }> }): Promise<T> {
    return this.request('POST', path, options);
  }

  async patch<T = unknown>(path: string, options?: { body?: unknown; files?: Array<{ name: string; data: Buffer | ArrayBuffer; filename?: string }> }): Promise<T> {
    return this.request('PATCH', path, options);
  }

  async put<T = unknown>(path: string, options?: { body?: unknown }): Promise<T> {
    return this.request('PUT', path, options);
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request('DELETE', path);
  }

  private async request<T>(method: string, path: string, options?: { body?: unknown; files?: Array<{ name: string; data: Buffer | ArrayBuffer; filename?: string }> }): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const headers: Record<string, string> = {
        'Authorization': `Bot ${this.token}`,
        'User-Agent': USER_AGENT,
      };

      let body: string | FormData | undefined;

      if (options?.files?.length) {
        // Multipart form data for file uploads
        const form = new FormData();
        if (options.body) {
          form.append('payload_json', new Blob([JSON.stringify(options.body)], { type: 'application/json' }));
        }
        for (let i = 0; i < options.files.length; i++) {
          const f = options.files[i];
          const blob = new Blob([f.data]);
          form.append(`files[${i}]`, blob, f.filename ?? f.name);
        }
        body = form;
        // Don't set Content-Type — fetch sets it with boundary for FormData
      } else if (options?.body) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(options.body);
      }

      const res = await fetch(url, { method, headers, body });

      // Rate limited
      if (res.status === 429) {
        const retryAfter = parseFloat(res.headers.get('retry-after') ?? '1') * 1000;
        if (attempt < this.maxRetries) {
          await sleep(retryAfter + jitter());
          continue;
        }
        throw new RateLimitError(retryAfter, method, path);
      }

      // Server error — retry with exponential backoff
      if (res.status >= 500 && attempt < this.maxRetries) {
        await sleep(1000 * Math.pow(2, attempt) + jitter());
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        let errBody: unknown;
        try { errBody = JSON.parse(text); } catch { errBody = text; }
        throw new FluxerAPIError(res.status, errBody, method, path);
      }

      // 204 No Content
      if (res.status === 204) return undefined as T;

      return res.json() as Promise<T>;
    }

    throw new Error(`Max retries exceeded for ${method} ${path}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(): number {
  return Math.random() * 500;
}
