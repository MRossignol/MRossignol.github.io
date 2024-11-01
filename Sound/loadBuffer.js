
function loadBuffer (ac, source) {
  if (source instanceof File) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = function(ev) {
	ac.decodeAudioData(ev.target.result).then((buffer) => {
	  resolve(buffer);
	});
      };
      reader.readAsArrayBuffer(source);
    });
  } else {
    return new Promise((resolve, reject) => {
      fetch(source, {'mode': 'no-cors'})
	.then(response => response.arrayBuffer())
	.then(arrayBuffer => ac.decodeAudioData(arrayBuffer))
	.then(resolve);
    });
  }
}
