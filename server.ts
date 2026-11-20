import { createServer } from 'node:http'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { baseCatalog, catalog, registeredCatalog, seasonCatalog, type Card } from './catalog.ts'
import { animeCatalog, animeTiers, expandedAnimeCatalog, legacyAnimeCatalog, type AnimeCard } from './anime-catalog.ts'
import { modes, type Mode } from './draft-modes.ts'

type DraftCard = Card | AnimeCard
type Player = { name: string; token: string; picks: (number | null)[]; sources?: (number | null)[] }
type Room = {
  code: string
  bot: boolean
  players: Player[]
  offers: number[]
  mode?: Mode
  seasonCards?: boolean
  catalogVersion?: 2 | 3
}
const db = new DatabaseSync(process.env.DRAFT_DATABASE ?? 'draft.sqlite')
db.exec('CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, state TEXT NOT NULL)')
const read = db.prepare('SELECT state FROM rooms WHERE code = ?')
const save = db.prepare('INSERT INTO rooms VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET state = excluded.state')
const makePlayer = (name: string, mode: Mode, token = randomUUID()): Player =>
  ({ name, token, picks: modes[mode].attributes.map(() => null) })
const turn = (room: Room) => room.players.flatMap(player => player.picks).filter(pick => pick !== null).length

function deal(mode: Mode) {
  const cards = mode === 'anime' ? expandedAnimeCatalog : catalog
  const tiers = mode === 'anime' ? [0, 0, 0, 0, 1, 1, 1, 2, 2, 3] : [0, 0, 1, 1, 1, 2, 2, 3]
  const offers: number[] = []
  const drawn = new Set<number>()
  const athletesBySeat = [new Set<number>(), new Set<number>()]
  for (let round = 0; round < modes[mode].attributes.length; round++) {
    const tier = tiers[randomInt(tiers.length)]
    for (const usedAthletes of athletesBySeat) {
      const available = cards.filter(card =>
        card.tier === tier && !drawn.has(card.id) && !usedAthletes.has(card.athleteId))
      const card = available[randomInt(available.length)]
      drawn.add(card.id)
      usedAthletes.add(card.athleteId)
      offers.push(card.id)
    }
  }
  return offers
}

function cardsFor(room: Room): readonly DraftCard[] {
  if (room.mode === 'anime') {
    if (room.catalogVersion === 3) return expandedAnimeCatalog
    return room.catalogVersion === 2 ? animeCatalog : legacyAnimeCatalog
  }
  if (room.catalogVersion === 3) return catalog
  if (room.catalogVersion === 2) return registeredCatalog
  return room.seasonCards ? seasonCatalog : baseCatalog
}

function publicCard(card: DraftCard) {
  if ('universe' in card) {
    const { name, universe, arc, tier } = card
    return { name, universe, arc, tier: animeTiers[tier] }
  }
  const { name, club, season } = card
  return { name, club, season }
}

function pick(player: Player, index: number, card: DraftCard) {
  player.picks[index] = card.ratings[index]
  player.sources ??= player.picks.map(() => null)
  player.sources[index] = card.id
}

function view(room: Room, seat: number) {
  const step = turn(room)
  const cards = cardsFor(room)
  const card = cards[room.offers[step]]
  return {
    code: room.code, bot: room.bot, mode: room.mode ?? 'football', seat, step,
    players: room.players.map(({ name, picks, sources }) => ({
      name, picks, sources: sources?.map(id => id === null ? null : publicCard(cards[id])),
    })),
    offer: card && publicCard(card),
  }
}

function handle(action: string, body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 24) : ''
  if (action === 'create') {
    if (!name) throw new Error('Digite seu apelido.')
    const mode = body.mode ?? 'football'
    if (mode !== 'football' && mode !== 'anime') throw new Error('Modo desconhecido.')
    let code: string
    do { code = randomBytes(3).toString('hex').toUpperCase() } while (read.get(code))
    const bot = body.bot === true
    const players = [makePlayer(name, mode)]
    if (bot) players.push(makePlayer('Bot', mode))
    const room: Room = { code, bot, mode, players, offers: deal(mode), catalogVersion: 3 }
    save.run(code, JSON.stringify(room))
    return { token: players[0].token, room: view(room, 0) }
  }
  const code = String(body.code ?? '').trim().toUpperCase()
  const row = read.get(code)
  if (!row) throw new Error('Sala não encontrada.')
  const room = JSON.parse(String(row.state)) as Room
  const mode = room.mode ?? 'football'
  let seat = room.players.findIndex(player => player.token === body.token)
  if (action === 'join' && seat < 0) {
    if (!name) throw new Error('Digite seu apelido.')
    if (room.players.length === 2) throw new Error('Esta sala já está cheia.')
    seat = room.players.push(makePlayer(name, mode)) - 1
    save.run(code, JSON.stringify(room))
    return { token: room.players[seat].token, room: view(room, seat) }
  }
  if (seat < 0) throw new Error('Entre na sala para jogar.')
  if (action === 'pick') {
    const step = turn(room)
    const index = Number(body.attribute)
    if (room.players.length !== 2 || step >= room.offers.length || step % 2 !== seat || body.step !== step) {
      throw new Error('O turno mudou. Aguarde a atualização.')
    }
    if (!Number.isInteger(index) || room.players[seat].picks[index] !== null) throw new Error('Escolha um atributo livre.')
    const cards = cardsFor(room)
    pick(room.players[seat], index, cards[room.offers[step]])
    if (room.bot) {
      const picks = room.players[1].picks
      const empty = picks.flatMap((pick, attribute) => pick === null ? [attribute] : [])
      const choice = empty[randomInt(empty.length)]
      pick(room.players[1], choice, cards[room.offers[step + 1]])
    }
    save.run(code, JSON.stringify(room))
  } else if (action === 'rematch') {
    if (turn(room) !== room.offers.length) throw new Error('A partida ainda está em andamento.')
    room.players = room.players.map(({ name, token }) => makePlayer(name, mode, token))
    room.catalogVersion = 3
    room.offers = deal(mode)
    if (!room.bot) room.players.reverse()
    seat = room.players.findIndex(player => player.token === body.token)
    save.run(code, JSON.stringify(room))
  } else if (action !== 'state' && action !== 'join') {
    throw new Error('Ação desconhecida.')
  }
  return { room: view(room, seat) }
}

const mime: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }
createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  try {
    if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
      let raw = ''
      for await (const chunk of req) {
        raw += chunk
        if (raw.length > 4096) throw new Error('Pedido muito grande.')
      }
      const data = handle(url.pathname.slice(5), JSON.parse(raw))
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      return res.end(JSON.stringify(data))
    }
    if (req.method !== 'GET' || (url.pathname !== '/' && !/^\/assets\/[\w.-]+\.(js|css)$/.test(url.pathname))) {
      res.writeHead(404)
      return res.end()
    }
    const file = url.pathname === '/' ? '/index.html' : url.pathname
    const content = await readFile(new URL('./dist' + file, import.meta.url))
    res.writeHead(200, { 'Content-Type': mime[file.slice(file.lastIndexOf('.'))] })
    res.end(content)
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro inesperado.' }))
  }
}).listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '127.0.0.1', () => {
  console.log('Bombástico na porta ' + (process.env.PORT ?? 3000))
})
