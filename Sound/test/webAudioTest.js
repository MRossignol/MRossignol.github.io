(function() {

  const wa = new WebAudio();
  var fileInput;
  
  async function playFile(file) {
    let buffer = await wa.loadBuffer(file);
    let sourceNode = wa.bufferSource('source', {buffer: buffer},
				     wa.gain('gain', {gain: 0.8}, [
				       wa.filter('filter', {type: 'bandpass', Q:4, frequency:10}, wa.destination),
				       wa.delay({delayTime: 0.5, maxDelayTime: 0.5}, 'gain')
				     ])
				    );
    const raisingVibrato = {
      *[Symbol.iterator]() {
	let c=0, t=0;
	while (t<200) {
	  yield[30 + (1+.5*(c%2))*20*t, t];
	  c++; t+=.1*(1-t/250);
	}
      }
    };
    wa.setParameterCurve(wa.nodes.filter.frequency, 'exp', raisingVibrato);
    sourceNode.start(0);
  }
  
  window.addEventListener('load', () => {
    fileInput = document.querySelector('input#fileInput');
    fileInput.addEventListener('change', () => {
      wa.resume();
      playFile(fileInput.files[0]);
    });
  });
  
})();
