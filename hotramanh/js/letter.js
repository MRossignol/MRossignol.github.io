(function() {

  let hta = getHTA();

  let letterImg = new Image();
  
  let imgPromise = new Promise((resolve, reject) => {
    letterImg.onload = resolve;
  });

  hta.navigation.registerSection({

    name: 'main',
    
    init: () => {},

    preload: () => {
      letterImg.src = 'img/letter-black-sm-white.png';
    },

    getContent: () => new Promise((resolve, reject) => {
      resolve('<p id="letterWait">One moment, please...</p><img id="letter" src="img/letter-black-sm-white.png"/>');
    }),

    layout: () => {
      imgPromise.then(() => {
	document.getElementById('letterWait').style.display = 'none';
	document.getElementById('letter').style.opacity = 1;
      });
    },

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
