
class Slime {

  outside = new Set();
  inside = new Array();
  depth = null;
  age = null;
  attract = null;
  nbPoints = 0;
  maxDepth = 0;
  loop = 0;

  growthFactor = .01;
  growthMin = 1;
  growthMax = 30;

  bpm = 60;
  lastBeat = 0;
  beatSharpness = 1.7;
  
  stripeWidth = 10;
  stripeSharpness = 3;

  colors = {
    base: [150, 150, 60],
    range: [20, 40, 10],
    mult: [2, 1, 3],
    edge: [230, 70, 10],
    shadow: [190, 50, 250]
  }

  attractorField = null;
  pairedTime = 0;
  dyingTime = 0;

  totalAge = 0;
  
  constructor (terrain, x, y) {
    const [width, height] = [terrain.length, terrain[0].length];
    this.terrain = new Float32Array(width*height);
    const offset = (height-1)*width;
    // Copy the terrain with borders set to 1e9, so we don't have to
    // worry about edges later, it won't grow there
    for (let i=0; i<width; i++) {
      this.terrain[i] = 1e9;
      this.terrain[i+offset] = 1e9;
    }
    for (let j=1; j<height-1; j++) {
      const o = j*width;
      this.terrain[o] = 1e9;
      this.terrain[o+width-1] = 1e9;
      for (let i=1; i<width-1; i++)
	this.terrain[o+i] = terrain[i][j];
    }
    // Add a fade to white on the edges so it avoids them more naturally
    const borderWidth = 20;
    for (let i=1; i<borderWidth; i++) {
      const add = borderWidth-i;
      const y0 = i, y1 = height-1-i;
      for (let x = i; x < width-i; x++) {
	this.terrain[x + y0*width] += add;
	this.terrain[x + y1*width] += add;
      }
      const x0 = i, x1 = width-1-i;
      for (let y = i+1; y < height-i-1; y++) {
	this.terrain[x0 + y*width] += add;
	this.terrain[x1 + y*width] += add;
      }
    }
    
    this.w = width;
    this.h = height;
    this.attract = new Uint8Array(width*height);
    this.depth = new Uint32Array(width*height);
    this.age = new Uint32Array(width*height);
    const firstPoint = x + y*width;
    this.maxDepth = 1;
    this.inside.push(firstPoint);
    this.outside.add(firstPoint+1);
    this.outside.add(firstPoint-1);
    this.outside.add(firstPoint+width);
    this.outside.add(firstPoint-width);
    this.nbPoints = 1;
    this.age[firstPoint] = 1;
    this.depth[firstPoint] = 1;
  }

  setGrowthSpeed (growthFactor, growthMin, growthMax) {
    this.growthFactor = growthFactor;
    this.growthMin = growthMin;
    this.growthMax = growthMax;
  }

  setAttractorField (cx, cy, rx, ry) {
    const [width, height] = [this.w, this.h];
    this.attractorField = new Float32Array(width*height);
    for (let x=0; x<width; x++) {
      for (let y=0; y<height; y++) {
	const dx = (x-cx)/rx;
	const dy = (y-cy)/ry;
	this.attractorField[x+width*y] = 1 + .5*Math.sqrt(dx*dx + dy*dy);
      }
    }
    console.log('attractor field set');
  }

  releaseAttractorField () {
    this.attractorField = null;
  }
  
  markTaboo (points) {
    const terrain = this.terrain;
    const attract = this.attract;
    const [w, h] = [this.w, this.h];
    for (let p of points) {
      terrain[p] = 1e9;
    }
    const around = [-1, -w, 1, w, w-1, -w-1, -w+1, w+1, w-1, -2, -2*w, 2, 2*w, -2];
    for (let p of points) {
      if (p > 2*w && p < (h-2)*w && p%w > 2 && p%w < w-2) {
	for (let dp of around) {
	  attract[p+dp] = 1;
	  terrain[p+dp] -= 2;
	}
      }
    }
  }
  
  occupiedAround(point) {
    let count = 0;
    const w = this.w;
    for (let p of [point+1, point-1, point+w, point-w]) {
      if (this.age[p]) count++;
    }
    return count;
  }

  die () {
    this.dyingTime = 1;
  }
  
