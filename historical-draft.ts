import { randomInt, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { competitions, formations, squadReserves, tactics, type Competition, type Formation, type HistoricalCard, type Position, type Tactic } from './historical-catalog.ts'
import worldCupData from './data/world-cup-squads.json' with { type: 'json' }

const positions: Position[] = ['GOL', 'DEF', 'MEI', 'ATA']
const schedule = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
]
function originalPortfolio(competition: Competition): HistoricalCard[] {
  const config = competitions[competition]
  const teams = [...config.teams.map(team => ({ ...team, year: config.year })), ...('scouting' in config ? config.scouting : [])]
  return teams.flatMap(team => [
    ...positions.flatMap(position => team.players[position].map(([name, rating]) => ({
      id: team.name + '|' + name, name, team: team.name, year: team.year, position, rating,
    }))),
    ...squadReserves[team.name].map(([name, position, rating]) => ({
      id: team.name + '|' + name, name, team: team.name, year: team.year, position, rating, reserve: true,
    })),
  ])
}

type WorldCupSquad = [string, string, string, [string, string, Position, number][]]
const worldCupSquads = worldCupData as WorldCupSquad[]
const normalName = (name: string) => name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '')
const historicName = (team: string, year: string, name: string) => team + '|' + year + '|' + normalName(name)
const oldWorldCupCards = originalPortfolio('copa-2002')
const curatedRatings = new Map(oldWorldCupCards.map(card => [historicName(card.team, card.year, card.name), card.rating]))
const worldCupCards = new Map(worldCupSquads.map(([squadId, team, year, players]) => [squadId,
  players.map(([playerId, name, position, rating]): HistoricalCard => ({
    id: squadId + '|' + playerId, squadId, playerId, team, year, name, position,
    rating: curatedRatings.get(historicName(team, year, name)) ?? rating,
  })),
]))
const importedWorldCupCards = [...worldCupCards.values()].flat()
const worldCupPlayerIds = new Map(importedWorldCupCards.map(card => [historicName(card.team, card.year, card.name), card.playerId]))
const cardsByCompetition = {
  'libertadores-2019': originalPortfolio('libertadores-2019'),
  'copa-2002': [
    ...oldWorldCupCards.map(card => ({ ...card, playerId: worldCupPlayerIds.get(historicName(card.team, card.year, card.name)) })),
    ...importedWorldCupCards,
  ],
}
const indexByCompetition = {
  'libertadores-2019': new Map(cardsByCompetition['libertadores-2019'].map(card => [card.id, card])),
  'copa-2002': new Map(cardsByCompetition['copa-2002'].map(card => [card.id, card])),
}

type Team = { name: string; lineup: HistoricalCard[]; tactic: Tactic }
type Goal = { minute: number; side: 'home' | 'away'; scorer: string }
type Match = { home: number; away: number; homeGoals: number; awayGoals: number; goals: Goal[] }
type Run = {
  revision: string
  competition: Competition
  formation: Formation
  playerName: string
  picks: string[]
  pickSlots?: number[]
  draftVersion?: 2
  drawnTeam?: { name: string; year: string; id?: string }
  offer: string[]
  opponents: string[]
  opponentSquads?: string[]
  reroll: boolean
  rounds: Match[][]
}

function takeRandom<T>(items: T[], count: number): T[] {
  const available = [...items]
  return Array.from({ length: Math.min(count, available.length) }, () => available.splice(randomInt(available.length), 1)[0])
}

function slots(formation: Formation) {
  return positions.flatMap(position => Array<Position>(formations[formation][position]).fill(position))
}

function openPositions(run: Run) {
  return new Set(slots(run.formation).filter((_, index) => !run.pickSlots?.includes(index)))
}

function drawSquad(run: Run, cards: HistoricalCard[], exclude?: string) {
  const positions = openPositions(run)
  const all = run.competition === 'copa-2002' ? importedWorldCupCards : cards
  const byId = indexByCompetition[run.competition]
  const used = run.picks.map(id => byId.get(id)!)
  const usedIds = new Set(used.flatMap(card => card.playerId ? [card.playerId] : []))
  const usedNames = new Set(used.map(card => normalName(card.name)))
  const draftable = (card: HistoricalCard) => !usedIds.has(card.playerId) && !usedNames.has(normalName(card.name))
  const eligible = all.filter(card => positions.has(card.position) && draftable(card))
  const teams = [...new Set(eligible.map(card => card.squadId ?? card.team))]
  const alternatives = teams.filter(team => team !== exclude)
  const [team] = takeRandom(alternatives.length ? alternatives : teams, 1)
  const drawn = worldCupCards.get(team) ?? cards.filter(card => card.team === team)
  if (!drawn.length) throw new Error('Não há jogadores disponíveis para as vagas restantes.')
  run.drawnTeam = { name: drawn[0].team, year: drawn[0].year, id: team }
  run.offer = drawn.filter(draftable).map(card => card.id)
}

