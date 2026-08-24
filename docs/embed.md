# Embed

## iframe

```html
<iframe
  src="https://cryptotaxdigest.github.io/impots-scanner/?embed=1"
  title="Ce que l'État sait sur vous — scan comptes étrangers (3916-BIS)"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  style="width:100%;max-width:720px;height:820px;border:0;border-radius:12px;"
></iframe>
```

Replace the `src` origin when self-hosting.

## Script loader

```html
<div id="impots-scanner"></div>
<script
  src="/embed/v1.js"
  data-target="#impots-scanner"
  data-height="820"
></script>
```

`v1.js` resolves the app URL from `data-base` or from the script's own origin.

## Self-hosting

```bash
npm run build
# serve dist/ from any static host or CDN
```

The tool stays client-side only — embedding does not add a backend.
