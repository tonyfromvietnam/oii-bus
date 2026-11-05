# Security Policy

Oii-Bus is built for students, including anonymous chat and 1:1 matching, so we take security and user safety seriously.

## Supported versions

| Version         | Supported |
| --------------- | --------- |
| `main` (latest) | ✅        |
| Older commits   | ❌        |

## Reporting a vulnerability

**Please do not open a public issue.**

Report it privately through GitHub: [**Report a vulnerability**](https://github.com/tonyfromvietnam/oii-bus/security/advisories/new).

Include, where possible:

- A description of the issue and its impact
- Steps to reproduce or a proof of concept
- Affected files, endpoints or versions

What to expect:

- Acknowledgement within **3 working days**
- An initial assessment within **7 days**
- Credit in the release notes once fixed, if you would like it

## Scope

In scope: this repository's code, the deployed prototype, and (once live) the Oii-Bus API and real-time server.
Especially relevant: authentication and sessions, chat filtering bypasses, proximity/voice eavesdropping, matching and block/report bypasses, exposure of personal data (email hashes, chat logs).

Out of scope: denial-of-service attacks, social engineering, and issues in third-party services (report those to the vendor).

## Data handling principles

- No real names are stored; email addresses are stored only as salted SHA-256 hashes.
- Chat and direct messages are kept for 14 days, for moderation only.
- Secrets live in environment variables and GitHub/Fly.io secret stores, never in the repository.
