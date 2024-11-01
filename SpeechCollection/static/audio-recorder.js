class AudioRecorder extends AudioWorkletProcessor {

  smoothedMax = 0;
  
  static get parameterDescriptors () {
    return [
      {
        name: 'isRecording',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
      },
    ];
  }

  process (inputs, outputs, parameters) {
    if (parameters.isRecording[0] != 1) {
      return false;
    }
    if (inputs[0].length==0 || inputs[0][0].length==0) {
      return true;
    }
    const buffer = [];
    var max = 0;
    for (let b of inputs[0]) {
      const buf = Array.from(b);
      const m = buf.reduce((acc, x) => Math.max(acc, Math.abs(x)), 0);
      max = Math.max(m, max);
      buffer.push(buf);
    }
    
    if (max > this.smoothedMax) {
      this.smoothedMax = max;
    } else {
      this.smoothedMax = Math.max(max, this.smoothedMax-.005);
    }
    this.port.postMessage({buffer: buffer, instantMax: max, smoothedMax: this.smoothedMax});
    
    return true;
  }
}

registerProcessor('audio-recorder', AudioRecorder);
