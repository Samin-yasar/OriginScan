/*
 * OriginScan — Core Lookup Engine
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This file is part of OriginScan and is free software licensed under
 * the GNU General Public License v3. See LICENSE for details.
 *
 * Orchestrates the multi-tier barcode lookup:
 *   Tier 1 (always, offline): Validate checksum + GS1 prefix resolution
 *   Tier 2 (online, graceful): Open Food Facts, Open Beauty Facts, Open Library (ISBNs),
 *                               or Open Products Facts — selected by barcode type
 *   Tier 3 (online, graceful): REST Countries API for population & extra country data
 *
 * The result object is designed to be UI-agnostic — the same engine can be
 * used by the web app, a CLI tool, or any third-party integration.
 */

import { validateBarcode } from './validator.js';
import { resolvePrefix } from './gs1-registry.js';
import { fetchProductData } from './product-api.js';
import { getBundledCountryDetails } from './country-data.js';

// REST Countries v5 requires an API key. Bundled data remains the primary source.
const REST_COUNTRIES_URL = 'https://api.restcountries.com/countries/v5';

// Simple in-memory cache for country API results to avoid hammering
// the REST Countries endpoint on repeated scans from the same country.
const countryApiCache = new Map();

/**
 * Main lookup function. Given a raw barcode input (from camera, upload, or
 * manual entry), returns a comprehensive, structured ScanResult.
 *
 * @param {string} rawBarcode
 * @param {{ fetchProduct?: boolean }} options
 * @returns {Promise<ScanResult>}
 */
async function lookup(rawBarcode, options = {}) {
  const { fetchProduct = true } = options;

  // ── Tier 1: Validate & normalise ────────────────────────────────────────────
  const validation = validateBarcode(rawBarcode);

  if (!validation.isValid && validation.format === 'Unknown') {
    // Completely unrecognisable input — abort immediately
    return _buildResult({
      rawInput: rawBarcode,
      validation,
      gs1: null,
      product: null,
      countryDetails: null,
      confidence: 'none',
      confidencePct: 0,
      error: validation.error
    });
  }

  // ── Tier 1b: GS1 prefix resolution (fully offline) ──────────────────────────
  const prefix = validation.cleanCode.slice(0, 3);
  const gs1 = resolvePrefix(prefix);

  // ── Confidence score calculation ─────────────────────────────────────────────
  // We start with a base score and adjust based on what we know & verify.
  let confidencePct = 0;
  let confidence = 'none';

  if (!validation.checksumOk) {
    // Misread or corrupted barcode — checksum failed.
    // We still attempt a lookup but signal low confidence.
    confidencePct = 15;
    confidence = 'low';
  } else if (gs1.found && gs1.type === 'country') {
    // Valid checksum + known country prefix = reliable GS1 registration origin.
    // We call this "Medium" because GS1 registration country ≠ manufacturing country.
    confidencePct = 75;
    confidence = 'medium';
  } else if (gs1.found && gs1.type === 'restricted') {
    // In-store / coupon / restricted — prefix is meaningful but not a true origin
    confidencePct = 40;
    confidence = 'low';
  } else if (gs1.found && gs1.type === 'special') {
    // ISBN, ISSN, GS1 global office — prefix is meaningful in a different context
    confidencePct = 60;
    confidence = 'medium';
  } else {
    confidencePct = 10;
    confidence = 'low';
  }

  // ── Tier 2: Product data lookup (online, optional) ────────────────────────────
  // Pass the GS1 prefix type so the API client can pick the right database:
  //   ISBN prefixes (978/979) → Open Library first
  //   General barcodes        → Open Food Facts → Open Beauty Facts → Open Products Facts
  let product = null;
  if (fetchProduct && navigator.onLine) {
    try {
      product = await fetchProductData(validation.cleanCode, gs1.type);
      if (product.found && product.source === 'openlibrary') {
        // Verified book catalog data is authoritative — bump to high confidence
        confidencePct = 95;
        confidence = 'high';
      } else if (product.found && product.declaredOrigin) {
        // Physical origin explicitly declared on pack — most reliable signal
        confidencePct = 95;
        confidence = 'high';
      } else if (product.found) {
        // Product found but no declared origin — modest bump
        confidencePct = Math.min(confidencePct + 10, 85);
      }
    } catch (err) {
      // Non-fatal — product data enriches but is never required
      console.warn('[OriginScan] Product lookup failed, continuing without it:', err.message);
    }
  }

  // ── Tier 3: REST Countries API (online, optional) ─────────────────────────────
  let countryDetails = null;
  if (gs1 && gs1.countries && gs1.countries.length > 1 && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const members = await Promise.all(
        gs1.countries.map(async (c) => {
          const d = await _fetchCountryDetails(c.apiName);
          return {
            name: c.name,
            flag: c.flag,
            apiName: c.apiName,
            population: d ? d.population : null,
            capital: d ? d.capital : null,
            currencies: d ? d.currencies : null,
            latlng: d ? d.latlng : null
          };
        })
      );
      const validPop = members.filter(m => m.population !== null);
      const totalPop = validPop.reduce((sum, m) => sum + m.population, 0);
      const uniqueCurrencies = [...new Set(members.map(m => m.currencies).filter(Boolean))].join('; ');

      countryDetails = {
        isMultiCountry: true,
        members,
        population: totalPop > 0 ? totalPop : null,
        currencies: uniqueCurrencies || gs1.currency,
        latlng: members[0]?.latlng || null
      };
    } catch (err) {
      console.warn('[OriginScan] Multi-country lookup failed:', err.message);
    }
  } else if (gs1 && gs1.apiName && (typeof navigator === 'undefined' || navigator.onLine)) {
    countryDetails = await _fetchCountryDetails(gs1.apiName);
  }

  return _buildResult({
    rawInput: rawBarcode,
    validation,
    gs1,
    product,
    countryDetails,
    confidence,
    confidencePct,
    error: validation.checksumOk ? null : validation.error
  });
}

