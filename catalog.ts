import { modes } from './draft-modes.ts'

const attributes = modes.football.attributes
export const tiers = ['Ruins', 'Médios', 'Bons', 'Lendas'] as const

// Keep these rows in their original order: existing rooms store numeric card IDs.
const good = `Adriano|Inter de Milão|2005/06
Juninho Pernambucano|Lyon|2005/06
Diego Ribas|Werder Bremen|2006/07
Alex de Souza|Fenerbahçe|2010/11
Djalminha|Deportivo La Coruña|1999/00
Giovane Élber|Bayern de Munique|2000/01
Luís Fabiano|Sevilla|2007/08
Fred|Fluminense|2012
Hulk|Atlético-MG|2021
Paulinho|Corinthians|2012
Renato Augusto|Corinthians|2015
Lucas Moura|Tottenham|2018/19
Bernard|Atlético-MG|2013
Douglas Costa|Bayern de Munique|2015/16
Willian|Chelsea|2015/16
Oscar|Chelsea|2014/15
Ramires|Chelsea|2011/12
David Luiz|Chelsea|2011/12
Dante|Bayern de Munique|2012/13
Miranda|Atlético de Madrid|2013/14
Filipe Luís|Atlético de Madrid|2013/14
Juan|Roma|2007/08
Dedé|Vasco|2011
Lúcio|Inter de Milão|2009/10
Diego Costa|Atlético de Madrid|2013/14
Éverton Ribeiro|Cruzeiro|2013
Arrascaeta|Flamengo|2019
Gabigol|Flamengo|2019
Bruno Henrique|Flamengo|2019
Pedro|Flamengo|2022
Dudu|Palmeiras|2018
Raphael Veiga|Palmeiras|2021
Gustavo Gómez|Palmeiras|2020
Lucas Paquetá|Lyon|2020/21
Bruno Guimarães|Newcastle|2022/23
Richarlison|Everton|2019/20
Raphinha|Barcelona|2024/25
Martinelli|Arsenal|2022/23
Rodrygo|Real Madrid|2021/22
Vinícius Júnior|Real Madrid|2023/24
Casemiro|Real Madrid|2016/17
Fabinho|Liverpool|2019/20
Fernandinho|Manchester City|2017/18
Marcelo|Real Madrid|2016/17
Dani Alves|Barcelona|2010/11
Maicon|Inter de Milão|2009/10
Bastos|Botafogo|2024
Robinho|Santos|2002
Ricardo Oliveira|Santos|2015
Nilmar|Internacional|2008`

const legends = `Pelé|Santos|1962
Maradona|Napoli|1986/87
Messi|Barcelona|2011/12
Cristiano Ronaldo|Real Madrid|2013/14
Cruyff|Ajax|1971/72
Beckenbauer|Bayern de Munique|1973/74
Zidane|Real Madrid|2001/02
Ronaldo|Inter de Milão|1997/98
Ronaldinho|Barcelona|2005/06
Romário|Barcelona|1993/94
Garrincha|Botafogo|1962
Zico|Flamengo|1981
Sócrates|Corinthians|1982
Rivaldo|Barcelona|1998/99
Cafu|Milan|2003/04
Roberto Carlos|Real Madrid|2001/02
Maldini|Milan|1993/94
Baresi|Milan|1988/89
Nesta|Milan|2002/03
Cannavaro|Juventus|2005/06
Pirlo|Milan|2006/07
Baggio|Juventus|1992/93
Totti|Roma|2000/01
Del Piero|Juventus|1997/98
Van Basten|Milan|1988/89
Gullit|Milan|1987/88
Rijkaard|Milan|1989/90
Henry|Arsenal|2003/04
Bergkamp|Arsenal|1997/98
Eusébio|Benfica|1961/62
Puskás|Real Madrid|1959/60
Di Stéfano|Real Madrid|1956/57
Gento|Real Madrid|1965/66
George Best|Manchester United|1967/68
Bobby Charlton|Manchester United|1967/68
Bobby Moore|West Ham|1964/65
Gerd Müller|Bayern de Munique|1971/72
Matthäus|Inter de Milão|1988/89
Xavi|Barcelona|2010/11
Iniesta|Barcelona|2010/11
Busquets|Barcelona|2010/11
Modrić|Real Madrid|2017/18
Neymar|Barcelona|2014/15
Jairzinho|Botafogo|1970
Bebeto|Deportivo La Coruña|1992/93
Carlos Alberto Torres|Santos|1970
Djalma Santos|Palmeiras|1960
Nilton Santos|Botafogo|1962
Falcão|Roma|1982/83
Kaká|Milan|2006/07`

