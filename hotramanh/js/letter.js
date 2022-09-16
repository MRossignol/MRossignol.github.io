(function() {

  let hta = getHTA();

  let letterImg = new Image();

  let zoom = false;
  
  let imgPromise = new Promise((resolve, reject) => {
    letterImg.onload = resolve;
  });

  function showLetter() {
    document.getElementById('letterWait').style.display = 'none';
    document.getElementById('letter').style.display = 'block';
    setTimeout(() => {
      document.getElementById('letter').style.opacity = 1;
    });
  }

  function toggleZoom() {
    let letter = document.getElementById('letter');
    if (zoom) {
      let h = getComputedStyle(letter).height;
      letter.style.height = h;
      letter.style.width = 'auto';
      setTimeout(() => {
	letter.style.height = '100%';
	document.body.classList.remove('wideContent');
      });
    } else {
      let w = getComputedStyle(letter).width;
      letter.style.width = w;
      letter.style.height = 'auto';
      setTimeout(() => {
	letter.style.width = '100%';
	document.body.classList.add('wideContent');
      });
    }
    zoom = !zoom;
  }
  
  hta.navigation.registerSection({

    name: 'main',
    
    init: () => {},

    preload: () => {
      letterImg.src = 'img/letter-black-sm-white.png';
    },

    getContent: () => new Promise((resolve, reject) => {
      letterImg.src = 'img/letter-black-sm-white.png';
      resolve('<p id="letterWait">One moment, please...</p><img id="letter" src="img/letter-black-sm-white.png"/>');
    }),

    layout: () => {
      document.getElementById('letter').addEventListener('click', toggleZoom);
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
