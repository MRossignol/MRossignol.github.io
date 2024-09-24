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
    this.gradient.addColorStop(0, 'rgb(0, 50, 0)');
    this.gradient.addColorStop(0.3, 'rgb(0, 200, 0)');
    this.gradient.addColorStop(0.7, 'rgb(220, 220, 0)');
    this.gradient.addColorStop(1, 'rgb(255, 0, 0)');
  }

  addPoint(data) {
    if (this.xScale < 0 && data.buffer.length > 0) {
      this.nbPoints = Math.floor((this.rangeSeconds*this.sr) / data.buffer[0].length);
      this.xScale = this.canvas.width / this.nbPoints;
      this.yScale = this.canvas.height;
    }
    this.values.push(data.instantMax);
  }

  draw() {
    if (this.values.length > this.nbPoints) {
      this.values = this.values.slice(this.values.length-this.nbPoints, this.values.length);
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.gradient;
    const width = Math.max(this.xScale, 1);
    this.values.forEach((v, i) => {
      this.context.fillRect(i*this.xScale, this.canvas.height-v*this.yScale, width, v*this.yScale);
    });
  }
  
}
