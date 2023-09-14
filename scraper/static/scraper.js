
class PageScraper {

  constructor() {
    this.pages = [];
  }

  renderInput () {
    document.body.replaceChildren(
      makeDiv('mainPage', [
	makeDiv('title', 'Outil d\'extraction d\'informations produits'),
	makeDiv('instructions', 'Listez ci-dessous les URL de produits, puis cliquez sur "charger".'),
	makeElem('textarea', null, null, (el) => {
	  el.value = 'https://www.naturabuy.fr/Veste-Ashcome-Jack-Pyke-mitem-26797.html\nhttps://www.naturabuy.fr/Veste-chasse-Hunter-Bois-English-Oak-S-item-8098494.html\nhttps://www.naturabuy.fr/Carabine-Gamo-7-5-J-junior-Delta-Fox-GT-Ring-jaune-Cal-4-5-item-9502229.html';
	  this.inputArea = el;
	}),
	makeDiv('submitButton', 'Charger', (el) => {
	  el.addEventListener('click', () => this.loadProducts());
	})
      ], (el) => {
	this.mainPage = el;
      })
    );
  }

  loadProducts () {
    if (!this.inputArea || !this.inputArea.value) return;
    this.urlList = this.inputArea.value.split(/[ ,;\n]+/).map(u => u.trim()).filter(u => u);
    this.nbToLoad = this.urlList.length;
    this.mainPage.replaceChildren(
      makeDiv('title', 'Outil d\'extraction d\'informations produits'),
      makeDiv('status', `Chargement en cours... 1 / ${this.nbToLoad}`, (el) => {this.statusDiv = el;}),
      makeDiv('errors', ''),
      makeElem('table', null, makeElem('tr', 'header', makeManyElems('td', null, ['nom', 'description', 'prix', 'prix barre', 'catégorie', 'critères', 'photos'])),
	       (el) => { this.dataTable = el;})
    );
    this.nowLoading = 1;
    setTimeout(() => this.loadOneProduct());
  }

  loadOneProduct () {
    let url = this.urlList.shift();
    if (!url) {
      this.doneLoading();
      return;
    }
    fetch('/load/'+btoa(url))
      .then( response => response.text())
      .then( (text) => {
	console.log(text);
	const parser = new DOMParser();
	const htmlDoc = parser.parseFromString(text, 'text/html');
	let name = htmlDoc.body.querySelector('h1#title').innerText;
	let photosText = htmlDoc.body.querySelector('div#thumbs2').innerHTML;
	let photos = photosText.split(/ +<a/).filter(a=>a).map(t => t.replace(/.*?\( */, '').replace(/\n/g, ' ').replace(/, *\d+ *\).*/, '').replace(/["']/g, '').split(/ *, */).map(d => d[0]));
	console.log(photos);
	let category = htmlDoc.body.querySelector('.CategorieInItem').innerText;
	let prixBarre = htmlDoc.body.querySelector('div#promoContainer').innerText.replace(/ *€/, '');
	let prix = htmlDoc.body.querySelector('div#priceContainer').innerText.replace(/ *€/, '');
	let descriptionDiv = htmlDoc.querySelector('div#ItemDescription');
	let description = descriptionDiv.querySelector('span').innerHTML;
	description = description.replace(/\n/g, ' ');
	description = description.replace(/<p *>/g, '');
	description = description.replace(/<\/p *>/g, '\n\n');
	description = description.replace(/<br *>/g, '\n');
	description = description.replace(/<[^>]+>/g, ' ');
	description = description.replace(/ +/g, ' ');
	let criteresDiv = htmlDoc.body.querySelector('div#criteresWithDesc');
	let criteres = {};
	criteresDiv.querySelectorAll('.critere').forEach((div) => {
	  let title = div.querySelector('.critTitle');
	  let value = div.querySelector('.critValue');
	  if (title && value) {
	    criteres[title.innerText] = value.innerText;
	  }
	});
	this.dataTable.appendChild(makeElem('tr', null, [
	  makeElem('td', null, makeLink(null, name, url)),
	  makeElem('td', null, description),
	  makeElem('td', null, prix),
	  makeElem('td', null, prixBarre),
	  makeElem('td', null, category),
	  makeElem('td', null, JSON.stringify(criteres)),
	  makeElem('td', null, photos.map(p => {
	    let i = new Image();
	    i.src = p;
	    return i;
	  }))
	]));
	this.nowLoading++;
	this.statusDiv.innerText = `Chargement en cours... ${this.nowLoading} / ${this.nbToLoad}`;
	setTimeout(() => this.loadOneProduct());
      });
  }

  doneLoading () {
    this.statusDiv.innerText = `Chargement terminé.`;
  }
  
}


window.addEventListener('DOMContentLoaded', () => {
  new PageScraper().renderInput();
});

