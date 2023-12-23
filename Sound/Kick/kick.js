
var bpm = 360;
var period = 60/bpm;

CurveEditor.setDefaults({ bgColor: '#201830', gridColor: '#555', lineColor: '#ddd', lineThickness: 2, textColor: '#ddd', dotSize: 8, dotColor: '#49b', loopConnect: true});

var properties = [
  {key: 'mix', type: 'slider', name:'Mix', unit:'dB', min: -100, max: 0, step: .5, scale: 'lin'},
  {key: "frequency", name: "Frequency", type: 'curve', curveData: {
    hMin: 0,
    hMax: period,
    vMin: 10,
    vMax: 20000,
    vScale: 'log',
    hLabel: 'Time (s)', 
    vLabel: 'Frequency (Hz)',
    init:[{vx:0, vy:25}, {vx:period, vy:25}]
  }},
  {key: "gain", name: "Envelope", type: 'curve', curveData: {
    hMin: 0,
    hMax: period,
    vMin: -80,
    vMax: 0,
    vScale: 'lin',
    hLabel: 'Time (s)', 
    vLabel: 'Amplitude (dB)',
    init:[{vx:0, vy:-80}, {vx:0.005, vy:0}, {vx:period, vy:-80}]
  }},
  {key: "lpf", name: "LPF", type: 'curve', curveData: {
    hMin: 0,
    hMax: period,
    vMin: 10,
    vMax: 20000,
    vScale: 'log',
    hLabel: 'Time (s)', 
    vLabel: 'Frequency (Hz)',
    init:[{vx:0, vy:20000}, {vx:period, vy:20000}]
  }},
  {key: "hpf", name: "HPF", type: 'curve', curveData: {
    hMin: 0,
    hMax: period,
    vMin: 10,
    vMax: 20000,
    vScale: 'log',
    hLabel: 'Time (s)', 
    vLabel: 'Frequency (Hz)',
    init:[{vx:0, vy:10}, {vx:period, vy:10}]
  }}
];

var generators = [
  {name: "Noise",    mix: -12,                gain: {}, lpf: {}, hpf: {}},
  {name: "Square",   mix: -12, frequency: {}, gain: {}, lpf: {}, hpf: {}},
  {name: "Sawtooth", mix: -12, frequency: {}, gain: {}, lpf: {}, hpf: {}},
  {name: "Triangle", mix: -12, frequency: {}, gain: {}, lpf: {}, hpf: {}}
];

function getStateToSave() {
  return generators.map (function(g) {
    var res = {mix: g.mix};
    ['frequency', 'gain', 'lpf', 'hpf'].forEach(function(k) {
      if (g.hasOwnProperty(k)) res[k] = g[k].toString();
    });
    return res;
  });
}

function applySavedState (preset) {
  generators.forEach(function(g,i) {
    let settings = preset.values[i];
    g.mix = settings.mix;
    if (g.mixSlider) g.mixSlider.value = g.mix;
    if (g.mixValue) g.mixValue.innerHTML = g.mix + ' dB';
    ['frequency', 'gain', 'lpf', 'hpf'].forEach(function(k) {
      if (g.hasOwnProperty(k)) g[k].loadString(settings[k]);
    });
  });
}

var ac = new AudioContext();

var playing = false;
  
var noiseBufferSize = 100000;
  
var noise = new Float32Array(noiseBufferSize);
for (var i=0; i<noiseBufferSize; i++) {
  noise[i] = 2*Math.random()-1;
}

var noiseBuffer = new AudioBuffer({
  channelCount: 1,
  numberOfChannels: 1,
  length: noiseBufferSize,
  sampleRate: ac.sampleRate
});
noiseBuffer.copyToChannel(noise, 0);


window.addEventListener('load', function () {
  
  let presetsSelector = new PresetsSelector (
    new PresetManager('kickLocalPresets', defaultPresets),
    document.getElementById('presetsGoHere'),
    getStateToSave,
    applySavedState
  );

  setTimeout(function() {
    presetsSelector.loadPreset('Basic kick');
  });
  
  var table = document.getElementById("settingsTable");

  var line = document.createElement("tr");
  table.appendChild(line);
  var td = document.createElement("td");
  line.appendChild(td);
  generators.forEach (function(g) {
    td = document.createElement("td");
    td.innerText = g.name;
    line.appendChild(td);
    td.classList.add('generatorName');
  });

  properties.forEach (function(p) {
    line = document.createElement("tr");
    table.appendChild(line);
    td = document.createElement("td");
    td.innerText = p.name;
    line.appendChild(td);
    td.classList.add('settingName');
    generators.forEach (function(g) {
      td = document.createElement("td");
      if (g.hasOwnProperty(p.key)) {
	switch (p.type) {
	case 'slider':
	  var slider = document.createElement('input');
	  g[p.key+'Slider'] = slider;
	  slider.type='range';
	  if (p.scale == 'lin') {
	    slider.min = p.min;
	    slider.max = p.max;
	    slider.step = p.step;
	    slider.value = g[p.key];
	  } else {
	    slider.min = Math.log(p.min);
	    slider.max = Math.log(p.max);
	    slider.step = .0001;
	    slider.value = Math.log(g[p.key]);
	  }
	  td.appendChild(slider);
	  var valueDiv = document.createElement('div');
	  g[p.key+'Value'] = valueDiv;
	  td.appendChild (valueDiv);
	  valueDiv.classList.add('valueDiv');
	  valueDiv.innerText = g[p.key]+' '+p.unit;
	  slider.addEventListener('input', function () {
	    var val = 1.0*slider.value;
	    if (p.scale == 'exp') {
	      val = Math.exp(val);
	      val = p.step*Math.round(val/p.step);
	    }
	    g[p.key] = val;
	    valueDiv.innerText = val + ' ' + p.unit;
	  });
	  break;
	case 'curve':
	  var curveDiv = document.createElement('div');
	  td.appendChild (curveDiv);
	  curveDiv.classList.add('curveDiv');
	  setTimeout(function() { g[p.key] = new CurveEditor(curveDiv, p.curveData); });
	  break;
	}
      }
      line.appendChild(td);
      td.classList.add('settingValue');
    });
  });
  
  document.getElementById("playPauseButton").addEventListener("click", function() {
    if (playing) {
      stopPlaying();
    } else {
      startPlaying();
    }
  });
  
});

