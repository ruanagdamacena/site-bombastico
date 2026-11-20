import React from 'react'
import { type Mode } from '../draft-modes'

const categories = { banner: 'Banner', title: 'Título', emblem: 'Emblema' } as const
type Category = keyof typeof categories

export const cosmetics = [
  { id: 'arena', category: 'banner', name: 'Arena', price: 0 },
  { id: 'eclipse', category: 'banner', name: 'Eclipse', price: 25 },
  { id: 'chamas', category: 'banner', name: 'Chamas', price: 50 },
  { id: 'estreante', category: 'title', name: 'Estreante', price: 0 },
  { id: 'especialista', category: 'title', name: 'Especialista do Draft', price: 30 },
  { id: 'mestre', category: 'title', name: 'Mestre da Estratégia', price: 60 },
  { id: 'raio', category: 'emblem', name: 'Raio', symbol: 'ϟ', price: 0 },
  { id: 'estrela', category: 'emblem', name: 'Estrela', symbol: '✦', price: 20 },
  { id: 'diamante', category: 'emblem', name: 'Diamante', symbol: '◆', price: 40 },
] as const

type MatchResult = { mode: Mode; won: boolean; best: number }
export type Profile = {
  name: string
  coins: number
  owned: string[]
  equipped: Record<Category, string>
  results: Record<string, MatchResult>
}

const storageKey = 'bombastico:profile'
const initialProfile: Profile = {
  name: '', coins: 0, owned: ['arena', 'estreante', 'raio'],
  equipped: { banner: 'arena', title: 'estreante', emblem: 'raio' }, results: {},
}

export function loadProfile(): Profile {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : initialProfile
  } catch { return initialProfile }
}

export function saveProfile(update: (profile: Profile) => Profile) {
  const profile = update(loadProfile())
  localStorage.setItem(storageKey, JSON.stringify(profile))
  return profile
}

export const matchCoins = (won: boolean) => won ? 30 : 20

export function awardMatch(profile: Profile, match: string, result: MatchResult): Profile {
  if (profile.results[match]) return profile
  return { ...profile, coins: profile.coins + matchCoins(result.won), results: { ...profile.results, [match]: result } }
}

function equip(profile: Profile, item: (typeof cosmetics)[number]): Profile {
  if (profile.owned.includes(item.id)) {
    return { ...profile, equipped: { ...profile.equipped, [item.category]: item.id } }
  }
  if (profile.coins < item.price) return profile
  return { ...profile, owned: [...profile.owned, item.id], coins: profile.coins - item.price,
    equipped: { ...profile.equipped, [item.category]: item.id } }
}

export function profileMedals(profile: Profile) {
  const results = Object.values(profile.results)
  return [
    { name: 'Primeiro Draft', description: 'Conclua uma partida.', unlocked: results.length > 0 },
    { name: 'Primeira Vitória', description: 'Vença uma partida.', unlocked: results.some(result => result.won) },
    { name: 'Dois Universos', description: 'Conclua uma partida em cada modo.', unlocked: new Set(results.map(result => result.mode)).size === 2 },
    { name: 'Escolha de Craque', description: 'Garanta uma nota de 90 ou mais.', unlocked: results.some(result => result.best >= 90) },
    { name: 'De Volta ao Draft', description: 'Conclua cinco partidas.', unlocked: results.length >= 5 },
  ]
}

export function ProfilePanel({ profile, tab, update }: {
  profile: Profile
  tab: 'profile' | 'shop'
  update: (change: (profile: Profile) => Profile) => void
}) {
  const title = cosmetics.find(item => item.id === profile.equipped.title)?.name
  const emblem = cosmetics.find(item => item.category === 'emblem' && item.id === profile.equipped.emblem)
  const results = Object.values(profile.results)
  const medals = profileMedals(profile)

  return <section className="profile-content">
    <div className="profile-banner" data-banner={profile.equipped.banner}>
      <div className="profile-emblem" aria-hidden="true">{emblem && 'symbol' in emblem && emblem.symbol}</div>
      <div><h2>{profile.name || 'Seu perfil'}</h2><p>{title}</p></div>
      <strong className="profile-wallet">{profile.coins} moedas</strong>
    </div>
    {tab === 'profile' ? <>
      <div className="panel profile-stats">
        <label>Apelido do perfil<input maxLength={24} value={profile.name}
          onChange={event => { const name = event.target.value; update(current => ({ ...current, name })) }} /></label>
        <strong>{results.length} partidas · {results.filter(result => result.won).length} vitórias</strong>
      </div>
      <h2>Conquistas</h2>
      <ul className="medal-list">{medals.map(medal => <li className="panel" key={medal.name} data-unlocked={medal.unlocked}>
        <strong>{medal.name}</strong><span>{medal.description}</span>
        <small>{medal.unlocked ? 'Conquistada' : 'Em aberto'}</small>
      </li>)}</ul>
    </> : <>
      <p>Ganhe 20 moedas por partida concluída e mais 10 por vitória.</p>
      {(Object.entries(categories) as [Category, string][]).map(([category, label]) => <section key={category}>
        <h2>{label}</h2>
        <div className="shop-grid">{cosmetics.filter(item => item.category === category).map(item => {
          const owned = profile.owned.includes(item.id)
          const equipped = profile.equipped[category] === item.id
          return <article className="panel shop-item" key={item.id}>
            {item.category === 'banner' && <div className="banner-sample" data-banner={item.id} aria-hidden="true" />}
            {'symbol' in item && <span className="shop-symbol" aria-hidden="true">{item.symbol}</span>}
            <strong>{item.name}</strong>
            <button className={equipped ? 'quiet' : ''} disabled={equipped || (!owned && profile.coins < item.price)}
              onClick={() => update(current => equip(current, item))}>
              {equipped ? 'Equipado' : owned ? 'Equipar' : 'Comprar · ' + item.price}
            </button>
          </article>
        })}</div>
      </section>)}
    </>}
  </section>
}
