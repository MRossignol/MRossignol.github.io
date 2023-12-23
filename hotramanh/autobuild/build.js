
const fs = require('fs');

let pages = [
  {
    key: 'index',
    title: 'Ho Tram Anh',
    description: 'Website for singer-songwriter Ho Tram Anh',
    keywords: 'Ho Tram Anh, music, singer, composer'
  },
  {
    key: 'main',
    title: 'welcome | Ho Tram Anh',
    description: 'Website for singer-songwriter Ho Tram Anh',
    keywords: 'Ho Tram Anh, music, singer, composer'
  },
  {
    key: 'about',
    title: 'Bio | Ho Tram Anh',
    description: 'Presentation of singer-songwriter Ho Tram Anh',
    keywords: 'Ho Tram Anh, music, singer, composer, bio, contact'
  },
  {
    key: 'poetry-of-streetlights',
    title: 'The Poetry of Streetlights',
    description: 'Stream The Poetry of Streetlights, Ho Tram Anh\'s first album',
    keywords: 'Ho Tram Anh, music, singer, composer, album, poetry of streetlights, free streaming, download, donation'
  },
  {
    key: 'wetlands',
    title: 'Wetlands EP',
    description: 'Stream Wetlands, Ho Tram Anh\'s EP',
    keywords: 'Ho Tram Anh, music, singer, composer, EP, wetlands, free streaming, download, donation'
  },
  {
    key: 'news',
    title: 'News | Ho Tram Anh',
    description: 'News and contact information for singer-songwriter Ho Tram Anh',
    keywords: 'Ho Tram Anh, music, singer, composer, news, contact'
  },
  {
    key: 'music',
    title: 'Music | Ho Tram Anh',
    description: 'Ho Tram Anh\'s album and other releases',
    keywords: 'Ho Tram Anh, music, singer, composer, album, EP'
  },
  {
    key: 'media',
    title: 'Media | Ho Tram Anh',
    description: 'Ho Tram Anh - image gallery',
    keywords: 'Ho Tram Anh, music, singer, composer, media, photos'
  }
];

let urlBase = 'https://www.hotramanh.com';
let altUrlBase = 'https://hotramanh.com';

function makeHead (page) {
  function indent (text, ind) {
    return text.replace(/\n/g, '\n'+ind);
  }

  let thumbnail = 'https://hotramanh.com/img/thumbnail.jpg';
  
  let head = `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#222">
<meta name="msapplication-TileColor" content="#222">
<meta name="theme-color" content="#222">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta name="keywords" content="${page.keywords}">

<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:type" content="website">
<meta property="og:image" content="${thumbnail}">
<meta property="og:locale" content="en_US">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="https://hotramanh.com">
<meta name="twitter:title" content="${page.title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${thumbnail}">

<link rel="canonical"  href="https://hotramanh.com/${page.key=='index' ? '' : '/'+page.key+'.html'}" />

<script type="application/ld+json">\n`;
  
  let tramAnh = `{
  "@context": "http://schema.org",
  "@type": "Person",
  "name": "Ha Tram Anh",
  "familyName": "Ho",
  "givenName": "Tram Anh",
  "nationality": "Vietnamese",
  "jobTitle": "Singer-composer"
}`;
  
  let mathias = `{
  "@context": "http://schema.org",
  "@type": "Person",
  "name": "Mathias Rossignol",
  "familyName": "Rossignol",
  "givenName": "Mathias",
  "nationality": "French"
}`;
  
  let website = `{
  "@context": "http://schema.org",
  "@type": "WebSite",
  "description": "Website for singer-songwriter Ho Tram Anh",
  "about": ${indent(tramAnh, '  ')},
  "author": ${indent(tramAnh, '  ')},
  "editor": ${indent(mathias, '  ')},
  "copyrightHolder": ${indent(tramAnh, '  ')}
}`;
  
  let wpage = `{
  "@context": "http://schema.org",
  "@type": "WebPage",
  "title": "${page.title}",
  "description": "${page.description}",
  "partOf": ${indent(website, '  ')}
}`;

  head += indent(wpage, '  ');
  head += '\n</script>';
  
  return indent(head, '    ');
}

let scripts = `  <script language="javascript" src="js/utils.js"></script>
  <script language="javascript" src="js/contentData.js"></script>
  <script language="javascript" src="js/layout.js"></script>
  <script language="javascript" src="js/navigation.js"></script>
  <script language="javascript" src="js/background.js"></script>
  <script language="javascript" src="js/menu.js"></script>
  <script language="javascript" src="js/logo.js"></script>
  <script language="javascript" src="js/letter.js"></script>
  <script language="javascript" src="js/media.js"></script>
  <script language="javascript" src="js/about.js"></script>
  <script language="javascript" src="js/news.js"></script>
  <script language="javascript" src="js/music.js"></script>
  <script language="javascript" src="js/player.js"></script>
  <script language="javascript" src="js/donation.js"></script>
  <script language="javascript" src="js/streetlights.js"></script>
  <script language="javascript" src="js/wetlands.js"></script>`;

scripts = '  <script language="javascript" src="js/all.min.js"></script>';

let restOfPage = `
  </head>
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vollkorn:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  
  <link rel="stylesheet" href="css/main.css" />
  <link rel="stylesheet" href="css/content.css" />
  
${scripts}
  
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RPSJE9027Q"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-RPSJE9027Q');
  </script>
  
  <body>
    
  </body>
</html>
`;

pages.forEach ( (page) => {
  let contents = '<!DOCTYPE html>\n<html>\n  <head>'+makeHead(page)+restOfPage;
  fs.writeFile('../'+page.key+'.html', contents, () => {});
});
