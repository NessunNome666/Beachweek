'use client'

import { useEffect } from 'react'

// Centra la riga dell'utente (#me) all'apertura della classifica.
// Solo al mount: router.refresh/polling non rimontano i client component,
// quindi lo scroll non scatta mai mentre l'utente sta scorrendo la pagina.
export default function ScrollToMe() {
  useEffect(() => {
    document.getElementById('me')?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, [])
  return null
}
