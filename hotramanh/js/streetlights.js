(function() {

  let hta = getHTA();

  let content = hta.contentData.releases.streetlights;
  
  let buildPage = (root) => {
    let donation = new Donation('album');
    root.addDiv(null, [
      makeDiv('albumTitleHolder', makeImage('albumTitle', 'img/streetlights_title_dark.png', 'The Poetry of Streetlights')),
      makeDiv('albumCoverHolder', makeImage('albumCover', 'img/covers/streetlights_cover.jpg', 'Album cover for The Poetry of Streetlights')),
      ...content.insertText.map(pHtml => makeElem('p', null, pHtml)),
      ...content.tracks.map((t,i) => 
	makeDiv(['albumTrack', hta.player.trackStatus(`streetlights/${i}`)], [
	  makeDiv('trackNumber', i+1),
	  makeDiv('trackTitle', t.title),
	  makeImage(['trackStatus', 'pause'], 'img/icons/play.svg', 'Play'),
	  makeImage(['trackStatus', 'playing'], 'img/icons/pause.svg', 'Pause'),
	  makeImage(['trackStatus', 'transition'], 'img/icons/transition_anim.svg', 'Wait')
	], (e) => {
	  e.id = 'albumTrack-'+i;
	  e.addEventListener('click', () => {
	    hta.player.play(`streetlights/${i}`);
	  });
	})),  
      makeDiv('albumCredits', 'Credits'),
      ...content.credits.map((c,i) => {
	let cto = c[2] && c[2].length ? 'a target="_blank"' : 'span';
	let ctc = c[2] && c[2].length ? 'a' : 'span';
	return (c[0].endsWith(':')) ?
	  makeDiv('creditsLine', `${c[0]} <${cto} class="creditName" href="${c[2]}">${c[1]}</${ctc}>`) :
	  makeDiv('creditsLine', `<${cto} class="creditName" href="${c[2]}">${c[0]}</${ctc}>: ${c[1]}`);
      }),
      makeElem('hr'),
      ...donation.divs
    ]);
  };

  let updateTrackStatus = (key, trackNum, status) => {
    if (key != 'streetlights') return;
    let elem = document.getElementById('albumTrack-'+trackNum);
    if (!elem) return;
    if (status=='ended') status = 'pause';
    ['playing', 'pause', 'transition'].forEach((s) => {
      if (s==status) elem.classList.add(s);
      else elem.classList.remove(s);
    });
  };
  
  hta.navigation.registerSection({

    name: 'poetry-of-streetlights',
    
    init: () => {},

    preload: () => {
      hta.player.prepare('streetlights');
    },

    getContent: (root) => new Promise((resolve, reject) => {
      buildPage(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {
      hta.player.trackStatusChange(updateTrackStatus);
    },

    onDisappearing: () => {
      hta.player.stopTrackingStatusChange(updateTrackStatus);
    },

    cleanup: () => {}
    
  });
    
}) ();
