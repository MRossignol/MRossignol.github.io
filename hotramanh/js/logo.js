
function resizeLogo() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let targetW = Math.min(w, 200);
  if (w > 200) {
    let wr = w-200;
    if (wr < 700) {
      targetW += wr * 250/700;
    } else {
      wr = w-900;
      targetW = 450 + wr*250/1300;
    }
  }
  // let maxWidth = w/2;
  let maxHeight = h/2;
  let aspectRatio = 1811/457;
  let width =  Math.round((targetW / aspectRatio > maxHeight) ? maxHeight*aspectRatio : targetW);
  let height = Math.round(width / aspectRatio);
  let top = Math.round((h-height)/2);
  let left = Math.round((w-width)/2);
  let logo = document.getElementById('logo');
  console.log(width, height, top, left);
  logo.style.width = width+'px';
  logo.style.height = height+'px';
  logo.style.top = top+'px';
  logo.style.left = left+'px';
}

window.addEventListener('resize', resizeLogo);

window.addEventListener('DOMContentLoaded', () => {
  let img = new Image();
  img.onload = function () {
    resizeLogo();
    document.getElementById('logo').style.opacity = 1;
  };
  img.src = 'img/name.png';
});
