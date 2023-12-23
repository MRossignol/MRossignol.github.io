(function() {

  let hta = getHTA();
  
  let html = () => {
    let content = hta.contentData.about;
    let res = '<div><div class="pageTitle">'+content.title+'</div>';
    content.paragraphs.forEach((html) => {
      res += '<p>'+html+'</p>';
    });
    return res+'</div>';
  };

  let makeContent = (root) => {
    let content = hta.contentData.about;
    root.addDiv(null, [
      makeDiv('pageTitle', content.title),
      ...content.paragraphs.map(html => makeElem('p', null, html)),
      makeElem('hr'),
      socialBox()
    ]);
  };
  
  hta.navigation.registerSection({

    name: 'about',
    
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
