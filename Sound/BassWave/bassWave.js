
let sr = 48000;

let nbOscils = 512;

let period = 12;

// 11.169430726450985
// 12.228128862918004
// 11.541729489832269
// 11.461966354765423
// 12.455129319841722
// 11.142415450727523
// 11.791080145689971
// 12.647085516748225
// 11.72112048348872
// 12.259564948654736
// 11.39828129459222
// 11.845303761277052
// 11.624582047399004
// 11.937785018234951
// 12.833132200436006
// 12.101331134176672
// 12.590916457458402
// 11.575196793759853
// 16.36058228113418
// 19.901712401250006

let notes = [55, 55, 55, 55, 55];
let factor = 1/Math.pow(2, 1/12);
for (let i=0; i<15; i++) {
  notes.push(notes[notes.length-1]*factor);
}
let nbWaves = notes.length;

let stereoWidth = [.3, .3, .3, .3, .3];
for (let i=0; i<15; i++) {
  stereoWidth.push(stereoWidth[stereoWidth.length-1]*1.08);
}
console.log(stereoWidth);

let baseF = notes[0];

let waveBuffer = new AudioBuffer({length: Math.round(sr/baseF), numberOfChannels: 1, sampleRate: sr});
waveBuffer.getChannelData(0).fill(0);
waveBuffer.getChannelData(0)[0] = 1;
waveBuffer.getChannelData(0)[1] = -1;

let oscilShape = 'sawtooth';

let minVol = -50;
let splashVol = 0;
let splashPos = .4;
let splashRand = 1.4;
let preSplashVol = -21;
let preSplashPos = .6;

let oscils = [];
let gains = [];
let gainBase = [];

let ac = new OfflineAudioContext(2, Math.round(sr*period*(nbWaves+2)), sr);

let output = new ChannelMergerNode(ac, {numberOfInputs: 2});

let preSplashFilter = new BiquadFilterNode(ac, {type: 'bandpass', frequency: 400, Q:1});
let splashFilter = new BiquadFilterNode(ac, {type: 'lowpass', frequency: 9000, Q: 0});
let hissFilter = new BiquadFilterNode(ac, {type: 'highpass', frequency: 5000, Q: 0});
let whistleFilter = new BiquadFilterNode(ac, {type: 'bandpass', frequency: 4000, Q: 30});

output.connect(preSplashFilter);
output.connect(splashFilter);
output.connect(hissFilter);
output.connect(whistleFilter);

let preSplashGain = new GainNode(ac, {gain: 0});
let splashGain = new GainNode(ac, {gain: 0});
let hissGain = new GainNode(ac, {gain: 0});
let whistleGain = new GainNode(ac, {gain: 0});

preSplashFilter.connect(preSplashGain);
splashFilter.connect(splashGain);
hissFilter.connect(hissGain);
whistleFilter.connect(whistleGain);

preSplashGain.connect(ac.destination);
splashGain.connect(ac.destination);
hissGain.connect(ac.destination);
whistleGain.connect(ac.destination);



for (let i=0; i<nbOscils; i++) {
  oscils[i] = new OscillatorNode(ac, {channelCount: 1, type: oscilShape, frequency: baseF, detune: -20+40*randBm()});
  gains[i] = [];
  for (let c of [0,1]) {
    gains[i][c] = new GainNode(ac, {gain: 0, channelCount: 1});
    oscils[i].connect(gains[i][c]);
    gains[i][c].connect(output, 0, c);
  }
}

let reached = .5;
let whistlePosReached = 0;

gains.forEach((g,i) => {
  for (let c of [0,1]) {
    g[c].gain.setValueAtTime(0, 0);
    g[c].gain.linearRampToValueAtTime(dbToAmp(minVol), reached);
  }
});

for (let g of [hissGain, preSplashGain, splashGain, whistleGain])
  g.gain.linearRampToValueAtTime(dbToAmp(minVol), reached);

let clamp = a => Math.max(.001, Math.min(.999, a));

