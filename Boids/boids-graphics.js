var tailLength = 60;

var tails = [];

const groupColors = ['#006699', '#770088', '#008822'];

var canvas = null;
var ctx = null;

onmessage = (e) => {
  if (e.data.hasOwnProperty('canvas')) {
    canvas = e.data.canvas;
    ctx = canvas.getContext("2d");
  } else {
    let boids = e.data.boids;

    let drawBoid = (ctx, boid, tail) => {
      ctx.translate(boid.x, boid.y);
      ctx.rotate(boid.angle);
      ctx.fillStyle = groupColors[boid.group]; // "#558cf4";
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-3, 3);
      ctx.lineTo(-3, -3);
      ctx.lineTo(6, 0);
      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (tail.length) {
	ctx.strokeStyle = groupColors[boid.group]+'66'; // "#558cf466";
	ctx.beginPath();
	ctx.moveTo(tail[0][0], tail[0][1]);
	for (let point of tail) {
	  ctx.lineTo(point[0], point[1]);
	}
	ctx.stroke();
      }
    };
  
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    boids.forEach((boid, i) => {
      if (!tails[i]) tails[i] = [];
      tails[i].push([boid.x, boid.y]);
      if (tails[i].length > tailLength) tails[i].shift();
      drawBoid(ctx, boid, tails[i]);
    });
  }
};
