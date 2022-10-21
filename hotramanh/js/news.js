(function() {

  let hta = getHTA();
    
  hta.navigation.registerSection({

    name: 'news',
    
    init: () => {},

    preload: () => {},

    getContent: (root) => new Promise((resolve, reject) => {
      resolve('<div><div class="pageTitle">News</div><iframe src="include-news.html"></iframe></div>');
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
