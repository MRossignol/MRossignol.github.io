
class BackgroundBase {

  
  app = null;
  freezeApp = null;
  frozenSceneTexture = null;
  appStartTime = 0;
  lastFreezeTime = 0;

  liveObjects = [];

  _finished = false;

  
  constructor (options) {
    let bgColor = options['bgColor'] ?? '#000';
    this.app = new PIXI.Application({
      background: bgColor,
      antialias: false,
      transparent: false,
      autoStart: false,
      resizeTo: window});
    this.freezeApp = new PIXI.Application({
      background: bgColor,
      antialias: false,
      autoStart: false,
      backgroundAlpha: 0,
      clearBeforeRender: false,
      preserveDrawingBuffer: true,
      resizeTo: window});
    this.app.render();
    this.app.view.backgroundObject = this;
    this.frozenSceneTexture = PIXI.Texture.from(this.freezeApp.view);
    this.freezeApp.render();
    this.frozenSceneTexture.update();
    this.app.stage.addChild(new PIXI.Sprite(this.frozenSceneTexture));
    this.app.ticker.add(() => this.step());
  }


  get exposedOptions () {
    return {
      bgColor: 'color'
    };
  }
  
  
  get referenceTime () {
    return Date.now();
  }

  
  get currentTime () {
    return this.referenceTime - this.appStartTime;
  }


  run () {
    this.appStartTime = this.referenceTime;
    this.app.start();
  }


  show () {
    let existing = document.querySelectorAll('canvas.backgroundAnimation');
    this.app.view.classList.add('backgroundAnimation');
    document.body.insertBefore(this.app.view, document.body.firstChild);
    if (existing.length) {
      for (let i=0; i<existing.length-1; i++) {
	existing[i].backgroundObject.instantDestroy();
      }
      existing.pop().remove();
    }
  }


  instantDestroy() {
    try {
      this.app.stop();
      document.body.removeChild(this.app.view);
    } catch (e) {}
  }
  

  remove () {
    this.app.view.addEventListener('transitionend', () => {
      try {
	this.app.stop();
	document.body.removeChild(this.app.view);
      } catch (e) {}
    });
    this.app.view.style.transition = 'all 1s';
    this.app.view.style.opacity = 0;
  }

  
  objectIsStable (o, time) {
    return false;
  }


  stepStart () {
  }

  
  stepEnd () {
  }


  addObjects () {
  }


  updateObjects () {
  }
  

  freezeStableObjects () {
    const t = this.currentTime;
    if (t - this.lastFreezeTime < .5) return;
    this.lastFreezeTime = t;
    let newLiveObjects = [];
    this.freezeApp.stage.removeChildren();
    for (let o of this.liveObjects) {
      if (this.objectIsStable(o, t)) {
	this.freezeApp.stage.addChild(o.sprite);
	this.app.stage.removeChild(o.sprite);
      } else {
	newLiveObjects.push(o);
      }
    }
    this.liveObjects = newLiveObjects;
    this.freezeApp.renderer.render(this.freezeApp.stage, {clear: false});
    this.frozenSceneTexture.update();
  }


  step() {
    if (this._finished) {
      this.app.stop();
      return;
    }
    this.stepStart();
    this.addObjects();
    this.updateObjects();
    this.freezeStableObjects();
    this.stepEnd();
  }
  
}
