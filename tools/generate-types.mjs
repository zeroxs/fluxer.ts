#!/usr/bin/env node
/**
 * Type generator for fluxer.ts — reads the OpenAPI spec and outputs TypeScript interfaces/enums.
 * Run: node tools/generate-types.mjs > src/types.generated.ts
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(join(__dirname, '../reference/openapi.json'), 'utf-8'));
const schemas = spec.components.schemas;

// ─── Configuration ─────────────────────────────────────────────

/** Schemas to generate, grouped by domain. Values are the OpenAPI schema names. */
const ALLOWLIST = {
  // Core objects
  core: [
    'UserPartialResponse',
    'GuildResponse',
    'ChannelResponse',
    'MessageResponseSchema',
    'MessageBaseResponseSchema',
    'GuildMemberResponse',
    'GuildRoleResponse',
  ],
  // Sub-objects
  sub: [
    'MessageAttachmentResponse',
    'MessageEmbedResponse',
    'MessageEmbedChildResponse',
    'EmbedAuthorResponse',
    'EmbedMediaResponse',
    'EmbedFooterResponse',
    'EmbedFieldResponse',
    'MessageReactionResponse',
    'MessageReferenceResponse',
    'MessageStickerResponse',
    'MessageCallResponse',
    'ChannelOverwriteResponse',
    'GuildEmojiResponse',
    'ChannelPartialResponse',
  ],
  // Guild management
  guild: [
    'GuildBanResponse',
    'GuildAuditLogEntryResponse',
    'AuditLogChangeSchema',
    'GuildStickerResponse',
    'GuildVanityURLResponse',
    'GuildMemberSearchResult',
  ],
  // Webhooks
  webhook: [
    'WebhookResponse',
    'WebhookTokenResponse',
  ],
  // Invites
  invite: [
    'GuildInviteResponse',
    'GuildInviteMetadataResponse',
    'GroupDmInviteResponse',
  ],
  // Packs
  pack: [
    'PackSummaryResponse',
  ],
  // Pins
  pin: [
    'ChannelPinResponse',
  ],
};

/** Rename map: OpenAPI name → clean SDK name */
const RENAMES = {
  UserPartialResponse: 'User',
  GuildResponse: 'Guild',
  ChannelResponse: 'Channel',
  MessageResponseSchema: 'Message',
  MessageBaseResponseSchema: 'MessageBase',
  GuildMemberResponse: 'GuildMember',
  GuildRoleResponse: 'Role',
  MessageAttachmentResponse: 'Attachment',
  MessageEmbedResponse: 'Embed',
  MessageEmbedChildResponse: 'EmbedChild',
  EmbedAuthorResponse: 'EmbedAuthor',
  EmbedMediaResponse: 'EmbedMedia',
  EmbedFooterResponse: 'EmbedFooter',
  EmbedFieldResponse: 'EmbedField',
  MessageReactionResponse: 'Reaction',
  MessageReferenceResponse: 'MessageReference',
  MessageStickerResponse: 'MessageSticker',
  MessageCallResponse: 'MessageCall',
  ChannelOverwriteResponse: 'PermissionOverwrite',
  GuildEmojiResponse: 'Emoji',
  ChannelPartialResponse: 'PartialChannel',
  GuildBanResponse: 'GuildBan',
  GuildAuditLogEntryResponse: 'AuditLogEntry',
  AuditLogChangeSchema: 'AuditLogChange',
  GuildStickerResponse: 'Sticker',
  GuildVanityURLResponse: 'VanityURL',
  GuildMemberSearchResult: 'MemberSearchResult',
  WebhookResponse: 'Webhook',
  WebhookTokenResponse: 'WebhookWithToken',
  GuildInviteResponse: 'GuildInvite',
  GuildInviteMetadataResponse: 'GuildInviteMetadata',
  GroupDmInviteResponse: 'GroupDMInvite',
  PackSummaryResponse: 'Pack',
  ChannelPinResponse: 'PinnedMessage',
};

/** Enums to generate: OpenAPI name → SDK name */
const ENUMS = {
  // Named integer enums
  GuildVerificationLevel: 'GuildVerificationLevel',
  GuildMFALevel: 'GuildMFALevel',
  NSFWLevel: 'NSFWLevel',
  GuildExplicitContentFilter: 'GuildExplicitContentFilter',
  DefaultMessageNotifications: 'DefaultMessageNotifications',
  AuditLogActionType: 'AuditLogActionType',
  WebhookType: 'WebhookType',
  MessageReferenceType: 'MessageReferenceType',
  RelationshipTypes: 'RelationshipType',
  JoinSourceType: 'JoinSourceType',
};

