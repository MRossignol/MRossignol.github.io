( function() {
  
  let hta = getHTA();
  
  hta.contentData = {

    main: {
      windowTitle: 'Intro'
    },
    
    letter: {
      windowTitle: 'Intro',
      paragraphs: [
	'Dear friends,',
	'Welcome to this personal site on which I happily share with you my music, and my quest for the meaning of life through creativity. Thank you for visiting this little haven of mine.',
	'I am certain, as human beings, you all have asked yourself this question: “What is my mission in life?” There will never be a definite answer to this. But I believe that if we keep our way in exploring ourselves and the world, we are already engaging in the pursuit of truth and meaning of life.',
	'Sometimes you will feel like you have lost all hope in the dark, and nothing promises ahead. I have been in a similar place. But trust me, there will be things that keep you going, things that make your life worthwhile. We all need an endeavor that makes us feel truly alive. For me, it lies in music.',
	'Some have asked me why I keep on making music without much recognition. I believe the greatest reward does not lie in recognition, but in the pure joy of creating. To fully live and die and make sacrifices for the things meaningful to you is already something to be celebrated.',
	'This debut album, this website and my entire musical journey are an attempt to uphold my belief in the arts, particularly music. To me, it honors the most beautiful legacy of mankind. What rescues our souls from darkness and oblivion will always be the arts. One day we will become ashes, but music lives on.',
	'Therefore, I am humbly sharing with you the fruits of my aspiration. You may not like it, you may dismiss it. Still, I wish to evoke some emotions in you, even in only a short moment. By doing so, I have fulfilled my quest contentedly.',
	'Thank you for your generous support and unwavering companionship.',
	'To music and the arts!',
	'Tram Anh'
      ]
    },
    
    about: {
      windowTitle: 'About',
      title: 'About',
      paragraphs: [
	'Ho Tram Anh is an independent musician/songwriter based in Hanoi with various projects under her belt. Tram Anh’s compositions are trademarked by key-shifting melodies and spatial, atmospheric production with an influence from ambient and classical music as her primary musical instrument is the piano.',
	'Since 2015, Tram Anh has been performing solo as herself, under her other aliases MonA and Anaiis, and now also as a member of the electronic group Ngầm. Her works explore a range of acoustic and electronic music, including lyrically oriented piano pieces with dark, pensive themes as a result of her classical training background. She recently takes a more experimental direction, exploring spatial, dreamy sounds and electronic/atmospheric elements. Tram Anh has also collaborated with various other artists in ambient/experimental projects, most notably with Nhung Nguyen (Sound Awakener) as a duo titled “Oblivia”.',
	'Tram Anh was featured on releases of Rusted Tone Recording, an independent label founded by James Armstrong from the UK, namely the LP “These Cyan Fantasies” (in collaboration with Nhung Nguyen, Gallery Six and James Armstrong). She has also performed in recent experimental/ambient live music concerts, such as “Mutant Onions” (jointly organized by Onion Cellar and Mutant Lounge), “Refractions”  (jointly organized and curated by Manzi and Goethe Institut), Natural Habitat (at Goethe Institut Hanoi with Ngam and Nhung Nguyen), and "Adrift/Sheltered" at the Hanoi Academy of Theater and Cinema (sponsored by British Council, Institut Français, the Embassy of Italy in Hanoi).',
	'Tram Anh\'s debut solo album "The Poetry of Streetlights" is released on September 2, 2022, and available on this website as well as physical CDs.'
      ]
    },

    music: {
      windowTitle: 'Music',
      title: 'Music',
      albumOutImage: 'img/covers/streetlights_alt_cover.jpg',
      albumOutText: 'Ho Tram Anh\'s first solo album, <i>The Poetry of Streetlights</i>',
      newEpSection: 'The new EP (2023) is out!',
      wetlandsEpText1: 'Wetlands',
      wetlandsEpText2: 'December 23rd, 2023',
      sections: [
	{
	  title: 'Singles and EPs (to be updated)',
	  releases: [
	    {title:'Rơi', year: 2021, img:'roi', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/r-i-tram-anhs-version'}},
	    {title:'Foolish', year: 2020, img:'foolish', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/foolish'}},
	    {title:'Leaving before Christmas', year: 2021, img:'leaving_before_christmas', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/leaving-before-christmas'}},
	    {title:'Low (EP)', year: 2019, img:'low', links:{Bandcamp:'https://hotramanh.bandcamp.com/album/low-ep'}}
	  ]
	},
	{
	  title: 'Electronic / experimental music',
	  releases: [
	    {title:'Live set for Mutant Lounge', year: 2021, img:'mutant_lounge', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/mutant-lounge-electronic-live-set-ho-tram-anh'}},
	    {title:'Live scoring set for "A Page of Madness"', year: 2021, img:'a_page_of_madness', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/a-page-of-madness-scores-strings-ending'}},
	    {title:'Live set for "Refractions"', year: 2020, img:'refractions', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/refractions-solo-set'}},
	    {title:'Rebound', year: 2021, img:'rebound', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/rebound'}}
	  ]
	},
      ]
    },

    releases: {
      
      streetlights: {
	windowTitle: 'The Poetry of Streetlights',
	title: 'The Poetry Of Streetlights',
	key: 'streetlights',
	insertText: ['You can listen to the whole album for free here, as much as you like!', 'If you like my music, please consider <a href="#donation"><b>making a donation</b></a> to help me continue&hellip; As a thank you, you will receive a link to download the whole album in CD quality.'],
	tracks: [
	  {title: 'Haze', audio:'01_Haze'},
	  {title: 'Mansloughing (feat. Ngầm)', audio:'02_Mansloughing'},
	  {title: 'Feel The Flow', audio:'03_Feel_The_Flow'},
	  {title: 'Discreet Dreamers', audio:'04_Discreet_Dreamers'},
	  {title: 'Radio Ecstatic', audio:'05_Radio_Ecstatic'},
	  {title: 'Minefield', audio:'06_Minefield'},
	  {title: 'Along The Lines', audio:'07_Along_The_Lines'},
	  {title: 'Marbles (feat. Ngầm)', audio:'08_Marbles'},
	  {title: 'Nightingale', audio:'09_Nightingale'},
	  {title: 'Ocean Waves', audio:'10_Ocean_Waves'},
	  {title: 'Coda (Lawrence\'s Lullaby)', audio:'11_Coda_(Lawrence_s_Lullaby)'}
	],
	credits: [
	  ['Ho Tram Anh', 'production, composition, arrangement, piano, keyboards, synthesizers, electronic drums, bass (track 1, 3, 7), vocals', ''],
	  ['Đờ Tùng (POLY)', 'production, engineering, mixing, synthesizers, guitars (track 2, 4, 9, 10), sound effects', 'https://www.facebook.com/tung.hadang96'],
	  ['Cao Lê Hoàng', 'drums, percussions, electronic drums', 'https://www.facebook.com/lehoang.cao.5'],
	  ['Lưu Thanh Duy', 'guitars (track 1, 3, 7)', 'https://www.facebook.com/duylt1202'],
	  ['Đỗ Nguyễn Hoàng Vũ',  'guitars (track 2, 8)', 'https://www.facebook.com/raude1304'],
	  ['Doãn Hoài Nam', 'guitars, bass (track 5)', 'https://www.facebook.com/hoainam.doan'],
	  ['Phạm Hải Đăng', 'Harmonica (track 5)', 'https://www.facebook.com/pham.h.dang.3'],
	  ['Marilyn Dacusin Phạm', 'Backing vocals (track 1, 3)', 'https://www.facebook.com/marilynpham123'],
	  ['Lawrence', 'Spoken words (track 11)', ''],
	  ['A.J. Tissian', 'mastering', 'https://www.thewavelab.com/crew---aj-tissian'],
	  ['Artworks & design:', 'Nguyễn Ngọc Uyên', 'https://m.facebook.com/flowerofthesunn'],
	  ['Website by:', 'Mathias Rossignol', 'https://www.facebook.com/adjudant.tifrice'],
	  ['CD production by:', 'LP Club', 'https://lpclub.vn/']
	]
      },

      wetlands: {
	key: 'wetlands',
	windowTitle: 'Wetlands EP',
	title: 'Wetlands EP',
	insertText: ['You can listen to the whole EP for free here, as much as you like!', 'If you like my music, please consider <a href="#donation"><b>making a donation</b></a> to help me continue&hellip; As a thank you, you will receive a link to download the whole EP in CD quality.'],
	tracks: [
	  {title: 'Wetlands', audio:'01_Wetlands'},
	  {title: 'Ripple Silhouettes', audio:'02_Ripple_Silhouettes'},
	  {title: 'Exile', audio:'03_Exile'},
	  {title: 'How We Were', audio:'04_How_we_were'},
	  {title: 'Out Of My Head', audio:'05_Out_of_my_head'}
	],
	credits: [
	  ['Ho Tram Anh', 'Composition, arrangement, recording, performance, production and mixing'],
	  ['Ha Dang Tung (Đờ Tùng/POLY)', 'Mastering'],
	  ['Marilyn Dacusin Pham', 'Artwork photo']
	]
      }
    },

    donation: {
      title: 'Donations',
      introText: ['I have produced this ### independently, and choose not to be linked with any label or distribution platform. I am therefore grateful for any donation, whatever the amount, that will help me pursue my work of passion.', 'Before choosing a donation method below, please make sure to fill in your name and email address, so that I may thank you; for every donation above 50k VND (2USD) I will send you a link to download the full ### in CD quality. I\'ll email it as soon as I see the donation &ndash; please be patient, it may take a moment, but do contact me if you don\'t hear from me after a day or so.'],
      methods: [
	{
	  title: 'Paypal or card',
	  html: '<iframe class="paypalFrame" src="paypal.html"></iframe>'
	},
	{
	  title: 'Momo',
	  html: '<img class="momoQR" src="img/momoQR.png"/><br/><a class="momoLink" href="https://me.momo.vn/G9IguNsyiZu2UBCOfltx">https://me.momo.vn/G9IguNsyiZu2UBCOfltx</a>'
	},
	{
	  title: 'Bank Transfer',
	  html: '<table class="bankDetails"><tr><td>Bank:</td><td>Techcombank</td></tr><td>Account number:</td><td>19030396626011</td></tr><tr><td>Account holder:</td><td>Ho Tram Anh</td></tr></table>'
	}
      ]
    },
    
    wetlands: {
      windowTitle: 'Wetlands EP',
    },
    
    'poetry-of-streetlights': {
      windowTitle: 'The Poetry of Streetlights',
    },
    
    news: {
      windowTitle: 'News'
    },

    media: {
      windowTitle: 'Media'
    }
    
  };

})();
