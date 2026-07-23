/**
 * fontMap.js - Comprehensive Mapping of Unicode Font Styles for Fancy Keyboard
 */

function buildRangeMap(upperStart, lowerStart, overrides = {}) {
  const map = {};
  const upperA = 'A'.charCodeAt(0);
  const lowerA = 'a'.charCodeAt(0);

  for (let i = 0; i < 26; i++) {
    const charUpper = String.fromCharCode(upperA + i);
    const charLower = String.fromCharCode(lowerA + i);

    map[charUpper] = overrides[charUpper] || String.fromCodePoint(upperStart + i);
    map[charLower] = overrides[charLower] || String.fromCodePoint(lowerStart + i);
  }
  return map;
}

// 1. Circled: Ⓐ-Ⓩ (0x24B6), ⓐ-ⓩ (0x24D0)
const circledMap = buildRangeMap(0x24B6, 0x24D0);

// 2. Smallcaps
const smallCapsLetters = {
  'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ғ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ',
  'K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ','S':'s','T':'ᴛ',
  'U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ',
  'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ',
  'k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ',
  'u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
};

// 3. Bold Script (Mathematical Bold Script) - 0x1D4D0, 0x1D4EA
const scriptBoldMap = buildRangeMap(0x1D4D0, 0x1D4EA);

// 4. Calligraphy / Script - 0x1D49C, 0x1D4B6 with BMP exceptions
const scriptCalligraphyMap = buildRangeMap(0x1D49C, 0x1D4B6, {
  'B': '\u212C', 'E': '\u2130', 'F': '\u2131', 'H': '\u210B', 'I': '\u2110',
  'L': '\u2112', 'M': '\u2133', 'R': '\u211B', 'e': '\u210E', 'g': '\u210A', 'o': '\u2134'
});

// 5. Squared Negative (0x1F150)
const squaredMap = buildRangeMap(0x1F150, 0x1F150);

// 6. Double Struck (0x1D538, 0x1D552) with BMP exceptions
const doubleStruckMap = buildRangeMap(0x1D538, 0x1D552, {
  'C': '\u2102', 'H': '\u210D', 'N': '\u2115', 'P': '\u2119', 'Q': '\u211A', 'R': '\u211D', 'Z': '\u2124'
});

// 7. Square Outlined (0x1F130)
const squareSerifMap = buildRangeMap(0x1F130, 0x1F130);

// 8. Square Filled (0x1F170)
const squareFilledMap = buildRangeMap(0x1F170, 0x1F170);

// 9. Bold Fraktur (0x1D538 / 0x1D56C)
const frakturBoldMap = buildRangeMap(0x1D56C, 0x1D586);

// 10. Fraktur Thin (0x1D504, 0x1D51E) with BMP exceptions
const frakturThinMap = buildRangeMap(0x1D504, 0x1D51E, {
  'C': '\u212D', 'H': '\u210C', 'I': '\u2111', 'R': '\u211C', 'Z': '\u2128'
});

// 11. Bold (0x1D400, 0x1D41A)
const boldMap = buildRangeMap(0x1D400, 0x1D41A);

// 12. Italic (0x1D434, 0x1D44E) with 'h' exception U+210E
const italicMap = buildRangeMap(0x1D434, 0x1D44E, { 'h': '\u210E' });

// 13. Bold Italic (0x1D468, 0x1D482)
const italicBoldMap = buildRangeMap(0x1D468, 0x1D482);

const fontStyles = {
  normal: {
    name: 'Normal (Standard)',
    sample: 'ABC',
    map: null
  },
  circled: {
    name: 'Circled ⒶⒷⒸ',
    sample: 'ⒶⒷⒸ',
    map: circledMap
  },
  smallcaps: {
    name: 'Small Caps ᴀʙᴄ',
    sample: 'ᴀʙᴄ',
    map: smallCapsLetters
  },
  script: {
    name: 'Bold Script 𝓐𝓑𝓒',
    sample: '𝓐𝓑𝓒',
    map: scriptBoldMap
  },
  scriptCalligraphy: {
    name: 'Calligraphy 𝒜ℬ𝒞',
    sample: '𝒜ℬ𝒞',
    map: scriptCalligraphyMap
  },
  squared: {
    name: 'Squared 🅐🅑🅒',
    sample: '🅐🅑🅒',
    map: squaredMap
  },
  doublestruck: {
    name: 'Double Struck 𝔸𝔹ℂ',
    sample: '𝔸𝔹ℂ',
    map: doubleStruckMap
  },
  squareSerif: {
    name: 'Square Outlined 🄰🄱🄲',
    sample: '🄰🄱🄲',
    map: squareSerifMap
  },
  squareFilled: {
    name: 'Square Filled 🅰🅱🅲',
    sample: '🅰🅱🅲',
    map: squareFilledMap
  },
  fraktur: {
    name: 'Bold Fraktur 𝕬𝕭𝕮',
    sample: '𝕬𝕭𝕮',
    map: frakturBoldMap
  },
  frakturThin: {
    name: 'Fraktur 𝔄𝔅ℭ',
    sample: '𝔄𝔅ℭ',
    map: frakturThinMap
  },
  bold: {
    name: 'Bold 𝐀𝐁𝐂',
    sample: '𝐀𝐁𝐂',
    map: boldMap
  },
  italic: {
    name: 'Italic 𝘈𝘠𝘊',
    sample: '𝘈𝘠𝘊',
    map: italicMap
  },
  italicBold: {
    name: 'Bold Italic 𝘼𝘽𝘾',
    sample: '𝘼𝘽𝘾',
    map: italicBoldMap
  }
};

/**
 * Converts input text into selected unicode font style.
 */
function convertText(text, styleKey) {
  if (!text) return '';
  const style = fontStyles[styleKey];
  if (!style || !style.map) {
    return text; // normal fallback
  }

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (style.map[ch]) {
      result += style.map[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

window.fontStyles = fontStyles;
window.convertText = convertText;