/** Bitflag enums to generate: OpenAPI name → SDK name */
const BITFLAGS = {
  MessageFlags: 'MessageFlags',
  PublicUserFlags: 'UserFlags',
  SystemChannelFlags: 'SystemChannelFlags',
  MessageAttachmentFlags: 'AttachmentFlags',
  EmbedMediaFlags: 'EmbedMediaFlags',
  GuildMemberProfileFlags: 'MemberProfileFlags',
  GuildOperations: 'GuildOperations',
};

/** Special $ref resolutions — refs to these schemas resolve to simple types */
const REF_SHORTCUTS = {
  SnowflakeType: 'Snowflake',
  Int32Type: 'number',
  UnsignedInt64Type: 'string',
  GuildFeatureSchema: 'string',
  // These schemas are structurally identical to ones we already generate
  ChannelPinMessageResponse: 'MessageBase',
  ChannelPartialRecipientResponse: '{ username: string }',
};

/**
 * Fields to force optional — response schemas mark these as required but they should
 * be optional when constructing objects for send payloads.
 */
const FORCE_OPTIONAL = {
  EmbedMediaResponse: ['flags'],
  EmbedFieldResponse: ['inline'],
  MessageEmbedResponse: ['type'],
  MessageEmbedChildResponse: ['type'],
};

/** Extra properties to inject — gateway sends fields not in REST response schemas */
const EXTRA_PROPS = {
  MessageResponseSchema: [
    { name: 'guild_id', type: 'Snowflake', optional: true, comment: 'The guild ID (present on gateway dispatch events)' },
    { name: 'member', type: 'GuildMember', optional: true, comment: 'Partial member data (present on gateway dispatch events)' },
  ],
};

// ─── Type Resolution ───────────────────────────────────────────

/** Get the SDK name for an OpenAPI schema ref */
function resolveRefName(ref) {
  const name = ref.replace('#/components/schemas/', '');
  if (REF_SHORTCUTS[name]) return REF_SHORTCUTS[name];
  if (RENAMES[name]) return RENAMES[name];
  if (ENUMS[name]) return ENUMS[name];
  if (BITFLAGS[name]) return BITFLAGS[name];
  // Check if it's a schema we're generating
  const allSchemas = Object.values(ALLOWLIST).flat();
  if (allSchemas.includes(name)) return RENAMES[name] || name;
  return null; // Not in our allowlist — will be inlined or use unknown
}

