
(function() {

  let ac = new AudioContext();

  let workletSources = ['NoiseGenerator.js', 'AdaptiveSaturation.js'];

  let bpm = 60;
  let beat = 60.0/bpm;
  let dt = 1;
  let attack = .05;
  let release = 2;
  let decayVal = .7;
  let decayTime = .3;
  let width = .1;
  let vibratoDepth = 1.003;
  let amp = 0.4;

  let transpose = 2;

  let harmonics = [
    {mult:1, gain: 36, stage1Q: 1}
  ];

  let strings = [0, -.5, .7];

  Promise.all(workletSources.map(file => ac.audioWorklet.addModule(file))).then(() => {

    let nodes = [];

    let notes = [
      {start: 0,  duration: 4, freq: [['A0', 0], ['E0', 2]]},
      {start: 2,  duration: 4, freq: [['B0', 0], ['C0', 2]]},
      {start: 4,  duration: 4, freq: [['A0', 0], ['E0', 2]]},
      {start: 6,  duration: 4, freq: [['B0', 0], ['C0', 2]]},
      {start: 8,  duration: 4, freq: [['A0', 0], ['E0', 2]]},
      {start: 10,  duration: 4, freq: [['B0', 0], ['C0', 2]]},
      {start: 12,  duration: 4, freq: [['A0', 0], ['E0', 2]]},
      {start: 14,  duration: 4, freq: [['B0', 0], ['C0', 2]]}
    ];
    notes.sort((a,b) => a.start-b.start);

    for (let n of notes) {
      let last = null;
      for (let ft of n.freq) {
	ft[0] = transpose*noteToHz(ft[0]);
	if (last) {
	  if (last.length < 3) {
	    if (ft[1]-last[1] < .5) {
	      last[2] = (ft[1] + last[1])/2;
	    } else {
	      last[2] = ft[1]-.25;
	    }
	  }
	}
	last = ft;
      }
      if (last.length < 3) {
	last[2] = n.duration;
      }
    }

    for (let note of notes) {
      let t0 = dt + note.start*beat;
      let nodeData = nodes.find(n => n.busyUntil < t0-attack-.01);
      if (!nodeData) {
	nodeData = makeNodeData();
	nodes.push(nodeData);
      }
      scheduleNoteOnNode(note, nodeData);
    }
        
  });

  globalThis.startAudio = () => {
    ac.resume();
  };

  function makeNodeData() {
    let saturation = new AudioWorkletNode(ac, 'AdaptiveSaturation', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount:[2]});
    saturation.parameters.get("strength").setValueAtTime(0, 0);
    saturation.parameters.get("threshold").setValueAtTime(1, 0);
    saturation.parameters.get("strength").linearRampToValueAtTime(4, 30);
    saturation.parameters.get("threshold").linearRampToValueAtTime(1, 30);
    let nd = {
      filterLines: [],
      gain: new GainNode(ac),
      saturation: saturation,
      busyUntil: 0
    };
    nd.gain.gain.setValueAtTime(0, 0);
    nd.gain.connect(nd.saturation);
    nd.saturation.connect(ac.destination);

    for (let sAdd of strings) {
      let noise = new AudioWorkletNode(ac, 'NoiseGenerator', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount:[2]});
      noise.parameters.get("width").setValueAtTime(width, 0);
      for (let harm of harmonics) {
	let filterLine = {
	  fAdd: sAdd,
	  fMult: harm.mult,
	  saturation: saturation,
	  nodes: []
	};
	filterLine.nodes.push(new BiquadFilterNode(ac, {type: 'bandpass', Q: harm.stage1Q}));
	filterLine.nodes.push(new BiquadFilterNode(ac, {type: 'bandpass', Q: 3}));
	if (harm.gain > 0) {
	  filterLine.nodes.push(new BiquadFilterNode(ac, {type: 'peaking', Q: 20, gain: harm.gain}));
	}
	let last = noise;
	for (let node of filterLine.nodes) {
	  last.connect(node);
	  last = node;
	}
	last.connect(nd.gain);
	nd.filterLines.push(filterLine);
      }
    }
    console.log(nd);
    return nd;
  }

  function scheduleNoteOnNode (note, nodeData) {
    let t0 = dt + note.start*beat;
    let duration = note.duration*beat;

    // Envelope
    console.log(amp);
    nodeData.gain.gain.setValueAtTime(0, t0-attack);
    nodeData.gain.gain.linearRampToValueAtTime(0.01*amp, t0-attack+.01);
    nodeData.gain.gain.exponentialRampToValueAtTime(amp, t0);
    nodeData.gain.gain.exponentialRampToValueAtTime(decayVal*amp, t0+decayTime);
    nodeData.gain.gain.setValueAtTime(decayVal*amp, t0+duration-release);
    nodeData.gain.gain.exponentialRampToValueAtTime(.01*amp, t0+duration-.01);
    nodeData.gain.gain.linearRampToValueAtTime(0, t0+duration);

    // Frequency
    for (let filterLine of nodeData.filterLines) {
      for (let node of filterLine.nodes) {
	node.frequency.setValueAtTime(filterLine.fMult*note.freq[0][0]+filterLine.fAdd, t0-attack);
      }
    }
    note.freq.forEach(([f, t, e]) => {
      t = t0 + t*beat;
      e = t0 + e*beat;
      nodeData.saturation.parameters.get("f0").exponentialRampToValueAtTime(f, t);
      for (let filterLine of nodeData.filterLines) {
	let period = .02+.02*Math.random();
	let hf = filterLine.fMult*f+filterLine.fAdd;
	for (let filter of filterLine.nodes) {
	  filter.frequency.exponentialRampToValueAtTime(hf, t);
	  // if (e>t) vibrato(filter.frequency, hf, period, t, e);
	  if (e>t) filter.frequency.setValueAtTime(hf, e);
	}
      }
    });

    nodeData.busyUntil = t0 + duration;
  }

  function vibrato (parameter, centerVal, period, start, end) {
    let high = true;
    for (let vt = start+period; vt < end; vt += period) {
      if (high)
	parameter.linearRampToValueAtTime(centerVal*vibratoDepth, vt);
      else
	parameter.linearRampToValueAtTime(centerVal/vibratoDepth, vt);
      high = !high;
    }

  }
    
})();
