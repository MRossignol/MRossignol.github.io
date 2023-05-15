
let canvasSize;
let reference;
let currentState;
let focusFactor;
const focusAreaWeight = 10;
const margin = 10, minRadius = 5, maxRadius = 60;


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
  {name: 'female1.jpg', focus: {cx: 482/1024, cy: 590/1024, rx: 460/2048, ry: 560/2048}},
  {name: 'female2.jpg', focus: {cx: 510/1024, cy: 590/1024, rx: 500/2048, ry: 500/2048}},
  {name: 'female3.jpg', focus: {cx: 516/1024, cy: 600/1024, rx: 495/2048, ry: 500/2048}},
  {name: 'female4.jpg', focus: {cx: 500/1024, cy: 620/1024, rx: 486/2048, ry: 545/2048}},
];


let loadImageBitmap = url =>
  fetch(url, {mode: 'cors'})
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));


let loadImageData = (url, size) => new Promise((resolve, reject) => {
  loadImageBitmap(url).then((bitmap) => {
    let w, h;
    if (size) {
      w = h = size;
    } else {
      w = bitmap.width;
      h = bitmap.height;
    }
    let ctx = new OffscreenCanvas(w, h).getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);
    resolve(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
  });
});


let loadPortraits = () => new Promise((resolve, reject) => {
  let current = 0;
  let load = () => {
    console.log('Loading portrait '+current);
    let p = portraits[current];
    loadImageData('portraits/'+p.name, canvasSize).then((imgData) => {
      let brightness = [];
      for (let i=0; i<canvasSize; i++)
	brightness.push(new Float32Array(canvasSize));
      let min = 1, max = 0;
      for (let x = 0; x < canvasSize; x++) {
	let pos = 4*x;
	for (let y = 0; y < canvasSize; y++) {
	  let r = imgData.data[pos]/255.;
	  let g = imgData.data[pos+1]/255.;
	  let b = imgData.data[pos+2]/255.;
	  let val = Math.sqrt(r*r+g*g+b*b);
	  brightness[x][y] = Math.sqrt(r*r+g*g+b*b);
	  if (val > max) max = val;
	  if (val < min) min = val;
	  pos += 4*canvasSize;
	}
      }
      let scale = 1./(max-min);
      for (let x = 0; x < canvasSize; x++) {
	for (let y = 0; y < canvasSize; y++) {
	  brightness[x][y] = scale*(brightness[x][y] - min);
	}
      }
      p.brightness = brightness;
      current++;
      if (current < portraits.length) load();
      else resolve();
    });
  };
  load();
});


let loadSpots = () => new Promise((resolve, reject) => {
  let current = 0;
  let load = () => {
    console.log('Loading spot '+current);
    let s = spots[current];
    loadImageBitmap('spots/'+s.name).then((bitmap) => {
      s.img = bitmap;
      current++;
      if (current < spots.length) load();
      else resolve();
    });
  };
  load();
});


let currentPortrait = -1;
let nextPortrait = () => {
  currentPortrait++;
  if (currentPortrait < portraits.length) {
    let p = portraits[currentPortrait];
    reference = p.brightness;
    let w = p.brightness.length;
    let h = p.brightness[0].length;
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
      let dy = vScale*(y-cy);
      let d = Math.sqrt(dx*dx+dy*dy);
      return d < 1 ? focusAreaWeight : 1+(focusAreaWeight-1)*(1-(d-1)/(maxDist-1));
    };
  } else {
    for (let c of reference) c.fill(1);
  }
};


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


