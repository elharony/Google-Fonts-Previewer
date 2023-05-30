const content = document.querySelector('#content');
const fontListElement = document.querySelector('#fonts');
const copyBtn = document.querySelector('#copy-font');
const controls_selectedFont = document.querySelector('.selected-font');
const size_controller = document.querySelector('#size_controller');
const placeholder_currentSize = document.querySelector('#current-size');
let fontListFragment = document.createDocumentFragment();

let fonts = [];

function onInit() {
  hasSavedFonts(buildView);
}


function buildView() {
  const fontContainer = document.getElementById('fonts');
  const fontList = document.createElement('ul');
  fontList.classList.add('font-list');

  const observerOptions = {
    root: fontContainer,
    rootMargin: '0px',
    threshold: 0
  };
  let i = 0;

  const fontObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fontElement = entry.target;
        const fontName = fontElement.getAttribute('data-font');
        const font = fonts.find((f) => f.family === fontName);

        console.log(fontName)

        if (font) {
          console.log('Load.')
          loadFont(font);
          fontElement.classList.add('font-loaded');
          fontObserver.unobserve(fontElement);
        }
      }
    });
  }, observerOptions);

  function loadFont(font) {
    const styleElement = document.createElement('style');
    const fontFaces = generateFontFaces(font);

    styleElement.appendChild(document.createTextNode(fontFaces));
    document.head.appendChild(styleElement);
  }

  function generateFontFaces(font) {
    const fontFaces = [];
    const { family, variants } = font;

    variants.forEach((variant) => {
      const fontFace = `@font-face {
        font-family: '${family}';
        src: ${generateFontSources(font, variant)};
        font-display: swap;
      }`;

      fontFaces.push(fontFace);
    });

    return fontFaces.join('\n');
  }

  function generateFontSources(font, variant = 'regular') {
    const sources = [];
    const { files } = font;

    if (files && files[variant]) {
      sources.push(`url('${files[variant]}') format('truetype')`);
    }

    return sources.join(', ');
  }

  function createFontElement(font) {
    const fontElement = document.createElement('li');
    fontElement.classList.add('font-item');
    fontElement.style.fontFamily = font.family;
    fontElement.setAttribute('data-font', font.family);
    fontElement.textContent = font.family;

    return fontElement;
  }

  function observeVisibleFonts() {
    const fontElements = Array.from(fontList.querySelectorAll('.font-item'));

    fontElements.forEach((fontElement) => {
      fontObserver.observe(fontElement);
    });
  }

  fonts.forEach((font) => {
    const fontElement = createFontElement(font);
    fontList.appendChild(fontElement);
  });

  fontContainer.appendChild(fontList);

  observeVisibleFonts();
}


onInit();

/**
 * Checks if there are existing saved fonts in localStorage.
 * If fonts are found, they are retrieved and assigned to the 'fonts' variable.
 * If no fonts are found, it calls the 'getFonts' function to fetch the fonts.
 * 
 * @returns {void}
 */
function hasSavedFonts(callback) {
  // There's a saved fonts in the localStorage
  if (localStorage.getItem('fonts')) {
    // Update `fonts` global variable from localStorage's saved fonts
    fonts = JSON.parse(localStorage.getItem('fonts'));
    // Invoke the callback - buildView
    callback();
  } else {
    // No fonts saved in localStorage. Get fonts.
    getFonts(callback);
  }
}

/**
 * Get fonts from Google API
 * 
 * @returns {void}
 */
function getFonts(callback) {
  fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&capability=WOFF2&key=AIzaSyCVmxrGZ9C6A_dADKlJIc1I88fJoHsYjnQ')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((fontsList) => {
      // Save fonts to localStorage 
      saveFonts(fontsList.items);
      // Update `fonts` global variable from response
      fonts = fontsList.items;
      // Invoke the callback - buildView
      callback();
    })
    .catch((error) => {
      console.error('Error fetching web fonts:', error);
    });
}

/**
 * Save fonts to localStorage
 * 
 * @param {Array.<Object>} fontsList - Array of objects representing Google Fonts
 * @returns {void}
 */
