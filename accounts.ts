import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { DatabaseSync } from 'node:sqlite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const deriveKey = promisify(scrypt)
const sessionLength = 30 * 24 * 60 * 60
const cookieName = 'bombastico_session'
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export function accounts(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, nickname TEXT NOT NULL, handle TEXT NOT NULL UNIQUE,
      salt TEXT NOT NULL, secret TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS account_sessions (
      token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL
    );
  `)
  const byHandle = db.prepare('SELECT id, nickname, salt, secret FROM accounts WHERE handle = ?')
  const bySession = db.prepare(`SELECT a.id, a.nickname FROM accounts a JOIN account_sessions s
    ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires > ?`)
  const addAccount = db.prepare('INSERT INTO accounts VALUES (?, ?, ?, ?, ?) ON CONFLICT(handle) DO NOTHING')
  const addSession = db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)')
  const removeSession = db.prepare('DELETE FROM account_sessions WHERE token_hash = ?')
  const clearExpired = db.prepare('DELETE FROM account_sessions WHERE expires <= ?')
  const attempts = new Map<string, { end: number; count: number }>()

  function sessionToken(req: IncomingMessage) {
    const token = req.headers.cookie?.split(';').map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(cookieName + '='))?.slice(cookieName.length + 1)
    return token && /^[a-f0-9]{64}$/.test(token) ? hashToken(token) : undefined
  }

  function current(req: IncomingMessage) {
    const token = sessionToken(req)
    const row = token && bySession.get(token, Date.now())
    return row ? { id: String(row.id), nickname: String(row.nickname) } : null
  }

  function setCookie(res: ServerResponse, value: string, age: number) {
    const secure = process.env.SECURE_ACCOUNT_COOKIE === '1' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`)
  }

  async function handle(action: string, req: IncomingMessage, res: ServerResponse, body: Record<string, unknown>) {
    if (action === 'current') return { account: current(req) }
    if (action === 'logout') {
      const token = sessionToken(req)
      if (token) removeSession.run(token)
      setCookie(res, '', 0)
      return { account: null }
    }
    if (action !== 'register' && action !== 'login') throw new Error('Ação de conta desconhecida.')
    const now = Date.now()
    const key = req.socket.remoteAddress ?? 'local'
    for (const [address, entry] of attempts) {
      if (entry.end <= now) attempts.delete(address)
    }
    const attempt = attempts.get(key) ?? { end: now + 60_000, count: 0 }
    if (++attempt.count > 20) throw new Error('Muitas tentativas. Aguarde um minuto.')
    attempts.set(key, attempt)

    const nickname = typeof body.nickname === 'string' ? body.nickname.trim().normalize('NFKC') : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (nickname.length < 3 || nickname.length > 24 || !/^[\p{L}\p{M}\p{N} _-]+$/u.test(nickname)) {
      throw new Error('Use de 3 a 24 caracteres no apelido, com letras, números, espaços, _ ou -.')
    }
    if (password.length < 8 || password.length > 128) throw new Error('A senha deve ter de 8 a 128 caracteres.')
    const handle = nickname.toLocaleLowerCase('pt-BR')
    let account: { id: string; nickname: string }
    if (action === 'register') {
      const id = randomUUID()
      const salt = randomBytes(16).toString('hex')
      const secret = (await deriveKey(password, salt, 64)).toString('hex')
      if (!addAccount.run(id, nickname, handle, salt, secret).changes) throw new Error('Esse apelido já está em uso.')
      account = { id, nickname }
    } else {
      const row = byHandle.get(handle)
      const actual = await deriveKey(password, row ? String(row.salt) : '0'.repeat(32), 64)
      if (!row || !timingSafeEqual(actual, Buffer.from(String(row.secret), 'hex'))) throw new Error('Apelido ou senha incorretos.')
      account = { id: String(row.id), nickname: String(row.nickname) }
    }
    const previous = sessionToken(req)
    if (previous) removeSession.run(previous)
    clearExpired.run(now)
    const token = randomBytes(32).toString('hex')
    addSession.run(hashToken(token), account.id, now + sessionLength * 1000)
    setCookie(res, token, sessionLength)
    return { account }
  }
  return { current, handle }
}
