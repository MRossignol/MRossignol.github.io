
class Donation {
  
  nameInput = null;
  emailInput = null;
  doneButton = null;
  emailForm = null;
  dmDiv = null;
  dmHideDiv = null;
  emailForm = null;
  divs = [];
  
  emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  constructor (type) {
    let content = getHTA().contentData.donation;
    let anchor = makeElem('a');
    anchor.id = 'donation';
    this.emailForm = makeDiv('emailForm', [
      makeDiv('formLabel', 'Your name:'),
      makeElem('input', null, null, (e) => {
	this.nameInput = e;
	e.type = 'text';
	e.addEventListener('input', () => this.validateNameEmail());
      }),
      makeElem('br'),
      makeDiv('formLabel', 'Your email:'),
      makeElem('input', null, null, (e) => {
	this.emailInput = e;
	e.type = 'text';
	e.addEventListener('input', () => this.validateNameEmail());
      }),
      makeElem('br'),
      makeElem('input', null, null, (e) => {
	this.doneButton = e;
	e.type = 'button';
	e.value = 'Done';
	e.disabled = true;
	e.addEventListener('click', () => this.sendDonationIntent());
      })
    ]);
    this.divs = [
      anchor,
      makeDiv('donationTitle', content.title.replaceAll('###', type)),
      ...content.introText.map(pHtml => makeElem('p', null, pHtml.replaceAll('###', type))),
      this.emailForm,
      makeDiv('donationMethods', [
	makeDiv('dmHide', null, (e) => { this.dmHideDiv = e; }),
	makeDiv('methodChoiceTitle', 'Choose a method:'),
	...content.methods.map( method => 
	  makeDiv('methodDiv', [
	    makeDiv('methodTitle', method.title),
	    makeDiv('methodBody', method.html)
	  ]))
      ], (e) => { this.dmDiv = e; }) 
    ];
  }

  validateNameEmail () {
    let result = true;
    if (!this.nameInput || !this.emailInput) result = false;
    if (this.nameInput.value.length < 4) result = false;
    if (!this.emailRegexp.test(this.emailInput.value)) result = false;
    if (this.doneButton) this.doneButton.disabled = !result;
    return result;
  }
  
  sendDonationIntent () {
    if (!this.validateNameEmail()) return;
    let release = encodeURIComponent('Wetlands');
    let name = encodeURIComponent(this.nameInput.value);
    let email = encodeURIComponent(this.emailInput.value);
    fetch(`sendDonationEmail.php?name=${name}&email=${email}%release=${release}`);
    localStorage.setItem('donationEmail', this.emailInput.value);
    if (this.dmHideDiv) this.dmHideDiv.style.display = 'none';
    if (this.dmDiv) this.dmDiv.style.opacity = 1;
    if (this.emailForm) this.emailForm.style.display = 'none';
  };

}

