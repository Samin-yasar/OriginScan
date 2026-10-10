# Security Policy

## Supported Versions

Only the latest version of OriginScan (deployed at the canonical URL) is actively maintained and receives security fixes.

| Version | Supported |
|---------|-----------|
| Latest (`main` branch) | ✅ Yes |
| Older commits / forks | ❌ No |

---

## Scope

OriginScan is a **client-side-only** web application. It runs entirely in the browser with no server-side backend, no database, and no user authentication. The attack surface is therefore limited, but the following are in scope:

- **Cross-Site Scripting (XSS)** — any path by which untrusted input (e.g. barcode data, API responses) could be rendered as executable HTML or JavaScript
- **Data leakage** — unintended exposure of any data the app processes to third parties beyond the declared external APIs (Open Food Facts, Open Products Facts, REST Countries)
- **Dependency integrity** — tampering with third-party scripts loaded via CDN (Font Awesome, Leaflet, etc.)
- **Privacy violations** — any behavior that causes the app to collect, transmit, or persist personal data contrary to the [Privacy Notice](../policy/privacy-notice.html)
- **Malicious redirect or clickjacking** — UI redress attacks or open redirects

The following are **out of scope**:

- Vulnerabilities in third-party APIs (Open Food Facts, REST Countries, etc.)
- Issues in browsers themselves
- Denial-of-service against static hosting (GitHub Pages)
- Social engineering

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately using one of the following methods:

1. **GitHub Private Security Advisory** *(preferred)*  
   Go to the [Security tab → Report a vulnerability](https://github.com/Samin-yasar/OriginScan/security/advisories/new) and submit a private advisory. This keeps the details confidential until a fix is released.

2. **Direct contact**  
   If you are unable to use the advisory form, open a [GitHub Discussion](https://github.com/Samin-yasar/OriginScan/discussions) marked as a question and include only enough detail to identify the issue — do not include a full proof-of-concept publicly. The maintainer will follow up privately.

> **Privacy note:** When you submit a GitHub Security Advisory or interact via GitHub Issues or Discussions, your GitHub account data and the content you submit are processed by **GitHub, Inc.** under [GitHub's General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). OriginScan's maintainer will have access to this information solely to triage and resolve your report. Advisory content will remain confidential until coordinated public disclosure. See [OriginScan's Privacy Notice §17](https://originscan.samin-yasar.dev/policy/privacy-notice.html#section17) for full details.

---

## What to Include in Your Report

To help us triage and reproduce the issue quickly, please provide:

- A clear description of the vulnerability
- The affected file(s) and line numbers if known
- Steps to reproduce (as minimal as possible)
- The potential impact or attack scenario
- Any suggested fix, if you have one

---

## Response Timeline

| Step | Target time |
|------|-------------|
| Acknowledgement of report | Within **72 hours** |
| Initial triage and severity assessment | Within **7 days** |
| Fix published (if confirmed) | Within **30 days** for high/critical; best-effort for low/medium |
| Public disclosure | After fix is deployed, coordinated with the reporter |

---

## Responsible Disclosure

We follow a **coordinated disclosure** model. We ask that you:

- Give us a reasonable amount of time to fix the issue before any public disclosure
- Avoid accessing or modifying data that does not belong to you during testing
- Not perform testing that degrades availability of the app for other users

In return, we commit to:

- Keeping you informed throughout the process
- Crediting you in the release notes (unless you prefer to remain anonymous)

---

## Hall of Fame

We sincerely thank everyone who has responsibly disclosed security issues to us.

*(No reports yet — be the first!)*
