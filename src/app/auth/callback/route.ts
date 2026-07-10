import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'email') as EmailOtpType
  const next = searchParams.get('next') ?? '/fantacompetizione/pronostici'

  if (code || token_hash) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    // token_hash (template email nuovo): verifica server-side, funziona anche se
    // l'email viene aperta in un browser DIVERSO da quello che ha richiesto il link
    // (WebView di Gmail, browser di default, PWA con storage separato).
    // code (PKCE, template vecchio): richiede lo stesso browser — tenuto per i link già inviati.
    const { error } = token_hash
      ? await supabase.auth.verifyOtp({ type, token_hash })
      : await supabase.auth.exchangeCodeForSession(code!)
    if (!error) {
      // Il display_name viene impostato una sola volta dal trigger `handle_new_user`
      // al primo accesso. Non lo sincronizziamo a ogni login: non esiste policy UPDATE
      // su `users` (per evitare escalation su is_admin) e il campo nome della LoginForm
      // parte vuoto, quindi un re-login lo sovrascriverebbe col prefisso email.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
