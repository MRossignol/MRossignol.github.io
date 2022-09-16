
const ejs = require('ejs');
const fs = require('fs');

let baseDir = __dirname.replace(/server\/?/, '');

let languages = ['en', 'vi'];

let titleBase = 'Hồ Trâm Anh';

let pages = [
  {key: 'index',
   title: {en: 'Welcome', vi: 'Welcome'},
   description: {en: 'Website for singer-songwriter Hồ Trâm Anh', vi: 'Website for singer-songwriter Hồ Trâm Anh'}},
  {key: 'about',
   title: {en: 'Bio', vi: 'Bio'},
   description: {en: 'Presentation of singer-songwriter Hồ Trâm Anh', vi: 'Presentation of singer-songwriter Hồ Trâm Anh'}},
  {key: 'album',
   title: {en: 'Album', vi: 'Album'},
   description: {en: 'Play "album title" online', vi: 'Play "album title" online'}},
];

let urlBase = 'https://www.hotramanh.com';
let altUrlBase = 'https://hotramanh.com';

function makeHead (page) {
  function indent (text, ind) {
    return text.replace(/\n/g, '\n'+ind);
  }
  
  let tramAnh = `{
"@type": "Person",
"@name": "Hồ Trâm Anh",
"@familyName": "Hồ",
"@givenName": "Trâm Anh" }`;
  
  let mathias = `{
"@type": "Person",
"@name": "Mathias Rossignol",
"@familyName": "Rossignol",
"@givenName": "Mathias" }`;
  
  let website = `{
"@type": "WebSite",
"@description": "Website for singer-songwriter Hồ Trâm Anh",
"@about": ${indent(tramAnh, '  ')},
"@author": ${indent(tramAnh, '  ')},
"@editor": ${indent(mathias, '  ')},
"@copyrightHolder": ${indent(tramAnh, '  ')} }`;
  
  return `{
"@type": "WebPage",
"@title": "${page.title}",
"@description": "${page.description}",
"@partOf": ${indent(website, '  ')}
}`;
  
}

languages.forEach (function(lang) {
  pages.forEach ( (page) => {
    let template = fs.readFileSync(`${baseDir}/src/templates/${lang}/content/${page.template}.html.ejs`, 'utf8');
    let mdTemplate = fs.readFileSync(`${baseDir}/src/templates/${lang}/metadata/${page.template}.html.ejs`, 'utf8');
    
    var data =  {
      metadata: '',
      homeContents: '',
      sceneContents: '',
      creditContents: '',
      searchContents: '',
      urls: {
	canonical: `${urlBase}/${lang}/${page.key}.html`,
	en: `${urlBase}/en/${page.key}.html`,
	vi: `${urlBase}/vi/${page.key}.html`,
      },
    };
    
    getPageData(path, query, lang, function(pageData) {
      if (pageData.error404) {
	data.homeContents = "The page you are trying to access does not exist.";
      } else {
	pageData.urls.current = currentUrl;
	switch (path[0]) {
	case 'scenes':
	case 'list':
	case 'home':
	  data.homeContents = ejs.render(templates[lang].sceneList, pageData);
	  data.metadata = ejs.render(mdTemplates[lang].sceneList, pageData);
	  break;
	case 'scene':
	  data.sceneContents = ejs.render(templates[lang].scene, pageData);
	  data.metadata = ejs.render(mdTemplates[lang].scene, pageData);
	  break;
	case 'search':
	  data.searchContents = ejs.render(templates[lang].search, pageData);
	  data.metadata = ejs.render(mdTemplates[lang].search, pageData);
	  break;
	case 'credits':
	  data.creditContents = ejs.render(templates[lang].credits, pageData);
	  data.metadata = ejs.render(mdTemplates[lang].credits, pageData);
	  break;
	default:
	  data.homeContents = "Welcome to Lonofi Home, an online application to stream, create and share sound atmospheres, ASMR soundscapes, audio ambiences, sound effects, white noise, etc., to assist relaxation and focus, create video soundtracks, provide aural accompaniment in a space…";
	  data.metadata = ejs.render(mdTemplates[lang].default, pageData);
	  break; 
	}
      }
      callback(data);
    });
  };
};




function metadata(section) {
  
}
