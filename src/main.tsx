import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { modes, type Mode } from '../draft-modes'
import './style.css'

type Card = { name: string } & (
  { club: string; season: string } |
  { universe: string; arc: string; clue: string; tier: string }
)
type Room = {
  code: string; bot: boolean; mode: Mode; seat: number; step: number
  offer?: Card
  players: { name: string; picks: (number | null)[]; sources?: (Card | null)[] }[]
}

const previewNames: Record<Mode, readonly string[]> = {
  football: [
    'Ronaldinho', 'Rodinei', 'Henry', 'Rony', 'Fábio Santos', 'Messi', 'Cássio',
    'Nani', 'Zico', 'Neymar', 'Isco', 'Arrascaeta', 'Rogério Ceni', 'Adriano',
  ],
  anime: [
    'Shikamaru Nara', 'Leorio', 'Satoru Gojo', 'Goku', 'Nami', 'Zenitsu Agatsuma', 'Komugi',
    'Ichigo Kurosaki', 'Minoru Mineta', 'Gaara', 'Tanjiro Kamado', 'Kurapika', 'Bulma', 'Roronoa Zoro',
  ],
}
const drawTimings = [36, 74, 114, 157, 203, 253, 308, 370, 441, 526, 640]
const quietDrawTimings = [95, 197, 310, 435, 570]