  grow () {
    if (this.dyingTime >= 300) {
      this.dyingTime++;
      return [];
    }
    let candidates = [];
    let chosenCandidates = new Set();
    const terrain = this.terrain;
    const [w, h] = [this.w, this.h];
    let hasAttraction = false;
    for (let p of this.outside) {
      if (this.occupiedAround(p) >= 3) {
	chosenCandidates.add(p);
      } else if (this.attract[p]==1 && terrain[p] < 1000 && (
	this.age[p-1] && (terrain[p-w] > 1000 || terrain[p-w-1] > 1000)
	  || this.age[p-w] && (terrain[p+1] > 1000 || terrain[p+1-w] > 1000)
	  || this.age[p+1] && (terrain[p+w] > 1000 || terrain[p+w+1] > 1000)
	  || this.age[p+w] && (terrain[p-1] > 1000 || terrain[p-1+w] > 1000)
      )) {
	hasAttraction = true;
	let d1 = 2;
	const aMin = Math.max(0, p-d1*w);
	const aMax = Math.min(p+(d1+1)*w, w*h);
	for (let a = aMin; a < aMax; a += w) {
	  let d2 = (a==p-d1*w || a==p+d1*w) ? 2 : 3;
	  const bMin = Math.max(a-d2, a - (a%w));
	  const bMax = Math.min(a+d2+1, a + w - (a%w));
	  for (let b = bMin; b < bMax; b++) {
	    if (terrain[b] < 1000 && !this.age[b]) chosenCandidates.add(b);
	  }
	}
      } else {
	candidates.push(p);
      }
    }
    const growNb = Math.min(this.growthMax, Math.max(this.growthMin, (this.outside.size)*this.growthFactor));
    let nbToAdd = growNb - chosenCandidates.size;
    if (hasAttraction) {
      nbToAdd /= 2;
      this.pairedTime++;
    }
    const width = this.w;
    const height = this.h;
    if (nbToAdd > 0) {
      if (!hasAttraction && this.attractorField) {
	const af = this.attractorField;
	candidates.sort((a, b) => terrain[a]*af[a]-terrain[b]*af[b]);
      } else {
	candidates.sort((a, b) => terrain[a]-terrain[b]);
      }
      for (let i=0; i<nbToAdd; i++) {
	if (terrain[candidates[i]] < 1000) chosenCandidates.add(candidates[i]);
      }
    }

    if (this.dyingTime) {
      const maxGrow = growNb*(1-this.dyingTime/300);
      this.dyingTime++;
      let count = 0;
      for (let p of chosenCandidates) {
        if (count >= maxGrow) break;
        this.inside.push(p);
        count++;
      }
    } else {
      for (let p of chosenCandidates) {
        this.inside.push(p);
      }
    }
    for (let p of this.inside) {
      this.age[p]++;
    }
    this.totalAge++;
    let newBorderPoints = [];
    for (let p of chosenCandidates) {
      this.outside.delete(p);
      for (let v of [p-1, p+1, p-width, p+width]) {
	if (!this.age[v] && !this.outside.has(v)) {
	  this.outside.add(v);
	  newBorderPoints.push(v);
	}
      }
    }
    for (let p of this.inside) {
      this.depth[p] = 1e9;
    }
    const sq2 = Math.SQRT2;
    let toPropagate = this.outside;
    while (toPropagate.size > 0) {
      let newTP = new Set();
      for (let p0 of toPropagate) {
	const d = this.depth[p0];
	for (let p of [p0-1, p0+1, p0-width, p0+width]) {
	  if (this.age[p] && (this.depth[p] > d+1)) {
	    this.depth[p] = d+1;
	    this.maxDepth = d+1;
	    newTP.add(p);
	  }
	}
	for (let p of [p0-width-1, p0-width+1, p0+width-1, p0+width-1]) {
	  if (this.age[p] && (this.depth[p] > d+sq2)) {
	    this.depth[p] = d+sq2;
	    this.maxDepth = d+sq2;
	    newTP.add(p);
	  }
	}
      }
      toPropagate = newTP;
    }
    return Array.from(chosenCandidates);
    // return newBorderPoints;
  }

  
  plot (time, imageData) {
    const lMult = 10;
    const cCount = lMult*this.stripeWidth;
    const period = this.pairedTime > 0 ? 30 / this.bpm : 60 / this.bpm;
    while (time - this.lastBeat >= period) this.lastBeat += period;
    const dt = Math.pow((time - this.lastBeat)/period, 1/this.beatSharpness);

    const lightProgress = Math.min(1, (time + this.pairedTime)/60);
    const sat = .8*lightProgress;
    const light = .4+.5*lightProgress;
    const ave = this.colors.base.reduce((a,x) => a+x, 0) / 3;
    const base = this.colors.base.map(v => light*(ave+sat*(v-ave)));
    const range = this.colors.range.map(v => sat*v);
    
    const colors = [];
    for (let i=0; i<cCount; i++) {
      let col = [];
      this.colors.mult.forEach((m, c) => {
	const x = m*(i/cCount + dt) % 1;
	let v = .5*(1+Math.sin(2*Math.PI*Math.pow(x, this.stripeSharpness)-.5*Math.PI));
	col.push(Math.floor(base[c]+v*range[c]));
      });
      colors.push(col);
    }
    while (colors.length <= lMult*this.maxDepth+2) {
      for (let i=0; i<cCount; i++) {
	colors.push([colors[i][0], colors[i][1], colors[i][2]]);
      }
    }
    for (let i=0; i<lMult; i++) {
      const ratio = .6 + .4*i/lMult;
      for (let c=0; c<3; c++) {
	colors[i][c] = ratio*colors[i][c] + (1-ratio)*this.colors.edge[c];
      }
    }


    const maxAlpha = Math.round(Math.max(140, 200-time));
    if (this.dyingTime) {
      const ta = this.totalAge;
      const dieTime = this.dyingTime;
      const dieThreshold = ta - 3*dieTime;
      for (let p of this.inside) {
	const age = this.age[p];
	const depth = Math.round(lMult*(this.depth[p]-.6)+Math.random());
	let alpha = age < 10 ? Math.floor(maxAlpha*age/10) : maxAlpha;
	if (age > dieThreshold) {
          if (depth < 1)
            alpha = Math.round(maxAlpha*(1-depth));
          else
            alpha = Math.max(0, Math.floor(maxAlpha*(1-(age-dieThreshold)/100)));
	}
	let index = 4*p;
	imageData[index] = colors[depth][0];
	imageData[index+1] = colors[depth][1];
	imageData[index+2] = colors[depth][2];
	imageData[index+3] = alpha;
      }
    } else {
      for (let p of this.inside) {
	const age = this.age[p];
	const depth = Math.round(lMult*(this.depth[p]-.6)+Math.random());
	let alpha = age < 10 ? Math.floor(maxAlpha*age/10) : maxAlpha;
	let index = 4*p;
	imageData[index] = colors[depth][0];
	imageData[index+1] = colors[depth][1];
	imageData[index+2] = colors[depth][2];
	imageData[index+3] = alpha;
      }
    }
    this.loop++;
    
  }
}
