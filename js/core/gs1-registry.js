/*
 * OriginScan — GS1 Prefix Registry
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This file is part of OriginScan and is free software licensed under
 * the GNU General Public License v3. See LICENSE for details.
 *
 * Comprehensive GS1 GCP (Global Company Prefix) registry.
 * Source: https://www.gs1.org/standards/id-keys/company-prefix
 *
 * IMPORTANT — What GS1 prefixes actually mean:
 *   A GS1 prefix identifies the GS1 Member Organisation (MO) that issued
 *   the company prefix to the brand owner. It does NOT necessarily indicate
 *   the country where the product was physically manufactured.
 *   Always communicate this distinction clearly to users.
 */

/**
 * Raw prefix range definitions.
 * Each entry is keyed by a "start-end" or "exact" prefix string, with:
 *   - country: formal country/entity name
 *   - flag: emoji flag
 *   - apiName: name to use when querying REST Countries API
 *   - region: broad geographic region
 *   - currency: primary currency (code + full name)
 *   - type: 'country' | 'special' | 'restricted'
 *   - note: (optional) human-readable explanation for special/ambiguous ranges
 */
const RAW_PREFIXES = {
  // ── United States ───────────────────────────────────────────────────────────
  // GS1 US issues UPC-A (12-digit) codes for 000-099 and 100-139 ranges.
  // These are directly compatible with EAN-13 when zero-padded.
  "000-019": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "country" },
  "020-029": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "restricted", note: "Restricted circulation — store/retailer assigned, not for global trade" },
  "030-039": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "country", note: "US National Drug Code (NDC) allocated range" },
  "040-049": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "restricted", note: "Restricted circulation — assigned internally within a company" },
  "050-059": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "restricted", note: "Coupons" },
  "060-099": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "country" },
  "100-139": { country: "United States", flag: "🇺🇸", apiName: "United States", region: "North America", currency: "USD", type: "country" },

  // ── In-store / Restricted (global) ──────────────────────────────────────────
  "200-299": { country: "In-Store / Variable Measure", flag: "🏪", apiName: null, region: "N/A", currency: "N/A", type: "restricted", note: "GS1 restricted circulation — assigned by retailers for in-store variable-weight items (e.g., deli meat sold by weight). Not for general sale." },

  // ── Europe ──────────────────────────────────────────────────────────────────
  "300-379": { country: "France & Monaco", flag: "🇫🇷 🇲🇨", apiName: "France", countries: [{ name: "France", flag: "🇫🇷", apiName: "France" }, { name: "Monaco", flag: "🇲🇨", apiName: "Monaco" }], region: "Europe", currency: "EUR", type: "country" },
  "380": { country: "Bulgaria", flag: "🇧🇬", apiName: "Bulgaria", region: "Europe", currency: "BGN", type: "country" },
  "383": { country: "Slovenia", flag: "🇸🇮", apiName: "Slovenia", region: "Europe", currency: "EUR", type: "country" },
  "385": { country: "Croatia", flag: "🇭🇷", apiName: "Croatia", region: "Europe", currency: "EUR", type: "country" },
  "387": { country: "Bosnia & Herzegovina", flag: "🇧🇦", apiName: "Bosnia and Herzegovina", region: "Europe", currency: "BAM", type: "country" },
  "389": { country: "Montenegro", flag: "🇲🇪", apiName: "Montenegro", region: "Europe", currency: "EUR", type: "country" },
  "390": { country: "Kosovo", flag: "🇽🇰", apiName: "Kosovo", region: "Europe", currency: "EUR", type: "country" },
  "400-440": { country: "Germany", flag: "🇩🇪", apiName: "Germany", region: "Europe", currency: "EUR", type: "country" },
  "450-459": { country: "Japan", flag: "🇯🇵", apiName: "Japan", region: "Asia", currency: "JPY", type: "country" },
  "460-469": { country: "Russia", flag: "🇷🇺", apiName: "Russia", region: "Europe", currency: "RUB", type: "country" },
  "470": { country: "Kyrgyzstan", flag: "🇰🇬", apiName: "Kyrgyzstan", region: "Asia", currency: "KGS", type: "country" },
  "471": { country: "Taiwan", flag: "🇹🇼", apiName: "Taiwan", region: "Asia", currency: "TWD", type: "country" },
  "474": { country: "Estonia", flag: "🇪🇪", apiName: "Estonia", region: "Europe", currency: "EUR", type: "country" },
  "475": { country: "Latvia", flag: "🇱🇻", apiName: "Latvia", region: "Europe", currency: "EUR", type: "country" },
  "476": { country: "Azerbaijan", flag: "🇦🇿", apiName: "Azerbaijan", region: "Asia", currency: "AZN", type: "country" },
  "477": { country: "Lithuania", flag: "🇱🇹", apiName: "Lithuania", region: "Europe", currency: "EUR", type: "country" },
  "478": { country: "Uzbekistan", flag: "🇺🇿", apiName: "Uzbekistan", region: "Asia", currency: "UZS", type: "country" },
  "479": { country: "Sri Lanka", flag: "🇱🇰", apiName: "Sri Lanka", region: "Asia", currency: "LKR", type: "country" },
  "480": { country: "Philippines", flag: "🇵🇭", apiName: "Philippines", region: "Asia", currency: "PHP", type: "country" },
  "481": { country: "Belarus", flag: "🇧🇾", apiName: "Belarus", region: "Europe", currency: "BYN", type: "country" },
  "482": { country: "Ukraine", flag: "🇺🇦", apiName: "Ukraine", region: "Europe", currency: "UAH", type: "country" },
  "483": { country: "Turkmenistan", flag: "🇹🇲", apiName: "Turkmenistan", region: "Asia", currency: "TMT", type: "country" },
  "484": { country: "Moldova", flag: "🇲🇩", apiName: "Moldova", region: "Europe", currency: "MDL", type: "country" },
  "485": { country: "Armenia", flag: "🇦🇲", apiName: "Armenia", region: "Asia", currency: "AMD", type: "country" },
  "486": { country: "Georgia", flag: "🇬🇪", apiName: "Georgia", region: "Asia", currency: "GEL", type: "country" },
  "487": { country: "Kazakhstan", flag: "🇰🇿", apiName: "Kazakhstan", region: "Asia", currency: "KZT", type: "country" },
  "488": { country: "Tajikistan", flag: "🇹🇯", apiName: "Tajikistan", region: "Asia", currency: "TJS", type: "country" },
  "489": { country: "Hong Kong SAR", flag: "🇭🇰", apiName: "Hong Kong", region: "Asia", currency: "HKD", type: "country" },
  "490-499": { country: "Japan", flag: "🇯🇵", apiName: "Japan", region: "Asia", currency: "JPY", type: "country" },
  "500-509": { country: "United Kingdom", flag: "🇬🇧", apiName: "United Kingdom", region: "Europe", currency: "GBP", type: "country" },
  "520-521": { country: "Greece", flag: "🇬🇷", apiName: "Greece", region: "Europe", currency: "EUR", type: "country" },
  "528": { country: "Lebanon", flag: "🇱🇧", apiName: "Lebanon", region: "Asia", currency: "LBP", type: "country" },
  "529": { country: "Cyprus", flag: "🇨🇾", apiName: "Cyprus", region: "Europe", currency: "EUR", type: "country" },
  "530": { country: "Albania", flag: "🇦🇱", apiName: "Albania", region: "Europe", currency: "ALL", type: "country" },
  "531": { country: "North Macedonia", flag: "🇲🇰", apiName: "North Macedonia", region: "Europe", currency: "MKD", type: "country" },
  "535": { country: "Malta", flag: "🇲🇹", apiName: "Malta", region: "Europe", currency: "EUR", type: "country" },
  "539": { country: "Ireland", flag: "🇮🇪", apiName: "Ireland", region: "Europe", currency: "EUR", type: "country" },
  "540-549": { country: "Belgium & Luxembourg", flag: "🇧🇪 🇱🇺", apiName: "Belgium", countries: [{ name: "Belgium", flag: "🇧🇪", apiName: "Belgium" }, { name: "Luxembourg", flag: "🇱🇺", apiName: "Luxembourg" }], region: "Europe", currency: "EUR", type: "country" },
  "560": { country: "Portugal", flag: "🇵🇹", apiName: "Portugal", region: "Europe", currency: "EUR", type: "country" },
  "569": { country: "Iceland", flag: "🇮🇸", apiName: "Iceland", region: "Europe", currency: "ISK", type: "country" },
  "570-579": { country: "Denmark, Faroe Islands & Greenland", flag: "🇩🇰 🇫🇴 🇬🇱", apiName: "Denmark", countries: [{ name: "Denmark", flag: "🇩🇰", apiName: "Denmark" }, { name: "Faroe Islands", flag: "🇫🇴", apiName: "Faroe Islands" }, { name: "Greenland", flag: "🇬🇱", apiName: "Greenland" }], region: "Europe", currency: "DKK", type: "country" },
  "590": { country: "Poland", flag: "🇵🇱", apiName: "Poland", region: "Europe", currency: "PLN", type: "country" },
  "594": { country: "Romania", flag: "🇷🇴", apiName: "Romania", region: "Europe", currency: "RON", type: "country" },
  "599": { country: "Hungary", flag: "🇭🇺", apiName: "Hungary", region: "Europe", currency: "HUF", type: "country" },

  // ── Africa & Middle East ─────────────────────────────────────────────────────
  "600-601": { country: "South Africa", flag: "🇿🇦", apiName: "South Africa", region: "Africa", currency: "ZAR", type: "country" },
  "603": { country: "Ghana", flag: "🇬🇭", apiName: "Ghana", region: "Africa", currency: "GHS", type: "country" },
  "604": { country: "Senegal", flag: "🇸🇳", apiName: "Senegal", region: "Africa", currency: "XOF", type: "country" },
  "605": { country: "Uganda", flag: "🇺🇬", apiName: "Uganda", region: "Africa", currency: "UGX", type: "country" },
  "606": { country: "Angola", flag: "🇦🇴", apiName: "Angola", region: "Africa", currency: "AOA", type: "country" },
  "607": { country: "Oman", flag: "🇴🇲", apiName: "Oman", region: "Asia", currency: "OMR", type: "country" },
  "608": { country: "Bahrain", flag: "🇧🇭", apiName: "Bahrain", region: "Asia", currency: "BHD", type: "country" },
  "609": { country: "Mauritius", flag: "🇲🇺", apiName: "Mauritius", region: "Africa", currency: "MUR", type: "country" },
  "611": { country: "Morocco", flag: "🇲🇦", apiName: "Morocco", region: "Africa", currency: "MAD", type: "country" },
  "612": { country: "Somalia", flag: "🇸🇴", apiName: "Somalia", region: "Africa", currency: "SOS", type: "country" },
  "613": { country: "Algeria", flag: "🇩🇿", apiName: "Algeria", region: "Africa", currency: "DZD", type: "country" },
  "614": { country: "Kenya", flag: "🇰🇪", apiName: "Kenya", region: "Africa", currency: "KES", type: "country" },
  "615": { country: "Nigeria", flag: "🇳🇬", apiName: "Nigeria", region: "Africa", currency: "NGN", type: "country" },
  "616": { country: "Kenya", flag: "🇰🇪", apiName: "Kenya", region: "Africa", currency: "KES", type: "country" },
  "617": { country: "Cameroon", flag: "🇨🇲", apiName: "Cameroon", region: "Africa", currency: "XAF", type: "country" },
  "618": { country: "Ivory Coast", flag: "🇨🇮", apiName: "Cote d'Ivoire", region: "Africa", currency: "XOF", type: "country" },
  "619": { country: "Tunisia", flag: "🇹🇳", apiName: "Tunisia", region: "Africa", currency: "TND", type: "country" },
  "620": { country: "Tanzania", flag: "🇹🇿", apiName: "Tanzania", region: "Africa", currency: "TZS", type: "country" },
  "621": { country: "Syria", flag: "🇸🇾", apiName: "Syria", region: "Asia", currency: "SYP", type: "country" },
  "622": { country: "Egypt", flag: "🇪🇬", apiName: "Egypt", region: "Africa", currency: "EGP", type: "country" },
  "623": { country: "Brunei", flag: "🇧🇳", apiName: "Brunei", region: "Asia", currency: "BND", type: "country" },
  "624": { country: "Libya", flag: "🇱🇾", apiName: "Libya", region: "Africa", currency: "LYD", type: "country" },
  "625": { country: "Jordan", flag: "🇯🇴", apiName: "Jordan", region: "Asia", currency: "JOD", type: "country" },
  "626": { country: "Iran", flag: "🇮🇷", apiName: "Iran", region: "Asia", currency: "IRR", type: "country" },
  "627": { country: "Kuwait", flag: "🇰🇼", apiName: "Kuwait", region: "Asia", currency: "KWD", type: "country" },
  "628": { country: "Saudi Arabia", flag: "🇸🇦", apiName: "Saudi Arabia", region: "Asia", currency: "SAR", type: "country" },
  "629": { country: "United Arab Emirates", flag: "🇦🇪", apiName: "United Arab Emirates", region: "Asia", currency: "AED", type: "country" },
  "630": { country: "Qatar", flag: "🇶🇦", apiName: "Qatar", region: "Asia", currency: "QAR", type: "country" },
  "631": { country: "Namibia", flag: "🇳🇦", apiName: "Namibia", region: "Africa", currency: "NAD", type: "country" },
  "632": { country: "Rwanda", flag: "🇷🇼", apiName: "Rwanda", region: "Africa", currency: "RWF", type: "country" },
  "633": { country: "Ethiopia", flag: "🇪🇹", apiName: "Ethiopia", region: "Africa", currency: "ETB", type: "country" },
  "634": { country: "Mozambique", flag: "🇲🇿", apiName: "Mozambique", region: "Africa", currency: "MZN", type: "country" },
  "635": { country: "Zambia", flag: "🇿🇲", apiName: "Zambia", region: "Africa", currency: "ZMW", type: "country" },
  "636": { country: "Zimbabwe", flag: "🇿🇼", apiName: "Zimbabwe", region: "Africa", currency: "USD", type: "country" },

  // ── Finland ──────────────────────────────────────────────────────────────────
  "640-649": { country: "Finland", flag: "🇫🇮", apiName: "Finland", region: "Europe", currency: "EUR", type: "country" },

  // ── China ────────────────────────────────────────────────────────────────────
  "680-681": { country: "China", flag: "🇨🇳", apiName: "China", region: "Asia", currency: "CNY", type: "country" },
  "690-699": { country: "China", flag: "🇨🇳", apiName: "China", region: "Asia", currency: "CNY", type: "country" },

  // ── Scandinavia & More Europe ─────────────────────────────────────────────────
  "700-709": { country: "Norway", flag: "🇳🇴", apiName: "Norway", region: "Europe", currency: "NOK", type: "country" },
  "729": { country: "Israel", flag: "🇮🇱", apiName: "Israel", region: "Asia", currency: "ILS", type: "country" },
  "730-739": { country: "Sweden", flag: "🇸🇪", apiName: "Sweden", region: "Europe", currency: "SEK", type: "country" },

  // ── Central America ──────────────────────────────────────────────────────────
  "740": { country: "Guatemala", flag: "🇬🇹", apiName: "Guatemala", region: "North America", currency: "GTQ", type: "country" },
  "741": { country: "El Salvador", flag: "🇸🇻", apiName: "El Salvador", region: "North America", currency: "USD", type: "country" },
  "742": { country: "Honduras", flag: "🇭🇳", apiName: "Honduras", region: "North America", currency: "HNL", type: "country" },
  "743": { country: "Nicaragua", flag: "🇳🇮", apiName: "Nicaragua", region: "North America", currency: "NIO", type: "country" },
  "744": { country: "Costa Rica", flag: "🇨🇷", apiName: "Costa Rica", region: "North America", currency: "CRC", type: "country" },
  "745": { country: "Panama", flag: "🇵🇦", apiName: "Panama", region: "North America", currency: "PAB", type: "country" },
  "746": { country: "Dominican Republic", flag: "🇩🇴", apiName: "Dominican Republic", region: "North America", currency: "DOP", type: "country" },

  // ── Mexico, Canada, South America ────────────────────────────────────────────
  "750": { country: "Mexico", flag: "🇲🇽", apiName: "Mexico", region: "North America", currency: "MXN", type: "country" },
  "754-755": { country: "Canada", flag: "🇨🇦", apiName: "Canada", region: "North America", currency: "CAD", type: "country" },
  "759": { country: "Venezuela", flag: "🇻🇪", apiName: "Venezuela", region: "South America", currency: "VES", type: "country" },
  "760-769": { country: "Switzerland & Liechtenstein", flag: "🇨🇭 🇱🇮", apiName: "Switzerland", countries: [{ name: "Switzerland", flag: "🇨🇭", apiName: "Switzerland" }, { name: "Liechtenstein", flag: "🇱🇮", apiName: "Liechtenstein" }], region: "Europe", currency: "CHF", type: "country" },
  "770-771": { country: "Colombia", flag: "🇨🇴", apiName: "Colombia", region: "South America", currency: "COP", type: "country" },
  "773": { country: "Uruguay", flag: "🇺🇾", apiName: "Uruguay", region: "South America", currency: "UYU", type: "country" },
  "775": { country: "Peru", flag: "🇵🇪", apiName: "Peru", region: "South America", currency: "PEN", type: "country" },
  "777": { country: "Paraguay", flag: "🇵🇾", apiName: "Paraguay", region: "South America", currency: "PYG", type: "country" },
  "778-779": { country: "Argentina", flag: "🇦🇷", apiName: "Argentina", region: "South America", currency: "ARS", type: "country" },
  "780": { country: "Chile", flag: "🇨🇱", apiName: "Chile", region: "South America", currency: "CLP", type: "country" },
  "784": { country: "Paraguay", flag: "🇵🇾", apiName: "Paraguay", region: "South America", currency: "PYG", type: "country" },
  "786": { country: "Ecuador", flag: "🇪🇨", apiName: "Ecuador", region: "South America", currency: "USD", type: "country" },
  "789-790": { country: "Brazil", flag: "🇧🇷", apiName: "Brazil", region: "South America", currency: "BRL", type: "country" },

  // ── Southern Europe ───────────────────────────────────────────────────────────
  "800-839": { country: "Italy, San Marino & Vatican City", flag: "🇮🇹 🇸🇲 🇻🇦", apiName: "Italy", countries: [{ name: "Italy", flag: "🇮🇹", apiName: "Italy" }, { name: "San Marino", flag: "🇸🇲", apiName: "San Marino" }, { name: "Vatican City", flag: "🇻🇦", apiName: "Vatican City" }], region: "Europe", currency: "EUR", type: "country" },
  "840-849": { country: "Spain & Andorra", flag: "🇪🇸 🇦🇩", apiName: "Spain", countries: [{ name: "Spain", flag: "🇪🇸", apiName: "Spain" }, { name: "Andorra", flag: "🇦🇩", apiName: "Andorra" }], region: "Europe", currency: "EUR", type: "country" },
  "850": { country: "Cuba", flag: "🇨🇺", apiName: "Cuba", region: "North America", currency: "CUP", type: "country" },
  "858": { country: "Slovakia", flag: "🇸🇰", apiName: "Slovakia", region: "Europe", currency: "EUR", type: "country" },
  "859": { country: "Czech Republic", flag: "🇨🇿", apiName: "Czech Republic", region: "Europe", currency: "CZK", type: "country" },
  "860": { country: "Serbia", flag: "🇷🇸", apiName: "Serbia", region: "Europe", currency: "RSD", type: "country" },
  "865": { country: "Mongolia", flag: "🇲🇳", apiName: "Mongolia", region: "Asia", currency: "MNT", type: "country" },
  "867": { country: "North Korea", flag: "🇰🇵", apiName: "North Korea", region: "Asia", currency: "KPW", type: "country" },
  "868-869": { country: "Turkey", flag: "🇹🇷", apiName: "Turkey", region: "Asia", currency: "TRY", type: "country" },
  "870-879": { country: "Netherlands", flag: "🇳🇱", apiName: "Netherlands", region: "Europe", currency: "EUR", type: "country" },
  "880": { country: "South Korea", flag: "🇰🇷", apiName: "South Korea", region: "Asia", currency: "KRW", type: "country" },
  "883": { country: "Myanmar", flag: "🇲🇲", apiName: "Myanmar", region: "Asia", currency: "MMK", type: "country" },
  "884": { country: "Cambodia", flag: "🇰🇭", apiName: "Cambodia", region: "Asia", currency: "KHR", type: "country" },
  "885": { country: "Thailand", flag: "🇹🇭", apiName: "Thailand", region: "Asia", currency: "THB", type: "country" },
  "888": { country: "Singapore", flag: "🇸🇬", apiName: "Singapore", region: "Asia", currency: "SGD", type: "country" },
  "890": { country: "India", flag: "🇮🇳", apiName: "India", region: "Asia", currency: "INR", type: "country" },
  "893": { country: "Vietnam", flag: "🇻🇳", apiName: "Vietnam", region: "Asia", currency: "VND", type: "country" },
  "894": { country: "Bangladesh", flag: "🇧🇩", apiName: "Bangladesh", region: "Asia", currency: "BDT", type: "country" },
  "896": { country: "Pakistan", flag: "🇵🇰", apiName: "Pakistan", region: "Asia", currency: "PKR", type: "country" },
  "899": { country: "Indonesia", flag: "🇮🇩", apiName: "Indonesia", region: "Asia", currency: "IDR", type: "country" },

  // ── Austria & Oceania ─────────────────────────────────────────────────────────
  "900-919": { country: "Austria", flag: "🇦🇹", apiName: "Austria", region: "Europe", currency: "EUR", type: "country" },
  "930-939": { country: "Australia", flag: "🇦🇺", apiName: "Australia", region: "Oceania", currency: "AUD", type: "country" },
  "940-949": { country: "New Zealand", flag: "🇳🇿", apiName: "New Zealand", region: "Oceania", currency: "NZD", type: "country" },

  // ── GS1 Global / Special Allocations ─────────────────────────────────────────
  "950": { country: "GS1 Global Office", flag: "🌐", apiName: null, region: "Global", currency: "N/A", type: "special", note: "Used by GS1 Global Office for administrative purposes" },
  "951": { country: "GS1 Global Office (EPC)", flag: "🌐", apiName: null, region: "Global", currency: "N/A", type: "special", note: "EPC General Identifier (GID) — Electronic Product Codes for RFID" },
  "952": { country: "GS1 Demonstrations", flag: "🌐", apiName: null, region: "Global", currency: "N/A", type: "special", note: "Reserved for GS1 demonstrations and examples — not a real product" },
  "955": { country: "Malaysia", flag: "🇲🇾", apiName: "Malaysia", region: "Asia", currency: "MYR", type: "country" },
  "958": { country: "Macau SAR", flag: "🇲🇴", apiName: "Macao", region: "Asia", currency: "MOP", type: "country" },
  "960-969": { country: "GS1 GTIN-8 Allocations", flag: "🌐", apiName: null, region: "Global", currency: "N/A", type: "special", note: "GS1 Global Office GTIN-8 (short barcode) allocations" },

  // ── Publications ──────────────────────────────────────────────────────────────
  "977": { country: "Serial Publications (ISSN)", flag: "📰", apiName: null, region: "N/A", currency: "N/A", type: "special", note: "International Standard Serial Number — identifies magazines and periodicals" },
  "978-979": { country: "Books (ISBN / Bookland)", flag: "📚", apiName: null, region: "N/A", currency: "N/A", type: "special", note: "International Standard Book Number (ISBN) — the GS1 prefix for books worldwide" },

  // ── Coupons & Receipts ────────────────────────────────────────────────────────
  "980": { country: "Refund Receipts", flag: "🧾", apiName: null, region: "N/A", currency: "N/A", type: "special", note: "GS1 refund receipt identifier" },
  "981-983": { country: "GS1 Common Currency Coupons", flag: "🎟️", apiName: null, region: "N/A", currency: "N/A", type: "special", note: "GS1 coupon identification — common currency area" },
  "990-999": { country: "GS1 Coupons", flag: "🎟️", apiName: null, region: "N/A", currency: "N/A", type: "special", note: "GS1 coupon identification" }
};

