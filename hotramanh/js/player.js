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

  let preventSliderUpdate = false;
  
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
	next: new Image(),
	position: document.createElement('input')
      };
      let pw = playerWidget[orientation];
      pw.position.type = 'range';
      pw.position.value = 0;
      pw.position.min = 0;
      pw.position.max = 1;
      pw.position.step = .001;
      pw.position.addEventListener('input', (e) => {
	preventSliderUpdate = true;
      });
      pw.position.addEventListener('change', (e) => {
	if (nowPlaying) {
	  let num = players.findIndex(p => p==nowPlaying);
	  if (num >= 0) {
	    let time = nowPlaying.duration*pw.position.value;
	    broadcastTrackStatusChange(num, 'transition');
	    if (nowPlaying.fastSeek) nowPlaying.fastSeek(time);
	    else nowPlaying.currentTime = time;
	  }
	  preventSliderUpdate = false;
	}
      });
      ['play', 'pause', 'transition', 'previous', 'next'].forEach((button) => {
	pw[button].classList.add(button);
	let name = (button=='transition') ? 'transition_anim' : button;
	pw[button].src = 'img/icons/'+name+'_white.svg';
	pw[button].addEventListener('click', () => { playerWidgetClick(button); });
      });
      Object.keys(playerWidget[orientation]).forEach((elem) => {
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
	track_title: hta.contentData.streetlights.tracks[trackNum].title
      });
      break;
    case 'playing':
      sendEvent('play_start', {
	track_id: trackNum+1,
	track_title: hta.contentData.streetlights.tracks[trackNum].title
      });
      break;
    case 'ended':
      sendEvent('play_end', {
	track_id: trackNum+1,
	track_title: hta.contentData.streetlights.tracks[trackNum].title,
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
	  track_title: hta.contentData.streetlights.tracks[trackNum].title,
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
	track_title: hta.contentData.streetlights.tracks[trackNum].title,
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
    trackStatusListeners.forEach(cb => cb(trackNum, status));
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

    trackStatus: trackStatus,

    onPageUnload: onPageUnload
    
  };
  
}) ();
