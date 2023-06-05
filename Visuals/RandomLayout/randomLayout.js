
const spacing = 20;
const margin = 40;

const widthSpread = 1200;

let elements = [
  {content: 'Something&nbsp;1'},
  {content: 'Something&nbsp;2'},
  {content: 'Something&nbsp;3'},
  {content: 'Something&nbsp;4'},
  {content: 'Something&nbsp;5'},
  {content: 'Something&nbsp;6'},
  {content: 'Something&nbsp;7'},
  {content: 'Something&nbsp;8'}
];

let normalizePositions = () => {
  let minX=window.innerWidth, minY=window.innerHeight, maxX=0, maxY=0;
  let left, right, top, bottom;
  for (let e of elements) {
    e.s = [e.div.offsetWidth/2, e.div.offsetHeight/2];
    if (e.x-e.s[0] < minX) { minX = e.x-e.s[0]; left = e; }
    if (e.y-e.s[1] < minY) { minY = e.y-e.s[1]; top = e; }
    if (e.x+e.s[0] > maxX) { maxX = e.x+e.s[0]; right = e; }
    if (e.y+e.s[1] > maxY) { maxY = e.y+e.s[1]; bottom = e; }
  }
  let targetWidth = Math.min(widthSpread, window.innerWidth - 2*margin);
  if (maxX - minX < targetWidth) {
    let xScale = (targetWidth - 2 * right.s[0]) / (maxX - minX - 2 * right.s[0]);
    let tMinX = (window.innerWidth - targetWidth) / 2;
    for (let e of elements) {
      let sx = e.x - e.s[0] - minX;
      let tx = tMinX + xScale * sx;
      e.x = tx + e.s[0];
    }
  }
  let targetHeight = window.innerHeight - 2*margin;
  if (maxY - minY < targetHeight) {
    let yScale = (targetHeight - 2 * bottom.s[1]) / (maxY - minY - 2 * bottom.s[1]);
    let tMinY = (window.innerHeight - targetHeight) / 2;
    for (let e of elements) {
      let sy = e.y - e.s[1] - minY;
      let ty = tMinY + yScale * sy;
      e.y = ty + e.s[1];
    }
  }
  
};

let positionElements = () => {
  for (let e of elements) {
    e.outerDiv.style.opacity = 1;
    e.outerDiv.style.transform = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px)`;
  }
};

let randomInit = () => {
  let w = window.innerWidth, h = window.innerHeight;
  for (let e of elements) {
    e.x = w/2-100 + 200*Math.random();
    e.y = h/2-100 + 200*Math.random();
  }
};

let computePositions = () => {
  let w = window.innerWidth, h = window.innerHeight;
  for (let e of elements) {
    e.s = [e.div.offsetWidth/2, e.div.offsetHeight/2];
  }
  let solved = false, l = 0;
  while (!solved) {
    if (l > 20) {
      console.log('*');
      randomInit();
      l = 0;
    } else {
      l++;
    }
    solved = true;
    for (let e of elements) {
      let vector = [0, 0];
      for (let e2 of elements) {
	if (e2 == e) continue;
	let dir = [1,1];
	let d = [e.x-e2.x, e.y-e2.y];
	let rd = [0, 0];
	for (let i of [0,1]) {
	  if (d[i] < 0) {
	    dir[i] = -1;
	    d[i] = -d[i];
	  }
	  rd[i] = Math.max(1, d[i] - e.s[i] - e2.s[i]);
	}
	let dist = Math.sqrt(rd[0]*rd[0] + rd[1]*rd[1]);
	if (dist < spacing) {
	  solved = false;
	  for (let i of [0,1]) {
	    vector[i] += dir[i] * d[i] / dist;
	  }
	}
      }
      e.x += vector[0];
      e.y += vector[1];
      if (e.x - e.s[0] < margin) {
	solved = false;
	e.x = e.s[0] + margin;
      }
      if (e.x + e.s[0] > w - margin) {
	solved = false;
	e.x = w - margin - e.s[0];
      }
      if (e.y - e.s[1] < margin) {
	solved = false;
	e.y = e.s[1] + margin;
      }
      if (e.y + e.s[1] > h - margin) {
	solved = false;
	e.y = h - margin - e.s[1];
      }
    }
  }
  positionElements();
  document.body.addEventListener('click', () => {
    console.log('normalize');
    normalizePositions();
    positionElements();
  });
};


window.addEventListener('load', () => {
  let w = window.innerWidth, h = window.innerHeight;
  elements.forEach((e,i) => {
    e.outerDiv = document.createElement('div');
    e.outerDiv.classList.add('positionedContentHolder');
    e.outerDiv.style.opacity = 0;
    e.div = document.createElement('div');
    e.div.classList.add('positionedContent');
    e.div.classList.add('content_'+i);
    e.div.innerHTML = e.content;
    e.outerDiv.appendChild(e.div);
    document.body.appendChild(e.outerDiv);
  });
  randomInit();
  setTimeout(computePositions);
});
