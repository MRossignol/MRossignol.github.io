// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const nbBoids = 500;

const cruisingSpeed = 15;
const cruisingSpeedFactor = .2;
const minSpeed = 2;
const maxSpeed = 30;

const maxTurningAngle = .05;
const maxAcceleration = .15;

const repulsionDistanceMin = 4;
const repulsionDistanceMax = 25;
const repulsionFactor = .5;

const wallRepulsionDistanceMin = 60;
const wallRepulsionDistanceMax = 130;
const wallRepulsionFactor = 4;

const attractionDistanceMin = 7;
const attractionDistanceMax = 300;
const attractionFactor = .015;

const speedMultiplier = .2;
const futureVisionFactor = 8;

const nbGroups = 3;

const groups =[];

const maxGroupChange = 1;

for (let g=0; g<3; g++) {
  groups.push({id: g, cx: 0, cy:0, count: 0});
}

const graphicsWorker = new Worker("boids-graphics.js");

var boids = [];

function initBoids() {
  for (let i = 0; i < nbBoids; i++) {
    let alpha = 2*Math.PI*Math.random();
    boids.push({
      id: boids.length,
      x: (.1+.8*Math.random()) * width,
      y: (.1+.8*Math.random()) * height,
      angle: alpha,
      cos: Math.cos(alpha),
      sin: Math.sin(alpha),
      speed: 2+4*Math.random(),
      group: Math.floor(nbGroups*Math.random())
    });
  }
  window.initBoidsAudio(boids);
}


const accelEfficiencyLossRange = 3;
const accelEfficiencyEndThreshold = maxSpeed - accelEfficiencyLossRange;
const brakeEfficiencyEndThreshold = minSpeed + accelEfficiencyLossRange;
function applyAcceleration (boid, acceleration) {
  if (acceleration > 0) {
    if (boid.speed >= maxSpeed) {
      boid.speed = maxSpeed;
    } else {
      if (acceleration > maxAcceleration) acceleration = maxAcceleration;
      if (boid.speed > accelEfficiencyEndThreshold)
	boid.speed += acceleration*(maxSpeed-boid.speed)/accelEfficiencyLossRange;
      else
	boid.speed += acceleration;
      if (boid.speed > maxSpeed) boid.speed = maxSpeed;
    }
  } else {
    if (boid.speed <= minSpeed) {
      boid.speed = minSpeed;
    } else {
      if (acceleration < -maxAcceleration) acceleration = -maxAcceleration;
      if (boid.speed < brakeEfficiencyEndThreshold)
	boid.speed += acceleration*(boid.speed-minSpeed)/accelEfficiencyLossRange;
      else
	boid.speed += acceleration;
      if (boid.speed < minSpeed) boid.speed = minSpeed;
    }
  }
}

function applyAngleIncrement (boid, angleInc) {
  if (angleInc > maxTurningAngle) angleInc = maxTurningAngle;
  if (angleInc < -maxTurningAngle) angleInc = -maxTurningAngle;
  boid.angle += angleInc;
  boid.cos = Math.cos(boid.angle);
  boid.sin = Math.sin(boid.angle);
}


function hsvToRgb(h, s, v) {
  let i = Math.floor(h * 6), p = v * (1 - s);
  let f = h * 6 - i;
  let q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  let n = 255;
  let rFormat = (r,g,b) => [Math.round(r * n), Math.round(g * n), Math.round(b * n)];
  switch (i % 6) {
  case 0: return rFormat(v, t, p);
  case 1: return rFormat(q, v, p);
  case 2: return rFormat(p, v, t);
  case 3: return rFormat(p, q, v);
  case 4: return rFormat(t, p, v);
  case 5:
  default: return rFormat(v, p, q);
  }
}

function rgbHash([r, g, b]) {
  let res = '#';
  for (let c of [r,g,b]) {
    if (c < 16) res += '0';
    res += c.toString(16);
  }
  return res;
}

