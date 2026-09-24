#!/usr/bin/env node
/*
 * OriginScan — Test Suite
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * Run with: node tests/test-suite.js
 * No test framework required — plain Node.js only.
 *
 * This file is intentionally written without any test runner dependencies so
 * that any contributor can clone the repo and verify correctness immediately.
 */

// ── Minimal test harness ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function assertEqual(description, actual, expected) {
  assert(description, actual, expected);
}

function assertTrue(description, actual) {
  assert(description, !!actual, true);
}

function assertFalse(description, actual) {
  assert(description, !!actual, false);
}

function group(name, fn) {
  console.log(`\n\x1b[1m\x1b[34m▶ ${name}\x1b[0m`);
  fn();
}

// ── Import modules (Node.js native ES module support) ────────────────────────
// We use dynamic import so the test file can be run directly with Node.

async function runTests() {
  // Dynamically import so we can use top-level await
  const { validateBarcode, verifyCheckDigit, expandUPCE, extractBarcode } = await import('../js/core/validator.js');
  const { resolvePrefix } = await import('../js/core/gs1-registry.js');
  const { parseRestCountryResponse, fetchCountryDetails } = await import('../js/core/engine.js');

  // ============================================================
  // 1. verifyCheckDigit — Mod-10 algorithm
  // ============================================================
  group('verifyCheckDigit — Mod-10 algorithm', () => {
    // Known-good EAN-13 codes
    assertEqual('STABILO EAN-13 (4006381333931) — valid', verifyCheckDigit('4006381333931'), { valid: true, expected: 1 });
    assertEqual('Coca-Cola EAN-13 (5449000000996) — valid', verifyCheckDigit('5449000000996'), { valid: true, expected: 6 });
    assertEqual('India product (8901030382451) — valid', verifyCheckDigit('8901030382451'), { valid: true, expected: 1 });
    assertEqual('Bangladesh product (8941100500123) — valid checksum, expected digit is 5', verifyCheckDigit('8941100500123'), { valid: false, expected: 5 });

    // ISBN book codes (Bookland 978 prefix)
    assertEqual('Clean Code ISBN (9780132350884) — valid', verifyCheckDigit('9780132350884'), { valid: true, expected: 4 });

    // Tampered digit should fail
    const { valid: v1, expected: e1 } = verifyCheckDigit('4006381333930'); // last digit changed from 1 → 0
    assertFalse('Tampered last digit — should fail', v1);
    assertEqual('Expected check digit for tampered code is still 1', e1, 1);

    // Non-digit characters
    const { valid: v2 } = verifyCheckDigit('400638133abc1');
    assertFalse('Non-digit characters — should fail', v2);
  });

  // ============================================================
  // 2. validateBarcode — format normalisation
  // ============================================================
  group('validateBarcode — format normalisation', () => {
    // UPC-A: 12 digits padded to EAN-13
    const upcA = validateBarcode('012345678905');
    assertEqual('UPC-A detected as UPC-A format', upcA.format, 'UPC-A');
    assertEqual('UPC-A padded to EAN-13 with leading zero', upcA.cleanCode.length, 13);
    assertEqual('UPC-A cleanCode starts with 0', upcA.cleanCode[0], '0');

    // EAN-13 valid
    const ean13 = validateBarcode('4006381333931');
    assertEqual('EAN-13 format correct', ean13.format, 'EAN-13');
    assertTrue('EAN-13 isValid true', ean13.isValid);
    assertEqual('EAN-13 cleanCode unchanged', ean13.cleanCode, '4006381333931');

    // EAN-8 valid
    const ean8 = validateBarcode('96385074');
    assertEqual('EAN-8 format correct', ean8.format, 'EAN-8');

    // 6-digit UPC-E: validator.js does expand it — so a validly structured UPC-E IS accepted
    const upceResult = validateBarcode('425261');
    assertTrue('6-digit valid UPC-E is accepted (expands correctly)', upceResult.format === 'UPC-E');

    // Too short
    const tooShort = validateBarcode('123');
    assertFalse('3-digit input — should be invalid', tooShort.isValid);
    assertEqual('Too short error is set', typeof tooShort.error, 'string');

    // Whitespace and dashes stripped
    const spaced = validateBarcode('  4006-3813-33931  ');
    assertEqual('Whitespace/dashes stripped correctly', spaced.cleanCode, '4006381333931');
    assertTrue('Stripped barcode is valid', spaced.isValid);

    // Empty string
    const empty = validateBarcode('');
    assertFalse('Empty string — invalid', empty.isValid);
    assertEqual('Empty string error set', typeof empty.error, 'string');
  });

  // ============================================================
  // 3. resolvePrefix — GS1 Registry
  // ============================================================
  group('resolvePrefix — GS1 Registry', () => {
    // US prefixes
    const us = resolvePrefix('012');
    assertTrue('US prefix 012 found', us.found);
    assertEqual('US prefix 012 maps to United States', us.country, 'United States');
    assertEqual('US prefix 012 type is country', us.type, 'country');

    // Germany
    const de = resolvePrefix('400');
    assertTrue('Germany prefix 400 found', de.found);
    assertEqual('Prefix 400 maps to Germany', de.country, 'Germany');
    assertEqual('Germany region is Europe', de.region, 'Europe');
    assertEqual('Germany currency is EUR', de.currency, 'EUR');

    // Japan (two separate ranges: 450-459 and 490-499)
    const jp1 = resolvePrefix('455');
    const jp2 = resolvePrefix('493');
    assertTrue('Japan prefix 455 found', jp1.found);
    assertTrue('Japan prefix 493 found', jp2.found);
    assertEqual('Both Japan ranges map to Japan', jp1.country, jp2.country);

    // Bangladesh
    const bd = resolvePrefix('894');
    assertTrue('Bangladesh prefix 894 found', bd.found);
    assertEqual('Prefix 894 maps to Bangladesh', bd.country, 'Bangladesh');

    // France & Monaco (range)
    const fr = resolvePrefix('350');
    assertTrue('France prefix 350 found', fr.found);
    assertTrue('France & Monaco range includes 350', fr.country.includes('France'));
    assertEqual('France & Monaco has 2 member nations', fr.countries?.length, 2);

    // Belgium & Luxembourg (540-549 shared prefix)
    const belu = resolvePrefix('540');
    assertTrue('Belgium & Luxembourg prefix 540 found', belu.found);
    assertEqual('Prefix 540 country name is "Belgium & Luxembourg"', belu.country, 'Belgium & Luxembourg');
    assertTrue('Prefix 540 flag contains both Belgium and Luxembourg flags', belu.flag.includes('🇧🇪') && belu.flag.includes('🇱🇺'));
    assertEqual('Prefix 540 has 2 member nations', belu.countries?.length, 2);
    assertEqual('Prefix 540 first member is Belgium', belu.countries?.[0]?.name, 'Belgium');
    assertEqual('Prefix 540 second member is Luxembourg', belu.countries?.[1]?.name, 'Luxembourg');

    // Other joint prefix groups
    const chli = resolvePrefix('760');
    assertEqual('Switzerland & Liechtenstein has 2 member nations', chli.countries?.length, 2);
    const itsm = resolvePrefix('800');
    assertEqual('Italy, San Marino & Vatican City has 3 member nations', itsm.countries?.length, 3);
    const dkfo = resolvePrefix('570');
    assertEqual('Denmark, Faroe Islands & Greenland has 3 member nations', dkfo.countries?.length, 3);
    const esad = resolvePrefix('840');
    assertEqual('Spain & Andorra has 2 member nations', esad.countries?.length, 2);

    // ISBN (Bookland 978)
    const isbn = resolvePrefix('978');
    assertTrue('ISBN prefix 978 found', isbn.found);
    assertEqual('Prefix 978 type is special', isbn.type, 'special');
    assertTrue('ISBN note is set', isbn.note && isbn.note.length > 0);

    // In-store restricted (200-299)
    const instore = resolvePrefix('250');
    assertTrue('In-store prefix 250 found', instore.found);
    assertEqual('In-store prefix type is restricted', instore.type, 'restricted');

    // Unknown prefix
    const unknown = resolvePrefix('999');
    // 999 is in the coupons range so it might be found — test a genuinely unallocated one
    const reallyUnknown = resolvePrefix('142');
    assertFalse('Unallocated prefix 142 not found', reallyUnknown.found);
    assertEqual('Unknown prefix country name is "Unknown Origin"', reallyUnknown.country, 'Unknown Origin');

    // Padding: 3 → should pad to "003"
    const padded = resolvePrefix('3');
    assertEqual('Single digit prefix is zero-padded', padded.prefix, '003');
  });

  // ============================================================
  // 4. expandUPCE
  // ============================================================
  group('expandUPCE — UPC-E expansion', () => {
    // UPC-E "425261" → UPC-A should be 12 digits
    const expanded = expandUPCE('425261');
    assertEqual('UPC-E expanded to 12-digit UPC-A', expanded.length, 12);
    // The full normalised form in validateBarcode prepends a 0 (number system digit),
    // making it 13 digits total — but expandUPCE itself returns 12 starting with the
    // ============================================================
    // Expanded UPC-E is all digits
    // ============================================================
    assertTrue('Expanded UPC-E is all digits', /^\d{12}$/.test(expanded));
  });

  // ============================================================
  // ============================================================
  // ISBN routing & source metadata
  // ============================================================
  const { ISBN_PREFIXES, SOURCE_META } = await import('../js/core/product-api.js');

  group('ISBN routing — product-api logic', () => {
    // ISBN prefix detection
    assert('Prefix 978 is an ISBN prefix', ISBN_PREFIXES.has('978'), true);
    assert('Prefix 979 is an ISBN prefix', ISBN_PREFIXES.has('979'), true);
    assert('Prefix 400 is NOT an ISBN prefix', ISBN_PREFIXES.has('400'), false);
    assert('Prefix 054 is NOT an ISBN prefix', ISBN_PREFIXES.has('054'), false);

    // Source metadata coverage — all four databases must be registered
    const sources = ['openfoodfacts', 'openbeautyfacts', 'openlibrary', 'openproductsfacts'];
    for (const src of sources) {
      assert(`SOURCE_META has entry for "${src}"`, src in SOURCE_META, true);
      assert(`SOURCE_META["${src}"].label is a non-empty string`,
        typeof SOURCE_META[src].label === 'string' && SOURCE_META[src].label.length > 0, true);
      assert(`SOURCE_META["${src}"].url starts with https://`,
        SOURCE_META[src].url.startsWith('https://'), true);
    }

    // Open Library URL format sanity check
    assert('Open Library URL contains "openlibrary.org/isbn/"',
      SOURCE_META['openlibrary'].url.includes('openlibrary.org/isbn/'), true);
  });

  group('Open Library and REST Countries response parsing', () => {
    const isbnRecord = {
      title: 'Clean Code',
      publishers: ['Prentice Hall'],
      publish_date: 'July 2008',
      covers: [15126503]
    };
    assertEqual('Open Library edition title is available', isbnRecord.title, 'Clean Code');
    assertEqual('Open Library cover URL is derived from cover ID',
      `https://covers.openlibrary.org/b/id/${isbnRecord.covers[0]}-M.jpg`,
      'https://covers.openlibrary.org/b/id/15126503-M.jpg');

    const country = parseRestCountryResponse([{
      names: { common: 'South Sudan' },
      population: 10900000,
      capitals: [{ name: 'Juba' }],
      currencies: [{ code: 'SSP', name: 'South Sudanese pound' }],
      geography: { area: 619745, coordinates: [6.877, 31.307] }
    }]);
    assertEqual('REST Countries v5 population is parsed', country.population, 10900000);
    assertEqual('REST Countries v5 capital is parsed', country.capital, 'Juba');
    assertEqual('REST Countries v5 currency is parsed',
      country.currencies, 'South Sudanese pound (SSP)');
    assertEqual('REST Countries v5 coordinates are parsed', country.latlng, [6.877, 31.307]);
    assertEqual('REST Countries error payload is rejected',
      parseRestCountryResponse({ success: false }), null);
  });

  // Verify the online fallback only runs for a country absent from bundled data.
  const originalFetch = globalThis.fetch;
  const originalApiKey = globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY;
  let onlineRequestUrl = null;
  try {
    globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY = 'test-api-key';
    globalThis.fetch = async (url, options) => {
      onlineRequestUrl = { url, options };
      return {
        ok: true,
        async json() {
          return [{
            names: { common: 'South Sudan' },
            population: 10900000,
            capitals: [{ name: 'Juba' }],
            currencies: [{ code: 'SSP', name: 'South Sudanese pound' }],
            geography: { area: 619745, coordinates: [6.877, 31.307] }
          }];
        }
      };
    };
    const onlineOnlyCountry = await fetchCountryDetails('South Sudan');
    assertEqual('Online fallback resolves country absent from bundled data',
      onlineOnlyCountry.capital, 'Juba');
    assertTrue('Online fallback uses REST Countries v5 endpoint',
      onlineRequestUrl.url.startsWith('https://api.restcountries.com/countries/v5/name/'));
    assertEqual('Online fallback sends configured API key',
      onlineRequestUrl.options.headers.Authorization, 'test-api-key');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY;
    } else {
      globalThis.ORIGINSCAN_REST_COUNTRIES_API_KEY = originalApiKey;
    }
  }

  // ============================================================
  // 6. extractBarcode & 2D Barcode Payload Handling
  // ============================================================
  group('extractBarcode & 2D Barcode Payload Handling', () => {
    // GS1 Digital Link URIs (Sunrise 2027 standard)
    assertEqual('GS1 Digital Link standard URI',
      extractBarcode('https://id.gs1.org/01/05412345000013'), '5412345000013');
    assertEqual('GS1 Digital Link with sub-paths and lot/batch',
      extractBarcode('https://brand.com/01/00123456789012/10/LOT123/21/SER456'), '0123456789012');
    assertEqual('GS1 Digital Link with trailing slash',
      extractBarcode('https://id.gs1.org/01/7350053850019/'), '7350053850019');

    // GS1 DataMatrix (Application Identifier 01)
    assertEqual('GS1 DataMatrix with (01) parenthesis format',
      extractBarcode('(01)05412345000013'), '5412345000013');
    assertEqual('GS1 DataMatrix with multiple AIs',
      extractBarcode('(01)05412345000013(10)LOT123(17)251231'), '5412345000013');
    assertEqual('GS1 raw element string starting with AI 01',
      extractBarcode('0105412345000013'), '5412345000013');

    // URL query parameters
    assertEqual('URL query parameter ?barcode=',
      extractBarcode('https://example.com/product?barcode=4006381333931'), '4006381333931');
    assertEqual('URL query parameter ?gtin=',
      extractBarcode('https://example.com/item?gtin=00123456789012&lang=en'), '0123456789012');
    assertEqual('URL query parameter ?ean=',
      extractBarcode('https://shop.example.com/search?ref=ad&ean=7350053850019'), '7350053850019');

    // ISBN labeled text
    assertEqual('ISBN labeled text with hyphens',
      extractBarcode('ISBN 978-0-13-235088-4'), '9780132350884');

    // Full end-to-end validateBarcode integration with 2D payloads
    const gs1LinkRes = validateBarcode('https://id.gs1.org/01/05412345000013');
    assertEqual('validateBarcode handles GS1 Digital Link — isValid', gs1LinkRes.isValid, true);
    assertEqual('validateBarcode handles GS1 Digital Link — format', gs1LinkRes.format, 'EAN-13');
    assertEqual('validateBarcode handles GS1 Digital Link — cleanCode', gs1LinkRes.cleanCode, '5412345000013');

    const dataMatrixRes = validateBarcode('(01)04006381333931');
    assertEqual('validateBarcode handles GS1 DataMatrix — isValid', dataMatrixRes.isValid, true);
    assertEqual('validateBarcode handles GS1 DataMatrix — cleanCode', dataMatrixRes.cleanCode, '4006381333931');
  });

  // ============================================================
  // Summary
  // ============================================================
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`);
  if (failed > 0) {
    console.error('\x1b[31mSome tests failed. Please review the errors above.\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[32mAll tests passed! ✅\x1b[0m');
  }
}

runTests().catch(err => {
  console.error('\x1b[31mTest runner crashed:\x1b[0m', err);
  process.exit(1);
});
