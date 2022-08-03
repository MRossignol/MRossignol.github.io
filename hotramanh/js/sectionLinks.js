(function() {

  let hta = getHTA();
  
  let knownLinks = [];

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

  window.addEventListener('DOMContentLoaded', () => {
    [].slice.call(document.getElementsByClassName('menuItem')).forEach((elem) => {
      let m = elem.id.match(/menu_(.+)/);
      if (m) {
	knownLinks.push({
	  s: m[1],
	  elem: elem
	});
	elem.addEventListener('touchend', handleLinkClick);
	elem.addEventListener('click', handleLinkClick);
      }
    });

  });
  
  hta.sectionLinks = {

    show: () => {},

    activate: (section) => {
      knownLinks.forEach((link) => {
	if (link.s == section) {
	  link.elem.classList.add('active');
	} else {
	  link.elem.classList.remove('active');
	}
      });
    },

    processSectionLinks: (elem) => {
      [].slice.call(elem.getElementsByClassName('sectionLink')).forEach((elem) => {
	elem.addEventListener('touchend', handleLinkClick);
	elem.addEventListener('click', handleLinkClick);
      });
    }
    
  };
  
}) ();
