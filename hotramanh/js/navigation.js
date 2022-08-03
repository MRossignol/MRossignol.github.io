(function() {

  let hta = getHTA();

  hta.sections = {};
  
  let currentSection = null, nextSection = null,
      currentContent = null,
      inTransition = false,
      waitingToTransition = null;

  let documentLoaded = false;
  
  
  function ContentArea (section) {

    this.section = section;
    
    let self = this;
    
    let contentWrapper = document.getElementsByClassName('contentWrapper')[0];
    let menu = document.getElementsByClassName('menu')[0];

    this.elem = document.createElement('div');
    this.elem.classList.add(section.name);
    this.elem.classList.add('content');
    
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
	menu.classList.remove(currentContent.section.name);
      }
      menu.classList.add(section.name);
      
      section.getContent().then((text) => {
	
	self.elem.innerHTML = text;
	self.elem.classList.add(currentContent ? 'insert' : 'fastInsert');
	contentWrapper.appendChild(self.elem);
	if (section.layout) {
	  section.layout();
	}

	nextSection = section;

	setTimeout(() => {
	  if (section.onAppearing) section.onAppearing();
	  hta.sectionLinks.processSectionLinks(self.elem);
	  if (section.preloadNext) section.preloadNext();
	});
	
	    
	let onAnimationEnd = () => {
	  self.elem.removeEventListener('animationend', onAnimationEnd);
	  self.elem.classList.remove('insert');
	  self.elem.classList.remove('fastInsert');
	  if (currentContent) currentContent.destroy();
	  currentContent = self;
	  if (section.onAppeared) section.onAppeared();
	  resolve();
	};
	    
	self.elem.addEventListener('animationend', onAnimationEnd);
      }, giveUp);
      
    });

    this.disappear = () => {
      this.elem.classList.add('remove');
      if (section.onDisappearing) section.onDisappearing();
    };

    this.reappear = () => {
      this.elem.classList.remove('remove');
      if (section.onAppearing) section.onAppearing();
    };

    this.destroy = () => {
      if (section.cleanup) section.cleanup();
      contentWrapper.removeChild(this.elem);
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

    hta.sectionLinks.activate(sectionName);

    let section = hta.sections[sectionName];
    
    new ContentArea(section).load().then(() => {
      inTransition = false;
      currentSection = section;
      nextSection = null;
      if (waitingToTransition) {
	openSection(waitingToTransition);
	waitingToTransition = null;
      }
    }, () => {
      hta.sectionLinks.activate(currentSection);
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
  
  window.addEventListener('DOMContentLoaded', () => {

    detectOrientation();
    
    Object.keys(hta.sections).forEach((section) => {
      if (hta.sections[section].init) hta.sections[section].init();
    });

    documentLoaded = true;

    window.addEventListener('popstate', function () {
      openSection(window.location.pathname.replace(/^\//, '').replace(/\..*/, ''));
    });

    let section = window.location.pathname.replace(/^\//, '').replace(/\..*/, '');
    openSection(hta.sections[section] ? section : 'intro');

    let resizeThrottle = null;
    
    window.addEventListener('resize', () => {
      if (resizeThrottle) return;
      resizeThrottle = setTimeout(() => {
	resizeThrottle = null;
	detectOrientation();
	if (currentSection && currentSection.onResize) currentSection.onResize();
	if (nextSection && nextSection.onResize) nextSection.onResize();
      }, 50);
    });


    
  });

  
  function registerSection (settings) {
    let name = settings.name;
    if (documentLoaded && settings.hasOwnProperty('init')) {
      settings.init();
    }
    hta.sections[name] = settings;
  }

  
  hta.navigation = {
    registerSection: registerSection,
    openSection: openSection,
    currentSection: () => currentSection
  };
  
}) ();
