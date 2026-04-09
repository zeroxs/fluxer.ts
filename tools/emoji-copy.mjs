#!/usr/bin/env node

/**
 * Copy emojis from a Discord server to a Fluxer server.
 * Usage: node emoji-copy.mjs <discord_guild_id> <fluxer_guild_id>
 */

import { readFileSync } from 'fs';
import { homedir } from 'os';

const config = JSON.parse(readFileSync(`${homedir()}/.animus-bot/config.json`, 'utf8'));
const DISCORD_TOKEN = config.token;
const FLUXER_TOKEN = config.fluxer_vigil?.token || config.fluxer?.token;

if (!DISCORD_TOKEN || !FLUXER_TOKEN) {
  console.error('Missing Discord or Fluxer token in config');
  process.exit(1);
}

const [,, discordGuild, fluxerGuild] = process.argv;
if (!discordGuild || !fluxerGuild) {
  console.error('Usage: node emoji-copy.mjs <discord_guild_id> <fluxer_guild_id>');
  process.exit(1);
}

const DISCORD_API = 'https://discord.com/api/v10';
const FLUXER_API = 'https://api.fluxer.app/v1';

async function discordGet(path) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Discord ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fluxerPost(path, body) {
  const res = await fetch(`${FLUXER_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${FLUXER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fluxer ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

async function downloadEmoji(id, animated) {
  const ext = animated ? 'gif' : 'png';
  const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=128&quality=lossless`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { data: buf, ext };
}

async function main() {
  console.log(`Fetching emojis from Discord guild ${discordGuild}...`);
  const emojis = await discordGet(`/guilds/${discordGuild}/emojis`);
  console.log(`Found ${emojis.length} emojis\n`);

  // Check existing emojis on Fluxer to avoid duplicates
  let existingNames = new Set();
  try {
    const fluxerEmojis = await fetch(`${FLUXER_API}/guilds/${fluxerGuild}/emojis`, {
      headers: { Authorization: `Bot ${FLUXER_TOKEN}` },
    }).then(r => r.json());
    if (Array.isArray(fluxerEmojis)) {
      existingNames = new Set(fluxerEmojis.map(e => e.name));
    }
  } catch {}

  let copied = 0, skipped = 0, failed = 0;

  for (const emoji of emojis) {
    if (existingNames.has(emoji.name)) {
      console.log(`  ⏭ ${emoji.name} — already exists`);
      skipped++;
      continue;
    }

    try {
      const { data, ext } = await downloadEmoji(emoji.id, emoji.animated);
      const base64 = `data:image/${ext === 'gif' ? 'gif' : 'png'};base64,${data.toString('base64')}`;

      await fluxerPost(`/guilds/${fluxerGuild}/emojis`, {
        name: emoji.name,
        image: base64,
      });

      console.log(`  ✓ ${emoji.name}${emoji.animated ? ' (animated)' : ''}`);
      copied++;

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`  ✗ ${emoji.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${copied} copied, ${skipped} skipped, ${failed} failed`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
