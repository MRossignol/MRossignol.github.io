
function randBm (stretch) {
  stretch = stretch ?? 1;
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = stretch*num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randBm(); // resample between 0 and 1
  return num;
}

function rgbToHex (col) {
  let res = '#';
  for (let c of col) {
    c *= 255;
    res += (c < 16 ? '0' : '')+Math.floor(c).toString(16);
  }
  return res;

}

function hexToRGB (hex) {
  let pos = hex.charAt(0) == '#' ? 1 : 0;
  if (hex.length > 4) {
    return [
      Number.parse(hex.substr(pos, 2), 16) / 255,
      Number.parse(hex.substr(pos+2, 2), 16) / 255,
      Number.parse(hex.substr(pos+4, 2), 16) / 255
    ];
  } else {
    return [
      Number.parse(hex.charAt(pos), 16) / 15,
      Number.parse(hex.charAt(pos+1), 16) / 15,
      Number.parse(hex.charAt(pos+2), 16) / 15
    ];
  }
}

function randColor (col1, col2) {
  let ratio = randBm();
  let c = col1.map((c,i) => ratio*col1[i] + (1-ratio)*col2[i]);
  return rgbToHex(c);
}
