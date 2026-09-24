/*
 * OriginScan — Open Product Data API Client
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This file is part of OriginScan and is free software licensed under
 * the GNU General Public License v3. See LICENSE for details.
 *
 * Tier 2 product data resolution across four free, open-data sources:
 *
 *   1. Open Food Facts      (world.openfoodfacts.org)    ~3 million food products
 *   2. Open Beauty Facts    (world.openbeautyfacts.org)  cosmetics, fragrances, skincare
 *   3. Open Library Books   (openlibrary.org)            ISBNs — books, textbooks
 *   4. Open Products Facts  (world.openproductsfacts.org) general goods, pet food
 *
 * All four are 100% free, no API key required, non-profit, and community-driven.
 * In compliance with their fair-use policy, we set a descriptive User-Agent and
 * maintain a local in-memory LRU cache to avoid redundant network requests.
 */

// ── In-memory session cache ────────────────────────────────────────────────
// Maps `barcode` → ProductResult. Survives the session but not a page reload.
const productCache = new Map();
const CACHE_MAX = 100; // evict oldest when we exceed this

// Timeout for each API call — give up and degrade gracefully after 5s
const REQUEST_TIMEOUT_MS = 10000;

// User-Agent per https://wiki.openfoodfacts.org/API
const USER_AGENT = 'OriginScan - Open Source Barcode Origin Tool - https://github.com/Samin-yasar/OriginScan';

// ── Prefix sets that identify ISBN / ISSN barcodes ───────────────────────
const ISBN_PREFIXES = new Set(['978', '979']);
const ISSN_PREFIX  = '977';

// ── Source display metadata ───────────────────────────────────────────────
const SOURCE_META = {
  openfoodfacts:    { label: 'Open Food Facts',     url: 'https://world.openfoodfacts.org/product/' },
  openbeautyfacts:  { label: 'Open Beauty Facts',   url: 'https://world.openbeautyfacts.org/product/' },
  openlibrary:      { label: 'Open Library',        url: 'https://openlibrary.org/isbn/' },
  openproductsfacts:{ label: 'Open Products Facts', url: 'https://world.openproductsfacts.org/product/' }
};

/**
 * Resolves product metadata for a given barcode using the most appropriate
 * open database, falling back through the chain until a match is found.
 *
 * @param {string} barcode - normalised EAN-13 / EAN-8 code
 * @param {string} [gs1PrefixType] - 'special' for ISBN/ISSN barcodes
 * @returns {Promise<ProductResult>}
 */
async function fetchProductData(barcode, gs1PrefixType = 'country') {
  // Cache hit — skip the network entirely
  if (productCache.has(barcode)) {
    return productCache.get(barcode);
  }

  const prefix3 = barcode.slice(0, 3);
  let result;

  if (ISBN_PREFIXES.has(prefix3) || gs1PrefixType === 'special') {
    // ── Book / ISBN resolution chain ──────────────────────────────────────
    // Open Library is authoritative for books; fall back to Open Products Facts
    result = await _queryOpenLibrary(barcode);
    if (!result.found) {
      result = await _queryOFF(barcode, 'openproductsfacts');
    }
  } else {
    // ── General product resolution chain ──────────────────────────────────
    // Food → Beauty → Products Facts
    result = await _queryOFF(barcode, 'openfoodfacts');
    if (!result.found) {
      result = await _queryOFF(barcode, 'openbeautyfacts');
    }
    if (!result.found) {
      result = await _queryOFF(barcode, 'openproductsfacts');
    }
  }

  // LRU eviction: drop oldest entry when the cache is full
  if (productCache.size >= CACHE_MAX) {
    const firstKey = productCache.keys().next().value;
    productCache.delete(firstKey);
  }

  productCache.set(barcode, result);
  return result;
}

// ── Open Food Facts / Beauty Facts / Products Facts ───────────────────────

/**
 * Queries any database that uses the Open Food Facts API format
 * (openfoodfacts, openbeautyfacts, openproductsfacts all share the same API).
 *
 * @param {string} barcode
 * @param {'openfoodfacts'|'openbeautyfacts'|'openproductsfacts'} db
 * @returns {Promise<ProductResult>}
 */
async function _queryOFF(barcode, db) {
  const host = `world.${db}.org`;
  const fields = 'product_name,brands,image_front_small_url,origins,manufacturing_places,countries_tags,categories_tags,nutriscore_grade';
  const url = `https://${host}/api/v2/product/${barcode}?fields=${fields}`;

  try {
    const response = await _fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } });

    if (!response.ok) return _notFound(barcode, db);

    const data = await response.json();
    if (data.status !== 1 || !data.product) return _notFound(barcode, db);

    return _parseOFFProduct(data.product, barcode, db);

  } catch (err) {
    console.warn(`[OriginScan] ${db} query failed for ${barcode}:`, err.message);
    return _notFound(barcode, db);
  }
}

/**
 * Parses a raw OFF-format product object into a normalised ProductResult.
 */
