
importScripts('Slime4.js');

var slime = null;
var width, height;

function initSlime (terrain, x, y) {
  slime = new Slime(terrain, x, y);
  width = slime.w;
  height = slime.h;
}

onmessage = (e) => {
  switch (e.data.operation) {
  case 'init':
    initSlime(e.data.terrain, e.data.x, e.data.y);
    postMessage({
      status: 'ready'
    });
    break;
  case 'speed':
    slime.setGrowthSpeed(e.data.factor, e.data.min, e.data.max);
    break;
  case 'bpm':
    slime.bpm = e.data.bpm;
    break;
  case 'colors':
    slime.colors = e.data.colors;
    break;
  case 'taboo':
    slime.markTaboo(e.data.points);
    break;
  case 'setAttractor':
    slime.setAttractorField(e.data.cx, e.data.cy, e.data.rx, e.data.ry);
    break;
  case 'releaseAttractor':
    slime.releaseAttractorField();
    break;
  case 'grow':
    let newBorderPoints = slime.grow();
    postMessage({
      status: 'grown',
      newPoints: newBorderPoints
    });
    break;
  case 'draw':
    slime.plot(e.data.time, e.data.imgData.data);
    postMessage({
      status: 'drawn',
      imgData: e.data.imgData
    }, [e.data.imgData.data.buffer]);
    break;
  case 'die':
    slime.die();
    break;
  }

};
