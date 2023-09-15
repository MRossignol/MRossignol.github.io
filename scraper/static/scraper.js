
class PageScraper {

  constructor() {
    this.pages = [];
  }

  renderInput () {
    let testLinks = [
      'https://www.naturabuy.fr/TOP-ENCHERE-Filet-camouflage-renforce-2-5m-Bleu-LIVRAISON-GRATUITE-item-7881405.html',
      'https://www.naturabuy.fr/Sac-transport-fusils-90-cm-Noir-Multipoches-LIVRAISON-GRATUITE-ET-RAPIDE-item-8558850.html',
      'https://www.naturabuy.fr/Rolan-Fleche-initiation-Carboloisir-900-diam-5-0--item-8130331.html',
      'https://www.naturabuy.fr/Bonnet-Glock-Perfection-noir-item-9879884.html'
    ];
    document.body.replaceChildren(
      makeDiv('mainPage', [
	makeDiv('title', 'Outil d\'extraction d\'informations produits'),
	makeDiv('instructions', 'Listez ci-dessous les URL de produits, puis cliquez sur "charger".'),
	makeElem('textarea', null, null, (el) => {
	  el.value = testLinks.join('\n');
	  this.inputArea = el;
	}),
	makeDiv(null, ''),
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
    this.entries = [];
    this.maxNbPhotos = 5;
    this.criteria = [];
    this.urlList = this.inputArea.value.split(/[ ,;\n]+/).map(u => u.trim()).filter(u => u);
    this.nbToLoad = this.urlList.length;
    this.dataTable = this.makeTable();
    this.mainPage.replaceChildren(
      makeDiv('title', 'Outil d\'extraction d\'informations produits'),
      makeDiv('status', `Chargement en cours... 1 / ${this.nbToLoad}`, (el) => {this.statusDiv = el;}),
      makeDiv('errors', ''),
      this.dataTable
    );
    this.nowLoading = 1;
    setTimeout(() => this.loadOneProduct());
  }

  makeTable () {
    let headerFields = ['nom', 'description', 'prix', 'prix barré', 'catégorie'];
    for (let i=1; i <= this.maxNbPhotos; i++) {
      headerFields.push('photo '+i);
    }
    for (let c of this.criteria) {
      headerFields.push(c);
    }
    let table = makeElem('table', null, makeElem('tr', 'header', makeManyElems('td', null, headerFields)));
    table.querySelectorAll('td')[1].style.width = '300px';
    for (let item of this.entries) {
      table.appendChild(this.makeLine(item));
    }
    return table;
  }
  
  makeLine (itemData) {
    let cells = [
      makeLink(null, itemData.name, itemData.url),
      makeDiv('description', itemData.description),
      itemData.prix,
      itemData.prixBarre || '',
      itemData.category || '',
    ];
    let cellClasses = ['name', 'description', 'price', 'cancelPrice', 'category'];
    for (let i=0; i<this.maxNbPhotos; i++) {
      let imgEntry = itemData.photos[i];
      if (imgEntry) {
	console.log(imgEntry);
	cells.push(makeLink(null, makeImage(null, imgEntry), imgEntry));
      } else {
	cells.push('');
      }
      cellClasses.push('photo');
    }
    for (let c of this.criteria) {
      cells.push(itemData.criteres[c] || '');
      cellClasses.push('criteria');
    }
    cells = cells.map((c,i) => makeElem('td', cellClasses[i], c));
    return makeElem('tr', null, cells);
  }

  printError (message) {
    this.mainPage.querySelector('div.error').addElem('p', null, message);
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
	if (text == 'ERROR') {
	  this.printError(url+' : impossible de charger l\'URL');
	  return;
	}
	let error = '';
	let mustRedoAll = false;
	const parser = new DOMParser();
	const htmlDoc = parser.parseFromString(text, 'text/html');
	let name = htmlDoc.body.querySelector('h1#title');
	if (name) name = name.innerText.trim();
	else error += 'Impossible de trouver le nom ';
	let description = htmlDoc.querySelector('div#ItemDescription');
	if (description && description.querySelector('span')) {
	  description = description.querySelector('span').innerHTML.trim();
	  description = description.replace(/\n/g, ' ');
	  description = description.replace(/<p *>/g, '');
	  description = description.replace(/<\/p *>/g, '\n\n');
	  description = description.replace(/<br *>/g, '\n');
	  description = description.replace(/<[^>]+>/g, ' ');
	  description = description.replace(/&nbsp;/g, ' ');
	  description = description.replace(/\s+/g, ' ');
	  description = description.replace(/(\n *)+/g, '\n\n');
	} else {
	  error += 'Impossible de trouver la description ';
	}
	
	let photos = htmlDoc.body.querySelector('div#thumbs2');
	if (photos) {
	  photos = photos.innerHTML
	    .split(/ +<a/)
	    .filter(a=>a)
	    .map(t => t.replace(/.*?\( */, '').replace(/\n/g, ' ').replace(/, *\d+ *\).*/, '').replace(/["']/g, '').split(/ *, */))
	    .map(d => d[0].trim())
	    .filter(x => x);
	  if (photos.length > this.maxNbPhotos) {
	    mustRedoAll = true;
	    this.maxNbPhotos = photos.length;
	  }
	} else {
	  error += 'Impossible de trouver les photos ';
	}
	let category = htmlDoc.body.querySelector('.CategorieInItem');
	if (category) {
	  category = category.innerText.trim();
	} else {
	  category = null;
	}
	let prix = htmlDoc.body.querySelector('div#priceContainer');
	if (prix) {
	  prix = prix.innerText.trim().replace(/ *€/, '');
	} else {
	  error += 'Impossible de trouver le prix ';
	}
	let prixBarre = htmlDoc.body.querySelector('div#promoContainer');
	if (prixBarre && prixBarre.innerText) {
	  prixBarre = prixBarre.innerText.trim().replace(/ *€/, '');
	} else {
	  prixBarre = null;
	}
	let criteresDiv = htmlDoc.body.querySelector('div#criteresWithDesc');
	let criteres = {};
	if (criteresDiv) {
	  criteresDiv.querySelectorAll('.critere').forEach((div) => {
	    let title = div.querySelector('.critTitle');
	    let value = div.querySelector('.critValue');
	    if (title && value) {
	      title = title.innerText.trim();
	      value = value.innerText.trim();
	      criteres[title] = value;
	      if (this.criteria.indexOf(title) == -1) {
		this.criteria.push(title);
		mustRedoAll = true;
	      }
	    }
	  });
	}
	if (error.length) {
	  this.printError(url+' : '+error);
	} else {
	  let itemData = {
	    url: url,
	    name: name,
	    description: description,
	    prix: prix,
	    prixBarre: prixBarre,
	    category: category,
	    photos: photos,
	    criteres: criteres
	  };
	  this.entries.push(itemData);
	  if (mustRedoAll) {
	    let newDataTable = this.makeTable();
	    this.mainPage.replaceChild(newDataTable, this.dataTable);
	    this.dataTable = newDataTable;
	  } else {
	    this.dataTable.appendChild(makeLine(itemData));
	  }
	}
	this.nowLoading++;
	this.statusDiv.innerText = `Chargement en cours... ${this.nowLoading} / ${this.nbToLoad}`;
	setTimeout(() => this.loadOneProduct());
      });
  }

  doneLoading () {
    this.statusDiv.innerText = `Chargement terminé.`;
    this.makeCSV();
  }

  makeCSV () {
    let headerFields = ['url', 'nom', 'description', 'prix', 'prix barré', 'catégorie'];
    for (let i=1; i <= this.maxNbPhotos; i++) {
      headerFields.push('photo '+i);
    }
    for (let c of this.criteria) {
      headerFields.push(c);
    }
    let rows = [ headerFields ];
    for (let e of this.entries) {
      let row = [ e.url, e.name, e.description, e.prix, e.prixBarre || '', e.category || ''];
      for (let i=1; i <= this.maxNbPhotos; i++) {
	row.push(e.photos[i] || '');
      }
      for (let c of this.criteria) {
	row.push(e.criteres[c] || '');
      }
      rows.push(row);
    }
    
    let csvString = rows.map(r => r.map(v => '"'+v.replace(/;/g, ',').replace(/"/g, "''")+'"').join(';')).join('\n');
    const link = document.createElement("a");
    const file = new Blob([csvString], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download ='';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  new PageScraper().renderInput();
});

