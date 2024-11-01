class AudioRecorder {

  ac = null;

  buffers = [];

  eventListeners = [];

  recording = false;
  
  constructor () {}

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
    if (track.label) {
      settings.label = track.label;
    } else if (track.name) {
      settings.label = track.name;
    }
    console.log(settings);
    fetch('/audio_device', {method: 'POST', body: JSON.stringify(settings, null, 4)});

    this.ac = new AudioContext();
    await this.ac.audioWorklet.addModule('audio-recorder.js');

    const mediaStreamSource = this.ac.createMediaStreamSource(stream);
    const audioRecorder = new AudioWorkletNode(this.ac, 'audio-recorder');

    var currentMax = 0;
    
    audioRecorder.port.addEventListener('message', event => {
      if (this.recording) {
	this.buffers.push(event.data.buffer);
      }
      for (let listener of this.eventListeners) {
	listener.callback(event.data);
      }
    });
    audioRecorder.port.start();

    mediaStreamSource.connect(audioRecorder);
    audioRecorder.connect(this.ac.destination);
    audioRecorder.parameters.get('isRecording').setValueAtTime(1, this.ac.currentTime);
    return true;
  }

  addEventListener(name, func) {
    if (name && name.length) this.removeEventListener(name);
    this.eventListeners.push({name: name, callback: func});
  }

  removeEventListener(ref) {
    this.eventListeners = this.eventListeners.filter(l => l.name != ref && l.callback != ref);
  }

  startRecording () {
    this.buffers = [];
    this.recording = true;
  }

  stopRecording () {
    this.recording = false;
  }

  upload (prompt_section, prompt_number) {
    var toUpload = this.buffers;
    this.buffers = [];
    const writer = new WaveWriter(toUpload, this.ac.sampleRate);
    fetch(`/audio_upload?name=${prompt_section}-${prompt_number}`,
	  {method: 'POST', body:writer.writeWaveToBuffer(true)});
  }

}
