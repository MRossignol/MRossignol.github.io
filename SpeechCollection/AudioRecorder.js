class AudioRecorder {

  ac = null;

  buffers = [];

  eventListeners = [];
  
  constructor () {

  }

  async init () {

    // Various audio settings to try
    // We'd rather avoid autoGainControl and noiseSuppression if possible, and get mono audio
    // echoCancellation is desirable, and generally on if available, so we don't specify it
    // The last "true" setting means "give me whatever you have", without control on the options
    const audioSettings = [
      { autoGainControl:false, noiseSuppression: false, channelCount: 1 },
      { autoGainControl:false, noiseSuppression: false, channelCount: 2 },
      { autoGainControl:false, noiseSuppression: true,  channelCount: 1 },
      { autoGainControl:true,  noiseSuppression: false, channelCount: 1 },
      { autoGainControl:true,  noiseSuppression: false, channelCount: 2 },
      { autoGainControl:true,  noiseSuppression: true,  channelCount: 1 },
      true
    ];

    var stream = null;
    for (let setting of audioSettings) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: setting
        });
      } catch (e) {} 
      if (stream) break;
    }
    if (!stream) {
      return false;
    }

    const track = stream.getAudioTracks()[0];
    const settings = track.getSettings();
    console.log(settings);

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('audio-recorder.js');

    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder');
    const buffers = [];

    var currentMax = 0;
    
    audioRecorder.port.addEventListener('message', event => {
      buffers.push(event.data.buffer);
      for (let listener of this.eventListeners) {
	listener.callback(event.data);
      }
    });
    audioRecorder.port.start();

    mediaStreamSource.connect(audioRecorder);
    audioRecorder.connect(audioContext.destination);
    audioRecorder.parameters.get('isRecording').setValueAtTime(1, audioContext.currentTime);
    return true;
  }

  addEventListener(name, func) {
    if (name && name.length) this.removeEventListener(name);
    this.eventListeners.push({name: name, callback: func});
  }

  removeEventListener(filter) {
    this.eventListeners = this.eventListeners.filter(l => l.name != filter && l.callback != filter);
  }

}
