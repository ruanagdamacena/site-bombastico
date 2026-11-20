import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const attributes = ['Finalização', 'Passe', 'Drible', 'Velocidade', 'Defesa', 'Físico']
type Card = { name: string; club: string; season: string; tier: string; fictional: boolean }
type Room = {
  code: string; bot: boolean; seat: number; step: number
  offer?: Card
  players: { name: string; picks: (number | null)[]; sources?: (Card | null)[] }[]
}

async function api(action: string, body: object) {
  const response = await fetch('/api/' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data as { room: Room; token?: string }
}

function App() {
  const [code, setCode] = useState(new URLSearchParams(location.search).get('sala') ?? '')
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
        history.replaceState(null, '', '?sala=' + next.room.code)
      }
      setRoom(next.room)
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function leave() {
    setRoom(undefined)
    setCode('')
    setToken('')
    setCopied(false)
    setError('')
    history.replaceState(null, '', '/')
  }

  const ready = room?.players.length === 2
  const finished = room?.step === 12
  const myTurn = ready && !finished && room.step % 2 === room.seat
  const scores = finished ? room.players.map(player =>
    player.picks.reduce<number>((total, value) => total + (value ?? 0), 0) / attributes.length) : []

  return <main>
    <header><span>BOMBÁSTICO</span>{room && <button className="quiet" onClick={leave} disabled={busy}>Voltar ao início</button>}</header>
    <section className="heading">
      <h1>Football<br /><em>Player Draft</em></h1>
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    {!room ? <section className="panel lobby">
      <p>Escolha os atributos. Monte seu jogador. Vença no overall.</p>
      <label>Seu apelido<input value={name} maxLength={24} onChange={event => setName(event.target.value)} /></label>
      <div className="actions">
        <button disabled={busy || !name.trim()} onClick={() => act('create', { bot: true })}>Jogar contra o bot</button>
        <button className="quiet" disabled={busy || !name.trim()} onClick={() => act('create')}>Criar sala</button>
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
          <p>Rodada {Math.floor(room.step / 2) + 1} de 6 · {myTurn ? 'Sua vez' : 'Vez de ' + room.players[room.step % 2].name}</p>
          <h2>{room.offer?.name}</h2>
          {room.offer && <p className="card-season">{room.offer.club} · {room.offer.season}</p>}
          <span className="tier">{room.offer?.tier}{room.offer?.fictional && ' · Atleta fictício'}</span>
        </>}
      </section>
      <div className="boards">{room.players.map((player, seat) => <section className="panel" key={seat}>
        <h2>{player.name}{seat === room.seat && ' (você)'}</h2>
        {finished && <p>Overall {scores[seat].toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>}
        <div className="attributes">{attributes.map((attribute, index) => {
          const source = player.sources?.[index]
          return <button key={attribute} className="quiet"
            disabled={busy || !myTurn || seat !== room.seat || player.picks[index] !== null}
            onClick={() => act('pick', { attribute: index, step: room.step })}>
            <span>{attribute}{source && <small>{source.name} · {source.club} · {source.season}</small>}</span>
            <strong>{player.picks[index] ?? '—'}</strong>
          </button>
        })}</div>
      </section>)}</div>
    </>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
