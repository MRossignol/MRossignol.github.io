(function() {

  let hta = getHTA();

  let images = ['01.jpg', '02.jpg', '04.jpg', '03.jpg', '06.jpg', '05.jpg', '07.jpg', '08.jpg', '10.jpg', '11.jpg', '13.jpg', '14.jpg', '12.jpg', '09.jpg'];
  let thumbnailHolders = images.map(() => null);
  let thumbnailImages = images.map(() => null);
  let hdLoaded = [];
  
  let holderSize = 300;

  let currentPos = 0;

  let zoomOutImage = () => {
    document.body.removeChild(document.getElementsByClassName('carouselControlOverlay')[0]);
    let img = document.getElementById('thumbnail-'+currentPos);
    let fullImage = document.getElementsByClassName('carouselImage')[0];
    let coords = img.getBoundingClientRect();
    ['width', 'height', 'top', 'left'].forEach((dim) => {
      fullImage.style[dim] = Math.round(coords[dim])+'px';
    });
    let background = document.getElementsByClassName('carouselBackgroundOverlay')[0];
    background.style.opacity = 0;
    background.addEventListener('transitionend', () => {
      document.body.removeChild(fullImage);
      document.body.removeChild(background);
    });
  };

  let largeImageSize = (img) => {
    let targetW = .93*window.innerWidth;
    let targetH = .93*window.innerHeight;
    let ratio = img.naturalWidth/img.naturalHeight;
    if (targetH*ratio > targetW) {
      return {w: Math.round(targetW), h: Math.round(targetW/ratio)};
    } else {
      return {w: Math.round(targetH*ratio), h: Math.round(targetH)};
    }
  };

  let swiping = false;
  
  let imageSwipe = (direction) => {
    if (swiping) return false;
    if (currentPos+direction < 0 || currentPos+direction >= images.length) {
      return false;
    }
    swiping = true;
    let oldFullImage = document.getElementsByClassName('carouselImage')[0];
    let targetPos = currentPos+direction;
    let {w,h} = largeImageSize(document.getElementById('thumbnail-'+targetPos));
    let targetFullImage = new Image();
    targetFullImage.classList.add('carouselImage');
    targetFullImage.src = hdLoaded[targetPos] ? 'gallery/'+images[targetPos] : 'gallery/thumbs/'+images[targetPos];
    targetFullImage.style.width = w+'px';
    targetFullImage.style.height = h+'px';
    targetFullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
    targetFullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    if (direction > 0) {
      targetFullImage.style.transform = 'translateX('+window.innerWidth+'px)';
    } else {
      targetFullImage.style.transform = 'translateX(-'+window.innerWidth+'px)';
    }
    document.body.appendChild(targetFullImage);
    setTimeout(() => {
      if (direction > 0) {
	oldFullImage.style.transform = 'translateX(-'+window.innerWidth+'px)';
      } else {
	oldFullImage.style.transform = 'translateX('+window.innerWidth+'px)';
      }
      targetFullImage.style.transform = 'translateX(0px)';
      setTimeout(() => {
	document.body.removeChild(oldFullImage);
	swiping = false;
      }, 400);
    }, 100);
    currentPos += direction;
    if (!hdLoaded[currentPos]) {
      let largeURL = 'gallery/'+images[currentPos];
      let largeImg = new Image();
      let pos = currentPos;
      largeImg.onload = () => {
	hdLoaded[pos] = true;
	setTimeout(() => {
	  if (pos == currentPos) {
	    targetFullImage.src = largeURL;
	  }
	}, 400);
      };
      largeImg.src = largeURL;
    }
    return true;
  };

  
  let controlDiv = () => {
    let control = makeDiv('carouselControlOverlay');

    let touchStartPoint = null;
    
    var touchStartHandler = (event) => {
      event.preventDefault();
      if (event.targetTouches && event.targetTouches[0]) {
	touchStartPoint = {x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY};
      } else if (event.clientX) {
	touchStartPoint = {x: event.clientX, y: event.clientY};
      }
      control.addEventListener('touchmove', touchMoveHandler, {passive: false});
      control.addEventListener('mousemove', touchMoveHandler);
      control.addEventListener('touchend', touchEndHandler, {passive: false});
      control.addEventListener('mouseup', touchEndHandler);
    };
    
    var touchMoveHandler = (event) => {
      event.preventDefault();
      let delta = null;
      if (event.changedTouches && event.changedTouches[0]) {
	delta = {x: event.changedTouches[0].pageX-touchStartPoint.x, y: event.changedTouches[0].pageY-touchStartPoint.y};
      } else if (event.clientX) {
	delta = {x: event.clientX-touchStartPoint.x, y: event.clientY-touchStartPoint.y};
      }
      if (delta) {
	let removeListeners = () => {
	  control.removeEventListener('touchmove', touchMoveHandler, {passive: false});
	  control.removeEventListener('mousemove', touchMoveHandler);
	  control.removeEventListener('touchend', touchEndHandler, {passive: false});
	  control.removeEventListener('mouseup', touchEndHandler);
	};
	if (Math.abs(delta.x) > 10 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  if (delta.x > 0 && currentPos > 0 || delta.x < 0 && currentPos < images.length-1) {
	    Array.from(document.getElementsByClassName('carouselImage')).forEach((fullImage) => {
	      fullImage.style.transform = 'translateX('+delta.x+'px)';
	    });
	  }
	  if (currentPos > 0 && delta.x > window.innerWidth/6) {
	    removeListeners();
	    imageSwipe(-1);
	  } else if (currentPos < images.length-1 && delta.x < -window.innerWidth/6) {
	    removeListeners();
	    imageSwipe(1);
	  }
	} else if (Math.abs(delta.y) > 100 && 2*Math.abs(delta.x) < Math.abs(delta.y)) {
	  removeListeners();
	  zoomOutImage();
	}
      }
    };
    
    var touchEndHandler = (event) => {
      event.preventDefault();
      control.removeEventListener('touchmove', touchMoveHandler, {passive: false});
      control.removeEventListener('mousemove', touchMoveHandler);
      control.removeEventListener('touchend', touchEndHandler, {passive: false});
      control.removeEventListener('mouseup', touchEndHandler);
      let delta = null;
      if (event.changedTouches && event.changedTouches[0]) {
	delta = {x: event.changedTouches[0].pageX-touchStartPoint.x, y: event.changedTouches[0].pageY-touchStartPoint.y};
      } else if (event.clientX) {
	delta = {x: event.clientX-touchStartPoint.x, y: event.clientY-touchStartPoint.y};
      }
      if (delta) {
	if (delta.x > 50 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  imageSwipe(-1);
	} else if (delta.x < -50 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  imageSwipe(1);
	} else if (Math.abs(delta.x) < 20 && Math.abs(delta.y) < 20) {
	  let fullImage = document.getElementsByClassName('carouselImage')[0];
	  let imgPos = fullImage.getBoundingClientRect();
	  if (event.clientX > imgPos.x+.75*imgPos.width) imageSwipe(1);
	  else if (event.clientX < imgPos.x+.25*imgPos.width) imageSwipe(-1);
	  else zoomOutImage();
	} else if (Math.abs(delta.x) < 20 || 2*Math.abs(delta.x) < Math.abs(delta.y)) {
	  zoomOutImage();
	}
      }
    };

    control.addEventListener('touchstart', touchStartHandler, {passive: false});
    control.addEventListener('mousedown', touchStartHandler);
    return control;
  };
  
  let zoomInImage = (pos) => {
    currentPos = pos;
    let img = document.getElementById('thumbnail-'+pos);
    let background = makeDiv('carouselBackgroundOverlay');
    document.body.appendChild(background);
    let fullImage = new Image();
    fullImage.classList.add('carouselImage');
    fullImage.alt = 'Photo #'+(pos+1)+' of Ho Tram Anh';
    fullImage.src = hdLoaded[pos] ? 'gallery/'+images[pos] : 'gallery/thumbs/'+images[pos];
    let coords = img.getBoundingClientRect();
    ['width', 'height', 'top', 'left'].forEach((dim) => {
      fullImage.style[dim] = Math.round(coords[dim])+'px';
    });
    document.body.appendChild(fullImage);
    document.body.appendChild(controlDiv());
    setTimeout(() => {
      background.style.opacity = 1;
      let {w, h} = largeImageSize(img);
      fullImage.style.width = w+'px';
      fullImage.style.height = h+'px';
      fullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
      fullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    });
    if (!hdLoaded[pos]) {
      let largeURL = 'gallery/'+images[pos];
      let largeImg = new Image();
      largeImg.onload = () => {
	hdLoaded[pos] = true;
	setTimeout(() => {
	  if (pos == currentPos) {
	    fullImage.src = largeURL;
	  }
	}, 400);
      };
      largeImg.src = largeURL;
    }
  };

  let ltuo = '';

  let makeContent = (base) => {
    let holderSize = 300;
    ltuo = hta.layout.orientation();
    if (ltuo == 'mobile') {
      holderSize = Math.round(window.innerWidth/2-16);
    }
    let targetArea = 2*holderSize*holderSize/3;
    base.addDiv(null, [
      makeDiv('pageTitle', 'Media'),
      makeDiv('thumbnailsArea', [
	...images.map((img, pos) => makeDiv('galleryThumbnailHolder',
					    makeImage(null,
						      'gallery/thumbs/'+img,
						      'Thumbail for photo #'+(pos+1)+' of Ho Tram Anh',
						      (img) => {
							img.id = 'thumbnail-'+pos;
							img.onload = () => {
							  let w = img.naturalWidth;
							  let h = img.naturalHeight;
							  let area = w*h;
							  let scale = Math.sqrt(targetArea/area);
							  w = Math.round(w*scale);
							  h = Math.round(h*scale);
							  img.style.width = w+'px';
							  img.style.height = h+'px';
							  img.style.left = Math.round((holderSize-w)/2)+'px';
							  img.style.top = Math.round((holderSize-h)/2)+'px';
							  img.addEventListener('click', (event) => {
							    zoomInImage(pos);
							  });
							  thumbnailImages[pos] = img;
							  hdLoaded.push(false);
							};
						      }), (e) => {
							e.style.width = holderSize+'px';
							e.style.height = holderSize+'px';
							thumbnailHolders[pos] = e;
						      })),
	makeElem('hr', 'clear')
      ])
    ]);
  };
  
  let updateThumbnailSize = () => {
    let orientation = hta.layout.orientation();
    if (orientation=='desktop' && ltuo=='desktop') return;
    ltuo = orientation;
    let holderSize = 300;
    if (orientation == 'mobile') {
      holderSize = Math.round(window.innerWidth/2-16);
    }
    let targetArea = 2*holderSize*holderSize/3;
    thumbnailHolders.forEach((holder) => {
      if (holder) {
	holder.style.width = holder.style.height = holderSize+'px';
      }
    });
    thumbnailImages.forEach((img) => {
      if (!img) return;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      let area = w*h;
      let scale = Math.sqrt(targetArea/area);
      w = Math.round(w*scale);
      h = Math.round(h*scale);
      img.style.width = w+'px';
      img.style.height = h+'px';
      img.style.left = Math.round((holderSize-w)/2)+'px';
      img.style.top = Math.round((holderSize-h)/2)+'px';
    });
  };

  let adjustImageSize = (ww,wh) => {
    Array.from(document.getElementsByClassName('carouselImage')).forEach((fullImage) => {
      let {w, h} = largeImageSize(fullImage);
      fullImage.style.width = w+'px';
      fullImage.style.height = h+'px';
      fullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
      fullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    });
  };
  
  hta.navigation.registerSection({

    name: 'media',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve(null);
    }),

    layout: () => {},

    onResize: () => {
      adjustImageSize();
      updateThumbnailSize();
    },

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
