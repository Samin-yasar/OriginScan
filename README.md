# OriginScan 🌍

**Discover the origin of products instantly with a powerful, developer-friendly, and open-source barcode scanner.**

OriginScan is a client-side web utility that scans EAN-13, UPC-A, UPC-E, and EAN-8 barcodes to determine their country of origin and product details. Combining a comprehensive offline **GS1 prefix registry** with free, community-driven APIs like **Open Food Facts**, OriginScan can distinguish between where a barcode was *registered* and where a product was actually *manufactured*.

[**View Live Demo**](https://originscan.samin-yasar.dev) · [**Report a Bug**](https://github.com/Samin-yasar/OriginScan/issues) · [**Contributing Guide**](CONTRIBUTING.md)

---

## What Makes OriginScan Different?

Most barcode tools naively match 3 digits and claim "Made in France" — even if the product was manufactured elsewhere and only registered by a French parent company.

OriginScan solves this with a **Multi-Tier Resolution Engine**:
1. **Format Validation & Mod-10 Checksum**: Verifies the barcode's GS1 Mod-10 check digit and diagnoses typos before making any queries.
2. **Offline GS1 Registry**: Maps over 150 prefix blocks with support for 2-digit, 3-digit, and 4-digit prefixes, special ranges (ISBN, ISSN, coupons), and restricted in-store barcodes.
3. **Open Product Database (Tier 2)**: Queries the public Open Food Facts crowd-sourced database (with local in-memory LRU caching) to fetch actual product names, brands, images, and **declared manufacturing origins**.
4. **Dual Origin Transparency**: Displays both the GS1 registration origin and the physical manufacturing origin side-by-side with clear confidence indicators.

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
    * **Dual Origin Badges**: Explicitly contrasts "GS1 Registered Origin" vs. "Physical Manufacturing Origin".
    * **Confidence Scoring**: Transparent rating (High / Medium / Low) based on data verification sources.
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

### Optional REST Countries fallback

Country details are loaded from the bundled dataset first. For countries not included
there, the app can use REST Countries API v5 when the page is configured with an API
key before the modules load:

```html
<script>
  globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY = 'your-api-key';
</script>
<script type="module" src="./app.js"></script>
```

Without this optional key, the app remains fully functional using the bundled country
data and simply skips the online fallback.

### Manual SSH push workflow

The repository includes a manual GitHub Actions workflow at
`.github/workflows/push-over-ssh.yml`. It runs the test suite before pushing generated
changes over SSH. It does not run for ordinary pushes.

Configure these repository secrets before using the workflow:

1. `SSH_PRIVATE_KEY`: an Ed25519 private key whose public key has write access to this
   repository. Do not commit or print this value.
2. `SSH_KNOWN_HOSTS`: the pinned `github.com` host key collected from a trusted
   environment, for example:

   ```bash
   ssh-keyscan -t ed25519 github.com
   ```

Trigger it from **Actions → Push generated changes over SSH → Run workflow**. The
workflow uses the selected branch, runs `npm install` and `npm test`, and only creates a
commit when generated changes are present.

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
