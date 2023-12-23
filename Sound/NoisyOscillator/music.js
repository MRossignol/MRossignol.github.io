// A4 = 440, A3 = 220, A1 = 110, A0 = 55

function semitonesToA (note) {
  note = note.toLowerCase().replace(/[\d\- ]+$/, '');
  let shift = 0;
  if (note.length > 1) {
    if (note[1] == '#') shift = 1;
    else if (note[1] == 'b') shift = -1;
  }
  switch(note[0]) {
  case 'a' : return shift;
  case 'b' : return 2 + shift;
  case 'c' : return -9 + shift;
  case 'd' : return -5 + shift;
  case 'e' : return -5 + shift;
  case 'f' : return -4 + shift;
  case 'g' :
  default  : return -2 + shift;
  }
}

function noteToHz (note) {
  let octave = 1*note.replace(/[^\-\d]/g, '');
  let f = 440;
  let o = 4;
  for (; o < octave; o++) f *= 2;
  for (; o > octave; o--) f /= 2;
  let semi = semitonesToA(note);
  return f * Math.pow(2, semi/12);
}
