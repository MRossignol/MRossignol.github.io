(function() {
  
  const content = {
    intro: {
      title: 'Welcome',
      text: [
	'This tool will allow us to collect samples of your voice',
	'If your browser asks whether you want to allow microphone access, please accept, otherwise there\'s not much we can do...',
	'Please make sure you\'re in a quiet place, with a good internet connection, and won\'t be interrupted, then click "Start".'
      ],
      buttons: 'Start'
    },
    warmup: {
      text: [
	'This bar up there &uarr; shows the volume of the recording.',
	'You should see it move when you speak. If it doesn\'t move, please try accessing this page with a different browser, or contact us.',
	'Try to adjust your speech volume and distance to the phone so that the maximum stays in the blue frame.',
	'Go ahead, practice a bit.'
      ],
      buttons: 'Next'
    },
    
  };

  var currentPage = 'intro';

  function gotoPage(section) {
    window.currentPage = section;
    const data = content[section];
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
	b.addEventListener('click', () => buttonClick(section, bText));
	buttonsDiv.appendChild(b);
      }
      buttonsDiv.style.display = 'block';
    } else {
      buttonsDiv.style.display = 'none';
    }
  }

  function buttonClick(section, bText) {
    switch(section) {
    case 'intro':
      initAudio();
      gotoPage('warmup');
      break;
    }
  }

  window.addEventListener('load', () => {
    if (window.innerHeight < 1.8*window.innerWidth) {
      const contentHolder = document.querySelector('div#contentHolder');
      let w = Math.round(window.innerHeight/1.8);
      contentHolder.style.width = w+'px';
      contentHolder.style.left = Math.round((window.innerWidth-w)/2)+'px';
    }
    gotoPage('intro');
  });

})();
