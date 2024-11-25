(function() {

  const wa = new WebAudio();
  var started = false;
  
  async function start() {
    if (started) return;
    started = true;  
    await wa.ac.audioWorklet.addModule('envelopeFollower.js');
    const envelopeFollower = new AudioWorkletNode(wa.ac, 'EnvelopeFollower', {numberOfOutputs: 1, parameterData:{decayFactor: 0.997}});
    const cicadaGain = wa.gain({gain:0.5}, wa.destination);
    envelopeFollower.connect(cicadaGain);
    const buffer = await wa.loadBuffer('cicadas-2.wav');
    const instrument = await wa.loadBuffer('guitar-4.wav');
    const cicadaSource = wa.bufferSource('cicadas', {buffer: buffer, loop: true}, envelopeFollower);
    const guitarSource = wa.bufferSource('guitar', {buffer: instrument, loop: true}, 
                                         wa.filter({type:'highshelf', frequency: 4000, gain: 8},
						   wa.gain('gain', {gain: 0},
							   wa.filter('filter', {type:'lowpass', frequency: 5000, Q:4}, wa.destination)
							  )
						  )
					);
    envelopeFollower.port.onmessage = (data) => {
      wa.nodes.filter.frequency.value = 40000*data.data.value*data.data.value*data.data.value;
      const fadeIn = wa.ac.currentTime < 20 ? (wa.ac.currentTime*wa.ac.currentTime/400) : 1;
      wa.nodes.gain.gain.value = .7*fadeIn*data.data.value;
    };
    cicadaSource.start(0);
    guitarSource.start(0);
    globalThis.wa = wa;
  }


  window.addEventListener('load', () => {
    document.addEventListener('click', () => {
      wa.resume();
      start();
    });
  });
  
})();
