
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
( function() {
  
  let hta = getHTA();
  
  hta.contentData = {

    main: {
      windowTitle: 'Intro'
    },
    
    letter: {
      windowTitle: 'Intro',
      paragraphs: [
	'Dear friends,',
	'Welcome to this personal site on which I happily share with you my music, and my quest for the meaning of life through creativity. Thank you for visiting this little haven of mine.',
	'I am certain, as human beings, you all have asked yourself this question: “What is my mission in life?” There will never be a definite answer to this. But I believe that if we keep our way in exploring ourselves and the world, we are already engaging in the pursuit of truth and meaning of life.',
	'Sometimes you will feel like you have lost all hope in the dark, and nothing promises ahead. I have been in a similar place. But trust me, there will be things that keep you going, things that make your life worthwhile. We all need an endeavor that makes us feel truly alive. For me, it lies in music.',
	'Some have asked me why I keep on making music without much recognition. I believe the greatest reward does not lie in recognition, but in the pure joy of creating. To fully live and die and make sacrifices for the things meaningful to you is already something to be celebrated.',
	'This debut album, this website and my entire musical journey are an attempt to uphold my belief in the arts, particularly music. To me, it honors the most beautiful legacy of mankind. What rescues our souls from darkness and oblivion will always be the arts. One day we will become ashes, but music lives on.',
	'Therefore, I am humbly sharing with you the fruits of my aspiration. You may not like it, you may dismiss it. Still, I wish to evoke some emotions in you, even in only a short moment. By doing so, I have fulfilled my quest contentedly.',
	'Thank you for your generous support and unwavering companionship.',
	'To music and the arts!',
	'Tram Anh'
      ]
    },
    
    about: {
      windowTitle: 'About',
      title: 'About',
      paragraphs: [
	'Ho Tram Anh is an independent musician/songwriter based in Hanoi with various projects under her belt. Tram Anh’s compositions are trademarked by key-shifting melodies and spatial, atmospheric production with an influence from ambient and classical music as her primary musical instrument is the piano.',
	'Since 2015, Tram Anh has been performing solo as herself, under her other aliases MonA and Anaiis, and now also as a member of the electronic group Ngầm. Her works explore a range of acoustic and electronic music, including lyrically oriented piano pieces with dark, pensive themes as a result of her classical training background. She recently takes a more experimental direction, exploring spatial, dreamy sounds and electronic/atmospheric elements. Tram Anh has also collaborated with various other artists in ambient/experimental projects, most notably with Nhung Nguyen (Sound Awakener) as a duo titled “Oblivia”.',
	'Tram Anh was featured on releases of Rusted Tone Recording, an independent label founded by James Armstrong from the UK, namely the LP “These Cyan Fantasies” (in collaboration with Nhung Nguyen, Gallery Six and James Armstrong). She has also performed in recent experimental/ambient live music concerts, such as “Mutant Onions” (jointly organized by Onion Cellar and Mutant Lounge), “Refractions”  (jointly organized and curated by Manzi and Goethe Institut), Natural Habitat (at Goethe Institut Hanoi with Ngam and Nhung Nguyen), and "Adrift/Sheltered" at the Hanoi Academy of Theater and Cinema (sponsored by British Council, Institut Français, the Embassy of Italy in Hanoi).',
	'Tram Anh\'s debut solo album "The Poetry of Streetlights" is released on September 2, 2022, and available on this website as well as physical CDs.'
      ]
    },

    music: {
      windowTitle: 'Music',
      title: 'Music',
      albumOutImage: 'img/covers/streetlights_alt_cover.jpg',
      albumOutText: 'Ho Tram Anh\'s first solo album, <i>The Poetry of Streetlights</i>',
      newEpSection: 'The new EP (2023) is out!',
      wetlandsEpText1: 'Wetlands',
      wetlandsEpText2: 'December 23rd, 2023',
      sections: [
	{
	  title: 'Singles and EPs (to be updated)',
	  releases: [
	    {title:'Rơi', year: 2021, img:'roi', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/r-i-tram-anhs-version'}},
	    {title:'Foolish', year: 2020, img:'foolish', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/foolish'}},
	    {title:'Leaving before Christmas', year: 2021, img:'leaving_before_christmas', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/leaving-before-christmas'}},
	    {title:'Low (EP)', year: 2019, img:'low', links:{Bandcamp:'https://hotramanh.bandcamp.com/album/low-ep'}}
	  ]
	},
	{
	  title: 'Electronic / experimental music',
	  releases: [
	    {title:'Live set for Mutant Lounge', year: 2021, img:'mutant_lounge', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/mutant-lounge-electronic-live-set-ho-tram-anh'}},
	    {title:'Live scoring set for "A Page of Madness"', year: 2021, img:'a_page_of_madness', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/a-page-of-madness-scores-strings-ending'}},
	    {title:'Live set for "Refractions"', year: 2020, img:'refractions', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/refractions-solo-set'}},
	    {title:'Rebound', year: 2021, img:'rebound', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/rebound'}}
	  ]
	},
      ]
    },

    releases: {
      
      streetlights: {
	windowTitle: 'The Poetry of Streetlights',
	title: 'The Poetry Of Streetlights',
	key: 'streetlights',
	insertText: ['You can listen to the whole album for free here, as much as you like!', 'If you like my music, please consider <a href="#donation"><b>making a donation</b></a> to help me continue&hellip; As a thank you, you will receive a link to download the whole album in CD quality.'],
	tracks: [
	  {title: 'Haze', audio:'01_Haze'},
	  {title: 'Mansloughing (feat. Ngầm)', audio:'02_Mansloughing'},
	  {title: 'Feel The Flow', audio:'03_Feel_The_Flow'},
	  {title: 'Discreet Dreamers', audio:'04_Discreet_Dreamers'},
	  {title: 'Radio Ecstatic', audio:'05_Radio_Ecstatic'},
	  {title: 'Minefield', audio:'06_Minefield'},
	  {title: 'Along The Lines', audio:'07_Along_The_Lines'},
	  {title: 'Marbles (feat. Ngầm)', audio:'08_Marbles'},
	  {title: 'Nightingale', audio:'09_Nightingale'},
	  {title: 'Ocean Waves', audio:'10_Ocean_Waves'},
	  {title: 'Coda (Lawrence\'s Lullaby)', audio:'11_Coda_(Lawrence_s_Lullaby)'}
	],
	credits: [
	  ['Ho Tram Anh', 'production, composition, arrangement, piano, keyboards, synthesizers, electronic drums, bass (track 1, 3, 7), vocals', ''],
	  ['Đờ Tùng (POLY)', 'production, engineering, mixing, synthesizers, guitars (track 2, 4, 9, 10), sound effects', 'https://www.facebook.com/tung.hadang96'],
	  ['Cao Lê Hoàng', 'drums, percussions, electronic drums', 'https://www.facebook.com/lehoang.cao.5'],
	  ['Lưu Thanh Duy', 'guitars (track 1, 3, 7)', 'https://www.facebook.com/duylt1202'],
	  ['Đỗ Nguyễn Hoàng Vũ',  'guitars (track 2, 8)', 'https://www.facebook.com/raude1304'],
	  ['Doãn Hoài Nam', 'guitars, bass (track 5)', 'https://www.facebook.com/hoainam.doan'],
	  ['Phạm Hải Đăng', 'Harmonica (track 5)', 'https://www.facebook.com/pham.h.dang.3'],
	  ['Marilyn Dacusin Phạm', 'Backing vocals (track 1, 3)', 'https://www.facebook.com/marilynpham123'],
	  ['Lawrence', 'Spoken words (track 11)', ''],
	  ['A.J. Tissian', 'mastering', 'https://www.thewavelab.com/crew---aj-tissian'],
	  ['Artworks & design:', 'Nguyễn Ngọc Uyên', 'https://m.facebook.com/flowerofthesunn'],
	  ['Website by:', 'Mathias Rossignol', 'https://www.facebook.com/adjudant.tifrice'],
	  ['CD production by:', 'LP Club', 'https://lpclub.vn/']
	]
      },

      wetlands: {
	key: 'wetlands',
	windowTitle: 'Wetlands EP',
	title: 'Wetlands EP',
	insertText: ['You can listen to the whole EP for free here, as much as you like!', 'If you like my music, please consider <a href="#donation"><b>making a donation</b></a> to help me continue&hellip; As a thank you, you will receive a link to download the whole EP in CD quality.'],
	tracks: [
	  {title: 'Wetlands', audio:'01_Wetlands'},
	  {title: 'Ripple/Silhouettes', audio:'02_Ripple_Silhouettes'},
	  {title: 'Exile', audio:'03_Exile'},
	  {title: 'How We Were', audio:'04_How_we_were'},
	  {title: 'Out Of My Head (Tram Anh\'s version)', audio:'05_Out_of_my_head'}
	],
	credits: [
	  ['Ho Tram Anh', 'Composition, arrangement, recording, performance, production and mixing'],
	  ['Ha Dang Tung (Đờ Tùng/POLY)', 'Mastering'],
	  ['Marilyn Dacusin Pham', 'Artwork photo']
	]
      }
    },

    donation: {
      title: 'Donations',
      introText: ['I have produced this ### independently, and choose not to be linked with any label or distribution platform. I am therefore grateful for any donation, whatever the amount, that will help me pursue my work of passion.', 'Before choosing a donation method below, please make sure to fill in your name and email address, so that I may thank you; for every donation above 50k VND (2USD) I will send you a link to download the full ### in CD quality. I\'ll email it as soon as I see the donation &ndash; please be patient, it may take a moment, but do contact me if you don\'t hear from me after a day or so.'],
      methods: [
	{
	  title: 'Paypal or card',
	  html: '<iframe class="paypalFrame" src="paypal.html"></iframe>'
	},
	{
	  title: 'Momo',
	  html: '<img class="momoQR" src="img/momoQR.png"/><br/><a class="momoLink" href="https://me.momo.vn/G9IguNsyiZu2UBCOfltx">https://me.momo.vn/G9IguNsyiZu2UBCOfltx</a>'
	},
	{
	  title: 'Bank Transfer',
	  html: '<table class="bankDetails"><tr><td>Bank:</td><td>Techcombank</td></tr><td>Account number:</td><td>19030396626011</td></tr><tr><td>Account holder:</td><td>Ho Tram Anh</td></tr></table>'
	}
      ]
    },
    
    wetlands: {
      windowTitle: 'Wetlands EP',
    },
    
    'poetry-of-streetlights': {
      windowTitle: 'The Poetry of Streetlights',
    },
    
    news: {
      windowTitle: 'News'
    },

    media: {
      windowTitle: 'Media'
    }
    
  };

})();
(function() {

  let hta = getHTA();

  let initDone = false;
  
  let orientation = null;


  
  let resizeCallbacks = [];
  
  let registerResizeCallback = (callback) => {
    resizeCallbacks.push(callback);
    setTimeout( () => callback(window.innerWidth, window.innerHeight) );
  };

  let unregisterResizeCallback = (callback) => {
    resizeCallbacks = resizeCallbacks.filter(cb => cb != callback);
  };


  
  let orientationCallbacks = [];
  
  let registerOrientationChangeCallback = (callback) => {
    orientationCallbacks.push(callback);
    if (orientation) {
      setTimeout( () => callback(orientation) );
    }
  };

  let unregisterOrientationChangeCallback = (callback) => {
    orientationCallbacks = orientationCallbacks.filter(cb => cb != callback);
  };


  
  function detectOrientation () {
    let oldOrientation = orientation;
    if (window.innerWidth < 500 || window.innerHeight > 1.3*window.innerWidth) {
      orientation = 'mobile';
      document.body.classList.add('mobile');
      document.body.classList.remove('desktop');
    } else {
      orientation = 'desktop';
      document.body.classList.remove('mobile');
      document.body.classList.add('desktop');
    }
    if (orientation != oldOrientation) {
      orientationCallbacks.forEach( cb => cb(orientation) );
    }
    initDone = true;
  }


  
  let resizeThrottle = null;
  
  window.addEventListener('DOMContentLoaded', () => {

    detectOrientation();
  
    window.addEventListener('resize', () => {
      if (resizeThrottle) return;
      resizeThrottle = setTimeout(() => {
	resizeThrottle = null;
	detectOrientation();
	resizeCallbacks.forEach( cb => cb(window.innerWidth, window.innerHeight) );
      }, 50);
    });
    
  });
  
  hta.layout = {
    orientation: () => {
      if (!initDone) detectOrientation();
      return orientation;
    }, 
    onResize: (callback) => registerResizeCallback(callback),
    endOnResize: (callback) => unregisterResizeCallback(callback),
    onOrientationChange: (callback) => registerOrientationChangeCallback(callback),
    endOnOrientationChange: (callback) => unregisterOrientationChangeCallback(callback),
  };
  
}) ();
(function() {

  let hta = getHTA();

  hta.sections = {};
  
  let currentSection = null, nextSection = null,
      currentContent = null,
      inTransition = false,
      waitingToTransition = null;

  let documentLoaded = false;

  let sectionChangeCallbacks = [];
  
  function registerSectionChangeCallback (callback) {
    sectionChangeCallbacks.push(callback);
    setTimeout(() => {
      if (currentSection) callback(currentSection.name);
      else if (nextSection) callback(nextSection.name);
    }, 100);
  }
  
  function ContentArea (section) {
    
    this.section = section;
    
    let self = this;
    
    let contentWrapper = document.body;

    let re = makeDiv(['contentFrame', section.name]);
    let elem = re;

    if (section.name!='intro') {
      elem = makeDiv(['content', section.name]);
      re.addDiv('contentFlex1');
      re.appendChild(elem);
      re.addDiv('contentFlex2');
    }
    
    this.load = () => new Promise ((resolve, reject) => {
      
      let giveUp = () => {
	inTransition = false;
	if (currentContent) {
	  currentContent.reappear();
	}
	this.destroy();
	reject();
      };

      if (currentContent) {
	currentContent.disappear();
	document.body.classList.remove(currentContent.section.name);
      }
      document.body.classList.add(section.name);

      if (hta.contentData[section.name] && hta.contentData[section.name].windowTitle) {
	document.title = hta.contentData[section.name].windowTitle + '  |  Ho Tram Anh';
      } else {
	document.title = 'Ho Tram Anh';
      }
      
      section.getContent(elem).then((text) => {
	
	if (text) elem.innerHTML = text;
	
	re.classList.add(currentContent ? 'insert' : 'fastInsert');
	contentWrapper.appendChild(re);
	if (section.layout) {
	  section.layout();
	}

	setTimeout(() => {
	  if (section.onAppearing) section.onAppearing();
	  hta.menu.processSectionLinks(elem);
	  if (section.preloadNext) section.preloadNext();
	});
	
	    
	let oae = () => {
	  re.removeEventListener('animationend', oae);
	  re.classList.remove('insert');
	  re.classList.remove('fastInsert');
	  if (currentContent) currentContent.destroy();
	  currentContent = self;
	  if (section.onAppeared) section.onAppeared();
	  resolve();
	};
	    
	re.addEventListener('animationend', oae);
      }, giveUp);
      
    });

    this.disappear = () => {
      re.classList.add('remove');
      if (section.onDisappearing) section.onDisappearing();
    };

    this.reappear = () => {
      re.classList.remove('remove');
      if (section.onAppearing) section.onAppearing();
    };

    this.destroy = () => {
      if (section.cleanup) section.cleanup();
      try {
	contentWrapper.removeChild(re);
      } catch (e) {}
    };
    
  }

  
  function openSection (sectionName) {
    console.log(sectionName);
    
    if (currentSection && sectionName == currentSection.name || !hta.sections[sectionName]) return;
    if (inTransition) {
      if (inTransition == sectionName) waitingToTransition = null;
      else waitingToTransition = sectionName;
      return;
    }
    inTransition = sectionName;

    sectionChangeCallbacks.forEach( cb => cb(sectionName, currentSection ? currentSection.name : '') );

    nextSection = hta.sections[sectionName];
    if (nextSection.preload) nextSection.preload();
    
    new ContentArea(nextSection).load().then(() => {
      inTransition = false;
      currentSection = nextSection;
      nextSection = null;
      if (waitingToTransition) {
	openSection(waitingToTransition);
	waitingToTransition = null;
      }
    }, () => {
      sectionChangeCallbacks.forEach( cb => cb(currentSection ? currentSection.name : '', sectionName) );
      nextSection = null;
    });
  };

  function detectOrientation () {
    if (window.innerWidth < 500 || window.innerHeight > 1.3*window.innerWidth) {
      document.body.classList.add('mobile');
      document.body.classList.remove('desktop');
    } else {
      document.body.classList.remove('mobile');
      document.body.classList.add('desktop');
    }
  }

  
  function sectionFromUrl() {
    let section = window.location.pathname.replace(/^.*\//, '').replace(/\..*/, '').replace(/#.*/, '');
    return hta.sections[section] ? section : 'intro';
  }

  
  function registerSection (settings) {
    let name = settings.name;
    if (documentLoaded && settings.hasOwnProperty('init')) {
      settings.init();
    }
    hta.sections[name] = settings;
  }
  
  window.addEventListener('DOMContentLoaded', () => {

    detectOrientation();
    
    Object.keys(hta.sections).forEach((section) => {
      if (hta.sections[section].init) hta.sections[section].init();
    });

    documentLoaded = true;

    window.addEventListener('popstate', function () {
      openSection(sectionFromUrl());
    });

    openSection(sectionFromUrl());

    hta.layout.onResize((w,h) => {
      if (currentSection && currentSection.onResize) currentSection.onResize(w,h);
      if (nextSection && nextSection.onResize) nextSection.onResize(w,h);
    });

    window.addEventListener('beforeunload', () => {
      let recursiveLook = (object, depth) => {
	if (!depth) depth = 1;
	if (depth > 5) return;
	if (object.onPageUnload) {
	  object.onPageUnload();
	} else {
	  Object.keys(object).forEach(k => recursiveLook(object[k], depth+1));
	}
      };
      recursiveLook(hta);
    });
    
  });


  
  
  hta.navigation = {
    registerSection: registerSection,
    openSection: openSection,
    onSectionChange: registerSectionChangeCallback,
    currentSection: () => currentSection,
    nextSection: () => nextSection
  };
  
}) ();

( function() {

  let hta = getHTA();
  
  let backgrounds = {
    ld: null,
    hd: null,
    album: null
  };
  
  const maxTranslate = 20;

  const bgNaturalWidth = 3480;
  const bgNaturalHeight = 2320;

  const albumBgNaturalWidth = 3480;
  const albumBgNaturalHeight = 1760;

  const acceptableScaleUp = 1.2;
  const knownWidths = [435, 696, 870, 1392, 1740, 2088, 2784, 3480];

  let loadedImageWidth = {ld: 0, hd: 0, album: 0};


  
  let bestMatchWidth = (rw) => {
    let mw = 0;
    for (let i=0, l=knownWidths.length; i<l && !mw; i++) {
      if (acceptableScaleUp*knownWidths[i] >= rw)
	mw = knownWidths[i];
    }
    return mw || knownWidths[knownWidths.length-1];
  };

  
  let loadingImages = 0;
  let loadingAlbumBg = false;
  
  let loadImages = (requiredWidth, album) => {
    if (window.devicePixelRatio) {
      requiredWidth *= Math.max(1, Math.min(2, window.devicePixelRatio));
    }
    if (album) {
      if (loadingAlbumBg) {
	if (requiredWidth > loadedImageWidth.album) setTimeout(()=>loadImages(requiredWidth, true), 500);
	return;
      }
      let matchingWidth = bestMatchWidth(requiredWidth);
      if (matchingWidth <= loadedImageWidth.album) return;
      loadingAlbumBg = true;
      let src = 'img/album-background/background-'+matchingWidth+'.jpg';
      let img = new Image();
      img.onload = () => {
	backgrounds.album.style['background-image'] = 'url(img/album-background/background-'+matchingWidth+'.jpg)';
	loadingAlbumBg = false;
      };
      img.src = src;
    } else {
      if (loadingImages) {
	if (requiredWidth > loadedImageWidth.hd) setTimeout(()=>loadImages(requiredWidth, false), 500);
	return;
      }
      let loadImage = (res, rw) => {
	let matchingWidth = bestMatchWidth(rw);
	if (matchingWidth <= loadedImageWidth[res]) return;
	loadingImages++;
	let src = 'img/background-'+res+'/background-'+matchingWidth+'.jpg';
	let img = new Image();
	img.onload = () => {
	  backgrounds[res].src = src;
	  backgrounds[res].style.opacity = (res == 'ld') ? .8 : .5;
	  loadedImageWidth[res] = matchingWidth;
	  loadingImages--;
	};
	img.src = src;
      };
      loadImage('ld', requiredWidth/2);
      loadImage('hd', requiredWidth);
    }
  };

  
  let adjustBackgroundSize = (w, h, section) => {

    if (!section) section = hta.navigation.currentSection() && hta.navigation.currentSection().name || '';
    
    if (section == 'poetry-of-streetlights') {

      let width = h * albumBgNaturalWidth / albumBgNaturalHeight;
      loadImages(Math.round(Math.max(width, w)), true);
      
    } else {
      
      let minW = w + 2*maxTranslate;
      let minH = h + 2*maxTranslate;

      let targetHeight = 1.5*h;
      let targetWidth = targetHeight * bgNaturalWidth / bgNaturalHeight;
      
      if (targetWidth < minW) {
	targetWidth = minW;
	targetHeight = targetWidth * bgNaturalHeight / bgNaturalWidth;
      }
      let bgW = Math.round(targetWidth);
      let bgH = Math.round(targetHeight);

      loadImages(bgW, false);

      let scale = targetWidth / bgNaturalWidth;
      
      // In the original image coordinate
      let desiredCenterX = 1720;
      let desiredCenterY = 1500;

      let x = Math.round(w/2 - scale*desiredCenterX);
      let y = Math.round(h/2 - scale*desiredCenterY);
      if (y>0) y = 0;
      if (y+bgH < h) y = h-bgH;

      ['ld', 'hd'].forEach ((res) => {
	backgrounds[res].style.width = bgW+'px';
	backgrounds[res].style.height = bgH+'px';
	backgrounds[res].style.top = y+'px';
	backgrounds[res].style.left = x+'px';
      });

    }
    
  };


  let initMovData = () => {
    let nbSteps = Math.round(200 + 300*Math.random());
    let angle = 3.14159/nbSteps;
    return { c: 1, s: 0, lastS: -.1, dc: Math.cos(angle), ds: Math.sin(angle), minVal: -5-(maxTranslate-5)*Math.random(), maxVal: 5+(maxTranslate-5)*Math.random()};
  };
  
  let movData = {
    ld :{
      x: initMovData(),
      y: initMovData()
    },
    hd :{
      x: initMovData(),
      y: initMovData()
    }
  };

  let active = false;

  let updateInterval = null;
  let initTime = 0;
  
  let updateBackgroundPositions = () => {
    if (!active) return;
    requestAnimationFrame(() => {
      ['ld', 'hd'].forEach((res) => {
	let delta = {x:0, y:0};
	['x', 'y'].forEach((axis) => {
	  let md = movData[res][axis];
	  let nextC = md.c*md.dc-md.s*md.ds;
	  let nextS = md.c*md.ds+md.s*md.dc;
	  if ((nextS-md.s)*(md.s-md.lastS) < 0) {
	    if (Date.now() - initTime > 100000) {
	      nextC = md.c;
	      nextS  = md.s;
	      md.dc = 1;
	      md.ds = 0;
	      if (updateInterval && movData.ld.x.ds==0 && movData.ld.y.ds==0 && movData.hd.x.ds==0 && movData.hd.y.ds==0) {
		clearInterval(updateInterval);
		updateInterval = null;
	      }
	    } else {
	      let nbSteps = Math.round(200 + 300*Math.random());
	      let angle = 3.14159/nbSteps;
	      md.dc = Math.cos(angle);
	      md.ds = Math.sin(angle);
	      if (nextS > md.s) {
		md.maxVal = 5+(maxTranslate-5)*Math.random();
	      } else {
		md.minVal = -5-(maxTranslate-5)*Math.random();
	      }
	      nextC = md.c*md.dc-md.s*md.ds;
	      nextS = md.c*md.ds+md.s*md.dc;
	    }
	  }
	  md.c = nextC;
	  md.lastS = md.s;
	  md.s = nextS;
	  let trans = Math.round(100*(md.minVal + .5*(1+nextS)*(md.maxVal-md.minVal)))/100;
	  delta[axis] = trans;
	});
	backgrounds[res].style.transform = 'translate3d('+delta.x+'px, '+delta.y+'px, 0) scale('+(1+(delta.x+delta.y)/2000)+')';
      });
    });
  };
  
  // let moveBackground = (res, axis, force) => () => {
  //   if (!force && currentTranslationEndTime[res][axis] - Date.now() > 100) return;
  //   let elem = translationElems[res][axis];
  //   let sign = currentTranslation[res][axis] > 0 ? -1 : 1;
  //   let size = Math.min(window.innerWidth, window.innerHeight);
  //   if (size>500) size=500;
  //   let trans = Math.round(sign * maxTranslate *(4 + 6*Math.random()))/10;
  //   currentTranslation[res][axis] = trans;
  //   let steps = Math.round(100 + 200*Math.random());
  //   let duration = steps/10;
  //   currentTranslationEndTime[res][axis] = Date.now() + 1000*duration;
  //   elem.style.transition = 'transform ease-in-out '+duration+'s';
  //   elem.style.transform = 'translate'+axis.toUpperCase()+'('+trans+'px)';
  // };

  let created = false;
  
  let createBgElems = () => {
    ['ld', 'hd'].forEach ( (res) => {
      backgrounds[res] = document.createElement('img');
      backgrounds[res].classList.add('background');
      backgrounds[res].id='background-'+res;
      document.body.appendChild(backgrounds[res]);
    });
    backgrounds.album = makeDiv('albumBackground');
    document.body.appendChild(backgrounds.album);
    created = true;
    initTime = Date.now();
    updateInterval = setInterval(updateBackgroundPositions, 50);
  };

  
  hta.navigation.onSectionChange ((section, oldSection) => {
    if (!created) {
      createBgElems();
      hta.layout.onResize(adjustBackgroundSize);
    }
    adjustBackgroundSize(window.innerWidth, window.innerHeight, section);
    if (section=='poetry-of-streetlights') {
      active = false;
      let ote = () => {
	backgrounds.album.removeEventListener('transitionend', ote);
	backgrounds.ld.style.display = 'none';
	backgrounds.hd.style.display = 'none';
      };
      backgrounds.album.style.display = 'block';
      setTimeout(() => {
	backgrounds.album.addEventListener('transitionend', ote);
	backgrounds.album.style.opacity = 1;
      });
    } else {
      active = true;
      backgrounds.ld.style.display = 'block';
      backgrounds.hd.style.display = 'block';
      if (oldSection == 'poetry-of-streetlights') {
	let ote = () => {
	  backgrounds.album.removeEventListener('transitionend', ote);
	  backgrounds.album.style.display = 'none';
	};
	backgrounds.album.addEventListener('transitionend', ote);
	backgrounds.album.style.opacity = 0;
      }
    }
  });

}) ();
( function() {

  let hta = getHTA();
  
  let menuEntries = [
    {key:'main', img:'home', text:'Home'},
    {key:'about', img:'bio', text:'Bio'},
    {key:'music', img:'music', text:'Music'},
    {key:'media', img:'media', text:'Media'},
    {key:'news', img:'news', text:'News'},
  ];

  let imageCollection = 'lc_1';


  let handleLinkClick = (event) => {
    event.preventDefault();
    let elem = event.target;
    let hrefUrl = null;
    do {
      hrefUrl = elem.getAttribute('href');
      elem = elem.parentElement;
    } while (elem && !hrefUrl);
    window.history.pushState({}, event.target.innerHTML, hrefUrl);
    window.dispatchEvent(new Event('popstate'));
  };

  
  let menuImage = (menuEntry) => {
    let img = document.createElement('img');
    img.classList.add(imageCollection);
    img.src = 'img/links/'+imageCollection+'/'+menuEntry.img+'.png';
    img.alt = menuEntry.text;
    return img;
  };

  let menuIcon = (menuEntry) => {
    let img = document.createElement('img');
    img.classList.add('menuIcon');
    img.src = 'img/menu/'+menuEntry.img+'.png';
    img.alt = menuEntry.text;
    return img;
  };
  
  let makeMenu = () => {
    let desktopRoot = makeDiv(['contentFrame', 'above', 'desktop']);
    let menuHolder = makeDiv(['contentFlex1', 'menuHolder']);
    let menuFlex1 = makeDiv('menuFlex1');
    let flexMenuHolder = makeDiv('flexMenuHolder');
    let menuFlex2 = makeDiv('menuFlex2');
    let content = makeDiv('content');
    let contentFlex2 = makeDiv('contentFlex2');
    let menu = makeDiv('menu');
    menuEntries.forEach((entry) => {
      entry.elem = document.createElement('a');
      entry.elem.classList.add('menuItem');
      entry.elem.id = 'menu_'+entry.key;
      entry.elem.href = entry.key+'.html';
      entry.elem.appendChild(menuImage(entry));
      entry.elem.addEventListener('touchend', handleLinkClick);
      entry.elem.addEventListener('click', handleLinkClick);
      menu.appendChild(entry.elem);
    });
    flexMenuHolder.appendChild(menu);
    menuHolder.appendChildren([menuFlex1, flexMenuHolder, menuFlex2]);
    desktopRoot.appendChildren([menuHolder, content, contentFlex2]);
    document.body.appendChild(desktopRoot);

    let mobileRoot = makeDiv(['menu', 'mobile']);
    menuEntries.forEach((entry) => {
      entry.elem = document.createElement('a');
      entry.elem.classList.add('menuItem');
      entry.elem.id = 'menu_'+entry.key;
      entry.elem.href = entry.key+'.html';
      entry.elem.appendChild(menuIcon(entry));
      entry.elem.addEventListener('touchend', handleLinkClick);
      entry.elem.addEventListener('click', handleLinkClick);
      mobileRoot.appendChild(entry.elem);
    });
    document.body.appendChild(mobileRoot);
  };

  
  window.addEventListener('DOMContentLoaded', () => {
    makeMenu();
    hta.navigation.onSectionChange((sectionName) => {
      menuEntries.forEach((entry) => {
	if (entry.key == sectionName) {
	  entry.elem.classList.add('active');
	} else {
	  entry.elem.classList.remove('active');
	}
      });

    });
  });

  hta.menu = {

    show: () => {},

    processSectionLinks: (elem) => {
      Array.from(elem.getElementsByClassName('sectionLink')).forEach((e) => {
	// e.addEventListener('touchend', handleLinkClick);
	e.addEventListener('click', handleLinkClick);
      });
    }
    
  };
})();
( function() {

  let hta = getHTA();
  
  function resizeLogo() {
    let logo = document.getElementById('logo');
    if (!logo) {
      setTimeout(resizeLogo, 100);
      return;
    }
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
    logo.style.width = width+'px';
    logo.style.height = height+'px';
    logo.style.top = top+'px';
    logo.style.left = left+'px';
  }


  let logoImg = new Image();
  
  let imgPromise = new Promise((resolve, reject) => {
    logoImg.onload = resolve;
  });

  hta.navigation.registerSection({

    name: 'intro',
    
    init: () => {
      logoImg.src = 'img/name.png';
    },

    preloadNext: () => {
      if (hta.sections.main && hta.sections.main.preload) hta.sections.main.preload();
    },
    
    getContent: () => new Promise((resolve, reject) => {
      imgPromise.then(() => {
	resolve('<a class="sectionLink" href="main.html"><img id="logo" src="img/name.png"/></a>');
      });
    }),

    layout: () => {
      resizeLogo();
      setTimeout(() => {
	document.getElementById('logo').style.opacity = 1;
      }, 100);
    },

    onResize: resizeLogo,
    
    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
  
}) ();
(function() {

  let hta = getHTA();

  let letterImg = new Image();

  let mode = 'image';
  
  let zoom = false;

  let contentDiv = null;
  
  let imgPromise = new Promise((resolve, reject) => {
    letterImg.onload = resolve;
  });

  function showLetter() {
    document.getElementById('letterWait').style.display = 'none';
    letterImg.style.opacity = 1;
  }

  function toggleType() {
    if (mode == 'image') {
      let showText = () => {
	mode='text';
	contentDiv.classList.add('text');
	requestAnimationFrame(() => {
	  let textDiv = document.getElementById('letterText');
	  contentDiv.style.height = (textDiv.getBoundingClientRect().height+80)+'px';
	});
      };
      if (zoom) {
	toggleZoom();
	setTimeout(showText);
      } else {
	showText();
      }
    } else {
      mode = 'image';
      contentDiv.classList.remove('text');
    }
  }
  
  function toggleZoom() {
    if (mode != 'image') return;
    if (zoom) {
      document.body.classList.remove('wideContent');
      if (hta.layout.orientation() == 'desktop')
	document.querySelector('div.content').style.height = 'auto';
    } else {
      document.body.classList.add('wideContent');
      if (hta.layout.orientation() == 'desktop') {
	setTimeout(() => {
	  let contentHeight = Math.round(letterImg.getBoundingClientRect().height+40);
	  document.querySelector('div.content').style.height = contentHeight+'px';
	}, 300);
      }
    }
    zoom = !zoom;
  }

  function makeContent(root) {
    contentDiv = root;
    let buttonHolder = makeDiv('buttonHolder');
    let zoomButton = makeDiv('zoomButton');
    zoomButton.title = 'Toggle zoom on letter image';
    zoomButton.ariaLabel = 'Toggle zoom on letter image';
    zoomButton.addEventListener('click', toggleZoom);
    let toggleButton = makeDiv('toggleButton');
    toggleButton.title = 'Toggle between image and text versions of the letter';
    toggleButton.ariaLabel = 'Toggle between image and text versions of the letter';
    toggleButton.addEventListener('click', toggleType);
    buttonHolder.appendChild(zoomButton);
    buttonHolder.appendChild(toggleButton);
    root.appendChild(buttonHolder);
    let letterWait = makeDiv('letterWait', 'One moment, please…');
    letterWait.id = 'letterWait';
    root.appendChild(letterWait);
    letterImg.id = 'letter';
    letterImg.src = 'img/letter-black-sm-white.png';
    letterImg.alt = 'Letter from Ho Tram Anh';
    root.appendChild(letterImg);
    let letterText = makeDiv('letterText', hta.contentData.letter.paragraphs.map(pContent => makeElem('p', null, pContent)));
    letterText.id = 'letterText';
    root.appendChild(letterText);
  }

  hta.navigation.registerSection({

    name: 'main',
    
    init: () => {},

    preload: () => {
      letterImg.src = 'img/letter-black-sm-white.png';
    },

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve();
    }),

    layout: () => {
      if (letterImg.complete) {
	showLetter();
      } else {
	imgPromise.then(() => {
	  showLetter();
	});
      }
    },

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {
      if (zoom) toggleZoom();
    },

    cleanup: () => {}
    
  });
    
}) ();
(function() {

  let hta = getHTA();

  let images = ['01.jpg', '02.jpg', '04.jpg', '03.jpg', '06.jpg', '05.jpg', '07.jpg', '08.jpg', '10.jpg', '11.jpg', '13.jpg', '14.jpg', '12.jpg', '09.jpg'];
  let thumbnailHolders = images.map(() => null);
  let thumbnailImages = images.map(() => null);
  let hdLoaded = [];
  
  let holderSize = 300;

  let currentPos = 0;

  let zoomOutImage = () => {
    document.body.removeChild(document.getElementsByClassName('carouselControlOverlay')[0]);
    let img = document.getElementById('thumbnail-'+currentPos);
    let fullImage = document.getElementsByClassName('carouselImage')[0];
    let coords = img.getBoundingClientRect();
    ['width', 'height', 'top', 'left'].forEach((dim) => {
      fullImage.style[dim] = Math.round(coords[dim])+'px';
    });
    let background = document.getElementsByClassName('carouselBackgroundOverlay')[0];
    background.style.opacity = 0;
    background.addEventListener('transitionend', () => {
      document.body.removeChild(fullImage);
      document.body.removeChild(background);
    });
  };

  let largeImageSize = (img) => {
    let targetW = .93*window.innerWidth;
    let targetH = .93*window.innerHeight;
    let ratio = img.naturalWidth/img.naturalHeight;
    if (targetH*ratio > targetW) {
      return {w: Math.round(targetW), h: Math.round(targetW/ratio)};
    } else {
      return {w: Math.round(targetH*ratio), h: Math.round(targetH)};
    }
  };

  let swiping = false;
  
  let imageSwipe = (direction) => {
    if (swiping) return false;
    if (currentPos+direction < 0 || currentPos+direction >= images.length) {
      return false;
    }
    swiping = true;
    let oldFullImage = document.getElementsByClassName('carouselImage')[0];
    let targetPos = currentPos+direction;
    let {w,h} = largeImageSize(document.getElementById('thumbnail-'+targetPos));
    let targetFullImage = new Image();
    targetFullImage.classList.add('carouselImage');
    targetFullImage.src = hdLoaded[targetPos] ? 'gallery/'+images[targetPos] : 'gallery/thumbs/'+images[targetPos];
    targetFullImage.style.width = w+'px';
    targetFullImage.style.height = h+'px';
    targetFullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
    targetFullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    if (direction > 0) {
      targetFullImage.style.transform = 'translateX('+window.innerWidth+'px)';
    } else {
      targetFullImage.style.transform = 'translateX(-'+window.innerWidth+'px)';
    }
    document.body.appendChild(targetFullImage);
    setTimeout(() => {
      if (direction > 0) {
	oldFullImage.style.transform = 'translateX(-'+window.innerWidth+'px)';
      } else {
	oldFullImage.style.transform = 'translateX('+window.innerWidth+'px)';
      }
      targetFullImage.style.transform = 'translateX(0px)';
      setTimeout(() => {
	document.body.removeChild(oldFullImage);
	swiping = false;
      }, 400);
    }, 100);
    currentPos += direction;
    if (!hdLoaded[currentPos]) {
      let largeURL = 'gallery/'+images[currentPos];
      let largeImg = new Image();
      let pos = currentPos;
      largeImg.onload = () => {
	hdLoaded[pos] = true;
	setTimeout(() => {
	  if (pos == currentPos) {
	    targetFullImage.src = largeURL;
	  }
	}, 400);
      };
      largeImg.src = largeURL;
    }
    return true;
  };

  
  let controlDiv = () => {
    let control = makeDiv('carouselControlOverlay');

    let touchStartPoint = null;
    
    var touchStartHandler = (event) => {
      event.preventDefault();
      if (event.targetTouches && event.targetTouches[0]) {
	touchStartPoint = {x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY};
      } else if (event.clientX) {
	touchStartPoint = {x: event.clientX, y: event.clientY};
      }
      control.addEventListener('touchmove', touchMoveHandler, {passive: false});
      control.addEventListener('mousemove', touchMoveHandler);
      control.addEventListener('touchend', touchEndHandler, {passive: false});
      control.addEventListener('mouseup', touchEndHandler);
    };
    
    var touchMoveHandler = (event) => {
      event.preventDefault();
      let delta = null;
      if (event.changedTouches && event.changedTouches[0]) {
	delta = {x: event.changedTouches[0].pageX-touchStartPoint.x, y: event.changedTouches[0].pageY-touchStartPoint.y};
      } else if (event.clientX) {
	delta = {x: event.clientX-touchStartPoint.x, y: event.clientY-touchStartPoint.y};
      }
      if (delta) {
	let removeListeners = () => {
	  control.removeEventListener('touchmove', touchMoveHandler, {passive: false});
	  control.removeEventListener('mousemove', touchMoveHandler);
	  control.removeEventListener('touchend', touchEndHandler, {passive: false});
	  control.removeEventListener('mouseup', touchEndHandler);
	};
	if (Math.abs(delta.x) > 10 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  if (delta.x > 0 && currentPos > 0 || delta.x < 0 && currentPos < images.length-1) {
	    Array.from(document.getElementsByClassName('carouselImage')).forEach((fullImage) => {
	      fullImage.style.transform = 'translateX('+delta.x+'px)';
	    });
	  }
	  if (currentPos > 0 && delta.x > window.innerWidth/6) {
	    removeListeners();
	    imageSwipe(-1);
	  } else if (currentPos < images.length-1 && delta.x < -window.innerWidth/6) {
	    removeListeners();
	    imageSwipe(1);
	  }
	} else if (Math.abs(delta.y) > 100 && 2*Math.abs(delta.x) < Math.abs(delta.y)) {
	  removeListeners();
	  zoomOutImage();
	}
      }
    };
    
    var touchEndHandler = (event) => {
      event.preventDefault();
      control.removeEventListener('touchmove', touchMoveHandler, {passive: false});
      control.removeEventListener('mousemove', touchMoveHandler);
      control.removeEventListener('touchend', touchEndHandler, {passive: false});
      control.removeEventListener('mouseup', touchEndHandler);
      let delta = null;
      if (event.changedTouches && event.changedTouches[0]) {
	delta = {x: event.changedTouches[0].pageX-touchStartPoint.x, y: event.changedTouches[0].pageY-touchStartPoint.y};
      } else if (event.clientX) {
	delta = {x: event.clientX-touchStartPoint.x, y: event.clientY-touchStartPoint.y};
      }
      if (delta) {
	if (delta.x > 50 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  imageSwipe(-1);
	} else if (delta.x < -50 && Math.abs(delta.x) > 2*Math.abs(delta.y)) {
	  imageSwipe(1);
	} else if (Math.abs(delta.x) < 20 && Math.abs(delta.y) < 20) {
	  let fullImage = document.getElementsByClassName('carouselImage')[0];
	  let imgPos = fullImage.getBoundingClientRect();
	  if (event.clientX > imgPos.x+.75*imgPos.width) imageSwipe(1);
	  else if (event.clientX < imgPos.x+.25*imgPos.width) imageSwipe(-1);
	  else zoomOutImage();
	} else if (Math.abs(delta.x) < 20 || 2*Math.abs(delta.x) < Math.abs(delta.y)) {
	  zoomOutImage();
	}
      }
    };

    control.addEventListener('touchstart', touchStartHandler, {passive: false});
    control.addEventListener('mousedown', touchStartHandler);
    return control;
  };
  
  let zoomInImage = (pos) => {
    currentPos = pos;
    let img = document.getElementById('thumbnail-'+pos);
    let background = makeDiv('carouselBackgroundOverlay');
    document.body.appendChild(background);
    let fullImage = new Image();
    fullImage.classList.add('carouselImage');
    fullImage.alt = 'Photo #'+(pos+1)+' of Ho Tram Anh';
    fullImage.src = hdLoaded[pos] ? 'gallery/'+images[pos] : 'gallery/thumbs/'+images[pos];
    let coords = img.getBoundingClientRect();
    ['width', 'height', 'top', 'left'].forEach((dim) => {
      fullImage.style[dim] = Math.round(coords[dim])+'px';
    });
    document.body.appendChild(fullImage);
    document.body.appendChild(controlDiv());
    setTimeout(() => {
      background.style.opacity = 1;
      let {w, h} = largeImageSize(img);
      fullImage.style.width = w+'px';
      fullImage.style.height = h+'px';
      fullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
      fullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    });
    if (!hdLoaded[pos]) {
      let largeURL = 'gallery/'+images[pos];
      let largeImg = new Image();
      largeImg.onload = () => {
	hdLoaded[pos] = true;
	setTimeout(() => {
	  if (pos == currentPos) {
	    fullImage.src = largeURL;
	  }
	}, 400);
      };
      largeImg.src = largeURL;
    }
  };

  let ltuo = '';

  let makeContent = (base) => {
    let holderSize = 300;
    ltuo = hta.layout.orientation();
    if (ltuo == 'mobile') {
      holderSize = Math.round(window.innerWidth/2-16);
    }
    let targetArea = 2*holderSize*holderSize/3;
    base.addDiv(null, [
      makeDiv('pageTitle', 'Media'),
      makeDiv('thumbnailsArea', [
	...images.map((img, pos) => makeDiv('galleryThumbnailHolder',
					    makeImage(null,
						      'gallery/thumbs/'+img,
						      'Thumbail for photo #'+(pos+1)+' of Ho Tram Anh',
						      (img) => {
							img.id = 'thumbnail-'+pos;
							img.onload = () => {
							  let w = img.naturalWidth;
							  let h = img.naturalHeight;
							  let area = w*h;
							  let scale = Math.sqrt(targetArea/area);
							  w = Math.round(w*scale);
							  h = Math.round(h*scale);
							  img.style.width = w+'px';
							  img.style.height = h+'px';
							  img.style.left = Math.round((holderSize-w)/2)+'px';
							  img.style.top = Math.round((holderSize-h)/2)+'px';
							  img.addEventListener('click', (event) => {
							    zoomInImage(pos);
							  });
							  thumbnailImages[pos] = img;
							  hdLoaded.push(false);
							};
						      }), (e) => {
							e.style.width = holderSize+'px';
							e.style.height = holderSize+'px';
							thumbnailHolders[pos] = e;
						      })),
	makeElem('hr', 'clear')
      ])
    ]);
  };
  
  let updateThumbnailSize = () => {
    let orientation = hta.layout.orientation();
    if (orientation=='desktop' && ltuo=='desktop') return;
    ltuo = orientation;
    let holderSize = 300;
    if (orientation == 'mobile') {
      holderSize = Math.round(window.innerWidth/2-16);
    }
    let targetArea = 2*holderSize*holderSize/3;
    thumbnailHolders.forEach((holder) => {
      if (holder) {
	holder.style.width = holder.style.height = holderSize+'px';
      }
    });
    thumbnailImages.forEach((img) => {
      if (!img) return;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      let area = w*h;
      let scale = Math.sqrt(targetArea/area);
      w = Math.round(w*scale);
      h = Math.round(h*scale);
      img.style.width = w+'px';
      img.style.height = h+'px';
      img.style.left = Math.round((holderSize-w)/2)+'px';
      img.style.top = Math.round((holderSize-h)/2)+'px';
    });
  };

  let adjustImageSize = (ww,wh) => {
    Array.from(document.getElementsByClassName('carouselImage')).forEach((fullImage) => {
      let {w, h} = largeImageSize(fullImage);
      fullImage.style.width = w+'px';
      fullImage.style.height = h+'px';
      fullImage.style.top = Math.round((window.innerHeight-h)/2)+'px';
      fullImage.style.left = Math.round((window.innerWidth-w)/2)+'px';
    });
  };
  
  hta.navigation.registerSection({

    name: 'media',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve(null);
    }),

    layout: () => {},

    onResize: () => {
      adjustImageSize();
      updateThumbnailSize();
    },

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
(function() {

  let hta = getHTA();
  
  let html = () => {
    let content = hta.contentData.about;
    let res = '<div><div class="pageTitle">'+content.title+'</div>';
    content.paragraphs.forEach((html) => {
      res += '<p>'+html+'</p>';
    });
    return res+'</div>';
  };

  let makeContent = (root) => {
    let content = hta.contentData.about;
    root.addDiv(null, [
      makeDiv('pageTitle', content.title),
      ...content.paragraphs.map(html => makeElem('p', null, html)),
      makeElem('hr'),
      socialBox()
    ]);
  };
  
  hta.navigation.registerSection({

    name: 'about',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
(function() {

  let hta = getHTA();
    
  hta.navigation.registerSection({

    name: 'news',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      let content = document.createElement('div');
      content.addDiv('pageTitle', 'News');
      content.appendChild(socialBox());
      let iframe = document.createElement('iframe');
      iframe.src = 'include-news.html';
      content.appendChild(iframe);
      root.appendChild(content);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {},

    adjustIframeHeight: (height) => {
      document.getElementsByTagName('iframe')[0].style.height = Math.ceil(height+30)+'px';
    }
    
  });
    
}) ();
(function() {

  let hta = getHTA();

  let html = () => {
    let content = hta.contentData.music;
    let res = '<div class="pageTitle">'+content.title+'</div>';
    res += content.albumHTML;
    return res;
  };

  let makeContent = function(contentRoot) {
    let content = hta.contentData.music;
    let root = document.createElement('div');
    root.addDiv('pageTitle', content.title);
    let a = sectionLink('poetry-of-streetlights', 'album');
    a.appendChild(makeImage('albumCover', content.albumOutImage, 'Album cover for The Poetry of Streetlights'));
    a.addElem('p', null, content.albumOutText);
    root.appendChild(a);
    root.appendChild(makeDiv('musicSectionTitle', content.newEpSection));
    a = sectionLink('wetlands', ['release', 'newRelease']);
    a.appendChild(makeDiv(null, [
      makeImage('releaseImage', 'img/covers/wetlands.jpg'),
      makeDiv('releaseTitle', content.wetlandsEpText1),
      makeDiv('releaseSubtitle', content.wetlandsEpText2)
    ]));
    root.appendChild(a);
    content.sections.forEach((s) => {
      root.appendChild(makeDiv('musicSectionTitle', s.title));
      s.releases.forEach((r) => {
	root.appendChild(makeLink('release',
				  makeDiv(null, [
				    makeImage('releaseImage', 'img/covers/'+r.img+'.jpg', 'Album cover for '+r.title),
				    makeDiv('releaseTitle', r.title),
				    makeDiv('releaseSubtitle', r.year+', Bandcamp')
				  ]), r.links.Bandcamp));
      });
    });
    contentRoot.appendChild(root);
  };
  
  hta.navigation.registerSection({

    name: 'music',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
(function() {

  let hta = getHTA();

  let formats = ['opus', 'm4a'];

  let loadedRelease = null;

  let nowPlaying = null;
  let nextPlaying = null;
  let players = [];
  
  let ready = false;
  let preparing = false;

  let playerWidget = null;

  let preventSliderUpdate = false;
  
  let prepareWidget = () => {
    playerWidget = {};
    ['desktop', 'mobile'].forEach((orientation) => {
      let player = makeDiv(['player', orientation]);
      playerWidget[orientation] = {
	title: makeDiv('title'),
	position: makeElem('input', null, null, (e) => {
	  e.type = 'range';
	  e.value = 0;
	  e.min = 0;
	  e.max = 1;
	  e.step = .001;
	  e.addEventListener('input', (e) => {
	    preventSliderUpdate = true;
	  });
	  e.addEventListener('change', (e) => {
	    if (nowPlaying) {
	      let num = players.findIndex(p => p==nowPlaying);
	      if (num >= 0) {
		let time = nowPlaying.duration*e.value;
		broadcastTrackStatusChange(num, 'transition');
		if (nowPlaying.fastSeek) nowPlaying.fastSeek(time);
		else nowPlaying.currentTime = time;
	      }
	      preventSliderUpdate = false;
	    }
	  });
	})
      };
      let pw = playerWidget[orientation];
      ['play', 'pause', 'transition', 'previous', 'next'].forEach((button) => {
	let name = (button=='transition') ? 'transition_anim' : button;
	pw[button] = makeImage(button, `img/icons/${name}_white.svg`, '', (e) => {
	  e.addEventListener('click', () => { playerWidgetClick(button); });
	});
      });
      Object.keys(pw).forEach((elem) => {
	player.appendChild(pw[elem]);
      });
      if (orientation=='mobile') {
	document.body.appendChild(player);
      } else {
	document.getElementsByClassName('flexMenuHolder')[0].appendChild(player);
      }
    });
  };
  
  let fading = [];

  let trackStatusListeners = [];

  var updatePlayerState = (trackNum, status) => {
    ['desktop', 'mobile'].forEach((or) => {
      let pw = playerWidget[or];
      switch(status) {
      case 'playing':
	pw.title.innerHTML = loadedRelease.tracks[trackNum].title;
	pw.play.style.display = 'none';
	pw.pause.style.display = 'block';
	pw.transition.style.display = 'none';
	pw.previous.style.display = trackNum > 0 ? 'block' : 'none';
	pw.next.style.display = trackNum < loadedRelease.tracks.length-1 ? 'block' : 'none';
	break;
      case 'transition':
	if (players[trackNum] == nowPlaying || players[trackNum] == nextPlaying) {
	  pw.play.style.display = 'none';
	  pw.pause.style.display = 'none';
	  pw.transition.style.display = 'block';
	}
	break;
      case 'ended':
      case 'pause':
	if (players[trackNum] == nowPlaying) {
	  pw.play.style.display = 'block';
	  pw.pause.style.display = 'none';
	  pw.transition.style.display = 'none';
	}
	break;
      }
    });			  
  };

  var sendPlayerAnalytics = (trackNum, status) => {
    if (typeof(trackNum) != 'number') {
      trackNum = players.findIndex(p => p==trackNum);
      if (trackNum < 0) return;
    }
    if (!gtag) return;
    let sendEvent = (type, data) => {
      // console.log('EVENT '+type+'\n'+JSON.stringify(data, null, 2));
      gtag('event', type, data);
    };
    switch(status) {
    case 'clickPlay':
      sendEvent('play_attempt', {
	track_id: trackNum+1,
	track_title: loadedRelease.tracks[trackNum].title
      });
      break;
    case 'playing':
      sendEvent('play_start', {
	track_id: trackNum+1,
	track_title: loadedRelease.tracks[trackNum].title
      });
      break;
    case 'ended':
      sendEvent('play_end', {
	track_id: trackNum+1,
	track_title: loadedRelease.tracks[trackNum].title,
	track_played_time: Math.round(players[trackNum].duration),
	track_played_percent: 100,
	track_played_complete: true
      });
      break;
    case 'pause':
      if (players[trackNum] != nowPlaying) {
	let percent = Math.round(100*(players[trackNum].currentTime/players[trackNum].duration));
	sendEvent('play_end', {
	  track_id: trackNum+1,
	  track_title: loadedRelease.tracks[trackNum].title,
	  track_played_time: Math.round(players[trackNum].currentTime),
	  track_played_percent: percent,
	  track_played_complete: percent >= 95
	});
      }
      break;
    case 'skip':
      let percent = Math.round(100*(players[trackNum].currentTime/players[trackNum].duration));
      sendEvent('play_end', {
	track_id: trackNum+1,
	track_title: loadedRelease.tracks[trackNum].title,
	track_played_time: Math.round(players[trackNum].currentTime),
	track_played_percent: percent,
	track_played_complete: percent >= 95
      });
      break;
    }
  };

  var onPageUnload = () => {
    if (nowPlaying && !nowPlaying.ended) {
      sendPlayerAnalytics(nowPlaying, 'skip');
    }
  };
  
  var broadcastTrackStatusChange = (trackNum, status) => {
    trackStatusListeners.forEach(cb => cb(loadedRelease.key, trackNum, status));
    updatePlayerState(trackNum, status);
    sendPlayerAnalytics(trackNum, status);
  };

  var playerWidgetClick = (button) =>{
    switch(button) {
    case 'play':
      playTrack();
      break;
    case 'pause':
      fadeOut();
      break;
    case 'next':
      moveToNext();
      break;
    case 'previous':
      moveToPrevious();
      break;
    }
  };

  var moveToNext = () => {
    if (!nowPlaying) return;
    let num = players.findIndex(p => p==nowPlaying);
    if (num < players.length-1) playTrack(num+1);
  };

  var moveToPrevious = () => {
    if (!nowPlaying) return;
    let num = players.findIndex(p => p==nowPlaying);
    if (num > 0) playTrack(num-1);
  };
  
  var fadeOut = (player) => {
    if (!player) player = nowPlaying;
    let num = players.findIndex(p => p==player);
    if (num < 0) return;
    if (player.ended || player.paused || fading[num]) return;
    fading[num] = true;
    broadcastTrackStatusChange(num, 'transition');
    let mult = .8;
    let dt = 25;
    let vol = mult;
    let t = 0;
    while (vol > .01) {
      let v = vol;
      setTimeout(() => {
	player.volume = v;
      }, t);
      vol *= mult;
      t += dt;
    }
    setTimeout(() => {
      player.pause();
      fading[num] = false;
    }, t);
  };

  var updatePlayerPosition = (event) => {
    if (nowPlaying && !preventSliderUpdate) {
      ['mobile', 'desktop'].forEach((or) => {
	playerWidget[or].position.value = nowPlaying.currentTime / nowPlaying.duration;
      });
    }
  };
  
  var playTrack = (num) => {
    if (!playerWidget)
      prepareWidget();
    document.body.classList.add('playerVisible');
    if (typeof(num) =='undefined') {
      num = players.findIndex(p => p==nowPlaying);
      if (num < 0) return;
    }
    if (typeof(num)=='string' && num.indexOf('/')>=0) {
      let [release, n] = num.split('/');
      preparePlayer(release);
      num = 1*n;
    }
    if (fading[num]) return;
    nextPlaying = players[num];
    nextPlaying.preload = 'auto';
    if (nextPlaying == nowPlaying) {
      if (nowPlaying.paused) {
	nowPlaying.volume = 1;
	nowPlaying.play();
      } else {
	fadeOut(nowPlaying);
      }
      nextPlaying = null;
    } else {
      sendPlayerAnalytics(num, 'clickPlay');
      broadcastTrackStatusChange(num, 'transition');
      nextPlaying.volume = 1;
      nextPlaying.load();
      nextPlaying.play().then(() => {
	let oldPlaying = nowPlaying;
	nowPlaying = nextPlaying;
	nextPlaying = null;
	if (oldPlaying) {
	  oldPlaying.removeEventListener('timeupdate', updatePlayerPosition);
	  if (oldPlaying.paused) {
	    sendPlayerAnalytics(oldPlaying, 'skip');
	    oldPlaying.load();
	  } else {
	    fadeOut(oldPlaying);
	  }
	}
	nowPlaying.addEventListener('timeupdate', updatePlayerPosition);
	if (navigator.mediaSession) {
	  navigator.mediaSession.metadata = new MediaMetadata( {
	    title: loadedRelease.tracks[num].title,
	    artist: 'Ho Tram Anh',
	    album: loadedRelease.title,
	    artwork: loadedRelease.coversArray
	  });
	}
	setTimeout(() => {
	  if (num > 0) players[num-1].preload = 'auto';
	  if (num < players.length-1) players[num+1].preload = 'auto';
	}, 3000);
      });
    }
  };

  var preparePlayer = (key) => {
    if (loadedRelease && key == loadedRelease.key) return;
    console.log('Preparing', key);
    let existing = document.querySelector('div.audioHolder');
    if (existing) {
      document.body.removeChild(existing);
    }
    players = [];

    let holder = makeDiv('audioHolder');
    loadedRelease = hta.contentData.releases[key];
    loadedRelease.coversArray = [];
    for (let s of [96, 128, 192, 256, 384, 512]) {
      loadedRelease.coversArray.push({
	src: `img/mediaSessionCover/${key}_${s}.png`,
	sizes: `${s}x${s}`,
	type: 'image/png'
      });
    }

    loadedRelease.tracks.forEach((t, i) => {
      if (t.audio) {
	let elem = document.createElement('audio');
	elem.id = 'audioTrack-'+i;
	elem.preload = 'none';
	formats.forEach((f) => {
	  let src = document.createElement('source');
	  src.src = `audio/${key}/${f}/${t.audio}.${f}`;
	  elem.appendChild(src);
	});
	elem.addEventListener('ended', moveToNext);
	['ended', 'pause', 'playing'].forEach((eType) => {
	  elem.addEventListener(eType, (e) => {
	    broadcastTrackStatusChange(i, eType);
	  });
	});
	holder.appendChild(elem);
	players.push(elem);
      }
    });
    document.body.appendChild(holder);
    
    ready = true;
  };

  var registerTrackStatusListener = (callback) => {
    trackStatusListeners.push(callback);
  };

  var unregisterTrackStatusListener = (callback) => {
    trackStatusListeners = trackStatusListeners.filter(c => c!=callback);
  };

  var trackStatus = (num) => {
    if (typeof(num)=='string' && num.indexOf('/')>=0) {
      let [release, n] = num.split('/');
      if (release != loadedRelease.key)
	return 'pause';
      num = n;
    }
    if (players[num] == nowPlaying) {
      return nowPlaying.ended || nowPlaying.paused ? 'pause' : 'playing';
    } else {
      return 'pause';
    }
  };
  
  hta.player = {

    prepare: (release) => {
      if (!loadedRelease) preparePlayer(release);
    },

    play: playTrack,

    trackStatusChange: registerTrackStatusListener,

    stopTrackingStatusChange: unregisterTrackStatusListener,

    trackStatus: trackStatus,

    onPageUnload: onPageUnload
    
  };
  
}) ();



class Donation {
  
  nameInput = null;
  emailInput = null;
  doneButton = null;
  emailForm = null;
  dmDiv = null;
  dmHideDiv = null;
  emailForm = null;
  divs = [];
  
  emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  constructor (type) {
    let content = getHTA().contentData.donation;
    let anchor = makeElem('a');
    anchor.id = 'donation';
    this.emailForm = makeDiv('emailForm', [
      makeDiv('formLabel', 'Your name:'),
      makeElem('input', null, null, (e) => {
	this.nameInput = e;
	e.type = 'text';
	e.addEventListener('input', () => this.validateNameEmail());
      }),
      makeElem('br'),
      makeDiv('formLabel', 'Your email:'),
      makeElem('input', null, null, (e) => {
	this.emailInput = e;
	e.type = 'text';
	e.addEventListener('input', () => this.validateNameEmail());
      }),
      makeElem('br'),
      makeElem('input', null, null, (e) => {
	this.doneButton = e;
	e.type = 'button';
	e.value = 'Done';
	e.disabled = true;
	e.addEventListener('click', () => this.sendDonationIntent());
      })
    ]);
    this.divs = [
      anchor,
      makeDiv('donationTitle', content.title.replaceAll('###', type)),
      ...content.introText.map(pHtml => makeElem('p', null, pHtml.replaceAll('###', type))),
      this.emailForm,
      makeDiv('donationMethods', [
	makeDiv('dmHide', null, (e) => { this.dmHideDiv = e; }),
	makeDiv('methodChoiceTitle', 'Choose a method:'),
	...content.methods.map( method => 
	  makeDiv('methodDiv', [
	    makeDiv('methodTitle', method.title),
	    makeDiv('methodBody', method.html)
	  ]))
      ], (e) => { this.dmDiv = e; }) 
    ];
  }

  validateNameEmail () {
    let result = true;
    if (!this.nameInput || !this.emailInput) result = false;
    if (this.nameInput.value.length < 4) result = false;
    if (!this.emailRegexp.test(this.emailInput.value)) result = false;
    if (this.doneButton) this.doneButton.disabled = !result;
    return result;
  }
  
  sendDonationIntent () {
    if (!this.validateNameEmail()) return;
    let release = encodeURIComponent('Wetlands');
    let name = encodeURIComponent(this.nameInput.value);
    let email = encodeURIComponent(this.emailInput.value);
    fetch(`sendDonationEmail.php?name=${name}&email=${email}%release=${release}`);
    localStorage.setItem('donationEmail', this.emailInput.value);
    if (this.dmHideDiv) this.dmHideDiv.style.display = 'none';
    if (this.dmDiv) this.dmDiv.style.opacity = 1;
    if (this.emailForm) this.emailForm.style.display = 'none';
  };

}

(function() {

  let hta = getHTA();

  let content = hta.contentData.releases.streetlights;
  
  let buildPage = (root) => {
    let donation = new Donation('album');
    root.addDiv(null, [
      makeDiv('albumTitleHolder', makeImage('albumTitle', 'img/streetlights_title_dark.png', 'The Poetry of Streetlights')),
      makeDiv('albumCoverHolder', makeImage('albumCover', 'img/covers/streetlights_cover.jpg', 'Album cover for The Poetry of Streetlights')),
      ...content.insertText.map(pHtml => makeElem('p', null, pHtml)),
      ...content.tracks.map((t,i) => 
	makeDiv(['albumTrack', hta.player.trackStatus(`streetlights/${i}`)], [
	  makeDiv('trackNumber', i+1),
	  makeDiv('trackTitle', t.title),
	  makeImage(['trackStatus', 'pause'], 'img/icons/play.svg', 'Play'),
	  makeImage(['trackStatus', 'playing'], 'img/icons/pause.svg', 'Pause'),
	  makeImage(['trackStatus', 'transition'], 'img/icons/transition_anim.svg', 'Wait')
	], (e) => {
	  e.id = 'albumTrack-'+i;
	  e.addEventListener('click', () => {
	    hta.player.play(`streetlights/${i}`);
	  });
	})),  
      makeDiv('albumCredits', 'Credits'),
      ...content.credits.map((c,i) => {
	let cto = c[2] && c[2].length ? 'a target="_blank"' : 'span';
	let ctc = c[2] && c[2].length ? 'a' : 'span';
	return (c[0].endsWith(':')) ?
	  makeDiv('creditsLine', `${c[0]} <${cto} class="creditName" href="${c[2]}">${c[1]}</${ctc}>`) :
	  makeDiv('creditsLine', `<${cto} class="creditName" href="${c[2]}">${c[0]}</${ctc}>: ${c[1]}`);
      }),
      makeElem('hr'),
      ...donation.divs
    ]);
  };

  let updateTrackStatus = (key, trackNum, status) => {
    if (key != 'streetlights') return;
    let elem = document.getElementById('albumTrack-'+trackNum);
    if (!elem) return;
    if (status=='ended') status = 'pause';
    ['playing', 'pause', 'transition'].forEach((s) => {
      if (s==status) elem.classList.add(s);
      else elem.classList.remove(s);
    });
  };
  
  hta.navigation.registerSection({

    name: 'poetry-of-streetlights',
    
    init: () => {},

    preload: () => {
      hta.player.prepare('streetlights');
    },

    getContent: (root) => new Promise((resolve, reject) => {
      buildPage(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {
      hta.player.trackStatusChange(updateTrackStatus);
    },

    onDisappearing: () => {
      hta.player.stopTrackingStatusChange(updateTrackStatus);
    },

    cleanup: () => {}
    
  });
    
}) ();
(function() {

  let hta = getHTA();

  let content = hta.contentData.releases.wetlands;
  
  let buildPage = (root) => {
    let donation = new Donation('EP');
    root.addDiv(null, [
      makeDiv('pageTitle', content.title),
      makeDiv('albumCoverHolder', makeImage('albumCover', 'img/covers/wetlands_cover.jpg', 'Album cover for Wetlands')),
      ...content.insertText.map(pHtml => makeElem('p', null, pHtml)),
      ...content.tracks.map((t,i) => 
	makeDiv(['albumTrack', hta.player.trackStatus(`wetlands/${i}`)], [
	  makeDiv('trackNumber', i+1),
	  makeDiv('trackTitle', t.title),
	  makeImage(['trackStatus', 'pause'], 'img/icons/play.svg', 'Play'),
	  makeImage(['trackStatus', 'playing'], 'img/icons/pause.svg', 'Pause'),
	  makeImage(['trackStatus', 'transition'], 'img/icons/transition_anim.svg', 'Wait')
	], (e) => {
	  e.id = 'albumTrack-'+i;
	  e.addEventListener('click', () => {
	    hta.player.play(`wetlands/${i}`);
	  });
	})),  
      makeDiv('albumCredits', 'Credits'),
      ...content.credits.map((c,i) => {
	let cto = c[2] && c[2].length ? 'a target="_blank"' : 'span';
	let ctc = c[2] && c[2].length ? 'a' : 'span';
	return (c[0].endsWith(':')) ?
	  makeDiv('creditsLine', `${c[0]} <${cto} class="creditName" href="${c[2]}">${c[1]}</${ctc}>`) :
	  makeDiv('creditsLine', `<${cto} class="creditName" href="${c[2]}">${c[0]}</${ctc}>: ${c[1]}`);
      }),
      makeElem('hr'),
      ...donation.divs
    ]);
  };

  let updateTrackStatus = (key, trackNum, status) => {
    console.log('onTrackStatusChange', key, trackNum, status);
    if (key != 'wetlands') return;
    let elem = document.getElementById('albumTrack-'+trackNum);
    if (!elem) return;
    if (status=='ended') status = 'pause';
    ['playing', 'pause', 'transition'].forEach((s) => {
      if (s==status) elem.classList.add(s);
      else elem.classList.remove(s);
    });
  };
  
  hta.navigation.registerSection({

    name: 'wetlands',
    
    init: () => {},

    preload: () => {
      hta.player.prepare('wetlands');
    },

    getContent: (root) => new Promise((resolve, reject) => {
      buildPage(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {
      hta.player.trackStatusChange(updateTrackStatus);
    },

    onDisappearing: () => {
      hta.player.stopTrackingStatusChange(updateTrackStatus);
    },

    cleanup: () => {}
    
  });
    
}) ();
