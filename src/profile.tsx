import React from 'react'
import { type Mode } from '../draft-modes'

const categories = { banner: 'Banners', emblem: 'Emblemas' } as const
type Category = keyof typeof categories

export const cosmetics = [
  { id: 'arena', category: 'banner', name: 'Arena', price: 0 },
  { id: 'eclipse', category: 'banner', name: 'Eclipse', price: 25 },
  { id: 'chamas', category: 'banner', name: 'Chamas', price: 50 },
  { id: 'raio', category: 'emblem', name: 'Raio', symbol: 'ϟ', price: 0 },
  { id: 'estrela', category: 'emblem', name: 'Estrela', symbol: '✦', price: 20 },
  { id: 'diamante', category: 'emblem', name: 'Diamante', symbol: '◆', price: 40 },
] as const

type MatchResult = { mode: Mode; won: boolean; best: number }
export type Profile = {
  name: string
  coins: number
  owned: string[]
  equipped: Record<Category | 'title', string>
  results: Record<string, MatchResult>
}

const storageKey = 'bombastico:profile'
const initialProfile: Profile = {
  name: '', coins: 0, owned: ['arena', 'estreante', 'raio'],
  equipped: { banner: 'arena', title: 'estreante', emblem: 'raio' }, results: {},
}

export function loadProfile(accountId?: string): Profile {
  try {
    const saved = localStorage.getItem(accountId ? storageKey + ':' + accountId : storageKey)
    return saved ? JSON.parse(saved) : initialProfile
  } catch { return initialProfile }
}

export function saveProfile(update: (profile: Profile) => Profile, accountId?: string) {
  const profile = update(loadProfile(accountId))
  localStorage.setItem(accountId ? storageKey + ':' + accountId : storageKey, JSON.stringify(profile))
  return profile
}

export function attachLocalProfile(accountId: string) {
  if (localStorage.getItem(storageKey + ':' + accountId)) return
  const legacy = localStorage.getItem(storageKey)
  if (!legacy) return
  localStorage.setItem(storageKey + ':' + accountId, legacy)
  localStorage.removeItem(storageKey)
}

export const matchCoins = (won: boolean) => won ? 30 : 20
export const matchXp = (won: boolean) => won ? 150 : 100
const xpPerLevel = 100

export function profileLevel(profile: Profile) {
  const xp = Object.values(profile.results).reduce((sum, result) => sum + matchXp(result.won), 0)
  return { xp, level: 1 + Math.floor(xp / xpPerLevel), current: xp % xpPerLevel }
}

const milestoneTitles = [
  'Especialista do Draft', 'Mestre da Estratégia', 'Campeão do Draft',
  'Lenda da Arena', 'Ícone Bombástico',
]

function titleAt(level: number) {
  return { id: 'nivel-' + level, name: milestoneTitles[level / 10 - 1] ?? ('Veterano do Draft · Nível ' + level), level }
}

export function earnedTitles(profile: Profile) {
  const count = Math.floor(profileLevel(profile).level / 10)
  const legacy = [
    { id: 'especialista', name: 'Especialista do Draft', level: 10 },
    { id: 'mestre', name: 'Mestre da Estratégia', level: 20 },
  ].filter(title => profile.owned.includes(title.id))
  return [{ id: 'estreante', name: 'Estreante', level: 1 },
    ...legacy, ...Array.from({ length: count }, (_, index) => titleAt(10 * (index + 1)))
      .filter(title => !legacy.some(item => item.level === title.level))]
}

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

export function ProfilePanel({ profile, nickname, tab, update }: {
  profile: Profile
  nickname: string
  tab: 'profile' | 'shop'
  update: (change: (profile: Profile) => Profile) => void
}) {
  const titles = earnedTitles(profile)
  const title = titles.find(item => item.id === profile.equipped.title)?.name
  const progress = profileLevel(profile)
  let nextMilestone = 10 * (Math.floor(progress.level / 10) + 1)
  while (titles.some(item => item.level === nextMilestone)) nextMilestone += 10
  const nextTitle = titleAt(nextMilestone)
  const emblem = cosmetics.find(item => item.category === 'emblem' && item.id === profile.equipped.emblem)
  const results = Object.values(profile.results)
  const medals = profileMedals(profile)

  return <section className="profile-content">
    <div className="profile-banner" data-banner={profile.equipped.banner}>
      <div className="profile-emblem" aria-hidden="true">{emblem && 'symbol' in emblem && emblem.symbol}</div>
      <div><h2>{nickname}</h2><p>{title} · Nível {progress.level}</p></div>
      <strong className="profile-wallet">{profile.coins} moedas</strong>
    </div>
    {tab === 'profile' ? <>
      <div className="panel profile-stats">
        <strong>{results.length} partidas · {results.filter(result => result.won).length} vitórias</strong>
        <p>{progress.xp} XP total · {progress.current}/{xpPerLevel} XP para o próximo nível</p>
        <progress aria-label="Progresso para o próximo nível" max={xpPerLevel} value={progress.current} />
      </div>
      <h2>Títulos</h2>
      <ul className="medal-list">{titles.map(item => <li className="panel" key={item.id}>
        <strong>{item.name}</strong>
        <button className="quiet" disabled={profile.equipped.title === item.id}
          onClick={() => update(current => ({ ...current, equipped: { ...current.equipped, title: item.id } }))}>
          {profile.equipped.title === item.id ? 'Equipado' : 'Equipar'}
        </button>
      </li>)}</ul>
      <p>Próximo título · {nextTitle.name} no nível {nextTitle.level}</p>
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
