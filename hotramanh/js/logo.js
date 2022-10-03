( function() {

  let hta = getHTA();
  
  function resizeLogo() {
    let logo = document.getElementById('logo');
    if (!logo) {
      setTimeout(resizeLogo, 100);
      return;
    }
    let w = window.innerWidth;
    let h = window.innerHeight;
    let targetW = Math.min(w, 200);
    if (w > 200) {
      let wr = w-200;
      if (wr < 700) {
	targetW += wr * 250/700;
      } else {
	wr = w-900;
	targetW = 450 + wr*250/1300;
      }
    }
    // let maxWidth = w/2;
    let maxHeight = h/2;
    let aspectRatio = 1811/457;
    let width =  Math.round((targetW / aspectRatio > maxHeight) ? maxHeight*aspectRatio : targetW);
    let height = Math.round(width / aspectRatio);
    let top = Math.round((h-height)/2);
    let left = Math.round((w-width)/2);
    logo.style.width = width+'px';
    logo.style.height = height+'px';
    logo.style.top = top+'px';
    logo.style.left = left+'px';
  }


  let logoImg = new Image();
  
  let imgPromise = new Promise((resolve, reject) => {
    logoImg.onload = resolve;
  });

  hta.navigation.registerSection({

    name: 'intro',
    
    init: () => {
      logoImg.src = 'img/name.png';
    },

    preloadNext: () => {
      if (hta.sections.main && hta.sections.main.preload) hta.sections.main.preload();
    },
    
    getContent: () => new Promise((resolve, reject) => {
      imgPromise.then(() => {
	resolve('<a class="sectionLink fullPageLink" href="main.html"><img id="logo" src="img/name.png"/></a>');
      });
    }),

    layout: () => {
      resizeLogo();
      setTimeout(() => {
	document.getElementById('logo').style.opacity = 1;
      }, 100);
    },

    onResize: resizeLogo,
    
    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
  
}) ();
