async function initAudio() {
  
  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true,
  });

  const [track] = stream.getAudioTracks();
  const settings = track.getSettings();

  const audioContext = new AudioContext() ;
  await audioContext.audioWorklet.addModule('audio-recorder.js');

  const mediaStreamSource = audioContext.createMediaStreamSource(stream);
  const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder');
  const buffers = [];

  const visualizer = document.querySelector('div#visualizer');
  const visualizerBlack = document.querySelector('div#visualizer-black');
  
  audioRecorder.port.addEventListener('message', event => {
    const w = event.data.max > 1 ? 0 : 1 - event.data.max;
    visualizerBlack.style.width = Math.round(window.innerWidth*w)+'px';
    buffers.push(event.data.buffer);
  });
  audioRecorder.port.start();

  mediaStreamSource.connect(audioRecorder);
  audioRecorder.connect(audioContext.destination);
  audioRecorder.parameters.get('isRecording').setValueAtTime(1, audioContext.currentTime);

  return buffers;
}

// async function main () {
//   try {
//     const buttonStart = document.querySelector('#buttonStart');
//     const buttonStop = document.querySelector('#buttonStop');
//     const audio = document.querySelector('#audio');

//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: true,
//     });

//     const [track] = stream.getAudioTracks();
//     const settings = track.getSettings();

//     const audioContext = new AudioContext() ;
//     await audioContext.audioWorklet.addModule('audio-recorder.js');

//     const mediaStreamSource = audioContext.createMediaStreamSource(stream);
//     const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder');
//     const buffers = [];

//     audioRecorder.port.addEventListener('message', event => {
//       console.log(event.data.max);
//       buffers.push(event.data.buffer);
//     });
//     audioRecorder.port.start();

//     mediaStreamSource.connect(audioRecorder);
//     audioRecorder.connect(audioContext.destination);

//     buttonStart.addEventListener('click', event => {
//       buttonStart.setAttribute('disabled', 'disabled');
//       buttonStop.removeAttribute('disabled');

//       const parameter = audioRecorder.parameters.get('isRecording');
//       parameter.setValueAtTime(1, audioContext.currentTime);

//       buffers.splice(0, buffers.length);
//     });

//     buttonStop.addEventListener('click', event => {
//       buttonStop.setAttribute('disabled', 'disabled');
//       buttonStart.removeAttribute('disabled');

//       const parameter = audioRecorder.parameters.get('isRecording');
//       parameter.setValueAtTime(0, audioContext.currentTime);

//       const waveWriter = new WaveWriter(buffers, audioContext.sampleRate);
//       audio.src = waveWriter.getWaveAsDataURL(true);
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }


// window.addEventListener('load', main);
