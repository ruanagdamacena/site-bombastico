export const formations = {
  '4-3-3': { GOL: 1, DEF: 4, MEI: 3, ATA: 3 },
  '4-4-2': { GOL: 1, DEF: 4, MEI: 4, ATA: 2 },
} as const

export const tactics = {
  equilibrado: { name: 'Equilibrado', attack: 0, defense: 0 },
  ofensivo: { name: 'Ofensivo', attack: 5, defense: -4 },
  defensivo: { name: 'Defensivo', attack: -4, defense: 5 },
} as const

export type Position = keyof typeof formations['4-3-3']
export type Formation = keyof typeof formations
export type Tactic = keyof typeof tactics
type Squad = { name: string; players: Record<Position, [string, number][]> }

export const competitions = {
  'libertadores-2019': {
    name: 'Libertadores 2019', year: '2019',
    teams: [
      { name: 'Flamengo', players: {
        GOL: [['Diego Alves', 84]],
        DEF: [['Rafinha', 83], ['Rodrigo Caio', 83], ['Pablo Marí', 81], ['Filipe Luís', 86]],
        MEI: [['Willian Arão', 81], ['Gerson', 86], ['Éverton Ribeiro', 88]],
        ATA: [['Bruno Henrique', 89], ['Gabigol', 89], ['Arrascaeta', 88]],
      } },
      { name: 'Grêmio', players: {
        GOL: [['Paulo Victor', 75]],
        DEF: [['Paulo Miranda', 76], ['Geromel', 86], ['Kannemann', 83], ['Bruno Cortez', 77]],
        MEI: [['Michel', 77], ['Maicon', 82], ['Matheus Henrique', 81]],
        ATA: [['Alisson', 78], ['André', 75], ['Everton Cebolinha', 87]],
      } },
      { name: 'River Plate', players: {
        GOL: [['Franco Armani', 85]],
        DEF: [['Gonzalo Montiel', 81], ['Lucas Martínez Quarta', 82], ['Javier Pinola', 80], ['Milton Casco', 81]],
        MEI: [['Enzo Pérez', 85], ['Exequiel Palacios', 85], ['Ignacio Fernández', 86]],
        ATA: [['Nicolás De La Cruz', 84], ['Rafael Santos Borré', 84], ['Matías Suárez', 82]],
      } },
      { name: 'Boca Juniors', players: {
        GOL: [['Esteban Andrada', 84]],
        DEF: [['Julio Buffarini', 80], ['Lisandro López', 81], ['Carlos Izquierdoz', 82], ['Emmanuel Mas', 77]],
        MEI: [['Iván Marcone', 80], ['Agustín Almendra', 78], ['Alexis Mac Allister', 83]],
        ATA: [['Eduardo Salvio', 84], ['Carlos Tévez', 86], ['Ramón Ábila', 80]],
      } },
    ] satisfies Squad[],
  },
  'copa-2002': {
    name: 'Copa de 2002', year: '2002',
    teams: [
      { name: 'Brasil', players: {
        GOL: [['Marcos', 87]],
        DEF: [['Cafu', 92], ['Lúcio', 87], ['Roque Júnior', 82], ['Roberto Carlos', 92]],
        MEI: [['Edmílson', 83], ['Gilberto Silva', 87], ['Kléberson', 83]],
        ATA: [['Ronaldinho', 91], ['Ronaldo', 97], ['Rivaldo', 94]],
      } },
      { name: 'Alemanha', players: {
        GOL: [['Oliver Kahn', 95]],
        DEF: [['Torsten Frings', 86], ['Thomas Linke', 83], ['Christoph Metzelder', 85], ['Carsten Ramelow', 83]],
        MEI: [['Jens Jeremies', 83], ['Dietmar Hamann', 86], ['Bernd Schneider', 86]],
        ATA: [['Marco Bode', 82], ['Miroslav Klose', 90], ['Oliver Neuville', 84]],
      } },
      { name: 'Turquia', players: {
        GOL: [['Rüştü Reçber', 89]],
        DEF: [['Fatih Akyel', 80], ['Bülent Korkmaz', 86], ['Alpay Özalan', 84], ['Ergün Penbe', 83]],
        MEI: [['Tugay Kerimoğlu', 86], ['Emre Belözoğlu', 86], ['Yıldıray Baştürk', 85]],
        ATA: [['Ümit Davala', 84], ['Hakan Şükür', 87], ['İlhan Mansız', 86]],
      } },
      { name: 'Coreia do Sul', players: {
        GOL: [['Lee Woon-jae', 85]],
        DEF: [['Song Chong-gug', 84], ['Hong Myung-bo', 88], ['Lee Min-sung', 80], ['Lee Young-pyo', 85]],
        MEI: [['Yoo Sang-chul', 85], ['Lee Eul-yong', 82], ['Park Ji-sung', 88]],
        ATA: [['Seol Ki-hyeon', 82], ['Ahn Jung-hwan', 86], ['Lee Chun-soo', 82]],
      } },
    ] satisfies Squad[],
  },
}

export type Competition = keyof typeof competitions
export type HistoricalCard = { id: string; name: string; team: string; position: Position; rating: number }
