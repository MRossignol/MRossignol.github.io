(function () {

  const textDivHeight = 32;
  let textDiv;

  const worker = new Worker("worker.js");
  
  let canvas, app, stableSpotsTexture, stableSpotsSprite, stableSpotsScene;

  let globalStartTime, imageStartTime;
  let totalTime, imageTime;

  const spotFadeInTime = .5;

  const nbImages = 13;
  const imageDuration = 30;
  const spotsPerImage = 2000;
  let currentImage = 0;
  
  const spotsDensityEvolution = [
    {t: 0, sps: 0},
    {t: 1, sps: 0},
    {t: 10, sps: 1},
    {t: 20, sps: 1},
    {t: imageDuration, sps: 0}
  ];

  
  const spotsColorEvolution = [
    {t: 0, color: [51, 34, 17]},
    {t: .9, color: [2, 0, 4]}
  ];


  // Preprocess evolution of number of spots
  const shouldHave = [0];
  let last = 0;
  for (let t=.1; t<=imageDuration; t += .1) {
    let pos = spotsDensityEvolution.findIndex(v => v.t >=t);
    let ratio = (t-spotsDensityEvolution[pos-1].t)/(spotsDensityEvolution[pos].t-spotsDensityEvolution[pos-1].t);
    let sps = (1-ratio)*spotsDensityEvolution[pos-1].sps + ratio*spotsDensityEvolution[pos].sps;
    let v = last + .1*sps;
    shouldHave.push(v);
    last = v;
  }
  let multiplier = spotsPerImage / last;
  shouldHave = shouldHave.map(c => c*multiplier);

  let neededNbSpotsImage = () => {
    let i = Math.ceil(10*imageTime);
    if (i == 0) return 0;
    if (i >= shouldHave.length) return spotsPerImage;
    let f = i-10*imageTime;
    return f*shouldHave[i] + (1-f)*shouldHave[i-1];
  };

  // Preprocess color evolution
  const spotColors = [];
  let colorNum = (col) => {
    let res = 0;
    for (let c of col)
      res = 256*res+c;
    return res;
  };
  for (let t=0; t <= nbImages*imageDuration; t++) {
    let p = spotsColorEvolution.indexOf(v => v.t >= t);
    if (p ==  0) spotColors.push(colorNum(spotsColorEvolution[0].color));
    if (p == -1) spotColors.push(colorNum(spotsColorEvolution[spotsColorEvolution.length-1].color));
    let c = [];
    let ratio = (t-spotsColorEvolution[p-1].t)/(spotsColorEvolution[p].t-spotsColorEvolution[p-1].t);
    let pCol = spotsColorEvolution[p-1].color, nCol = spotsColorEvolution[p].color;
    for (let i of [0, 1, 2]) {
      c.push(ratio*nCol[i] + (1-ratio)*pCol[i]);
    }
    spotColors.push(colorNum(c));
  }

  let spotColor = () => {
    return spotColors[Math.round(totalTime)];
  };


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

  for (let s of spots) {
    s.texture = PIXI.Texture.from(`whiteSpots/${s.name}`);
  }

  // let stableSprites = [];
  let appearingSprites = [];
  let appearedSprites = [];

  let stepNum = 0;
  let startTime = 0;
  let createdSpots = 0;

  let transferStabilizedSprites = () => {
    // console.log(stableSprites.length);
    stableSpotsScene = new PIXI.Container();
    stableSpotsScene.addChild(stableSpotsSprite);
    for (let s of appearedSprites) {
      stableSpotsScene.addChild(s.sprite);
      app.stage.removeChild(s.sprite);
      // stableSprites.push(s);
    }
    appearedSprites = [];
    app.renderer.render(stableSpotsScene, {renderTexture: stableSpotsTexture});
    stableSpotsSprite.setTexture(stableSpotsTexture);
  };

  let done = false;

  let availableSpots = new SimpleFifo();
  
  let onWorkerSendsSpot = (spot) => {
    availableSpots.add(spot);
  };


  let imageDrawnSpots = 0;
  
  let step = () => {
    if (done) {
      transferStabilizedSprites();
      setTimeout(() => app.stop());
      return;
    }
    let now = Date.now();
    imageTime = (now-imageStartTime)/1000;
    totalTime = (now-globalStartTime)/1000;

    if (imageTime >= imageDuration) {
      if (currentImage == nbImages) {
	done = true;
      } else {
	worker.postMessage({action: 'next', nbSpots: spotsPerImage});
	imageStartTime = now;
      }
      currentImage++;
      return;
    }
    
    let neededSpots = neededNbSpotsImage();
    for (; imageDrawnSpots < neededSpots; imageDrawnSpots++) {
      let spotData = availableSpots.take();
      let spot = spots[spotData.spot];
      let newObj = {
	startTime: now,
	alpha: spotData.alpha,
	sprite: new PIXI.Sprite(spot.texture)
      };
      // TODO : Harmonize rotation center in worker
      newObj.sprite.anchor.set(spot.center[0]/spot.dimensions[0], spot.center[1]/spot.dimensions[1]);
      if (!spotData.white) {
	newObj.sprite.tint = spotColor();
      }
      newObj.sprite.rotation = spotData.angle;
      newObj.sprite.scale.set(spotData.scale);
      newObj.sprite.x = spotData.position[0];
      newObj.sprite.y = spotData.position[1];
      appearingSprites.push(newObj);
      app.stage.addChild(newObj.sprite);
    }
    let newAppearingSprites = [];
    for (let s of appearingSprites) {
      if (now - s.startTime > spotFadeInTime) {
	s.sprite.alpha = s.alpha;
	appearedSprites.push(s);
      } else {
	let ratio = (now-s.startTime)/spotFadeInTime;
	let smoothRatio = .5*(1+Math.cos(Math.PI*(1-ratio)));
	s.sprite.alpha = smoothRatio*s.alpha;
	newAppearingSprites.push(s);
      }
    }
    if (appearedSprites.length > 100) {
      transferStabilizedSprites();
    }
    appearingSprites = newAppearingSprites;
    stepNum++;
  };


  let makePage = (canvas) => {
    let size = canvas.width;
    let holderDiv = document.createElement('div');
    holderDiv.classList.add('holder');
    holderDiv.style.width = size+'px';
    holderDiv.style.height = (size+textDivHeight)+'px';
    textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.innerHTML = 'Loading...';
    holderDiv.appendChild(textDiv);
    holderDiv.appendChild(canvas);
    document.body.appendChild(holderDiv);
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    let availableHeight = window.innerHeight-textDivHeight;
    let size = Math.min(window.innerWidth, availableHeight);
    app = new PIXI.Application({ background: '#fff', antialias: false, width: size, height: size });
    canvas = app.view;
    makePage(canvas);
    worker.onmessage = () => {
      textDiv.innerHTML = '';
      worker.onmessage = onWorkerSendsSpot;
      worker.postMessage({action: 'next', nbSpots: spotsPerImage});
      globalStartTime = imageStartTime = Date.now();
      stableSpotsTexture = PIXI.RenderTexture.create({width: size, height: size});
      stableSpotsSprite = new PIXI.Sprite(stableSpotsTexture);
      app.stage.addChild(stableSpotsSprite);
      app.ticker.add(step);
    };
    worker.postMessage({action: 'prepare', size: size});
  });
  
})();
