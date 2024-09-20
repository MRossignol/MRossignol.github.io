(function() {

  const terrain = [];
  var width, height;
  var canvas, context, canvasData;

  const speed = 10000;

  const prepare = (w, h) => {
    width = w;
    height = h;
    for (let i=0; i<w; i++)
      terrain.push(new Float32Array(h));
  };

  function* pointIterator (cx, cy, size) {
    if (size == 0) {
      yield[cx, cy];
      return 1;
    }
    let iterationCount = 0;
    for (let x = Math.max(0, cx-size); x <= Math.min(cx+size, width-1); x++) {
      iterationCount++;
      yield[x,cy];
    }
    for (let d=0; d<size; d++) {
      let y = d+.5;
      let w = Math.round(Math.sqrt(size*size-y*y));
      for (let x = Math.max(0, cx-w); x <= Math.min(width-1, cx+w); x++) {
        if (cy-d-1 >= 0) {
          yield [x, cy-d-1];
          iterationCount++;
        }
        if (cy+d+1 < height) {
          yield [x, cy+d+1];
          iterationCount++;
        }
      }
    }
    return iterationCount;
  }


  const addDot = (size) => {
    let x0 = Math.floor(width*Math.random());
    let y0 = Math.floor(height*Math.random());
    let val = terrain[x0][y0]+1;
    for (let [x,y] of pointIterator(x0, y0, size+1)) {
      if (terrain[x][y] > val)
	val = terrain[x][y];
    }
    for (let [x,y] of pointIterator(x0, y0, size)) {
      terrain[x][y] = val;
    }
    return [x0, y0, val];
  };
  
  const drawPixel = (x0, y0, size, v) => {
    v = Math.round(v);
    if (v > 255) v = 255;
    for (let [x,y] of pointIterator(x0, y0, size)) {
      var index = (x + y * width) * 4;
      canvasData.data[index + 0] = canvasData.data[index + 1] = canvasData.data[index + 2] = v;
      canvasData.data[index + 3] = 255;
    }
  };

  var size = 100;
  var doStep = true;
  var stepsAt0 = 0;
  
  const step = () => {
    if (!doStep) return;
    if (size < 0) size = 0;
    var s = Math.round(size);
    for (let i=0; i<speed/((s+1)*(s+1)); i++) {
      let [x, y, v] = addDot(s);
      drawPixel(x, y, s, v);
    }
    if (size == 0) stepsAt0++;
    else size -= .2;
    context.putImageData(canvasData, 0, 0);
    requestAnimationFrame(step);
  };

  var slime = null;

  const blurredTerrain = (terrain, matrix) => {
    let xOffset = Math.floor(matrix.length/2);
    let yOffset = Math.floor(matrix[0].length/2);
    let newT = [];
    for (let i=0; i<width; i++) {
      newT.push(new Float32Array(height));
      for (let j=0; j<height; j++) {
        let total = 0;
        let weightSum = 0;
        for (let a = 0, x = i-xOffset; a < matrix.length; a++, x++) {
          if (x < 0 || x >= width) continue;
          for (let b = 0, y = j-xOffset; b < matrix[0].length; b++, y++) {
            if (y < 0 || y >= height) continue;
            total += matrix[a][b]*terrain[x][y];
            weightSum += matrix[a][b];
          }
        }
        newT[i][j] = total / weightSum;
      }
    }
    return newT;
  };

  const newCanvasAndContext = () => {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = width+'px';
    canvas.style.height = height+'px';
    document.body.appendChild(canvas);
    let context = canvas.getContext('2d');
    return [canvas, context];
  };

  var shadowCanvas, shadowContext;
  var slimeCanvas, slimeContext, slimeImageData;
  var doSlime = false;
  
  const stopTerrainGrowth = (x, y) => {
    if (doSlime) {
      doSlime = false;
      return;
    }
    doStep = false;
    doSlime = true;
    console.log(stepsAt0);
    //slime = new Slime(terrain, x, y);
    slime = new Slime(blurredTerrain(terrain, [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]), x, y);
    [shadowCanvas, shadowContext] = newCanvasAndContext();
    [slimeCanvas, slimeContext] = newCanvasAndContext();
    slimeImageData = slimeContext.getImageData(0, 0, width, height);
    slimeCanvas.addEventListener('click', (e) => stopTerrainGrowth(e.clientX, e.clientY));
    runSlime();
  };

  const runSlime = () => {
    if (!doSlime) return;
    slime.grow(0.01, 1, 20);
    slime.drawShadow(shadowContext);
    // slime.drawSlime(slimeContext);
    slime.plotSlime(slimeImageData.data);
    slimeContext.putImageData(slimeImageData, 0, 0);
    requestAnimationFrame(runSlime);
  };
  
  
  document.addEventListener('DOMContentLoaded', () => {
    prepare(1280, 720); // window.innerWidth, window.innerHeight);
    [canvas, context] = newCanvasAndContext();
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    canvasData = context.getImageData(0, 0, width, height);
    canvas.addEventListener('click', (e) => stopTerrainGrowth(e.clientX, e.clientY));
    step();
});
  
})();
