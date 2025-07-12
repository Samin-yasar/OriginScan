/*
 * OriginScan - Improved Mobile Scanner
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { getCountryByEANPrefix } from './countries.js';

document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
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
  const enhanceScanBtn = document.getElementById('enhance-scan-btn');
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

  // --- Global State Variables ---
  let scanCount = parseInt(localStorage.getItem('scanCount') || '0');
  let cameras = [];
  let currentCameraIndex = 0;
  let isScanning = false;
  let lastScannedBarcode = null;
  let scanner = null;
  let map = null;
  let currentCountryMarker = null;
  let scanTimeout = null; // For debouncing scans
  let lastSuccessfulScan = null; // To prevent duplicate scans

  // --- Accessibility Constants ---
  const FONT_STEP = 1;
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 24;
  const DEFAULT_FONT_SIZE = 16;

  // --- Mobile Detection ---
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // --- Initializations ---
  function initializeApp() {
    updateScanCountUI();
    updateScanStatus('Ready to scan', 'ready');
    initializeCameras();
    initializeAccessibility();
    renderScanHistory();
    resetProductOriginDisplay();
    initializeMap();
    handleUrlParameters();
    
    // Mobile-specific initialization
    if (isMobile) {
      optimizeForMobile();
    }
  }

  // --- Mobile Optimization ---
  function optimizeForMobile() {
    // Prevent zoom on double tap
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });

    // Prevent zoom on input focus (iOS)
    if (isIOS) {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', function() {
          this.style.fontSize = '16px';
        });
        input.addEventListener('blur', function() {
          this.style.fontSize = '';
        });
      });
    }

    // Add mobile-specific classes
    document.body.classList.add('mobile-device');
    if (isIOS) {
      document.body.classList.add('ios-device');
    }
  }

  // --- Image Enhancement ---
  function applyContrastAndGrayscale(imageData, contrast) {
    const data = imageData.data;
    const factor = (259 * (contrast * 255 + 259)) / (255 * (259 - contrast * 255));
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      let contrastedValue = factor * (gray - 128) + 128;
      contrastedValue = Math.max(0, Math.min(255, contrastedValue));
      data[i] = data[i + 1] = data[i + 2] = contrastedValue;
    }
  }

  function applySharpen(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dstOff = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;
        
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
              const srcOff = (scy * width + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }
        
        dst[dstOff] = Math.max(0, Math.min(255, r));
        dst[dstOff + 1] = Math.max(0, Math.min(255, g));
        dst[dstOff + 2] = Math.max(0, Math.min(255, b));
        dst[dstOff + 3] = src[dstOff + 3];
      }
    }
    
    ctx.putImageData(new ImageData(dst, width, height), 0, 0);
  }

  function enhanceFrameForScanning(video) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    // Apply image enhancements
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyContrastAndGrayscale(imageData, 0.3);
    ctx.putImageData(imageData, 0, 0);
    applySharpen(ctx, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png');
  }

  async function handleEnhanceAndScan() {
    if (!isScanning) {
      showToast('Start the scanner first!', 'warning');
      return;
    }
    
    const video = readerElement.querySelector('video');
    if (!video) {
      showToast('Could not find video stream.', 'error');
      return;
    }
    
    toggleLoadingOverlay(true);
    showToast('Enhancing image...', 'info');
    
    try {
      const enhancedDataUrl = enhanceFrameForScanning(video);
      const blob = await (await fetch(enhancedDataUrl)).blob();
      const imageFile = new File([blob], 'enhanced-frame.png', { type: blob.type });
      
      const decodedText = await scanner.scanFile(imageFile, false);
      await handleBarcodeSubmission(decodedText);
    } catch (err) {
      console.error('Enhanced scan failed:', err);
      updateErrorElement(scannerErrorElement, 'Could not decode barcode from enhanced image.');
      showToast('Enhancement failed to find a barcode.', 'error');
    } finally {
      toggleLoadingOverlay(false);
    }
  }

  // --- Utility Functions ---
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

  function toggleLoadingOverlay(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  function updateScanCountUI() {
    if (scanCountElement) scanCountElement.textContent = scanCount;
  }

  function updateScanStatus(text, statusType) {
    if (scanStatusText) scanStatusText.textContent = text;
    if (scanStatusIndicator) {
      scanStatusIndicator.className = 'status-indicator';
      scanStatusIndicator.classList.add(statusType);
    }
  }

  function updateErrorElement(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = message ? 'block' : 'none';
    }
  }

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

  function resetProductOriginDisplay() {
    if (placeholderState) placeholderState.style.display = 'flex';
    if (countryResultDisplay) countryResultDisplay.style.display = 'none';
    if (shareResultBtn) shareResultBtn.style.display = 'none';
    showMapLocation('World');
  }

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
  function initializeMap() {
    if (!mapElement) return;
    if (map) map.remove();
    
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    new ResizeObserver(() => map && map.invalidateSize()).observe(mapElement);
  }

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
      currentCountryMarker = L.marker(countryCoords).addTo(map)
        .bindPopup(`<b>${countryApiName}</b>`).openPopup();
      map.setView(countryCoords, 5);
      showToast(`Map updated for ${countryApiName}`, 'info');
    } else {
      map.setView([20, 0], 2);
      showToast(`Could not find map location for ${countryApiName}.`, 'warning');
    }
  }

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
  async function handleBarcodeSubmission(barcodeValue) {
    clearAllErrors();
    
    if (!barcodeValue) {
      updateErrorElement(manualInputErrorElement, 'Please enter a barcode number.');
      return;
    }

    let cleanBarcode = barcodeValue.trim().replace(/\D/g, '');

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

    // Prevent duplicate scans within 3 seconds
    if (lastSuccessfulScan === cleanBarcode && scanTimeout) {
      return;
    }

    if (isScanning) await stopScanner();
    if (manualInput) manualInput.value = cleanBarcode;
    
    lastSuccessfulScan = cleanBarcode;
    await processBarcode(cleanBarcode);
    
    // Clear the duplicate prevention after 3 seconds
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
      lastSuccessfulScan = null;
      scanTimeout = null;
    }, 3000);
  }

  function setupTapToFocus() {
    const video = readerElement.querySelector('video');
    if (!video) return;

    setTimeout(() => {
      const stream = video.srcObject;
      if (!stream) return;
      
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      
      const capabilities = track.getCapabilities();

      if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
        video.addEventListener('click', (event) => {
          const rect = video.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const focusPoint = {
            x: x / rect.width,
            y: y / rect.height,
          };

          showToast('Focusing...', 'info');

          track.applyConstraints({
            advanced: [{ focusMode: 'manual', focusPoint: focusPoint }]
          }).catch(err => console.warn('Tap-to-focus failed:', err));
        });
        showToast('Tap to focus is enabled.', 'info');
      }
    }, 1000);
  }

  // --- Improved Scanner Logic ---
  function getOptimalScannerConfig() {
    const config = {
      fps: isMobile ? 5 : 10, // Lower FPS for mobile to reduce battery drain
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        // Larger scanning area for mobile
        const widthRatio = isMobile ? 0.95 : 0.9;
        const heightRatio = isMobile ? 0.6 : 0.5;
        return {
          width: Math.min(viewfinderWidth * widthRatio, 400),
          height: Math.min(viewfinderHeight * heightRatio, 300)
        };
      },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODABAR
      ],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      // Mobile-optimized video constraints
      videoConstraints: getMobileOptimizedConstraints()
    };

    return config;
  }

  function getMobileOptimizedConstraints() {
    if (isMobile) {
      return {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        aspectRatio: { ideal: 16/9 },
        facingMode: { ideal: 'environment' },
        frameRate: { ideal: 15, max: 30 },
        // Mobile-specific optimizations
        focusMode: { ideal: 'continuous' },
        exposureMode: { ideal: 'continuous' },
        whiteBalanceMode: { ideal: 'continuous' }
      };
    } else {
      return {
        width: { min: 1280, ideal: 1920 },
        height: { min: 720, ideal: 1080 },
        aspectRatio: 1.7777777778,
        facingMode: 'environment'
      };
    }
  }

  async function startScanner() {
    if (isScanning || cameras.length === 0) return;
    
    clearAllErrors();
    
    if (!readerElement) {
      updateErrorElement(scannerErrorElement, "Scanner display area not found.");
      return;
    }

    // Clean up any existing scanner
    if (scanner) {
      try {
        await scanner.clear();
      } catch (e) {
        console.warn('Error clearing previous scanner:', e);
      }
    }

    scanner = new Html5Qrcode('reader');
    const config = getOptimalScannerConfig();

    try {
      await scanner.start(
        { deviceId: { exact: cameras[currentCameraIndex].id } },
        config,
        onScanSuccess,
        onScanFailure
      );

      isScanning = true;
      updateScanStatus('Scanning...', 'scanning');
      
      if (readerElement) readerElement.classList.add('active');
      if (startScanBtn) startScanBtn.style.display = 'none';
      if (stopScanBtn) stopScanBtn.style.display = 'inline-flex';
      if (switchCameraBtn) switchCameraBtn.style.display = cameras.length > 1 ? 'inline-flex' : 'none';
      if (enhanceScanBtn) enhanceScanBtn.style.display = 'inline-flex';
      
      setupTapToFocus();
      
      // Mobile-specific optimizations
      if (isMobile) {
        // Prevent screen from sleeping during scanning
        if ('wakeLock' in navigator) {
          try {
            await navigator.wakeLock.request('screen');
          } catch (e) {
            console.warn('Wake lock failed:', e);
          }
        }
        
        // Add vibration feedback for mobile
        showToast('Scanner started. Hold steady for best results.', 'info');
      }
      
    } catch (err) {
      console.error("Failed to start scanner:", err);
      
      if (err.name === 'NotAllowedError') {
        updateErrorElement(scannerErrorElement, 'Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        updateErrorElement(scannerErrorElement, 'No camera found. Please check your camera connection.');
      } else if (err.name === 'NotReadableError') {
        updateErrorElement(scannerErrorElement, 'Camera is already in use by another application.');
      } else if (err.name === 'OverconstrainedError') {
        updateErrorElement(scannerErrorElement, 'Camera does not support the required settings. Trying with basic settings...');
        // Retry with basic constraints
        await retryWithBasicConstraints();
      } else {
        updateErrorElement(scannerErrorElement, `Scanner failed: ${err.message}`);
      }
      
      updateScanStatus('Scanner failed', 'error');
      isScanning = false;
    }
  }

  async function retryWithBasicConstraints() {
    try {
      const basicConfig = {
        fps: 5,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      };

      await scanner.start(
        { deviceId: { exact: cameras[currentCameraIndex].id } },
        basicConfig,
        onScanSuccess,
        onScanFailure
      );

      isScanning = true;
      updateScanStatus('Scanning (basic mode)...', 'scanning');
      showToast('Scanner started in basic mode.', 'info');
      
    } catch (err) {
      console.error("Basic scanner also failed:", err);
      updateErrorElement(scannerErrorElement, 'Unable to start scanner. Please try refreshing the page.');
    }
  }

  async function stopScanner() {
    if (!scanner || !isScanning) return;
    
    isScanning = false;
    
    try {
      await scanner.stop();
      await scanner.clear();
    } catch (err) {
      console.warn("Error stopping scanner:", err);
    } finally {
      scanner = null;
      updateScanStatus('Scan stopped', 'ready');
      
      if (readerElement) readerElement.classList.remove('active');
      if (startScanBtn) startScanBtn.style.display = 'inline-flex';
      if (stopScanBtn) stopScanBtn.style.display = 'none';
      if (switchCameraBtn) switchCameraBtn.style.display = 'none';
      if (enhanceScanBtn) enhanceScanBtn.style.display = 'none';
    }
  }

  function onScanSuccess(decodedText) {
    if (!isScanning) return;
    
    console.log(`Raw barcode from camera: "${decodedText}"`);
    
    // Add haptic feedback for mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    handleBarcodeSubmission(decodedText);
  }

  function onScanFailure(error) {
    // Only log non-routine errors
    if (isScanning && !String(error).includes('NotFoundException') && !String(error).includes('No MultiFormat Readers')) {
      console.warn(`Scan error: ${error}`);
    }
  }

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
      const unknownCountry = {
        name: "Unknown Origin",
        flag: "❓",
        region: "N/A",
        currency: "N/A"
      };
      displayProductOrigin(unknownCountry, barcode, null, '0%');
      showToast('Could not determine origin for this barcode.', 'warning');
      updateScanStatus('Unknown origin', 'error');
    }
    
    toggleLoadingOverlay(false);
  }

  // --- Improved Camera Initialization ---
  async function initializeCameras() {
    if (typeof Html5Qrcode === 'undefined') {
      updateErrorElement(scannerErrorElement, "Scanner library not loaded. Please refresh the page.");
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

  // --- Functions from old app.js ---
  async function switchCamera() {
    if (cameras.length < 2) return;
    await stopScanner();
    currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
    showToast(`Switching to ${cameras[currentCameraIndex].label || `camera ${currentCameraIndex + 1}`}`, 'info');
    setTimeout(startScanner, 100);
  }

  async function handleFileInput(e) {
    if (e.target.files.length === 0) return;
    const imageFile = e.target.files[0];
    clearAllErrors();
    toggleLoadingOverlay(true);

    try {
      if (isScanning) await stopScanner();
      // Use existing scanner instance or create a new one
      if (!scanner) scanner = new Html5Qrcode('reader');

      const decodedText = await scanner.scanFile(imageFile, true);
      await handleBarcodeSubmission(decodedText);
    } catch (err) {
      updateErrorElement(fileInputErrorElement, `Error processing image. No barcode found.`);
      showToast('Failed to scan barcode from file.', 'error');
    } finally {
      toggleLoadingOverlay(false);
      if (barcodeFileInput) barcodeFileInput.value = ''; // Reset file input
    }
  }

  function clearManualInput() {
    if (manualInput) manualInput.value = '';
    updateErrorElement(manualInputErrorElement, '');
  }

  function clearAllErrors() {
    updateErrorElement(scannerErrorElement, '');
    updateErrorElement(manualInputErrorElement, '');
    updateErrorElement(fileInputErrorElement, '');
  }

  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function loadScanHistory() {
    return JSON.parse(localStorage.getItem('scanHistory')) || [];
  }

  function saveScanHistory(history) {
    localStorage.setItem('scanHistory', JSON.stringify(history));
  }

  function addScanToHistory(scanItem) {
    let history = loadScanHistory();
    history.unshift(scanItem);
    if (history.length > 20) history.pop();
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
    if (enhanceScanBtn) enhanceScanBtn.addEventListener('click', handleEnhanceAndScan);

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

})
