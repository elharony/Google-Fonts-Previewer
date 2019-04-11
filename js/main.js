const content = document.querySelector('#content');
const fontListElement = document.querySelector('#fonts');
const copyBtn = document.querySelector('#btn');
const controls_selectedFont = document.querySelector('.selected-font');
const size_controller = document.querySelector('#size_controller');
const placeholder_currentSize = document.querySelector('#current-size');
let fontListFragment = document.createDocumentFragment();




/* -------------------------------------
| Retreive fonts from Google Fonts API | 
------------------------------------- */
fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyCVmxrGZ9C6A_dADKlJIc1I88fJoHsYjnQ')
  .then((r) => r.json())
  .then((fontsObject) => {
    // create visual list for fonts
    for (font of fontsObject.items) {
      let fontFamily = font.family;
      let li = document.createElement('li');
      li.classList.add('font');
      li.setAttribute('data-value', fontFamily);
      li.setAttribute('tabindex', 0);
      li.innerText = fontFamily;
      li.style.fontFamily = fontFamily;

      fontListFragment.appendChild(li);
    }

    fontListElement.appendChild(fontListFragment);

    /* -------------------------------
    | load css resources dynamically | 
    ------------------------------- */
    // 1. create string which imports all css files
    // for all font families chunked by 12

    // chunk fonts
    let chunkedFonts = chunk(fontsObject.items, 12);

    // construct @import statements as string
    let importStatements = chunkedFonts
      .map((chunkedFontsArr) => {
        return `@import "https://fonts.googleapis.com/css?family=${chunkedFontsArr
          .map((f) => f.family)
          .join('|')}"`;
      })
      .join(';');

    // 2. create html style element and fill it with @import statements
    let fontsStyle = document.createElement('style');
    fontsStyle.type = 'text/css';
    fontsStyle.innerHTML = importStatements;
    document.getElementsByTagName('head')[0].appendChild(fontsStyle);
  });

// bind events
fontListElement.addEventListener('click', (e) => {
  if (isFontListItem(e.srcElement)) {
    let li = e.srcElement;
    let fontFamily = li.dataset.value;
    content.style.fontFamily = fontFamily;
    selectedFont(fontFamily);
    copyButton(fontFamily);
    e.stopPropagation();
  }
});

// tab navigation
fontListElement.addEventListener('keyup', (e) => {
  if (e.keyCode == 9 && isFontListItem(e.target)) document.activeElement.click();
});

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
  copyBtn.addEventListener('click',function() {
   
  let selectedFont = checkSpace(fontName);
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = `<link href="https://fonts.googleapis.com/css?family=${selectedFont}" rel="stylesheet">`
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el); 
  })
}

// Current Size
size_controller.addEventListener('input', () => {
  content.style.fontSize = size_controller.value + 'px';
  placeholder_currentSize.innerText = size_controller.value + 'px';
});

// Init
function init() {
  controls_selectedFont.innerText = 'Please select a font...';
}
init();



