
let ac = new AudioContext();

let parameters = {
  period: 1,
  tickAttack: .001,
  tickDuration: .005,
  tickMinAmp: .001
};


let duration = (t) => (1.5+Math.sin(t))/5;
let tickPeriod = (t) => (1.5+Math.sin(10*t))/50;
let tickDuration = (t) => (5+Math.sin(15*t))/500;
let tickFrequency = (t) => (4+Math.sin(8*t))*1500;
let silence = (t) => (1.5+Math.sin(2*t))/5;



let schedulePeriod = .1;
let scheduleAnticipate = .05;

let lastCreaks = [{time: -100, nextT: 0, nodes: [], over: true}];

let scheduleTick = (t, nodesStore) => {
  let {tickAttack, tickMinAmp} = parameters;
  let oscillator = new OscillatorNode(ac, {type: 'triangle', frequency: tickFrequency(t)});
  let gain = new GainNode(ac);
  gain.gain.setValueAtTime(0, 0);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(1, t+tickAttack);
  gain.gain.exponentialRampToValueAtTime(tickMinAmp, t+tickDuration(t));
  gain.gain.linearRampToValueAtTime(0, t+tickDuration(t)+.1);
  oscillator.connect(gain);
  gain.connect(ac.destination);
  oscillator.start(t);
  nodesStore.push(oscillator);
  nodesStore.push(gain);
};


let schedule = (t) => {
  let {period, tickFrequency, tickDuration, tickMinAmp} = parameters;
  let lastCreak = lastCreaks[lastCreaks.length-1];
  let nextCreakTime = lastCreak.nextT;
  if (nextCreakTime < t) nextCreakTime = t;
  
  if (nextCreakTime < t+schedulePeriod) {
    let nextCreak = {time: nextCreakTime, nextT: nextCreakTime + duration(t) + silence(t), over: false, nodes: []};
    for (let tt=nextCreakTime; tt < nextCreakTime+duration(t); tt +=tickPeriod(t)) {
      scheduleTick(tt, nextCreak.nodes);
    }
    setTimeout(
      () => { nextCreak.over = true; },
      1000*(nextCreakTime + duration - ac.currentTime + .3)
    );
    lastCreaks.push(nextCreak);
  }
  
  while (lastCreaks.length > 1 && lastCreaks[0].over) {
    let toDelete = lastCreaks.shift();
    for (let n of toDelete.nodes) n.disconnect();
  }

  setTimeout(
    () => schedule(t+schedulePeriod),
    1000*(t + schedulePeriod - ac.currentTime - scheduleAnticipate)
  );
};

window.addEventListener('DOMContentLoaded', () => {
  
  document.querySelector('input#playButton').addEventListener('click', () => {
    schedule(0);
    ac.resume();
  });
  
});
