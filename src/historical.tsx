import React, { useEffect, useState } from 'react'
import { formationLabels, formations, tactics, type Competition, type Formation, type Position, type Tactic } from '../historical-catalog'
import type { HistoricalView } from '../historical-draft'

const options: { id: Competition; name: string; teams: string }[] = [
  { id: 'libertadores-2019', name: 'Libertadores 2019', teams: 'Flamengo, Grêmio, River Plate e Boca Juniors' },
  { id: 'copa-2002', name: 'Seleções históricas', teams: 'Elencos de diferentes Copas · adversários de 2002' },
]
const lines: Position[] = ['ATA', 'MEI', 'DEF', 'GOL']
const positionLabels = { GOL: 'Goleiro', DEF: 'Defesa', MEI: 'Meio-campo', ATA: 'Ataque' } as const
type Reply = { run: HistoricalView | null }
type Request = (action: string, body: object) => Promise<Reply>

function HistoricalCampaign({ competition, request }: { competition: Competition; request: Request }) {
  const [run, setRun] = useState<HistoricalView | null>()
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [tactic, setTactic] = useState<Tactic>('equilibrado')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [candidate, setCandidate] = useState<string>()
  const [moving, setMoving] = useState<number>()

  useEffect(() => {
    let active = true
    request('state', { competition }).then(({ run }) => {
      if (!active) return
      setRun(run)
      if (run) setFormation(run.formation)
    }).catch(failure => {
      if (active) { setError(failure.message); setRun(null) }
    })
    return () => { active = false }
  }, [competition, request])

  async function act(action: string, body: object) {
    setBusy(true)
    setError('')
    try {
      const next = await request(action, { competition, revision: run?.revision, ...body })
      setRun(next.run)
      setCandidate(undefined)
      setMoving(undefined)
    } catch (failure) {
      setError((failure as Error).message)
    } finally { setBusy(false) }
  }

  const complete = run?.rounds.length === 3
  const drafting = Boolean(run && run.picks.length < 11)
  const selected = run?.offer.find(card => card.id === candidate)
  const canArrange = run?.rounds.length === 0
  const isOpen = (position: Position) => Boolean(run?.slots.some((line, index) => position === line && !run.lineup[index]))
  function pickFieldSlot(slot: number) {
    if (!run) return
    if (selected) {
      void act('pick', { id: selected.id, slot })
    } else if (moving !== undefined && moving !== slot) {
      void act('move', { from: moving, slot })
    } else {
      setMoving(moving === slot ? undefined : slot)
    }
  }
  const formationPicker = <label>Formação
    <select value={formation} onChange={event => setFormation(event.target.value as Formation)}>
      {Object.keys(formations).map(value => <option key={value}>{value}</option>)}
    </select>
  </label>

  return <>
    {error && <p className="error" role="alert">{error}</p>}
    {run === undefined ? <p>Carregando campanha…</p> : !run ? <section className="panel history-start">
      <h2>Monte o seu XI</h2>
      <p>Sorteie um elenco, escolha um jogador e encaixe-o no campo. Repita até completar os 11.</p>
      {formationPicker}
      <button disabled={busy} onClick={() => act('start', { formation })}>Começar draft</button>
    </section> : <>
      <div className="history-board">
        <section className="panel history-pitch" aria-label={'Escalação ' + run.formation}>
          <div className="pitch-heading"><strong>Seu XI</strong><span>{run.formation} · {run.picks.length}/11</span></div>
          <div className="pitch-field">
            {lines.map(line => <div className="pitch-line" key={line}>
              {run.slots.flatMap((slot, index) => {
                if (slot !== line) return []
                const card = run.lineup[index]
                const label = formationLabels[run.formation][index]
                const target = selected ? selected.position === slot && !card : moving !== undefined && index !== moving && run.slots[moving] === slot
                const enabled = (selected || moving !== undefined) ? target || moving === index : Boolean(card)
                return [<button type="button" key={index} className="pitch-player quiet"
                  data-active={target || moving === index} data-picked={Boolean(card)}
                  aria-label={label + ' · ' + (card?.name ?? 'vaga livre')}
                  disabled={busy || !canArrange || !enabled} onClick={() => pickFieldSlot(index)}>
                  <small>{label}</small><strong>{card?.name ?? 'Livre'}</strong>
                </button>]
              })}
            </div>)}
          </div>
        </section>
        {drafting ? <section className="panel history-pick">
          {run.drawnTeam ? <>
            <div className="drawn-squad" key={run.drawnTeam.name}><small>{run.drawnTeam.year}</small><h2>{run.drawnTeam.name}</h2></div>
            <p aria-live="polite">{selected ? 'Agora clique numa vaga destacada no campo.' :
              moving !== undefined ? 'Clique em outra vaga da mesma linha para mover ou trocar.' : 'Escolha um jogador do elenco.'}</p>
            <div className="squad-choices">
              {run.offer.map(card => <button className="quiet" key={card.id} disabled={busy || !isOpen(card.position)}
                data-selected={candidate === card.id} aria-pressed={candidate === card.id}
                onClick={() => {
                  setMoving(undefined)
                  setCandidate(candidate === card.id ? undefined : card.id)
                }}>
                <strong>{card.name}</strong><small>{positionLabels[card.position]}</small>
              </button>)}
            </div>
            <button className="quiet" disabled={busy || !run.reroll} onClick={() => act('reroll', {})}>
              {run.reroll ? 'Trocar elenco · 1 uso' : 'Troca de elenco usada'}
            </button>
          </> : <>
            <h2>Próximo elenco</h2>
            <p>{moving !== undefined ? 'Clique em outra vaga da mesma linha para mover ou trocar.' :
              'Sorteie um elenco histórico para escolher o próximo jogador.'}</p>
            <button disabled={busy} onClick={() => act('draw', {})}>Sortear elenco</button>
          </>}
        </section> : <section className="panel history-start" aria-live="polite">
          {complete ? <>
            <h2>{run.table[0].id === 0 ? 'Você é campeão!' : run.table[0].name + ' é campeão'}</h2>
            <p>Seu time terminou em {run.table.findIndex(team => team.id === 0) + 1}º lugar.</p>
            {formationPicker}
            <button disabled={busy} onClick={() => act('start', { formation })}>Começar nova campanha</button>
          </> : <>
            <h2>Rodada {run.rounds.length + 1} de 3</h2>
            <p>{moving !== undefined ? 'Clique em outro jogador da mesma linha para trocar.' :
              'Seu XI enfrenta ' + run.names[run.rounds.length + 1] + '.'}</p>
            <label>Tática
              <select value={tactic} onChange={event => setTactic(event.target.value as Tactic)}>
                {(Object.keys(tactics) as Tactic[]).map(key => <option key={key} value={key}>{tactics[key].name}</option>)}
              </select>
            </label>
            <button disabled={busy} onClick={() => act('simulate', { round: run.rounds.length, tactic })}>Simular rodada</button>
          </>}
        </section>}
      </div>
      {!drafting && <section className="panel history-results">
        <h2>Classificação</h2>
        <div className="history-table">
          <table>
            <thead><tr><th scope="col">Equipe</th><th scope="col">Pts</th><th scope="col">J</th><th scope="col">GP</th><th scope="col">GC</th><th scope="col">Saldo</th></tr></thead>
            <tbody>{run.table.map(team => <tr key={team.id} data-yours={team.id === 0}>
              <th scope="row">{team.name}</th><td>{team.points}</td><td>{team.played}</td><td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td><td>{team.balance}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {run.rounds.map((matches, round) => <details key={round} open={round === run.rounds.length - 1}>
          <summary>Resultados da rodada {round + 1}</summary>
          <div className="history-matches">{matches.map((match, index) => <article className="match-scorecard" key={index}>
            <div><span>{run.names[match.home]}</span><strong>{match.homeGoals} × {match.awayGoals}</strong><span>{run.names[match.away]}</span></div>
            {match.goals.length > 0 ? <ul>{match.goals.map((goal, goalIndex) =>
              <li key={goalIndex}><time>{goal.minute}′</time> {goal.scorer} <small>· {run.names[match[goal.side]]}</small></li>)}</ul>
              : <p>Sem gols.</p>}
          </article>)}</div>
        </details>)}
      </section>}
    </>}
  </>
}

export function HistoricalDraft({ request }: { request: Request }) {
  const [competition, setCompetition] = useState<Competition>('libertadores-2019')
  return <div className="historical">
    <div className="history-options" role="group" aria-label="Competição">
      {options.map(option => <button className={competition === option.id ? '' : 'quiet'} key={option.id}
        aria-pressed={competition === option.id} onClick={() => setCompetition(option.id)}>
        <strong>{option.name}</strong><small>{option.teams}</small>
      </button>)}
    </div>
    <p>Quadrangular solo. Três rodadas contra equipes históricas controladas pelo jogo.</p>
    <HistoricalCampaign competition={competition} request={request} key={competition} />
  </div>
}
