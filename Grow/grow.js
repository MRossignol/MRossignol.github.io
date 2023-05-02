(function () {

  const drawStepOpacity = .05;
  const nbDrawSteps = 100;
  const dropPeriod = 1;
  let minRadius =10, maxRadius = 20;
  
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
    s.image = new Image();
    s.image.src = `spots/${s.name}`;
  }
  console.log(spots);

  let drawnSpots = [];

  let profile = [];

  let drawSpot = (spotData) => {
    // context.fillStyle = '#00f';
    // context.fillRect(spotData.center[0]-spotData.radius, canvas.height-100-(spotData.center[1]-spotData.radius), 2*spotData.radius, -2*spotData.radius);
    let scale = spotData.radius / spotData.spotSource.radius;
    // context.translate(spotData.center[0]+spotData.spotSource.center[0], canvas.height-spotData.center[1]-spotData.spotSource.center[1]);
    context.translate(spotData.center[0], canvas.height-spotData.center[1]);
    context.scale(scale, scale);
    context.rotate(spotData.angle);
    context.translate(-spotData.spotSource.center[0], -spotData.spotSource.center[1]);
    context.globalAlpha =  (spotData.step == nbDrawSteps) ? 1 : drawStepOpacity;
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
      let y = 0;
      for (let i=Math.max(Math.floor(x-radius), 0), max=Math.min(Math.ceil(x+radius), canvas.width-1); i<max; i++) {
	if (profile[i] > y) y = profile[i];
      }
      for (let i=Math.max(Math.floor(x-.7*radius), 0), max=Math.min(Math.ceil(x+.7*radius), canvas.width-1); i<max; i++) {
	profile[i] = y+.7*radius;
      }
      drawnSpots.push({
	step: 0,
	center: [x, y % canvas.height],
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
    requestAnimationFrame(step);
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.createElement('canvas');
    canvas.style.width = window.innerWidth+'px';
    canvas.width = window.innerWidth;
    canvas.style.height = window.innerHeight+'px';
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    context = canvas.getContext('2d');
    for (let i=0; i<window.innerWidth; i++) {
      profile[i] = 0;
    }
    context.fillStyle = '#468';
    context.fillRect(0, 0, canvas.width, canvas.height);
    document.body.appendChild(canvas);
    step();
  });
  
})();
