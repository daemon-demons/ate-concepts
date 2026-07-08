# ATE Concepts Hub

Interactive learning resource for semiconductor automated test equipment (ATE).

## Getting Started

Open [index.html](index.html) in a browser — this is the hub landing page with ATE fundamentals, provider showcase, and links to all learning modules.

## Project Structure

```
ate-concepts/
  index.html                 Hub landing page
  global-src/                Shared assets reused by hub + all modules
    css/
      site.css               Site chrome (nav, cards, shared UI)
    js/
      modules.js             Module registry (add new modules here)
      utils.js               Shared helpers (e.g. easeInOut)
  src/                       Hub page–specific assets
    js/
      hub.js                 Hub DOM rendering
  fixture-delay/             Fixture Delay Calibration module
    fixture-delay.html
    src/
      css/styles.css         Module-only simulation styles
      js/                    Module simulations
      images/                Module diagrams
      assets/                Module downloads (PDFs, etc.)
```

## Styles Convention

1. **Default:** every page loads `global-src/css/site.css` (typography, nav, canvas, sim timer, intro layout, shared cards).
2. **Overrides only:** a module adds `src/css/styles.css` when it needs rules that are unique to that page (animations, one-off IDs, layout quirks).
3. Prefer promoting reusable rules into `global-src` rather than copying them into a new module.

## Adding a New Module

1. Create a folder (e.g. `multisite/`) with `multisite.html` and a `src/` tree for page-local CSS, JS, images, and assets.
2. Pull shared styles/helpers from `../global-src/` (for example `site.css` and `utils.js`).
3. Add an entry to `global-src/js/modules.js`:

```javascript
{
    id: 'my-module',
    title: 'My Module Title',
    description: 'Short description shown on the hub card.',
    href: 'my-module/my-module.html',
    tags: ['Tag1', 'Tag2'],
    status: 'live',       // or 'coming-soon'
    accent: 'blue'        // blue | green | purple | orange | indigo | teal
}
```

4. The hub page renders the card automatically — no changes to `index.html` required.

## Current Modules

| Module | Status |
|--------|--------|
| [Fixture Delay Calibration](fixture-delay/fixture-delay.html) | Live |
| Multisite Testing | Coming soon |
| Binning & Yield | Coming soon |
| DUT Interface Design | Coming soon |
| SmarTest Basics | Coming soon |
| Bench-to-ATE Correlation | Coming soon |
