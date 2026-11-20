import shikamaru from './assets/anime/shikamaru.webp'
import kakashi from './assets/anime/kakashi.webp'
import gojo from './assets/anime/gojo.webp'

export const animePortraits = [
  {
    name: 'Shikamaru Nara', universe: 'Naruto', arc: 'Exame Chūnin', image: shikamaru,
    credit: 'Narukyubi', source: 'https://commons.wikimedia.org/wiki/File:Cosplay_de_Shikamaru_Nara.JPG',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    name: 'Kakashi Hatake', universe: 'Naruto', arc: 'Quarta Guerra Ninja', image: kakashi,
    credit: 'Juannando12', source: 'https://commons.wikimedia.org/wiki/File:Kakashi_Hatake_Cosplay.jpg',
    license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  {
    name: 'Satoru Gojo', universe: 'Jujutsu Kaisen', arc: 'Incidente de Shibuya', image: gojo,
    credit: 'Solomon203', source: 'https://commons.wikimedia.org/wiki/File:Satoru_Goj%C5%8D_cosplay.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
] as const
