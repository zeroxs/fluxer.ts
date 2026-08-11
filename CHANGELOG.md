# Changelog

## 0.4.0

### Fixed
- **File uploads** — `payload_json` was sent as a `Blob`, which the API received as a file part and rejected with "Invalid JSON". It's now sent as a plain string. Thanks @FireMario211 (#1).

### Changed
- Types regenerated against the current Fluxer OpenAPI spec. Some fields are now
  more precisely typed (e.g. enums like `GuildVerificationLevel` instead of bare
  `number`), and `Guild.permissions` is now an optional `string` rather than
  `string | null`. These are type-surface changes that may require minor updates
  in strict TypeScript consumers — hence the minor version bump.
- `Guild` gained `nsfw` and `content_warning_level` to match the current API.

### Internal
- The OpenAPI spec (`reference/openapi.json`) is now committed, so the package
  builds from a clean clone again.
