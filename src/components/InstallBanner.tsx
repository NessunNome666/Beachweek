'use client'

import { useEffect, useState } from 'react'
import { X, Share, MoreVertical } from 'lucide-react'

const STORAGE_KEY = 'install-banner-dismissed'

export default function InstallBanner() {
  const [visible, setVisible] = useState(false)
  const [os, setOs] = useState<'ios' | 'android' | null>(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return
    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    const isAndroid = /android/i.test(ua)
    if (!isIos && !isAndroid) return
    setOs(isIos ? 'ios' : 'android')
    setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg">
      <button
        onClick={dismiss}
        className="absolute top-2 right-3 p-1 opacity-80 hover:opacity-100"
        aria-label="Chiudi"
      >
        <X size={18} />
      </button>

      <p className="font-semibold text-sm mb-1">Aggiungi alla schermata Home</p>

      {os === 'ios' && (
        <p className="text-xs leading-snug pr-6">
          Tocca l&apos;icona{' '}
          <Share size={13} className="inline -mt-0.5" />{' '}
          <strong>Condividi</strong> in basso → <strong>&quot;Aggiungi alla schermata Home&quot;</strong> → <strong>&quot;Aggiungi&quot;</strong>
        </p>
      )}

      {os === 'android' && (
        <p className="text-xs leading-snug pr-6">
          Tocca i <strong>tre puntini</strong>{' '}
          <MoreVertical size={13} className="inline -mt-0.5" />{' '}
          in alto a destra → <strong>&quot;Aggiungi alla schermata Home&quot;</strong>
        </p>
      )}
    </div>
  )
}
