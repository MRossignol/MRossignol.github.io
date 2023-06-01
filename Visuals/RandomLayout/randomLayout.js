
let elements = [
  {content: 'Something&nbsp;1'},
  {content: 'Something&nbsp;2'},
  {content: 'Something&nbsp;3'},
  {content: 'Something&nbsp;4'},
  {content: 'Something&nbsp;5'},
  {content: 'Something&nbsp;6'},
  {content: 'Something&nbsp;7'},
  {content: 'Something&nbsp;8'},
  {content: 'Something&nbsp;9'},
  {content: 'Something&nbsp;10'},
  {content: 'Something&nbsp;11'},
  {content: 'Something&nbsp;12'},
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
    let vector = [0, 0];
    for (let e2 of elements) {
      if (e2 == e) continue;
      let dir = [1,1];
      let d = [e.x-e2.x, e.y-e2.y];
      for (let i of [0,1]) {
	if (d[i] < 0) {
	  dir[i] = -1;
	  d[i] = -d[i];
	}
	if (d[i] < 1) d[i] = 1;
      }
      let dist = Math.sqrt(d[0]*d[0] + d[1]*d[1]);
      if (dist < 300) {
	for (let i of [0,1]) {
	  vector[i] += dir[i] * d[i] * elemRepulsion / dist;
	}
      }
    }
    if (e.x < 50) vector[0] += wallRepulsion / (e.x-20);
    if (e.x > window.innerWidth-50) vector[0] -= wallRepulsion / (window.innerWidth - e.x + 20);
    if (e.y < 50) vector[1] += wallRepulsion / (e.y-20);
    if (e.y > window.innerHeight - 50) vector[1] -= wallRepulsion / (window.innerHeight - e.y + 20);
    e.x += vector[0];
    e.y += vector[1];
  }
  positionElements();
  requestAnimationFrame(animate);
};


window.addEventListener('load', () => {
  let w = window.innerWidth, h = window.innerHeight;
  for (let e of elements) {
    e.x = w/2-5 + 10*Math.random();
    e.y = h/2-5 + 10*Math.random();
    e.outerDiv = document.createElement('div');
    e.outerDiv.classList.add('positionedContentHolder');
    e.div = document.createElement('div');
    e.div.classList.add('positionedContent');
    e.outerDiv.appendChild(e.div);
    e.div.innerHTML = e.content;
  }
  positionElements();
  for (let e of elements) {
    document.body.appendChild(e.outerDiv);
  }
  animate();
});
