
function getHTA() {
  if (!window._hta) window._hta = {
    randomIDs: {},
    throttledEvents: {}
  };
  return window._hta;
}

function makeDiv() {
  let res = document.createElement('div');
  for (let i=0; i<arguments.length; i++) res.classList.add(arguments[i]);
  return res;
}

function makeImg() {
  let img = document.createElement('img');
  img.src = arguments[0];
  for (let i=1; i<arguments.length; i++)
    img.classList.add(arguments[i]);
  return img;
}

function setElemHTML (div, html) {
  div.innerHTML = html;
  return div;
}

function sectionLink (section) {
  if (!section.endsWith('html') && !section.endsWith('htm')) section += '.html';
  let a = document.createElement('a');
  a.classList.add('sectionLink');
  a.href = section;
  return a;
}

function randomID (length) {
  if (!length) length = 12;
  let hta = getHTA();
  let randChar = () => {
    let i=Math.floor(62*Math.random());
    if (i<10) return ''+i;
    if (i<36) return String.fromCharCode(55+i);
    return String.fromCharCode(61+i);
  };
  let res = '';
  do {
    res = Array.from({length:length}, randChar).join('');
  } while (hta.randomIDs[res]);
  hta.randomIDs[res] = true;
  return res;
}

function addThrottledEventListener(object, event, callback, throttleDelay) {
  if (!throttleDelay) throttleDelay = 100;
  let hta = getHTA();
  let id = randomID();
  let wrappingCallback = (event) => {
    if (hta.throttledEvents[id] && !hta.throttledEvents[id].activeTimeout) {
      hta.throttledEvents[id].activeTimeout = setTimeout(() => {
	callback(event);
	hta.throttledEvents[id].activeTimeout = null;
      }, throttleDelay);
    }
  };
  hta.throttledEvents[id] = {
    object: object,
    event: event,
    callback: wrappingCallback,
    activeTimeout: null
  };
  object.addEventListener(event, wrappingCallback);
  return id;
}

function removeThrottledEventListener(id) {
  let hta = getHTA();
  if (!id || !hta.throttledEvents[id]) return;
  let te = hta.throttledEvents[id];
  te.object.removeEventListener(te.event, te.callback);
  if (te.activeTimeout) clearTimeout(te.activeTimeout);
  delete hta.throttledEvents[id];
}
