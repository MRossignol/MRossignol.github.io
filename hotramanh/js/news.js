(function() {

  let hta = getHTA();
    
  hta.navigation.registerSection({

    name: 'news',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      let content = document.createElement('div');
      content.addDiv('pageTitle', 'News');
      content.appendChild(socialBox());
      let iframe = document.createElement('iframe');
      iframe.src = 'include-news.html';
      content.appendChild(iframe);
      root.appendChild(content);
      resolve();
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {},

    adjustIframeHeight: (height) => {
      document.getElementsByTagName('iframe')[0].style.height = Math.ceil(height+30)+'px';
    }
    
  });
    
}) ();
