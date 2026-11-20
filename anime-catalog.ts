import { modes } from './draft-modes.ts'

export const animeTiers = ['Aprendizes', 'Veteranos', 'Elites', 'Lendas'] as const

const stories = [
  ['Lâminas do Eclipse', [
    ['Iara do Sal', 'Treino na costa', 1],
    ['Nilo da Bruma', 'Primeira travessia', 2],
    ['Téo das Vigias', 'Recruta da muralha', 3],
    ['Mina das Pontes', 'Passagem do Desfiladeiro', 4],
    ['Sora do Cobre', 'Duelo das Sete Marés', 1],
    ['Ori da Forja', 'Cerco do Porto Cinza', 0],
    ['Cira dos Mirantes', 'Guardiã do Farol', 4],
    ['Aki do Arco', 'Incursão às Ilhas Gêmeas', 2],
    ['Nara da Lua Rasa', 'Guerra do Eclipse', 5],
    ['Yumi da Lâmina Fria', 'Último Duelo', 1],
    ['Rael do Mar Profundo', 'Ruptura do Eclipse', 0],
    ['Luma das Marés', 'Pacto do Horizonte', 3],
  ]],
  ['Cidade dos Cem Sinais', [
    ['Hana do Sétimo Bloco', 'Entrega da Meia-Noite', 2],
    ['Jin Ponta de Fio', 'Primeiro circuito', 5],
    ['Mika do Subsolo', 'Fuga da Estação Norte', 4],
    ['Tami Cobre Vivo', 'Corrida dos Trilhos', 2],
    ['Kiro Mão de Vidro', 'Defesa do Mercado', 3],
    ['Rumi da Torre Baixa', 'Rede dos Bairros', 4],
    ['Yara Curto-Circuito', 'Noite do Apagão', 5],
    ['Zen do Quinto Anel', 'Copa dos Distritos', 1],
    ['Asha Motor Solar', 'Batalha da Avenida Suspensa', 0],
    ['Kaia Pulso Azul', 'Reinício da Cidade', 5],
    ['Davi Rua Zero', 'Travessia da Linha Fantasma', 2],
    ['Rei do Sinal Mudo', 'Queda da Torre Central', 4],
  ]],
  ['Jardim dos Cometas', [
    ['Lio da Semente', 'Aula no Jardim Baixo', 5],
    ['Mira Folha de Prata', 'Caça ao Primeiro Cometa', 2],
    ['Noa do Cedro', 'O Inverno Curto', 3],
    ['Yori Raiz Alta', 'Ponte das Árvores', 3],
    ['Celi Pétala Ligeira', 'Prova da Floresta', 2],
    ['Sena Olho de Musgo', 'Mapa das Estufas', 4],
    ['Tália Pedra Viva', 'Levante da Serra', 0],
    ['Kemi da Flor de Gelo', 'Descida ao Jardim Polar', 1],
    ['Ume Tronco Branco', 'Queda do Cometa Verde', 3],
    ['Sumi do Céu Verde', 'Chuva dos Cometas', 5],
    ['Aram da Última Árvore', 'Juramento da Serra', 3],
    ['Tess do Pólen Dourado', 'Renascimento do Jardim', 1],
  ]],
  ['Arquivo das Horas', [
    ['Nina Ampulheta', 'Estágio no Arquivo', 4],
    ['Kazu da Hora Curta', 'Primeiro salto', 2],
    ['Eli dos Ponteiros', 'Bilhete de Ontem', 1],
    ['Sui do Relógio Solar', 'Círculo dos Minutos', 5],
    ['Yona Chave de Âmbar', 'Roubo da Quinta Hora', 1],
    ['Miro do Calendário', 'Posto da Hora Desfeita', 4],
    ['Aya dos Dias Perdidos', 'Cerco do Arquivo', 3],
    ['Nemo da Era Breve', 'Colapso do Último Andar', 0],
    ['Eni da Virada', 'Retorno ao Primeiro Dia', 5],
    ['Akira Hora Zero', 'Duelo no Minuto Imóvel', 2],
    ['Rina do Milésimo Dia', 'Restauração do Calendário', 4],
    ['Yuna dos Séculos', 'Última Página do Arquivo', 0],
  ]],
] as const

const clues = [
  'Ataques de alto impacto',
  'Domínio de técnicas precisas',
  'Movimentos difíceis de acompanhar',
  'Protege a equipe na linha de frente',
  'Antecipa a próxima jogada do rival',
  'Sustenta habilidades por mais tempo',
]

export const animeCatalog = stories.flatMap(([universe, characters], storyIndex) =>
  characters.map(([name, arc, strength], index) => {
    const id = storyIndex * characters.length + index
    const tier = Math.floor(index / 3)
    const target = 64 + tier * 10 + ((id * 7) % 6)
    const offsets = [9, 4, -6, 2, -4, -5]
    const ratings = modes.anime.attributes.map((_, attribute) => {
      const offset = offsets[(attribute - strength + offsets.length) % offsets.length]
      return target + Math.sign(offset) * Math.min(Math.abs(offset), 99 - target)
    })
    return { id, athleteId: id, name, universe, arc, clue: clues[strength], tier, ratings }
  }),
)

export type AnimeCard = (typeof animeCatalog)[number]
