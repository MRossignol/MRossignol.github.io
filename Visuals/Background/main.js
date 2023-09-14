window.addEventListener('load', () => {
  console.log('Creating background');
  let bg = new GrowBackground({bgColor: '#888888', minRadius: 10, maxRadius: 20, spotGrowTime: 1, overlap: .8, spotsPerSecond: 1000, spotGrowEndAlpha: .2});
  bg.show();
});