function startPlaying () {
  if (playing) return;
  document.getElementById("playPauseButton").value = "Stop";
  playing = true;
  schedule(ac.currentTime);
}

function stopPlaying () {
  if (!playing) return;
  document.getElementById("playPauseButton").value = "Play";
  playing = false;
}


function dBToAmp (db) {
    return Math.pow(10, db/20);
}

function ampTodB (amp) {
    return 20*Math.log10(amp);
}

function schedule(time) {
  if (!playing) return;
  
  period = 60/bpm;
  // if (document.getElementById('doubleSpeedCheck').checked) period /= 2;
  // var freeze = document.getElementById('freezeCheck').checked;
  
  setTimeout(function() {
    schedule(time+period);
  }, 1000*(time-ac.currentTime-.1));

  renderBuffer(function(buffer) {
    var sourceNode = new AudioBufferSourceNode(ac, {
      loop: false,
      channelCount: 1,
      buffer: buffer
    });
    sourceNode.connect(ac.destination);
    sourceNode.start(time);
    setTimeout(function() {
      sourceNode.disconnect();
    }, 1000*(time+period-ac.currentTime)+50);
  });
}

function renderBuffer (onDone) {
  var audioContext = new OfflineAudioContext ({
    numberOfChannels: 1,
    sampleRate: ac.sampleRate,
    length: ac.sampleRate*(period+.01)
  });

  generators.forEach(function(g) {
    if (g.mix == -100) return;
    
    var sourceNode;
    if (g.name == "Noise") {
      sourceNode = new AudioBufferSourceNode(audioContext, {
	loop: false,
	channelCount: 1,
	buffer: noiseBuffer
      });
    } else {
      g.frequency.setHMax(period);
      var freqCurve = g.frequency.getCurve();
      sourceNode = new OscillatorNode (audioContext, {
	type: g.name.toLowerCase(),
	channelCount: 1,
	frequency: freqCurve[0].vy
      });
      freqCurve.forEach(function(p) {
	sourceNode.frequency.exponentialRampToValueAtTime(p.vy, p.vx);
      });
    }
    
    var amp = dBToAmp(g.mix);
    g.gain.setHMax(period);
    var gainCurve = g.gain.getCurve();
    var gainNode = new GainNode(audioContext, {gain: amp*dBToAmp(gainCurve[0].vy)});
    gainCurve.forEach(function(p) {
      gainNode.gain.exponentialRampToValueAtTime(amp*dBToAmp(p.vy), p.vx);
    });
    gainNode.gain.exponentialRampToValueAtTime(.000000001, period+.01);
    
    g.lpf.setHMax(period);
    var lpfCurve = g.lpf.getCurve();
    var lpfNode = new BiquadFilterNode(audioContext, {
      type: "lowpass",
      frequency: lpfCurve[0].vy,
      Q: 0
    });
    lpfCurve.forEach(function(p) {
      lpfNode.frequency.exponentialRampToValueAtTime(p.vy, p.vx);
    });

    g.hpf.setHMax(period);
    var hpfCurve = g.hpf.getCurve();
    var hpfNode = new BiquadFilterNode(audioContext, {
      type: "highpass",
      frequency: hpfCurve[0].vy,
      Q: 0
    });
    hpfCurve.forEach(function(p) {
      hpfNode.frequency.exponentialRampToValueAtTime(p.vy, p.vx);
    });

    sourceNode.connect(gainNode);
    gainNode.connect(lpfNode);
    lpfNode.connect(hpfNode);
    hpfNode.connect(audioContext.destination);

    if (g.name == 'Noise') {
      sourceNode.start(0, Math.random());
    } else {
      sourceNode.start(0);
    }
    sourceNode.stop(period+.01);
  });
    
  audioContext.startRendering().then( function(buffer) {
    var max = 0, amp, data = buffer.getChannelData(0);
    data.forEach(function(v) {
      if (Math.abs(v) > max) max = Math.abs(v);
    });
    amp = .9 / max;
    data.forEach(function(v, i) {
      data[i] = v*amp;
    });
    onDone(buffer);
  });
}

const defaultPresets = [
  {name: 'Basic kick',
   values: [
     {mix: -11.5, gain: '0 -80 0 0 0.05 -55 0.125 -80', lpf: '0 2035 0.125 2035', hpf: '0 10 0.125 10'},
     {mix: -2.5, frequency: '0 35 0.125 35', gain: '0 -13 0.005 0 0.125 -13', lpf: '0 74 0.007 2170 0.125 74', hpf: '0 28 0.125 28'},
     {mix: -13, frequency: '0 32.54 0.125 32.54', gain: '0 -45 0.084 -13 0.125 -45', lpf: '0 1110 0.125 1110', hpf: '0 15.3 0.125 15.3'},
     {mix: -1.5,frequency: '0 56 0.02 164 0.035 73 0.041 99 0.051 48 0.0778 20 0.0913 44.3 0.108 40.7 0.125 56', gain: '0 -63 0.013 -6.9 0.101 -21.8 0.125 -63',lpf: '0 250 0.125 250',hpf: '0 10 0.125 10'}]
  }
];