// ── REST Countries fetcher ──────────────────────────────────────────────────

async function _fetchCountryDetails(countryName) {
  if (!countryName) return null;

  // 1. Check in-memory cache first
  if (countryApiCache.has(countryName)) {
    return countryApiCache.get(countryName);
  }

  // 2. Check bundled zero-latency offline database (covers all 130+ GS1 member nations)
  const bundled = getBundledCountryDetails(countryName);
  if (bundled) {
    countryApiCache.set(countryName, bundled);
    return bundled;
  }

  // 3. Fallback to online query only if country is not in the bundled dataset
  try {
    const encoded = encodeURIComponent(countryName);
    const apiKey = globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY;
    if (typeof apiKey !== 'string' || apiKey.trim().length === 0) return null;

    const response = await fetch(
      `${REST_COUNTRIES_URL}/name/${encoded}?response_fields=names,population,currencies,capitals,geography`,
      {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(3000)
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const result = parseRestCountryResponse(data);
    if (!result) return null;

    countryApiCache.set(countryName, result);
    return result;

  } catch {
    // Graceful offline fallback — no console spam
    return null;
  }

}

/**
 * Validates and normalises a REST Countries v5 response.
 * @param {unknown} data
 * @returns {{ population: number|null, currencies: string|null, capital: string|null, area: number|null, latlng: [number, number]|null } | null}
 */
function parseRestCountryResponse(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const country = data[0];
  if (!country || typeof country !== 'object' || Array.isArray(country)) return null;

  const population = typeof country.population === 'number' ? country.population : null;
  const capitals = Array.isArray(country.capitals) ? country.capitals : [];
  const capital = typeof capitals[0]?.name === 'string' ? capitals[0].name : null;
  const currencies = Array.isArray(country.currencies)
    ? country.currencies
      .filter(currency => currency && typeof currency.name === 'string')
      .map(currency => currency.code ? `${currency.name} (${currency.code})` : currency.name)
      .join(', ') || null
    : null;
  const geography = country.geography;
  const coordinates = geography && typeof geography === 'object' ? geography.coordinates : null;
  const latlng = Array.isArray(coordinates)
    && coordinates.length >= 2
    && typeof coordinates[0] === 'number'
    && typeof coordinates[1] === 'number'
    ? [coordinates[0], coordinates[1]]
    : null;
  const area = geography && typeof geography.area === 'number' ? geography.area : null;

  return { population, currencies, capital, area, latlng };
}

// ── Result builder ──────────────────────────────────────────────────────────

function _buildResult({ rawInput, validation, gs1, product, countryDetails, confidence, confidencePct, error }) {
  return {
    // ── Input & Validation ──
    rawInput,
    isValid: validation.isValid,
    format: validation.format,
    cleanCode: validation.cleanCode,
    checksumOk: validation.checksumOk,
    expectedCheckDigit: validation.expectedCheckDigit,

    // ── GS1 Registration Origin (Tier 1, always present if prefix known) ──
    gs1: gs1 ? {
      prefix: gs1.prefix,
      country: gs1.country,
      flag: gs1.flag,
      region: gs1.region,
      currency: gs1.currency,
      type: gs1.type,
      note: gs1.note || null,
      found: gs1.found
    } : null,

    // ── Live Product Data (Tier 2, online only) ──
    product: product ? {
      found:          product.found,
      name:           product.name,
      brand:          product.brand,
      imageUrl:       product.imageUrl,
      declaredOrigin: product.declaredOrigin,
      saleCountries:  product.saleCountries,
      category:       product.category,
      // Book-specific fields (null for non-book products)
      author:         product.author,
      publisher:      product.publisher,
      publishedYear:  product.publishedYear,
      // Source attribution
      source:         product.source,
      sourceLabel:    product.sourceLabel,
      productUrl:     product.productUrl
    } : null,

    // ── Country Geographic Details (Tier 3, online only) ──
    countryDetails: countryDetails || null,

    // ── Confidence ──
    confidence,       // 'high' | 'medium' | 'low' | 'none'
    confidencePct,    // 0-100 number for display

    // ── Error (non-fatal) ──
    error: error || null,

    // ── Timestamp ──
    scannedAt: new Date().toISOString()
  };
}

export { lookup, _fetchCountryDetails as fetchCountryDetails, parseRestCountryResponse };

/**
 * @typedef {Object} ScanResult
 * @property {string}  rawInput
 * @property {boolean} isValid
 * @property {string}  format
 * @property {string}  cleanCode
 * @property {boolean} checksumOk
 * @property {number}  expectedCheckDigit
 * @property {Object|null} gs1
 * @property {Object|null} product
 * @property {Object|null} countryDetails
 * @property {'high'|'medium'|'low'|'none'} confidence
 * @property {number}  confidencePct
 * @property {string|null} error
 * @property {string}  scannedAt
 */
