
(function() {

  let ac = new AudioContext();

  let workletSources = ['NoiseGenerator.js'];

  let bpm = 60;
  let beat = 60.0/bpm;
  let dt = 1;
  let attack = .2;
  let release = 2;
  let decayVal = .7;
  let decayTime = .3;
  let width = .3;
  let vibratoDepth = 1.05;

  let transpose = 2;

  let harmonics = [
    {mult:1, gain: 24, stage1Q: 10},
    {mult:2, gain: 0, stage1Q: 10}
  ];

  let strings = [1, .98, 1.02];

  Promise.all(workletSources.map(file => ac.audioWorklet.addModule(file))).then(() => {

    let nodes = [];

    let notes = [
      {start: 0,  duration: 10, freq: [['A2', 0], ['C3', 2]]},
      {start: 4,  duration: 6, freq: [['G2', 0], ['F2', 2]]},
      {start: 8,  duration: 10, freq: [['A2', 0], ['b2', 1.5], ['d3', 4.5]]},
      {start: 11, duration: 7, freq: [['G2', 0], ['B2', 1.5]]}
    ];
    notes.sort((a,b) => a.start-b.start);

    for (let n of notes) {
      let last = null;
      for (let ft of n.freq) {
	ft[0] = transpose*noteToHz(ft[0]);
	if (last) {
	  if (last.length < 3) {
	    if (ft[1]-last[1] < 1) {
	      last[2] = (ft[1] + last[1])/2;
	    } else {
	      last[2] = ft[1]-.5;
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
    let nd = {
      filterLines: [],
      gain: new GainNode(ac),
      busyUntil: 0
    };
    nd.gain.gain.setValueAtTime(0, 0);
    nd.gain.connect(ac.destination);

    for (let sMult of strings) {
      let noise = new AudioWorkletNode(ac, 'NoiseGenerator', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount:[2]});
      noise.parameters.get("width").setValueAtTime(width, 0);
      for (let harm of harmonics) {
	let filterLine = {
	  fMult: sMult*harm.mult,
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
    nodeData.gain.gain.setValueAtTime(0, t0-attack);
    nodeData.gain.gain.linearRampToValueAtTime(0.01, t0-attack+.01);
    nodeData.gain.gain.exponentialRampToValueAtTime(1, t0);
    nodeData.gain.gain.exponentialRampToValueAtTime(decayVal, t0+decayTime);
    nodeData.gain.gain.setValueAtTime(decayVal, t0+duration-release);
    nodeData.gain.gain.exponentialRampToValueAtTime(.01, t0+duration-.01);
    nodeData.gain.gain.linearRampToValueAtTime(0, t0+duration);

    // Frequency
    for (let filterLine of nodeData.filterLines) {
      for (let node of filterLine.nodes) {
	node.frequency.setValueAtTime(filterLine.fMult*note.freq[0][0], t0-attack);
      }
    }
    note.freq.forEach(([f, t, e]) => {
      t = t0 + t*beat;
      e = t0 + e*beat;
      for (let filterLine of nodeData.filterLines) {
	let period = .05+.05*Math.random();
	let hf = filterLine.fMult*f;
	for (let filter of filterLine.nodes) {
	  filter.frequency.exponentialRampToValueAtTime(hf, t);
	  if (e>t) vibrato(filter.frequency, hf, period, t, e);
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
