/**
 * Produces white noise.
 *
 * @class NoiseGenerator
 * @extends AudioWorkletProcessor
 **/

class NoiseGenerator extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  static get parameterDescriptors() {
    return [
      {
        name: "width",
        defaultValue: 0.2,
        minValue: 0,
        maxValue: 1,
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

    const width = parameters.width[0];
    
    let refData = null;
    outputList.forEach((outputChannels) => {
      outputChannels.forEach((channel) => {
	if (refData) {
	  for (let i=0, l=channel.length; i<l; i++) {
	    channel[i] = (1-width)*refData[i] + width*(2*Math.random()-1);
	  }
	} else {
	  for (let i=0, l=channel.length; i<l; i++) {
	    channel[i] = 2*Math.random()-1;
	  }
	  refData = channel;
	}
      });
    });
    
    // Return; let the system know we're still active
    // and ready to process audio.

    return true;
  }
}

registerProcessor("NoiseGenerator", NoiseGenerator);
