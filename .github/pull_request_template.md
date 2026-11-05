## Summary

<!-- What does this change and why? Link the issue: "Closes #123". Which milestone (M0–M5)? -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / performance
- [ ] Docs / CI / tooling

## Screenshots

<!-- For UI changes: before / after, desktop and mobile. -->

## Checklist

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm --filter @oii-bus/web test:e2e` (if UI or controls changed)
- [ ] Tested manually on desktop and mobile (if UI changed)
- [ ] New UI copy is in `apps/web/src/copy/vi.ts`
- [ ] New client → server payloads have a zod schema in `packages/shared`
- [ ] No secrets, personal data or `innerHTML` added
- [ ] `CHANGELOG.md` updated under "Unreleased"
