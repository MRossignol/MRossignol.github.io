(function() {

  let hta = getHTA();

  let formats = ['opus', 'm4a'];

  let nowPlaying = null;
  let players = [];
  
  let ready = false;
  let preparing = false;

  let coversArray = [
    { src: 'img/mediaSessionCover/cover_96.png',   sizes: '96x96',   type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_128.png', sizes: '128x128', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_192.png', sizes: '192x192', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_256.png', sizes: '256x256', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_384.png', sizes: '384x384', type: 'image/png' },
    { src: 'img/mediaSessionCover/cover_512.png', sizes: '512x512', type: 'image/png' },
  ];

  let fading = [];

  let trackStatusListeners = [];

  let broadcastTrackStatusChange = (track, status) => {
    trackStatusListeners.forEach(cb => cb(track, status));
  };
  
  let fadeOut = (player) => {
    let num = players.findIndex(p => p==player);
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
  
  let playTrack = (num) => {
    if (fading[num]) return;
    let nextPlayer = players[num];
    nextPlayer.preload = 'auto';
    if (nextPlayer == nowPlaying) {
      if (nowPlaying.paused) {
	nowPlaying.volume = 1;
	nowPlaying.play();
      } else {
	fadeOut(nowPlaying);
      }
    } else {
      broadcastTrackStatusChange(num, 'transition');
      nextPlayer.volume = 1;
      nextPlayer.load();
      nextPlayer.play().then(() => {
	if (nowPlaying) {
	  if (nowPlaying.paused)
	    nowPlaying.load();
	  else
	    fadeOut(nowPlaying);
	}
	nowPlaying = nextPlayer;
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

  let moveToNext = () => {
    if (!nowPlaying) return;
    let num = players.findIndex(p => p==nowPlaying);
    if (num < players.length-1) playTrack(num+1);
  };
  
  let preparePlayer = () => {
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

  let registerTrackStatusListener = (callback) => {
    trackStatusListeners.push(callback);
  };

  let trackStatus = (num) => {
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
