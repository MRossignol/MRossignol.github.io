
class WaveDisplay {

  scale = 1;
  minScale = 1;
  dragInitialX = 0;
  lookAtTime = 0;
  oldLookAtTime = 0;

  wglp = null;
  rootDiv = null;
  canvas = null;

  canvasWidth = 0;
  canvasLeft = 0;

  dpr = 1;

  zones = [];

  audio = null;

  mouseWheelCB = (e) => this.mouseWheel(e);
  mouseDownCB = (e) => this.mouseDown(e);
  mouseMoveCB = (e) => this.mouseMove(e);
  mouseUpCB = (e) => this.mouseUp(e);
  dblClickCB = (e) => this.dblClick(e);

  tToX = (t) => this.canvasWidth*((t-this.lookAtTime)*this.scale+.5);
  
  // x = this.canvasWidth*((t-this.lookAtTime)*this.scale+.5)
  // x / this.canvasWidth = (t-this.lookAtTime)*this.scale+.5
  // (x / canvasWidth - .5) / this.scale = t-this.lookAtTime
  // t = this.lookAtTime + (x / canvasWidth - .5) / this.scale
  xToT = (x) => this.lookAtTime + (x / this.canvasWidth - .5) / this.scale;
  
  tDisplay = (x) => {
    let s = `${this.xToT(x)+.0005}`, res = '', pos = 0;
    for (; pos<s.length && s[pos]!='.'; pos++) res += s[pos];
    res += '.';
    s = s.substr(pos+1);
    switch(s.length) {
    case 0: return res + '000';
    case 1: return res + `${s}00`;
    case 2: return res + `${s}0`;
    default: return res + s.substring(0,3);
    }
  };
  
  
  constructor (div, w, h) {

    this.dpr = window.devicePixelRatio ?? 1;
    this.rootDiv = div;

    let bcr = div.getBoundingClientRect();
    
    w = w ?? bcr.width;
    h = h ?? bcr.height;
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = w * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.height = (h-100) * this.dpr;
    this.canvas.style.height = (h-100) + 'px';
    div.appendChild(this.canvas);

    this.canvasHeight = h-100;
    this.canvasWidth = w;
    this.canvasLeft = bcr.left;

    this.wglp = new WebglPlot(this.canvas, {bgColor: new ColorRGBA(.9, .92, .9, 1)});
    
    this.canvas.addEventListener("wheel", this.mouseWheelCB);
    this.canvas.addEventListener("mousedown", this.mouseDownCB);
    this.canvas.addEventListener("dblclick", this.dblClickCB);
    this.canvas.style.cursor = "zoom-in";
  }

  loadData (audio) {

    this.clearZones();
    
    this.audio = audio;

    let data = audio.getData();
    
    this.wglp.removeAllLines();
    
    let baseLine = new WebglLine(new ColorRGBA(0.6, 0.6, 0.6, 1), 2);
    baseLine.loop = false;
    baseLine.xy = (new Float32Array([-.5, 0, audio.duration+.5, 0]));
    this.wglp.addLine(baseLine);
    
    let line = new WebglLine(new ColorRGBA(.2, 0, .5, 1), data.length);
    line.replaceArrayY(data);
    line.lineSpaceX(0, 1 / audio.sampleRate);
    this.wglp.addLine(line);
  
    // Scale and center
    let ceilDur = Math.ceil(audio.duration);
    this.scale = this.minScale = 1/ceilDur;
    this.wglp.gScaleX = this.scale;
    this.lookAt(ceilDur/2);
    
    this.update();
  }

  _addWebGlZone (start, end) {
    let rect = new WebglLine(new ColorRGBA(0.1, 0.6, 0.2, 1), 4);
    rect.loop = true;
    rect.xy = new Float32Array([start, -1, start, 1, end, 1, end, -1]);
    this.wglp.addAuxLine(rect);
  }

  _updateZonesGlDisplay () {
    this.wglp.removeAuxLines();
    for (let z of this.zones) {
      this._addWebGlZone(z.start, z.end);
    }
    this.update();
  }

  _updateZonesControlDisplay () {
    for (let z of this.zones) {
      z.div.style.left = Math.round(this.canvasWidth*((z.start-this.lookAtTime)*this.scale+.5))+'px';
      z.dragLeft.setX(this.canvasWidth*((z.start-this.lookAtTime)*this.scale+.5));
      z.dragRight.setX(this.canvasWidth*((z.end-this.lookAtTime)*this.scale+.5));
    }
  }
  
