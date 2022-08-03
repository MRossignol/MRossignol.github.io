
( function() {
  const bgNaturalWidth = 3480;
  const bgNaturalHeight = 2320;

  let adjustBackgroundSize = () => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let ldBackground = document.getElementById('background-ld');
    let hdBackground = document.getElementById('background-hd');

    let minW = 1.2*w;
    let minH = 1.2*h;

    let targetHeight = 1.5*h;
    let targetWidth = targetHeight * bgNaturalWidth / bgNaturalHeight;
    
    if (targetWidth < minW) {
      targetWidth = minW;
      targetHeight = targetWidth * bgNaturalHeight / bgNaturalWidth;
    }
    let bgW = Math.round(targetWidth);
    let bgH = Math.round(targetHeight);

    let scale = targetWidth / bgNaturalWidth;
    
    // In the original image coordinate
    let desiredCenterX = 1720;
    let desiredCenterY = 1500;

    let x = Math.round(w/2 - scale*desiredCenterX);
    let y = Math.round(h/2 - scale*desiredCenterY);
    if (y>0) y = 0;
    if (y+bgH < h) y = h-bgH;


    ldBackground.style.width = bgW+'px';
    ldBackground.style.height = bgH+'px';
    ldBackground.style.top = y+'px';
    ldBackground.style.left = x+'px';
    hdBackground.style.width = bgW+'px';
    hdBackground.style.height = bgH+'px';
    hdBackground.style.top = y+'px';
    hdBackground.style.left = x+'px';

    ldBackground.style.opacity = 1;
  };

  let currentTranslation = {
    ld: {x: 0, y: 0},
    hd: {x: 0, y: 0}
  };

  let currentTranslationEndTime = {
    ld: {x: 0, y: 0},
    hd: {x: 0, y: 0}
  };

  let moveBackground = (type, direction) => () => {
    if (currentTranslationEndTime[type][direction] - Date.now() > 100) return;
    let elem = document.getElementById('background-'+type+'-trans-'+direction);
    let sign = currentTranslation[type][direction] > 0 ? -1 : 1;
    let size = Math.min(window.innerWidth, window.innerHeight);
    let trans = Math.round(sign * size * (.25 + .25*Math.random()))/10;
    currentTranslation[type][direction] = trans;
    let duration = Math.round(100 + 200*Math.random())/10;
    currentTranslationEndTime[type][direction] = Date.now() + 1000*duration;
    elem.style.transition = 'transform ease-in-out '+duration+'s';
    elem.style.transform = 'translate'+direction.toUpperCase()+'('+trans+'px)';
  };


  window.addEventListener('resize', adjustBackgroundSize);

  window.addEventListener('DOMContentLoaded', adjustBackgroundSize);

  window.addEventListener('DOMContentLoaded', () => {
    ['ld', 'hd'].forEach ( (type) => {
      ['x', 'y'].forEach ( (direction) => {
	document.getElementById('background-'+type+'-trans-'+direction).addEventListener('transitionend', moveBackground(type, direction));
	setTimeout(moveBackground(type, direction), 2000);
      });
    });
  });
  
}) ();
