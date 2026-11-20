import { randomInt, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { competitions, formations, tactics, type Competition, type Formation, type HistoricalCard, type Position, type Tactic } from './historical-catalog.ts'

const positions: Position[] = ['GOL', 'DEF', 'MEI', 'ATA']
const schedule = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
]
const portfolio = (competition: Competition): HistoricalCard[] => competitions[competition].teams.flatMap(team =>
  positions.flatMap(position => team.players[position].map(([name, rating]) => ({
    id: team.name + '|' + name, name, team: team.name, position, rating,
  }))),
)

type Team = { name: string; lineup: HistoricalCard[]; tactic: Tactic }
type Goal = { minute: number; side: 'home' | 'away'; scorer: string }
type Match = { home: number; away: number; homeGoals: number; awayGoals: number; goals: Goal[] }
type Run = {
  revision: string
  competition: Competition
  formation: Formation
  playerName: string
  picks: string[]
  offer: string[]
  opponents: string[]
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

function offerFor(run: Run, cards: HistoricalCard[], exclude: string[] = []) {
  const position = slots(run.formation)[run.picks.length]
  const eligible = cards.filter(card => card.position === position && !run.picks.includes(card.id))
  const fresh = eligible.filter(card => !exclude.includes(card.id))
  const selected = takeRandom(fresh, 3)
  return [...selected, ...takeRandom(eligible.filter(card => exclude.includes(card.id)), 3 - selected.length)].map(card => card.id)
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

function view(run: Run, cards: HistoricalCard[]) {
  const names = [run.playerName, ...run.opponents]
  const cardById = new Map(cards.map(card => [card.id, card]))
  const visible = (id: string) => {
    const { name, team, position } = cardById.get(id)!
    return { id, name, team, position }
  }
  return {
    revision: run.revision, competition: run.competition, formation: run.formation, slots: slots(run.formation), reroll: run.reroll,
    picks: run.picks.map(visible), offer: run.offer.map(visible),
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
    const cards = portfolio(competition)
    const row = read.get(account.id, competition)
    let run = row ? JSON.parse(String(row.state)) as Run : undefined
    if (action === 'state') return { run: run ? view(run, cards) : null }

    if (action === 'start') {
      if (run && run.rounds.length < schedule.length) return { run: view(run, cards) }
      const formation = body.formation
      if (formation !== '4-3-3' && formation !== '4-4-2') throw new Error('Escolha uma formação.')
      run = { revision: randomUUID(), competition, formation, playerName: 'XI de ' + account.nickname, picks: [], offer: [],
        opponents: takeRandom(competitions[competition].teams.map(team => team.name), 3), reroll: true, rounds: [] }
      run.offer = offerFor(run, cards)
    } else {
      if (!run) throw new Error('Inicie um draft histórico.')
      if (body.revision !== run.revision) throw new Error('A campanha mudou. Reabra o draft para continuar.')
      if (action === 'pick' || action === 'reroll') {
        if (body.step !== run.picks.length || !run.offer.length) throw new Error('A escolha mudou. Atualize a tela.')
        const currentOffer = run.offer
        if (action === 'reroll') {
          if (!run.reroll) throw new Error('O novo sorteio já foi usado.')
          run.reroll = false
          run.offer = offerFor(run, cards, currentOffer)
        } else {
          const id = String(body.id)
          if (!currentOffer.includes(id)) throw new Error('Escolha um jogador sorteado.')
          run.picks.push(id)
          run.offer = offerFor(run, cards)
        }
      } else if (action === 'simulate') {
        const round = run.rounds.length
        if (run.picks.length !== slots(run.formation).length || round >= schedule.length || body.round !== round) {
          throw new Error('A rodada ainda não está disponível.')
        }
        const tactic = body.tactic
        if (tactic !== 'equilibrado' && tactic !== 'ofensivo' && tactic !== 'defensivo') throw new Error('Escolha uma tática.')
        const team: Team = { name: run.playerName, lineup: run.picks.map(id => cards.find(card => card.id === id)!), tactic }
        const teams: Team[] = [team, ...run.opponents.map(name => ({
          name, lineup: cards.filter(card => card.team === name), tactic: 'equilibrado' as const,
        }))]
        run.rounds.push(schedule[round].map(([home, away]) => simulate(teams, home, away)))
      } else {
        throw new Error('Ação de draft histórico desconhecida.')
      }
      run.revision = randomUUID()
    }
    save.run(account.id, competition, JSON.stringify(run))
    return { run: view(run, cards) }
  }
}