function selectOpponent(squad: HistoricalCard[]) {
  const available = [...squad].sort((left, right) => right.rating - left.rating)
  return slots('4-3-3').map(position => {
    const match = available.findIndex(card => card.position === position)
    const [card] = available.splice(Math.max(0, match), 1)
    return match >= 0 ? card : { ...card, position, rating: card.rating - 8 }
  })
}

function strength(team: Team) {
  const mean = (position: Position) => {
    const line = team.lineup.filter(card => card.position === position)
    return line.reduce((total, card) => total + card.rating, 0) / line.length
  }
  const tactic = tactics[team.tactic]
  const attack = mean('ATA') * .66 + mean('MEI') * .28 + mean('DEF') * .06 + tactic.attack
  const defense = mean('GOL') * .30 + mean('DEF') * .54 + mean('MEI') * .16 + tactic.defense
  return { attack, defense }
}

function goalsFrom(attack: number, defense: number) {
  const average = Math.max(.45, Math.min(3.2, 1.35 + (attack - defense) * .08))
  const limit = Math.exp(-average)
  let sample = 1
  let goals = 0
  do {
    sample *= (randomInt(1_000_000) + 1) / 1_000_001
    if (sample > limit) goals++
  } while (sample > limit && goals < 8)
  return goals
}

function scorers(team: Team, count: number, side: Goal['side']): Goal[] {
  const weights = { GOL: 0, DEF: 1, MEI: 3, ATA: 7 }
  const candidates = team.lineup.flatMap(card => Array<string>(weights[card.position]).fill(card.name))
  return takeRandom(Array.from({ length: 90 }, (_, index) => index + 1), count).map(minute => ({
    minute, side, scorer: candidates[randomInt(candidates.length)],
  }))
}

function simulate(teams: Team[], home: number, away: number): Match {
  const homeTeam = teams[home]
  const awayTeam = teams[away]
  const first = strength(homeTeam)
  const second = strength(awayTeam)
  const homeGoals = goalsFrom(first.attack, second.defense)
  const awayGoals = goalsFrom(second.attack, first.defense)
  const goals = [...scorers(homeTeam, homeGoals, 'home'), ...scorers(awayTeam, awayGoals, 'away')]
    .sort((a, b) => a.minute - b.minute)
  return { home, away, homeGoals, awayGoals, goals }
}

