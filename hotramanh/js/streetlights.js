(function() {

  let hta = getHTA();

  let content = hta.contentData.streetlights;
  
  let buildPage = (root) => {
    let container = document.createElement('div');
    root.appendChild(container);
    container.appendChild(setElemHTML(makeDiv('pageTitle'), content.title));
    container.appendChild(setElemHTML(makeDiv('albumCoverHolder'), '<img class="albumCover" src="img/covers/streetlights_cover.jpg" />'));
    content.tracks.forEach((t,i) => {
      let track = makeDiv('albumTrack', hta.player.trackStatus(i));
      track.id = 'albumTrack-'+i;
      track.appendChild(setElemHTML(makeDiv('trackNumber'), i+1));
      track.appendChild(setElemHTML(makeDiv('trackTitle'), t.title));
      let playImg = document.createElement('img');
      playImg.classList.add('trackStatus');
      playImg.classList.add('pause');
      playImg.src = 'img/icons/play.svg';
      track.appendChild(playImg);
      let pauseImg = document.createElement('img');
      pauseImg.classList.add('trackStatus');
      pauseImg.classList.add('playing');
      pauseImg.src = 'img/icons/pause.svg';
      track.appendChild(pauseImg);
      let transImg = document.createElement('img');
      transImg.classList.add('trackStatus');
      transImg.classList.add('transition');
      transImg.src = 'img/icons/transition_anim.svg';
      track.appendChild(transImg);
      container.appendChild(track);
    });
    container.appendChild(setElemHTML(makeDiv('albumCredits'), 'Credits'));
    content.credits.forEach((c,i) => {
      if (c[0].indexOf('by') != -1) {
	container.appendChild(setElemHTML(makeDiv('creditsLine'), c[0]+' <span class="creditName">'+c[1]+'</span>'));
      } else {
	container.appendChild(setElemHTML(makeDiv('creditsLine'), '<span class="creditName">'+c[0]+'</span>: '+c[1]+'</div>'));
      }
    });
  };

  hta.player.onTrackStatusChange((trackNum, status) => {
    let elem = document.getElementById('albumTrack-'+trackNum);
    if (!elem) return;
    ['playing', 'pause', 'transition'].forEach((s) => {
      if (s==status) elem.classList.add(s);
      else elem.classList.remove(s);
    });
  });
  
  hta.navigation.registerSection({

    name: 'poetry-of-streetlights',
    
    init: () => {},

    preload: () => {
      hta.player.prepare();
    },

    getContent: (root) => new Promise((resolve, reject) => {
      buildPage(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {
      console.log('layout');
      content.tracks.forEach((t,i) => {
	let trackDiv = document.getElementById('albumTrack-'+i);
	console.log(trackDiv);
	if (trackDiv) trackDiv.addEventListener('click', () => {
	  hta.player.play(i);
	});
      });
    },

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
