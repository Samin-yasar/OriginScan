/*
 * OriginScan — Barcode Validator
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This file is part of OriginScan and is free software licensed under
 * the GNU General Public License v3. See LICENSE for details.
 *
 * Validates and normalizes GS1 barcode formats before any lookup.
 * Supports: EAN-13, EAN-8, UPC-A, UPC-E (expanded), GTIN-14.
 */

/**
 * Computes the GS1 Mod-10 (Luhn-variant) check digit for a barcode.
 * Works for any GTIN length (8, 12, 13, 14 digits including check digit).
 *
 * The algorithm:
 *  1. Take the payload (all digits except the last one).
 *  2. Starting from the rightmost payload digit, alternate weights: ×3, ×1, ×3, ×1…
 *  3. Sum all weighted digits.
 *  4. Check digit = (10 - (sum % 10)) % 10
 *
 * @param {string} digits — full barcode string INCLUDING the check digit
 * @returns {{ valid: boolean, expected: number }}
 */
function verifyCheckDigit(digits) {
  // Strip whitespace just in case
  const d = digits.trim();

  if (!/^\d+$/.test(d)) {
    return { valid: false, expected: -1 };
  }

  const payload = d.slice(0, -1);
  const supplied = parseInt(d.slice(-1), 10);

  let sum = 0;
  // Weights alternate ×3 / ×1 starting from the rightmost payload digit
  for (let i = 0; i < payload.length; i++) {
    const weight = (payload.length - i) % 2 === 1 ? 3 : 1;
    sum += parseInt(payload[i], 10) * weight;
  }

  const expected = (10 - (sum % 10)) % 10;
  return { valid: supplied === expected, expected };
}

/**
 * Expands a 6-digit UPC-E code to its full 12-digit UPC-A equivalent.
 * This is necessary because UPC-E is a compressed form of UPC-A and
 * cannot be looked up directly via GS1 prefix tables.
 *
 * @param {string} upce — raw 6-digit UPC-E (without number system / check digits)
 * @returns {string} 12-digit UPC-A
 */
function expandUPCE(upce) {
  const d = upce.trim();
  if (d.length !== 6) return d; // can't expand

  const lastDigit = parseInt(d[5], 10);

  let expanded;
  if (lastDigit <= 2) {
    // Manufacturer: d[0], d[1], lastDigit, 0000 + Item: d[2], d[3], d[4]
    expanded = `${d[0]}${d[1]}${lastDigit}0000${d[2]}${d[3]}${d[4]}`;
  } else if (lastDigit === 3) {
    expanded = `${d[0]}${d[1]}${d[2]}00000${d[3]}${d[4]}`;
  } else if (lastDigit === 4) {
    expanded = `${d[0]}${d[1]}${d[2]}${d[3]}00000${d[4]}`;
  } else {
    // 5–9
    expanded = `${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}0000${lastDigit}`;
  }

  // Recompute check digit for the expanded form and append
  const withoutCheck = '0' + expanded; // UPC-A starts with number-system digit 0
  const full = withoutCheck + '0'; // placeholder check digit
  const { expected } = verifyCheckDigit(full);
  return withoutCheck + expected;
}

/**
 * Extracts a barcode/GTIN from complex payloads such as:
 * - GS1 Digital Link URIs (e.g., https://id.gs1.org/01/05412345000013)
 * - GS1 DataMatrix strings with AI (01) (e.g., (01)05412345000013 or 0105412345000013)
 * - URL query parameters (?barcode=... or ?gtin=...)
 * - ISBN labeled text (e.g., ISBN 978-0-306-40615-7)
 * - Raw barcode strings with dashes or spaces
 *
 * @param {string} payload
 * @returns {string} Extracted digit string
 */
