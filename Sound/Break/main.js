
const knob = new RotaryKnob(20, 10000, 1, 24, 'Hz', true);

window.addEventListener('load', function () {
  document.body.appendChild(knob.div);
  knob.setValue(100);
});
