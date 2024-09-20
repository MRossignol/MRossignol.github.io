(function() {
  
  const save = true;
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

  // 10, 80
  const drawTranspTerrain = (terrain, alphaCurve, destContext) => {
    for (let i=0; i<width; i++) {
      for (let j=0; j<height; j++) {
	var index = (i + j * width) * 4;
	canvasData.data[index + 0] = canvasData.data[index + 1] = canvasData.data[index + 2] = terrain[i][j];
	canvasData.data[index + 3] = alphaCurve[terrain[i][j]];
      }
    }
    destContext.putImageData(canvasData, 0, 0);
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

  var videoWriter = new tarball.TarWriter();
  videoWriter.addFolder('slime_video');

  var offCanvas, offContext;

  var dissolving = 0;

  const stage2ClickListener = () => {
    slimeCanvas[nbSlimes-1].removeEventListener('click', stage2ClickListener);
    slimeCanvas[nbSlimes-1].addEventListener('click', stage3ClickListener);
    for (let s of slimes) {
      setTimeout(() => s.die(), 4000*Math.random());
    }
  };

  var minX = 1e9, minY=1e9, maxX = 0, maxY = 0;

  const stage3ClickListener = () => {
    slimeCanvas[nbSlimes-1].removeEventListener('click', stage3ClickListener);
    slimeCanvas[nbSlimes-1].addEventListener('click', stage4ClickListener);
    dissolving = 1;
    minX = Math.max(2, minX-6);
    minY = Math.max(2, minY-6);
    maxX = Math.min(width-3, maxX+6);
    maxY = Math.min(height-3, maxY+6);
    for (let i=3; i<4*(width*height); i+=4) {
      canvasData.data[i] = 0;
    }
  };

  const stage4ClickListener = () => {
    doSlime = false;
    if (!save) return;
    console.log('Generating tar...');
    videoWriter.download('slime_video');
  };

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
    slimeCanvas[nbSlimes-1].addEventListener('click', stage2ClickListener);
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
	s.setBPM(30);
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
      if (save) {
        canvas.toBlob((blob) => {
          videoWriter.addFileBlob('slime_video/terrain.png', blob);
        }, 'png');
        runAndSaveSlime();
      }
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
    var t = (performance.now() - initTime) / 1000;
    shadowContext.filter = 'blur(2px)';
    if (t < 60)
      shadowContext.globalAlpha = .015 + 0.02*t/60;
    else
      shadowContext.globalAlpha = 0.035;
    slimeStepPoints.forEach((list, i) => {
      while (list.length > 15) list.shift();
      const col = colors[i % nbColors].shadow;
      shadowContext.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      shadowContext.beginPath();
      for (let j=list.length-1; j>=5; j--){
        const l = list[j];
	for (let p of l) {
	  const y = Math.floor(p/width);
	  const x = p % width;
	  minX = Math.min(x, minX);
	  minY = Math.min(y, minY);
	  maxX = Math.max(x, maxX);
	  maxY = Math.max(y, maxY);
	  shadowContext.moveTo(x, y);
	  shadowContext.arc(x, y, 2, 0, 2*Math.PI);
	}
      }
      shadowContext.fill();
    });
    slimeStepPoints.forEach((list, i) => {
      for (let j=list.length-11; j>=0; j--){
	const l = list[j];
	for (let p of l) {
	  const y = Math.floor(p/width);
	  const x = p % width;
	  shadowContext.clearRect(x, y, 1, 1);
	}
      }
    });
  };

  const dissolveStep = () => {
    for (let i=0; i<dissolving/4; i++) {
      let x = Math.floor(minX+(maxX-minX)*Math.random());
      let y = Math.floor(minY+(maxY-minY)*Math.random());
      let index = 4*(x + y*width) + 3;
      canvasData.data[index] = Math.min(255, canvasData.data[index]+128);
      canvasData.data[index-4] = Math.min(255, canvasData.data[index]+64);
      canvasData.data[index+4] = Math.min(255, canvasData.data[index]+64);
      canvasData.data[index-4*width] = Math.min(255, canvasData.data[index]+64);
      canvasData.data[index+4*width] = Math.min(255, canvasData.data[index]+64);
    }
    slimeContext[nbSlimes-1].putImageData(canvasData, 0, 0);
    dissolving++;
  };
  
  const runSlime = () => {
    if (!doSlime) return;
    requestAnimationFrame(runSlime);
    if (dissolving) {
      dissolveStep();
      elapsedSteps++;
      return;
    }
    if (slimeImageData.reduce((a, x) => a && x, true)) {
      drawSlimePoints();
      for (let i=0; i<nbSlimes; i++) {
	slimeContext[i].putImageData(slimeImageData[i], 0, 0);
      }
      stepAllSlimes();
      elapsedSteps++;
    }
  };
  
  const runAndSaveSlime = () => {
    if (!doSlime) return;
    if (dissolving) {
      dissolveStep();
      addFrame();
      elapsedSteps++;
      requestAnimationFrame(runAndSaveSlime);
      return;
    }
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

  const six_digits = (num) => num < 10 ? '00000'+num : num < 100 ? '0000'+num : num<1000 ? '000'+num : num<10000 ? '00'+num : num < 100000 ? '0'+num : num;
  
  const addFrame = () => {
    // Background not saved to saved space. To add the background to all images run this:
    // for img in 0*.png; do composite $img terrain.png i_$img; done
    // Then make video with:
    // ffmpeg -framerate 30 -pattern_type glob -i 'i_*.png' -c:v libx264 -crf 15 -pix_fmt yuv420p out.mp4
    offContext.clearRect(0, 0, 1280, 720);
    // offContext.drawImage(canvas, 0, 0);
    offContext.drawImage(shadowCanvas, 0, 0);
    for (let c of slimeCanvas) {
      offContext.drawImage(c, 0, 0);
    }
    offCanvas.toBlob((blob) => {
      videoWriter.addFileBlob('slime_video/'+six_digits(elapsedSteps)+'.png', blob);
    }, 'png');
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
