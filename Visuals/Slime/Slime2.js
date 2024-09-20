
class Slime {

  outside = null;
  inside = null;
  coverage = null;
  nbPoints = 0;
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;

  constructor (terrain, x, y) {
    this.terrain = terrain;
    this.w = this.terrain.length;
    this.h = this.terrain[0].length;
    let firstPoint = [ x, y, 1, 1 ];
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
    this.coverage[firstPoint[0]][firstPoint[1]] = firstPoint;
    this.lastGrow = firstPoint;
  }
  
  isBorder(x, y) {
    return !(this.coverage[x-1][y] && this.coverage[x+1][y] && this.coverage[x][y-1] && this.coverage[x][y-1]);
  }

  bestAround(point) {
    let [x, y] = point;
    let bestX = 0, bestY = 0, bestV = 1000;
    if (y > 0 && !this.coverage[x][y-1] && this.terrain[x][y-1] < bestV) {
      bestX = x;
      bestY = y-1;
      bestV = this.terrain[x][y-1];
    }
    if (y < this.h-1 && !this.coverage[x][y+1] && this.terrain[x][y+1] < bestV) {
      bestX = x;
      bestY = y+1;
      bestV = this.terrain[x][y+1];
    }
    if (x > 0 && !this.coverage[x-1][y] && this.terrain[x-1][y] < bestV) {
      bestX = x-1;
      bestY = y;
      bestV = this.terrain[x-1][y];
    }
    if (x < this.w-1 && !this.coverage[x+1][y] && this.terrain[x+1][y] < bestV) {
      bestX = x+1;
      bestY = y;
      bestV = this.terrain[x+1][y];
    }
    return [bestX, bestY, bestV];
  }
  
  grow (factor, min, max) {
    let candidates = [];
    for (let p of this.outside) {
      candidates.push([p[0], p[1], this.terrain[p[0]][p[1]]]);
    }
    const growNb = Math.min(max, Math.max(min, candidates.length*factor));
    candidates.sort((a, b) => b[2]-a[2]);
    candidates = candidates.slice(0, growNb);
    this.outside.add(candidates);
    let newOutside = [];
    for (let p of candidates) {
      let [x,y] = p;
      let newPoint = [x, y, 1, 1];
      this.inside.push(newPoint);
      this.coverage[x][y] = newPoint;
      this.nbPoints++;
      if (x > 1 && !this.coverage[x-1][y]) newOutside.push([x-1, y]);
      if (x < this.w-2 && !this.coverage[x+1][y]) newOutside.push([x+1, y]);
      if (y > 1 && !this.coverage[x][y-1]) newOutside.push([x, y-1]);
      if (y < this.h-2 && !this.coverage[x][y+1]) newOutside.push([x, y+1]);
    }
    this.outside.remove(candidates);
    this.outside.add(newOutside);
    return candidates;
  }
  
}
