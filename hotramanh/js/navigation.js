var currentSection = null;

var inTransition = false;
var waitingToTransition = null;

let openSection = (section) => {
    if (section == currentSection) return;
    if (inTransition) {
	waitingToTransition = section;
	return;
    }
    inTransition = true;
    let contentWrapper = document.getElementsByClassName('contentWrapper')[0];
    let currentContent = document.getElementsByClassName('content')[0];
    
    if (currentSection) {
	document.getElementById('link-'+currentSection).classList.remove('active');
    }
    
    let giveUp = () => {
	inTransition = false;
    }
    
    fetch('content/'+section+'.html').then((response) => {
	if (response.ok) {
	    response.text().then((text) => {
		currentSection = section;

		document.getElementById('link-'+section).classList.add('active');
		
		let newContent = document.createElement('div');
		newContent.classList.add('content', 'insert');
		newContent.innerHTML = text;
		contentWrapper.appendChild(newContent);
		
		currentContent.classList.add('remove');

		let onAnimationEnd = () => {
		    inTransition = false;
		    newContent.removeEventListener('animationend', onAnimationEnd);
		    newContent.classList.remove('insert');
		    currentContent.style.display='none';
		    contentWrapper.removeChild(currentContent);
		    if (waitingToTransition) {
			openSection(waitingToTransition);
			waitingToTransition = null;
		    }
		}
		
		newContent.addEventListener('animationend', onAnimationEnd);
	    });
	} else {
	    giveUp()
	}
    }, giveUp);
};

let handleLinkClick = (event) => {
    event.preventDefault();
    let hrefUrl = event.target.getAttribute('href');
    window.history.pushState({}, event.target.innerHTML, hrefUrl);
    window.dispatchEvent(new Event('popstate'));
};

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    document.querySelectorAll('a.topLink').forEach((link) => {
	link.addEventListener('click', handleLinkClick);
    });
    openSection('main');
    
    window.addEventListener('popstate', function () {
	openSection(window.location.pathname.replace(/^\//, '').replace(/\..*/, ''));
    });
});
