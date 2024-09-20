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
    const buffer = Array.from(inputs[0][0]);
    
    if (buffer.length >= 1) {
      const max = buffer.reduce((acc, x) => Math.max(acc, Math.abs(x)));
      if (max > this.smoothedMax) {
	this.smoothedMax = max;
      } else {
	this.smoothedMax = Math.max(max, this.smoothedMax-.001);
      }
      this.port.postMessage({buffer: buffer, instantMax: max, smoothedMax: this.smoothedMax});
    }
    return true;
  }
}

registerProcessor('audio-recorder', AudioRecorder);
