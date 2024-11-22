class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
  
  static get parameterDescriptors() {
    return [
      {
        name: "decayFactor",
        defaultValue: 0.99,
        minValue: 0,
        maxValue: 1,
        automationRate: "k-rate",
      }
    ];
  }

  lastVal = 0;
  
  process(inputs, outputs, parameters) {
    if (!inputs.length || !inputs[0].length) return false;
    let max = 0;
    for (let c=0; c<inputs.length; c++) {
      const input = inputs[c];
      const output = outputs[c];
      for (let i=0, l=input.length; i<l; i++) {
	const v = input[i];
	output[i] = v;
	max = Math.max(max, Math.abs(v));
      }
    }
    this.lastVal = Math.max(max, this.lastVal*parameters.decayFactor);
    this.port.postMessage({'value': this.lastVal});
    return true;
  }
}

registerProcessor("EnvelopeFollower", EnvelopeFollowerProcessor);
