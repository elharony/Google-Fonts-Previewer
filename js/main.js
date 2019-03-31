const content = document.querySelector('#content');
const fontListElement = document.querySelector('#fonts');

const controls_selectedFont = document.querySelector('.selected-font');
const size_controller = document.querySelector('#size_controller');
const placeholder_currentSize = document.querySelector('#current-size');
let fontListFragment = document.createDocumentFragment();


// load all google fonts dynamically
// for now, it is static file, in the future
// we should make a call to google fonts api
// to retrieve recent updated list of fonts
// to avoid changing our codebase each time
// google adds or removes a font

// the call will be something like: 
// https://content.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyAa8yy0GdcGPHdtD083HiGGx_S0vMPScDM

// or develop a simple endpoints that hides our API key, fetch all css, (maybe combine all of them into one file)

//  read more https://developers.google.com/fonts/docs/developer_api
fetch('./js/fonts.json')
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

    e.stopPropagation();
  }
});

// tab navigation
fontListElement.addEventListener('keyup', (e) => {
  if (e.keyCode == 9) document.activeElement.click();
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

// Update Selected Font
function selectedFont(fontName) {
  controls_selectedFont.innerText = fontName;
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
