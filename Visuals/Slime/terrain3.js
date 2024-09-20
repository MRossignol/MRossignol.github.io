(function() {
  
  const save = true;
  const vqual = 0.99;
  const fps = 30;
  
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

  const setTerrainRange = (terrain, min, max) => {
    let aMin = 1e9;
    let aMax = 0;
    for (let i=0; i<width; i++) {
      for (let j=0; j<height; j++) {
	let v = terrain[i][j];
	if (v < aMin) aMin = v;
	if (v > aMax) aMax = v;
      }
    }
    const scale = (max-min)/(aMax-aMin);
    for (let i=0; i<width; i++) {
      for (let j=0; j<height; j++) {
	let v = terrain[i][j];
	terrain[i][j] = Math.round(min + scale*(v-aMin));
      }
    }
  };

  const drawTerrain = (terrain) => {
    for (let i=0; i<width; i++) {
      for (let j=0; j<height; j++) {
	var index = (i + j * width) * 4;
	canvasData.data[index + 0] = canvasData.data[index + 1] = canvasData.data[index + 2] = terrain[i][j];
	canvasData.data[index + 3] = 255;
      }
    }
    context.putImageData(canvasData, 0, 0);
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

  const nbSlimes = 3;

  const colors = [
    {base: [150, 150, 60], range: [30, 40, 10], mult: [2, 1, 3], edge: [230, 70, 10], shadow: [50, 250, 190] },
    {base: [95, 120, 190], range: [10, 30, 40], mult: [3, 2, 1], edge: [200, 0, 230], shadow: [200, 250, 40] },
    {base: [50, 190, 120], range: [20, 40, 30], mult: [3, 1, 2], edge: [0, 0, 0], shadow: [200, 50, 240] }
  ];
  const nbColors = colors.length;
  
  var slimes = [];

  var shadowCanvas, shadowContext;
  var slimeCanvas = [], slimeContext = [], slimeImageData = [];
  var doSlime = false;
  
  var slimeStepPoints = [];
  var slimeImages = [];

  var initX, initY;

  var initTime;

  var elapsedSteps = 0;
  if (save) performance.now = () => 1000*elapsedSteps/fps;

  var videoWriter = new WebMWriter({
    quality: vqual,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
    fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
    fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)
    // You must supply one of:
    frameDuration: null, // Duration of frames in milliseconds
    frameRate: fps,     // Number of frames per second
    transparent: false,      // True if an alpha channel should be included in the video
    alphaQuality: undefined  // Allows you to set the quality level of the alpha channel separately.
                             // If not specified this defaults to the same value as `quality`.
  });

  var offCanvas, offContext;
    
  const stopTerrainGrowth = (x, y) => {
    [initX, initY] = [x, y];
    doStep = false;
    doSlime = true;
    console.log(stepsAt0);
    //slime = new Slime(terrain, x, y);
    const bt = blurredTerrain(terrain, [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]);
    setTerrainRange(bt, 10, 80);
    drawTerrain(bt);
    [shadowCanvas, shadowContext] = newCanvasAndContext();
    for (let i=0; i<nbSlimes; i++) {
      slimes[i] = new SlimeManager();
      [slimeCanvas[i], slimeContext[i]] = newCanvasAndContext();
      slimeImageData[i] = slimeContext[i].getImageData(0, 0, width, height);
      slimeStepPoints[i] = [];
    }
    slimeCanvas[nbSlimes-1].addEventListener('click', (e) => {
      doSlime = false;
      if (!save) return;
      videoWriter.complete().then((webmBlob) => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(webmBlob);
        a.click();
      });
    });
    const d = 40;
    const d1 = d*(.7+.6*Math.random());
    const d2 = d*(.7+.6*Math.random());
    const d3 = d*(.7+.6*Math.random());
    let startPoints = [
      [Math.floor(width/2 + 1.6*d1), Math.floor(height/2)],
      [Math.floor(width/2 - 1.6*d2/2), Math.floor(height/2+.5*d2*Math.sqrt(3))],
      [Math.floor(width/2 - 1.6*d3/2), Math.floor(height/2-.5*d3*Math.sqrt(3))]
    ];
    Promise.all(slimes.map((s, i) => s.init(bt, startPoints[i][0], startPoints[i][1], slimeImageData[i]))).then(() => {
      slimes.forEach((s, j) => {
	s.setBPM(60);
	s.setGrowthSpeed(.005, 1, 20);
	s.setColors(colors[j % nbColors]);
      });
      slimes[0].setAttractor(startPoints[0][0], startPoints[0][1], d, d);
      slimes[1].setAttractor(startPoints[1][0], startPoints[1][1], d, d);
      slimes[2].setAttractor(startPoints[2][0], startPoints[2][1], d, d);
      for (let a=0; a<nbSlimes; a++) {
	for (let b=0; b<nbSlimes; b++) {
	  if (a != b) slimes[a].markTaboo([startPoints[b]]);
	}
      }
      [offCanvas, offContext] = newCanvasAndContext();
      offCanvas.style.display = 'none';
      if (save) addFrame();
      initTime = performance.now();
      stepAllSlimes();
      if (save) runAndSaveSlime();
      else runSlime();
    });
  };
  
  const stepAllSlimes = () => {
    slimeImageData.fill(null);
    var t = (performance.now() - initTime) / 1000;
    const step = (num, newPoints) => {
      if (num>0) {
	const pNum = num-1;
	slimes[pNum].draw(t).then((dat) => {
	  slimeImageData[pNum] = dat.imgData;
	});
	slimeStepPoints[pNum].push(newPoints);
	for (let i=0; i<nbSlimes; i++) {
	  if (i != pNum) slimes[i].markTaboo(newPoints);
	}
      }
      if (num < nbSlimes) {
	slimes[num].grow().then((dat) => {
	  step(num+1, dat.newPoints);
	});
      }
    };
    step(0);
  };

  const drawSlimePoints = () => {
    // let list = slimeStepPoints.reduce((a,x) => a.concat(x), []);
    // list.sort();
    // list = list.filter((v, i) => i==0 || list[i-1] != v);
    shadowContext.filter = 'blur(2px)';
    shadowContext.globalAlpha = 0.04;
    slimeStepPoints.forEach((list, i) => {
      while (list.length > 10) list.shift();
      const col = colors[i % nbColors].shadow;
      shadowContext.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      shadowContext.beginPath();
      for (let l of list) {
	for (let p of l) {
	  const y = Math.floor(p/width);
	  const x = p % width;
	  shadowContext.moveTo(x, y);
	  shadowContext.arc(x, y, 2, 0, 2*Math.PI);
	}
      }
      shadowContext.fill();
    });
    slimeStepPoints.forEach((list, i) => {
      if (list.length == 10) {
	const l = list[0];
	for (let p of l) {
	  const y = Math.floor(p/width);
	  const x = p % width;
	  shadowContext.clearRect(x, y, 1, 1);
	}
      }
    });
  };

  const runSlime = () => {
    if (!doSlime) return;
    requestAnimationFrame(runSlime);
    if (slimeImageData.reduce((a, x) => a && x, true)) {
      drawSlimePoints();
      for (let i=0; i<nbSlimes; i++) {
	slimeContext[i].putImageData(slimeImageData[i], 0, 0);
      }
      stepAllSlimes();
    }
  };
  
  const runAndSaveSlime = () => {
    if (!doSlime) return;
    if (slimeImageData.reduce((a, x) => a && x, true)) {
      drawSlimePoints();
      for (let i=0; i<nbSlimes; i++) {
	slimeContext[i].putImageData(slimeImageData[i], 0, 0);
      }
      addFrame();
      elapsedSteps++;
      stepAllSlimes();
      requestAnimationFrame(runAndSaveSlime);
    } else {
      requestAnimationFrame(runAndSaveSlime);
    }
  };

  const addFrame = () => {
    offContext.drawImage(canvas, 0, 0);
    offContext.drawImage(shadowCanvas, 0, 0);
    for (let c of slimeCanvas) {
      offContext.drawImage(c, 0, 0);
    }
    videoWriter.addFrame(offCanvas);
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
