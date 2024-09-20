
class Slime {

  outside = null;
  inside = [];
  coverage = null;
  nbPoints = 0;
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  maxDepth = 0;
  loop = 0;

  constructor (terrain, x, y) {
    this.terrain = terrain;
    this.w = this.terrain.length;
    this.h = this.terrain[0].length;
    let firstPoint = [ x, y, 1, 0 ]; // x, y, age, depth
    this.maxDepth = 0;
    this.inside = [firstPoint];
    this.outside = new PointSet();
    this.outside.add([ [x+1, y], [x-1, y], [x, y-1], [x, y+1] ]);
    this.nbPoints = 1;
    this.coverage = [];
    for (let i=0; i<this.w; i++) {
      let newCol = [];
      for (let j=0; j<this.h; j++) {
        newCol.push(null);
      }
      this.coverage.push(newCol);
    }
    this.coverage[x][y] = firstPoint;
    this.lastGrow = firstPoint;
  }
  
  isBorder(x, y) {
    return !(this.coverage[x-1][y] && this.coverage[x+1][y] && this.coverage[x][y-1] && this.coverage[x][y-1]);
  }

  // return true iff depth changes
  updateDepth (point) {
    let [x, y, age, depth] = point;
    let minNeighbourDepth = depth;
    for (let [a,b] of [ [x,y-1], [x,y+1], [x-1,y], [x+1,y] ] ) {
      if (this.coverage[a][b]) {
	if (this.coverage[a][b][3] < minNeighbourDepth)
	  minNeighbourDepth = this.coverage[a][b][3];
      } else {
	minNeighbourDepth = -1;
	break;
      }
    }
    let d = minNeighbourDepth+1;
    if (d > this.maxDepth) this.maxDepth = d;
    point[3] = d;
  }

  occupiedAround(point) {
    let [x,y] = point;
    let count = 0;
    for (let [i,j] of [[x+1, y], [x-1, y], [x, y+1], [x, y-1]]) {
      if (this.coverage[i][j]) count++;
    }
    return count;
  }
  
  grow (factor, min, max) {
    let candidates = [];
    let sureCandidates = [];
    for (let p of this.outside) {
      if (this.occupiedAround(p) >= 3) {
	sureCandidates.push(p);
      } else {
	candidates.push(p);
      }
    }
    const growNb = Math.min(max, Math.max(min, (sureCandidates.length + candidates.length)*factor));
    const nbToAdd = growNb - sureCandidates.length;
    if (nbToAdd > 0) {
      candidates.sort((a, b) => b[2]-a[2]);
      for (let i=0; i<nbToAdd; i++) sureCandidates.push(candidates[i]);
    }
    candidates = sureCandidates;
    let toAdd = candidates.map(p => {
      let newPoint = [p[0], p[1], 0, 0];
      this.coverage[p[0]][p[1]] = newPoint;
      this.updateDepth(newPoint);
      return newPoint;
    });
    
    for (let p of this.inside) {
      this.updateDepth(p);
    }
    this.inside = this.inside.concat(toAdd);
    // Age increase
    for (let p of this.inside) {
      p[2]++;
    }
    let newOutside = [];
    for (let p of candidates) {
      let [x,y] = p;
      if (x > 1 && !this.coverage[x-1][y]) newOutside.push([x-1, y, this.terrain[x-1][y]]);
      if (x < this.w-2 && !this.coverage[x+1][y]) newOutside.push([x+1, y, this.terrain[x+1][y]]);
      if (y > 1 && !this.coverage[x][y-1]) newOutside.push([x, y-1, this.terrain[x][y-1]]);
      if (y < this.h-2 && !this.coverage[x][y+1]) newOutside.push([x, y+1, this.terrain[x][y+1]]);
    }
    this.outside.remove(candidates);
    this.outside.add(newOutside);
    return candidates;
  }

  drawShadow(ctx) {
    ctx.filter = 'blur(1px)';
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'rgb(20, 255, 180)';
    ctx.beginPath();
    for (let p of this.outside) {
      if (!p[3]) {
	p[3] = 1;
	ctx.moveTo(p[0], p[1]);
	ctx.arc(p[0], p[1], 2, 0, 2*Math.PI);
      }
    }
    ctx.fill();
  }
  
  drawSlime (ctx) {
    // ctxt.filter = 'blur(0px)';
    let l = Math.floor(this.loop/20);
    for (let d = this.maxDepth; d>=0; d--) {
      let r = Math.floor(100+100*(((d+l)%8)/8));
      let g = Math.floor(120+100*(((d+l)%4)/4));
      let b = Math.floor(50+50*(((d+l)%2)/2));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      if (d==0) {
	ctx.fillStyle = `rgb(255, 80, 0)`;
	ctx.filter = 'blur(0px)';
      }
      for (let p of this.inside) {
	if (p[3] == d) {
	  ctx.globalAlpha = Math.min(1, p[2]/10);
	  ctx.fillRect(p[0], p[1], 1, 1);
	}
      }
    }
    this.loop++;
  }

  
  plotSlime (imageData) {
    let l = Math.floor(this.loop/2);
    let width = this.w;
    let colors = [
      [255, 80, 0]
    ];
    for (let d=1; d<=this.maxDepth; d++) {
      colors.push([
	Math.floor(100+100*(((d+l)%8)/8)),
	Math.floor(120+100*(((d+l)%4)/4)),
	Math.floor(50+50*(((d+l)%2)/2))
      ]);
    }
    if (this.maxDepth > 0) {
      colors[1][0] = Math.floor(.5*(colors[0][0]+colors[1][0]));
      colors[1][1] = Math.floor(.5*(colors[0][1]+colors[1][1]));
      colors[1][2] = Math.floor(.5*(colors[0][2]+colors[1][2]));
    }
    for (let p of this.inside) {
      let [x, y, age, depth] = p;
      let alpha = age < 10 ? Math.floor(255*age/10) : 255;
      let index = (x + y * width) * 4;
      imageData[index] = colors[depth][0];
      imageData[index+1] = colors[depth][1];
      imageData[index+2] = colors[depth][2];
      imageData[index+3] = 255;
    }
    this.loop++;
  }
}
