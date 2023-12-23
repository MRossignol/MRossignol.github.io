(function() {

  let hta = getHTA();

  let html = () => {
    let content = hta.contentData.music;
    let res = '<div class="pageTitle">'+content.title+'</div>';
    res += content.albumHTML;
    return res;
  };

  let makeContent = function(contentRoot) {
    let content = hta.contentData.music;
    let root = document.createElement('div');
    root.addDiv('pageTitle', content.title);
    let a = sectionLink('poetry-of-streetlights', 'album');
    a.appendChild(makeImage('albumCover', content.albumOutImage, 'Album cover for The Poetry of Streetlights'));
    a.addElem('p', null, content.albumOutText);
    root.appendChild(a);
    root.appendChild(makeDiv('musicSectionTitle', content.newEpSection));
    a = sectionLink('wetlands', ['release', 'newRelease']);
    a.appendChild(makeDiv(null, [
      makeImage('releaseImage', 'img/covers/wetlands.jpg'),
      makeDiv('releaseTitle', content.wetlandsEpText1),
      makeDiv('releaseSubtitle', content.wetlandsEpText2)
    ]));
    root.appendChild(a);
    content.sections.forEach((s) => {
      root.appendChild(makeDiv('musicSectionTitle', s.title));
      s.releases.forEach((r) => {
	root.appendChild(makeLink('release',
				  makeDiv(null, [
				    makeImage('releaseImage', 'img/covers/'+r.img+'.jpg', 'Album cover for '+r.title),
				    makeDiv('releaseTitle', r.title),
				    makeDiv('releaseSubtitle', r.year+', Bandcamp')
				  ]), r.links.Bandcamp));
      });
    });
    contentRoot.appendChild(root);
  };
  
  hta.navigation.registerSection({

    name: 'music',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      makeContent(root);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
