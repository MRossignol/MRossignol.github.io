class BufferSource {

  constructor (ac, source) {
    this.ac = ac;
    this.source = source;
  }

  load () {
    if (this.source instanceof File) {
      return this._loadFile();
    } else {
      return this._loadURL();
    }
  }

  _loadFile() {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = function(ev) {
	this.ac.decodeAudioData(ev.target.result).then((buffer) => {
	  this.buffer = buffer;
	  resolve(this);
	});
      };
      reader.readAsArrayBuffer(this.source);
    });
  }

  _loadURL() {
    return new Promise((resolve, reject) => {
      fetch(this.source, {'mode': 'no-cors'})
	.then(response => response.arrayBuffer())
	.then(arrayBuffer => this.ac.decodeAudioData(arrayBuffer))
	.then(buffer => {
	  this.buffer = buffer;
	  resolve(this);
	});
    });
  } 

}