function distanceAndAngle (dx, dy) {
  let dist = Math.sqrt(dx*dx+dy*dy);
  let a = 0;

  let topRightAngle = (pdx, pdy) => {
    if (pdx > pdy) return Math.asin(pdy/dist);
    else return Math.acos(pdx/dist);
  };

  if (dx > 0) {
    if (dy >= 0) {
      a = topRightAngle(dx, dy);
    } else {
      a = 2*Math.PI - topRightAngle(dx, -dy);
    }
  } else if (dx < 0) {
    if (dy >= 0) {
      a = Math.PI - topRightAngle(-dx, dy);
    } else {
      a = Math.PI + topRightAngle(-dx, -dy);
    }
  } else {
    if (dy > 0) {
      a = Math.PI / 2;
    } else if (dy < 0) {
      a = 3 * Math.PI / 2;
    } else {
      a = 0;
    }
  }

  return {
    distance: dist,
    angle: a
  };
}

const nbVisionWedges = 8;
const visionWedgeAngle = 2 * Math.PI / nbVisionWedges;
const vWedgeCos = Math.cos(visionWedgeAngle);
const vWedgeSin = Math.sin(visionWedgeAngle);
const influences = [];
for (let i=0; i<nbBoids; i++) {
  influences[i] = new Float32Array(nbVisionWedges);
}


function computeInfluences () {

  let addBoidInfluence = (dist, angle, inf) => {
    let wedge = Math.round(1000*nbVisionWedges + angle / visionWedgeAngle) % nbVisionWedges;
    // If too close, repulsive effect
    if (dist < repulsionDistanceMax) {
      if (dist < repulsionDistanceMin) {
	inf[wedge] -= repulsionFactor;
      } else {
	let distRatio = (repulsionDistanceMax - dist) / (repulsionDistanceMax - repulsionDistanceMin);
	inf[wedge] -= repulsionFactor*distRatio; // *distRatio;
      }
    }
    // Attraction effect if in attraction range
    if (dist < attractionDistanceMax && dist > attractionDistanceMin) {
      let distRatio = (attractionDistanceMax - dist) / (attractionDistanceMax - attractionDistanceMin);
      inf[wedge] += attractionFactor*distRatio;
    }
  };

  // compute total influences
  for (let inf of influences) {
    inf.fill(0);
  }
  for (let b=0; b<nbBoids; b++) {
    let boid1 = boids[b];
    let {x, y, angle, cos, sin, speed} = boid1;
    let inf = influences[b];
    // Wish to reach cruising speed
    if (speed > 1.1*cruisingSpeed)
      inf[0] -= cruisingSpeedFactor;
    else if (speed < cruisingSpeed/1.1)
      inf[0] += cruisingSpeedFactor;
    
    // Avoid walls
    for (let v=0; v<nbVisionWedges; v++) {
      let minD = Math.min(
	(cos > 0) ? (width-x)  / cos : (cos < 0) ? -x / cos : 1000000,
	(sin > 0) ? (height-y) / sin : (sin < 0) ? -y / sin : 1000000
      );
      if (minD < wallRepulsionDistanceMax) {
	if (minD <= wallRepulsionDistanceMin) {
	  inf[v] -= wallRepulsionFactor;
	} else {
	  let distRatio = 1-(minD-wallRepulsionDistanceMin)/(wallRepulsionDistanceMax-wallRepulsionDistanceMin);
	  inf[v] -= wallRepulsionFactor*distRatio; // *distRatio;
	}
      }
      let c = cos*vWedgeCos - sin*vWedgeSin;
      sin = cos*vWedgeSin + sin*vWedgeCos;
      cos = c;
    }

    // // Compute influence of / on other boids
    // for (let j=0; j<b; j++) {
    //   let boid2 = boids[j], inf2 = influences[j];
    //   let {distance, angle} = distanceAndAngle(boid2.x-boid1.x, boid2.y-boid1.y);
    //   addBoidInfluence(distance, angle - boid1.angle, inf);
    //   addBoidInfluence(distance, Math.PI + angle - boid2.angle, inf2);
    // }
    
    // Compute influence of / on other boids
    for (let j=0; j<nbBoids; j++) {
      if (b==j) continue;
      let boid2 = boids[j], inf2 = influences[j];
      let x2 = boid2.x + speedMultiplier*futureVisionFactor*boid2.cos*boid2.speed;
      let y2 = boid2.y + speedMultiplier*futureVisionFactor*boid2.sin*boid2.speed;
      let {distance, angle} = distanceAndAngle(x2-boid1.x, y2-boid1.y);
      addBoidInfluence(distance, angle - boid1.angle, inf);
    }
    
  }
  
}