// ── Build flat lookup table ──────────────────────────────────────────────────
// Expand all range-notation keys ("400-440") into individual 3-digit keys.
// This runs once at module load and makes O(1) lookups possible at runtime.

const prefixTable = {};

for (const rangeKey of Object.keys(RAW_PREFIXES)) {
  const parts = rangeKey.split('-');
  if (parts.length === 2 && parts[0].length === parts[1].length && parts[0].length <= 3) {
    // Range like "400-440" or "000-019"
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    for (let i = start; i <= end; i++) {
      const key = String(i).padStart(parts[0].length === 3 ? 3 : 2, '0');
      prefixTable[key] = RAW_PREFIXES[rangeKey];
    }
  } else {
    // Single prefix like "380" or "978"
    const padded = rangeKey.padStart(3, '0');
    prefixTable[padded] = RAW_PREFIXES[rangeKey];
  }
}

/**
 * Resolves a 3-digit GS1 prefix to its registered country/entity.
 * All EAN-13 / UPC-A barcodes start with a 3-digit GS1 prefix.
 *
 * @param {string} prefix — 3-digit prefix (first 3 digits of an EAN-13 code)
 * @returns {{
 *   found: boolean,
 *   prefix: string,
 *   country: string,
 *   flag: string,
 *   apiName: string|null,
 *   region: string,
 *   currency: string,
 *   type: string,
 *   note: string|null
 * }}
 */
function resolvePrefix(prefix) {
  const key = String(prefix).padStart(3, '0');
  const entry = prefixTable[key];

  if (!entry) {
    return {
      found: false,
      prefix: key,
      country: "Unknown Origin",
      flag: "❓",
      apiName: null,
      region: "N/A",
      currency: "N/A",
      type: "unknown",
      note: `GS1 prefix ${key} is not currently assigned in our registry. It may be a newly allocated range.`
    };
  }

  return {
    found: true,
    prefix: key,
    ...entry
  };
}

export { resolvePrefix, prefixTable, RAW_PREFIXES };
