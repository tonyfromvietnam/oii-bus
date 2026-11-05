#!/usr/bin/env bash
# Áp dụng toàn bộ cài đặt GitHub cho repo Oii-Bus (chạy một lần, bằng tài khoản chủ repo).
#
#   gh auth login            # nếu chưa đăng nhập GitHub CLI
#   ./scripts/setup-github.sh
#
# Windows: dùng scripts\setup-github.ps1 (PowerShell) thay cho file này.
#
# Làm những việc sau (chạy lại nhiều lần cũng an toàn):
#   1. Mô tả, website, topics, bật Issues/Discussions, tắt Wiki
#   2. Private vulnerability reporting + Dependabot alerts + security updates + secret scanning
#   3. Ruleset bảo vệ nhánh main: bắt buộc PR, CI xanh, cấm force-push và xoá nhánh
#   4. Nhãn (labels) cho issue forms
set -euo pipefail

REPO="${1:-tonyfromvietnam/oii-bus}"
echo "→ Configuring $REPO"

echo "1/4 About: description, website, topics, features"
gh repo edit "$REPO" \
  --description "A cosy 3D bus touring the UK where Vietnamese students hang out, study and meet new people. Open-source companion world to OiiMate." \
  --homepage "https://tonyfromvietnam.github.io/oii-bus/" \
  --enable-issues --enable-discussions --enable-wiki=false \
  --delete-branch-on-merge --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false \
  --add-topic open-source,threejs,react-three-fiber,typescript,vite,turborepo,monorepo,game,webgl,vietnamese,students,uk

echo "2/4 Security: private vulnerability reporting, Dependabot, secret scanning"
gh api -X PUT "repos/$REPO/private-vulnerability-reporting" >/dev/null
gh api -X PUT "repos/$REPO/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/$REPO/automated-security-fixes" >/dev/null
gh api -X PATCH "repos/$REPO" --input - >/dev/null <<'JSON'
{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}
JSON

echo "3/4 Ruleset: protect main"
EXISTING=$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="Protect main") | .id' || true)
RULESET=$(cat <<'JSON'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Lint, typecheck, test, build" },
          { "context": "Playwright e2e" },
          { "context": "analyze" } ] } }
  ]
}
JSON
)
if [ -n "$EXISTING" ]; then
  echo "$RULESET" | gh api -X PUT "repos/$REPO/rulesets/$EXISTING" --input - >/dev/null
else
  echo "$RULESET" | gh api -X POST "repos/$REPO/rulesets" --input - >/dev/null
fi

echo "4/4 Labels"
label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }
label bug d73a4a "Something isn't working"
label enhancement a2eeef "New feature or request"
label triage fbca04 "Needs a first look"
label "good first issue" 7057ff "Good for newcomers"
label "help wanted" 008672 "Extra attention is needed"
label dependencies 0366d6 "Dependency updates"
label security b60205 "Security related"
label "area: 3d" c5def5 "Scenes, landmarks, rendering"
label "area: temple" f9d0c4 "Chùa Cầu Duyên, merit, matching"
label "area: ui" bfdadc "HUD, panels, copy"

echo "✓ Done. Check: https://github.com/$REPO/settings"
