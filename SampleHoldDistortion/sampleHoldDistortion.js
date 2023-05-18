
let followChangeProb = .1;
let holdChangeProb = .1;

let maxSlope = 1;

const s_follow = 0;
const s_hold = 1;
const s_converge = 2;

function applyDistortion (audioBuffer) {
  let nbChannels = audioBuffer.numberOfChannels;
  let channels = [];
  let lastVal = [];
  for (let c=0; c<nbChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
    lastVal.push(0);
  }
  let stage = s_follow;
  for (let i=0, l=channels[0].length; i<l; i++) {
    let changeStage = false;
    switch(stage) {
    case s_follow:
      for (let c=0; c<nbChannels; c++)
	lastVal[c] = channels[c][i];
      // do nothing to audio, just check if we must change
      changeStage = Math.random() < followChangeProb;
      break;
    case s_hold:
      for (let c=0; c<nbChannels; c++)
	channels[c][i] = lastVal[c];
      changeStage = Math.random() < holdChangeProb;
      break;
    case s_converge:
      for (let c=0; c<nbChannels; c++) {
	if (lastVal[c]-channels[c][i] > maxSlope) {
	  lastVal[c] -= maxSlope;
	  channels[c][i] = lastVal[c];
	  changeStage = false;
	} else if (channels[c][i]-lastVal[c] > maxSlope) {
	  lastVal[c] += maxSlope;
	  channels[c][i] = lastVal[c];
	  changeStage = false;
	} else {
	  lastVal[c] = channels[c][i];
	}
      }
    }
    if (changeStage) {
      stage = (stage+1) % 3;
    }
  }
}

