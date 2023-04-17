(function () {

  let noteDuration = 10;
  let slideTime = 1;

  let chords = [
    [0, 3, 7], // A minor
    [-2, 3, 7], // C major
    [-2, 3, 6], // C minor
    [-2, 2, 5]  // G major
  ];

  let baseF = 55;
  let baseGain = 0;
  let maxSpeed = 10;
  let width = 0;
  let height = 0;
  
  let boids = null;

  let ac = new AudioContext();

  let oscillators = [];
  let filters = [];
  let panners = [];
  let gains = [];

  window.setAudioGeometry = (w, h, maxS) => {
    maxSpeed = maxS;
    width = w;
    height = h;
  };

  window.initBoidsAudio = (boidsSource) => {
    boids = boidsSource;
    baseGain = 2/boidsSource.length;
    panners = boids.map( b => {
      let p = new StereoPannerNode(ac);
      p.connect(ac.destination);
      return p;
    });
    gains = boids.map ( (b, i) => {
      let g = new GainNode(ac, {
	channelCount: 1,
	gain: 0
      });
      g.connect(panners[i]);
      return g;
    });
    filters = boids.map ( (b, i) => {
      let f = new BiquadFilterNode(ac, {
	type: 'lowpass',
	channelCount: 1
      });
      f.connect(gains[i]);
      return f;
    });
    oscillators = boids.map ( (b, i) => {
      let o = new OscillatorNode(ac, {
	type: 'sawtooth',
	frequency: baseF,
	channelCount: 1,
      });
      o.connect(filters[i]);
      o.start();
      return o;
    });
  };

  const updateFrequencies =  () => {
    let nbChords = chords.length;
    let chordPos = Math.floor(ac.currentTime / noteDuration);
    let posInNote = ac.currentTime % noteDuration;
    let freqs;
    if (posInNote > noteDuration - slideTime) {
      let ratio = 1-(noteDuration-posInNote)/slideTime;
      let [n1, n2] = [chords[chordPos % nbChords], chords[(chordPos+1) % nbChords]];
      if (n1.length < n2.length) {
	[n1, n2] = [n2, n1];
	ratio = 1-ratio;
      }
      let notes = n1.map((n,i) => n + ratio*(n2[i%n2.length] - n));
      freqs = notes.map(n => baseF * Math.pow(2, n/12));
    } else {
      freqs = chords[chordPos % nbChords].map(n => baseF * Math.pow(2, n/12));
    }
    const fFact = Math.log(15000) / height;
    boids.forEach((b,i) => {
      panners[i].pan.value = Math.max(-.8, Math.min(.8, 1.6*(b.x/width)-.8));
      gains[i].gain.value = baseGain*b.speed / maxSpeed;
      filters[i].frequency.value = 2*baseF + Math.exp(fFact * (height-b.y));
      oscillators[i].frequency.value = freqs[b.group % freqs.length]*Math.pow(2, -b.sin/12);
    });
  };
  
  setInterval(updateFrequencies, 50);
  
  
  window.addEventListener('DOMContentLoaded', () => {
    ac.onstatechange = (event) => {
      console.log(event);
    };
    let resumeAC = () => {
      console.log('Audio go!');
      ac.resume();
      setTimeout(() => {console.log(ac.state);}, 1000);
      document.body.removeEventListener('click', resumeAC);
    };
    document.body.addEventListener('click', resumeAC);
  });
  
})();

 
