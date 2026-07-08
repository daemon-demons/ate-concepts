# ATE Concepts Hub

Interactive learning resource for semiconductor automated test equipment (ATE).

## Getting Started

Open [index.html](index.html) in a browser — this is the hub landing page with ATE fundamentals, provider showcase, and links to all learning modules.

## Project Structure

```
ate-concepts/
  index.html              Hub landing page
  css/site.css            Shared hub styles
  js/
    modules.js            Module registry (add new modules here)
    hub.js                Hub page rendering
  fixture-delay/          Fixture Delay Calibration module
    fixture-delay.html
    css/styles.css
    js/
```

## Adding a New Module

1. Create a new folder (e.g. `multisite/`) with your module's HTML, CSS, and JS.
2. Add an entry to `js/modules.js`:

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

3. The hub page renders the card automatically — no changes to `index.html` required.

## Current Modules

| Module | Status |
|--------|--------|
| [Fixture Delay Calibration](fixture-delay/fixture-delay.html) | Live |
| Multisite Testing | Coming soon |
| Binning & Yield | Coming soon |
| DUT Interface Design | Coming soon |
| SmarTest Basics | Coming soon |
| Bench-to-ATE Correlation | Coming soon |
