class AudioRecorder {

  ac = null;

  buffers = [];

  eventListeners = [];
  
  constructor () {

  }

  async init () {
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });

    const track = stream.getAudioTracks()[0];
    const settings = track.getSettings();
    console.log(settings);

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('audio-recorder.js');

    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder');
    const buffers = [];

    const visualizer = document.querySelector('div#visualizer');
    const visualizerBlack = document.querySelector('div#visualizer-black');

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
    
  }

  addEventListener(name, func) {
    if (name && name.length) this.removeEventListener(name);
    this.eventListeners.push({name: name, callback: func});
  }

  removeEventListener(filter) {
    this.eventListeners = this.eventListeners.filter(l => l.name != filter && l.callback != filter);
  }

}
