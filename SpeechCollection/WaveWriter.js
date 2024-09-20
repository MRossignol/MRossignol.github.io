
function WaveWriter (buffers, sampleRate) {  
  const nbChannels = 1;
  var nbSamples = buffers.reduce((acc, b) => acc+b.length, 0);
  console.log(`${nbSamples} samples`);
  var length = nbSamples * nbChannels * 2 + 44;
  var buffer = new ArrayBuffer(length);
  var view = new DataView(buffer);
  var pos = 0;

  function setInt16Sample(data) {
    const v = (0.5 + data < 0 ? data * 32768 : data * 32767)|0;
    view.setInt16(pos, v, true);
    pos += 2;
  }

  function setInt16(data) {
    view.setInt16(pos, data, true);
    pos += 2;
  }

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  this.writeWaveToBuffer = function (normalized) {
    setUint32(0x46464952);                   // "RIFF"
    setUint32(length - 8);                   // file length - 8
    setUint32(0x45564157);                   // "WAVE"
    setUint32(0x20746d66);                   // "fmt " chunk
    setUint32(16);                           // length = 16
    setUint16(1);                            // PCM (uncompressed)
    setUint16(nbChannels);                   // Number of channels
    setUint32(sampleRate);                   // Sample rate
    setUint32(sampleRate * 2 * nbChannels);  // avg. bytes/sec
    setUint16(nbChannels * 2);               // block-align
    setUint16(16);                           // 16-bit (hardcoded in this demo)
    setUint32(0x61746164);                   // "data" - chunk
    setUint32(length - pos - 4);             // chunk length

    var i, offset;

    if (normalized) {
      const max = buffers.reduce((accum, buf) => Math.max(accum, buf.reduce((acc, x) => Math.max(acc, Math.abs(x)), 0)), 0);
      const amp = .99 / max;
      for (let b of buffers) {
	for (let v of b) {
	  setInt16Sample(v * amp); // normalize
	}
      }
    } else {
      for (let b of buffers) {
	for (let v of b) {
	  setInt16Sample(Math.max(-1, Math.min(1, v))); // clamp
	}
      }
    }
    return buffer;
  };

  this.getWaveAsBlob = function (normalized) {
    this.writeWaveToBuffer(normalized);
    return new Blob([buffer], {type:'audio/wav'});
  };

  this.getWaveAsDataURL = function (normalized) {
    var blob = this.getWaveAsBlob(normalized);
    return window.URL.createObjectURL(blob);
  };

  this.saveWaveFile = function (fileName) {
    if (!fileName) fileName = '';
    var dataURL = this.getWaveAsDataURL();
    const elem = window.document.createElement('a');
    elem.href = dataURL;
    elem.download = fileName;
    elem.style.visibility = 'hidden';
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
  };
  
}
