(function () {

  let canvas, rawContext;

  let dropPeriod = 1;
  
  let minRadius = 5, maxRadius = 80;

  let focusAreaWeight = 2;
  
  let currentImgData;
  let reference;

  let focusFactor;

  let portrait = 0;
  
  let spots = [
    {name: '01.png', dimensions: [455, 491], center: [238, 233], radius: 110},
    {name: '02.png', dimensions: [544, 743], center: [265, 350], radius: 150},
    {name: '03.png', dimensions: [486, 685], center: [260, 300], radius: 130},
    {name: '04.png', dimensions: [681, 699], center: [350, 300], radius: 160},
    {name: '05.png', dimensions: [555, 678], center: [297, 232], radius: 130},
    {name: '06.png', dimensions: [552, 734], center: [302, 329], radius: 140},
    {name: '07.png', dimensions: [456, 581], center: [257, 262], radius: 120},
    {name: '08.png', dimensions: [427, 415], center: [193, 179], radius: 70},
    {name: '09.png', dimensions: [380, 537], center: [186, 254], radius: 60},
    {name: '10.png', dimensions: [320, 388], center: [148, 168], radius: 60},
    {name: '11.png', dimensions: [403, 460], center: [203, 220], radius: 82},
    {name: '12.png', dimensions: [434, 531], center: [213, 238], radius: 60},
    {name: '13.png', dimensions: [389, 442], center: [151, 203], radius: 82}
  ];

  let portraits = [
    {name: 'female1.jpg', focus: {cx: 482/1024, cy: 590/1024, rx: 460/1024, ry: 560/1024}},
    {name: 'female2.jpg', focus: {cx: 510/1024, cy: 590/1024, rx: 500/1024, ry: 500/1024}},
  ];
  
  
  let drawnSpots = [];

  let profile = [];

  let maxY = 0;

  let getImageBrightness = (url, options) => {
    return new Promise( (resolve, reject) => {
      let img = new Image();
      img.onload = () => {
	let w = img.width, h = img.height;
	if (options && options.width) w = Math.round(options.width);
	if (options && options.height) h = Math.round(options.height);
	if (options && options.maximize) {
	  if (img.width/img.height > window.innerWidth / window.innerHeight) {
	    w = window.innerWidth;
	    h = Math.floor(w * img.height / img.width);
	  } else {
	    h = window.innerHeight;
	    w = Math.floor(h * img.width / img.height);
	  }
	}
	let ocv = document.createElement('canvas');
	ocv.width = w;
	ocv.height = h;
	let ctx = ocv.getContext('2d');
	ctx.drawImage(img, 0, 0);
	let imgData = ctx.getImageData(0, 0, w, h);
	let brightness = [];
	for (let i=0; i<w; i++)
	  brightness.push(new Float32Array(h));
	
	let min = 1, max = 0;
	for (let x = 0; x < w; x++) {
	  let pos = 4*x;
	  for (let y = 0; y < h; y++) {
	    let r = imgData.data[pos]/255.;
	    let g = imgData.data[pos+1]/255.;
	    let b = imgData.data[pos+2]/255.;
	    let val = Math.sqrt(r*r+g*g+b*b);
	    brightness[x][y] = Math.sqrt(r*r+g*g+b*b);
	    if (val > max) max = val;
	    if (val < min) min = val;
	    pos += 4*w;
	  }
	}
	if (options && options.normalize) {
	  let scale = 1./(max-min);
	  for (let x = 0; x < w; x++) {
	    for (let y = 0; y < h; y++) {
	      brightness[x][y] = scale*(brightness[x][y] - min);
	    }
	  }
	}
	if (options && options.negative) {
	  for (let x = 0; x < w; x++) {
	    for (let y = 0; y < h; y++) {
	      brightness[x][y] = 1-brightness[x][y];
	    }
	  }
	}
	resolve(brightness);
      };
      img.src = url;
    });
  };

  let nextPortrait = () => new Promise((resolve, reject) => {
    if (portrait < portraits.length) {
      let p = portraits[portrait];
      getImageBrightness(`portraits/${p.name}`, {maximize: true, normalize: true}).then((brightness) => {
	reference = brightness;
	let w = brightness.length;
	let h = brightness[0].length;
	let cx = w*p.focus.cx;
	let cy = w*p.focus.cy;
	let hScale = 1/(p.focus.rx*w);
	let vScale = 1/(p.focus.ry*h);
	let maxDist = 0;
	for (let c of [[0, 0], [w, 0], [0, h], [w, h]]) {
	  let dx = hScale*(c[0]-cx);
	  let dy = vScale*(c[1]-cy);
	  let dist = dx*dx+dy*dy;
	  if (dist > maxDist) maxDist = dist;
	}
	maxDist = Math.sqrt(maxDist);
	focusFactor = (x,y) => {
	  let dx = hScale*(x-cx);
	  let dy = vScale*(x-cy);
	  let d = Math.sqrt(dx*dx+dy*dy)/maxDist;
	  return d < 1 ? focusFactor : focusFactor*(2-d);
	};
	resolve();
      });
    } else {
      for (let c of reference) c.fill(1);
      resolve();
    }
    portrait++;
  });


  let getImageDataAlpha = (imgData) => {
    let w = imgData.width, h = imgData.height;
    let alpha = [];
    for (let i=0; i<w; i++)
      alpha.push(new Float32Array(h));
    for (let x = 0; x < w; x++) {
      let pos = 4*x;
      for (let y = 0; y < h; y++) {
	alpha[x][y] = imgData.data[pos+3]/255.;
	pos += 4*w;
      }
    }
    return alpha;
  };
  
  
  let getImageAlpha = (url) => {
    return new Promise( (resolve, reject) => {
      let img = new Image();
      img.onload = () => {
	let ocv = document.createElement('canvas');
	ocv.width = img.width;
	ocv.height = img.height;
	let ctx = ocv.getContext();
	ctx.drawImage(img, 0, 0);
	let imgData = ctx.getImageData(0, 0, img.width, img.height);
	resolve(getImageDataAlpha(imgData));
      };
      img.src = url;
    });
  };


  let getSpotAlpha = (spot, scale, angle) => {
    let ocv = document.createElement('canvas');
    let s = Math.max(spot.dimensions[0], spot.dimensions[1]);
    s = Math.round(s*scale);
    ocv.width = s;
    ocv.height = s;
    let ctx = ocv.getContext('2d');
    ctx.scale(scale, scale);
    ctx.translate(spot.center[0], spot.center[1]);
    ctx.rotate(angle);
    ctx.translate(-spot.center[0], -spot.center[1]);
    ctx.drawImage(spot.image, 0, 0);
    let imgData = ctx.getImageData(0, 0, s, s);
    let alpha = getImageDataAlpha(imgData);
    let threshold = .02;
    let minX = Math.floor(s/2), minY = Math.floor(s/2), maxX = minX+1, maxY = minY+1;
    
    for (let x=0; x<minX; x++) {
      for (let y=0; y<minY; y++) {
	if (alpha[x][y] > threshold) {
	  minX = x;
	  minY = y;
	  break;
	}
      }
      if (x < minX) {
	for (let y=minY; y<=maxY; y++) {
	  if (alpha[x][y] > threshold) {
	    minX = x;
	    break;
	  }
	}
      }
      for (let y=s-1; y>maxY; y--) {
	if (alpha[x][y] > threshold) {
	  minX = x;
	  maxY = y;
	  break;
	}
      }
    }
    
    for (let x=minX; x<=maxX; x++) {
      for (let y=0; y<minY; y++) {
	if (alpha[x][y] > threshold) {
	  minY = y;
	  break;
	}
      }
      for (let y=s-1; y>maxY; y--) {
	if (alpha[x][y] > threshold) {
	  maxY = y;
	  break;
	}
      }
    }
    
    for (let x=s-1; x>maxX; x--) {
      for (let y=0; y<minY; y++) {
	if (alpha[x][y] > threshold) {
	  maxX = x;
	  minY = y;
	  break;
	}
      }
      if (x > maxX) {
	for (let y=minY; y<=maxY; y++) {
	  if (alpha[x][y] > threshold) {
	    maxX = x;
	    break;
	  }
	}
      }
      for (let y=s-1; y>maxY; y--) {
	if (alpha[x][y] > threshold) {
	  maxX = x;
	  maxY = y;
	  break;
	}
      }
    }
    let res = [];
    for (let x=minX; x<=maxX; x++) {
      res.push(alpha[x].slice(minY, maxY+1));
    }
    return res;
  };

  let squareDifferenceImprovement =  (currentState, left, top, w, h, spot, alpha) => {
    let squareSum = 0;
    for (let sx=0, x=left; sx<w; sx++, x++) {
      for (let sy=0, y=top; sy<h; sy++, y++) {
	let v = (1-alpha*spot[sx][sy])*currentState[x][y];
	let d1 = reference[x][y]-currentState[x][y];
	let d2 = reference[x][y]-v;
	squareSum += d1*d1 - d2*d2;
      }
    }
    return focusFactor(left+w/2, top+h/2)*squareSum;
  };
  
  let addSpot = (alpha) => {
    let spot = spots[Math.floor(spots.length*Math.random())];
    let radius = minRadius + (maxRadius-minRadius)*Math.random();
    let scale = radius / spot.radius;
    let shape = getSpotAlpha(spot, scale, 2*Math.PI*Math.random());
    let w = shape.length;
    let h = shape[0].length;
    let currentState = getImageDataAlpha(currentImgData);
    let best = 0, bestPos = [0, 0];
    for (let i=0; i<100; i++) {
      let pos = [
	Math.floor((canvas.width-w)*Math.random()),
	Math.floor((canvas.height-h)*Math.random())
      ];
      let d = squareDifferenceImprovement(currentState, pos[0], pos[1], w, h, shape, alpha);
      if (d > best) {
	best = d;
	bestPos = pos;
      }
    }
    if (best > 0) {
      for (let sx=0, x=bestPos[0]; sx<w; sx++, x++) {
	for (let sy=0, y=bestPos[1]; sy<h; sy++, y++) {
	  let v = (1-alpha*shape[sx][sy])*currentState[x][y];
	  v = Math.floor(255*v);
	  currentImgData.data[4*(y*canvas.width+x)+0] = v;
	  currentImgData.data[4*(y*canvas.width+x)+1] = v;
	  currentImgData.data[4*(y*canvas.width+x)+2] = v;
	  currentImgData.data[4*(y*canvas.width+x)+3] = v;
	}
      }
    }
    //rawContext.transferFromImageBitmap(createImageBitmap(currentImgData));
    createImageBitmap(currentImgData).then((img) => rawContext.transferFromImageBitmap(img));
  };

  let stepNum = 0;
  
  let step = () => {
    if (stepNum % dropPeriod == 0)
      addSpot(.2);
    stepNum++;
    requestAnimationFrame(step);
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    nextPortrait().then(() => {
      let w = reference.length, h = reference[0].length;
      canvas = document.createElement('canvas');
      canvas.style.width = w+'px';
      canvas.width = w;
      canvas.style.height = h+'px';
      canvas.height = h;
      canvas.style.position = 'absolute';
      canvas.style.top = Math.round((window.innerHeight-h)/2)+'px';
      canvas.style.left = Math.round((window.innerWidth-w)/2)+'px';
      let dataArray = new Uint8ClampedArray(w*h*4);
      dataArray.fill(255);
      currentImgData = new ImageData(dataArray, w, h);
      rawContext = canvas.getContext('bitmaprenderer');
      createImageBitmap(currentImgData).then((img) => rawContext.transferFromImageBitmap(img));
      document.body.style.height = '100vh';
      document.body.style.background = '#321';
      document.body.appendChild(canvas);
      let nbLoaded = 0;
      let stepStarted = false;
      for (let s of spots) {
	s.image = new Image();
	s.image.onload = () => {
	  nbLoaded++;
	  if (nbLoaded == spots.length && !stepStarted) {
	    stepStarted = true;
	    step();
	  }
	};
	s.image.src = `spots/${s.name}`;
      }
    });
  });
  
})();
