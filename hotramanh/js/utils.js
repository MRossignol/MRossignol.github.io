
function getHTA() {
  if (!window._hta) window._hta = {};
  return window._hta;
}



function makeElem (tag, cls, content, extra) {
  let res = document.createElement(tag);
  if (cls) {
    if (Array.isArray(cls)) {
      for (let c of cls) res.classList.add(c);
    } else {
      res.classList.add(cls);
    }
  }
  if (content) {
    if (Array.isArray(content)) {
      for (let e of content) {
	res.appendChild(e);
      }
    } else if (typeof(content) == 'string' || typeof(content) == 'number') {
      if (tag == 'input')
	res.value = content;
      else
	res.innerHTML = content;
    } else if (content) {
      res.appendChild(content);
    }
  }
  if (extra) {
    extra(res);
  }
  return res;
}


function makeManyElems (tag, cls, content, extra) {
  if (extra)
    return content.map((c,i) => makeElem(tag, cls, c, (e) => extra(e,i)));
  else
    return content.map((c,i) => makeElem(tag, cls, c));
}


function makeDiv (cls, content, extra) {
  return makeElem('div', cls, content, extra);
}


function makeLink (cls, content, href, extra) {
  let res = makeElem('a', cls, content, extra);
  if (href) res.href = href;
  return res;
}

function makeImage(cls, src, alt, extra) {
  let img = new Image();
  if (cls) {
    if (Array.isArray(cls)) {
      for (let c of cls) img.classList.add(c);
    } else {
      img.classList.add(cls);
    }
  }
  if (alt) {
    img.alt = alt;
  }
  if (extra) {
    extra(img);
  }
  img.src = src;
  return img;
}


if (!HTMLElement.prototype.addElem) {
  HTMLElement.prototype.addElem = function (tag, cls, content, extra) {
    this.appendChild(makeElem(tag, cls, content, extra));
  };
}


if (!HTMLElement.prototype.addDiv) {
  HTMLElement.prototype.addDiv = function (cls, content, extra) {
    this.appendChild(makeElem('div', cls, content, extra));
  };
}


if (!HTMLElement.prototype.appendChildren) {
  HTMLElement.prototype.appendChildren = function (elems) {
    for (let e of elems)
      this.appendChild(e);
  };
}


function makeImageLink (img, name, url, newWindow) {
  let a = document.createElement('a');
  a.innerHTML = `<img src="${img}" alt="${name}"/>`;
  if (url.startsWith('mailto:')) {
    a.href = '';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      let hiddenA = document.createElement('a');
      hiddenA.href = url;
      hiddenA.target = '_blank';
      console.log(hiddenA);
      hiddenA.click();
    });
  } else {
    a.href = url;
  }
  if (newWindow) a.target = '_blank';
  return a;
}


function sectionLink (section, cls) {
  if (!section.endsWith('html') && !section.endsWith('htm')) section += '.html';
  let a = document.createElement('a');
  a.classList.add('sectionLink');
  if (cls) {
    if (Array.isArray(cls)) {
      for (let c of cls) a.classList.add(c);
    } else {
      a.classList.add(cls);
    }
  }
  a.href = section;
  return a;
}

function socialBox () {
  let box = makeDiv('socialBox');
  box.appendChild(makeDiv('sbText', 'Follow updates and contact me:'));
  let linkDiv = makeDiv('sbLinks');
  linkDiv.appendChild(makeDiv('sbFlex'));
  linkDiv.appendChild(makeImageLink('img/icons/fb.png', 'Facebook', 'https://facebook.com/hotramanhmusic/', true));
  linkDiv.appendChild(makeDiv('sbSpace'));
  linkDiv.appendChild(makeImageLink('img/icons/insta.png', 'Instagram', 'https://www.instagram.com/hotramanh.music/', true));
  linkDiv.appendChild(makeDiv('sbSpace'));
  linkDiv.appendChild(makeImageLink('img/icons/email.png', 'Email', 'mailto:contact@hotramanh.com', true));
  linkDiv.appendChild(makeDiv('sbFlex'));
  box.appendChild(linkDiv);
  return box;
}
