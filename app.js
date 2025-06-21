import { getCountryByEANPrefix } from './countries.js';
document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  // A centralized place to get all necessary elements from the HTML.
  const htmlRoot = document.getElementById('html-root');
  const scannerErrorElement = document.getElementById('scanner-error');
  const manualInputErrorElement = document.getElementById('manual-input-error');
  const countryInfoDisplay = document.getElementById('country-info');
  const placeholderState = countryInfoDisplay.querySelector('.placeholder-state');
  const countryResultDisplay = document.getElementById('country-result');
  const countryFlagElement = document.getElementById('country-flag');
  const countryNameElement = document.getElementById('country-name');
  const countryCodeElement = document.getElementById('country-code');
  const countryRegionElement = document.getElementById('country-region');
  const countryPopulationElement = document.getElementById('country-population');
  const countryCurrencyElement = document.getElementById('country-currency');
  const confidenceBadge = document.getElementById('confidence-badge');
  const confidenceValue = confidenceBadge.querySelector('.confidence-value');
  const scanCountElement = document.getElementById('scan-count');
  const scanStatusIndicator = document.querySelector('#scan-status .status-indicator');
  const scanStatusText = document.querySelector('#scan-status span');
  const startScanBtn = document.getElementById('start-scan');
  const stopScanBtn = document.getElementById('stop-scan');
  const switchCameraBtn = document.getElementById('switch-camera');
  const manualInput = document.getElementById('manual-input');
  const clearInputBtn = document.getElementById('clear-input');
  const checkManualBtn = document.getElementById('check-manual');
  const shareResultBtn = document.getElementById('share-result');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelpModalBtn = document.getElementById('close-help');
  const changelogBtn = document.getElementById('changelog-btn');
  const changelogModal = document.getElementById('changelog-modal');
  const closeChangelogBtn = document.getElementById('close-changelog');
  const loadingOverlay = document.getElementById('loading-overlay');
  const toastContainer = document.getElementById('toast-container');
  const reportSuspiciousBtn = document.getElementById('report-suspicious');
  const exportDataBtn = document.getElementById('export-data');
  const clearHistoryBtn = document.getElementById('clear-history');
  const scanHistoryList = document.getElementById('scan-history-list');
  const mapElement = document.getElementById('map');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetViewBtn = document.getElementById('reset-view');
  const readerElement = document.getElementById('reader');
  const importFromFileBtn = document.getElementById('import-from-file-btn');
  const barcodeFileInput = document.getElementById('barcode-file-input');
  const fileInputErrorElement = document.getElementById('file-input-error');
  const reportModal = document.getElementById('report-modal');
  const closeReportModalBtn = document.getElementById('close-report');
  const reportBarcodeInput = document.getElementById('report-barcode');
  const reportForm = document.getElementById('report-form');
  const accessibilityFab = document.querySelector('.accessibility-fab');
  const accessibilityBtn = document.getElementById('accessibility-btn');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const decreaseTextBtn = document.getElementById('decrease-text');
  const resetTextBtn = document.getElementById('reset-text');
  const increaseTextBtn = document.getElementById('increase-text');
  const invertColorsToggle = document.getElementById('invert-colors-toggle');
  const highlightLinksToggle = document.getElementById('highlight-links-toggle');
  const readingGuideToggle = document.getElementById('reading-guide-toggle');
  const readingGuide = document.getElementById('reading-guide');
  const resetAccessibilityBtn = document.getElementById('reset-accessibility');

  // --- Global variables ---
  let map = null;
  let scanner = null;
  let currentCountryMarker = null;
  let scanCount = parseInt(localStorage.getItem('scanCount') || '0');
  let cameras = [];
  let currentCameraIndex = 0;
  let isScanning = false;
  let lastScannedBarcode = null;

  // --- Accessibility Constants ---
  const FONT_STEP = 1;
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 24;
  const DEFAULT_FONT_SIZE = 16;

  // --- Initializations ---
  // Functions to run on page load to set up the application state.
  function initializeApp() {
    updateScanCountUI();
    updateScanStatus('Ready to scan', 'ready');
    initializeCameras();
    initializeAccessibility();
    renderScanHistory();
    resetProductOriginDisplay();
    initializeMap();
    handleUrlParameters();
  }

  // --- Utility Functions ---

  /**
   * Displays a toast notification.
   * @param {string} message - The message to display.
   * @param {string} type - 'success', 'error', 'info', or 'warning'.
   */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }[type] || 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span class="toast-message">${message}</span> <button class="toast-close-btn">&times;</button>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 5000);
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => toast.remove());
    });
  }

  /** Toggles the loading overlay. @param {boolean} show */
  function toggleLoadingOverlay(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  /** Updates the scan count display on the UI. */
  function updateScanCountUI() {
    if (scanCountElement) scanCountElement.textContent = scanCount;
  }

  /**
   * Updates the scanner status text and indicator color.
   * @param {string} text - The status message.
   * @param {string} statusType - 'ready', 'scanning', or 'error'.
   */
  function updateScanStatus(text, statusType) {
    if (scanStatusText) scanStatusText.textContent = text;
    if (scanStatusIndicator) {
      scanStatusIndicator.className = 'status-indicator';
      scanStatusIndicator.classList.add(statusType);
    }
  }

  /**
   * Updates an error message element's text and visibility.
   * @param {HTMLElement} element - The DOM element to update.
   * @param {string} message - The error message to display.
   */
  function updateErrorElement(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = message ? 'block' : 'none';
    }
  }

  /**
   * Displays the product origin information on the UI.
   * @param {object} country - The country object from countries.js.
   * @param {string} barcode - The full barcode string.
   * @param {number|string} population - The population to display.
   * @param {string} confidence - The confidence string (e.g., '99%').
   */
  function displayProductOrigin(country, barcode, population, confidence) {
    if (placeholderState) placeholderState.style.display = 'none';
    if (countryResultDisplay) countryResultDisplay.style.display = 'block';
    if (shareResultBtn) shareResultBtn.style.display = 'inline-flex';

    countryFlagElement.textContent = country.flag;
    countryNameElement.textContent = country.name;
    countryCodeElement.textContent = `Prefix: ${barcode.slice(0, 3)}`;
    confidenceValue.textContent = confidence;
    countryRegionElement.textContent = country.region || 'N/A';
    countryPopulationElement.textContent = population ? population.toLocaleString() : 'N/A';
    countryCurrencyElement.textContent = country.currency || 'N/A';

    addScanToHistory({
      barcode: barcode,
      country: country.name,
      flag: country.flag,
      timestamp: new Date().toLocaleString()
    });
  }

  /** Resets the product origin display to its placeholder state. */
  function resetProductOriginDisplay() {
    if (placeholderState) placeholderState.style.display = 'flex';
    if (countryResultDisplay) countryResultDisplay.style.display = 'none';
    if (shareResultBtn) shareResultBtn.style.display = 'none';
    showMapLocation('World'); // Reset map to world view
  }

  /** Checks for a 'barcode' URL parameter and processes it on load. */
  function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const barcodeFromUrl = urlParams.get('barcode');
    if (barcodeFromUrl) {
      if (manualInput) {
        manualInput.value = barcodeFromUrl;
        setTimeout(() => handleBarcodeSubmission(barcodeFromUrl), 500);
      }
    }
  }

  // --- Map Logic ---

  /** Initializes the Leaflet map on page load. */
  function initializeMap() {
    if (!mapElement) return;
    map = L.map('map').setView([20, 0], 2); // Centered world view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ensure map resizes correctly if its container changes size
    new ResizeObserver(() => map && map.invalidateSize()).observe(mapElement);
  }

  /**
   * Updates the map to show a country's location.
   * @param {string} countryApiName - The clean country name for API lookup.
   */
  async function showMapLocation(countryApiName) {
    if (!map) return;
    if (currentCountryMarker) map.removeLayer(currentCountryMarker);
    if (countryApiName === 'World' || countryApiName === 'Unknown') {
      map.setView([20, 0], 2);
      return;
    }

    toggleLoadingOverlay(true);
    const countryCoords = await getCountryCoordinates(countryApiName);
    toggleLoadingOverlay(false);

    if (countryCoords) {
      currentCountryMarker = L.marker(countryCoords).addTo(map).bindPopup(`<b>${countryApiName}</b>`).openPopup();
      map.setView(countryCoords, 5);
      showToast(`Map updated for ${countryApiName}`, 'info');
    } else {
      map.setView([20, 0], 2);
      showToast(`Could not find map location for ${countryApiName}.`, 'warning');
    }
  }

  /**
   * Fetches coordinates for a country using OpenStreetMap Nominatim.
   * @param {string} country - The name of the country.
   * @returns {Promise<[number, number]|null>}
   */
  async function getCountryCoordinates(country) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(country)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'OriginScan/1.2 (github.com/samin-yasar/OriginScan)' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.warn(`Failed to fetch coordinates for ${country}:`, error);
    }
    return null;
  }

  /**
   * Fetches population data using Rest Countries API.
   * @param {string} countryApiName - The clean country name for the API.
   * @returns {Promise<number|null>}
   */
  async function getCountryPopulation(countryApiName) {
    if (!countryApiName || countryApiName === "Unknown") return null;
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryApiName)}?fields=population`, {
        headers: { 'User-Agent': 'OriginScan/1.2' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return (data && data.length > 0) ? data[0].population : null;
    } catch (error) {
      console.error(`Failed to fetch population for ${countryApiName}:`, error);
      return null;
    }
  }


  // --- Core Barcode Logic ---

  /**
   * Central handler for all barcode submissions (camera, manual, file).
   * Validates and cleans the barcode before processing.
   * @param {string} barcodeValue - The raw barcode string.
   */
  async function handleBarcodeSubmission(barcodeValue) {
    clearAllErrors();
    if (!barcodeValue) {
      updateErrorElement(manualInputErrorElement, 'Please enter a barcode number.');
      return;
    }

    let cleanBarcode = barcodeValue.trim().replace(/\D/g, '');

    // IMPROVEMENT: Handle 12-digit UPC-A by padding with a leading '0' to make it EAN-13.
    if (cleanBarcode.length === 12) {
      cleanBarcode = '0' + cleanBarcode;
      console.log(`UPC-A detected. Padded to EAN-13: ${cleanBarcode}`);
    }

    if (cleanBarcode.length !== 13) {
      const errorMsg = 'Enter a valid 13-digit (EAN-13) or 12-digit (UPC-A) barcode.';
      updateErrorElement(isScanning ? scannerErrorElement : manualInputErrorElement, errorMsg);
      showToast('Invalid barcode length.', 'error');
      return;
    }

    if (isScanning) await stopScanner();

    if (manualInput) manualInput.value = cleanBarcode;
    await processBarcode(cleanBarcode);
  }


  /**
   * Processes a valid EAN-13 barcode to find its origin and display info.
   * @param {string} barcode - A 13-digit barcode string.
   */
  async function processBarcode(barcode) {
    lastScannedBarcode = barcode;
    const prefix = barcode.slice(0, 3);
    console.log(`Processing EAN-13 prefix: "${prefix}"`);

    toggleLoadingOverlay(true);
    const country = getCountryByEANPrefix(prefix);
    let confidence = '0%';
    let population = null;

    if (country && country.name !== "Unknown Origin") {
      confidence = '99%';
      // IMPROVEMENT: Use the clean 'apiLookupName' for external API calls.
      const apiName = country.apiLookupName || country.name.split(' (')[0];
      population = await getCountryPopulation(apiName);
      displayProductOrigin(country, barcode, population, confidence);
      await showMapLocation(apiName);

      scanCount++;
      localStorage.setItem('scanCount', scanCount);
      updateScanCountUI();
      showToast(`Scanned: ${country.name}`, 'success');
      updateScanStatus('Scan successful', 'ready');
    } else {
      const unknownCountry = { name: "Unknown Origin", flag: "❓", region: "N/A", currency: "N/A" };
      displayProductOrigin(unknownCountry, barcode, null, '0%');
      showToast('Could not determine origin for this barcode.', 'warning');
      updateScanStatus('Unknown origin', 'error');
    }
    toggleLoadingOverlay(false);
  }

  // --- Scanner Logic (Camera & File) ---

  /** Initializes camera list using Html5Qrcode. */
  async function initializeCameras() {
    if (typeof Html5Qrcode === 'undefined') {
      updateErrorElement(scannerErrorElement, "Scanner library not loaded.");
      updateScanStatus('Scanner error', 'error');
      if (startScanBtn) startScanBtn.disabled = true;
      return;
    }
    try {
      const devices = await Html5Qrcode.getCameras();
      cameras = devices || [];
      if (cameras.length === 0) {
        updateErrorElement(scannerErrorElement, 'No cameras found.');
        if (startScanBtn) startScanBtn.disabled = true;
      } else {
        const backCameraIndex = cameras.findIndex(d => d.label.toLowerCase().includes('back'));
        currentCameraIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
        if (startScanBtn) startScanBtn.disabled = false;
      }
    } catch (err) {
      updateErrorElement(scannerErrorElement, `Camera access failed. Please allow camera permissions.`);
      updateScanStatus('Camera error', 'error');
      if (startScanBtn) startScanBtn.disabled = true;
    }
  }

  /** Starts the barcode scanning session. */
  function startScanner() {
    if (isScanning || cameras.length === 0) return;
    clearAllErrors();
    
    // Ensure 'reader' div is ready for the scanner instance
    if (!readerElement) {
        updateErrorElement(scannerErrorElement, "Scanner display area not found.");
        return;
    }
    scanner = new Html5Qrcode('reader');

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => ({
        width: viewfinderWidth * 0.8,
        height: Math.min(viewfinderHeight * 0.4, 200)
      }),
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128
      ]
    };

    scanner.start({ deviceId: { exact: cameras[currentCameraIndex].id } }, config, onScanSuccess, onScanFailure)
      .then(() => {
        isScanning = true;
        updateScanStatus('Scanning...', 'scanning');
        if (readerElement) readerElement.classList.add('active');
        if (startScanBtn) startScanBtn.style.display = 'none';
        if (stopScanBtn) stopScanBtn.style.display = 'inline-flex';
        if (switchCameraBtn) switchCameraBtn.style.display = cameras.length > 1 ? 'inline-flex' : 'none';
      })
      .catch(err => {
        updateErrorElement(scannerErrorElement, `Failed to start scanner: ${err.message}`);
        updateScanStatus('Scanner failed', 'error');
        isScanning = false;
      });
  }

  /** Stops the barcode scanning session. */
  async function stopScanner() {
    if (!scanner || !isScanning) return;
    isScanning = false;
    try {
      await scanner.stop();
    } catch (err) {
      console.error("Error stopping scanner:", err);
    } finally {
      if (scanner) scanner.clear();
      scanner = null;
      updateScanStatus('Scan stopped', 'ready');
      if (readerElement) readerElement.classList.remove('active');
      if (startScanBtn) startScanBtn.style.display = 'inline-flex';
      if (stopScanBtn) stopScanBtn.style.display = 'none';
      if (switchCameraBtn) switchCameraBtn.style.display = 'none';
    }
  }

  /** Switches to the next available camera. */
  async function switchCamera() {
    if (cameras.length < 2) return;
    await stopScanner();
    currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
    showToast(`Switching to ${cameras[currentCameraIndex].label || `camera ${currentCameraIndex + 1}`}`, 'info');
    setTimeout(startScanner, 100);
  }

  /**
   * Callback for successful camera scans.
   * @param {string} decodedText - The decoded barcode string.
   */
  function onScanSuccess(decodedText) {
    if (!isScanning) return; // Prevent multiple triggers
    console.log(`Raw barcode from camera: "${decodedText}"`);
    handleBarcodeSubmission(decodedText);
  }

  /**
   * Callback for camera scan failures.
   * @param {Error} error - The error object.
   */
  function onScanFailure(error) {
    if (isScanning && !`${error}`.includes('NotFoundException')) {
      console.warn(`Scan error: ${error}`);
    }
  }

  /** Handles the file input for uploading a barcode image. */
  async function handleFileInput(e) {
    if (e.target.files.length === 0) return;
    const imageFile = e.target.files[0];
    clearAllErrors();
    toggleLoadingOverlay(true);

    try {
      if (isScanning) await stopScanner();
      if (!scanner) scanner = new Html5Qrcode('reader');

      const decodedText = await scanner.scanFile(imageFile, true);
      handleBarcodeSubmission(decodedText);
    } catch (err) {
      updateErrorElement(fileInputErrorElement, `Error processing image. No barcode found.`);
      showToast('Failed to scan barcode from file.', 'error');
    } finally {
      toggleLoadingOverlay(false);
      if (barcodeFileInput) barcodeFileInput.value = ''; // Reset file input
    }
  }

  // --- Manual Input ---

  /** Clears the manual barcode input field and any associated errors. */
  function clearManualInput() {
    if (manualInput) manualInput.value = '';
    updateErrorElement(manualInputErrorElement, '');
  }

  /** Clears all error messages on the UI. */
  function clearAllErrors() {
    updateErrorElement(scannerErrorElement, '');
    updateErrorElement(manualInputErrorElement, '');
    updateErrorElement(fileInputErrorElement, '');
  }

  // --- Modals, History, and other UI logic ---

  function openModal(modal) { if (modal) modal.classList.add('active'); }
  function closeModal(modal) { if (modal) modal.classList.remove('active'); }
  function loadScanHistory() { return JSON.parse(localStorage.getItem('scanHistory')) || []; }
  function saveScanHistory(history) { localStorage.setItem('scanHistory', JSON.stringify(history)); }

  function addScanToHistory(scanItem) {
    let history = loadScanHistory();
    history.unshift(scanItem);
    if (history.length > 20) history.pop(); // Keep last 20 scans
    saveScanHistory(history);
    renderScanHistory();
  }

  function renderScanHistory() {
    if (!scanHistoryList) return;
    scanHistoryList.innerHTML = '';
    const history = loadScanHistory();

    if (history.length === 0) {
      scanHistoryList.innerHTML = `<div class="empty-state"><i class="fas fa-barcode"></i><p>No recent scans</p></div>`;
      return;
    }

    history.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'scan-item';
      el.innerHTML = `
        <div class="scan-info">
          <div class="scan-country-flag">${item.flag}</div>
          <div class="scan-details">
            <span>${item.country}</span>
            <small>${item.barcode} | ${item.timestamp}</small>
          </div>
        </div>
        <div class="scan-actions">
          <button class="scan-action-btn view-details-btn" data-barcode="${item.barcode}" title="View Details"><i class="fas fa-eye"></i></button>
          <button class="scan-action-btn delete-scan-btn" data-index="${index}" title="Delete Scan"><i class="fas fa-trash-alt"></i></button>
        </div>`;
      scanHistoryList.appendChild(el);
    });

    scanHistoryList.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const barcodeToView = e.currentTarget.dataset.barcode;
        handleBarcodeSubmission(barcodeToView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    scanHistoryList.querySelectorAll('.delete-scan-btn').forEach(btn => {
      btn.addEventListener('click', (e) => deleteScanHistoryItem(parseInt(e.currentTarget.dataset.index)));
    });
  }

  function deleteScanHistoryItem(index) {
    let history = loadScanHistory();
    history.splice(index, 1);
    saveScanHistory(history);
    renderScanHistory();
    showToast('Scan history item deleted.', 'info');
  }

  function clearAllScanHistory() {
    saveScanHistory([]);
    renderScanHistory();
    showToast('All scan history cleared!', 'info');
  }

  function exportScanHistory() {
    const history = loadScanHistory();
    if (history.length === 0) {
      showToast('No scan history to export.', 'info');
      return;
    }
    const jsonString = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Scan history exported!', 'success');
  }

  async function shareResult() {
    const country = countryNameElement ? countryNameElement.textContent : 'N/A';
    const barcode = lastScannedBarcode || 'N/A';
    const shareUrl = `https://samin-yasar.github.io/OriginScan?barcode=${barcode}`;
    const shareText = `I scanned a product from ${country}! Barcode: ${barcode}. Check it out on OriginScan.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'OriginScan Result', text: shareText, url: shareUrl });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
        showToast('Result copied to clipboard!', 'success');
      }).catch(err => {
        showToast('Failed to copy result.', 'error');
      });
    }
  }
  
  async function handleReportSubmit(e) {
    e.preventDefault();
    toggleLoadingOverlay(true);
    try {
        const response = await fetch(reportForm.action, {
            method: reportForm.method,
            body: new FormData(reportForm),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            showToast('Report sent! Thank you.', 'success');
            closeModal(reportModal);
            reportForm.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        showToast('Error sending report. Please try again.', 'error');
    } finally {
        toggleLoadingOverlay(false);
    }
  }

  // --- Accessibility ---
  function applyAccessibilitySetting(key, value) {
    localStorage.setItem(key, value);
    updateUIForAccessibility();
  }

  function updateUIForAccessibility() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDarkMode);
    if (darkModeToggle) {
      darkModeToggle.classList.toggle('active', isDarkMode);
      darkModeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    const fontSize = parseInt(localStorage.getItem('fontSize') || DEFAULT_FONT_SIZE);
    htmlRoot.style.fontSize = `${fontSize}px`;

    const invertColors = localStorage.getItem('invertColors') === 'true';
    document.body.classList.toggle('invert-colors', invertColors);
    if (invertColorsToggle) invertColorsToggle.classList.toggle('active', invertColors);

    const highlightLinks = localStorage.getItem('highlightLinks') === 'true';
    document.body.classList.toggle('highlight-links', highlightLinks);
    if (highlightLinksToggle) highlightLinksToggle.classList.toggle('active', highlightLinks);

    const readingGuideActive = localStorage.getItem('readingGuide') === 'true';
    document.body.classList.toggle('reading-guide-active', readingGuideActive);
    if (readingGuide) readingGuide.style.display = readingGuideActive ? 'block' : 'none';
    if (readingGuideToggle) readingGuideToggle.classList.toggle('active', readingGuideActive);
  }

  function initializeAccessibility() {
    if (accessibilityBtn && accessibilityFab) {
      accessibilityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accessibilityFab.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!accessibilityFab.contains(e.target) && !accessibilityBtn.contains(e.target)) {
          accessibilityFab.classList.remove('open');
        }
      });
    }

    if (darkModeToggle) darkModeToggle.addEventListener('click', () => applyAccessibilitySetting('darkMode', !document.body.classList.contains('dark')));
    if (increaseTextBtn) increaseTextBtn.addEventListener('click', () => applyAccessibilitySetting('fontSize', Math.min(MAX_FONT_SIZE, parseInt(htmlRoot.style.fontSize || DEFAULT_FONT_SIZE) + FONT_STEP)));
    if (decreaseTextBtn) decreaseTextBtn.addEventListener('click', () => applyAccessibilitySetting('fontSize', Math.max(MIN_FONT_SIZE, parseInt(htmlRoot.style.fontSize || DEFAULT_FONT_SIZE) - FONT_STEP)));
    if (resetTextBtn) resetTextBtn.addEventListener('click', () => applyAccessibilitySetting('fontSize', DEFAULT_FONT_SIZE));
    if (invertColorsToggle) invertColorsToggle.addEventListener('click', () => applyAccessibilitySetting('invertColors', localStorage.getItem('invertColors') !== 'true'));
    if (highlightLinksToggle) highlightLinksToggle.addEventListener('click', () => applyAccessibilitySetting('highlightLinks', localStorage.getItem('highlightLinks') !== 'true'));
    if (readingGuideToggle) readingGuideToggle.addEventListener('click', () => applyAccessibilitySetting('readingGuide', localStorage.getItem('readingGuide') !== 'true'));
    
    if (readingGuide) window.addEventListener('mousemove', (e) => {
      if (localStorage.getItem('readingGuide') === 'true') readingGuide.style.transform = `translateY(${e.clientY}px)`;
    });

    if (resetAccessibilityBtn) resetAccessibilityBtn.addEventListener('click', () => {
      ['darkMode', 'fontSize', 'invertColors', 'highlightLinks', 'readingGuide'].forEach(key => localStorage.removeItem(key));
      updateUIForAccessibility();
      showToast('Accessibility settings reset.', 'info');
    });

    updateUIForAccessibility();
  }
  
  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Scanner
    if (startScanBtn) startScanBtn.addEventListener('click', startScanner);
    if (stopScanBtn) stopScanBtn.addEventListener('click', stopScanner);
    if (switchCameraBtn) switchCameraBtn.addEventListener('click', switchCamera);
    if (importFromFileBtn) importFromFileBtn.addEventListener('click', () => barcodeFileInput.click());
    if (barcodeFileInput) barcodeFileInput.addEventListener('change', handleFileInput);

    // Manual Input
    if (checkManualBtn) checkManualBtn.addEventListener('click', () => handleBarcodeSubmission(manualInput.value));
    if (clearInputBtn) clearInputBtn.addEventListener('click', clearManualInput);
    if (manualInput) manualInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleBarcodeSubmission(manualInput.value);
    });

    // Map Controls
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => map && map.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => map && map.zoomOut());
    if (resetViewBtn) resetViewBtn.addEventListener('click', () => showMapLocation('World'));

    // Modals
    if (helpBtn) helpBtn.addEventListener('click', () => openModal(helpModal));
    if (closeHelpModalBtn) closeHelpModalBtn.addEventListener('click', () => closeModal(helpModal));
    if (helpModal) helpModal.addEventListener('click', (e) => e.target === helpModal && closeModal(helpModal));
    if (changelogBtn) changelogBtn.addEventListener('click', () => openModal(changelogModal));
    if (closeChangelogBtn) closeChangelogBtn.addEventListener('click', () => closeModal(changelogModal));
    if (changelogModal) changelogModal.addEventListener('click', (e) => e.target === changelogModal && closeModal(changelogModal));
    
    // Report Modal
    if (reportSuspiciousBtn) reportSuspiciousBtn.addEventListener('click', () => {
        if (reportBarcodeInput) reportBarcodeInput.value = lastScannedBarcode || '';
        openModal(reportModal);
    });
    if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', () => closeModal(reportModal));
    if (reportModal) reportModal.addEventListener('click', (e) => e.target === reportModal && closeModal(reportModal));
    if (reportForm) reportForm.addEventListener('submit', handleReportSubmit);

    // Actions
    if (shareResultBtn) shareResultBtn.addEventListener('click', shareResult);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearAllScanHistory);
    if (exportDataBtn) exportDataBtn.addEventListener('click', exportScanHistory);
    
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', { message, source, lineno, colno, error });
      updateErrorElement(scannerErrorElement, `An unexpected error occurred. Please refresh the page.`);
    };
  }

  // --- App Entry Point ---
  initializeApp();
  setupEventListeners();

}); 
