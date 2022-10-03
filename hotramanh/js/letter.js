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
	document.getElementsByClassName('content')[0].style.height = 'auto';
    } else {
      document.body.classList.add('wideContent');
      if (hta.layout.orientation() == 'desktop') {
	setTimeout(() => {
	  let contentHeight = Math.round(letterImg.getBoundingClientRect().height+40);
	  document.getElementsByClassName('content')[0].style.height = contentHeight+'px';
	}, 300);
      }
    }
    zoom = !zoom;
  }

  function makeContent(root) {
    contentDiv = root;
    let buttonHolder = makeDiv('buttonHolder');
    let zoomButton = makeDiv('zoomButton');
    zoomButton.addEventListener('click', toggleZoom);
    let toggleButton = makeDiv('toggleButton');
    toggleButton.addEventListener('click', toggleType);
    buttonHolder.appendChild(zoomButton);
    buttonHolder.appendChild(toggleButton);
    root.appendChild(buttonHolder);
    let letterWait = makeDiv('letterWait');
    letterWait.id = 'letterWait';
    letterWait.innerHTML = 'One moment, please…';
    root.appendChild(letterWait);
    letterImg.id = 'letter';
    letterImg.src = 'img/letter-black-sm-white.png';
    root.appendChild(letterImg);
    let letterText = makeDiv('letterText');
    letterText.id = 'letterText';
    hta.contentData.letter.paragraphs.forEach((pContent) => {
      let p = document.createElement('p');
      p.innerHTML = pContent;
      letterText.appendChild(p);
    });
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