function saveFonts(fontsList) {
  localStorage.setItem('fonts', JSON.stringify(fontsList));
}


/* -------------------------------------
| Retreive fonts from Google Fonts API | 
------------------------------------- */
// fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyCVmxrGZ9C6A_dADKlJIc1I88fJoHsYjnQ')
//   .then((r) => r.json())
//   .then((fontsObject) => {
//     console.log(fontsObject.items[0]);
// create visual list for fonts
// for (font of fontsObject.items) {
//   let fontFamily = font.family;
//   let li = document.createElement('li');
//   li.classList.add('font');
//   li.setAttribute('data-value', fontFamily);
//   li.setAttribute('tabindex', 0);
//   li.innerText = fontFamily;
//   li.style.fontFamily = fontFamily;

//   fontListFragment.appendChild(li);
// }

// fontListElement.appendChild(fontListFragment);

/* -------------------------------
| load css resources dynamically | 
------------------------------- */
// 1. create string which imports all css files
// for all font families chunked by 12

// chunk fonts
// let chunkedFonts = chunk(fontsObject.items, 12);

// construct @import statements as string
// let importStatements = chunkedFonts
//   .map((chunkedFontsArr) => {
//     return `@import "https://fonts.googleapis.com/css?family=${chunkedFontsArr
//       .map((f) => f.family)
//       .join('|')}"`;
//   })
//   .join(';');

// 2. create html style element and fill it with @import statements
// let fontsStyle = document.createElement('style');
// fontsStyle.type = 'text/css';
// fontsStyle.innerHTML = importStatements;
// document.getElementsByTagName('head')[0].appendChild(fontsStyle);
// });

// bind events
// fontListElement.addEventListener('click', (e) => {
//   if (isFontListItem(e.srcElement)) {
//     let li = e.srcElement;
//     let fontFamily = li.dataset.value;
//     content.style.fontFamily = fontFamily;
//     selectedFont(fontFamily);
//     copyButton(fontFamily);
//     e.stopPropagation();
//   }
// });

// tab navigation
// fontListElement.addEventListener('keyup', (e) => {
//   if (e.keyCode == 9 && isFontListItem(e.target)) document.activeElement.click();
// });

// utils
function isFontListItem(clickedElm) {
  return clickedElm.classList.contains('font');
}

function chunk(ar, size) {
  let buffer = [];
  return ar.reduce((acc, item, i) => {
    let isLast = i === ar.length - 1;

    if (buffer.length === size) {
      let theChunk = [...buffer];
      buffer = [item];
      return [...acc, theChunk];
    } else {
      buffer.push(item);
      if (isLast) {
        return [...acc, buffer];
      } else {
        return acc;
      }
    }
  }, []);
}

// Search through fonts
function searchFonts() {
  var input, filter, font, i, txtValue;
  input = document.querySelector("#font-search");
  filter = input.value.toUpperCase();
  font = document.getElementsByTagName("li");
  for (i = 0; i < font.length; i++) {
    txtValue = font[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      font[i].style.display = "";
    } else {
      font[i].style.display = "none";
    }
  }
}

// Update Selected Font
function selectedFont(fontName) {
  controls_selectedFont.innerText = fontName;
}

// Remove space form string and add "+"
function checkSpace(font) {
  return font.replace(/\s/g, '+');
}

// Copy Font
function copyButton(fontName) {
  copyBtn.addEventListener('click', function () {

    let copiedFont = checkSpace(fontName);
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = `<link href="https://fonts.googleapis.com/css?family=${copiedFont}" rel="stylesheet">`
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);


    // Notify the user of the 'Copied' event
    copyBtn.innerHTML = `Copied`
    setTimeout(function () {
      copyBtn.innerHTML = `<i class="far fa-copy"></i>`
    }, 500)
  })
}

// Current Size
// size_controller.addEventListener('input', () => {
//   content.style.fontSize = size_controller.value + 'px';
//   placeholder_currentSize.innerText = size_controller.value + 'px';
// });

// Init
// function init() {
//   controls_selectedFont.innerText = 'Please select a font...';
// }
// init();



