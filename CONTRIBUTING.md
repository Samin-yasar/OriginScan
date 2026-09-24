# Contributing to OriginScan

Thanks for wanting to contribute! Whether it's fixing a bug, adding missing GS1 prefixes, improving the UI, or writing tests — every bit helps. This guide will get you set up quickly.

---

## Project Architecture

OriginScan is intentionally a zero-build, zero-dependency web app. There is no webpack, no bundler, no `npm install` required to run it. This makes it easy to contribute without a complicated dev environment.

```
originscan/
├── index.html          # App shell — UI structure
├── app.js              # App layer — wires UI to core engine
├── style.css           # All styles
├── countries.js        # Legacy prefix map (still imported by old paths)
│
├── js/core/
│   ├── validator.js    # GS1 Mod-10 checksum + format normaliser
│   ├── gs1-registry.js # Comprehensive GS1 prefix database
│   ├── product-api.js  # Open Food Facts / Open Products Facts client
│   └── engine.js       # Multi-tier lookup orchestrator
│
├── tests/
│   └── test-suite.js   # Plain Node.js tests (no framework)
│
└── policy/             # Legal pages (ToS, Privacy Notice, Disclaimer)
```

---

## Running Locally

You need a local HTTP server because the app uses ES6 modules, which browsers won't load from `file://` paths.

**Option A — Python (zero install):**
```bash
python -m http.server 8000
# → http://localhost:8000
```

**Option B — Node.js `serve`:**
```bash
npx serve .
```

Open your browser at the URL shown and you're done. No build step, no compilation.

---

## Running the Test Suite

The test suite is a plain Node.js script. It requires **Node.js 18+** for native ES module support.

```bash
node tests/test-suite.js
```

Expected output:
```
▶ verifyCheckDigit — Mod-10 algorithm
  ✅ STABILO EAN-13 (4006381333931) — valid
  ✅ ...

Results: 30 passed, 0 failed
All tests passed! ✅
```

---

## What to Work On

Check the [open issues](https://github.com/Samin-yasar/OriginScan/issues) for things tagged:

- `good first issue` — small, well-scoped tasks
- `gs1-data` — missing or incorrect GS1 prefix entries
- `ux` — user-facing improvements
- `accuracy` — improvements to the lookup engine

---

## Adding or Fixing a GS1 Prefix

All prefix data lives in [`js/core/gs1-registry.js`](js/core/gs1-registry.js) inside the `RAW_PREFIXES` object.

Each entry looks like this:

```js
"380": {
  country: "Bulgaria",
  flag: "🇧🇬",
  apiName: "Bulgaria",    // used to query REST Countries API
  region: "Europe",
  currency: "BGN",        // ISO 4217 currency code
  type: "country",        // 'country' | 'restricted' | 'special'
  note: null              // optional explanation for unusual ranges
}
```

Ranges are written as `"start-end"` strings:
```js
"400-440": { country: "Germany", ... }
```

After editing, run the test suite to check nothing broke:
```bash
node tests/test-suite.js
```

Source for GS1 prefix data: https://www.gs1.org/standards/id-keys/company-prefix

---

## Code Style

- **No bundler, no transpiler.** Write plain ES2020 JavaScript.
- **Modules:** Use `import` / `export` consistently.
- **Comments:** Write comments that explain *why*, not just *what*. Especially for non-obvious GS1 edge cases.
- **No external libraries** without a very good reason and prior discussion in an issue.

---

## Pull Request Checklist

Before opening a PR, please confirm:

- [ ] The test suite passes: `node tests/test-suite.js`
- [ ] The app loads correctly in a browser (`python -m http.server`)
- [ ] Manual test: scan at least one barcode and check the result looks correct
- [ ] If you changed `gs1-registry.js`, cite the GS1 source URL in your PR description
- [ ] Your commit messages are descriptive (e.g. `fix: correct prefix 880 to cover South Korea only`)

---

## Commit Message Format

We loosely follow Conventional Commits:

```
type: short description

Optional longer explanation.
```

Types: `fix`, `feat`, `refactor`, `test`, `docs`, `style`, `chore`

---

## Questions?

Open a [GitHub Discussion](https://github.com/Samin-yasar/OriginScan/discussions) or file an issue — happy to help.
