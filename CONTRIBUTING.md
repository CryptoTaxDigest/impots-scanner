# Contributing

Technical contributions via GitHub Issues and pull requests are welcome.

## Scope

- Parser improvements for impots.gouv export formats
- Platform name recognition (institution → known label)
- Accessibility, copy, and embed UX
- Tests and documentation

## Development

```bash
npm install
npm run dev
npm test
npm run lint
```

## Pull requests

- One logical change per PR
- Add or update tests for parser changes
- **Client-side only** — do not add upload endpoints or telemetry on file contents

## Data and privacy

Do **not** open issues or PRs containing real tax exports or personal data. Use synthetic test data in `src/parser/index.test.ts` only.

Maintainers handle format evolution internally.

## Code of conduct

Be respectful. This project helps people understand fiscal transparency — not evade obligations.
