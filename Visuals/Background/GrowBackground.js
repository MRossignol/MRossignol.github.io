
class GrowBackground extends BackgroundBase {

  spotGrowTime = 1000;
  spotGrowStartScale = .4;
  spotGrowEndScale = 1;
  spotGrowStartAlpha = 0;
  spotGrowEndAlpha = .6;
  spotsPerSecond = 40;
  minRadius =15;
  maxRadius = 25;

  createdSpot = 0;

  profile = [];
  
  constructor(options) {
    super(options);
    this.spotGrowTime = options.spotGrowTime ?? this.spotGrowTime;
    this.spotGrowStartScale = options.spotGrowStartScale ?? this.spotGrowStartScale;
    this.spotGrowEndScale = options.spotGrowEndScale ?? this.spotGrowEndScale;
    this.spotGrowStartAlpha = options.spotGrowStartAlpha ?? this.spotGrowStartAlpha;
    this.spotGrowEndAlpha = options.spotGrowEndAlpha ?? this.spotGrowEndAlpha;
    this.spotsPerSecond = options.spotsPerSecond ?? this.spotsPerSecond;
    this.minRadius = options.minRadius ?? this.minRadius;
    this.maxRadius = options.maxRadius ?? this.maxRadius;
  }

  get exposedOptions () {
    let options = super.exposedOptions;
    options.spotGrowTime = 'milliseconds';
    options.spotGrowStartScale = 'ratio';
    options.spotGrowEndScale = 'ratio';
    options.spotGrowStartAlpha = 'alpha';
    options.spotGrowEndAlpha = 'alpha';
    options.spotsPerSecond = 'number';
    options.minRadius = 'pixels';
    options.maxRadius = 'pixels';
    return options;
  }

  objectIsStable (o, time) {
    return !o.growing;
  }
  
  stepStart() {
    const w = this.app.view.width;
    while (this.profile.length < w) {
      this.profile.push({y: 0, object: {growing: false, center: [i, 0]}});
    }
  }
  
  addObjects () {
    const now = this.currentTime;
    const neededSpots = Math.round(this.spotsPerSecond * now);
    const w = this.app.view.width;
    for (; this.createdSpots < neededSpots; this.createdSpots++) {
      let radius = this.minRadius + (this.maxRadius - this.minRadius) * Math.random();
      let x = this.app.view.width*Math.random();
      let y = 0, o = null;
      for (let i=Math.max(Math.floor(x-radius), 0), max=Math.min(Math.ceil(x+radius), w-1); i<max; i++) {
	if (this.profile[i].y >= y) {
	  y = this.profile[i].y;
	  o = this.profile[i].object;
	}
      }
      if (y < window.innerHeight+100 /* !o.growing */ ) {
	x += (o.center[0]-x)/3;
	y += (o.center[1]-y)/3;
	let spot = this.spots[Math.floor(this.spots.length*Math.random())];
	let newObj = {
	  startTime: now,
	  growing: true,
	  center: [x, y /* % canvas.height */],
	  radius: radius,
	  scale: radius / spot.radius,
	  angle: 2*Math.PI*Math.random(),
	  sprite: new PIXI.Sprite(spot.texture)
	};
	newObj.sprite.anchor.set(spot.center[0]/spot.dimensions[0], spot.center[1]/spot.dimensions[1]);
	newObj.sprite.rotation = newObj.angle;
	newObj.sprite.x = x;
	newObj.sprite.y = y;
	this.objects.push(newObj);
	this.app.stage.addChild(newObj.sprite);
	for (let i=Math.max(Math.ceil(x-radius), 0), max=Math.min(Math.floor(x+radius), w-1); i<max; i++) {
	  let topY = y + Math.sqrt(radius*radius - (x-i)*(x-i));
	  if (topY > this.profile[i].y) this.profile[i] = {y:topY, object: newObj};
	}
      }
    }
  }

  updateObjects () {
    const now = this.currentTime;
    for (let o of this.objects) {
      if (!o.growing) continue;
      if (now - o.startTime > this.spotGrowTime) {
	o.growing = false;
	o.sprite.scale.set(o.scale * this.spotGrowEndScale);
	o.sprite.alpha = this.spotGrowEndAlpha;
      } else {
	let ratio = (now-o.startTime)/this.spotGrowTime;
	let smoothRatio = .5*(1+Math.cos(Math.PI*(1-ratio)));
	o.sprite.scale.set(o.scale * (this.spotGrowStartScale + smoothRatio*(this.spotGrowEndScale-this.spotGrowStartScale)));
	o.sprite.alpha = this.spotGrowStartAlpha + smoothRatio*(this.spotGrowEndAlpha-this.spotGrowStartAlpha);
      }
    }
  }

  
  
}