function applyInfluences () {

  const impact = [
    {angleTo: 0, angleAway: 0, speed: 1},
    {angleTo: .2, angleAway: 1, speed: .3},
    {angleTo: .4, angleAway: .5, speed: 0},
    {angleTo: .2, angleAway: .3, speed: -.5},
    {angleTo: 0, angleAway: 0, speed: 0},
    {angleTo: -.2, angleAway: -.3, speed: -.5},
    {angleTo: -.4, angleAway: -.5, speed: 0},
    {angleTo: -.2, angleAway: -1, speed: .3}
  ];
  
  // Update
  for (let i=0; i<nbBoids; i++) {
    let boid = boids[i];
    let angleInc = 0, speedInc = 0;
    let inf = influences[i];
    for (let p=0; p<nbVisionWedges; p++) {
      if (inf[p] < 0) { // repulsion
	angleInc += inf[p] * impact[p].angleAway;
      } else { // attraction
	angleInc += inf[p] * impact[p].angleTo;
      }
      speedInc += inf[p] * impact[p].speed;
    }
    applyAngleIncrement(boid, angleInc);
    applyAcceleration(boid, speedInc);
        
    boid.x += speedMultiplier * boid.speed*boid.cos;
    boid.y += speedMultiplier * boid.speed*boid.sin;
  }

}

function updateGroups () {
  for (let g of groups) {
    g.cx = 0;
    g.cy = 0;
    g.count = 0;
  }
  for (let b of boids) {
    let g = groups[b.group];
    g.cx += b.x;
    g.cy += b.y;
    g.count++;
  }
  for (let g of groups) {
    if (g.count > 0) {
      g.cx /= g.count;
      g.cy /= g.count;
    } else {
      g.cx = -1000;
      g.cy = -1000;
    }
    g.count = 0;
  }
  let nbChange = 0;
  for (let b of boids) {
    let initGroup = b.group;
    groups.reduce((minDist, g) => {
      let dx = b.x-g.cx;
      let dy = b.y-g.cy;
      let d = dx*dx + dy*dy;
      if (d < minDist) {
	b.group = g.id;
	g.count++;
	return d;
      }
      return minDist;
    }, 1000000000);
    if (b.group != initGroup) nbChange++;
    if (nbChange > maxGroupChange) break;
  }
}

var ctx;
// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  window.setAudioGeometry(width, height, maxSpeed);
}

let offscreen;

// Main animation loop
function animationLoop() {
  computeInfluences();
  applyInfluences();

  updateGroups();

  let boidsInfo = boids.map((b) => {
    return {
      x: b.x,
      y: b.y,
      angle: b.angle,
      group: b.group
    };
  });

  try {
    offscreen = document.getElementById("boids").transferControlToOffscreen();
    graphicsWorker.postMessage({canvas: offscreen}, [offscreen]);
  } catch (e) {}

  graphicsWorker.postMessage({boids: boidsInfo});
  
  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids();

  let startAnim = () => {
    window.requestAnimationFrame(animationLoop);
    document.body.removeEventListener('click', startAnim);
  };
  document.body.addEventListener('click', startAnim);
};
