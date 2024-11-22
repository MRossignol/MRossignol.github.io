(function() {

  const wa = new WebAudio();
  var started = false;
  
  async function start() {
    if (started) return;
    started = true;
    const buffer = await wa.loadBuffer('cicadas.mp3');
    const source = wa.bufferSource('source', {buffer: buffer, loop: true},
				   // wa.filter('filter', {type:'lowpass', frequency:1000, Q: 0.1},
					     wa.gain('gain', {gain: .5}, [
					       wa.destination,
					       wa.delay('delay', {delayTime: 1/55}, 'gain')
					     ])
				   // 	    )
				  );
    source.start(0);
    globalThis.wa = wa;
  }


  window.addEventListener('load', () => {
    document.addEventListener('click', () => {
      wa.resume();
      start();
    });
  });
  
})();
