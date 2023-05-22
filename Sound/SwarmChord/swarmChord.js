
let large = true;

let acidProbability = large ?
    [0, 0, 0, 0, 0, .3, .4, .3, .1, .3, .1, 0, 0] : [0, .5, 0];

let duration = large ? 120 : 2;
let noteDur = .4;
let attack = .005;
let maxAmp = .0002;

let frequencies = [];
let chord = [0, 3, 7, 10];
let f = 55;
for (let o=0; o<6; o++) {
  for (let n of chord) {
    frequencies.push(f*Math.pow(2, n/12));
  }
  f *= 2;
}
let nbNotes = frequencies.length;

let getFreq = (num) => {
  return (.985 + .03*Math.random())*frequencies[num];
};

let sr = 48000;

let nbOscils = large ? 262144 : 1024; // 131072 // 65536; // 32768;

let ac = new OfflineAudioContext(2, Math.round(2*duration*sr), sr);

let acProb = (relPos) => {
  relPos *= acidProbability.length;
  let relPosInt = Math.floor(relPos);
  let relPosFrac = relPos - relPosInt;
  return (1-relPosFrac)*acidProbability[relPosInt] + relPosFrac*acidProbability[relPosInt+1];
};

let schedule = [];
let runningNodes = [];


for (let i=0; i< nbOscils; i++) {
  let relPos = Math.random();
  let t = duration*relPos;
  let noteDelta = 0, note = -1;
  while (note < 0 || note >= nbNotes) {
    noteDelta = randBm() - 0.5;
    note = Math.round(nbNotes*(relPos + noteDelta));
  }
  let a = maxAmp*(.7+.3*(t/duration));
  let deltaAmp = 4*noteDelta*noteDelta;
  a *= deltaAmp;
  let shape = Math.random() > acProb(relPos) ? 'triangle' : 'sawtooth';
  schedule.push({time: t, pan: -.8+1.6*randBm(), amp: a, shape: shape, note: note});
}

schedule.sort((a,b) => b.time-a.time);

let started = false;

function scheduleNextSlice () {
  if (started) document.querySelector('div#progress').style.width = Math.floor(100*ac.currentTime/duration)+'%';
  let newRunningNodes = [];
  for (let rn of runningNodes) {
    if (rn.endTime < ac.currentTime) {
      for (let n of rn.nodes) {
	n.disconnect();
      }
    } else {
      newRunningNodes.push(rn);
    }
  }
  runningNodes = newRunningNodes;
  let sched = null;
  do {
    sched = schedule.pop();
    if (sched) {
      let t = sched.time;
      let p = new StereoPannerNode(ac, {pan: sched.pan});
      p.connect(ac.destination);
      let g = new GainNode(ac, {
	channelCount: 1
      });
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(sched.amp, t+attack);
      g.gain.linearRampToValueAtTime(sched.amp/2, t+attack+.3*(noteDur-attack));
      g.gain.exponentialRampToValueAtTime(.01, t+noteDur);
      g.gain.linearRampToValueAtTime(0, t+noteDur+.1);
      g.connect(p);
      let o = new OscillatorNode(ac, {
	type: sched.type,
	frequency: getFreq(sched.note),
	channelCount: 1
      });
      o.connect(g);
      o.start(t);
      o.stop(t+noteDur+.1);
      runningNodes.push({
	endTime: sched.time + noteDur + .1,
	nodes: [p, g, o]
      });
    }
  } while (sched && sched.time < ac.currentTime+1.1);
  ac.suspend(ac.currentTime+1).then(scheduleNextSlice);
  if (started) ac.resume();
}

scheduleNextSlice();

let rendered = null;

let playRendered = () => {
  let audioCtx = new AudioContext();
  const song = audioCtx.createBufferSource();
  song.buffer = rendered;
  song.connect(audioCtx.destination);
  song.start();
};

window.addEventListener('DOMContentLoaded', () => {

  document.body.innerHTML = '<p>Rendering...</p><div id = "progress" style="height: 20px; background-color: #0f8; width: 0%"></div>';

  started = true;
  
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
	new WaveWriter(rendered).saveWaveFile('swarm_chord.wav');
      });
    });
  }).catch((err) => {
    document.body.innerHTML = `<p>Rendering failed: ${err}</p>`;
  });
  
});