function _parseOFFProduct(product, barcode, source) {
  const name  = _clean(product.product_name);
  const brand = _clean(product.brands);

  // Declared manufacturing/origin — off stores as free-text from contributor labels
  const declaredOrigin = _clean(product.origins) || _clean(product.manufacturing_places);

  // `countries_tags` is like ["en:france", "en:germany"]
  const saleCountries = (product.countries_tags || [])
    .map(tag => {
      const [, country] = tag.split(':');
      return country ? _titleCase(country.replace(/-/g, ' ')) : null;
    })
    .filter(Boolean);

  // Category — take first tag, drop the language prefix ("en:beverages" → "Beverages")
  const rawCategory = (product.categories_tags || [])[0] || null;
  const category = rawCategory ? _titleCase(rawCategory.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')) : null;

  const sourceMeta = SOURCE_META[source];

  return {
    found: true,
    barcode,
    source,
    sourceLabel: sourceMeta?.label || source,
    name:   name  || null,
    brand:  brand || null,
    imageUrl:       product.image_front_small_url || null,
    declaredOrigin: declaredOrigin || null,
    saleCountries,
    category,
    // Extra detail fields — null when not applicable
    author:    null,
    publisher: null,
    publishedYear: null,
    productUrl: (sourceMeta?.url || '') + barcode
  };
}

// ── Open Library (books) ──────────────────────────────────────────────────

/**
 * Queries the Open Library Books API for ISBN barcodes.
 * Endpoint: https://openlibrary.org/isbn/ISBN.json
 *
 * @param {string} barcode
 * @returns {Promise<ProductResult>}
 */
async function _queryOpenLibrary(barcode) {
  // Strip leading zero if this is a UPC-padded ISBN (978/979 always 13-digit)
  const isbn = barcode.startsWith('0') && barcode.length === 13
    ? barcode.slice(1)
    : barcode;

  const url = `https://openlibrary.org/isbn/${isbn}.json`;

  try {
    const response = await _fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } });

    if (!response.ok) return _notFound(barcode, 'openlibrary');

    const book = await response.json();
    if (!book || typeof book !== 'object' || Array.isArray(book) || typeof book.title !== 'string') {
      return _notFound(barcode, 'openlibrary');
    }

    // Edition records contain author references, so names are optional.
    const authors = Array.isArray(book.authors)
      ? book.authors.map(a => a?.name).filter(Boolean)
      : [];

    const publishers = Array.isArray(book.publishers)
      ? book.publishers.filter(p => typeof p === 'string' && p.length > 0)
      : [];

    // Published date — "2008", "January 1, 2008", etc.
    const publishedYear = book.publish_date
      ? (book.publish_date.match(/\d{4}/) || [])[0] || null
      : null;

    // Cover — Open Library medium cover image
    const imageUrl = Array.isArray(book.covers) && Number.isInteger(book.covers[0])
      ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
      : null;

    // Declared origin — "publish_places" contains city names from the book data
    const publishPlaces = Array.isArray(book.publish_places)
      ? book.publish_places.filter(p => typeof p === 'string' && p.length > 0)
      : [];
    const declaredOrigin = publishPlaces.length > 0 ? publishPlaces.join(', ') : null;

    const sourceMeta = SOURCE_META['openlibrary'];

    return {
      found: true,
      barcode,
      source:      'openlibrary',
      sourceLabel: sourceMeta.label,
      name:          book.title || null,
      brand:         publishers[0] || null,
      imageUrl,
      declaredOrigin,
      saleCountries: [],
      category:      'Book',
      author:        authors.length > 0 ? authors.join(', ') : null,
      publisher:     publishers[0] || null,
      publishedYear,
      productUrl: `${sourceMeta.url}${isbn}`
    };

  } catch (err) {
    console.warn(`[OriginScan] Open Library query failed for ${barcode}:`, err.message);
    return _notFound(barcode, 'openlibrary');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function _notFound(barcode, source) {
  const sourceMeta = SOURCE_META[source] || {};
  return {
    found: false, barcode, source,
    sourceLabel:   sourceMeta.label || source,
    name:          null, brand: null, imageUrl: null,
    declaredOrigin: null, saleCountries: [], category: null,
    author: null, publisher: null, publishedYear: null,
    productUrl:    null
  };
}

function _clean(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function _titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * fetch() wrapped with an AbortController timeout.
 */
function _fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

/**
 * Clears the in-session product cache.
 * Exposed for testing and debugging.
 */
function clearProductCache() {
  productCache.clear();
}

export { fetchProductData, clearProductCache, ISBN_PREFIXES, SOURCE_META };

/**
 * @typedef {Object} ProductResult
 * @property {boolean}      found
 * @property {string}       barcode
 * @property {string}       source         — 'openfoodfacts' | 'openbeautyfacts' | 'openlibrary' | 'openproductsfacts'
 * @property {string}       sourceLabel    — human-readable source name
 * @property {string|null}  name           — product / book title
 * @property {string|null}  brand          — brand name or publisher (for books)
 * @property {string|null}  imageUrl       — front-of-pack or book cover thumbnail
 * @property {string|null}  declaredOrigin — "Made in ___" text or publish city
 * @property {string[]}     saleCountries  — countries where product is sold
 * @property {string|null}  category       — product category or "Book"
 * @property {string|null}  author         — book author(s), null for non-books
 * @property {string|null}  publisher      — book publisher, null for non-books
 * @property {string|null}  publishedYear  — year of publication, null for non-books
 * @property {string|null}  productUrl     — direct link to the source database page
 */
