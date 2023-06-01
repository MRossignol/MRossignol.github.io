
let elements = [
  {content: 'Something&nbsp;1'},
  {content: 'Something&nbsp;2'},
  {content: 'Something&nbsp;3'},
  {content: 'Something&nbsp;4'},
  {content: 'Something&nbsp;5'},
  {content: 'Something&nbsp;6'}
];

let positionElements = () => {
  for (let e of elements) {
    e.outerDiv.style.transform = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px)`;
  }
};

let elemRepulsion = 1;
let wallRepulsion = 100;

let animate = () => {
  for (let e of elements) {
    let s = [e.div.offsetWidth/2, e.div.offsetHeight/2];
    let vector = [0, 0];
    for (let e2 of elements) {
      if (e2 == e) continue;
      let s2 = [e2.div.offsetWidth/2, e2.div.offsetHeight/2];
      let dir = [1,1];
      let d = [e.x-e2.x, e.y-e2.y];
      let rd = [0, 0];
      for (let i of [0,1]) {
	if (d[i] < 0) {
	  dir[i] = -1;
	  d[i] = -d[i];
	}
	rd[i] = Math.max(1, d[i] - s[i] - s2[i]);
      }
      let dist = Math.sqrt(rd[0]*rd[0] + rd[1]*rd[1]);
      if (dist < 50) {
	for (let i of [0,1]) {
	  vector[i] += dir[i] * d[i] * elemRepulsion / dist;
	}
      }
    }
    if (e.x - s[0] < 50) vector[0] += wallRepulsion / (e.x-s[0]-20);
    if (e.x + s[0] > window.innerWidth-50) vector[0] -= wallRepulsion / (window.innerWidth - e.x - s[0] - 20);
    if (e.y - s[1] < 50) vector[1] += wallRepulsion / (e.y - s[1] - 20);
    if (e.y +s[1] > window.innerHeight - 50) vector[1] -= wallRepulsion / (window.innerHeight - e.y -s[1] - 20);
    e.x += vector[0];
    e.y += vector[1];
  }
  positionElements();
  requestAnimationFrame(animate);
};


window.addEventListener('load', () => {
  let w = window.innerWidth, h = window.innerHeight;
  elements.forEach((e,i) => {
    e.x = w/2-5 + 10*Math.random();
    e.y = h/2-5 + 10*Math.random();
    e.outerDiv = document.createElement('div');
    e.outerDiv.classList.add('positionedContentHolder');
    e.div = document.createElement('div');
    e.div.classList.add('positionedContent');
    e.div.classList.add('content_'+i);
    e.outerDiv.appendChild(e.div);
    e.div.innerHTML = e.content;
  });
  positionElements();
  for (let e of elements) {
    document.body.appendChild(e.outerDiv);
  }
  animate();
});
