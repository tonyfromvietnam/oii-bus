# Contributing to Oii-Bus

Thanks for helping make Oii-Bus better. This guide explains how we work.

## Ground rules

- Be kind. Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md).
- Never commit secrets. Configuration goes in `.env` (git-ignored); document new variables in `.env.example`.
- Report security issues privately (see [SECURITY.md](SECURITY.md)), not in public issues.

## Development setup

```bash
corepack enable          # pnpm 9
pnpm install
pnpm dev                 # web on :5173, API on :2567
```

Requirements: Node.js ≥ 22. Docker is optional.

## Workflow

1. Open or pick an issue; for larger changes, agree on the approach first.
2. Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, `chore/<short-name>`.
3. Keep pull requests small and focused; one logical change per PR.
4. Fill in the pull request template, including the test checklist.
5. CI must be green and at least one review approval is required before merging.

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(temple): add bell pavilion with generated sound
fix(web): keep panels above name tags
docs: describe GitHub Pages custom domain
```

Common types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

## Code standards

- **TypeScript strict** everywhere; no `any` without a comment explaining why.
- **Validate every client → server payload** with a zod schema in `packages/shared`.
- **Never trust the client**: positions, speed, chat content, voice permissions and merit are decided on the server.
- **User text is rendered with `textContent` / JSX text only.** `innerHTML` and `dangerouslySetInnerHTML` are blocked by ESLint.
- **Rules shared by client and server** (collision, proximity, merit, matching) are pure functions in `packages/*` with unit tests.
- **Vietnamese UI copy** lives in `apps/web/src/copy/vi.ts`, written in a friendly northern tone; keep UK culture terms in English (meal deal, yellow sticker…).

## Checks to run before pushing

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @oii-bus/web test:e2e   # when you touch UI or controls
```

## Adding a landmark

1. Add the id, terrain, house style and city to `packages/world/src/route.ts`.
2. Add a builder in `apps/web/src/scene/landmarks.ts` and its toy height in `BusWorld.tsx`.
3. Add the name and a one-line joke to `apps/web/src/copy/vi.ts`.
4. Run the world tests: `pnpm --filter @oii-bus/world test`.
