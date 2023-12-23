/**
 * Produces white noise.
 *
 * @class NoisyOscillator
 * @extends AudioWorkletProcessor
 **/

class NoisyOscillator extends AudioWorkletProcessor {

  constructor() {
    super();
    this.s=0;
    this.c=1;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "frequency",
        defaultValue: 220,
        minValue: 10,
        maxValue: 10000,
      },
    ];
  }

  /**
   * Called by the browser's audio subsystem with
   * packets of audio data to be processed.
   *
   * @param[in] inputList    Array of inputs
   * @param[in] outputList   Array of outputs
   * @param[in] parameters   Parameters object
   *
   * `inputList` and `outputList` are each arrays of inputs
   * or outputs, each of which is in turn an array of `Float32Array`s,
   * each of which contains the audio data for one channel (left/right/etc)
   * for the current sample packet.
   *
   * `parameters` is an object containing the `AudioParam` values
   * for the current block of audio data.
   **/

  process(inputList, outputList, parameters) {
    const freq = parameters.frequency[0];
    const angleInc = (2*Math.PI)/(sampleRate/freq);
    const dc = Math.cos(angleInc);
    const ds = Math.sin(angleInc);
    let s = this.s, c = this.c;
    
    let refData = null;
    outputList.forEach((outputChannels) => {
      outputChannels.forEach((channel) => {
	if (refData) {
	  for (let i=0, l=channel.length; i<l; i++) {
	    channel[i] = refData[i];
	  }
	} else {
	  for (let i=0, l=channel.length; i<l; i++) {
	    let val = s;
	    s = c*ds + s*dc;
	    c = c*dc - val*ds;
	    if (val > 0) {
	      channel[i] = -1+2*Math.random()*Math.pow(val, 6);
	    } else {
	      channel[i] = 0;
	    }
	  }
	  refData = channel;
	}
      });
    });

    this.s = s;
    this.c = c;

    return true;
  }
}

registerProcessor("NoisyOscillator", NoisyOscillator);
