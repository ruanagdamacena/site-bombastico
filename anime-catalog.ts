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

export const legacyAnimeCatalog = stories.flatMap(([universe, characters], storyIndex) =>
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

// Scores follow the order in draft-modes.ts: power, technique, speed, defense,
// strategy, energy. They are game ratings for the named phase.
type Profile = [name: string, arc: string, clue: string, ratings: [number, number, number, number, number, number]]
const profiles: [universe: string, characters: Profile[]][] = [
  ['Naruto', [
    ['Sakura Haruno', 'Exame Chūnin', 'Bom controle de chakra desde cedo', [44, 68, 58, 55, 72, 57]],
    ['Hinata Hyūga', 'Exame Chūnin', 'Usa o Byakugan e o Punho Gentil', [52, 77, 63, 60, 63, 59]],
    ['Shikamaru Nara', 'Exame Chūnin', 'Encurrala adversários com a possessão das sombras', [51, 78, 55, 58, 99, 56]],
    ['Rock Lee', 'Exame Chūnin', 'Sem os pesos, ultrapassa a defesa de areia de Gaara', [80, 88, 97, 65, 62, 48]],
    ['Neji Hyūga', 'Exame Chūnin', 'Bloqueia ataques com a Rotação', [69, 90, 82, 86, 74, 72]],
    ['Sasuke Uchiha', 'Exame Chūnin', 'Combina a velocidade do treino com o Chidori', [82, 86, 89, 66, 73, 70]],
    ['Gaara', 'Quarta Guerra Ninja', 'Usa a areia para proteger aliados à distância', [86, 89, 75, 98, 85, 88]],
    ['Kakashi Hatake', 'Quarta Guerra Ninja', 'Usa o Kamui em momentos decisivos', [83, 96, 88, 81, 96, 76]],
    ['Sakura Haruno', 'Quarta Guerra Ninja', 'O Selo da Força de Cem sustenta cura e golpes pesados', [91, 94, 75, 90, 82, 91]],
    ['Naruto Uzumaki', 'Modo Sábio dos Seis Caminhos', 'Combina o chakra das bestas com o poder dos Seis Caminhos', [98, 91, 98, 91, 78, 99]],
    ['Sasuke Uchiha', 'Rinnegan', 'Troca de posição para surpreender o adversário', [96, 97, 96, 89, 89, 95]],
    ['Madara Uchiha', 'Jinchūriki do Dez-Caudas', 'Reúne o chakra do Dez-Caudas e o poder do Rinnegan', [98, 96, 94, 96, 92, 99]],
  ]],
  ['Dragon Ball', [
    ['Bulma', 'Busca pelas Esferas do Dragão', 'Inventa o Radar do Dragão', [19, 57, 27, 29, 97, 30]],
    ['Yamcha', 'Primeira busca pelas Esferas', 'Luta com o Punho do Lobo', [62, 74, 67, 54, 64, 53]],
    ['Kuririn', '21º Torneio de Artes Marciais', 'Compensa o tamanho com técnica e improviso', [58, 76, 70, 60, 77, 63]],
    ['Mestre Kame', '21º Torneio de Artes Marciais', 'Experiência de luta e domínio do Kamehameha', [76, 92, 66, 70, 88, 70]],
    ['Tenshinhan', '22º Torneio de Artes Marciais', 'Tem golpes variados e o Kikōhō', [79, 89, 79, 70, 78, 72]],
    ['Goku', '22º Torneio de Artes Marciais', 'Aprende rápido e sustenta uma luta longa', [78, 83, 85, 75, 67, 83]],
    ['Piccolo', 'Saga dos Androides', 'Depois da fusão com Kami, luta com força e cálculo', [89, 91, 85, 86, 94, 87]],
    ['Androide 18', 'Saga dos Androides', 'Mantém o ritmo de luta com energia ilimitada', [87, 83, 87, 83, 77, 99]],
    ['Vegeta', 'Saga de Cell', 'Concentra o ki para disparar o Final Flash', [94, 87, 88, 79, 73, 90]],
    ['Gohan', 'Super Saiyajin 2 · Jogos de Cell', 'Supera Cell em poder quando rompe seu limite', [98, 88, 95, 88, 78, 96]],
    ['Cell', 'Forma Perfeita', 'Reúne técnicas dos guerreiros e consegue se regenerar', [95, 96, 92, 96, 86, 95]],
    ['Goku', 'Instinto Superior · Torneio do Poder', 'O corpo reage aos ataques sem precisar pensar', [98, 98, 99, 97, 85, 92]],
  ]],
  ['One Piece', [
    ['Usopp', 'East Blue', 'Acerta alvos de longe e recorre a truques', [45, 78, 58, 49, 81, 60]],
    ['Nami', 'East Blue', 'Lê o clima e planeja rotas para a tripulação', [39, 63, 62, 49, 93, 53]],
    ['Chopper', 'Ilha de Drum', 'Médico que muda de forma de acordo com a situação', [68, 75, 67, 62, 80, 66]],
    ['Nico Robin', 'Enies Lobby', 'Cria vários braços para imobilizar o adversário', [72, 93, 62, 70, 86, 74]],
    ['Franky', 'Enies Lobby', 'Usa o corpo de ciborgue como armadura e arsenal', [80, 82, 62, 87, 76, 72]],
    ['Brook', 'Thriller Bark', 'Desfere estocadas rápidas com a espada', [70, 89, 93, 60, 70, 76]],
    ['Roronoa Zoro', 'Enies Lobby', 'O estilo de três espadas dá força e alcance aos golpes', [89, 94, 82, 82, 70, 88]],
    ['Sanji', 'Wano', 'Combina chutes velozes com maior resistência', [90, 90, 97, 88, 78, 89]],
    ['Jinbe', 'Wano', 'Controla o ritmo do combate com karatê dos homens-peixe', [87, 93, 77, 94, 88, 88]],
    ['Monkey D. Luffy', 'Gear 5 · Wano', 'A transformação amplia a liberdade dos seus ataques', [98, 94, 94, 90, 78, 88]],
    ['Roronoa Zoro', 'Wano', 'Reforça seus cortes com Haki no duelo contra King', [96, 97, 87, 89, 73, 92]],
    ['Kaido', 'Wano', 'A forma de dragão combina força e resistência', [99, 90, 88, 99, 80, 98]],
  ]],
  ['Bleach', [
    ['Ganju Shiba', 'Guerra Sangrenta dos Mil Anos', 'Usa truques com areia e explosivos', [54, 72, 64, 60, 73, 59]],
    ['Yasutora Sado (Chad)', 'Guerra Sangrenta dos Mil Anos', 'Usa um braço para bloquear e o outro para atacar', [81, 68, 63, 85, 67, 73]],
    ['Orihime Inoue', 'Guerra Sangrenta dos Mil Anos', 'Suas barreiras e habilidades de cura protegem a equipe', [48, 89, 59, 98, 74, 80]],
    ['Kisuke Urahara', 'Início de Bleach', 'Na loja, prepara ferramentas e planos para os combates', [69, 88, 80, 70, 97, 72]],
    ['Rukia Kuchiki', 'Sociedade das Almas', 'Usa técnicas de Kidō e esgrima', [67, 84, 75, 66, 78, 70]],
    ['Ichigo Kurosaki', 'Início de Bleach', 'Sua pressão espiritual cresce antes de dominar a espada', [78, 65, 77, 66, 63, 87]],
    ['Renji Abarai', 'Guerra Sangrenta · Zabimaru', 'O verdadeiro Bankai aumenta o alcance e o impacto', [90, 88, 82, 81, 74, 88]],
    ['Rukia Kuchiki', 'Guerra Sangrenta · Bankai', 'Seu Bankai congela a área ao redor', [92, 92, 78, 81, 82, 88]],
    ['Byakuya Kuchiki', 'Guerra Sangrenta dos Mil Anos', 'Cobre várias direções com lâminas e domina o passo rápido', [88, 96, 93, 86, 85, 91]],
    ['Ichigo Kurosaki', 'Guerra Sangrenta · Verdadeira Zangetsu', 'Empunha duas lâminas após descobrir a origem de seus poderes', [98, 90, 97, 89, 78, 99]],
    ['Genryūsai Yamamoto', 'Guerra Sangrenta · Zanka no Tachi', 'Concentra calor extremo na lâmina e ao redor do corpo', [99, 97, 88, 96, 88, 97]],
    ['Yhwach', 'Guerra Sangrenta · The Almighty', 'Enxerga futuros possíveis e pode alterá-los', [98, 96, 89, 96, 98, 98]],
  ]],
]

export const animeCatalog = profiles.flatMap(([universe, characters], storyIndex) =>
  characters.map(([name, arc, clue, ratings], index) => {
    const id = storyIndex * characters.length + index
    const firstAppearance = characters.findIndex(([character]) => character === name)
    return { id, athleteId: storyIndex * characters.length + firstAppearance, name, universe, arc, clue,
      tier: Math.floor(index / 3), ratings }
  }),
)

export type AnimeCard = (typeof animeCatalog)[number]

const additionalProfiles: typeof profiles = [
  ['Demon Slayer', [
    ['Aoi Kanzaki', 'Mansão Borboleta', 'Ajuda no tratamento e no treino de recuperação', [29, 61, 43, 41, 66, 49]],
    ['Murata', 'Monte Natagumo', 'Conhece a Respiração da Água e luta em equipe', [45, 58, 50, 48, 56, 50]],
    ['Genya Shinazugawa', 'Seleção Final', 'Se apoia mais na agressividade do que na técnica de espada', [54, 42, 50, 53, 46, 56]],
    ['Tanjiro Kamado', 'Monte Natagumo', 'Usa o olfato para rastrear o inimigo em meio aos fios', [72, 77, 71, 64, 75, 71]],
    ['Inosuke Hashibira', 'Monte Natagumo', 'Localiza ameaças com sua percepção espacial', [71, 71, 80, 62, 56, 74]],
    ['Zenitsu Agatsuma', 'Distrito do Entretenimento', 'Acelera de uma vez para atacar em linha reta', [79, 83, 95, 65, 66, 72]],
    ['Kyojuro Rengoku', 'Trem Infinito', 'Defende os passageiros enquanto luta contra os demônios', [88, 91, 86, 86, 79, 88]],
    ['Akaza', 'Trem Infinito', 'Sente o espírito de luta e se regenera após receber golpes', [93, 95, 91, 93, 85, 98]],
  ]],
  ['Jujutsu Kaisen', [
    ['Junpei Yoshino', 'Arco do Mahito', 'Usa uma água-viva amaldiçoada que injeta veneno', [47, 62, 38, 46, 57, 46]],
    ['Kasumi Miwa', 'Intercâmbio de Kyoto', 'Usa Domínio Simples junto à técnica de sacar a espada', [48, 68, 56, 60, 59, 47]],
    ['Mai Zenin', 'Intercâmbio de Kyoto', 'A pontaria compensa a pouca energia para criar munição', [52, 73, 52, 45, 65, 35]],
    ['Yuji Itadori', 'Intercâmbio de Kyoto', 'A força física e o Black Flash fazem a diferença no corpo a corpo', [82, 72, 80, 70, 63, 73]],
    ['Nobara Kugisaki', 'Pinturas da Morte', 'Usa Ressonância para atingir o adversário indiretamente', [70, 85, 62, 58, 80, 67]],
    ['Aoi Todo', 'Incidente de Shibuya', 'Troca posições para desorganizar o adversário', [82, 91, 78, 78, 94, 80]],
    ['Megumi Fushiguro', 'Pinturas da Morte', 'Combina suas invocações e abre um domínio incompleto', [82, 89, 77, 72, 90, 82]],
    ['Satoru Gojo', 'Incidente de Shibuya', 'Mantém distância com o Ilimitado e calcula o uso do domínio', [98, 98, 96, 99, 94, 98]],
  ]],
  ['My Hero Academia', [
    ['Izuku Midoriya', 'Antes do One For All', 'Analisa heróis e suas habilidades em cadernos', [22, 38, 37, 34, 90, 41]],
    ['Minoru Mineta', 'Festival Esportivo', 'Usa esferas adesivas para atrasar o oponente', [39, 70, 50, 41, 69, 48]],
    ['Denki Kaminari', 'Festival Esportivo', 'A descarga elétrica é forte, mas o excesso o deixa vulnerável', [68, 49, 52, 45, 44, 56]],
    ['Ochaco Uraraka', 'Festival Esportivo', 'Usa a gravidade para preparar uma chuva de destroços', [60, 78, 61, 58, 83, 63]],
    ['Tenya Iida', 'Festival Esportivo', 'Os motores nas pernas dão uma arrancada rápida', [67, 72, 89, 63, 68, 71]],
    ['Shoto Todoroki', 'Festival Esportivo', 'Consegue bloquear uma área inteira com gelo', [90, 88, 75, 91, 74, 85]],
    ['Katsuki Bakugo', 'Festival Esportivo', 'Usa explosões também para mudar de direção no ar', [87, 89, 90, 70, 82, 83]],
    ['All Might', 'Batalha de Kamino', 'Ainda entrega golpes decisivos mesmo com pouco tempo de transformação', [99, 93, 94, 92, 88, 70]],
  ]],
  ['Hunter × Hunter', [
    ['Leorio', 'Exame Hunter', 'Resiste às provas sem domínio de Nen', [48, 41, 50, 55, 67, 46]],
    ['Tonpa', 'Exame Hunter', 'Tenta eliminar novatos com truques, evitando confronto direto', [29, 36, 35, 38, 70, 38]],
    ['Komugi', 'Formigas Quimera', 'Antecipa jogadas no Gungi mesmo sem habilidades de luta', [15, 48, 22, 24, 99, 47]],
    ['Gon Freecss', 'Torre Celestial', 'Começa a aplicar Nen à sua força e aos seus reflexos', [71, 66, 76, 67, 65, 74]],
    ['Killua Zoldyck', 'Exame Hunter', 'O treino de assassino já dá velocidade e precisão', [65, 83, 88, 60, 74, 55]],
    ['Kurapika', 'Yorknew', 'Prepara correntes específicas para enfrentar a Trupe', [82, 93, 81, 80, 92, 86]],
    ['Hisoka', 'Torre Celestial', 'Usa o Bungee Gum para criar ângulos inesperados', [85, 94, 87, 78, 92, 84]],
    ['Meruem', 'Formigas Quimera', 'Aprende durante o combate e resiste a ataques sucessivos', [98, 93, 95, 98, 98, 97]],
  ]],
]

const additionalTiers = [0, 0, 0, 1, 1, 2, 2, 3]
const addedCards = additionalProfiles.flatMap(([universe, characters], series) =>
  characters.map(([name, arc, clue, ratings], index) => {
    const id = animeCatalog.length + series * characters.length + index
    return { id, athleteId: id, name, universe, arc, clue, ratings, tier: additionalTiers[index] }
  }),
)
export const expandedAnimeCatalog = [...animeCatalog, ...addedCards]
