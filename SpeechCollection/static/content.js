(function() {

  var audioRecorder = new AudioRecorder();

  var visualizer = null;
  var user_id = null;

  const promptCategories = ['short', 'numbers', 'podcast', 'tongdai', 'happy', 'angry', 'sad'];
  var currentPromptCategory = null;
  var currentPromptIndex = 0;
  
  const content = {
    needCookies: {
      title: 'Sorry,',
      text: ['This page needs to use cookies to work.', 'Please allow cookies and reload the page.']
    },
    noAudio: {
      title: 'Sorry,',
      text: ['We couldn\'t find an audio device to record from.', 'Did you allow the page to access your microphone?', 'Please reload the page to try again, or try with another browser or device.']
    },
    intro: {
      title: 'Welcome',
      text: [
	'This tool will allow us to collect samples of your voice.',
	'If your browser asks whether you want to allow microphone access, please accept.',
	'Please <b>do not use earphones</b>, but the microphone on your phone.',
	'Please make sure you\'re in a quiet place, with a good internet connection, and won\'t be interrupted, then click "Start".'
      ],
      buttons: 'Start'
    },
    warmup: {
      text: [
	'This bar up there &uarr; shows the evolution of the volume of the recording.',
	'You should see it move when you speak. If it doesn\'t move, please try accessing this page with a different browser, or contact us.',
	'Try to adjust your speech volume and distance to the phone so that the peaks reach dark blue, but not red.',
	'Go ahead, practice a bit.'
      ],
      buttons: 'Next',
      run: () => {
	document.querySelector('div#buttons').firstChild.style.visibility = 'hidden';
	audioRecorder.addEventListener('canStep', (data) => {
	  if (data.instantMax > .2) {
	    audioRecorder.removeEventListener('canStep');
	    document.querySelector('div#buttons').firstChild.style.visibility = 'visible';
	  }
	});
      }
    },
    promptsOver: {
      title: 'All done!'
    }
  };

  var currentPage = 'intro';

  function gotoPage(section, promptCategory, promptIndex) {
    window.currentPage = section;
    var data;
    if (section == 'prompt') {
      if (promptIndex > 1) {
	audioRecorder.upload(promptCategory, promptIndex-1);
      }
      let promptCatData = promptCollections[promptCategory];
      if (promptIndex < promptCatData.length) {
	data = { text: promptCatData[promptIndex], buttons: promptIndex ? 'Next' : 'Start'};
	audioRecorder.startRecording();
      } else if (promptCategories.length > 0) {
	gotoPage('prompt', promptCategories.shift(), 0);
	return;
      } else {
	gotoPage('promptsOver');
	return;
      }
    } else {
      data = content[section];
    }
    if (data.hasOwnProperty('title')) {
      document.querySelector('div#title').innerText = data.title;
      document.querySelector('div#title').style.display = 'block';
    } else {
      document.querySelector('div#title').style.display = 'none';
    }
    
    const textDiv = document.querySelector('div#text');
    while (textDiv.lastChild) {
      textDiv.removeChild(textDiv.lastChild);
    }
    if (data.hasOwnProperty('text')) {
      let txt = data.text;
      if (!Array.isArray(txt)) txt = [txt];
      for (let line of txt) {
	let p = document.createElement('p');
	p.innerHTML = line;
	textDiv.appendChild(p);
      }
      if (section == 'prompt' && promptIndex > 0) {
	textDiv.classList.add('prompt');
      } else {
	textDiv.classList.remove('prompt');
      }
      textDiv.style.display = 'block';
    } else {
      textDiv.style.display = 'none';
    }
    const buttonsDiv = document.querySelector('div#buttons');
    while (buttonsDiv.lastChild) {
      buttonsDiv.removeChild(buttonsDiv.lastChild);
    }
    if (data.hasOwnProperty('buttons')) {
      let buttons = data.buttons;
      if (!Array.isArray(buttons)) buttons = [buttons];
      for (let bText of buttons) {
	let b = document.createElement('div');
	b.innerText = bText;
	b.addEventListener('click', () => buttonClick(section, bText, promptCategory, promptIndex));
	buttonsDiv.appendChild(b);
      }
      buttonsDiv.style.display = 'block';
    } else {
      buttonsDiv.style.display = 'none';
    }
    if (data.run) data.run();
  }

  async function buttonClick(section, bText, promptCategory, promptIndex) {
    switch(section) {
    case 'intro':
      if (await audioRecorder.init()) {
	document.querySelector('div#visualizer').style.display = 'block';
	visualizer = new Visualizer(document.querySelector('canvas#visualizer-canvas'), audioRecorder.ac.sampleRate, 2);
	audioRecorder.addEventListener('viz', (data) => {
	  visualizer.addPoint(data);
	});
	setInterval(() => visualizer.draw(), 30);
        gotoPage('warmup');
      } else {
        gotoPage('noAudio');
      }
      break;
    case 'warmup':
      gotoPage('prompt', promptCategories.shift(), 0);
      break;
    case 'prompt':
      gotoPage('prompt', promptCategory, promptIndex+1);
      break;
    }
  }

  window.addEventListener('load', () => {
    // const log = (data) => {
    //   let txt = typeof(data) == 'string' ? data : JSON.stringify(data, null, 2);
    //   document.querySelector('pre#console').innerHTML = txt;
    // };
    // globalThis.console = {
    //   log: log,
    //   error: log,
    //   warn: log,
    //   info: log
    // };
    if (window.innerHeight < 1.5*window.innerWidth) {
      const contentHolder = document.querySelector('div#contentHolder');
      let w = Math.round(window.innerHeight/1.5);
      contentHolder.style.width = w+'px';
      contentHolder.style.left = Math.round((window.innerWidth-w)/2)+'px';
    }
    const cookies = document.cookie.split(/ *; */).map(v => v.split('='));
    const user_cookie = cookies.find(v => v[0]=='user_id');
    if (user_cookie) {
      user_id = user_cookie[1];
    }
    if (user_id) {
      console.log('user_id: '+user_id);
      fetch('/user_agent', {method: 'POST', body: navigator.userAgent});
      gotoPage('intro');
    } else {
      gotoPage('needCookies');
    }
  });

})();
