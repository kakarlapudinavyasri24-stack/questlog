# Security Policy

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
