
class SlimeManager {

  slimeWorker = new Worker('slimeWorker2.js');

  initResolve = null;
  growResolve = null;
  imgData = null;

  constructor() {
    this.slimeWorker.onmessage = (e) => {
      switch (e.data.status) {
      case 'ready':
	this.initResolve();
	break;
      case 'grown':
	this.growResolve(e.data);
	break;
      case 'drawn':
	this.imgData = e.data.imgData;
	this.drawResolve(e.data);
      }
    };
  }

  setGrowthSpeed(growthFactor, growthMin, growthMax) {
    this.slimeWorker.postMessage({
      operation: 'speed',
      factor: growthFactor,
      min: growthMin,
      max: growthMax
    });
  }

  setBPM (bpm) {
    this.slimeWorker.postMessage({
      operation: 'bpm',
      bpm: bpm
    });
  }

  setColors (colors) {
    this.slimeWorker.postMessage({
      operation: 'colors',
      colors: colors
    });
  }

  markTaboo(points) {
    this.slimeWorker.postMessage({
      operation: 'taboo',
      points: points
    });
  }

  setAttractor(cx, cy, rx, ry) {
    this.slimeWorker.postMessage({
      operation: 'setAttractor',
      cx: cx,
      cy: cy,
      rx: rx,
      ry: ry
    });
  }

  releaseAttractor () {
    this.slimeWorker.postMessage({
      operation: 'releaseAttractor'
    });
  }
  
  init (terrain, x, y, imgData) {
    let initPromise = new Promise((resolve, reject) => {
      this.initResolve = resolve;
    });
    this.imgData = imgData;
    this.slimeWorker.postMessage({
      operation: 'init',
      terrain: terrain,
      x: x,
      y: y
    });
    return initPromise;
  }

  grow () {
    let growPromise = new Promise((resolve, reject) => {
      this.growResolve = resolve;
    });
    this.slimeWorker.postMessage({
      operation: 'grow'
    });
    return growPromise;
  }
  
  draw (time) {
    let drawPromise = new Promise((resolve, reject) => {
      this.drawResolve = resolve;
    });
    this.slimeWorker.postMessage({
      operation: 'draw',
      time: time,
      imgData: this.imgData
    }, [
      this.imgData.data.buffer
    ]);
    return drawPromise;
  }
  
  die () {
    this.slimeWorker.postMessage({
      operation: 'die'
    });
  }

}
