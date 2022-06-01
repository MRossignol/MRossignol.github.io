
const bgNaturalWidth = 3480;
const bgNaturalHeight = 2320;

let ldBG = null;
let hdBG = null;

function startPixi() {

    PIXI.settings.TARGET_FPMS = 0.03;
    
    let canvas = document.getElementById('bgCanvas');
    
    let app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	view: canvas,
	resizeto: window,
	sharedTicker: true,
	sharedLoader: true
    });

    app.loader.add('ldBackground', 'img/000061-small-comp.webp');
    app.loader.add('hdBackground', 'img/000061-comp.webp');

    app.loader.load((loader, resources) => {
    });

    app.loader.onLoad.add(() => {
	if (!ldBG && app.loader.resources.ldBackground.isComplete) {
	    ldBG = new PIXI.Sprite(app.loader.resources.ldBackground.texture);
	    adjustGeometry();
	    ldBG.filters = [new PIXI.filters.BlurFilter(8, 3, PIXI.settings.FILTER_RESOLUTION, 5)];
	    ldBG.cacheAsBitmap = true;
	    app.stage.addChild(ldBG);
	}
	if (!hdBG && app.loader.resources.hdBackground.isComplete) {
	    hdBG = new PIXI.Sprite(app.loader.resources.hdBackground.texture);
	    adjustGeometry();
	    hdBG.alpha = 0.7;
	    app.stage.addChild(hdBG);
	}
    });

}

function adjustGeometry () {
    let w = window.innerWidth;
    let h = window.innerHeight;

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

    if (ldBG) {
	ldBG.setTransform(x, y, 2*scale, 2*scale);
    }

    if (hdBG) {
	hdBG.setTransform(x, y, scale, scale);
    }

}

// // Add a ticker callback to scroll the text up and down
// let elapsed = 0.0;
// app.ticker.add((delta) => {
//   // Update the text's y coordinate to scroll it
//   elapsed += delta;
//   text.y = 10 + -100.0 + Math.cos(elapsed/50.0) * 100.0;
// });


// let adjustBackgroundSize = () => {
//     let w = window.innerWidth;
//     let h = window.innerHeight;
//     let ldBackground = document.getElementById('background-ld');
//     let hdBackground = document.getElementById('background-hd');

//     let minW = 1.2*w;
//     let minH = 1.2*h;

//     let targetHeight = 1.5*h;
//     let targetWidth = targetHeight * bgNaturalWidth / bgNaturalHeight;
    
//     if (targetWidth < minW) {
// 	targetWidth = minW;
// 	targetHeight = targetWidth * bgNaturalHeight / bgNaturalWidth;
//     }
//     let bgW = Math.round(targetWidth);
//     let bgH = Math.round(targetHeight);

//     let scale = targetWidth / bgNaturalWidth;
    
//     // In the original image coordinate
//     let desiredCenterX = 1720;
//     let desiredCenterY = 1500;

//     let x = Math.round(w/2 - scale*desiredCenterX);
//     let y = Math.round(h/2 - scale*desiredCenterY);
//     if (y>0) y = 0;
//     if (y+bgH < h) y = h-bgH;


//     ldBackground.style.width = bgW+'px';
//     ldBackground.style.height = bgH+'px';
//     ldBackground.style.top = y+'px';
//     ldBackground.style.left = x+'px';
//     hdBackground.style.width = bgW+'px';
//     hdBackground.style.height = bgH+'px';
//     hdBackground.style.top = y+'px';
//     hdBackground.style.left = x+'px';

//     ldBackground.style.opacity = 1;
// }

// let currentTranslation = {
//     ld: {x: 0, y: 0},
//     hd: {x: 0, y: 0}
// };

// let currentTranslationEndTime = {
//     ld: {x: 0, y: 0},
//     hd: {x: 0, y: 0}
// };

// let moveBackground = (type, direction) => () => {
//     if (currentTranslationEndTime[type][direction] - Date.now() > 100) return;
//     console.log(type, direction);
//     let elem = document.getElementById('background-'+type+'-trans-'+direction);
//     let sign = currentTranslation[type][direction] > 0 ? -1 : 1;
//     let size = Math.min(window.innerWidth, window.innerHeight);
//     let trans = Math.round(sign * size * (.25 + .25*Math.random()))/10;
//     currentTranslation[type][direction] = trans;
//     let duration = Math.round(100 + 200*Math.random())/10;
//     currentTranslationEndTime[type][direction] = Date.now() + 1000*duration;
//     elem.style.transition = 'transform ease-in-out '+duration+'s';
//     elem.style.transform = 'translate'+direction.toUpperCase()+'('+trans+'px)';
// }


// window.addEventListener('DOMContentLoaded', adjustBackgroundSize);

// window.addEventListener('DOMContentLoaded', () => {
//     ['ld'/*, 'hd'*/].forEach ( (type) => {
// 	['x', 'y'].forEach ( (direction) => {
// 	    document.getElementById('background-'+type+'-trans-'+direction).addEventListener('transitionend', moveBackground(type, direction));
// 	    setTimeout(moveBackground(type, direction), 2000);
// 	});
//     });
// });

window.addEventListener('DOMContentLoaded', startPixi);
window.addEventListener('resize', adjustGeometry);
