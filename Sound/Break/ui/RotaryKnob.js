class RotaryKnob {

  constructor (min, max, step, size, unit, exp) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.value = min;
    this.exp = exp;
    this.listeners = [];
    this.div = document.createElement('div');
    this.div.classList.add('rotary_knob');
    this.div.style.height = size+'px';
    this.div.style.padding = `0px 0px 0px ${size+4}px`;
    this.graphics = new RotaryKnobGraphics(size, '#448', true);
    this.div.appendChild(this.graphics.canvas);
    this.text = document.createElement('div');
    this.text.classList.add('value');
    this.text.style.height = this.text.style['line-height'] = size+'px';
    this.div.appendChild(this.text);
    if (unit) {
      const u = document.createElement('div');
      u.classList.add('unit');
      u.style.height = u.style['line-height'] = size+'px';
      u.innerHTML = unit;
      this.div.appendChild(u);
    }
    const me = this;
    
    this.div.addEventListener('wheel', (e) => {
      let newVal = me.value;
      if (e.deltaY < 0) {
	if (this.exp) newVal = Math.max(newVal+me.step, newVal*1.01);
	else newVal += me.step;
      } else {
	if (this.exp) newVal = Math.min(newVal-me.step, newVal/1.01);
	else newVal -= me.step;
      }
      me.setValue(newVal);
    });
    
    this.text.addEventListener('click', () => {
      me.setValue(prompt('Enter new value', me.value));
    });
    
    this.graphics.canvas.addEventListener('mousedown', (e) => me.startDrag(e));
  }

  setValue(value, notify) {
    const v = roundStep(value, this.step, this.min, this.max);
    this.value = v;
    this.text.innerHTML = v;
    this.graphics.setValue(v, this.min, this.max, this.exp);
    if (notify) {
      for (let l of this.listeners) l(v);
    }
  }

  startDrag (e) {
    if (this.dragDiv) this.endDrag();
    this.dragDiv = document.createElement('div');
    this.dragDiv.classList.add('overlay');
    document.body.appendChild(this.dragDiv);
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startVal = this.value;
    const me = this;
    this.dragDiv.addEventListener('mousemove', (e) => me.doDrag(e), true);
    this.dragDiv.addEventListener('mouseup', (e) => me.endDrag(e), true);
  }

  dragValue (e) {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const delta = dx-dy; // Math.abs(dx) > Math.abs(dy) ? dx : -dy;
    if (this.exp) {
      if (delta > 0)
	return this.startVal * Math.pow(1.01, .5*delta);
      else
	return this.startVal / Math.pow(1.01, -.5*delta);
    } else {
      return this.startVal + .2*delta*this.step;
    }
  }
  
  doDrag (e) {
    this.setValue(this.dragValue(e), false);
    e.preventDefault();
  }
  
  endDrag (e) {
    document.body.removeChild(this.dragDiv);
    this.dragDiv = null;
    if (!e) return;
    this.setValue(this.dragValue(e), true);
    e.preventDefault();
  }
  
}
