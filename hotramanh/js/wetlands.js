(function() {

  let hta = getHTA();

  let content = hta.contentData.releases.wetlands;
  
  let buildPage = (root) => {
    let donation = new Donation('EP');
    root.addDiv(null, [
      makeDiv('pageTitle', content.title),
      makeDiv('albumCoverHolder', makeImage('albumCover', 'img/covers/wetlands_cover.jpg', 'Album cover for Wetlands')),
      ...content.insertText.map(pHtml => makeElem('p', null, pHtml)),
      ...content.tracks.map((t,i) => 
	makeDiv(['albumTrack', hta.player.trackStatus(`wetlands/${i}`)], [
	  makeDiv('trackNumber', i+1),
	  makeDiv('trackTitle', t.title),
	  makeImage(['trackStatus', 'pause'], 'img/icons/play.svg', 'Play'),
	  makeImage(['trackStatus', 'playing'], 'img/icons/pause.svg', 'Pause'),
	  makeImage(['trackStatus', 'transition'], 'img/icons/transition_anim.svg', 'Wait')
	], (e) => {
	  e.id = 'albumTrack-'+i;
	  e.addEventListener('click', () => {
	    hta.player.play(`wetlands/${i}`);
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
    console.log('onTrackStatusChange', key, trackNum, status);
    if (key != 'wetlands') return;
    let elem = document.getElementById('albumTrack-'+trackNum);
    if (!elem) return;
    if (status=='ended') status = 'pause';
    ['playing', 'pause', 'transition'].forEach((s) => {
      if (s==status) elem.classList.add(s);
      else elem.classList.remove(s);
    });
  };
  
  hta.navigation.registerSection({

    name: 'wetlands',
    
    init: () => {},

    preload: () => {
      hta.player.prepare('wetlands');
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
