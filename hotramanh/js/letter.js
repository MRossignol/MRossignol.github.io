(function() {

  let hta = getHTA();

  let letterImg = new Image();

  let mode = 'image';
  
  let zoom = false;

  let contentDiv = null;
  
  let imgPromise = new Promise((resolve, reject) => {
    letterImg.onload = resolve;
  });

  function showLetter() {
    document.getElementById('letterWait').style.display = 'none';
    letterImg.style.opacity = 1;
  }

  function toggleType() {
    if (mode == 'image') {
      let showText = () => {
	mode='text';
	contentDiv.classList.add('text');
	requestAnimationFrame(() => {
	  let textDiv = document.getElementById('letterText');
	  contentDiv.style.height = (textDiv.getBoundingClientRect().height+80)+'px';
	});
      };
      if (zoom) {
	toggleZoom();
	setTimeout(showText);
      } else {
	showText();
      }
    } else {
      mode = 'image';
      contentDiv.classList.remove('text');
    }
  }
  
  function toggleZoom() {
    if (mode != 'image') return;
    if (zoom) {
      document.body.classList.remove('wideContent');
      if (hta.layout.orientation() == 'desktop')
	document.querySelector('div.content').style.height = 'auto';
    } else {
      document.body.classList.add('wideContent');
      if (hta.layout.orientation() == 'desktop') {
	setTimeout(() => {
	  let contentHeight = Math.round(letterImg.getBoundingClientRect().height+40);
	  document.querySelector('div.content').style.height = contentHeight+'px';
	}, 300);
      }
    }
    zoom = !zoom;
  }

  function makeContent(root) {
    contentDiv = root;
    let buttonHolder = makeDiv('buttonHolder');
    let zoomButton = makeDiv('zoomButton');
    zoomButton.title = 'Toggle zoom on letter image';
    zoomButton.ariaLabel = 'Toggle zoom on letter image';
    zoomButton.addEventListener('click', toggleZoom);
    let toggleButton = makeDiv('toggleButton');
    toggleButton.title = 'Toggle between image and text versions of the letter';
    toggleButton.ariaLabel = 'Toggle between image and text versions of the letter';
    toggleButton.addEventListener('click', toggleType);
    buttonHolder.appendChild(zoomButton);
    buttonHolder.appendChild(toggleButton);
    root.appendChild(buttonHolder);
    let letterWait = makeDiv('letterWait', 'One moment, please…');
    letterWait.id = 'letterWait';
    root.appendChild(letterWait);
    letterImg.id = 'letter';
    letterImg.src = 'img/letter-black-sm-white.png';
    letterImg.alt = 'Letter from Ho Tram Anh';
    root.appendChild(letterImg);
    let letterText = makeDiv('letterText', hta.contentData.letter.paragraphs.map(pContent => makeElem('p', null, pContent)));
    letterText.id = 'letterText';
    root.appendChild(letterText);
  }

  hta.navigation.registerSection({

    name: 'main',
    
    init: () => {},

    preload: () => {
      letterImg.src = 'img/letter-black-sm-white.png';
    },

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve();
    }),

    layout: () => {
      if (letterImg.complete) {
	showLetter();
      } else {
	imgPromise.then(() => {
	  showLetter();
	});
      }
    },

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {
      if (zoom) toggleZoom();
    },

    cleanup: () => {}
    
  });
    
}) ();
