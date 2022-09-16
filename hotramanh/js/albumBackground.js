
( function() {

  let created = false;
  
  let backgrounds = {
    ld: null,
    hd: null
  };
  
  const bgNaturalWidth = 3480;
  const bgNaturalHeight = 1760;

  const acceptableScaleUp = 1.1;
  const knownWidths = [435, 696, 870, 1392, 1740, 2088, 2784, 3480];

  let loadedImageWidth = {ld: 0, hd: 0};
  let loadingImages = 0;

  let loadImages = (requiredWidth) => {
    if (loadingImages) {
      setTimeout(()=>loadImages(requiredWidth), 1000);
    }
    if (window.devicePixelRatio) {
      requiredWidth *= Math.max(1, Math.min(2, window.devicePixelRatio));
    }
    let loadImage = (res, rw) => {
      let matchingWidth = 0;
      for (let i=0, l=knownWidths.length; i<l && !matchingWidth; i++) {
	if (acceptableScaleUp*knownWidths[i] >= rw)
	  matchingWidth = knownWidths[i];
      }
      if (!matchingWidth) matchingWidth = knownWidths[knownWidths.length-1];
      if (matchingWidth <= loadedImageWidth[res]) return;
      loadingImages++;
      let src = 'img/album-background-'+res+'/background-'+matchingWidth+'.jpg';
      let img = new Image();
      img.onload = () => {
	backgrounds[res].src = src;
	backgrounds[res].style.opacity = 1;
	loadedImageWidth[res] = matchingWidth;
	loadingImages--;
      };
      img.src = src;
    };
    loadImage('ld', requiredWidth/2);
    loadImage('hd', requiredWidth);
  };
  
  let adjustBackgroundSize = () => {
    if (!created) return;
    let w = window.innerWidth;
    let h = window.innerHeight;
    // let ldBackground = document.getElementById('background-ld');
    // let hdBackground = document.getElementById('background-hd');

    let minH = h;

    let targetHeight = h;
    let targetWidth = targetHeight * bgNaturalWidth / bgNaturalHeight;
    
    if (targetWidth < w) {
      targetWidth = w;
      targetHeight = targetWidth * bgNaturalHeight / bgNaturalWidth;
    }
    let bgW = Math.round(targetWidth);
    let bgH = Math.round(targetHeight);

    loadImages(bgW);

    let scale = targetWidth / bgNaturalWidth;
    
    // In the original image coordinate
    let desiredCenterX = 1720;
    let desiredCenterY = 1500;

    let x = Math.round(w/2 - scale*desiredCenterX);
    let y = Math.round(h/2 - scale*desiredCenterY);
    if (y>0) y = 0;
    if (y+bgH < h) y = h-bgH;

    ['ld', 'hd'].forEach ((res) => {
      backgrounds[res].style.width = bgW+'px';
      backgrounds[res].style.height = bgH+'px';
      backgrounds[res].style.top = y+'px';
      backgrounds[res].style.left = x+'px';
    });

  };

  window.addEventListener('resize', adjustBackgroundSize);

  
  window.addEventListener('DOMContentLoaded', () => {
    ['ld', 'hd'].forEach ( (res) => {
      backgrounds[res] = document.createElement('img');
      backgrounds[res].classList.add('background');
      backgrounds[res].id='background-'+res;
      ['x', 'y'].forEach ( (axis) => {
	translationElems[res][axis] = makeDiv('backgroundTranslator');
	translationElems[res][axis].addEventListener('transitionend', moveBackground(res, axis));
	setTimeout(moveBackground(res, axis), 2000);
      });
      translationElems[res].y.appendChild(backgrounds[res]);
      translationElems[res].x.appendChild(translationElems[res].y);
      document.body.appendChild(translationElems[res].x);
    });
    created = true;
    adjustBackgroundSize();
  });
  
}) ();
