
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

let positionElements = () => {
  for (let e of elements) {
    e.outerDiv.style.opacity = 1;
    e.outerDiv.style.transform = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px)`;
  }
};

const elemRepulsion = 1;
const spacing = 20;
const margin = 40;

let computePositions = () => {
  let w = window.innerWidth, h = window.innerHeight;
  console.log('*');
  for (let e of elements) {
    e.s = [e.div.offsetWidth/2, e.div.offsetHeight/2];
  }
  let solved = false, l = 0;
  while (!solved) {
    l++;
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
	    vector[i] += dir[i] * d[i] * elemRepulsion / dist;
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
    if (!solved && l > 20) {
      for (let e of elements) {
	e.x = w/2-5 + 10*Math.random();
	e.y = h/2-5 + 10*Math.random();
      }
      l = 0;
    }
  }
  positionElements();
};


window.addEventListener('load', () => {
  let w = window.innerWidth, h = window.innerHeight;
  elements.forEach((e,i) => {
    e.x = w/2-5 + 10*Math.random();
    e.y = h/2-5 + 10*Math.random();
    e.outerDiv = document.createElement('div');
    e.outerDiv.classList.add('positionedContentHolder');
    e.outerDiv.style.opacity = 0;
    e.div = document.createElement('div');
    e.div.classList.add('positionedContent');
    e.div.classList.add('content_'+i);
    e.outerDiv.appendChild(e.div);
    e.div.innerHTML = e.content;
  });
  for (let e of elements) {
    document.body.appendChild(e.outerDiv);
  }
  setTimeout(computePositions);
});