function tableFor(names: string[], rounds: Match[][]) {
  const table = names.map((name, id) => ({ id, name, played: 0, points: 0, goalsFor: 0, goalsAgainst: 0 }))
  for (const match of rounds.flat()) {
    for (const [id, scored, conceded] of [[match.home, match.homeGoals, match.awayGoals], [match.away, match.awayGoals, match.homeGoals]]) {
      const row = table[id]
      row.played++
      row.points += scored > conceded ? 3 : scored === conceded ? 1 : 0
      row.goalsFor += scored
      row.goalsAgainst += conceded
    }
  }
  return table.map(row => ({ ...row, balance: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.balance - a.balance || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name, 'pt-BR'))
}

function view(run: Run, showOvr: boolean) {
  const names = [run.playerName, ...run.opponents]
  const cardById = indexByCompetition[run.competition]
  const visible = (id: string) => {
    const { name, team, year, position, rating } = cardById.get(id)!
    return { id, name, team, year, position, ...(showOvr ? { rating } : {}) }
  }
  const lineup = slots(run.formation).map((_, slot) => {
    const pickIndex = run.pickSlots?.indexOf(slot) ?? slot
    return pickIndex >= 0 && run.picks[pickIndex] ? visible(run.picks[pickIndex]) : null
  })
  return {
    revision: run.revision, competition: run.competition, formation: run.formation, slots: slots(run.formation), reroll: run.reroll,
    lineup, picks: run.picks.map(visible), offer: run.offer.map(visible), drawnTeam: run.drawnTeam,
    rounds: run.rounds, names, table: tableFor(names, run.rounds),
  }
}

export type HistoricalView = ReturnType<typeof view>

export function historicalDraft(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS historical_runs (
    account_id TEXT NOT NULL, competition TEXT NOT NULL, state TEXT NOT NULL, PRIMARY KEY (account_id, competition)
  )`)
  const read = db.prepare('SELECT state FROM historical_runs WHERE account_id = ? AND competition = ?')
  const save = db.prepare(`INSERT INTO historical_runs VALUES (?, ?, ?)
    ON CONFLICT(account_id, competition) DO UPDATE SET state = excluded.state`)

  return (action: string, body: Record<string, unknown>, account: { id: string; nickname: string } | null) => {
    if (!account) throw new Error('Entre na sua conta para jogar o draft histórico.')
    const competition = body.competition
    if (competition !== 'libertadores-2019' && competition !== 'copa-2002') throw new Error('Competição desconhecida.')
    const cards = cardsByCompetition[competition]
    const cardById = indexByCompetition[competition]
    const showOvr = body.showOvr === true
    const row = read.get(account.id, competition)
    let run = row ? JSON.parse(String(row.state)) as Run : undefined
    if (run && !run.draftVersion) {
      run.draftVersion = 2
      run.pickSlots = run.picks.map((_, index) => index)
      run.revision = randomUUID()
      run.offer = []
      save.run(account.id, competition, JSON.stringify(run))
    }
    if (action === 'state') return { run: run ? view(run, showOvr) : null }

    if (action === 'start') {
      if (run && run.rounds.length < schedule.length) return { run: view(run, showOvr) }
      const formation = body.formation
      if (formation !== '4-3-3' && formation !== '4-4-2') throw new Error('Escolha uma formação.')
      run = { revision: randomUUID(), competition, formation, playerName: 'XI de ' + account.nickname, picks: [], pickSlots: [],
        draftVersion: 2, offer: [],
        opponents: takeRandom(competitions[competition].teams.map(team => team.name), 3), reroll: true, rounds: [] }
      if (competition === 'copa-2002') {
        const opponents = takeRandom(worldCupSquads, 3)
        run.opponentSquads = opponents.map(([id]) => id)
        run.opponents = opponents.map(([, name, year]) => name + ' ' + year)
      }
    } else {
      if (!run) throw new Error('Inicie um draft histórico.')
      if (body.revision !== run.revision) throw new Error('A campanha mudou. Reabra o draft para continuar.')
      if (action === 'draw' || action === 'reroll') {
        if (run.picks.length === 11) throw new Error('A escalação está completa.')
        if (action === 'reroll') {
          if (!run.reroll || !run.drawnTeam) throw new Error('O novo sorteio não está disponível.')
          run.reroll = false
        } else if (run.drawnTeam) throw new Error('Escolha um jogador do elenco já sorteado.')
        drawSquad(run, cards, run.drawnTeam?.id ?? run.drawnTeam?.name)
      } else if (action === 'pick' || action === 'move') {
        const lineupSlots = slots(run.formation)
        const assigned = run.pickSlots!
        const slot = typeof body.slot === 'number' ? body.slot : -1
        if (!Number.isInteger(slot) || !lineupSlots[slot]) throw new Error('Escolha uma vaga no campo.')
        const occupant = assigned.indexOf(slot)
        if (action === 'pick') {
          const id = String(body.id)
          const card = cardById.get(id)
          if (occupant >= 0 || !run.offer.includes(id) || card?.position !== lineupSlots[slot]) {
            throw new Error('Escolha uma vaga livre da mesma posição.')
          }
          run.picks.push(id)
          assigned.push(slot)
          run.offer = []
          delete run.drawnTeam
        } else {
          const from = typeof body.from === 'number' ? body.from : -1
          const moving = assigned.indexOf(from)
          if (run.rounds.length > 0 || moving < 0 || from === slot || lineupSlots[from] !== lineupSlots[slot]) {
            throw new Error('Selecione outro jogador ou uma vaga da mesma linha.')
          }
          assigned[moving] = slot
          if (occupant >= 0) assigned[occupant] = from
        }
      } else if (action === 'simulate') {
        const round = run.rounds.length
        if (run.picks.length !== slots(run.formation).length || round >= schedule.length || body.round !== round) {
          throw new Error('A rodada ainda não está disponível.')
        }
        const tactic = body.tactic
        if (tactic !== 'equilibrado' && tactic !== 'ofensivo' && tactic !== 'defensivo') throw new Error('Escolha uma tática.')
        const team: Team = { name: run.playerName, lineup: run.picks.map(id => cardById.get(id)!), tactic }
        const teams: Team[] = [team, ...run.opponents.map((name, index) => ({
          name, lineup: run.opponentSquads ? selectOpponent(worldCupCards.get(run.opponentSquads[index])!) :
            cards.filter(card => card.team === name && !card.reserve && !card.squadId), tactic: 'equilibrado' as const,
        }))]
        run.rounds.push(schedule[round].map(([home, away]) => simulate(teams, home, away)))
      } else {
        throw new Error('Ação de draft histórico desconhecida.')
      }
      run.revision = randomUUID()
    }
    save.run(account.id, competition, JSON.stringify(run))
    return { run: view(run, showOvr) }
  }
}
