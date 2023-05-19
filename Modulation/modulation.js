
let ac = new AudioContext();

let lfo = new OscillatorNode(ac, {type: 'sawtooth', frequency: 40, detune: 1});

let offset = new ConstantSourceNode(ac, {offset: 1});

let normalizer = new GainNode(ac, {gain: 0.5});

let carrier = new OscillatorNode(ac, {type: 'square', frequency: 60});

let lfoGain = new GainNode(ac, {gain: 0});

lfo.connect(normalizer);
offset.connect(normalizer);
lfo.connect(lfoGain.gain);
carrier.connect(lfoGain);
lfoGain.connect(ac.destination);

lfo.start();
carrier.start();


let rendered = null;

let playRendered = () => {
  let audioCtx = new AudioContext();
  const song = audioCtx.createBufferSource();
  song.buffer = rendered;
  song.connect(audioCtx.destination);
  song.start();
};

window.addEventListener('DOMContentLoaded', () => {
  
  let button = document.createElement('input');
  button.type = 'button';
  button.value = 'Play';
  button.addEventListener('click', () => {
    ac.resume();
  });
  
  document.body.appendChild(button);
  
});