  _addZone (zone) {
    let div = document.createElement('div');
    div.classList.add('label');
    div.style.top = (this.canvasHeight+50)+'px';
    div.innerHTML = `${zone.parameter}: ${zone.valueInRecording} &#x23ef;`;
    this.rootDiv.appendChild(div);
    zone.div = div;
    div.addEventListener('click', () => {
      this.audio.playZone(zone.start, zone.end);
    });
    zone.dragLeft = new DragHandle(this.rootDiv, (x) => {
      zone.start = this.xToT(x);
      for (let z of this.zones) {
	if (z != zone && Math.abs(z.end-zone.start)<.005) zone.start = z.end;
      }
      if (zone.start > zone.end - 0.01) {
	zone.start = zone.end - 0.01;
      }
      zone.div.style.left = this.tToX(zone.start)+'px';
      this._updateZonesGlDisplay();
      return this.tToX(zone.start);
    }, this.tDisplay, (x) => {
      this.audio.playCut(this.xToT(x));
    }, this.mouseWheelCB);
    zone.dragLeft.div.style.height = this.canvasHeight+'px';
    zone.dragRight = new DragHandle(this.rootDiv, (x) => {
      zone.end = this.xToT(x);
      for (let z of this.zones) {
	if (z != zone && Math.abs(z.start-zone.end)<.005) zone.end = z.start;
      }
      if (zone.end < zone.start + 0.01) {
	zone.end = zone.start + 0.01;
      }
      this._updateZonesGlDisplay();
      return this.tToX(zone.end);
    }, this.tDisplay, (x) => {
      this.audio.playCut(this.xToT(x));
    }, this.mouseWheelCB);
    zone.dragRight.div.style.height = this.canvasHeight+'px';
  }

  clearZones() {
    for (let z of this.zones) {
      console.log(z);
      if (z.div) this.rootDiv.removeChild(z.div);
      if (z.dragLeft) z.dragLeft.remove();
      if (z.dragRight) z.dragRight.remove();
    }
    this.zones = [];
  }
  
  setZones (zones) {
    this.clearZones();
    this.zones = zones;
    let zi = zones.length;
    for (let z of zones) {
      this._addZone(z);
      z.div.style['z-index'] = zi--;
    }
    this._updateZonesGlDisplay();
    this._updateZonesControlDisplay();
  }

  update() {
    requestAnimationFrame(() => {
      this._updateZonesControlDisplay();
      this.wglp.update();
    });
  }

  lookAt (time) {
    this.lookAtTime = time;
    this.wglp.lookAt(time);
  }

  moveLookAt (dt) {
    this.lookAtTime += dt;
    this.wglp.lookAt(this.lookAtTime);
  }
  
  dblClick (e) {
    e.preventDefault();
    this.scale = this.minScale;
    this.wglp.gScaleX = this.scale;
    this.lookAt(.5/this.scale);
    this.update();
  }

  mouseDown (e) {
    e.preventDefault();
    let x = e.clientX-this.canvasLeft;
    document.body.style.cursor = "grabbing";
    this.canvas.style.cursor = "grabbing";
    this.dragInitialX = x * this.dpr;
    this.oldLookAtTime = this.lookAtTime;
    document.body.addEventListener('mousemove', this.mouseMoveCB);
    document.body.addEventListener('mouseup', this.mouseUpCB);
  }

  mouseMove (e) {
    e.preventDefault();
    let x = e.clientX-this.canvasLeft;
    const dx = (x * this.dpr - this.dragInitialX)/this.canvas.width;
    this.lookAt(this.oldLookAtTime - dx/this.scale);
    this.update();
  }

  mouseUp (e) {
    e.preventDefault();
    document.body.style.cursor = '';
    this.canvas.style.cursor = "zoom-in";
    document.body.removeEventListener('mousemove', this.mouseMoveCB);
    document.body.removeEventListener('mouseup', this.mouseUpCB);
  }

  mouseWheel (e) {
    e.preventDefault();
    if (e.shiftKey) {
      this.moveLookAt((e.deltaY > 0 ? .04 : -.04)/this.scale);
    }
    else {
      let x = e.clientX-this.canvasLeft;
      let dx = x / this.canvas.width - .5;
      let oldScale = this.scale;
      if (e.deltaY < 0)
	this.scale *= 1.25;
      else
	this.scale /= 1.25;
      this.scale = Math.max(this.minScale, this.scale);
      this.wglp.gScaleX = this.scale;
      if (this.scale > this.minScale) {
	this.moveLookAt(dx/oldScale - dx/this.scale);
      }
      if (this.lookAtTime < .5/this.scale) {
	this.lookAt(.5/this.scale);
      } else if (this.lookAtTime > (this.scale/this.minScale - .5)/this.scale) {
	this.lookAt((this.scale/this.minScale - .5)/this.scale);
      }
    }
    this.update();
  }
  
}