async function api(action: string, body: object) {
  const response = await fetch('/api/' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data as { room: Room; token?: string }
}

function cardContext(card: Card) {
  return 'universe' in card ? [card.universe, card.arc] : [card.club, card.season].filter(Boolean)
}

function App() {
  const [code, setCode] = useState(new URLSearchParams(location.search).get('sala') ?? '')
  const [mode, setMode] = useState<Mode>(() =>
    new URLSearchParams(location.search).get('modo') === 'anime' ? 'anime' : 'football')
  const [token, setToken] = useState(() => sessionStorage.getItem('draft:' + code) ?? '')
  const [name, setName] = useState('')
  const [room, setRoom] = useState<Room>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token || !code || busy) return
    let active = true
    async function refresh() {
      try {
        const state = await api('state', { code, token })
        if (active) { setRoom(state.room); setError('') }
      } catch (failure) {
        if (active) setError((failure as Error).message)
      }
    }
    void refresh()
    const timer = setInterval(refresh, 900)
    return () => { active = false; clearInterval(timer) }
  }, [code, token, busy])

  async function act(action: string, details: object = {}) {
    setBusy(true)
    setError('')
    try {
      const next = await api(action, { name, code, token, ...details })
      if (next.token) {
        sessionStorage.setItem('draft:' + next.room.code, next.token)
        setToken(next.token)
        setCode(next.room.code)
        const params = new URLSearchParams({ sala: next.room.code })
        if (next.room.mode === 'anime') params.set('modo', 'anime')
        history.replaceState(null, '', '?' + params)
      }
      setRoom(next.room)
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function leave() {
    setMode(activeMode)
    setRoom(undefined)
    setCode('')
    setToken('')
    setCopied(false)
    setError('')
    history.replaceState(null, '', activeMode === 'anime' ? '/?modo=anime' : '/')
  }

  const activeMode = room?.mode ?? mode
  const { theme, subtitle, attributes } = modes[activeMode]
  useEffect(() => { document.title = 'Bombástico — ' + modes[activeMode].title }, [activeMode])
  const ready = room?.players.length === 2
  const finished = room?.step === 2 * attributes.length
  const myTurn = ready && !finished && room.step % 2 === room.seat
  const drawKey = ready && room.offer && !finished ? room.code + ':' + room.step : ''
  const [revealedDraw, setRevealedDraw] = useState('')
  const [drawPreview, setDrawPreview] = useState({ key: '', index: 0 })
  const rolling = Boolean(drawKey && drawKey !== revealedDraw)
  const previewIndex = drawPreview.key === drawKey ? drawPreview.index : 0
  const candidates = previewNames[activeMode].filter(candidate => candidate !== room?.offer?.name)
  const previewName = candidates[((room?.step ?? 0) * 3 + previewIndex) % candidates.length]
  useEffect(() => {
    if (!drawKey) {
      setRevealedDraw('')
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timings = reduced ? quietDrawTimings : drawTimings
    const timers = timings.map((delay, index) => window.setTimeout(() => {
      if (index === timings.length - 1) setRevealedDraw(drawKey)
      else setDrawPreview({ key: drawKey, index: index + 1 })
    }, delay))
    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [drawKey])
  const scores = finished ? room.players.map(player =>
    player.picks.reduce<number>((total, value) => total + (value ?? 0), 0) / attributes.length) : []

  return <main data-mode={activeMode}>
    <header><span>BOMBÁSTICO</span>{room && <button className="quiet" onClick={leave} disabled={busy}>Voltar ao início</button>}</header>
    <section className="heading">
      <h1>{theme}<br /><em>{subtitle}</em></h1>
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    {!room ? <section className="panel lobby">
      <div className="mode-picker" role="group" aria-label="Modo de jogo">
        {(['football', 'anime'] as const).map(option => <button
          key={option} className={mode === option ? '' : 'quiet'} aria-pressed={mode === option} disabled={busy}
          onClick={() => setMode(option)}>{option === 'anime' ? 'Anime' : 'Futebol'}</button>)}
      </div>
      <p>Escolha atributos para montar {mode === 'anime' ? 'seu personagem' : 'seu jogador'} e vencer no overall.</p>
      <label>Seu apelido<input value={name} maxLength={24} onChange={event => setName(event.target.value)} /></label>
      <div className="actions">
        <button disabled={busy || !name.trim()} onClick={() => act('create', { mode, bot: true })}>Jogar contra o bot</button>
        <button className="quiet" disabled={busy || !name.trim()} onClick={() => act('create', { mode })}>Criar sala</button>
      </div>
      <form onSubmit={event => { event.preventDefault(); void act('join') }}>
        <label>Código da sala<input value={code} maxLength={6} onChange={event => setCode(event.target.value.toUpperCase())} /></label>
        <button className="quiet" disabled={busy || !name.trim() || code.length !== 6}>Entrar</button>
      </form>
    </section> : <>
      <div className="matchbar">
        <span>Sala {room.code}</span>
        {!room.bot && <button className="quiet" onClick={async () => {
          try { await navigator.clipboard.writeText(location.href); setCopied(true) }
          catch { setError('Copie o endereço ou compartilhe o código da sala.') }
        }}>{copied ? 'Link copiado' : 'Copiar convite'}</button>}
      </div>
      <section className="panel offer" aria-live="polite">
        {!ready ? <h2>Aguardando seu amigo</h2> : finished ? <>
          <h2>{scores[0] === scores[1] ? 'Empate' : (scores[room.seat] > scores[1 - room.seat] ? 'Você venceu!' : 'Você perdeu')}</h2>
          <button disabled={busy} onClick={() => act('rematch')}>Jogar revanche</button>
        </> : <>
          <p>Rodada {Math.floor(room.step / 2) + 1} de {attributes.length} · {myTurn ? 'Sua vez' : 'Vez de ' + room.players[room.step % 2].name}</p>
          {room.offer && <div className="draw-window" key={drawKey}>
            <div className="draw-slot" data-state={rolling ? 'rolling' : 'revealed'} data-preview={previewIndex % 3}>
              {rolling ? <span className="draw-name" aria-hidden="true">{previewName}</span> : <h2>{room.offer.name}</h2>}
            </div>
            {rolling ? <p className="draw-status">Sorteando…</p> : <div className="draw-details">
              <p className="card-context">{cardContext(room.offer).join(' · ')}</p>
              {'clue' in room.offer && <>
                <p className="card-clue">{room.offer.clue}</p>
                <span className="tier">{room.offer.tier}</span>
              </>}
            </div>}
          </div>}
        </>}
      </section>
      <div className="boards">{room.players.map((player, seat) => <section className="panel" key={seat}>
        <h2>{player.name}{seat === room.seat && ' (você)'}</h2>
        {finished && <p>Overall {scores[seat].toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>}
        <div className="attributes">{attributes.map((attribute, index) => {
          const source = player.sources?.[index]
          return <button key={attribute} className="quiet"
            disabled={busy || rolling || !myTurn || seat !== room.seat || player.picks[index] !== null}
            onClick={() => act('pick', { attribute: index, step: room.step })}>
            <span>{attribute}{source && <small>{[source.name, ...cardContext(source)].join(' · ')}</small>}</span>
            <strong>{player.picks[index] ?? '—'}</strong>
          </button>
        })}</div>
      </section>)}</div>
    </>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
