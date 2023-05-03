(function () {

  const drawStepOpacity = .05;
  const nbDrawSteps = 100;
  const drawStepsStep = 5;
  const dropPeriod = 1;
  let minRadius =10, maxRadius = 20;

  const density = window.devicePixelRatio || 1;
  
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
  
  let drawnSpots = [];

  let profile = [];

  let maxY = 0;

  let drawSpot = (spotData) => {
    if (spotData.center[1] + spotData.radius > canvas.height) return false;
    if (spotData.center[1] > maxY) {
      maxY = spotData.center[1];
      if (maxY > canvas.height/4) {
	let style = `linear-gradient(to bottom, #000, #468 ${Math.round(130*(maxY-canvas.height/4)/canvas.height)}%, #468)`;
	document.body.style.background = style;
      }
    }
    // context.fillStyle = '#00f';
    // context.fillRect(spotData.center[0]-spotData.radius, canvas.height-100-(spotData.center[1]-spotData.radius), 2*spotData.radius, -2*spotData.radius);
    let scale = spotData.radius / spotData.spotSource.radius;
    // context.translate(spotData.center[0]+spotData.spotSource.center[0], canvas.height-spotData.center[1]-spotData.spotSource.center[1]);
    context.translate(spotData.center[0], /* canvas.height- */ spotData.center[1]);
    context.scale(scale, scale);
    context.rotate(spotData.angle);
    context.translate(-spotData.spotSource.center[0], -spotData.spotSource.center[1]);
    context.globalAlpha =  (spotData.step == nbDrawSteps) ? 1 : drawStepOpacity;
    if (spotData.step == nbDrawSteps || spotData.step % drawStepsStep == 0)
      context.drawImage(spotData.spotSource.image, 0, 0);
    context.resetTransform();
    spotData.step++;
    return spotData.step <= nbDrawSteps;
  };

  let stepNum = 0;
  
  let step = () => {
    if (stepNum % dropPeriod == 0) {
      let radius = minRadius+(maxRadius-minRadius)*Math.random();
      let x = canvas.width*Math.random();
      let y = 0, c = [0, 0];
      for (let i=Math.max(Math.floor(x-radius), 0), max=Math.min(Math.ceil(x+radius), canvas.width-1); i<max; i++) {
	if (profile[i].y >= y) {
	  y = profile[i].y;
	  c = profile[i].c;
	}
      }
      x += (c[0]-x)/2;
      y += (c[1]-y)/2;
      for (let i=Math.max(Math.ceil(x-radius), 0), max=Math.min(Math.floor(x+radius), canvas.width-1); i<max; i++) {
	let topY = y + Math.sqrt(radius*radius - (x-i)*(x-i));
	if (topY > profile[i].y) profile[i] = {y:topY, c:[x,y]};
      }
      drawnSpots.push({
	step: 0,
	center: [x, y /* % canvas.height */],
	radius: radius,
	angle: 2*Math.PI*Math.random(),
	spotSource: spots[Math.floor(spots.length*Math.random())]
      });
    }
    let newDrawnSpots = [];
    for (let s of drawnSpots) {
      if (drawSpot(s)) newDrawnSpots.push(s);
    }
    drawnSpots = newDrawnSpots;
    stepNum++;
    if (drawnSpots.length) {
      requestAnimationFrame(step);
    }
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.createElement('canvas');
    canvas.style.width = '100vw';
    canvas.width = density*window.innerWidth;
    canvas.style.height = '100vh';
    canvas.height = density*window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    context = canvas.getContext('2d');
    for (let i=0; i<canvas.width; i++) {
      profile[i] = {y: 0, c: [i, 0]};
    }
    document.body.style.height = '100vh';
    document.body.style.background = '#468';
    setTimeout(() => { document.body.style.transition = 'background 1s'; });
    document.body.appendChild(canvas);
    let textDiv = document.createElement('div');
    textDiv.style['z-index'] = 5;
    textDiv.style.color = '#468';
    textDiv.style.position = 'absolute';
    textDiv.style.top = '20%';
    textDiv.style.left = '25%';
    textDiv.innerHTML = '<h1>Some text</h1><h3>Have some text go here</h3><h3>On several lines</h3><h3>Like this</h3><h3>It would work well for poetry I suppose</h3><h3>Or anything where we want to control the reading speed</h3><To sync with sound for example</h3>';
    document.body.appendChild(textDiv);
    let nbLoaded = 0;
    let stepStarted = false;
    for (let s of spots) {
      s.image = new Image();
      s.onload = () => {
	nbLoaded++;
	if (nbLoaded == spots.length && ! stepStarted) {
	  stepStarted = true;
	  step();
	}
      };
      s.image.src = `spots/${s.name}`;
    }
    console.log(spots);
  });
  
})();
