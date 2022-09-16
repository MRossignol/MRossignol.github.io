( function() {
  
  let hta = getHTA();
  
  hta.contentData = {
    
    about: {
      title: 'About',
      paragraphs: [
	'Ho Tram Anh is an independent musician/songwriter based in Hanoi with various projects under her belt. Tram Anh’s compositions are trademarked by key-shifting melodies and spatial, atmospheric production with an influence from ambient and classical music as her primary musical instrument is the piano.',
	'Since 2015, Tram Anh has been performing solo as herself, under her other aliases MonA and Anaiis, and now also as a member of the electronic group Ngầm. Her works explore a range of acoustic and electronic music, including lyrically oriented piano pieces with dark, pensive themes as a result of her classical training background. She recently takes a more experimental direction, exploring spatial, dreamy sounds and electronic/atmospheric elements. Tram Anh has also collaborated with various other artists in ambient/experimental projects, most notably with Nhung Nguyen (Sound Awakener) as a duo titled “Oblivia”.',
	'Tram Anh was featured on releases of Rusted Tone Recording, an independent label founded by James Armstrong from the UK, namely the LP “These Cyan Fantasies” (in collaboration with Nhung Nguyen, Gallery Six and James Armstrong). She has also performed in recent experimental/ambient live music concerts, such as “Mutant Onions” (jointly organized by Onion Cellar and Mutant Lounge), “Refractions”  (jointly organized and curated by Manzi and Goethe Institut), Natural Habitat (at Goethe Institut Hanoi with Ngam and Nhung Nguyen), and "Adrift/Sheltered" at the Hanoi Academy of Theater and Cinema (sponsored by British Council, Institut Français, the Embassy of Italy in Hanoi).',
	'Tram Anh\'s debut solo album "The Poetry of Streetlights" is released on September 2, 2022, and available on this website as well as physical CDs.'
      ]
    },

    music: {
      title: 'Music',
      albumOutImage: 'img/covers/streetlights_alt_cover.jpg',
      albumOutText: 'Ho Tram Anh\'s first solo album, <i>The Poetry of Streetlights</i>, is out!',
      sections: [	
	{
	  title: 'Singles and EPs (to be updated)',
	  releases: [
	    {title:'Rơi', year: 2021, img:'roi', links:{Bandcamp:'https://hotramanh.bandcamp.com/track/r-i-tram-anhs-version'}},
	    /* {title:'Xa', year: 2021, img:null, links:{Bandcamp:'https://hotramanh.bandcamp.com/album/low-ep'}}, */
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
    
    streetlights: {
      title: 'The Poetry Of Streetlights',
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
	['Ho Tram Anh', 'producing, songwriting, arrangement, piano, keyboards, synthesizers, electronic drums, bass (track 1, 3, 7), vocals'],
	['Đờ Tùng', 'co-producing, engineering, mixing, synthesizers, guitars (track 9, 10), sound effects'],
	['Cao Lê Hoàng', 'drums, percussions, electronic drums'],
	['Lưu Thanh Duy', 'guitars (track 1, 3, 7)'],
	['Đỗ Nguyễn Hoàng Vũ',  'guitars (track 2, 4, 8)'],
	['Doãn Hoài Nam', 'guitars, bass (track 5)'],
	['Phạm Hải Đăng', 'Harmonica (track 5)'],
	['Marilyn Dacusin Phạm', 'Backing vocals (track 1, 3)'],
	['Lawrence', 'Spoken words (track 11)'],
	['AJ Tissian', 'mastering'],
	['Artworks by', 'Hima'],
	['Website by', 'Mathias Rossignol'],
	['CD production by', 'LP Club']
      ]
    }
  };

})();