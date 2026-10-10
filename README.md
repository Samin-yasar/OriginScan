# OriginScan 🌍

![OriginScan Preview](assets/preview.png)

**Client-side barcode scanner that looks up GS1 registration countries offline and queries Open Food Facts to distinguish barcode registration from actual manufacturing origin.**

[**View Live Demo**](https://originscan.samin-yasar.dev) · [**Report a Bug**](https://github.com/Samin-yasar/OriginScan/issues) · [**Contributing Guide**](CONTRIBUTING.md) · [**Accessibility**](ACCESSIBILITY.md)

---

## What Makes OriginScan Different?

Most barcode tools naively match 3 digits and claim "Made in France" — even if the product was manufactured elsewhere and only registered by a French parent company.

OriginScan solves this with a **Multi-Tier Resolution Engine**:
1. **Format Validation & Mod-10 Checksum**: Verifies the barcode GS1 Mod-10 check digit and diagnoses typos before making any queries.
2. **Offline GS1 Registry**: Maps over 150 prefix blocks with support for 2-digit, 3-digit, and 4-digit prefixes, special ranges (ISBN, ISSN, coupons), and restricted in-store barcodes. **This lookup runs entirely in the browser — no server involved.**
3. **Open Product Database (Tier 2)**: Queries the public Open Food Facts crowd-sourced database (with local in-memory LRU caching) to fetch actual product names, brands, images, and **declared manufacturing origins**.
4. **Origin Transparency**: Separates the GS1 registration country from product-database origin information, which may describe ingredients rather than manufacturing.

> **No proprietary backend.** OriginScan has no server of its own. The GS1 prefix table is bundled in `js/core/gs1-registry.js` and resolved 100% locally. Product lookups go to two public, unauthenticated APIs — Open Food Facts (`world.openfoodfacts.org`) and Open Library (`openlibrary.org`). The "Report suspicious result" form is processed by [FormSubmit](https://formsubmit.co) and e-mailed to the project maintainer; no data is stored by OriginScan itself.

---

## Features

* **Multi-Input Scanning**:
    * **Live Camera Scan**: Real-time detection using html5-qrcode with BarcodeDetector API acceleration where supported.
    * **File Upload**: Scan barcodes directly from images (JPG, PNG).
    * **Manual Entry & Paste**: Type or paste barcodes with automatic whitespace and dash stripping.
* **Accuracy & Validation**:
    * **GS1 Mod-10 Checksum Algorithm**: Instantly warns if a barcode is mistyped, tampered, or invalid, showing the expected check digit.
    * **Format Support**: EAN-13, UPC-A (auto-normalised), UPC-E (zero-expansion algorithm), and EAN-8.
* **Dual-Origin & Product Data**:
    * **Product Preview**: Shows product title, brand, category, and photo when available.
    * **Origin context**: Labels GS1 registration data and third-party reported origin data separately instead of presenting either as definitive manufacturing proof.
* **Geographical & Economic Insights**:
    * Official country name, flag, region, primary currency, and population data.
    * Dynamic interactive map powered by Leaflet.js and OpenStreetMap.
* **Zero Cost & Open Source**:
    * No paid product APIs required — Open Food Facts and Open Library are used without credentials.
    * Client-side LRU cache to minimize network calls and respect public API rate limits.
* **Scan History & Export**:
    * Local history storage (up to 20 scans) with JSON export.
* **Full Accessibility Suite**:
    * Dark / Light mode, high-contrast inversion, adjustable typography, and reading guides.

---

## Project Architecture

```
OriginScan/
├── app.js                   # Application coordinator & UI event handlers
├── index.html               # Main layout and accessible markup
├── style.css                # Responsive styles & design system
├── js/
│   └── core/
│       ├── validator.js     # Mod-10 check digit, UPC-E expander, format normalizer
│       ├── gs1-registry.js  # GS1 prefix table (offline lookup, 150+ ranges)
│       ├── product-api.js   # Product APIs (Open Food Facts, Open Library) with LRU caching
│       └── engine.js        # Multi-tier lookup orchestrator
├── tests/
│   └── test-suite.js        # Zero-dependency Node.js test suite (46+ assertions)
├── policy/                  # Privacy notice, Terms of Service, Disclaimer
└── .github/
    └── ISSUE_TEMPLATE/      # Structured bug report & feature request templates
```

---

## GS1 Prefix Data — Source & Provenance

The offline prefix table in [`js/core/gs1-registry.js`](js/core/gs1-registry.js) is derived from the **GS1 General Specifications** (Section 2.1 — GS1 Company Prefix allocation) and the official registry at:

> **https://www.gs1.org/standards/id-keys/company-prefix**

| Detail | Value |
|---|---|
| Source | GS1 General Specifications, published by GS1 AISBL |
| Coverage | 150+ prefix blocks (2-digit, 3-digit, 4-digit) |
| Special ranges | ISBN 978/979, ISSN 977, coupons/vouchers 981–984 |
| Restricted in-store | 020–029, 040–049, 200–299 (never registered to a country) |
| Lookup mode | **100% offline — runs in the browser, no network request** |
| Limitation | GS1 prefix = country of *barcode registration*, **not** manufacturing origin |

GS1 does not publish a machine-readable dump of the complete prefix list. The table was assembled manually from the published General Specifications and spot-checked against known product databases. If you find an error or a newly allocated range, please [open an issue](https://github.com/Samin-yasar/OriginScan/issues) citing the GS1 source.

---

## Optional REST Countries Fallback

Country details are loaded from the bundled dataset first. For countries not included there, the app can use the REST Countries API v3 when the page is configured with an API key before the modules load:

```html
<script>
  globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY = 'your-api-key';
</script>
<script type="module" src="./app.js"></script>
```

> ⚠️ **Security notice**: Any value placed here is **publicly visible** to anyone who views the page source or DevTools. Do **not** use a key with billing attached or one that must remain secret. The live demo at `originscan.samin-yasar.dev` does not set this key.

Without this optional key, the app remains fully functional using the bundled country data and simply skips the online fallback.

---

## Local Development

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/samin-yasar/OriginScan.git
   cd OriginScan
   ```

2. **Start a local static server**:
   Because OriginScan uses ES6 modules, files must be served over HTTP(S):
   ```bash
   # Using Python 3:
   python3 -m http.server 8000

   # Or using Node.js:
   npx serve .
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`.

---

## Running Tests

OriginScan includes a comprehensive, zero-dependency unit test suite testing the Mod-10 algorithm, barcode format sanitization, UPC-E expansion, and GS1 prefix resolution.

Run it with standard Node.js:
```bash
node tests/test-suite.js
```

---

## Contributing

Contributions are warmly welcomed! Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) guide for details on our code style, architecture, test guidelines, and PR workflow.

---

## License

Copyright (C) 2025 [**Samin Yasar**](https://github.com/Samin-yasar).  
This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License (GPL v3)** as published by the Free Software Foundation, version 3 of the License. See the [LICENSE](LICENSE) file for details.
