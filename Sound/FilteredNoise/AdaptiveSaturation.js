/**
 * Applies a saturation effect to a signal, with the threshold automatically following the loudness.
 *
 * @class AdaptiveSaturation
 * @extends AudioWorkletProcessor
 **/

class AdaptiveSaturation extends AudioWorkletProcessor {

  history = null;
  lastMax = 0;
  
  constructor() {
    super();
    this.history = [];
    this.lastMax = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "strength",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1000,
      },
      {
        name: "threshold",
        defaultValue: .9,
        minValue: .01,
        maxValue: 1,
      },
      {
        name: "f0",
        defaultValue: 100,
        minValue: 1,
        maxValue: 1000,
      }
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

    const strength = 1/(1+parameters.strength[0]);
    const f0 = parameters.f0[0];
    const threshold = parameters.threshold[0];

    let output = outputList[0];
    const length = output[0].length;

    // 1. Mix inputs
    for (let input of inputList) {
      let channelCount = Math.min(input.length, output.length);
      for (let channelNum = 0; channelNum < channelCount; channelNum++) {
	for (let i = 0; i < length; i++) {
          output[channelNum][i] += input[channelNum][i];
        }
      }
    }
    let max = 0;
    for (let channel of output)
      for (let v of channel)
	if (Math.abs(v) > max) max = Math.abs(v);
    this.history.push(max);
    let neededSamples = sampleRate/f0;
    let neededFrames = Math.ceil(neededSamples/output[0].length);
    while (this.history.length > neededFrames) this.history.shift();
    max = this.history.reduce((acc, x) => Math.max(acc, x), 0);
    let maxDelta = max-this.lastMax;
    if (max + this.lastMax > 0) {
      for (let i=0; i<output[0].length; i++) {
	let ratio = i/length;
	let m = threshold*(this.lastMax + ratio*maxDelta);
	for (let c=0; c<output.length; c++) {
	  if (output[c][i] >= 0)
	    output[c][i] = m*Math.pow(output[c][i]/m, strength);
	  else
	    output[c][i] = -m*Math.pow(-output[c][i]/m, strength);
	}
      }
    }
    this.lastMax = max;
    return true;
  }
}

registerProcessor("AdaptiveSaturation", AdaptiveSaturation);
