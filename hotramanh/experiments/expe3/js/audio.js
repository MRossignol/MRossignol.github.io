
let ac = null;
let mediaSource = null;
let analyzer = null;
let canvas = null;

let freqData = null;

let active = false;

let img = [null, null];

let renderer = null;

window.addEventListener('DOMContentLoaded', () => {

  canvas = document.getElementById('canvas');
  renderer = canvas.getContext('2d');
  
  for (let p=0; p<2; p++) {
    let image = new ImageData(canvas.width, canvas.height);
    img[p] = image;
    for (let i=0, l=image.data.length; i<l; i+=4) {
      image.data[i] = 0;
      image.data[i+1] = 0;
      image.data[i+2] = 0;
      image.data[i+3] = 255;
    }
  }
  
  ac = new AudioContext();

  let audio = document.getElementById('audio');
  
  mediaSource = new MediaElementAudioSourceNode(ac, {mediaElement: audio});

  analyzer = new AnalyserNode(ac, {
    fftSize: 1024,
  });

  mediaSource.connect(analyzer);
  analyzer.connect(ac.destination);

  freqData = new Float32Array(analyzer.frequencyBinCount);
  
  
  audio.addEventListener('play', () => {
    console.log('play');
    ac.resume();
    active = true;
    drawSpectrum();
  });
  
});

function drawSpectrum() {
  if (active && analyzer && canvas) {

    let w = canvas.width;
    let h = canvas.height;

    let src = img[0];
    let dst = img[1];

    // let tint = [.98, .99, 1];
    let tint = [.98, .98, 1];
    for (let x=1; x<w-1; x++) {
      for (let y=1; y<h/2; y++) {
	for (let c=0; c<3; c++) {
	  let val = tint[c]*(
	      .6 * src.data[4*(y*w+x)+c]
	      + .09 * src.data[4*(y*w+x+1)+c]
	      + .09 * src.data[4*(y*w+x-1)+c]
	      + .15 * src.data[4*((y+1)*w+x)+c]
	      + .05 * src.data[4*((y+2)*w+x)+c]);
	  dst.data[4*(y*w+x)+c] = dst.data[4*((h-y)*w+x)+c] = val;
	}
      }
    }

    analyzer.getFloatFrequencyData(freqData);

    let size = 300; // .8*freqData.length;
    let y = Math.round(h/2);
    for (let pos=0; pos<size; pos++) {
      let x = 5+pos; // Math.round(1+pos*(w-2)/size);
      let dataPos = 4*(y*w+x);
      let intensity = Math.round(255*Math.max(0, Math.min(1, (freqData[pos]+80)/65)));
      dst.data[dataPos] = dst.data[dataPos+1] = dst.data[dataPos+2] = intensity;
    }
    

    renderer.putImageData(dst, 0, 0);

    setTimeout(() => {
      requestAnimationFrame(drawSpectrum);
    }, 50);

    img[0] = dst;
    img[1] = src;
    
  }
}
