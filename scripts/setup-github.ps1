# Applies all GitHub settings for the Oii-Bus repo (Windows / PowerShell version of setup-github.sh).
# Run once as the repo owner, from the repo folder:
#
#   gh auth login
#   powershell -ExecutionPolicy Bypass -File scripts\setup-github.ps1
#
# Safe to run more than once.
param([string]$Repo = "tonyfromvietnam/oii-bus")
$ErrorActionPreference = "Stop"

function Invoke-Gh {
  & gh @args
  if ($LASTEXITCODE -ne 0) { throw "gh $($args -join ' ') failed (exit $LASTEXITCODE)" }
}

function Invoke-GhJson([string]$Method, [string]$Path, [string]$Json) {
  # Write UTF-8 *without* BOM (Windows PowerShell's -Encoding utf8 adds a BOM that the GitHub API rejects).
  $tmp = (New-TemporaryFile).FullName
  try {
    [System.IO.File]::WriteAllText($tmp, $Json, (New-Object System.Text.UTF8Encoding $false))
    & gh api -X $Method $Path --input $tmp | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "gh api $Method $Path failed (exit $LASTEXITCODE)" }
  } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }
}

Write-Host "Configuring $Repo"

Write-Host "1/4 About: description, website, topics, features"
Invoke-Gh repo edit $Repo `
  --description "A cosy 3D bus touring the UK where Vietnamese students hang out, study and meet new people. Open-source companion world to OiiMate." `
  --homepage "https://tonyfromvietnam.github.io/oii-bus/" `
  --enable-issues --enable-discussions --enable-wiki=false `
  --delete-branch-on-merge --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false `
  --add-topic "open-source,threejs,react-three-fiber,typescript,vite,turborepo,monorepo,game,webgl,vietnamese,students,uk"

Write-Host "2/4 Security: private vulnerability reporting, Dependabot, secret scanning"
Invoke-Gh api -X PUT "repos/$Repo/private-vulnerability-reporting" --silent
Invoke-Gh api -X PUT "repos/$Repo/vulnerability-alerts" --silent
Invoke-Gh api -X PUT "repos/$Repo/automated-security-fixes" --silent
Invoke-GhJson PATCH "repos/$Repo" '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}'

Write-Host "3/4 Ruleset: protect main"
$ruleset = @'
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
'@
# Filter in PowerShell (Windows PowerShell mangles embedded quotes in native arguments like --jq).
$rulesets = (& gh api "repos/$Repo/rulesets") | ConvertFrom-Json
$existing = ($rulesets | Where-Object { $_.name -eq "Protect main" } | Select-Object -First 1).id
if ($existing) { Invoke-GhJson PUT "repos/$Repo/rulesets/$existing" $ruleset }
else { Invoke-GhJson POST "repos/$Repo/rulesets" $ruleset }

Write-Host "4/4 Labels"
$labels = @(
  @("bug", "d73a4a", "Something isn't working"),
  @("enhancement", "a2eeef", "New feature or request"),
  @("triage", "fbca04", "Needs a first look"),
  @("good first issue", "7057ff", "Good for newcomers"),
  @("help wanted", "008672", "Extra attention is needed"),
  @("dependencies", "0366d6", "Dependency updates"),
  @("security", "b60205", "Security related"),
  @("area: 3d", "c5def5", "Scenes, landmarks, rendering"),
  @("area: temple", "f9d0c4", "Temple, merit, matching"),
  @("area: ui", "bfdadc", "HUD, panels, copy")
)
foreach ($l in $labels) {
  & gh label create $l[0] --repo $Repo --color $l[1] --description $l[2] --force | Out-Null
}

Write-Host "Done. Check: https://github.com/$Repo/settings"
