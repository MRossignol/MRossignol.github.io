
( function() {

  let hta = getHTA();
  
  let backgrounds = {
    ld: null,
    hd: null,
    album: null
  };

  let translationElems = {
    ld: {
      x: null,
      y: null
    },
    hd: {
      x: null,
      y: null
    },
  };
  
  let currentTranslation = {
    ld: {x: 0, y: 0},
    hd: {x: 0, y: 0}
  };

  let currentTranslationEndTime = {
    ld: {x: 0, y: 0},
    hd: {x: 0, y: 0}
  };

  
  const maxTranslate = 30;

  const bgNaturalWidth = 3480;
  const bgNaturalHeight = 2320;

  const albumBgNaturalWidth = 3480;
  const albumBgNaturalHeight = 1760;

  const acceptableScaleUp = 1.2;
  const knownWidths = [435, 696, 870, 1392, 1740, 2088, 2784, 3480];

  let loadedImageWidth = {ld: 0, hd: 0, album: 0};


  
  let bestMatchWidth = (rw) => {
    let mw = 0;
    for (let i=0, l=knownWidths.length; i<l && !mw; i++) {
      if (acceptableScaleUp*knownWidths[i] >= rw)
	mw = knownWidths[i];
    }
    return mw || knownWidths[knownWidths.length-1];
  };

  let loadingImages = 0;
  let loadingAlbumBg = false;
  
  let loadImages = (requiredWidth, album) => {
    if (window.devicePixelRatio) {
      requiredWidth *= Math.max(1, Math.min(2, window.devicePixelRatio));
    }
    if (album) {
      if (loadingAlbumBg) {
	if (requiredWidth > loadedImageWidth.album) setTimeout(()=>loadImages(requiredWidth, true), 500);
	return;
      }
      let matchingWidth = bestMatchWidth(requiredWidth);
      if (matchingWidth <= loadedImageWidth.album) return;
      loadingAlbumBg = true;
      let src = 'img/album-background/background-'+matchingWidth+'.jpg';
      let img = new Image();
      img.onload = () => {
	backgrounds.album.style['background-image'] = 'url(img/album-background/background-'+matchingWidth+'.jpg)';
	loadingAlbumBg = false;
      };
      img.src = src;
    } else {
      if (loadingImages) {
	if (requiredWidth > loadedImageWidth.hd) setTimeout(()=>loadImages(requiredWidth, false), 500);
	return;
      }
      let loadImage = (res, rw) => {
	let matchingWidth = bestMatchWidth(rw);
	if (matchingWidth <= loadedImageWidth[res]) return;
	loadingImages++;
	let src = 'img/background-'+res+'/background-'+matchingWidth+'.jpg';
	let img = new Image();
	img.onload = () => {
	  backgrounds[res].src = src;
	  backgrounds[res].style.opacity = (res == 'ld') ? .8 : .5;
	  loadedImageWidth[res] = matchingWidth;
	  loadingImages--;
	};
	img.src = src;
      };
      loadImage('ld', requiredWidth/2);
      loadImage('hd', requiredWidth);
    }
  };
  
  let adjustBackgroundSize = (w, h, section) => {

    if (!section) section = hta.navigation.currentSection() && hta.navigation.currentSection().name || '';
    
    if (section == 'poetry-of-streetlights') {

      let width = h * albumBgNaturalWidth / albumBgNaturalHeight;
      loadImages(Math.round(Math.max(width, w)), true);
      
    } else {
      
      let minW = w + 2*maxTranslate;
      let minH = h + 2*maxTranslate;

      let targetHeight = 1.5*h;
      let targetWidth = targetHeight * bgNaturalWidth / bgNaturalHeight;
      
      if (targetWidth < minW) {
	targetWidth = minW;
	targetHeight = targetWidth * bgNaturalHeight / bgNaturalWidth;
      }
      let bgW = Math.round(targetWidth);
      let bgH = Math.round(targetHeight);

      loadImages(bgW, false);

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

    }
    
  };

  let moveBackground = (res, axis, force) => () => {
    if (!force && currentTranslationEndTime[res][axis] - Date.now() > 100) return;
    let elem = translationElems[res][axis];
    let sign = currentTranslation[res][axis] > 0 ? -1 : 1;
    let size = Math.min(window.innerWidth, window.innerHeight);
    if (size>500) size=500;
    let trans = Math.round(sign * maxTranslate *(4 + 6*Math.random()))/10;
    currentTranslation[res][axis] = trans;
    let duration = Math.round(100 + 200*Math.random())/10;
    currentTranslationEndTime[res][axis] = Date.now() + 1000*duration;
    elem.style.transition = 'transform ease-in-out '+duration+'s';
    elem.style.transform = 'translate'+axis.toUpperCase()+'('+trans+'px)';
  };

  let created = false;
  
  let createBgElems = () => {
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
    backgrounds.album = makeDiv('albumBackground');
    document.body.appendChild(backgrounds.album);
    created = true;
  };

  hta.navigation.onSectionChange ((section, oldSection) => {
    if (!created) {
      createBgElems();
      hta.layout.onResize(adjustBackgroundSize);
    }
    adjustBackgroundSize(window.innerWidth, window.innerHeight, section);
    if (section=='poetry-of-streetlights') {
      let ote = () => {
	backgrounds.album.removeEventListener('transitionend', ote);
      translationElems.ld.x.style.display = 'none';
      translationElems.hd.x.style.display = 'none';
      translationElems.ld.y.style.display = 'none';
      translationElems.hd.y.style.display = 'none';
      };
      backgrounds.album.style.display = 'block';
      setTimeout(() => {
	backgrounds.album.addEventListener('transitionend', ote);
	backgrounds.album.style.opacity = 1;
      });
    } else {
      translationElems.ld.x.style.display = 'block';
      translationElems.hd.x.style.display = 'block';
      translationElems.ld.y.style.display = 'block';
      translationElems.hd.y.style.display = 'block';
      if (oldSection == 'poetry-of-streetlights') {
	let ote = () => {
	  backgrounds.album.removeEventListener('transitionend', ote);
	  backgrounds.album.style.display = 'none';
	};
	backgrounds.album.addEventListener('transitionend', ote);
	backgrounds.album.style.opacity = 0;
      }
      if (!oldSection || oldSection == 'poetry-of-streetlights') {
	console.log('start anim');
	['ld', 'hd'].forEach ( (res) => {
	  ['x', 'y'].forEach ( (axis) => {
	    setTimeout(moveBackground(res, axis, true), 1000);
	  });
	});
      }
    }
  });

}) ();