/** Resolve an OpenAPI property definition to a TypeScript type string */
function resolveType(prop, required = true) {
  if (!prop) return 'unknown';

  // Direct $ref
  if (prop.$ref) {
    const resolved = resolveRefName(prop.$ref);
    return resolved || 'unknown';
  }

  // anyOf — nullable pattern or union
  if (prop.anyOf) {
    const nonNull = prop.anyOf.filter(a => a.type !== 'null');
    const hasNull = prop.anyOf.some(a => a.type === 'null');

    if (nonNull.length === 1) {
      const inner = resolveType(nonNull[0]);
      return hasNull ? `${inner} | null` : inner;
    }
    // Multiple non-null types — union
    const types = nonNull.map(a => resolveType(a));
    const union = types.join(' | ');
    return hasNull ? `${union} | null` : union;
  }

  // oneOf — discriminated union (handle null same as anyOf)
  if (prop.oneOf) {
    const nonNull = prop.oneOf.filter(o => o.type !== 'null');
    const hasNull = prop.oneOf.some(o => o.type === 'null');
    const types = nonNull.map(o => resolveType(o));
    const union = types.join(' | ');
    return hasNull ? `${union} | null` : union;
  }

  // Array
  if (prop.type === 'array') {
    if (prop.items) {
      const itemType = resolveType(prop.items);
      return `${itemType}[]`;
    }
    return 'unknown[]';
  }

  // Inline object with properties
  if (prop.type === 'object' && prop.properties) {
    const fields = [];
    const req = new Set(prop.required || []);
    for (const [name, def] of Object.entries(prop.properties)) {
      const type = resolveType(def);
      const opt = req.has(name) ? '' : '?';
      fields.push(`${name}${opt}: ${type}`);
    }
    return `{ ${fields.join('; ')} }`;
  }

  // Primitive types
  switch (prop.type) {
    case 'string':
      if (prop.pattern === '^(0|[1-9][0-9]*)$' || prop.format === 'snowflake') return 'Snowflake';
      if (prop.format === 'int64' || prop.format === 'uint64') return 'string';
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (prop.additionalProperties) {
        const valueType = resolveType(prop.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

// ─── Code Generation ───────────────────────────────────────────

function generateInterface(schemaName) {
  const schema = schemas[schemaName];
  if (!schema || !schema.properties) return null;

  const sdkName = RENAMES[schemaName] || schemaName;
  const required = new Set(schema.required || []);
  const forceOpt = new Set(FORCE_OPTIONAL[schemaName] || []);
  const lines = [];

  lines.push(`export interface ${sdkName} {`);

  for (const [propName, propDef] of Object.entries(schema.properties)) {
    const type = resolveType(propDef);
    const isRequired = required.has(propName) && !forceOpt.has(propName);
    const opt = isRequired ? '' : '?';
    const desc = propDef.description;

    if (desc) lines.push(`  /** ${desc} */`);
    lines.push(`  ${propName}${opt}: ${type};`);
  }

  // Inject extra properties
  const extras = EXTRA_PROPS[schemaName];
  if (extras) {
    for (const prop of extras) {
      if (prop.comment) lines.push(`  /** ${prop.comment} */`);
      const opt = prop.optional ? '?' : '';
      lines.push(`  ${prop.name}${opt}: ${prop.type};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

function generateNamedEnum(schemaName) {
  const schema = schemas[schemaName];
  if (!schema) return null;

  const sdkName = ENUMS[schemaName];
  const names = schema['x-enumNames'] || [];
  const values = schema.enum || [];
  const lines = [];

  lines.push(`export enum ${sdkName} {`);
  for (let i = 0; i < values.length; i++) {
    const name = names[i] || `VALUE_${values[i]}`;
    const val = typeof values[i] === 'string' ? `'${values[i]}'` : values[i];
    lines.push(`  ${name} = ${val},`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateBitflagEnum(schemaName) {
  const schema = schemas[schemaName];
  if (!schema || !schema['x-bitflagValues']) return null;

  const sdkName = BITFLAGS[schemaName];
  const flags = schema['x-bitflagValues'];
  const lines = [];

  lines.push(`export enum ${sdkName} {`);
  for (const flag of flags) {
    if (flag.description) lines.push(`  /** ${flag.description} */`);
    lines.push(`  ${flag.name} = ${flag.value},`);
  }
  lines.push('}');
  return lines.join('\n');
}

// ─── Output ────────────────────────────────────────────────────

const output = [];

output.push(`/**`);
output.push(` * Auto-generated from Fluxer OpenAPI spec — do not edit by hand.`);
output.push(` * Run: node tools/generate-types.mjs > src/types.generated.ts`);
output.push(` */`);
output.push('');
output.push(`export type Snowflake = string;`);
output.push('');

// Generate bitflag enums
output.push('// ─── Bitflag Enums ──────────────────────────────────────────────');
output.push('');
for (const schemaName of Object.keys(BITFLAGS)) {
  const code = generateBitflagEnum(schemaName);
  if (code) { output.push(code); output.push(''); }
}

// Generate named enums
output.push('// ─── Enums ─────────────────────────────────────────────────────');
output.push('');
for (const schemaName of Object.keys(ENUMS)) {
  const code = generateNamedEnum(schemaName);
  if (code) { output.push(code); output.push(''); }
}

// Generate interfaces by group
const GROUP_LABELS = {
  core: 'Core Objects',
  sub: 'Sub-Objects',
  guild: 'Guild Management',
  webhook: 'Webhooks',
  invite: 'Invites',
  pack: 'Packs',
  pin: 'Pins',
};

for (const [group, schemaNames] of Object.entries(ALLOWLIST)) {
  const label = GROUP_LABELS[group] || group;
  output.push(`// ─── ${label} ${'─'.repeat(Math.max(0, 57 - label.length))}`);
  output.push('');
  for (const schemaName of schemaNames) {
    const code = generateInterface(schemaName);
    if (code) { output.push(code); output.push(''); }
  }
}

// Write to stdout
console.log(output.join('\n'));
