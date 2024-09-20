
class SlimeManager {

  slimeWorker = new Worker('slimeWorker.js');

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
	this.imgData = e.data.imgData;
	this.growResolve(e.data);
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

  step (time) {
    let growPromise = new Promise((resolve, reject) => {
      this.growResolve = resolve;
    });
    this.slimeWorker.postMessage({
      operation: 'grow',
      time: time,
      imgData: this.imgData
    }, [
      this.imgData.data.buffer
    ]);
    return growPromise;
  }
  
}
