(function() {

  let hta = getHTA();

  let formats = ['opus', 'm4a'];

  let nowPlaying = null;
  let nextPlaying = null;
  let players = [];
  
  let ready = false;
  let preparing = false;

  let coversArray = [
    { src: 'img/mediaSessionCover/cover_96.png',  sizes: '96x96',   type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_128.png', sizes: '128x128', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_192.png', sizes: '192x192', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_256.png', sizes: '256x256', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_384.png', sizes: '384x384', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_512.png', sizes: '512x512', type: 'image/png' },
  ];

  let playerWidget = null;
  
  let prepareWidget = () => {
    playerWidget = {};
    ['desktop', 'mobile'].forEach((orientation) => {
      let player = makeDiv('player', orientation);
      playerWidget[orientation] = {
	title: makeDiv('title'),
	play: new Image(),
	pause: new Image(),
	transition: new Image(),
	previous: new Image(),
	next: new Image()
      };
      ['play', 'pause', 'transition', 'previous', 'next'].forEach((button) => {
	playerWidget[orientation][button].classList.add(button);
	let name = (button=='transition') ? 'transition_anim' : button;
	playerWidget[orientation][button].src = 'img/icons/'+name+'_white.svg';
	playerWidget[orientation][button].addEventListener('click', () => { playerWidgetClick(button); });
      });
      Object.keys(playerWidget[orientation]).forEach((elem) => {
	player.appendChild(playerWidget[orientation][elem]);
      });
      if (orientation=='mobile') {
	document.body.appendChild(player);
      } else {
	console.log(player);
	document.getElementsByClassName('flexMenuHolder')[0].appendChild(player);
      }
    });
  };
  
  let fading = [];

  let trackStatusListeners = [];

  let updatePlayerState = (trackNum, status) => {
    ['desktop', 'mobile'].forEach((or) => {
      let pw = playerWidget[or];
      switch(status) {
      case 'playing':
	pw.title.innerHTML = hta.contentData.streetlights.tracks[trackNum].title;
	pw.play.style.display = 'none';
	pw.pause.style.display = 'block';
	pw.transition.style.display = 'none';
	pw.previous.style.display = trackNum > 0 ? 'block' : 'none';
	pw.next.style.display = trackNum < hta.contentData.streetlights.tracks.length-1 ? 'block' : 'none';
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
  
  let broadcastTrackStatusChange = (trackNum, status) => {
    trackStatusListeners.forEach(cb => cb(trackNum, status));
    console.log(trackNum, status);
    //if (players[trackNum] == nowPlaying || players[trackNum] == nextPlaying) {
      updatePlayerState(trackNum, status);
    //}
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
  
  var playTrack = (num) => {
    if (!playerWidget)
      prepareWidget();
    document.body.classList.add('playerVisible');
    if (typeof(num) =='undefined') {
      num = players.findIndex(p => p==nowPlaying);
      if (num < 0) return;
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
      broadcastTrackStatusChange(num, 'transition');
      nextPlaying.volume = 1;
      nextPlaying.load();
      nextPlaying.play().then(() => {
	let oldPlaying = nowPlaying;
	nowPlaying = nextPlaying;
	nextPlaying = null;
	if (oldPlaying) {
	  if (oldPlaying.paused)
	    oldPlaying.load();
	  else
	    fadeOut(oldPlaying);
	}
	if (navigator.mediaSession) {
	  navigator.mediaSession.metadata = new MediaMetadata( {
	    title: hta.contentData.streetlights.tracks[num].title,
	    artist: 'Ho Tram Anh',
	    album: 'The Poetry Of Streetlights',
	    artwork: coversArray
	  });
	}
	setTimeout(() => {
	  if (num > 0) players[num-1].preload = 'auto';
	  if (num < players.length-1) players[num+1].preload = 'auto';
	}, 3000);
      });
    }
  };

  var preparePlayer = () => {
    console.log('prepare');
    if (preparing || ready) return;
    preparing = true;

    let holder = makeDiv('audioHolder');

    hta.contentData.streetlights.tracks.forEach((t, i) => {
      if (t.audio) {
	let elem = document.createElement('audio');
	elem.id = 'audioTrack-'+i;
	elem.preload = 'none';
	formats.forEach((f) => {
	  let src = document.createElement('source');
	  src.src = 'audio/'+f+'/'+t.audio+'.'+f;
	  elem.appendChild(src);
	  elem.addEventListener('ended', moveToNext);
	  ['ended', 'pause', 'playing'].forEach((eType) => {
	    elem.addEventListener(eType, () => {
	      broadcastTrackStatusChange(i, eType);
	    });
	  });
	});
	holder.appendChild(elem);
	players.push(elem);
      }
    });
    document.body.appendChild(holder);
    
    ready = true;
    preparing = false;
  };

  var registerTrackStatusListener = (callback) => {
    trackStatusListeners.push(callback);
  };

  var trackStatus = (num) => {
    if (players[num] == nowPlaying) {
      return nowPlaying.ended || nowPlaying.paused ? 'pause' : 'playing';
    } else {
      return 'pause';
    }
  };
  
  hta.player = {

    prepare: preparePlayer,

    play: playTrack,

    onTrackStatusChange: registerTrackStatusListener,

    trackStatus: trackStatus
    
  };
  
}) ();
