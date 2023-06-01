window.addEventListener('load', () => {
  console.log('Creating background');
  let bg = new GrowBackground({bgColor: '#ff0000', minRadius: 5, maxRadius: 40, spotGrowTime: 3, overlap: .5, spotsPerSecond: 50});
  bg.show();
});
