# OriginScan 🌍

**Discover the origin of products instantly with a powerful and accessible barcode scanner.**

OriginScan is a web-based utility that allows you to scan EAN-13 and UPC-A barcodes to instantly find out the country of origin. Using your device's camera, uploading an image, or entering the code manually, you can get detailed information including the country's flag, region, population, and currency, all displayed on an interactive map.

[**View Live Demo**](https://samin-yasar.github.io/OriginScan/)

---

## Features

* **Multi-Input Scanning**:
    * **Live Camera Scan**: Use your device's camera for real-time barcode detection.
    * **File Upload**: Scan a barcode from an existing image (JPG, PNG).
    * **Manual Entry**: Type in the barcode number directly.
* **Instant Origin Lookup**: Identifies the GS1 prefix to determine the country or economic region where the barcode was registered.
* **Rich Country Data**: Fetches and displays additional details:
    * Official country name and flag.
    * Geographical region.
    * Real-time population data (via REST Countries API).
    * Primary currency.
* **Interactive Map**: Visualizes the product's country of origin on a dynamic map (powered by Leaflet.js and OpenStreetMap).
* **Scan History**: Automatically saves your last 20 scans in local storage for quick reference. You can view details or delete entries.
* **Data Export**: Export your entire scan history as a JSON file.
* **Share Results**: Easily share scan results via the Web Share API or copy them to your clipboard.
* **Full Accessibility Suite**:
    * Dark/Light Mode Theme.
    * Adjustable Text Size.
    * Color Inversion.
    * Link Highlighting.
    * Reading Guide.
* **Responsive Design**: A clean, modern UI that works seamlessly on desktop, tablet, and mobile devices.

---

## Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
* **Barcode Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
* **Interactive Maps**: [Leaflet.js](https://leafletjs.com/) with map tiles from [OpenStreetMap](https://www.openstreetmap.org/).
* **Country Data**: [REST Countries API](https://restcountries.com/)
* **Icons**: [Font Awesome](https://fontawesome.com/)

---

## How To Use

1.  **Start Scanning**:
    * Click **"Start Scanning"** to activate your camera. Position a product's barcode within the frame.
    * *or* Click **"Upload Barcode Image"** to select a picture from your device.
    * *or* Enter the 12-digit (UPC-A) or 13-digit (EAN-13) barcode number in the text field and click **"Check Origin"**.

2.  **View Results**:
    * The country of origin and other details will instantly appear in the "Product Origin" card.
    * The location will be pinned on the interactive map.

3.  **Manage History**:
    * Scroll down to the "Recent Scans" section to see your history.
    * Click the eye icon to re-run a scan or the trash icon to delete an entry.
    * Click "Clear All" to permanently delete your history.

4.  **Use Actions**:
    * **Report Suspicious**: If you think a barcode is incorrect, you can send a report.
    * **Export Data**: Download your scan history as a JSON file.
    * **Share Result**: Click the share icon on the results card to share a link to the result.

---

## Local Development

To run this project on your local machine, follow these steps.

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/samin-yasar/OriginScan.git](https://github.com/samin-yasar/OriginScan.git)
    cd OriginScan
    ```

2.  **Run a local server**:
    This project uses ES6 modules, which require a server environment to work correctly due to CORS policy. You can use any simple local server.

    If you have Python 3 installed, you can run:
    ```bash
    python -m http.server
    ```
    If you have Node.js installed, you can use the `serve` package:
    ```bash
    npx serve
    ```

3.  **Open in browser**:
    Navigate to `http://localhost:8000` (or the port specified by your server) in your web browser.

---

## Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to contribute.

1.  **Fork** the repository.
2.  Create a new branch: `git checkout -b feature/your-feature-name`.
3.  Make your changes and commit them: `git commit -m 'Add some feature'`.
4.  Push to the branch: `git push origin feature/your-feature-name`.
5.  Submit a **Pull Request**.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
