import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hashValue = process.env.ADMIN_PASSWORD_HASH
  if (!hashValue || !password) {
    return false
  }

  const [algorithm, salt, keyHex] = hashValue.split(':')
  if (algorithm !== 'scrypt' || !salt || !keyHex) {
    return false
  }

  const keyLength = keyHex.length / 2
  const computedKey = scryptSync(password, salt, keyLength)
  const storedKey = Buffer.from(keyHex, 'hex')

  if (storedKey.length !== computedKey.length) {
    return false
  }

  return timingSafeEqual(storedKey, computedKey)
}

export async function hashAdminPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required')
  }

  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password, salt, 64)
  return `scrypt:${salt}:${key.toString('hex')}`
}
