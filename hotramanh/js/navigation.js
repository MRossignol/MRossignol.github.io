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
      console.log(currentSection);
      console.log(nextSection);
      if (currentSection) callback(currentSection.name);
      else if (nextSection) callback(nextSection.name);
    }, 100);
  }
  
  function ContentArea (section) {
    
    this.section = section;
    
    let self = this;
    
    let contentWrapper = document.body;

    let re = makeDiv('contentFrame', section.name);
    let elem = re;

    if (section.name!='intro') {
      elem = makeDiv('content', section.name);
      re.appendChild(makeDiv('contentFlex1'));
      re.appendChild(elem);
      re.appendChild(makeDiv('contentFlex2'));
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
    let section = window.location.pathname.replace(/^.*\//, '').replace(/\..*/, '');
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
    
  });


  
  
  hta.navigation = {
    registerSection: registerSection,
    openSection: openSection,
    onSectionChange: registerSectionChangeCallback,
    currentSection: () => currentSection,
    nextSection: () => nextSection
  };
  
}) ();
