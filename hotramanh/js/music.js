(function() {

  let hta = getHTA();


  let html = () => {

    let content = hta.contentData.music;
    
    let res = '<div class="pageTitle">'+content.title+'</div>';
    res += content.albumHTML;
    return res;
  };

  let makeContent = function(root) {
    let content = hta.contentData.music;

    root.appendChild(setElemHTML(makeDiv('pageTitle'), content.title));
    let a = sectionLink('poetry-of-streetlights');
    a.classList.add('album');
    let img = document.createElement('img');
    img.src = content.albumOutImage;
    img.classList.add('albumCover');
    a.appendChild(img);
    let p = document.createElement('p');
    p.innerHTML = content.albumOutText;
    a.appendChild(p);
    root.appendChild(a);
    content.sections.forEach((s) => {
      root.appendChild(setElemHTML(makeDiv('musicSectionTitle'), s.title));
      s.releases.forEach((r) => {
	a = document.createElement('a');
	a.classList.add('release');
	a.href = r.links.Bandcamp;
	let div = document.createElement('div');
	let img = document.createElement('img');
	img.classList.add('releaseImage');
	img.src = 'img/covers/'+r.img+'.jpg';
	div.appendChild(img);
	div.appendChild(setElemHTML(makeDiv('releaseTitle'), r.title));
	div.appendChild(setElemHTML(makeDiv('releaseSubtitle'), r.year+', Bandcamp'));
	a.appendChild(div);
	root.appendChild(a);
      });
    });
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
