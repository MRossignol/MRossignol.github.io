
(function() {

  let ac = new AudioContext();

  let workletSources = ['NoisyOscillator.js'];

  Promise.all(workletSources.map(file => ac.audioWorklet.addModule(file))).then(() => {

    let oscil = new AudioWorkletNode(ac, 'NoisyOscillator', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount:[1]});

    let gain = new GainNode(ac, {gain:.01});

    let chords = [
      [0, 3, 7],
      [-1, 2, 7],
      [2, 7],
      [0, 3, 7],
      [-2, 3, 7],
      [-2, 2, 5],
      [0, 3, 7]
    ];

    const baseF = 1760;

    let t = 1;
    for (let i=0; i<1000; i++) {
      let d = Math.floor(10*Math.random());
      switch(d) {
      case 0:
      case 1: d = 0; break;
      case 5:
      case 6:
      case 1: d = .05; break;
      case 2: d = .2; break;
      case 3: 
      default: d = .1; 
      }
      if (d>0) {
	let c = chords[Math.floor(t/2) % chords.length];
	let note = c[Math.floor(c.length*Math.random())];
	let f = baseF*Math.pow(2, note/12);
	oscil.parameters.get("frequency").exponentialRampToValueAtTime(2*f, t);
	oscil.parameters.get("frequency").exponentialRampToValueAtTime(f, t+.03);
	oscil.parameters.get("frequency").setValueAtTime(f, t+d-.03);
	gain.gain.exponentialRampToValueAtTime(1, t);
	gain.gain.exponentialRampToValueAtTime(.5, t+d/2);
	gain.gain.linearRampToValueAtTime(.01, t+d-.02);
      } else {
	d = Math.random()<.5 ? .1 : .05;
      }
      t += d;
    }

    let f = new BiquadFilterNode(ac, {type:'lowpass', frequency:1000});
    f.frequency.setValueAtTime(100, 1);
    f.frequency.exponentialRampToValueAtTime(15000, 20);
    
    oscil.connect(gain);
    gain.connect(f);
    f.connect(ac.destination);
  });


  globalThis.startAudio = () => {
    ac.resume();
  };
    
})();

