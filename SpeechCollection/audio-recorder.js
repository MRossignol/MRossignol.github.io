class AudioRecorder extends AudioWorkletProcessor {
  
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
      const max = buffer.reduce((acc, x) => Math.max(acc, x));
      this.port.postMessage({buffer: buffer, max: max});
    }
    return true;
  }
}

registerProcessor('audio-recorder', AudioRecorder);
