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
  
  hta.navigation.registerSection({

    name: 'about',
    
    init: () => {},

    preload: () => {},

    getContent: () => new Promise((resolve, reject) => {
      resolve(html());
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
