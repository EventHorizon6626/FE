import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME } from './env'

export function getSession() {
  const jar = cookies()
  const token = jar.get(SESSION_COOKIE_NAME)?.value || null

  return token
}

export function setSessionCookie(resp, token, opts = {}) {
  const { name = SESSION_COOKIE_NAME, maxAge, secure, sameSite } = opts

  resp.cookies.set({
    name,
    value: token,
    httpOnly: true,
    path: '/',
    maxAge,
    secure,
    sameSite
  })
}

export function clearSessionCookie(resp, opts = {}) {
  const { name = SESSION_COOKIE_NAME } = opts

  resp.cookies.set({
    name,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0
  })
}

export async function fetchWithAuth(input, init = {}) {
  const token = getSession()
  const headers = new Headers(init.headers || {})

  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers, cache: 'no-store' })
}