function extractBarcode(payload) {
  if (!payload || typeof payload !== 'string') return '';
  const trimmed = payload.trim();

  // 1. GS1 Digital Link URI: /01/{gtin} (14, 13, 12, or 8 digits)
  const gs1LinkMatch = trimmed.match(/(?:^|\/)01\/(\d{14}|\d{13}|\d{12}|\d{8})(?:[/?#]|$)/i);
  if (gs1LinkMatch) {
    return _normalizeGtin(gs1LinkMatch[1]);
  }

  // 2. GS1 DataMatrix with Application Identifier (01)
  const gs1AiMatch = trimmed.match(/\(01\)(\d{14}|\d{13}|\d{12}|\d{8})/);
  if (gs1AiMatch) {
    return _normalizeGtin(gs1AiMatch[1]);
  }

  // 2b. Raw element string starting with AI 01 (01 followed by 14-digit GTIN)
  const rawAiMatch = trimmed.match(/^01(\d{14})/);
  if (rawAiMatch) {
    return _normalizeGtin(rawAiMatch[1]);
  }

  // 3. URL query parameter (barcode, gtin, ean, upc, isbn)
  const urlParamMatch = trimmed.match(/[?&](?:barcode|gtin|ean|upc|isbn)=(\d{8,14})/i);
  if (urlParamMatch) {
    return _normalizeGtin(urlParamMatch[1]);
  }

  // 4. ISBN text format: "ISBN 978-0-306-40615-7"
  const isbnMatch = trimmed.match(/\bISBN(?:-13|-10)?[:\s]+([0-9Xx-]+)/i);
  if (isbnMatch) {
    const isbnDigits = isbnMatch[1].replace(/[-\s]/g, '');
    if (isbnDigits.length === 13) return isbnDigits;
    if (isbnDigits.length === 10) return _isbn10ToIsbn13(isbnDigits);
  }

  // 5. If input contains a clear standalone barcode digit sequence (8, 12, 13, or 14 digits)
  const standaloneMatch = trimmed.match(/\b(\d{14}|\d{13}|\d{12}|\d{8})\b/);
  if (standaloneMatch) {
    return _normalizeGtin(standaloneMatch[1]);
  }

  // 6. Default fallback: strip all non-digit characters
  return trimmed.replace(/\D/g, '');
}

/**
 * Normalizes a GTIN:
 * - 14 digits starting with '0' (standard packaging indicator for EAN-13) -> 13 digits
 * @param {string} gtin
 * @returns {string}
 */
function _normalizeGtin(gtin) {
  if (gtin.length === 14 && gtin.startsWith('0')) {
    return gtin.slice(1);
  }
  return gtin;
}

/**
 * Converts a 10-digit ISBN to a 13-digit ISBN (978 prefix + Mod-10 check digit).
 * @param {string} isbn10
 * @returns {string}
 */
function _isbn10ToIsbn13(isbn10) {
  const core = '978' + isbn10.slice(0, 9);
  const { expected } = verifyCheckDigit(core + '0');
  return core + expected;
}

/**
 * Main validation entry point. Normalises and validates a raw barcode string.
 *
 * Returns a structured result object so callers can make informed decisions
 * about how accurate/reliable the downstream lookup will be.
 *
 * @param {string} raw — raw barcode input (from camera, manual entry, or file scan)
 * @returns {{
 *   isValid: boolean,
 *   format: string,
 *   cleanCode: string,      // normalised EAN-13 / GTIN-14 ready for lookup
 *   originalCode: string,
 *   checksumOk: boolean,
 *   expectedCheckDigit: number,
 *   error: string|null
 * }}
 */
function validateBarcode(raw) {
  const original = (raw || '').trim();

  // Extract barcode digits from 2D payloads, URLs, or plain strings
  const digits = extractBarcode(original);

  if (digits.length === 0) {
    return _fail(original, '', 'No valid barcode digits found in the input.');
  }

  // --- Determine format and normalise to EAN-13 or GTIN-14 ---

  let cleanCode = digits;
  let format = 'Unknown';

  if (digits.length === 12) {
    // UPC-A → pad with leading zero to get EAN-13
    cleanCode = '0' + digits;
    format = 'UPC-A';
  } else if (digits.length === 8) {
    // EAN-8 — short format, valid on its own
    cleanCode = digits;
    format = 'EAN-8';
  } else if (digits.length === 13) {
    cleanCode = digits;
    format = 'EAN-13';
  } else if (digits.length === 14) {
    // If GTIN-14 starts with 0, normalise to EAN-13
    if (digits.startsWith('0')) {
      cleanCode = digits.slice(1);
      format = 'EAN-13';
    } else {
      cleanCode = digits;
      format = 'GTIN-14';
    }
  } else if (digits.length === 6) {
    // UPC-E (compressed) — expand to UPC-A then pad
    const expanded = expandUPCE(digits);
    cleanCode = '0' + expanded;
    format = 'UPC-E';
  } else {
    return _fail(
      original,
      digits,
      `Unsupported barcode length (${digits.length} digits). ` +
      `Expected 8 (EAN-8), 12 (UPC-A), or 13 (EAN-13).`
    );
  }

  // --- Check digit validation ---
  const { valid: checksumOk, expected: expectedCheckDigit } = verifyCheckDigit(cleanCode);

  if (!checksumOk) {
    // We still return a result but flag it — the caller can warn the user
    // without blocking the lookup entirely (camera scan misreads are common).
    return {
      isValid: false,
      format,
      cleanCode,
      originalCode: original,
      checksumOk: false,
      expectedCheckDigit,
      error: `Check digit mismatch. The last digit should be ${expectedCheckDigit}, not ${cleanCode.slice(-1)}. This may be a misread — try scanning again.`
    };
  }

  return {
    isValid: true,
    format,
    cleanCode,
    originalCode: original,
    checksumOk: true,
    expectedCheckDigit,
    error: null
  };
}

// --- Internal helper ---
function _fail(original, digits, error) {
  return {
    isValid: false,
    format: 'Unknown',
    cleanCode: digits || original,
    originalCode: original,
    checksumOk: false,
    expectedCheckDigit: -1,
    error
  };
}

export { validateBarcode, verifyCheckDigit, expandUPCE, extractBarcode };
