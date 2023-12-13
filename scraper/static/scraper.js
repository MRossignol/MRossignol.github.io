
class PageScraper {

  constructor() {
    this.pages = [];
  }

  renderInput () {
    let testLinks = [
      'https://www.naturabuy.fr/A-SAISIR-MALETTE-DE-NETTOYAGE-POUR-ARMES-62-PIECES-item-9917933.html',
      'https://www.naturabuy.fr/PROMOTION-MALETTE-DE-NETTOYAGE-UNIVERSELLE-POUR-FUSILS-ET-ARMES-DE-POINGS-N1-item-9486431.html',
      'https://www.naturabuy.fr/PROMO-NETTOYEUR-ULTRASONS-600-ML-30-W-QUALITe-PROFESSIONNEL-ET-EFFICACITe-ASSUReE-item-10836229.html',
      'https://www.naturabuy.fr/PROMOTION-Kit-9-Pieces-Nettoyage-Armes--item-10406113.html',
      'https://www.naturabuy.fr/PROMOTION-ROULEAU-DE-PATCHS-DE-NETTOYAGE-10-MeTRES-X-5-CM-EN-TISSU-COTON-N1-item-10794910.html',
      'https://www.naturabuy.fr/PROMOTION-KIT-DE-NETTOYAGE-6-PIeCES-CORDE-DE-TRACTION-CALIBRE-30-item-10343630.html'
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
    let headerFields = ['nom', 'description', 'prix', 'prix barré', 'prix livraison', 'mode livraison', 'catégorie', 'code catégorie'];
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
      makeLink('name', itemData.name, itemData.url),
      makeDiv('description', itemData.description),
      itemData.prix,
      itemData.prixBarre || '',
      itemData.prixLivraison || '',
      itemData.modeLivraison || '',
      makeDiv('category', itemData.category || ''),
      itemData.categoryCode || ''
    ];
    let cellClasses = ['name', 'description', 'price', 'cancelPrice', 'deliveryPrice', 'deliveryMode', 'category', 'categoryCode'];
    for (let i=0; i<this.maxNbPhotos; i++) {
      let imgEntry = itemData.photos[i];
      if (imgEntry) {
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
    this.mainPage.querySelector('div.errors').addElem('p', null, message);
  }
  
  loadOneProduct () {
    let url = this.urlList.shift();
    if (!url) {
      this.doneLoading();
      return;
    }
    const normalizePrice = p => 1*(p.trim().replace(',', '.').replace(/ *€/, ''));
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
	let photos = [];
	let ph = htmlDoc.body.querySelector('div#thumbs2');
	if (ph) {
	  ph.querySelectorAll('img').forEach(a => {
	    if (a.src)
	      photos.push(a.src.replace('thumbs/60_', ''));
	  });
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
	let catCode = '';
	let breadcrumbs = htmlDoc.body.querySelector('div.page-breadcrumb');
	if (breadcrumbs) {
	  breadcrumbs.querySelectorAll('a').forEach(a => {
	    let m = a.href.match(/cat\-(\d+)\.html/);
	    if (m) catCode = m[1];
	  });
	}
	let prix = htmlDoc.body.querySelector('div#priceContainer');
	if (prix) {
	  prix = normalizePrice(prix.innerText);
	} else {
	  prix = htmlDoc.body.querySelector('div#bidboxprice');
	  if (prix) {
	    prix = normalizePrice(prix.innerText)
	  } else {
	    error += 'Impossible de trouver le prix ';
	  }
	}
	let prixBarre = htmlDoc.body.querySelector('div#promoContainer');
	if (prixBarre && prixBarre.innerText) {
	  prixBarre = normalizePrice(prixBarre.innerText);
	} else {
	  prixBarre = null;
	}
	let prixLivraison = null, modeLivraison = null;
	let livraison = htmlDoc.body.querySelector('div#shippingsContainer');
	if (livraison) {
	  [prixLivraison, modeLivraison] = livraison.innerText.replace(/^ *\n */, '').split(/ *[\-\n] */);
	  prixLivraison = normalizePrice(prixLivraison);
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
	    categoryCode: catCode,
	    photos: photos,
	    criteres: criteres,
	    prixLivraison: prixLivraison,
	    modeLivraison: modeLivraison
	  };
	  this.entries.push(itemData);
	  if (mustRedoAll) {
	    let newDataTable = this.makeTable();
	    this.mainPage.replaceChild(newDataTable, this.dataTable);
	    this.dataTable = newDataTable;
	  } else {
	    this.dataTable.appendChild(this.makeLine(itemData));
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
    let headerFields = ['url', 'nom', 'description', 'prix', 'prix barré', 'prix livraison', 'mode livraison', 'catégorie', 'code catégorie'];
    for (let i=1; i <= this.maxNbPhotos; i++) {
      headerFields.push('photo '+i);
    }
    for (let c of this.criteria) {
      headerFields.push(c);
    }
    let rows = [ headerFields ];
    for (let e of this.entries) {
      let row = [ e.url, e.name, e.description, e.prix, e.prixBarre || '', e.prixLivraison || '', e.modeLivraison || '', e.category || '', e.categoryCode || ''];
      for (let i=0; i < this.maxNbPhotos; i++) {
	row.push(e.photos[i] || '');
      }
      for (let c of this.criteria) {
	row.push(e.criteres[c] || '');
      }
      rows.push(row);
    }
    
    let csvString = rows.map(r => r.map(v => {
      if (v.replace)
	return '"'+v.replace(/;/g, ',').replace(/"/g, "''")+'"';
      else
	return `"${v}"`;
    }).join(';')).join('\n');
    const link = document.createElement("a");
    link.innerHTML = '&nbsp;Cliquer ici pour t&eacute;l&eacute;charger le fichier CSV';
    const file = new Blob([csvString], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = 'produits_naturabuy.csv';
    this.statusDiv.appendChild(link);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  new PageScraper().renderInput();
});

