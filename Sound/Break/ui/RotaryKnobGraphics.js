class RotaryKnobGraphics {

  constructor (size, baseColor, dark) {
    this.size = size;
    this.baseColor = baseColor;
    this.dark = dark;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = size;
    this.canvas.style.width = this.canvas.style.height = size+'px';
    this.context = this.canvas.getContext('2d');
  }

  setValue (val, min, max, exp) {
    const minAngle = 2.3*Math.PI;
    const maxAngle = .7*Math.PI;
    let angle = 0;
    if (exp) {
      const k = max / min;
      const position = 1 - (Math.log(val)-Math.log(min)) / Math.log(k);
      angle = minAngle + position*(maxAngle-minAngle);
    } else {
      const increment = (maxAngle-minAngle) / (max-min);
      angle = minAngle + (max-val)*increment;
    }
    const radius = this.size/2;
    const border = radius/8;
    const c = this.context;
    c.clearRect(0, 0, this.size, this.size);
    c.beginPath();
    c.arc(radius, radius, radius-1, 0, 2*Math.PI);
    c.fillStyle = this.baseColor;
    c.fill();
    c.beginPath();
    c.arc(radius, radius, radius-1, 0, 2*Math.PI);
    c.fillStyle = 'rgba(255, 255, 255, .2)';
    c.fill();
    c.beginPath();
    c.arc(radius+border, radius+border, radius-border, 0, 2*Math.PI);
    c.fillStyle = 'rgba(0, 0, 0, .5)';
    c.fill();
    c.beginPath();
    c.arc(radius, radius, radius-2*border, 0, 2*Math.PI);
    c.fillStyle = this.baseColor;
    c.fill();
    c.beginPath();
    c.moveTo(radius+1.5*border*Math.cos(angle), radius+1.5*border*Math.sin(angle));
    c.lineTo(radius+(radius-border-1)*Math.cos(angle), radius+(radius-border-1)*Math.sin(angle));
    c.lineWidth = radius/6;
    c.strokeStyle = 'rgba(255, 255, 255, .7)';
    c.stroke();
  }
  
}
