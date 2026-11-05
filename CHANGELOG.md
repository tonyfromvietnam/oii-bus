# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Daily loop**: daily streak (London days), XP with Oyster-zone levels (Zone 6 → Zone 1 → Zone VIP), "today" stats, a daily quote, and a shareable 1080×1350 card with a referral link (`?ref=`).
- **Cẩm nang tân sinh viên (Newcomer handbook)**: a 7-day campaign played as real actions on a new low-poly **UK high street** floor (Arrivals, bank, letting agent, GP, pharmacy, supermarket, Asian grocer, laundrette, café, station, Freshers tent, Oii-Bus stop). 3 quests per day (quizzes, put-in-order, pick-the-right-items, duo tasks with a buddy, chat, wave); a new chapter opens the next London day, and finishing chapters unlocks the bus, library, same-city board and temple. Content comes from the OiiMate Q&A sheet, with gov.uk / NHS / TfL links, plus a searchable Q&A bank.
- **Bạn đồng hành (buddy matching)**: on day 1 you are paired with a buddy at the Freshers tent. They follow you between floors, chat 1:1 and are needed for the duo quests; day 7 ends at the temple matchmaking.
- `?unlock=all` opens every floor and chapter (for testing and demos).

- Standard repository files: README with badges and screenshots, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR templates, CODEOWNERS.
- Dependabot for npm and GitHub Actions; CodeQL code scanning.
- `.editorconfig` and `.gitattributes` for consistent formatting and line endings.
- `scripts/setup-github.sh`: one command to apply repository settings (topics, security features, `main` ruleset, labels).

### Changed

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
