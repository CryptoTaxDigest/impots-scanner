# Privacy policy — impots-scanner

**Last updated:** 2026-08-24

## Summary

**We do not collect, store, or transmit your tax export files.**

All parsing happens in your browser using JavaScript. When you close the tab, the data is gone.

## What runs where

| Action | Where |
|--------|-------|
| Upload / drop file | Your browser only |
| Parse JSON/ZIP | Your browser only |
| Display results | Your browser only |
| Download report (.md) | Generated locally, saved to your device |

## What we do NOT do

- No server-side upload endpoint
- No analytics on file contents
- No cookies required for core functionality
- No account creation
- No email collection in v1

## Third parties

If you use the hosted demo on GitHub Pages:

- **GitHub Pages** serves static files (HTML/JS/CSS). GitHub may log standard web server metadata (IP, user-agent) per their [privacy policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

If you embed the tool on another website:

- That site's normal analytics may apply to the **page**, not to the contents of your tax file (still processed client-side inside the iframe).

## Optional future: email report

If an optional “email me this report” feature is added later:

- Only your **email address** and a **client-generated summary** would be sent — never the original export file
- Explicit opt-in checkbox required
- Documented separately before launch

## Open source verification

You can audit the code:

```bash
git clone https://github.com/CryptoTaxDigest/impots-scanner.git
grep -r "fetch\|XMLHttpRequest\|navigator.sendBeacon" src/
```

The application should not exfiltrate your files.

## Contact

[GitHub Issues](https://github.com/CryptoTaxDigest/impots-scanner/issues)
