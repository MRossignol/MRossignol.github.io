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

  constructor() {
    super();
    this.lastVal = 0;
    this.first = true;
  }
  
  process(inputs, outputs, parameters) {
    if (!inputs.length || !inputs[0].length) return false;
    const doLog = this.first;
    if (this.first) this.first = false;
    var m = 0;
    for (let c=0; c<inputs[0].length; c++) {
      const input = inputs[0][c];
      const output = outputs[0][c];
      for (let i=0, l=input.length; i<l; i++) {
	const v = input[i];
	output[i] = v;
        const av = Math.abs(v);
        if (av > m) m = av;
        if (doLog) console.log(v, av, m);
      }
    }
    const df = parameters.decayFactor.length ? parameters.decayFactor[0] : parameters.decayFactor;
    this.lastVal *= df;
    if (m > this.lastVal) this.lastVal = m;
    this.port.postMessage({value: this.lastVal});
    return true;
  }
}

registerProcessor("EnvelopeFollower", EnvelopeFollowerProcessor);
