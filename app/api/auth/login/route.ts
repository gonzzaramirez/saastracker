import { NextResponse } from 'next/server'
import { createSessionToken, getSessionCookieName, getSessionMaxAge } from '@/lib/auth'
import { verifyAdminPassword } from '@/lib/auth-password'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = typeof body?.password === 'string' ? body.password : ''

    const isValid = await verifyAdminPassword(password)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 })
    }

    const token = await createSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getSessionMaxAge(),
    })

    return response
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json({ error: 'No se pudo iniciar sesion' }, { status: 500 })
  }
}
