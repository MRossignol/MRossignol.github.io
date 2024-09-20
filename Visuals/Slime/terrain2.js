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
  
  const stopTerrainGrowth = (x, y) => {
    [initX, initY] = [x, y];
    if (doSlime) {
      doSlime = false;
      return;
    }
    doStep = false;
    doSlime = true;
    console.log(stepsAt0);
    //slime = new Slime(terrain, x, y);
    const bt = blurredTerrain(terrain, [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]);
    setTerrainRange(bt, 10, 100);
    drawTerrain(bt);
    [shadowCanvas, shadowContext] = newCanvasAndContext();
    for (let i=0; i<nbSlimes; i++) {
      slimes[i] = new SlimeManager();
      [slimeCanvas[i], slimeContext[i]] = newCanvasAndContext();
      slimeImageData[i] = slimeContext[i].getImageData(0, 0, width, height);
      slimeStepPoints[i] = null;
    }
    slimeCanvas[nbSlimes-1].addEventListener('click', (e) => stopTerrainGrowth(e.clientX, e.clientY));
    const d = 50;
    let startPoints = [
      [Math.floor(width/2 + d), Math.floor(height/2)],
      [Math.floor(width/2 - d/2), Math.floor(height/2+.5*d*Math.sqrt(3))],
      [Math.floor(width/2 - d/2), Math.floor(height/2-.5*d*Math.sqrt(3))]
    ];
    Promise.all(slimes.map((s, i) => s.init(bt, startPoints[i][0], startPoints[i][1], slimeImageData[i]))).then(() => {
      slimes.forEach((s, j) => {
	s.setGrowthSpeed(.01, 1, 30);
	s.setColors(colors[j % nbColors]);
      });
      for (let a=0; a<nbSlimes; a++) {
	for (let b=0; b<nbSlimes; b++) {
	  if (a != b) slimes[a].markTaboo([startPoints[b]]);
	}
      }
      initTime = window.performance.now();
      stepAllSlimes();
      runSlime();
    });
  };
  
  const stepAllSlimes = () => {
    let t = (window.performance.now() - initTime) / 1000;
    for (let i=0; i<nbSlimes; i++) {
      slimes[i].step(t).then((dat) => {
	slimeStepPoints[i] = dat.newPoints;
	slimeImageData[i] = dat.imgData;
      });
    }
  };

  const drawSlimePoints = () => {
    // let list = slimeStepPoints.reduce((a,x) => a.concat(x), []);
    // list.sort();
    // list = list.filter((v, i) => i==0 || list[i-1] != v);
    shadowContext.filter = 'blur(2px)';
    shadowContext.globalAlpha = 0.2;
    slimeStepPoints.forEach((list, i) => {
      const col = colors[i % nbColors].shadow;
      shadowContext.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      shadowContext.beginPath();
      for (let p of list) {
	const y = Math.floor(p/width);
	const x = p % width;
	shadowContext.moveTo(x, y);
	shadowContext.arc(x, y, 2, 0, 2*Math.PI);
      }
      shadowContext.fill();
    });
  };
  
  const runSlime = () => {
    requestAnimationFrame(runSlime);
    if (slimeStepPoints.reduce((a, x) => a && x, true)) {
      drawSlimePoints();
      for (let i=0; i<nbSlimes; i++) {
	slimeContext[i].putImageData(slimeImageData[i], 0, 0);
      }
      for (let i=0; i<nbSlimes; i++) {
	for (let j=0; j<nbSlimes; j++) {
	  if (i != j) slimes[i].markTaboo(slimeStepPoints[j]);
	}
      }
      slimeStepPoints = slimeStepPoints.map(() => null);
      slimeImageData = slimeImageData.map(() => null);
      stepAllSlimes();
    }
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