const first = ['André', 'Bruno', 'Caio', 'Daniel', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Igor', 'João']
const surnames = ['Amarante', 'Barbalho', 'Cordeiro', 'Dourado', 'Esteves', 'Furtado', 'Gouveia', 'Horta', 'Lamego', 'Moura']
const fictionalClubs = ['Porto Cedro FC', 'União do Ipê', 'Estrela do Vale', 'Atlético das Serras', 'Lago Azul EC']

const groups = [
  first.flatMap(name => surnames.slice(0, 5).map(last => name + ' ' + last)),
  first.flatMap(name => surnames.slice(5).map(last => name + ' ' + last)),
  good.split('\n'),
  legends.split('\n'),
]

export type Card = {
  id: number
  athleteId: number
  name: string
  club: string
  season: string
  tier: number
  ratings: number[]
  overall: number
  fictional: boolean
}

function makeCard(input: Omit<Card, 'overall' | 'tier'>): Card {
  const overall = Math.round(input.ratings.reduce((sum, rating) => sum + rating, 0) / attributes.length)
  return { ...input, overall, tier: Math.max(0, Math.floor(overall / 10) - 6) }
}

export const baseCatalog = groups.flatMap((rows, tier) => rows.map((row, index) => {
  const id = tier * 50 + index
  const fictional = tier < 2
  const [name, club = fictionalClubs[index % fictionalClubs.length], season = String(2018 + (index + tier) % 8)] = row.split('|')
  const target = [60, 70, 80, 90][tier] + (index * 7 % 10)
  const offsets = [10, -10, 6, -6, 3, -3].map(offset => {
    const variation = Math.min(99 - target, Math.abs(offset))
    return Math.sign(offset) * variation
  })
  const ratings = attributes.map((_, attribute) => target + offsets[(attribute + index + tier) % offsets.length])
  return makeCard({ id, athleteId: id, name, club, season, ratings, fictional })
}))

// Provisional game ratings in attribute order. Club and season identify the historical spell.
const tunedBaseRatings: Record<number, number[]> = {
  152: [99, 97, 99, 96, 74, 87],
  153: [99, 88, 95, 98, 76, 96],
  157: [98, 88, 99, 99, 74, 96],
  158: [96, 97, 99, 94, 71, 91],
  199: [95, 95, 96, 97, 73, 90],
}

const alternateSeasons: [athleteId: number, club: string, season: string, ratings: number[]][] = [
  [152, 'Barcelona', '2018/19', [98, 99, 98, 89, 71, 84]],
  [152, 'PSG', '2022/23', [90, 96, 91, 81, 64, 77]],
  [153, 'Manchester United', '2007/08', [95, 88, 97, 98, 75, 92]],
  [153, 'Manchester United', '2021/22', [94, 81, 84, 82, 68, 89]],
  [157, 'Real Madrid', '2002/03', [98, 88, 94, 91, 73, 96]],
  [158, 'Milan', '2009/10', [87, 95, 95, 77, 65, 79]],
  [199, 'Real Madrid', '2009/10', [84, 89, 87, 83, 68, 82]],
]

export const catalog = [
  ...baseCatalog.map(card => {
    const ratings = tunedBaseRatings[card.id]
    return ratings ? makeCard({ ...card, ratings }) : card
  }),
  ...alternateSeasons.map(([athleteId, club, season, ratings], index) =>
    makeCard({ ...baseCatalog[athleteId], id: baseCatalog.length + index, club, season, ratings })),
]
