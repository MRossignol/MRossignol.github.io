
// let followChangeProb = .5;
// let holdChangeProb = .2;

// let maxSlope = .03;

// const s_follow = 0;
// const s_hold = 1;
// const s_converge = 2;

// function applyDistortion (audioBuffer) {
//   let nbChannels = audioBuffer.numberOfChannels;
//   let channels = [];
//   let lastVal = [];
//   for (let c=0; c<nbChannels; c++) {
//     channels.push(audioBuffer.getChannelData(c));
//     lastVal.push(0);
//   }
//   let stage = s_follow;
//   for (let i=0, l=channels[0].length; i<l; i++) {
//     let changeStage = false;
//     switch(stage) {
//     case s_follow:
//       for (let c=0; c<nbChannels; c++)
// 	lastVal[c] = channels[c][i];
//       // do nothing to audio, just check if we must change
//       changeStage = Math.random() < followChangeProb;
//       break;
//     case s_hold:
//       for (let c=0; c<nbChannels; c++)
// 	channels[c][i] = lastVal[c];
//       changeStage = Math.random() < holdChangeProb;
//       break;
//     case s_converge:
//       changeStage = true;
//       for (let c=0; c<nbChannels; c++) {
// 	if (lastVal[c]-channels[c][i] > maxSlope) {
// 	  lastVal[c] -= maxSlope;
// 	  channels[c][i] = lastVal[c];
// 	  changeStage = false;
// 	} else if (channels[c][i]-lastVal[c] > maxSlope) {
// 	  lastVal[c] += maxSlope;
// 	  channels[c][i] = lastVal[c];
// 	  changeStage = false;
// 	} else {
// 	  lastVal[c] = channels[c][i];
// 	}
//       }
//     }
//     if (changeStage) {
//       stage = (stage+1) % 3;
//     }
//   }
// }


let ac = new AudioContext();

let song, distortion, gain, hpf;

ac.audioWorklet.addModule('sampleHoldProcessor.js').then(() => {

  distortion = new AudioWorkletNode(ac, 'SampleHoldDistortion', {numberOfOutputs: 1, outputChannelCount: [2], parameterData:{maxConvergeSlope: 0.1, followEndProbability: 0.5, holdEndProbability: 0.1}});
  gain = new GainNode(ac, {gain: 1});
  hpf = new BiquadFilterNode(ac, {frequency: 3200, type:"highpass", Q: 1});

  distortion.connect(gain);
  gain.connect(hpf);
  hpf.connect(ac.destination);
});

window.addEventListener('DOMContentLoaded', () => {

  let songBuffer;
  
  document.querySelector('input#fileInput').addEventListener('change', () => {
    document.querySelector('input#playButton').disabled = true;
    document.querySelector('input#saveButton').disabled = true;
    let reader = new FileReader();
    reader.onload = function(ev) {
      ac.decodeAudioData(ev.target.result).then(function(buffer) {
	songBuffer = buffer;
	document.querySelector('input#playButton').disabled = false;
	document.querySelector('input#saveButton').disabled = false;
      });
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
  });

  document.querySelector('input#playButton').addEventListener('click', () => {
    ac.resume();
    song = new AudioBufferSourceNode(ac, {buffer: songBuffer});
    song.playbackRate.value = document.querySelector('input#speedControl').value / 30;
    song.connect(distortion);
    song.start();
  });
  
  document.querySelector('input#saveButton').addEventListener('click', () => {
    let oac = new OfflineAudioContext(2, songBuffer.length+100, ac.sampleRate);
    oac.audioWorklet.addModule('sampleHoldProcessor.js').then(() => {
      let song = new AudioBufferSourceNode(oac, {buffer: songBuffer});
      let distortion = new AudioWorkletNode(oac, 'SampleHoldDistortion', {parameterData:{
	maxConvergeSlope: Math.max(document.querySelector('input#maxSlopeControl').value / 100, .001),
	followEndProbability: Math.max(document.querySelector('input#followEndControl').value / 100, .001),
	holdEndProbability: Math.max(document.querySelector('input#holdEndControl').value / 100, .001)
      }});
      let hpf = new BiquadFilterNode(oac, {
	type:"highpass",
	frequency: 100*Math.pow(2, document.querySelector('input#hpfControl').value / 15),
	Q: document.querySelector('input#hpfqControl').value / 10
      });
      song.connect(distortion);
      distortion.connect(hpf);
      hpf.connect(oac.destination);
    
      song.playbackRate.value = document.querySelector('input#speedControl').value / 30;
      song.start();
      oac.startRendering().then( function(buffer) {
	var max = 0, amp, c, data;
	for (c = 0; c<buffer.numberOfChannels; c++) {
	  data = buffer.getChannelData(c);
	  data.forEach(function(v) {
	    if (Math.abs(v) > max) max = Math.abs(v);
	  });
	}
	amp = .8 / max;
	for (c=0; c<buffer.numberOfChannels; c++) {
	  data = buffer.getChannelData(c);
	  data.forEach(function(v, i) {
	    data[i] = v*amp;
	  });
	}
	let waveWriter = new WaveWriter(buffer);
	waveWriter.saveWaveFile('distorted.wav');
      });
    });
  });
  

  document.querySelector('input#followEndControl').addEventListener('input', (e) => {
    let p = Math.max(e.target.value / 100, .001);
    distortion.parameters.get('followEndProbability').value = p;
    document.querySelector('td#followEndValue').innerHTML = p.toFixed(3);
  });

  document.querySelector('input#holdEndControl').addEventListener('input', (e) => {
    let p = Math.max(e.target.value / 100, .001);
    distortion.parameters.get('holdEndProbability').value = p;
    document.querySelector('td#holdEndValue').innerHTML = p.toFixed(3);
  });

  document.querySelector('input#maxSlopeControl').addEventListener('input', (e) => {
    let p = Math.max(e.target.value / 100, .001);
    distortion.parameters.get('maxConvergeSlope').value = p;
    document.querySelector('td#maxSlopeValue').innerHTML = p.toFixed(3);
  });

  document.querySelector('input#speedControl').addEventListener('input', (e) => {
    let s = e.target.value / 30;
    if (song) song.playbackRate.value = s;
    document.querySelector('td#speedValue').innerHTML = s.toFixed(3);
  });

  document.querySelector('input#gainControl').addEventListener('input', (e) => {
    let s = Math.pow(2, e.target.value / 20);
    gain.gain.value = s;
    document.querySelector('td#gainValue').innerHTML = s.toFixed(3);
  });

  document.querySelector('input#hpfControl').addEventListener('input', (e) => {
    let f = 100*Math.pow(2, e.target.value / 15);
    hpf.frequency.value = f;
    document.querySelector('td#hpfValue').innerHTML = Math.round(f);
  });

  document.querySelector('input#hpfqControl').addEventListener('input', (e) => {
    let q = e.target.value/10;
    hpf.Q.value = q;
    document.querySelector('td#hpfqValue').innerHTML = q.toFixed(3);
  });
  
});