for (let loop=0; loop<nbWaves; loop++) {
  if (loop >= nbWaves-2) period *= 1.3;
  let stPosAve = 0;
  let stPosCount = 0;
  let p = .8*period+.4*period*randBm();
  console.log(p);
  let dbShift = -6*randBm();
  let baseSplashTime = splashPos*p;
  gains.forEach((g, i) => {
    let dbs = dbShift+randBm();
    let spTimeRand = randBm();
    let splashTime = baseSplashTime+splashRand*spTimeRand;
    let ts = reached + splashTime;
    let stereoRand = 2*randBm()-1;
    let stereoPos = .5+stereoWidth[loop]*stereoRand;
    stPosAve += stereoPos;
    stPosCount ++;
    let stereoMult = [clamp(Math.cos(.5*stereoPos*Math.PI)), clamp(Math.sin(.5*stereoPos*Math.PI))];
    for (let c of [0,1]) {
      g[c].gain.rampToDbAtTime(preSplashVol+dbs, reached + preSplashPos*splashTime, (stereoMult[c]+.5)/2);
      g[c].gain.rampToDbAtTime(minVol+dbs, ts-.01);
      g[c].gain.rampToDbAtTime(splashVol+dbs, ts, stereoMult[c]);
      g[c].gain.rampToDbAtTime(minVol+dbs, reached+p);
    }
    oscils[i].frequency.setValueAtTime(notes[loop], ts);
  });
  let nextReached = reached+p;
  
  hissGain.gain.linearRampToValueAtTime(0, reached + baseSplashTime+.2);
  hissGain.gain.linearRampToValueAtTime(0, nextReached - 3*(p-baseSplashTime)/4);
  hissGain.gain.linearRampToValueAtTime(1, nextReached - 1*(p-baseSplashTime)/4);
  hissGain.gain.linearRampToValueAtTime(1, nextReached);

  preSplashGain.gain.linearRampToValueAtTime(1, reached + .5*preSplashPos*baseSplashTime);
  preSplashGain.gain.linearRampToValueAtTime(1, reached + baseSplashTime);
  preSplashGain.gain.linearRampToValueAtTime(0, reached + baseSplashTime+.3);
  preSplashGain.gain.linearRampToValueAtTime(0, nextReached);

  splashGain.gain.linearRampToValueAtTime(0, reached + baseSplashTime);
  splashGain.gain.linearRampToValueAtTime(1, reached + baseSplashTime+.3);
  splashGain.gain.linearRampToValueAtTime(1, nextReached - 2*(p-baseSplashTime)/4);
  splashGain.gain.linearRampToValueAtTime(0, nextReached);

  let whistlePos = nextReached+(randBm()-.5)*(p-baseSplashTime);
  let whistleDur = .2*(p-baseSplashTime)*(randBm()+.2);
  whistleGain.gain.exponentialRampToValueAtTime(10, whistlePos);
  whistleGain.gain.exponentialRampToValueAtTime(5, whistlePos+whistleDur/2);
  whistleGain.gain.exponentialRampToValueAtTime(8, whistlePos+whistleDur);
  whistleGain.gain.rampToDbAtTime(2*minVol, nextReached+baseSplashTime);
  whistleFilter.frequency.setValueAtTime(1000+6000*Math.random(), nextReached+baseSplashTime);

  reached = nextReached;
}

oscils.forEach(o => o.start(.1*randBm()));

let rendered = null;

let playRendered = () => {
  let audioCtx = new AudioContext();
  const song = audioCtx.createBufferSource();
  song.buffer = rendered;
  song.connect(audioCtx.destination);
  song.start();
};

window.addEventListener('DOMContentLoaded', () => {

  document.body.innerHTML = '<p>Rendering...</p>';
  
  ac.startRendering().then((renderedBuffer) => {
    rendered = renderedBuffer;
    for (let c=0; c<rendered.numberOfChannels; c++) {
      let data = rendered.getChannelData(c);
      let max = 0;
      for (let v of data) if (Math.abs(v) > max) max = Math.abs(v);
      data.forEach((v,i) => {data[i] = v/max;});
    }
    document.body.innerHTML = '<p>Rendering complete.</p>\n<p><input type="button" id="playButton" value="Play"/> &nbsp;or&nbsp;<input type="button" id="saveButton" value="Save"/>';
    setTimeout(() => {
      document.getElementById('playButton').addEventListener('click', playRendered);
      document.getElementById('saveButton').addEventListener('click', () => {
	new WaveWriter(rendered).saveWaveFile('bass_wave_sequence.wav');
      });
    });
  }).catch((err) => {
    document.body.innerHTML = `<p>Rendering failed: ${err}</p>`;
  });
  
});
