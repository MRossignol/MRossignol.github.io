
class GrowBackground extends BackgroundBase {

  spotGrowTime = 1;
  spotGrowStartScale = .4;
  spotGrowEndScale = 1;
  spotGrowStartAlpha = 0;
  spotGrowEndAlpha = .6;
  spotsPerSecond = 40;
  minRadius = 15;
  maxRadius = 25;
  overlap = .3;

  createdSpots = 0;

  profile = [];

  spots = [
    {name: '01.png', dimensions: [455, 491], center: [238, 233], radius: 110},
    {name: '02.png', dimensions: [544, 743], center: [265, 350], radius: 150},
    {name: '03.png', dimensions: [486, 685], center: [260, 300], radius: 130},
    {name: '04.png', dimensions: [681, 699], center: [350, 300], radius: 160},
    {name: '05.png', dimensions: [555, 678], center: [297, 232], radius: 130},
    {name: '06.png', dimensions: [552, 734], center: [302, 329], radius: 140},
    {name: '07.png', dimensions: [456, 581], center: [257, 262], radius: 120},
    {name: '08.png', dimensions: [427, 415], center: [193, 179], radius: 70},
    {name: '09.png', dimensions: [380, 537], center: [186, 254], radius: 60},
    {name: '10.png', dimensions: [320, 388], center: [148, 168], radius: 60},
    {name: '11.png', dimensions: [403, 460], center: [203, 220], radius: 82},
    {name: '12.png', dimensions: [434, 531], center: [213, 238], radius: 60},
    {name: '13.png', dimensions: [389, 442], center: [151, 203], radius: 82}
  ];
  
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
    this.overlap = options.overlap ?? this.overlap;
    for (let s of this.spots) {
      s.texture = PIXI.Texture.from(`spots/${s.name}`);
    }
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
      this.profile.push({y: 0, object: {growing: false, center: [this.profile.length, 0]}});
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
	x += this.overlap*(o.center[0]-x);
	y += this.overlap*(o.center[1]-y);
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
	this.liveObjects.push(newObj);
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
    let someGrowing = false;
    for (let o of this.liveObjects) {
      if (!o.growing) continue;
      someGrowing = true;
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
    this._finished = this.liveObjects.length && !someGrowing;
  }

  
  
}
