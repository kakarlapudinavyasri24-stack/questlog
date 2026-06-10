# Security Policy

## Supported Versions

QuestLog is currently a prototype. Security fixes should target the default
development branch unless maintainers publish a versioned release policy.

| Version                     | Supported |
| --------------------------- | --------- |
| `main` / active development | Yes       |
| Older snapshots             | No        |

## Reporting a Vulnerability

Please report suspected vulnerabilities privately to the project maintainers.
Do not open a public issue containing exploit details, credentials, or sensitive
user data.

Include:

- Affected component or file.
- Steps to reproduce.
- Expected impact.
- Any logs or screenshots with secrets removed.
- Suggested fix, if known.

Maintainers should acknowledge reports within 5 business days and provide a
triage update when the issue has been assessed.

## Secret Handling

- Do not commit `.env` files.
- Use `.env.example` for documented placeholders only.
- Run `npm run secrets` before pushing when Gitleaks is installed.
- Rotate any credential that may have been committed or shared in logs.

## Dependency Security

Run:

```bash
npm run audit
```

High-severity dependency findings should be reviewed before release. If a
finding is accepted temporarily, document the rationale and remediation plan.
