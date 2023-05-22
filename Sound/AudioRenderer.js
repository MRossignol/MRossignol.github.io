
class AudioRenderer {

  // Render by slices of 'renderInterval' seconds
  renderInterval = 1;

  // Run this many renderings in parallel
  nbParallel = 2;

  // 0 to use default system sample rate
  sampleRate = 0;

  // Number of channels
  nbChannels = 2;

  // How much extra audio to render past each time "slice"
  // Typically the maximum duration of a sound past its onset
  extraRenderTime = 0;

  renderedAudioBuffer = null;
  
  constructor (options) {
    if (options.hasOwnProperty('sampleRate')) {
      this.sampleRate = options.sampleRate;
    } else {
      this.sampleRate = new AudioContext().sampleRate;
    }
    if (options.hasOwnProperty('maxEventDuration')) {
      this.extraRenderTime = options.maxEventDuration;
    } else {
      throw(new Error('You must specify "maxEventDuration" in the options'));
    }
    for (let k in ['nbParallel', 'renderInterval', 'nbChannels']) {
      if (options.hasOwnProperty(k)) this[k] = options[k];
    }
    if (renderInterval <= 0 || renderInterval != Math.floor(renderInterval)) {
      throw(new Error('Render interval must be a whole, strictly positive number of seconds'));
    }
  }

  render (duration, buildFunction, progressFunction) {
    this.renderedAudioBuffer = new AudioBuffer({
      nbChannels: this.nbChannels,
      sampleRate: this.sampleRate,
      length: Math.round(this.sampleRate*(duration+this.extraRenderTime+.01))
    });
    return new Promise ((resolve, reject) => {
      let nbChunks = Math.ceil(duration/this.renderInterval);
      let nbRenderedChunks = 0;
      for (let thread=0; thread < this.nbParallel; thread++) {
	let step = 0;
	let renderStep = () => {
	  let chunkNum = step*this.nbParallel + thread;
	  let ac = new OfflineAudioContext(this.nbChannels, Math.round(this.sampleRate*(this.renderInterval+this.extraRenderTime+.01)), this.sampleRate);
	  let startTime = this.renderInterval*chunkNum;
	  if (startTime > duration) return;
	  buildFunction(ac, startTime, startTime + this.renderInterval);
	  ac.startRendering().then((buffer) => {
	    for (let c=0; c<this.nbChannels; c++) {
	      let sData = buffer.getAudioChannel(c);
	      let tData = this.renderedAudioBuffer.getAudioChannel(c);
	      let start = Math.floor(this.sampleRate*startTime);
	      let end = Math.min(start+buffer.length, this.renderedAudioBuffer.length);
	      for (let i=0, j=start; j<end; i++, j++) {
		tData[j] += sData[i];
	      }
	    }
	    nbRenderedChunks++;
	    step++;
	    progressFunction(nbRenderedChunks / nbChunks);
	    if (nbRenderedChunks == nbChunks) {
	      resolve();
	    } else {
	      renderStep();
	    }
	  });
	};
	renderStep();
      }
    });
  }

  save (fileName) {
    new WaveWriter(this.renderedAudioBuffer).saveWaveFile(fileName);
  }

  play() {
    let audioCtx = new AudioContext();
    const song = audioCtx.createBufferSource();
    song.buffer = this.renderedAudioBuffer;
    song.connect(audioCtx.destination);
    song.start();
  }
}
