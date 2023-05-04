(function () {

  let app;
  
  const spotGrowTime = 1000;
  const spotGrowStartScale = .4;
  const spotGrowEndScale = 1;
  const spotGrowStartAlpha = 0;
  const spotGrowEndAlpha = .6;
  
  const drawStepOpacity = .05;
  const nbDrawSteps = 100;
  const drawStepsStep = 5;
  const dropPeriod = 1;
  let minRadius =15, maxRadius = 25;

  const density = window.devicePixelRatio || 1;
  minRadius *= Math.sqrt(density);
  maxRadius *= Math.sqrt(density);
  
  let canvas, context;
  
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
    s.texture = PIXI.Texture.from(`spots/${s.name}`);
  }
  
  let growingSprites = [];

  let profile = [];

  let stepNum = 0;
  
  let step = () => {
    let now = Date.now();
    if (stepNum % dropPeriod == 0) {
      let radius = minRadius+(maxRadius-minRadius)*Math.random();
      let x = canvas.width*Math.random();
      let y = 0, o = null;
      for (let i=Math.max(Math.floor(x-radius), 0), max=Math.min(Math.ceil(x+radius), canvas.width-1); i<max; i++) {
	if (profile[i].y >= y) {
	  y = profile[i].y;
	  o = profile[i].object;
	}
      }
      if (true /* !o.growing */ ) {
	x += (o.center[0]-x)/5;
	y += (o.center[1]-y)/5;
	let spot = spots[Math.floor(spots.length*Math.random())];
	let newObj = {
	  startTime: now,
	  growing: true,
	  center: [x, y /* % canvas.height */],
	  radius: radius,
	  scale: radius / spot.radius,
	  angle: 2*Math.PI*Math.random(),
	  sprite: new PIXI.Sprite(spot.texture)
	};
	newObj.sprite.anchor.set(spot.center[0]/spot.dimensions[0], spot.center[1]/spot.dimensions[1]);
	newObj.sprite.rotation = newObj.angle;
	newObj.sprite.x = x;
	newObj.sprite.y = y % canvas.height;
	growingSprites.push(newObj);
	app.stage.addChild(newObj.sprite);
	for (let i=Math.max(Math.ceil(x-radius), 0), max=Math.min(Math.floor(x+radius), canvas.width-1); i<max; i++) {
	  let topY = y + Math.sqrt(radius*radius - (x-i)*(x-i));
	  if (topY > profile[i].y) profile[i] = {y:topY, object: newObj};
	}
      }
    }
    let newGrowingSprites = [];
    for (let s of growingSprites) {
      if (now - s.startTime > spotGrowTime) {
	s.growing = false;
	s.sprite.scale.set(s.scale * spotGrowEndScale);
	s.sprite.alpha = spotGrowEndAlpha;
      } else {
	let ratio = (now-s.startTime)/spotGrowTime;
	let smoothRatio = .5*(1+Math.cos(Math.PI*(1-ratio)));
	s.sprite.scale.set(s.scale * (spotGrowStartScale + smoothRatio*(spotGrowEndScale-spotGrowStartScale)));
	s.sprite.alpha = spotGrowStartAlpha + smoothRatio*(spotGrowEndAlpha-spotGrowStartAlpha);
	newGrowingSprites.push(s);
      }
    }
    growingSprites = newGrowingSprites;
    stepNum++;
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    app = new PIXI.Application({ background: '#468', resizeTo: document.body });
    document.body.appendChild(app.view);
    canvas = app.view;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    for (let i=0; i<canvas.width; i++) {
      profile[i] = {y: 0, object: {growing: false, center: [i, 0]}};
    }
    app.ticker.add(step);
    let textDiv = document.createElement('div');
    textDiv.style['z-index'] = 5;
    textDiv.style.color = '#468';
    textDiv.style.position = 'absolute';
    textDiv.style.top = '20%';
    textDiv.style.left = '25%';
    textDiv.innerHTML = '<h1>Some text</h1><h3>Have some text go here</h3><h3>On several lines</h3><h3>Like this</h3><h3>It would work well for poetry I suppose</h3><h3>Or anything where we want to control the reading speed</h3><To sync with sound for example</h3>';
    document.body.appendChild(textDiv);
  });
  
})();