let getSpotAlpha = (spot, scale, angle) => {
  let s = Math.max(spot.dimensions[0], spot.dimensions[1]);
  s = Math.round(s*scale);
  let ocv = new OffscreenCanvas(2*s, 2*s);
  let ctx = ocv.getContext('2d');
  ctx.translate(s, s);
  ctx.scale(scale, scale);
  ctx.rotate(angle);
  ctx.translate(-spot.center[0], -spot.center[1]);
  ctx.drawImage(spot.image, 0, 0);
  let imgData = ctx.getImageData(0, 0, s, s);
  let alpha = getImageDataAlpha(imgData);
  let threshold = .05;
  let minX = Math.floor(s/2), minY = Math.floor(s/2), maxX = minX+1, maxY = minY+1;

  let a=0, b=minX, m;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (alpha[m].some(x => x>threshold)) {
      b = m;
    } else {
      a = m+1;
    }
    m = Math.floor((a+b)/2);
  }
  minX = a;

  a = maxX; b = alpha.length-1;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (alpha[m].some(x => x>threshold)) {
      a = m;
    } else {
      b = m-1;
    }
    m = Math.floor((a+b)/2);
  }
  maxX = b;

  let lineHasVisible = (y) => {
    for (let x = minX; x <= maxX; x++)
      if (alpha[x][y] > threshold) return true;
    return false;
  };

  a=0, b=minY;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (lineHasVisible(m)) {
      b = m;
    } else {
      a = m+1;
    }
    m = Math.floor((a+b)/2);
  }
  minY = a;
  
  a = maxY; b = alpha.length-1;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (lineHasVisible(m)) {
      a = m;
    } else {
      b = m-1;
    }
    m = Math.floor((a+b)/2);
  }
  maxY = b;
  
  let res = [];
  for (let x=minX; x<=maxX; x++) {
    res.push(alpha[x].slice(minY, maxY+1));
  }
  return res;
};


let squareDifferenceImprovement =  (left, top, w, h, shape, alpha, white) => {
  let squareSum = 0;
  if (white) {
    for (let sx=0, x=left; sx<w; sx++, x++) {
      for (let sy=0, y=top; sy<h; sy++, y++) {
	let v = currentState[x][y] + alpha*shape[sx][sy]*(1-currentState[x][y]);
	let d1 = reference[x][y]-currentState[x][y];
	let d2 = reference[x][y]-v;
	squareSum += d1*d1 - d2*d2;
      }
    }
  } else {
    for (let sx=0, x=left; sx<w; sx++, x++) {
      for (let sy=0, y=top; sy<h; sy++, y++) {
	let v = (1-alpha*shape[sx][sy])*currentState[x][y];
	let d1 = reference[x][y]-currentState[x][y];
	let d2 = reference[x][y]-v;
	squareSum += d1*d1 - d2*d2;
      }
    }
  }
  return focusFactor(left+w/2, top+h/2)*squareSum;
};


let addSpot = (alpha) => {
  let spotNum = Math.floor(spots.length*Math.random());
  let spot = spots[spotNum];
  let radius = minRadius + (maxRadius-minRadius)*Math.random();
  let scale = radius / spot.radius;
  let white = Math.random() < .5;
  let angle = 2*Math.PI*Math.random();
  let shape = getSpotAlpha(spot, scale, angle);
  let w = shape.length;
  let h = shape[0].length;
  let best = 0, bestPos = [0, 0];
  for (let i=0; i<100; i++) {
    let pos = [
      margin+Math.floor((canvasSize-w-2*margin)*Math.random()),
      margin+Math.floor((canvasSize-h-2*margin)*Math.random())
    ];
    let d = squareDifferenceImprovement(currentState, pos[0], pos[1], w, h, shape, alpha, white);
    if (d > best) {
      best = d;
      bestPos = pos;
    }
  }
  if (best > 0) {
    if (white) {
      for (let sx=0, x=bestPos[0]; sx<w; sx++, x++)
	for (let sy=0, y=bestPos[1]; sy<h; sy++, y++)
	  currentState[x][y] += alpha*shape[sx][sy]*(1-currentState[x][y]);
    } else {
      for (let sx=0, x=bestPos[0]; sx<w; sx++, x++)
	for (let sy=0, y=bestPos[1]; sy<h; sy++, y++)
	  currentState[x][y] = (1-alpha*shape[sx][sy])*currentState[x][y];
    }
  }
  postMessage({
    white: white,
    spot: spotNum,
    scale: scale,
    angle: angle
  });
};

onmessage = (e) => {
  console.log(e.data);
  switch (e.data.action) {
  case 'prepare':
    canvasSize = e.data.size;
    loadSpots().then(loadPortraits).then(() => {
      currentState = [];
      for (let i=0; i<canvasSize; i++)
	currentState.push(new Float32Array(canvasSize));
      for (let i=0; i<canvasSize; i++)
	currentState[i].fill(1);
      console.log('ready');
      postMessage();
    });
    break;
  case 'next':
    nextPortrait();
    for (let i=0; i<e.data.nbSpots; i++)
      addSpot();
    break;
  }
};
