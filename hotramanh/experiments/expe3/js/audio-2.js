
let ac = null;
let mediaSource = null;
let analyzer = null;
let canvas = null;

let freqData = null;

let active = false;

let alpha = [null, null];

let image = null;

let renderer = null;

window.addEventListener('DOMContentLoaded', () => {

  canvas = document.getElementById('canvas');
  let height = canvas.height = Math.round(canvas.clientHeight/2);
  let width  = canvas.width  = Math.round(canvas.clientWidth);
  renderer = canvas.getContext('2d');
  
  let tWidth = canvas.width-10;
  for (var fftSize = 32; fftSize < tWidth; fftSize *= 2) {}

  console.log(fftSize);
  
  for (let p=0; p<2; p++) {
    alpha[p] = new Float32Array(width*(height/2+1));
    alpha[p].fill(0);
  }
  
  image = new ImageData(width, height);

  let tint = [.95, .95, 1];

  let color = [255, 255, 255];
  for (let y=height/2-1; y>=0; y--) {
    let col = [Math.round(color[0]), Math.round(color[1]), Math.round(color[2])];
    let base = y*width;
    let esab = (height-1-y)*width;
    for (let x=0; x<width; x++) {
      for (let c=0; c<3; c++) {
	image.data[4*(base+x)+c] = col[c];
	image.data[4*(esab+x)+c] = col[c];
      }
    }
    for (let c=0; c<3; c++) {
      color[c] *= tint[c];
    }
  }
  
  ac = new AudioContext();

  let audio = document.getElementById('audio');
  
  mediaSource = new MediaElementAudioSourceNode(ac, {mediaElement: audio});

  analyzer = new AnalyserNode(ac, { fftSize: 2*fftSize });

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

    let src = alpha[0];
    let dst = alpha[1];

    let middle = Math.round(h/2-1);
    
    for (let y=0; y<middle; y++) {
      let base = y*w;
      let amp = .94 + .07*(y/middle); //.98;
      let factors = [.6, .09, .09, .13, .04];
      let total = factors.reduce((acc, x) => acc+x, 0);
      factors = factors.map (x => amp*x/total);
      for (let x=1; x<w-1; x++) {
	dst[base+x] =
	    factors[0] * src[base+x]
	  + factors[1] * src[base+x+1]
	  + factors[2] * src[base+x-1]
	  + factors[3] * src[base+w+x]
	  + factors[4] * src[base+2*w+x];
      }
    }
    
    analyzer.getFloatFrequencyData(freqData);

    for (let pos=0; pos<w-10; pos++) {
      let x = 5+pos;
      let val = (freqData[pos]+80)/45;
      val = 255*Math.max(0, Math.min(1, val));
      dst[middle*w+x] = val;
      dst[(middle+1)*w+x] = val;
    }

    for (let y=0; y<h/2; y++) {
      let base = y*w;
      let esab = (h-1-y)*w;
      for (let x=0; x<w; x++) {
	let val = Math.round(dst[base+x]);
	image.data[4*(base+x)+3] = val;
	image.data[4*(esab+x)+3] = val;
      }
    }

    renderer.putImageData(image, 0, 0);

    setTimeout(() => {
      requestAnimationFrame(drawSpectrum);
    }, 50);

    alpha[0] = dst;
    alpha[1] = src;
    
  }
}
