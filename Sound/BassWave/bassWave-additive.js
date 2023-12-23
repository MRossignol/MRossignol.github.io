
let baseF = 55;

let period = 10;
let nbWaves = 1;

let nbOscils = 8192;

let minVol = -50;
let splashVol = 0;
let splashPos = .45;
let splashRand = 1.4;
let preSplashVol = -21;
let preSplashPos = .5;

let stereoWidth = 1;

let oscils = [];
let gains = [];
let gainBase = [];

let ac = new OfflineAudioContext(1, 48000*period*(nbWaves+1), 48000);

let output = new ChannelMergerNode(ac, {numberOfInputs: 2});
output.connect(ac.destination);

let octaves = [];
for (let o=0; o<16; o++) {
  octaves[o] = {f: baseF*(2*o+1)};
  if (o<8) {
    octaves[o].g = -o;
  } else {
    octaves[o].g = 16-o;
  }
}

for (let i=0; i<nbOscils; i++) {
  let o = i % octaves.length;
  oscils[i] = new OscillatorNode(ac, {type: 'sine', frequency: octaves[o].f, detune: -20+40*randBm()});
  gainBase[i] = octaves[o].g+.1*randBm();
  gains[i] = [];
  for (let c of [0,1]) {
    gains[i][c] = new GainNode(ac, {gain: 0});
    oscils[i].connect(gains[i][c]);
    gains[i][c].connect(output, 0, c);
  }
  oscils[0].start[0];
}


let reached = .5;

gains.forEach((g,i) => {
  for (let c of [0,1]) {
    g[c].gain.setValueAtTime(0, 0);
    g[c].gain.linearRampToValueAtTime(dbToAmp(minVol+gainBase[i]), reached);
  }
});

for (let loop=0; loop<nbWaves; loop++) {
  let p = .8*period+.4*period*randBm();
  let dbShift = -6*randBm();
  gains.forEach((g, i) => {
    let dbs = dbShift+gainBase[i];
    let spTimeRand = randBm();
    let splashTime = splashPos*p+splashRand*spTimeRand;
    let ts = reached + splashTime;
    let stereoPos = .5*(1-stereoWidth)+stereoWidth*spTimeRand;
    // let stereoPos = .5*(1-stereoWidth)+stereoWidth*randBm();
    let stereoMult = [Math.cos(.5*stereoPos*Math.PI), Math.sin(.5*stereoPos*Math.PI)];
    for (let c of [0,1]) {
      g[c].gain.rampToDbAtTime(preSplashVol+dbs, reached + preSplashPos*splashTime, stereoMult[c]);
      g[c].gain.rampToDbAtTime(minVol+dbs, ts-.01);
      g[c].gain.rampToDbAtTime(splashVol+dbs, ts, stereoMult[c]);
      g[c].gain.rampToDbAtTime(minVol+dbs, reached+p);
    }
  });
  reached += p;
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
  
  let b = document.createElement('input');
  b.type = 'button';
  b.value = 'Play';
  b.addEventListener('click', () => {
    if (rendered) {
      playRendered();
    } else {
      console.log('Start Rendering...');
      ac.startRendering().then((renderedBuffer) => {
	rendered = renderedBuffer;
	for (let c=0; c<rendered.numberOfChannels; c++) {
	  let data = rendered.getChannelData(c);
	  let max = 0;
	  for (let v of data) if (Math.abs(v) > max) max = Math.abs(v);
	  data.forEach((v,i) => {data[i] = v/max;});
	}
	console.log('Rendering completed successfully');
	playRendered();
      }).catch((err) => {
	console.error(`Rendering failed: ${err}`);
	// Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
      });
    }
  });
  document.body.appendChild(b);
  
});
