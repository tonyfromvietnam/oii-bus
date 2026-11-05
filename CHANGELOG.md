# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Standard repository files: README with badges and screenshots, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR templates, CODEOWNERS.
- Dependabot for npm and GitHub Actions; CodeQL code scanning.
- `.editorconfig` and `.gitattributes` for consistent formatting and line endings.

### Changed

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
