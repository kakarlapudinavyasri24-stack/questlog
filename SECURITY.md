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

## Reporting a Vulnerability

If you discover a security vulnerability in Questlog, please email security concerns to the project maintainers rather than using the issue tracker.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Our Commitment

- We will acknowledge receipt within 48 hours
- We will provide an estimated timeline for a fix
- We will keep you informed of progress
- We will credit you in the security advisory (if desired)

## Security Best Practices

When using Questlog:

1. **API Keys**: Never commit API keys to the repository. Use `.env` files locally.
2. **Database**: The default `db.json` is file-based. For production, consider a proper database.
3. **HTTPS**: Always use HTTPS in production environments.
4. **Dependencies**: Keep dependencies updated. Run `npm audit` regularly.

## Deployment Security

- Use environment variables for sensitive configuration
- Never expose `.env` files
- Keep server software updated
- Run security audits before production release
