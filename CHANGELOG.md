# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Daily loop**: daily streak (London days), XP with Oyster-zone levels (Zone 6 → Zone 1 → Zone VIP), "today" stats, a daily quote, and a shareable 1080×1350 card with a referral link (`?ref=`).
- **One giant floor**: Oii-Bus is now a single 88 × 22 m open top deck, like an online pagoda hall where everyone shares one space. Zones from back to front: Chùa Cầu Duyên, Góc Deadline, OiiNails, Quảng trường OiiMate, Oii Viet, Oii Tea and the bus front. A zone bar takes you straight there and the character runs faster.
- **Máy farm công đức (idle farming)**: tap or hold at each work station to carry bowls of phở, do nail sets, shake bubble tea, write essay paragraphs or strike the wooden fish (công đức). Hire helpers to make stations run on their own, including while the app is closed (offline catch-up, capped at 12 hours). AFK mode dims the screen, pauses 3D rendering, keeps the screen awake and doubles helper speed.
- OiiMate branding everywhere: logo signs on every shop, flags along the rail, bus livery, plaza floor and HUD.
- Unlimited levels (Lv 1, 2, 3…) on top of the Oyster zones.

- Standard repository files: README with badges and screenshots, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR templates, CODEOWNERS.
- Dependabot for npm and GitHub Actions; CodeQL code scanning.
- `.editorconfig` and `.gitattributes` for consistent formatting and line endings.
- `scripts/setup-github.sh`: one command to apply repository settings (topics, security features, `main` ruleset, labels).

### Changed

- Removed the library and temple floors, floor switcher, weekly quests, rubber ducks and the newcomer checklist to keep the game lean.
- **Oii-Bus is now open source under the MIT License.**
- Node.js 22 LTS is now the minimum (Node 20 reached end of life).
- GitHub Actions updated to current major versions.

## [0.4.0] - 2026-11-05

### Changed

- Rebranded to **Oii-Bus** across UI, packages (`@oii-bus/*`), docs and infrastructure names.
- Simplified HUD: one main action per floor, bottom floor bar, emotes behind a single button.

### Added

- GitHub Pages deployment workflow (no secrets required) and a getting-started guide.

### Fixed

- 3D world not rendering when the page is embedded in another HTML shell (JavaScript now ships as a separate file).
- Prisma client generation in CI.

## [0.3.0] - 2026-11-05

### Added

- Chùa Cầu Duyên temple floor: incense, chanting, donation box, wish tree, bell, merit system and anonymous 1:1 matching.
- Same-city floor: home and visiting cities, people nearby, meetup plans.
- 15 more landmarks (28 in total) and region-aware scenery.
- PBR materials, procedural textures, soft shadows; `?lowfx` mode.

## [0.2.0] - 2026-11-04

### Added

- OiiMate-style round mascot characters and theme.
- Giant open-top bus touring the UK, lofi library with focus timer, weekly quests and passport stamps.

## [0.1.0] - 2026-11-04

### Added

- Monorepo skeleton, CI, Docker Compose, architecture proposal, first 3D street prototype.

[Unreleased]: https://github.com/tonyfromvietnam/oii-bus/compare/main...HEAD
[0.4.0]: https://github.com/tonyfromvietnam/oii-bus/commits/main
[0.3.0]: https://github.com/tonyfromvietnam/oii-bus/commits/main
[0.2.0]: https://github.com/tonyfromvietnam/oii-bus/commits/main
[0.1.0]: https://github.com/tonyfromvietnam/oii-bus/commits/main
