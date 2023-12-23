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


