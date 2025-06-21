const countryData = {
  // United States (USA) prefixes
  "000-019": { name: "United States (UPC-A compatible)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "020-029": { name: "United States (restricted circulation numbers)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "030-039": { name: "United States (drugs, National Drug Code)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "040-049": { name: "United States (restricted circulation within a company)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "050-059": { name: "United States (reserved for future use)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "060-099": { name: "United States (UPC-A compatible)", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },
  "100-139": { name: "United States", flag: "🇺🇸", apiLookupName: "United States", region: "North America", currency: "United States Dollar (USD)" },

  // Other countries with region, currency, and apiLookupName
  "200-299": { name: "GS1 (restricted circulation within a region)", flag: "🌍", apiLookupName: "Unknown", region: "Global", currency: "N/A" },
  "300-379": { name: "France and Monaco", flag: "🇫🇷", apiLookupName: "France", region: "Europe", currency: "Euro (EUR)" },
  "380": { name: "Bulgaria", flag: "🇧🇬", apiLookupName: "Bulgaria", region: "Europe", currency: "Bulgarian Lev (BGN)" },
  "383": { name: "Slovenia", flag: "🇸🇮", apiLookupName: "Slovenia", region: "Europe", currency: "Euro (EUR)" },
  "385": { name: "Croatia", flag: "🇭🇷", apiLookupName: "Croatia", region: "Europe", currency: "Euro (EUR)" },
  "387": { name: "Bosnia and Herzegovina", flag: "🇧🇦", apiLookupName: "Bosnia and Herzegovina", region: "Europe", currency: "Bosnian Convertible Mark (BAM)" },
  "389": { name: "Montenegro", flag: "🇲🇪", apiLookupName: "Montenegro", region: "Europe", currency: "Euro (EUR)" },
  "390": { name: "Kosovo", flag: "🇽🇰", apiLookupName: "Kosovo", region: "Europe", currency: "Euro (EUR)" },
  "400-440": { name: "Germany", flag: "🇩🇪", apiLookupName: "Germany", region: "Europe", currency: "Euro (EUR)" },
  "450-459": { name: "Japan", flag: "🇯🇵", apiLookupName: "Japan", region: "Asia", currency: "Japanese Yen (JPY)" },
  "460-469": { name: "Russia", flag: "🇷🇺", apiLookupName: "Russia", region: "Europe/Asia", currency: "Russian Ruble (RUB)" },
  "470": { name: "Kyrgyzstan", flag: "🇰🇬", apiLookupName: "Kyrgyzstan", region: "Asia", currency: "Kyrgyzstani Som (KGS)" },
  "471": { name: "Taiwan", flag: "🇹🇼", apiLookupName: "Taiwan", region: "Asia", currency: "New Taiwan Dollar (TWD)" },
  "474": { name: "Estonia", flag: "🇪🇪", apiLookupName: "Estonia", region: "Europe", currency: "Euro (EUR)" },
  "475": { name: "Latvia", flag: "🇱🇻", apiLookupName: "Latvia", region: "Europe", currency: "Euro (EUR)" },
  "476": { name: "Azerbaijan", flag: "🇦🇿", apiLookupName: "Azerbaijan", region: "Asia", currency: "Azerbaijani Manat (AZN)" },
  "477": { name: "Lithuania", flag: "🇱🇹", apiLookupName: "Lithuania", region: "Europe", currency: "Euro (EUR)" }, // Corrected flag from LR to LT
  "479": { name: "Sri Lanka", flag: "🇱🇰", apiLookupName: "Sri Lanka", region: "Asia", currency: "Sri Lankan Rupee (LKR)" },
  "480": { name: "Philippines", flag: "🇵🇭", apiLookupName: "Philippines", region: "Asia", currency: "Philippine Peso (PHP)" },
  "481": { name: "Belarus", flag: "🇧🇾", apiLookupName: "Belarus", region: "Europe", currency: "Belarusian Ruble (BYN)" },
  "482": { name: "Ukraine", flag: "🇺🇦", apiLookupName: "Ukraine", region: "Europe", currency: "Ukrainian Hryvnia (UAH)" },
  "483": { name: "Turkmenistan", flag: "🇹🇲", apiLookupName: "Turkmenistan", region: "Asia", currency: "Turkmenistani Manat (TMT)" },
  "484": { name: "Moldova", flag: "🇲🇩", apiLookupName: "Moldova", region: "Europe", currency: "Moldovan Leu (MDL)" },
  "485": { name: "Armenia", flag: "🇦🇲", apiLookupName: "Armenia", region: "Asia", currency: "Armenian Dram (AMD)" },
  "486": { name: "Georgia", flag: "🇬🇪", apiLookupName: "Georgia", region: "Asia", currency: "Georgian Lari (GEL)" },
  "487": { name: "Kazakhstan", flag: "🇰🇿", apiLookupName: "Kazakhstan", region: "Asia", currency: "Kazakhstani Tenge (KZT)" }, // Corrected flag from VI to KZ
  "488": { name: "Tajikistan", flag: "🇹🇯", apiLookupName: "Tajikistan", region: "Asia", currency: "Tajikistani Somoni (TJS)" },
  "489": { name: "Hong Kong", flag: "🇭🇰", apiLookupName: "Hong Kong", region: "Asia", currency: "Hong Kong Dollar (HKD)" },
  "490-499": { name: "Japan", flag: "🇯🇵", apiLookupName: "Japan", region: "Asia", currency: "Japanese Yen (JPY)" },
  "500-509": { name: "United Kingdom", flag: "🇬🇧", apiLookupName: "United Kingdom", region: "Europe", currency: "Pound Sterling (GBP)" },
  "520-521": { name: "Greece", flag: "🇬🇷", apiLookupName: "Greece", region: "Europe", currency: "Euro (EUR)" },
  "528": { name: "Lebanon", flag: "🇱🇧", apiLookupName: "Lebanon", region: "Asia", currency: "Lebanese Pound (LBP)" },
  "529": { name: "Cyprus", flag: "🇨🇾", apiLookupName: "Cyprus", region: "Europe", currency: "Euro (EUR)" },
  "530": { name: "Albania", flag: "🇦🇱", apiLookupName: "Albania", region: "Europe", currency: "Albanian Lek (ALL)" },
  "531": { name: "North Macedonia", flag: "🇲🇰", apiLookupName: "North Macedonia", region: "Europe", currency: "Macedonian Denar (MKD)" },
  "535": { name: "Malta", flag: "🇲🇹", apiLookupName: "Malta", region: "Europe", currency: "Euro (EUR)" },
  "539": { name: "Ireland", flag: "🇮🇪", apiLookupName: "Ireland", region: "Europe", currency: "Euro (EUR)" },
  "540-549": { name: "Belgium and Luxembourg", flag: "🇧🇪🇱🇺", apiLookupName: "Belgium", region: "Europe", currency: "Euro (EUR)" },
  "560": { name: "Portugal", flag: "🇵🇹", apiLookupName: "Portugal", region: "Europe", currency: "Euro (EUR)" },
  "569": { name: "Iceland", flag: "🇮🇸", apiLookupName: "Iceland", region: "Europe", currency: "Icelandic Króna (ISK)" },
  "570-579": { name: "Denmark, Faroe Islands, and Greenland", flag: "🇩🇰", apiLookupName: "Denmark", region: "Europe", currency: "Danish Krone (DKK)" },
  "590": { name: "Poland", flag: "🇵🇱", apiLookupName: "Poland", region: "Europe", currency: "Polish Złoty (PLN)" },
  "594": { name: "Romania", flag: "🇷🇴", apiLookupName: "Romania", region: "Europe", currency: "Romanian Leu (RON)" },
  "599": { name: "Hungary", flag: "🇭🇺", apiLookupName: "Hungary", region: "Europe", currency: "Hungarian Forint (HUF)" },
  "600-601": { name: "South Africa", flag: "🇿🇦", apiLookupName: "South Africa", region: "Africa", currency: "South African Rand (ZAR)" },
  "603": { name: "Ghana", flag: "🇬🇭", apiLookupName: "Ghana", region: "Africa", currency: "Ghanaian Cedi (GHS)" },
  "604": { name: "Senegal", flag: "🇸🇳", apiLookupName: "Senegal", region: "Africa", currency: "West African CFA Franc (XOF)" },
  "605": { name: "Uganda", flag: "🇺🇬", apiLookupName: "Uganda", region: "Africa", currency: "Ugandan Shilling (UGX)" },
  "606": { name: "Angola", flag: "🇦🇴", apiLookupName: "Angola", region: "Africa", currency: "Angolan Kwanza (AOA)" },
  "607": { name: "Oman", flag: "🇴🇲", apiLookupName: "Oman", region: "Asia", currency: "Omani Rial (OMR)" },
  "608": { name: "Bahrain", flag: "🇧🇭", apiLookupName: "Bahrain", region: "Asia", currency: "Bahraini Dinar (BHD)" },
  "609": { name: "Mauritius", flag: "🇲🇺", apiLookupName: "Mauritius", region: "Africa", currency: "Mauritian Rupee (MUR)" },
  "611": { name: "Morocco", flag: "🇲🇦", apiLookupName: "Morocco", region: "Africa", currency: "Moroccan Dirham (MAD)" },
  "612": { name: "Somalia", flag: "🇸🇴", apiLookupName: "Somalia", region: "Africa", currency: "Somali Shilling (SOS)" },
  "613": { name: "Algeria", flag: "🇩🇿", apiLookupName: "Algeria", region: "Africa", currency: "Algerian Dinar (DZD)" },
  "615": { name: "Nigeria", flag: "🇳🇬", apiLookupName: "Nigeria", region: "Africa", currency: "Nigerian Naira (NGN)" },
  "616": { name: "Kenya", flag: "🇰🇪", apiLookupName: "Kenya", region: "Africa", currency: "Kenyan Shilling (KES)" },
  "617": { name: "Cameroon", flag: "🇨🇲", apiLookupName: "Cameroon", region: "Africa", currency: "Central African CFA Franc (XAF)" },
  "618": { name: "Ivory Coast", flag: "🇨🇮", apiLookupName: "Ivory Coast", region: "Africa", currency: "West African CFA Franc (XOF)" },
  "619": { name: "Tunisia", flag: "🇹�", apiLookupName: "Tunisia", region: "Africa", currency: "Tunisian Dinar (TND)" },
  "620": { name: "Tanzania", flag: "🇹🇿", apiLookupName: "Tanzania", region: "Africa", currency: "Tanzanian Shilling (TZS)" },
  "621": { name: "Syria", flag: "🇸🇾", apiLookupName: "Syria", region: "Asia", currency: "Syrian Pound (SYP)" },
  "622": { name: "Egypt", flag: "🇪🇬", apiLookupName: "Egypt", region: "Africa", currency: "Egyptian Pound (EGP)" },
  "623": { name: "Brunei", flag: "🇧🇳", apiLookupName: "Brunei", region: "Asia", currency: "Brunei Dollar (BND)" },
  "624": { name: "Libya", flag: "🇱🇾", apiLookupName: "Libya", region: "Africa", currency: "Libyan Dinar (LYD)" },
  "625": { name: "Jordan", flag: "🇯🇴", apiLookupName: "Jordan", region: "Asia", currency: "Jordanian Dinar (JOD)" },
  "626": { name: "Iran", flag: "🇮🇷", apiLookupName: "Iran", region: "Asia", currency: "Iranian Rial (IRR)" },
  "627": { name: "Kuwait", flag: "🇰🇼", apiLookupName: "Kuwait", region: "Asia", currency: "Kuwaiti Dinar (KWD)" },
  "628": { name: "Saudi Arabia", flag: "🇸🇦", apiLookupName: "Saudi Arabia", region: "Asia", currency: "Saudi Riyal (SAR)" },
  "629": { name: "United Arab Emirates", flag: "🇦🇪", apiLookupName: "United Arab Emirates", region: "Asia", currency: "United Arab Emirates Dirham (AED)" },
  "630": { name: "Qatar", flag: "🇶🇦", apiLookupName: "Qatar", region: "Asia", currency: "Qatari Riyal (QAR)" },
  "631": { name: "Namibia", flag: "🇳🇦", apiLookupName: "Namibia", region: "Africa", currency: "Namibian Dollar (NAD)" },
  "632": { name: "Rwanda", flag: "🇷🇼", apiLookupName: "Rwanda", region: "Africa", currency: "Rwandan Franc (RWF)" },
  "640-649": { name: "Finland", flag: "🇫🇮", apiLookupName: "Finland", region: "Europe", currency: "Euro (EUR)" },
  "680-681": { name: "China", flag: "🇨🇳", apiLookupName: "China", region: "Asia", currency: "Chinese Yuan (CNY)" },
  "690-699": { name: "China", flag: "🇨🇳", apiLookupName: "China", region: "Asia", currency: "Chinese Yuan (CNY)" },
  "700-709": { name: "Norway", flag: "🇳🇴", apiLookupName: "Norway", region: "Europe", currency: "Norwegian Krone (NOK)" },
  "729": { name: "Israel", flag: "🇮🇱", apiLookupName: "Israel", region: "Asia", currency: "Israeli New Shekel (ILS)" },
  "730-739": { name: "Sweden", flag: "🇸🇪", apiLookupName: "Sweden", region: "Europe", currency: "Swedish Krona (SEK)" },
  "740": { name: "Guatemala", flag: "🇬🇹", apiLookupName: "Guatemala", region: "North America", currency: "Guatemalan Quetzal (GTQ)" },
  "741": { name: "El Salvador", flag: "🇸🇻", apiLookupName: "El Salvador", region: "North America", currency: "United States Dollar (USD)" },
  "742": { name: "Honduras", flag: "🇭🇳", apiLookupName: "Honduras", region: "North America", currency: "Honduran Lempira (HNL)" },
  "743": { name: "Nicaragua", flag: "🇳🇮", apiLookupName: "Nicaragua", region: "North America", currency: "Nicaraguan Córdoba (NIO)" },
  "744": { name: "Costa Rica", flag: "🇨🇷", apiLookupName: "Costa Rica", region: "North America", currency: "Costa Rican Colón (CRC)" },
  "745": { name: "Panama", flag: "🇵🇦", apiLookupName: "Panama", region: "North America", currency: "Panamanian Balboa (PAB)" },
  "746": { name: "Dominican Republic", flag: "🇩🇴", apiLookupName: "Dominican Republic", region: "North America", currency: "Dominican Peso (DOP)" },
  "750": { name: "Mexico", flag: "🇲🇽", apiLookupName: "Mexico", region: "North America", currency: "Mexican Peso (MXN)" },
  "754-755": { name: "Canada", flag: "🇨🇦", apiLookupName: "Canada", region: "North America", currency: "Canadian Dollar (CAD)" },
  "759": { name: "Venezuela", flag: "🇻🇪", apiLookupName: "Venezuela", region: "South America", currency: "Venezuelan Bolívar (VES)" },
  "760-769": { name: "Switzerland and Liechtenstein", flag: "🇨🇭", apiLookupName: "Switzerland", region: "Europe", currency: "Swiss Franc (CHF)" },
  "770-771": { name: "Colombia", flag: "🇨🇴", apiLookupName: "Colombia", region: "South America", currency: "Colombian Peso (COP)" },
  "773": { name: "Uruguay", flag: "🇺🇾", apiLookupName: "Uruguay", region: "South America", currency: "Uruguayan Peso (UYU)" },
  "775": { name: "Peru", flag: "🇵🇪", apiLookupName: "Peru", region: "South America", currency: "Peruvian Sol (PEN)" },
  "777": { name: "Paraguay", flag: "🇵🇾", apiLookupName: "Paraguay", region: "South America", currency: "Paraguayan Guarani (PYG)" },
  "778": { name: "Chile", flag: "🇨🇱", apiLookupName: "Chile", region: "South America", currency: "Chilean Peso (CLP)" },
  "779": { name: "Argentina", flag: "🇦🇷", apiLookupName: "Argentina", region: "South America", currency: "Argentine Peso (ARS)" },
  "780": { name: "Chile", flag: "🇨🇱", apiLookupName: "Chile", region: "South America", currency: "Chilean Peso (CLP)" }, 
  "781": { name: "Argentina", flag: "🇦🇷", apiLookupName: "Argentina", region: "South America", currency: "Argentine Peso (ARS)" },
  "782": { name: "Paraguay", flag: "🇵🇾", apiLookupName: "Paraguay", region: "South America", currency: "Paraguayan Guarani (PYG)" },
  "786": { name: "Ecuador", flag: "🇪🇨", apiLookupName: "Ecuador", region: "South America", currency: "United States Dollar (USD)" },
  "789-790": { name: "Brazil", flag: "🇧🇷", apiLookupName: "Brazil", region: "South America", currency: "Brazilian Real (BRL)" },
  "800-839": { name: "Italy, San Marino, and Vatican City", flag: "🇮🇹", apiLookupName: "Italy", region: "Europe", currency: "Euro (EUR)" },
  "840-849": { name: "Spain and Andorra", flag: "🇪🇸", apiLookupName: "Spain", region: "Europe", currency: "Euro (EUR)" },
  "850": { name: "Cuba", flag: "🇨🇺", apiLookupName: "Cuba", region: "North America", currency: "Cuban Peso (CUP)" },
  "858": { name: "Slovakia", flag: "🇸🇰", apiLookupName: "Slovakia", region: "Europe", currency: "Euro (EUR)" },
  "859": { name: "Czech Republic", flag: "🇨🇿", apiLookupName: "Czech Republic", region: "Europe", currency: "Czech Koruna (CZK)" },
  "860": { name: "Serbia", flag: "🇷🇸", apiLookupName: "Serbia", region: "Europe", currency: "Serbian Dinar (RSD)" },
  "865": { name: "Mongolia", flag: "🇲🇳", apiLookupName: "Mongolia", region: "Asia", currency: "Mongolian Tögrög (MNT)" },
  "867": { name: "North Korea", flag: "🇰🇵", apiLookupName: "North Korea", region: "Asia", currency: "North Korean Won (KPW)" },
  "868-869": { name: "Turkey", flag: "🇹🇷", apiLookupName: "Turkey", region: "Asia/Europe", currency: "Turkish Lira (TRY)" },
  "870-879": { name: "Netherlands", flag: "🇳🇱", apiLookupName: "Netherlands", region: "Europe", currency: "Euro (EUR)" },
  "880-881": { name: "South Korea", flag: "🇰🇷", apiLookupName: "South Korea", region: "Asia", currency: "South Korean Won (KRW)" },
  "883": { name: "Myanmar", flag: "🇲🇲", apiLookupName: "Myanmar", region: "Asia", currency: "Myanmar Kyat (MMK)" },
  "884": { name: "Cambodia", flag: "🇰🇭", apiLookupName: "Cambodia", region: "Asia", currency: "Cambodian Riel (KHR)" },
  "885": { name: "Thailand", flag: "🇹🇭", apiLookupName: "Thailand", region: "Asia", currency: "Thai Baht (THB)" },
  "888": { name: "Singapore", flag: "🇸🇬", apiLookupName: "Singapore", region: "Asia", currency: "Singapore Dollar (SGD)" },
  "890": { name: "India", flag: "🇮🇳", apiLookupName: "India", region: "Asia", currency: "Indian Rupee (INR)" },
  "893": { name: "Vietnam", flag: "🇻🇳", apiLookupName: "Vietnam", region: "Asia", currency: "Vietnamese Đồng (VND)" },
  "894": { name: "Bangladesh", flag: "🇧🇩", apiLookupName: "Bangladesh", region: "Asia", currency: "Bangladeshi Taka (BDT)" },
  "896": { name: "Pakistan", flag: "🇵🇰", apiLookupName: "Pakistan", region: "Asia", currency: "Pakistani Rupee (PKR)" },
  "899": { name: "Indonesia", flag: "🇮🇩", apiLookupName: "Indonesia", region: "Asia", currency: "Indonesian Rupiah (IDR)" },
  "900-919": { name: "Austria", flag: "🇦🇹", apiLookupName: "Austria", region: "Europe", currency: "Euro (EUR)" },
  "930-939": { name: "Australia", flag: "🇦🇺", apiLookupName: "Australia", region: "Oceania", currency: "Australian Dollar (AUD)" },
  "940-949": { name: "New Zealand", flag: "🇳🇿", apiLookupName: "New Zealand", region: "Oceania", currency: "New Zealand Dollar (NZD)" },
  "950": { name: "GS1 Global Office", flag: "🌍", apiLookupName: "Unknown", region: "Global", currency: "N/A" },
  "951": { name: "EPC General Identifier (GID)", flag: "🌍", apiLookupName: "Unknown", region: "Global", currency: "N/A" },
  "952": { name: "GS1 Demonstrations and Examples", flag: "🌍", apiLookupName: "Unknown", region: "Global", currency: "N/A" },
  "955": { name: "Malaysia", flag: "🇲🇾", apiLookupName: "Malaysia", region: "Asia", currency: "Malaysian Ringgit (MYR)" },
  "958": { name: "Macau", flag: "🇲🇴", apiLookupName: "Macau", region: "Asia", currency: "Macanese Pataca (MOP)" },
  "960-969": { name: "GS1 Global Office: GTIN-8 allocations", flag: "🌍", apiLookupName: "Unknown", region: "Global", currency: "N/A" },
  "977": { name: "Serial publications (ISSN)", flag: "📖", apiLookupName: "Unknown", region: "N/A", currency: "N/A" },
  "978-979": { name: "Bookland (ISBN)", flag: "📚", apiLookupName: "Unknown", region: "N/A", currency: "N/A" },
  "980": { name: "Refund receipts", flag: "🧾", apiLookupName: "Unknown", region: "N/A", currency: "N/A" },
  "981-983": { name: "GS1 coupon identification (common currency)", flag: "💵", apiLookupName: "Unknown", region: "N/A", currency: "N/A" },
  "990-999": { name: "GS1 coupon identification", flag: "💵", apiLookupName: "Unknown", region: "N/A", currency: "N/A" }
};

// Pre-process countryData into a prefix lookup table
const prefixLookup = {};
try {
  for (let range in countryData) {
    const [start, end] = range.split('-').map(num => parseInt(num));
    if (isNaN(end)) {
      prefixLookup[start.toString().padStart(3, '0')] = countryData[range];
    } else {
      // Range (e.g., "000-019")
      for (let i = start; i <= end; i++) {
        prefixLookup[i.toString().padStart(3, '0')] = countryData[range];
      }
    }
  }
} catch (error) {
  console.error('Failed to build prefix lookup:', error);
}

function getCountryByEANPrefix(prefix) {
  try {
    const cleanPrefix = prefix.trim().padStart(3, '0');
    const defaultUnknown = { name: "Unknown Origin", flag: "❓", apiLookupName: "Unknown", region: "N/A", currency: "N/A" };
    const result = prefixLookup[cleanPrefix] || defaultUnknown;
    if (!result.apiLookupName) {
        result.apiLookupName = result.name === "Unknown Origin" ? "Unknown" : result.name.split(' (')[0]; // Fallback if not set
    }
    return result;
  } catch (error) {
    return { name: "Unknown Origin", flag: "❓", apiLookupName: "Unknown", region: "N/A", currency: "N/A" }; // Ensure full default object
  }
}

export { countryData, getCountryByEANPrefix };
