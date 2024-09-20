
class Slime {

  border = [];
  inside = [];

  constructor (terrain) {
    this.terrain = terrain;
    this.w = this.terrain.length;
    this.h = this.terrain[0].length;
    this.border.push([
      10+Math.floor(Math.random()*(this.w-20)),
      10+Math.floor(Math.random()*(this.h-20))
    ]);
    this.coverage = [];
    for (let i=0; i<this.w; i++) {
      let newCol = [];
      for (let j=0; j<this.h; j++) {
        newCol.push(null);
      }
      this.coverage.push(newCol);
    }
    this.coverage[this.border[0][0]][this.border[0][1]] = this.border[0];
    this.lastGrow = this.border[0];
  }

  isPoint(x, y) {
    return x>=0 && x<this.width && y>=0 && y<this.height && this.coverage[x][y];
  }
  
  isBorder(x, y) {
    if (x<0 || y<0 || x>=this.w || y>=this.h) return false;
    if (x>0 && !this.coverage[x-1][y]) return true;
    if (x<this.w-1 && !this.coverage[x+1][y]) return true;
    if (y>0 && !this.coverage[x][y-1]) return true;
    if (y<this.h-1 && !this.coverage[x][y-1]) return true;
    return false;
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
  
  grow () {
    let [bestX, bestY, bestV] = this.bestAround(this.lastGrow);
    // bestV *= .3;
    for (let point of this.border) {
      let [bX, bY, bV] = this.bestAround(point);
      if (bV < bestV) {
        bestX = bX;
        bestY = bY;
        bestV = bV;
      }
    }
    let newPoint = [bestX, bestY];
    this.coverage[bestX][bestY] = newPoint;
    if (this.isBorder(bestX, bestY))
      this.border.push(newPoint);
    else
      this.inside.push(newPoint);
    for (let pos of [[bestX-1, bestY], [bestX+1, bestY], [bestX, bestY-1], [bestX, bestY+1]]) {
      let [x,y] = pos;
      if (this.isPoint(x, y) && !this.isBorder(x, y)) {
        let p = this.coverage[x][y];
        this.border = this.border.filter(a => a != p);
        this.inside.push(p);
      }
    }
    this.lastGrow = newPoint;
    return newPoint;
  }
  
}
