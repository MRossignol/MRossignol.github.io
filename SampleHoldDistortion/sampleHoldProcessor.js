class SampleHoldDistortionProcessor extends AudioWorkletProcessor {
  
  static get parameterDescriptors() {
    return [
      {
        name: "holdEndProbability",
        defaultValue: 0.1,
        minValue: 0.001,
        maxValue: 1,
        automationRate: "k-rate",
      },
      {
        name: "followEndProbability",
        defaultValue: 0.3,
        minValue: 0.001,
        maxValue: 1,
        automationRate: "k-rate",
      },
      {
        name: "maxConvergeSlope",
        defaultValue: 0.1,
        minValue: 0.001,
        maxValue: 1,
        automationRate: "k-rate",
      }
    ];
  }

  lastVal = [];
  stage = 0;
  
  process(inputs, outputs, parameters) {
    if (!inputs.length || !inputs[0].length) return false;
    const input = inputs[0];
    const output = outputs[0];
    const holdEndProbability = parameters['holdEndProbability'][0];
    const followEndProbability = parameters['followEndProbability'][0];
    const maxSlope = parameters['maxConvergeSlope'][0];
    const nbChannels = input.length;
    while (this.lastVal.length < nbChannels) this.lastVal.push(0);
    for (let i=0, l=input[0].length; i<l; i++) {
      let changeStage = false;
      switch(this.stage) {
      case 0: // follow
	for (let c=0; c<nbChannels; c++)
	  this.lastVal[c] = output[c][i] = input[c][i];
	changeStage = Math.random() < followEndProbability;
	break;
      case 1: // hold:
	for (let c=0; c<nbChannels; c++)
	  output[c][i] = this.lastVal[c];
	changeStage = Math.random() < holdEndProbability;
	break;
      case 2: // converge:
	changeStage = true;
	for (let c=0; c<nbChannels; c++) {
	  if (this.lastVal[c]-input[c][i] > maxSlope) {
	    this.lastVal[c] -= maxSlope;
	    output[c][i] = this.lastVal[c];
	    changeStage = false;
	  } else if (input[c][i]-this.lastVal[c] > maxSlope) {
	    this.lastVal[c] += maxSlope;
	    output[c][i] = this.lastVal[c];
	    changeStage = false;
	  } else {
	    this.lastVal[c] = output[c][i] = input[c][i];
	  }
	}
	break;
      }
      if (changeStage) {
	this.stage = (this.stage+1) % 3;
      }
    }
    return true;
  }
}

registerProcessor("SampleHoldDistortion", SampleHoldDistortionProcessor);
