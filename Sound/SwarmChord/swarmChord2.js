
let large = true;

let duration = large ? 120 : 2;
let minNoteDur = .2;
let maxNoteDur = .4;
let attack = .003;
let maxAmp = .001;

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

let nbOscils = large ? 300000 : 1024; // 131072 // 65536; // 32768;

let schedule = [];

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
  schedule.push({time: t, amp: a, note: note});
}


let renderProgress = (progress) => {
  let pBar = document.querySelector('div#progress');
  if (pBar) {
    pBar.innerHTML = Math.floor(100*progress)+'%';
    pBar.style.width = Math.floor(100*progress)+'%';
  }
};


let buildSlice = (ac, startTime, endTime) => {
  let tSched = schedule.filter(s => s.time >= startTime && s.time < endTime);
  for (let sched of tSched) {
    let t = sched.time-startTime;
    let p = new StereoPannerNode(ac, {pan: randBm(.7)-.5 /*-.8+1.6*randBm() */});
    p.connect(ac.destination);
    let g = new GainNode(ac, { channelCount: 1 });
    let noteDur = minNoteDur + Math.random()*(maxNoteDur-minNoteDur);
    g.gain.setValueAtTime(0, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(sched.amp, t+attack);
    g.gain.linearRampToValueAtTime(sched.amp/2, t+attack+.3*(noteDur-attack));
    g.gain.exponentialRampToValueAtTime(.01, t+noteDur);
    g.gain.linearRampToValueAtTime(0, t+noteDur+.1);
    g.connect(p);
    let o = new OscillatorNode(ac, {
      type: 'triangle',
      frequency: getFreq(sched.note),
      channelCount: 1
    });
    o.connect(g);
    o.start(t);
    o.stop(t+noteDur+.1);
  }
};

window.addEventListener('DOMContentLoaded', () => {

  document.body.innerHTML = '<p>Rendering...</p><div id = "progress" style="overflow: visible; padding: 10px 0px 10px 10px; background-color: #8da; width: 0%"></div>';

  let renderer = new AudioRenderer({
    renderInterval: 1,
    nbChannels: 2,
    sampleRate: 48000,
    nbParallel: 4,
    maxEventDuration: maxNoteDur+.1
  });

  renderer.render(duration, buildSlice, renderProgress).then(() => {
    document.body.innerHTML = '<p>Rendering complete.</p>\n<p><input type="button" id="playButton" value="Play"/> &nbsp;or&nbsp;<input type="button" id="saveButton" value="Save"/>';
    setTimeout(() => {
      document.getElementById('playButton').addEventListener('click', () => {
	renderer.play();
      });
      document.getElementById('saveButton').addEventListener('click', () => {
	renderer.save('swarm_chord.wav');
      });
    });
  });
});
