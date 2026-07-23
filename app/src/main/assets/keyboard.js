/**
 * keyboard.js - Main Keyboard Logic & Android Bridge Integration
 */

(function () {
  // State variables
  let currentFontIndex = 0;
  const fontKeys = Object.keys(window.fontStyles || {});
  let isShifted = false;
  let isCapsLock = false;
  let isSymbolMode = false;
  let backspaceInterval = null;
  let fontPressTimer = null;

  // DOM elements
  const keyboardBody = document.getElementById('keyboard-body');
  const fontSwitcherBtn = document.getElementById('font-switcher-btn');
  const fontSwitcherLabel = document.getElementById('font-switcher-label');
  const activeFontBadge = document.getElementById('active-font-badge');
  const fontGridModal = document.getElementById('font-grid-modal');
  const fontGrid = document.getElementById('font-grid');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const keyPreview = document.getElementById('key-preview');
  const globeBtn = document.getElementById('globe-btn');
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const settingsBtn = document.getElementById('settings-btn');

  // Layout definitions
  const numRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const qwertyRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const qwertyRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const qwertyRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const symbolsRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const symbolsRow2 = ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/'];
  const symbolsRow3 = ['*', '"', "'", ':', ';', '!', '?', ',', '.'];

  // Native Android Bridge helper
  function typeTextToAndroid(text) {
    if (window.AndroidBridge && typeof window.AndroidBridge.typeText === 'function') {
      window.AndroidBridge.typeText(text);
    } else {
      console.log('[NativeBridge mock] typeText:', text);
    }
  }

  function deleteCharFromAndroid(count) {
    if (window.AndroidBridge && typeof window.AndroidBridge.deleteChar === 'function') {
      window.AndroidBridge.deleteChar(count);
    } else {
      console.log('[NativeBridge mock] deleteChar:', count);
    }
  }

  function switchToNextKeyboard() {
    if (window.AndroidBridge && typeof window.AndroidBridge.switchToNextKeyboard === 'function') {
      window.AndroidBridge.switchToNextKeyboard();
    } else {
      console.log('[NativeBridge mock] switchToNextKeyboard called');
    }
  }

  function openSettingsActivity() {
    if (window.AndroidBridge && typeof window.AndroidBridge.openSettings === 'function') {
      window.AndroidBridge.openSettings();
    } else {
      console.log('[NativeBridge mock] openSettings called');
    }
  }

  // Active font helper
  function getActiveFontKey() {
    return fontKeys[currentFontIndex] || 'normal';
  }

  function updateFontSwitcherDisplay() {
    const fontKey = getActiveFontKey();
    const styleObj = window.fontStyles[fontKey];

    // Convert "ABC" into active font style (e.g., "𝕬𝕭𝕮")
    const sampleLabel = window.convertText('ABC', fontKey);
    fontSwitcherLabel.textContent = sampleLabel;
    activeFontBadge.textContent = styleObj ? styleObj.name : 'Normal';

    // Re-render layout if needed to update letter displays
    renderKeyboard();
  }

  // Key popup bubble preview
  function showKeyPreview(element, text) {
    if (!element || !text || text.length > 2) return;
    const rect = element.getBoundingClientRect();
    keyPreview.textContent = text;
    keyPreview.style.left = (rect.left + rect.width / 2) + 'px';
    keyPreview.style.top = rect.top + 'px';
    keyPreview.style.display = 'flex';
  }

  function hideKeyPreview() {
    keyPreview.style.display = 'none';
  }

  // Render Keyboard UI
  function renderKeyboard() {
    keyboardBody.innerHTML = '';

    if (!isSymbolMode) {
      // 1. Number row
      renderRow(numRow, 'num-row');

      // 2. QWERTY Row 1
      renderRow(qwertyRow1, '');

      // 3. QWERTY Row 2
      renderRow(qwertyRow2, '');

      // 4. QWERTY Row 3 (with Shift & Backspace)
      const row3Container = document.createElement('div');
      row3Container.className = 'keyboard-row';

      // Shift key
      const shiftKey = document.createElement('div');
      shiftKey.className = 'key key-special key-shift' + (isCapsLock ? ' capslock' : (isShifted ? ' active' : ''));
      shiftKey.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 4L4 12h5v8h6v-8h5L12 4z"/></svg>`;
      
      let lastShiftClick = 0;
      shiftKey.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastShiftClick < 300) {
          isCapsLock = !isCapsLock;
          isShifted = isCapsLock;
        } else {
          if (isCapsLock) {
            isCapsLock = false;
            isShifted = false;
          } else {
            isShifted = !isShifted;
          }
        }
        lastShiftClick = now;
        renderKeyboard();
      });
      row3Container.appendChild(shiftKey);

      // Letters row 3
      qwertyRow3.forEach(char => {
        const keyEl = createKeyElement(char);
        row3Container.appendChild(keyEl);
      });

      // Backspace key
      const backspaceKey = createBackspaceKey();
      row3Container.appendChild(backspaceKey);

      keyboardBody.appendChild(row3Container);

      // 5. Bottom Row (Space, Enter, Globe, Symbol toggle)
      const bottomRow = document.createElement('div');
      bottomRow.className = 'keyboard-row';

      const modeKey = document.createElement('div');
      modeKey.className = 'key key-special';
      modeKey.textContent = '?123';
      modeKey.addEventListener('click', () => {
        isSymbolMode = true;
        renderKeyboard();
      });
      bottomRow.appendChild(modeKey);

      const commaKey = document.createElement('div');
      commaKey.className = 'key';
      commaKey.textContent = ',';
      commaKey.addEventListener('click', () => typeTextToAndroid(','));
      bottomRow.appendChild(commaKey);

      // Spacebar
      const spaceKey = document.createElement('div');
      spaceKey.className = 'key key-special key-space';
      spaceKey.textContent = 'Space';
      spaceKey.addEventListener('click', () => typeTextToAndroid(' '));
      bottomRow.appendChild(spaceKey);

      const periodKey = document.createElement('div');
      periodKey.className = 'key';
      periodKey.textContent = '.';
      periodKey.addEventListener('click', () => typeTextToAndroid('.'));
      bottomRow.appendChild(periodKey);

      // Enter Key
      const enterKey = document.createElement('div');
      enterKey.className = 'key key-special key-enter';
      enterKey.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/></svg>`;
      enterKey.addEventListener('click', () => typeTextToAndroid('\n'));
      bottomRow.appendChild(enterKey);

      keyboardBody.appendChild(bottomRow);

    } else {
      // Symbol Mode
      renderRow(symbolsRow1, 'num-row');
      renderRow(symbolsRow2, '');
      
      const symRow3 = document.createElement('div');
      symRow3.className = 'keyboard-row';
      symbolsRow3.forEach(char => {
        const keyEl = document.createElement('div');
        keyEl.className = 'key';
        keyEl.textContent = char;
        keyEl.addEventListener('click', () => typeTextToAndroid(char));
        symRow3.appendChild(keyEl);
      });
      symRow3.appendChild(createBackspaceKey());
      keyboardBody.appendChild(symRow3);

      // Bottom Row for Symbols
      const bottomRow = document.createElement('div');
      bottomRow.className = 'keyboard-row';

      const abcModeKey = document.createElement('div');
      abcModeKey.className = 'key key-special';
      abcModeKey.textContent = 'ABC';
      abcModeKey.addEventListener('click', () => {
        isSymbolMode = false;
        renderKeyboard();
      });
      bottomRow.appendChild(abcModeKey);

      const spaceKey = document.createElement('div');
      spaceKey.className = 'key key-special key-space';
      spaceKey.textContent = 'Space';
      spaceKey.addEventListener('click', () => typeTextToAndroid(' '));
      bottomRow.appendChild(spaceKey);

      const enterKey = document.createElement('div');
      enterKey.className = 'key key-special key-enter';
      enterKey.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/></svg>`;
      enterKey.addEventListener('click', () => typeTextToAndroid('\n'));
      bottomRow.appendChild(enterKey);

      keyboardBody.appendChild(bottomRow);
    }
  }

  function renderRow(keysArray, rowClass) {
    const row = document.createElement('div');
    row.className = 'keyboard-row ' + (rowClass || '');
    keysArray.forEach(char => {
      row.appendChild(createKeyElement(char));
    });
    keyboardBody.appendChild(row);
  }

  function createKeyElement(char) {
    const key = document.createElement('div');
    key.className = 'key';

    // Apply casing
    let displayChar = char;
    if (/[a-z]/i.test(char)) {
      displayChar = (isShifted || isCapsLock) ? char.toUpperCase() : char.toLowerCase();
    }

    // Convert display character based on active font mapping
    const fontKey = getActiveFontKey();
    const unicodeChar = window.convertText(displayChar, fontKey);

    key.textContent = unicodeChar;

    // Events for tap & popup preview
    const handleStart = (e) => {
      e.preventDefault();
      key.classList.add('pressed');
      showKeyPreview(key, unicodeChar);
    };

    const handleEnd = (e) => {
      e.preventDefault();
      key.classList.remove('pressed');
      hideKeyPreview();

      // Commit converted unicode character to Android InputConnection!
      typeTextToAndroid(unicodeChar);

      // Reset shift if not caps lock
      if (isShifted && !isCapsLock) {
        isShifted = false;
        renderKeyboard();
      }
    };

    key.addEventListener('touchstart', handleStart);
    key.addEventListener('touchend', handleEnd);
    key.addEventListener('mousedown', handleStart);
    key.addEventListener('mouseup', handleEnd);

    return key;
  }

  function createBackspaceKey() {
    const key = document.createElement('div');
    key.className = 'key key-special key-backspace';
    key.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>`;

    const startDelete = (e) => {
      e.preventDefault();
      key.classList.add('pressed');
      deleteCharFromAndroid(1);

      clearInterval(backspaceInterval);
      backspaceInterval = setInterval(() => {
        deleteCharFromAndroid(1);
      }, 100);
    };

    const stopDelete = (e) => {
      e.preventDefault();
      key.classList.remove('pressed');
      clearInterval(backspaceInterval);
    };

    key.addEventListener('touchstart', startDelete);
    key.addEventListener('touchend', stopDelete);
    key.addEventListener('mousedown', startDelete);
    key.addEventListener('mouseup', stopDelete);

    return key;
  }

  // Populate Font Selection Grid Modal
  function populateFontGrid() {
    fontGrid.innerHTML = '';
    fontKeys.forEach((key, index) => {
      const styleObj = window.fontStyles[key];
      const card = document.createElement('div');
      card.className = 'font-card' + (index === currentFontIndex ? ' active' : '');
      
      const sample = window.convertText('ABC abc', key);
      
      card.innerHTML = `
        <div class="font-card-name">${styleObj ? styleObj.name : key}</div>
        <div class="font-card-sample">${sample}</div>
      `;

      card.addEventListener('click', () => {
        currentFontIndex = index;
        updateFontSwitcherDisplay();
        fontGridModal.classList.remove('open');
      });

      fontGrid.appendChild(card);
    });
  }

  // Setup Font Switcher button interactions
  function initFontSwitcherEvents() {
    // Tap -> Cycle to next font
    // Tap-and-hold -> Open modal grid
    let isLongPress = false;

    const startPress = (e) => {
      isLongPress = false;
      fontPressTimer = setTimeout(() => {
        isLongPress = true;
        populateFontGrid();
        fontGridModal.classList.add('open');
      }, 450);
    };

    const endPress = (e) => {
      clearTimeout(fontPressTimer);
      if (!isLongPress && !fontGridModal.classList.contains('open')) {
        // Cycle to next font
        currentFontIndex = (currentFontIndex + 1) % fontKeys.length;
        updateFontSwitcherDisplay();
      }
    };

    fontSwitcherBtn.addEventListener('touchstart', startPress);
    fontSwitcherBtn.addEventListener('touchend', endPress);
    fontSwitcherBtn.addEventListener('mousedown', startPress);
    fontSwitcherBtn.addEventListener('mouseup', endPress);

    modalCloseBtn.addEventListener('click', () => {
      fontGridModal.classList.remove('open');
    });
  }

  // Globe button
  globeBtn.addEventListener('click', () => {
    switchToNextKeyboard();
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    openSettingsActivity();
  });

  // Mode toggle button in toolbar
  modeToggleBtn.addEventListener('click', () => {
    isSymbolMode = !isSymbolMode;
    renderKeyboard();
  });

  // Global function called from Kotlin InputMethodService via evaluateJavascript()
  window.applySettings = function (opacityPct, glassEnabled, accentHex, gradientStart, gradientEnd) {
    const root = document.documentElement;
    const body = document.body;

    // Background opacity
    const opacityVal = (opacityPct !== undefined ? opacityPct : 85) / 100;
    root.style.setProperty('--bg-opacity', opacityVal);

    // Glassmorphism toggle
    if (glassEnabled === false || glassEnabled === 'false') {
      body.classList.add('glass-off');
    } else {
      body.classList.remove('glass-off');
    }

    // Accent color and gradients
    if (accentHex) {
      root.style.setProperty('--accent-color', accentHex);
    }
    if (gradientStart && gradientEnd) {
      root.style.setProperty('--accent-gradient-start', gradientStart);
      root.style.setProperty('--accent-gradient-end', gradientEnd);
    }
  };

  // Initialize
  function init() {
    initFontSwitcherEvents();
    updateFontSwitcherDisplay();
    renderKeyboard();
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
  }
})();
