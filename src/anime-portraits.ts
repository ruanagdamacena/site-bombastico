const bleachProfiles = 'https://bleach-anime.com/en/character/'
const entertainmentDistrict = 'https://demonslayer-anime.com/eda/character/'
const mugenTrain = 'https://demonslayer-anime.com/mugentrain/character/'
const narutoImages = 'https://cmsapi-frontend.naruto-official.com/site/api/naruto/Image/get?path=/naruto/import/images/'

const bleachPortraits = [
  ['Ichigo Kurosaki', 'Guerra Sangrenta · Verdadeira Zangetsu', '01'],
  ['Orihime Inoue', 'Guerra Sangrenta dos Mil Anos', '03'],
  ['Yasutora Sado (Chad)', 'Guerra Sangrenta dos Mil Anos', '04'],
  ['Byakuya Kuchiki', 'Guerra Sangrenta dos Mil Anos', '11'],
  ['Renji Abarai', 'Guerra Sangrenta · Zabimaru', '12'],
  ['Rukia Kuchiki', 'Guerra Sangrenta · Bankai', '20'],
  ['Ganju Shiba', 'Guerra Sangrenta dos Mil Anos', '81'],
  ['Genryūsai Yamamoto', 'Guerra Sangrenta · Zanka no Tachi', '06'],
  ['Yhwach', 'Guerra Sangrenta · The Almighty', '23'],
].map(([name, arc, number]) => ({
  name, arc, universe: 'Bleach', image: 'https://bleach-anime.com/en/assets/img/character/thumb_' + number + '.jpg',
  source: bleachProfiles,
}))

export const animePortraits = [
  {
    name: 'Shikamaru Nara', universe: 'Naruto', arc: 'Exame Chūnin',
    image: narutoImages + 'naruto01/001%EF%BD%9E100/064/C113.jpg',
    source: 'https://naruto-official.com/en/anime/naruto1/list/01_288',
  },
  {
    name: 'Kakashi Hatake', universe: 'Naruto', arc: 'Quarta Guerra Ninja',
    image: narutoImages + 'naruto02/501%EF%BD%9E600/595/C161.jpg',
    source: 'https://naruto-official.com/en/anime/naruto2/list/01_819',
  },
  {
    name: 'Satoru Gojo', universe: 'Jujutsu Kaisen', arc: 'Incidente de Shibuya',
    image: 'https://a.storyblok.com/f/178900/1920x1080/b2e14e989b/jujutsu-kaisen-season-2-key-art.png/m/1200x0/filters%3Aquality%2895%29format%28webp%29',
    source: 'https://www.crunchyroll.com/news/announcements/2023/6/30/jujutsu-kaisen-season-2-anime-premieres-on-crunchyroll-july-6',
  },
  {
    name: 'Zenitsu Agatsuma', universe: 'Demon Slayer', arc: 'Distrito do Entretenimento',
    image: 'https://demonslayer-anime.com/eda/assets/img/character/thumb/thumb_zenitsu.png',
    source: entertainmentDistrict,
  },
  {
    name: 'Kyojuro Rengoku', universe: 'Demon Slayer', arc: 'Trem Infinito',
    image: 'https://demonslayer-anime.com/mugentrain/assets/img/character/thumb/thumb_05.png',
    source: mugenTrain,
  },
  {
    name: 'Akaza', universe: 'Demon Slayer', arc: 'Trem Infinito',
    image: 'https://demonslayer-anime.com/mugentrain/assets/img/character/thumb/thumb_10.png',
    source: mugenTrain,
  },
  ...bleachPortraits,
]
