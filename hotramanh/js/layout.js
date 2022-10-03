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
