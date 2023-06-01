
class GrowBackground extends BackgroundBase {

  growTime = 1000;
  growStartScale = .4;
  growEndScale = 1;
  growStartAlpha = 0;
  growEndAlpha = .6;
  objectsPerSecond = 40;
  minRadius = 15;
  maxRadius = 25;

  createdObjects = 0;
  
  constructor(options) {
    super(options);
    this.growTime = options.growTime ?? this.growTime;
    this.growStartScale = options.growStartScale ?? this.growStartScale;
    this.growEndScale = options.growEndScale ?? this.growEndScale;
    this.growStartAlpha = options.growStartAlpha ?? this.growStartAlpha;
    this.growEndAlpha = options.growEndAlpha ?? this.growEndAlpha;
    this.objectsPerSecond = options.objectsPerSecond ?? this.objectsPerSecond;
    this.minRadius = options.minRadius ?? this.minRadius;
    this.maxRadius = options.maxRadius ?? this.maxRadius;
  }

  get exposedOptions () {
    let options = super.exposedOptions;
    options.growTime = 'milliseconds';
    options.growStartScale = 'scale';
    options.growEndScale = 'scale';
    options.growStartAlpha = 'alpha';
    options.growEndAlpha = 'alpha';
    options.objectsPerSecond = 'rate';
    options.minRadius = 'pixels';
    options.maxRadius = 'pixels';
    return options;
  }

  objectIsStable (o, time) {
    return !o.growing;
  }
  
  stepStart() {
  }
  
  addObjects () {
    const now = this.currentTime;
    const neededObjects = Math.round(this.objectsPerSecond * now);
    const w = this.app.view.width;
    const h = this.app.view.height;
    for (; this.createdObjects < neededObjects; this.createdObjects++) {
      let radius = this.minRadius + (this.maxRadius - this.minRadius) * Math.random();
      let x = w*Math.random();
      let y = h*Math.random();
      let newObj = {
	startTime: now,
	growing: true,
	center: [x, y /* % canvas.height */],
	radius: radius,
	scale: radius / spot.radius,
	angle: 2*Math.PI*Math.random(),
	sprite: new PIXI.Graphics()
      };
      newObj.sprite.moveTo(0,0);
      newObj.sprite.lineTo(1,1);
      this.objects.push(newObj);
      this.app.stage.addChild(newObj.sprite);
    }
  }

  updateObjects () {
    const now = this.currentTime;
    for (let o of this.objects) {
      if (!o.growing) continue;
      if (now - o.startTime > this.growTime) {
	o.growing = false;
	o.sprite.scale.set(o.scale * this.growEndScale);
	o.sprite.alpha = this.growEndAlpha;
      } else {
	let ratio = (now-o.startTime)/this.growTime;
	let smoothRatio = .5*(1+Math.cos(Math.PI*(1-ratio)));
	o.sprite.scale.set(o.scale * (this.growStartScale + smoothRatio*(this.growEndScale-this.growStartScale)));
	o.sprite.alpha = this.growStartAlpha + smoothRatio*(this.growEndAlpha-this.growStartAlpha);
      }
    }
  }

  
  
}
