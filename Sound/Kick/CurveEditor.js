
function CurveEditor (minimizedDiv, options) {

  var hMin = options.hasOwnProperty('hMin') ? options.hMin : CurveEditor.defaults.hMin;
  var hMax = options.hasOwnProperty('hMax') ? options.hMax : CurveEditor.defaults.hMax;
  var vMin = options.hasOwnProperty('vMin') ? options.vMin : CurveEditor.defaults.vMin;
  var vMax = options.hasOwnProperty('vMax') ? options.vMax : CurveEditor.defaults.vMax;
  var vScale = options.hasOwnProperty('vScale') ? options.vScale : CurveEditor.defaults.vScale;
  var dotColor = options.hasOwnProperty('dotColor') ? options.dotColor : CurveEditor.defaults.dotColor;
  var dotSize = options.hasOwnProperty('dotSize') ? options.dotSize : CurveEditor.defaults.dotSize;
  var lineColor = options.hasOwnProperty('lineColor') ? options.lineColor : CurveEditor.defaults.lineColor;
  var lineThickness = options.hasOwnProperty('lineThickness') ? options.lineThickness : CurveEditor.defaults.lineThickness;
  var textColor = options.hasOwnProperty('textColor') ? options.textColor : CurveEditor.defaults.textColor;
  var textFont = options.hasOwnProperty('textFont') ? options.textFont : CurveEditor.defaults.textFont;
  var bgColor = options.hasOwnProperty('bgColor') ? options.bgColor : CurveEditor.defaults.bgColor;
  var gridColor = options.hasOwnProperty('gridColor') ? options.gridColor : CurveEditor.defaults.gridColor;
  var loopConnect = options.hasOwnProperty('loopConnect') ? options.loopConnect : CurveEditor.defaults.loopConnect;
  var state = [];
  if (options.hasOwnProperty('init')) {
    options.init.forEach(function(p) {
      state.push({vx:p.vx, vy:p.vy});
    });
  } else {
    state = [{vx:hMin, vy:vMax}, {vx:hMax, vy:vMin}];
  }
  var active = false;
  var inTransition = false;
  
  var dimensions, imageWidth, imageHeight;

  var leftMargin, rightMargin, topMargin, bottomMargin;
  var xMin, xMax, yMin, yMax;
  var graphWidth, graphHeight;
  var logAdd, logScale;
  var xPrecision, yPrecision;
  var logLines = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, .5, .2, .1];

  function updateBoundaries (activeState) {
    if (activeState) {
      dimensions = {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
      imageWidth = dimensions.width;
      imageHeight = dimensions.height;
      leftMargin = 100;
      rightMargin = 120;
      topMargin = 50;
      bottomMargin = 180;
      xMin = leftMargin;
      yMax = topMargin;
      xMax = dimensions.width-rightMargin;
      yMin = dimensions.height-bottomMargin;
      graphWidth = xMax-xMin;
      graphHeight = yMin-yMax;
      logAdd = Math.log(vMin);
      logScale = Math.log(vMax)-logAdd;
      xPrecision = 1;
      while (xPrecision < graphWidth/(hMax-hMin)) xPrecision *= 10;
      yPrecision = 1;
      while (yPrecision < graphHeight/(vMax-vMin)) yPrecision *= 10;
    } else {
      dimensions = minimizedDiv.getBoundingClientRect();
      imageWidth = dimensions.width;
      imageHeight = dimensions.height;
      xMin = leftMargin = 2;
      xMax = imageWidth - 2;
      graphWidth = xMax - xMin;
      yMax = topMargin = 2;
      yMin = imageHeight - 2;
      graphHeight = yMin - yMax;
      rightMargin = bottomMargin = 2;
      logAdd = Math.log(vMin);
      logScale = Math.log(vMax)-logAdd;
    }
  }

  updateBoundaries(false);
  
  var minDiv = document.createElement('div');
  minDiv.classList.add('curveEditorMinimized');
  minDiv.style.left = dimensions.left+'px';
  minDiv.style.top = dimensions.top+'px';
  minDiv.style.width = dimensions.width+'px';
  minDiv.style.height = dimensions.height+'px';

  var minimizedCanvas = document.createElement('canvas');
  minimizedCanvas.width = imageWidth;
  minimizedCanvas.height = imageHeight;
  minimizedCanvas.style.width = imageWidth+'px';
  minimizedCanvas.style.height = imageHeight+'px';
  minDiv.appendChild(minimizedCanvas);
  
  minimizedCanvas.addEventListener('mouseup', onMouseUp);

  var maxDiv = document.createElement('div');
  maxDiv.classList.add('curveEditorMaximized');
  maxDiv.style.width = window.innerWidth+'px';
  maxDiv.style.height = window.innerHeight+'px';

  var maximizedCanvas = document.createElement('canvas');
  maximizedCanvas.width = window.innerWidth;
  maximizedCanvas.height = window.innerHeight;
  maximizedCanvas.style.width = window.innerWidth+'px';
  maximizedCanvas.style.height = window.innerHeight+'px';
  maxDiv.appendChild(maximizedCanvas);
  
  maximizedCanvas.addEventListener('mousemove', onMouseMove);
  maximizedCanvas.addEventListener('mousedown', onMouseDown);
  maximizedCanvas.addEventListener('mouseup', onMouseUp);

  var screenRenderContext = minimizedCanvas.getContext("bitmaprenderer");

  var infoBox = document.createElement('div');
  infoBox.classList.add('infoBox');
  infoBox.style.color = textColor;
  maxDiv.appendChild(infoBox);

  var vLabelDiv = document.createElement('div');
  vLabelDiv.classList.add('vLabel');
  vLabelDiv.style.color = textColor;
  vLabelDiv.innerText = options.hasOwnProperty('vLabel') ? options.vLabel : 'y';
  maxDiv.appendChild(vLabelDiv);

  var hLabelDiv = document.createElement('div');
  hLabelDiv.classList.add('hLabel');
  hLabelDiv.style.color = textColor;
  hLabelDiv.innerText = options.hasOwnProperty('hLabel') ? options.hLabel : 'x';
  maxDiv.appendChild(hLabelDiv);

  var doneButton = document.createElement('input');
  doneButton.type='button';
  doneButton.value = 'Done';
  doneButton.addEventListener('click', minimize);
  maxDiv.appendChild(doneButton);

  var infoDiv = document.createElement('div');
  infoDiv.classList.add('info');
  infoDiv.innerHTML = '<p>Click to add a control point.</p><p>Drag control points to edit.</p><p>Shift-click a control point to remove it.</p>';
  maxDiv.appendChild(infoDiv);

  var extraElements = [infoBox, vLabelDiv, hLabelDiv, doneButton, infoDiv];
  
  document.body.appendChild(minDiv);
  document.body.appendChild(maxDiv);

  var backgroundImage = null; // drawBackgroundImage();
  drawState();

  
  function drawBackgroundImage() {
    var canvas = new OffscreenCanvas(imageWidth, imageHeight);
    var context = canvas.getContext('2d');
    context.fillStyle = bgColor;
    context.fillRect(0, 0, imageWidth, imageHeight);

    context.fillStyle = gridColor;
    
    var hSpacing = 0.1;
    logLines.forEach( function(spacing) {
      var nbLines = (hMax-hMin) / spacing;
      if (nbLines <= 10) hSpacing = spacing;
    });
    for (var gridVX = hSpacing*Math.round(hMin/hSpacing); gridVX <= hMax; gridVX += hSpacing) {
      context.fillRect(Math.round(valToX(gridVX)), yMax, 1, graphHeight);
    }
    if (vScale == 'log') {
      logLines.forEach( function(gridVY) {
	if (gridVY > vMin && gridVY <= vMax) 
	  context.fillRect(leftMargin, Math.round(valToY(gridVY)), graphWidth, 1);
      });
    } else {
      var vSpacing = 0.1;
      logLines.forEach(function(spacing) {
	var nbLines = (vMax-vMin) / spacing;
	if (nbLines <= 10) vSpacing = spacing;
      });
      for (var gridVY = vSpacing*Math.round(vMin/vSpacing); gridVY <= vMax; gridVY += vSpacing) {
	context.fillRect(leftMargin, Math.round(valToY(gridVY)), graphWidth, 1);
      }
    }

    context.fillStyle = textColor;
    context.fillRect(leftMargin, Math.round(valToY(vMin)), graphWidth, 1);
    context.fillRect(Math.round(valToX(hMin)), yMax, 1, graphHeight);
    context.font = textFont;
    for (gridVX = hSpacing*Math.round(hMin/hSpacing); gridVX <= hMax; gridVX += hSpacing) {
      gridVX = Math.round(10*gridVX)/10;
      context.fillText(gridVX, Math.round(valToX(gridVX)-context.measureText(gridVX).width/2), graphHeight+yMax+22);
    }
    if (vScale == 'log') {
      logLines.forEach( function(gridVY) {
	if (gridVY >= vMin && gridVY <= vMax)
	  context.fillText(gridVY, leftMargin-context.measureText(gridVY).width-14, Math.round(valToY(gridVY))+4);
      });
    } else {
      for (gridVY = vSpacing*Math.round(vMin/vSpacing); gridVY <= vMax; gridVY += vSpacing) {
	context.fillText(gridVY, leftMargin-context.measureText(gridVY).width-14, Math.round(valToY(gridVY))+4);
      }
    }
    return canvas.transferToImageBitmap();
  }

  var busy = false;
  var canvas = new OffscreenCanvas(imageWidth, imageHeight);
  var context = canvas.getContext('2d');

  function drawState (targetDimensions, onDone) {
    if (busy) return;
    if (typeof(targetDimensions) != 'undefined') {
      xMin = targetDimensions.xMin;
      xMax = targetDimensions.xMax;
      yMin = targetDimensions.yMin;
      yMax = targetDimensions.yMax;
      graphWidth = targetDimensions.graphWidth;
      graphHeight = targetDimensions.graphHeight;
    };
    busy = true;
    requestAnimationFrame(function() {
      drawState_instant();
      busy = false;
      if (onDone) onDone();
    });
  }

  function drawState_instant () {
    if (active) {
      context.drawImage(backgroundImage, 0, 0);
    } else {
      context.fillStyle = bgColor;
      context.fillRect(xMin, yMax, graphWidth, graphHeight);
      context.fillStyle = gridColor;
      context.fillRect(xMin, yMin, 1, -graphHeight);
      context.fillRect(xMin, yMin, graphWidth, 1);
    }
    context.fillStyle = dotColor;
    context.strokeStyle = lineColor;
    context.lineWidth = lineThickness;
    context.beginPath();
    var first = true;
    state.forEach(function(point) {
      if (first) {
	context.moveTo(valToX(point.vx), valToY(point.vy));
	first = false;
      } else {
	context.lineTo(valToX(point.vx), valToY(point.vy));
      }
    });
    context.stroke();
    if (active) {
      context.beginPath();
      state.forEach(function(point) {
	context.moveTo(valToX(point.vx), valToY(point.vy));
	context.arc(valToX(point.vx), valToY(point.vy), dotSize, 0, 2*Math.PI);
      });
      context.fill();
    }
    screenRenderContext.transferFromImageBitmap(canvas.transferToImageBitmap());
  }

  function maximize () {
    if (inTransition) return;
    inTransition = true;
    var origin = {
      xMin: dimensions.left + xMin,
      xMax: dimensions.left + xMax,
      graphWidth: graphWidth,
      yMin: dimensions.top + yMin,
      yMax: dimensions.top + yMax,
      graphHeight: graphHeight
    };
    extraElements.forEach(function(elem) {
      elem.style.visibility='hidden';
    });
    maxDiv.style.display = 'block';
    screenRenderContext = maximizedCanvas.getContext("bitmaprenderer");
    canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    context = canvas.getContext('2d');
    drawState(origin, function() {
      minDiv.style.display = 'none';
      updateBoundaries(true);
      backgroundImage = drawBackgroundImage();
      var d_xMin = xMin-origin.xMin;
      var d_xMax = xMax-origin.xMax;
      var d_yMin = yMin-origin.yMin;
      var d_yMax = yMax-origin.yMax;
      var d_width = graphWidth - origin.graphWidth;
      var d_height = graphHeight - origin.graphHeight;
      var startTime = Date.now();
      var duration = 150;
      var locationAtTime = function (t) {
	var ratio = (t-startTime) / duration;
	return {
	  xMin: origin.xMin + ratio*d_xMin,
	  xMax: origin.xMax + ratio*d_xMax,
	  yMin: origin.yMin + ratio*d_yMin,
	  yMax: origin.yMax + ratio*d_yMax,
	  graphWidth: origin.graphWidth + ratio*d_width,
	  graphHeight: origin.graphHeight + ratio*d_height
	};
      };
      animate(locationAtTime, startTime+duration, function() {
	active = true;
	updateBoundaries(true);
	drawState();
	extraElements.forEach(function(elem) {
	  elem.style.visibility='visible';
	});
	inTransition = false;
      });
    });
  };

  function minimize () {
    if (inTransition) return;
    inTransition = true;
    var origin = {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
      graphWidth: graphWidth,
      graphHeight: graphHeight
    };
    active = false;
    updateBoundaries(false);
    var d_xMin = dimensions.left+xMin-origin.xMin;
    var d_xMax = dimensions.left+xMax-origin.xMax;
    var d_yMin = dimensions.top+yMin-origin.yMin;
    var d_yMax = dimensions.top+yMax-origin.yMax;
    var d_width = graphWidth - origin.graphWidth;
    var d_height = graphHeight - origin.graphHeight;
    var startTime = Date.now();
    var duration = 150;
    var locationAtTime = function (t) {
      var ratio = (t-startTime) / duration;
      return {
	xMin: origin.xMin + ratio*d_xMin,
	xMax: origin.xMax + ratio*d_xMax,
	yMin: origin.yMin + ratio*d_yMin,
	yMax: origin.yMax + ratio*d_yMax,
	graphWidth: origin.graphWidth + ratio*d_width,
	graphHeight: origin.graphHeight + ratio*d_height
      };
    };
    extraElements.forEach(function(elem) {
      elem.style.visibility='hidden';
    });
    animate(locationAtTime, startTime+duration, function() {
      updateBoundaries(false);
      canvas = new OffscreenCanvas(imageWidth, imageHeight);
      context = canvas.getContext('2d');
      screenRenderContext = minimizedCanvas.getContext("bitmaprenderer");
      minDiv.style.display = 'block';
      drawState_instant();
      maxDiv.style.display = 'none';
      inTransition = false;
    });
  };

  function animate (locationAtTime, targetTime, onDone) {
    var t = Date.now();
    if (t >= targetTime) {
      onDone();
    } else {
      var pos = locationAtTime(t);
      drawState(locationAtTime(t), function() {
	animate(locationAtTime, targetTime, onDone);
      });
    }
  }
  
  var currentlyDragging = -1;

  function onMouseDown (event) {
    var x = event.clientX-dimensions.left;
    var y = event.clientY-dimensions.top;
    var vx = xToVal(x);
    var vy = yToVal(y);
    var minDistance = 1000;
    var bestMatch = -1;
    state.forEach( function(state, index) {
      var dx = valToX(state.vx)-x;
      var dy = valToY(state.vy)-y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDistance) {
	minDistance = dist;
	bestMatch = index;
      }
    });
    var newState = [];
    if (event.shiftKey) {
      if (minDistance < 10 && bestMatch > 0 && bestMatch < state.length-1) {
	state.forEach(function(p, i) { if (i != bestMatch) newState.push(p);});
	currentlyDragging = -1;
	state = newState;
	drawState();
      }
    } else {
      if (minDistance < 15) {
	currentlyDragging = bestMatch;
      } else {
	var newPoint = {vx: vx, vy: vy};
	for (var pos = 0; pos < state.length; pos++) {
	  if (vx == state[pos].vx) return;
	  newState.push(state[pos]);
	  if (pos < state.length-1 && vx > state[pos].vx && vx < state[pos+1].vx) {
	    currentlyDragging = pos+1;
	    newState.push(newPoint);
	  }
	}
	state = newState;
      }
      onMouseMove(event);
    }
  }

  function onMouseUp (event) {
    if (!active) maximize();
    currentlyDragging = -1;
  }
  
  function onMouseMove (event) {
    var x = event.clientX-dimensions.left;
    var y = event.clientY-dimensions.top;
    var vx = xToVal(x);
    var vy = yToVal(y);
    infoBox.innerText = (Math.round(vx*xPrecision)/xPrecision)+' / '+(Math.round(vy*yPrecision)/yPrecision);
    if (currentlyDragging >= 0) {
      if (currentlyDragging > 0 && currentlyDragging < state.length-1) {
	if (vx <= state[currentlyDragging-1].vx) vx = state[currentlyDragging-1].vx +.001;
	if (vx >= state[currentlyDragging+1].vx) vx = state[currentlyDragging+1].vx -.001;
	state[currentlyDragging].vx = vx;
      }
      state[currentlyDragging].vy = vy;
      if (loopConnect) {
	if (currentlyDragging == 0) state[state.length-1].vy = vy;
	if (currentlyDragging == state.length-1) state[0].vy = vy;
      }
      drawState();
    }
  }
  
  function xToVal (x) {
    if (x<xMin) x = xMin;
    if (x>xMax) x = xMax;
    return hMin + (hMax-hMin)*(x-xMin)/(xMax-xMin);
  }
  
  function yToVal (y) {
    if (y>yMin) y = yMin;
    if (y<yMax) y = yMax;
    var ratio = (y-yMin)/(yMax-yMin);
    if (vScale == 'lin') {
      return vMin + (vMax-vMin)*ratio;
    } else {
      return Math.exp(logAdd+logScale*ratio);
    }
  }
  
  function valToX (val) {
    return xMin + graphWidth*(val-hMin)/(hMax-hMin);
  }
  
  function valToY (val) {
    var ratio = (vScale == 'lin') ? (val-vMin)/(vMax-vMin) : (Math.log(val)-logAdd)/logScale;
    var res = yMin - graphHeight*ratio;
    return res;
  }

  this.setHMax = function (newVal) {
    if (newVal == hMax) return;
    if (newVal < hMax && newVal <= state[state.length-2].vx) {
      for (var i=1; i<state.length-1; i++) {
	state[i].vx *= newVal/hMax;
      }
    }
    state[state.length-1].vx = newVal;
    hMax = newVal;
    xPrecision = 1;
    while (xPrecision < graphWidth/(hMax-hMin)) xPrecision *= 10;
    backgroundImage = drawBackgroundImage();
    drawState();
  };
  
  this.getCurve = function () {
    var res = [];
    state.forEach(function(p) {
      res.push({vx: p.vx, vy: p.vy});
    });
    return res;
  };
  
  this.destroy = function () {
    document.body.removeChild(rootDiv);
  };

  this.setState = function (newState) {
    hMin = newState[0].vx;
    hMax = newState[newState.length-1].vx;
    state = [];
    newState.forEach(function(p) {
      state.push({vx: p.vx, vy: p.vy});
    });
    xPrecision = 1;
    while (xPrecision < graphWidth/(hMax-hMin)) xPrecision *= 10;
    backgroundImage = drawBackgroundImage();
    drawState();
  };

  function roundX(value) {
    let parts = value.toString().split('.');
  }
  
  this.toString = function () {
    return state.map(v => v.vx+' '+v.vy).join(' ');
  };

  this.loadString = function (string) {
    let values = string.split(/ +/);
    state = [];
    for (var i=0; i<values.length-1; i+=2) {
      state.push({vx:1*values[i], vy:1*values[i+1]});
    }
    hMin = state[0].vx;
    hMax = state[state.length-1].vx;
    xPrecision = 1;
    while (xPrecision < graphWidth/(hMax-hMin)) xPrecision *= 10;
    backgroundImage = drawBackgroundImage();
    drawState();
  };
  
}

CurveEditor.defaults = {
  hMin: 0,
  hMax: 1,
  vMin: 1,
  vMax: 10,
  vScale: 'lin',
  dotColor: '#aa0044',
  dotSize: 10,
  lineColor: '#000000',
  lineThickness: 1,
  textColor: '#000000',
  textFont: '10px sans serif',
  bgColor: '#ffffff',
  gridColor: '#aaaaaa',
  loopConnect: false
};

CurveEditor.setDefaults = function (settings) {
  Object.keys(settings).forEach(function(k) {
    CurveEditor.defaults[k] = settings[k];
  });
};
