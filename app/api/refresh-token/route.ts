import { NextResponse } from 'next/server'
import { IS_PRODUCTION } from '@/constants'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: IS_PRODUCTION,
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response
  } catch (error) {
    console.error('Error en /api/refresh-token:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
