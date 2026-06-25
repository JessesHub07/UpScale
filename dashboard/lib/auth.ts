import { createHash } from 'crypto'

export function sessionToken() {
  return createHash('sha256')
    .update(`${process.env.DASHBOARD_PASSWORD}:${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    .digest('hex')
}
