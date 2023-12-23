( function() {

  let hta = getHTA();
  
  let menuEntries = [
    {key:'main', img:'home', text:'Home'},
    {key:'about', img:'bio', text:'Bio'},
    {key:'music', img:'music', text:'Music'},
    {key:'media', img:'media', text:'Media'},
    {key:'news', img:'news', text:'News'},
  ];

  let imageCollection = 'lc_1';


  let handleLinkClick = (event) => {
    event.preventDefault();
    let elem = event.target;
    let hrefUrl = null;
    do {
      hrefUrl = elem.getAttribute('href');
      elem = elem.parentElement;
    } while (elem && !hrefUrl);
    window.history.pushState({}, event.target.innerHTML, hrefUrl);
    window.dispatchEvent(new Event('popstate'));
  };

  
  let menuImage = (menuEntry) => {
    let img = document.createElement('img');
    img.classList.add(imageCollection);
    img.src = 'img/links/'+imageCollection+'/'+menuEntry.img+'.png';
    img.alt = menuEntry.text;
    return img;
  };

  let menuIcon = (menuEntry) => {
    let img = document.createElement('img');
    img.classList.add('menuIcon');
    img.src = 'img/menu/'+menuEntry.img+'.png';
    img.alt = menuEntry.text;
    return img;
  };
  
  let makeMenu = () => {
    let desktopRoot = makeDiv(['contentFrame', 'above', 'desktop']);
    let menuHolder = makeDiv(['contentFlex1', 'menuHolder']);
    let menuFlex1 = makeDiv('menuFlex1');
    let flexMenuHolder = makeDiv('flexMenuHolder');
    let menuFlex2 = makeDiv('menuFlex2');
    let content = makeDiv('content');
    let contentFlex2 = makeDiv('contentFlex2');
    let menu = makeDiv('menu');
    menuEntries.forEach((entry) => {
      entry.elem = document.createElement('a');
      entry.elem.classList.add('menuItem');
      entry.elem.id = 'menu_'+entry.key;
      entry.elem.href = entry.key+'.html';
      entry.elem.appendChild(menuImage(entry));
      entry.elem.addEventListener('touchend', handleLinkClick);
      entry.elem.addEventListener('click', handleLinkClick);
      menu.appendChild(entry.elem);
    });
    flexMenuHolder.appendChild(menu);
    menuHolder.appendChildren([menuFlex1, flexMenuHolder, menuFlex2]);
    desktopRoot.appendChildren([menuHolder, content, contentFlex2]);
    document.body.appendChild(desktopRoot);

    let mobileRoot = makeDiv(['menu', 'mobile']);
    menuEntries.forEach((entry) => {
      entry.elem = document.createElement('a');
      entry.elem.classList.add('menuItem');
      entry.elem.id = 'menu_'+entry.key;
      entry.elem.href = entry.key+'.html';
      entry.elem.appendChild(menuIcon(entry));
      entry.elem.addEventListener('touchend', handleLinkClick);
      entry.elem.addEventListener('click', handleLinkClick);
      mobileRoot.appendChild(entry.elem);
    });
    document.body.appendChild(mobileRoot);
  };

  
  window.addEventListener('DOMContentLoaded', () => {
    makeMenu();
    hta.navigation.onSectionChange((sectionName) => {
      menuEntries.forEach((entry) => {
	if (entry.key == sectionName) {
	  entry.elem.classList.add('active');
	} else {
	  entry.elem.classList.remove('active');
	}
      });

    });
  });

  hta.menu = {

    show: () => {},

    processSectionLinks: (elem) => {
      Array.from(elem.getElementsByClassName('sectionLink')).forEach((e) => {
	// e.addEventListener('touchend', handleLinkClick);
	e.addEventListener('click', handleLinkClick);
      });
    }
    
  };
})();
