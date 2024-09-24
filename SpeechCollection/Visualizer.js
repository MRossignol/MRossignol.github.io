class Visualizer {

  width = 0;
  height = 0;
  xScale = -1;
  yScale = -1;
  nbPoints = 0;
  values = [];
  
  constructor(canvas, sampleRate, rangeSeconds) {
    this.canvas = canvas;
    canvas.width = canvas.clientWidth*window.devicePixelRatio;
    canvas.height = canvas.clientHeight*window.devicePixelRatio;
    this.sr = sampleRate;
    this.rangeSeconds = rangeSeconds;
    this.context = this.canvas.getContext('2d');
    this.gradient = this.context.createLinearGradient(0, this.canvas.height-1, 0, 0);
    this.gradient.addColorStop(0, 'rgb(220, 220, 255)');
    this.gradient.addColorStop(0.3, 'rgb(150, 150, 255)');
    this.gradient.addColorStop(0.7, 'rgb(100, 100, 255)');
    this.gradient.addColorStop(1, 'rgb(200, 0, 0)');
  }

  addPoint(data) {
    if (this.xScale < 0 && data.buffer.length > 0) {
      this.nbPoints = Math.floor((this.rangeSeconds*this.sr) / data.buffer[0].length);
      this.xScale = this.canvas.width / this.nbPoints;
      this.yScale = this.canvas.height;
    }
    this.values.push(Math.random());
    // this.values.push(data.instantMax);
  }

  draw() {
    if (this.values.length > this.nbPoints) {
      this.values = this.values.slice(this.values.length-this.nbPoints, this.values.length);
    }
    const ctxt = this.context;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const xScale = this.xScale;
    const yScale = this.yScale;
    ctxt.clearRect(0, 0, w, h);
    ctxt.fillStyle = this.gradient;
    const stepW = Math.max(1.5*this.xScale, 1);
    ctxt.globalAlpha = 0.5;
    this.values.forEach((v, i) => {
      ctxt.fillRect(i*xScale, h-v*yScale, stepW, v*yScale);
    });
    ctxt.globalAlpha = 1;
    this.values.forEach((v, i) => {
      ctxt.fillRect(i*xScale, h-v*yScale, stepW, 1);
    });
  }
  
}
