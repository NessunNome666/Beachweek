'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock, Loader2, Lock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ScoreButtons from '@/components/ScoreButtons'

interface MatchItem {
  id: string
  homeTeamName: string
  awayTeamName: string
  locked: boolean          // congelata: partita iniziata o in corso
  postponed: boolean
  initialPrediction?: string
  phaseLabel?: string
  timeLabel?: string       // orario d'inizio già formattato lato server (es. "18:30")
  homePlayers?: string[]
  awayPlayers?: string[]
}

interface Props {
  matches: MatchItem[]
}

type SaveStatus =
  | { status: 'saving' }
  | { status: 'saved' }
  | { status: 'error'; message: string }

export default function PredictionsDeck({ matches }: Props) {
  const router = useRouter()
  // Le partite aperte partono pre-compilate col pronostico esistente, così si può modificare
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      matches.filter((m) => !m.locked && m.initialPrediction).map((m) => [m.id, m.initialPrediction!])
    )
  )
  const [saveStates, setSaveStates] = useState<Record<string, SaveStatus>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPlayers, setShowPlayers] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)                     // specchio per i callback async
  const selectionsRef = useRef(selections)              // idem, per la ricerca di avanzamento
  const saveSeqRef = useRef<Record<string, number>>({}) // scarta le risposte di tap superati
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  // Card col centro più vicino al centro dello scrollport = card corrente
  function computeIndex(el: HTMLElement): number {
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  function handleScroll() {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = containerRef.current
      if (!el) return
      const i = computeIndex(el)
      currentIndexRef.current = i
      setCurrentIndex(i)
    })
  }

  // scrollTo sul container, non scrollIntoView: su iOS quest'ultimo può scrollare anche la pagina
  function scrollToCard(i: number, behavior?: ScrollBehavior) {
    const el = containerRef.current
    const child = el?.children[i] as HTMLElement | undefined
    if (!el || !child) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({
      left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2,
      behavior: behavior ?? (reduced ? 'auto' : 'smooth'),
    })
  }

  // Posizione iniziale: prima card aperta senza pronostico → prima aperta → la prima
  useEffect(() => {
    let start = matches.findIndex((m) => !m.locked && !selectionsRef.current[m.id])
    if (start === -1) start = matches.findIndex((m) => !m.locked)
    if (start === -1) start = 0
    currentIndexRef.current = start
    setCurrentIndex(start)
    scrollToCard(start, 'auto')
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // Solo al mount: il deck non deve riposizionarsi a ogni refresh dei dati
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dopo un salvataggio: avanti alla prossima card aperta senza pronostico (mai indietro)
  function scheduleAdvance(fromIndex: number) {
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null
      if (currentIndexRef.current !== fromIndex) return // l'utente ha già sfogliato altrove
      for (let j = fromIndex + 1; j < matches.length; j++) {
        if (!matches[j].locked && !selectionsRef.current[matches[j].id]) {
          scrollToCard(j)
          return
        }
      }
    }, 550)
  }

  // Auto-save: tap = upsert immediato, UI ottimistica, il ri-tap è il retry
  async function handlePick(match: MatchItem, index: number, score: string) {
    if (match.locked) return
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    const seq = (saveSeqRef.current[match.id] ?? 0) + 1
    saveSeqRef.current[match.id] = seq

    selectionsRef.current = { ...selectionsRef.current, [match.id]: score }
    setSelections(selectionsRef.current)
    setSaveStates((prev) => ({ ...prev, [match.id]: { status: 'saving' } }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (saveSeqRef.current[match.id] !== seq) return
    if (!user) {
      setSaveStates((prev) => ({ ...prev, [match.id]: { status: 'error', message: 'Non sei autenticato.' } }))
      return
    }

    const [predictedHome, predictedAway] = score.split('-').map(Number)
    const { error } = await supabase
      .from('predictions_match')
      .upsert(
        { user_id: user.id, match_id: match.id, predicted_home: predictedHome, predicted_away: predictedAway },
        { onConflict: 'user_id,match_id' }
      )

    if (saveSeqRef.current[match.id] !== seq) return // tap più recente in volo: questo esito non conta

    if (!error) {
      setSaveStates((prev) => ({ ...prev, [match.id]: { status: 'saved' } }))
      scheduleAdvance(index)
    } else if (error.code === '42501') {
      // RLS: la partita è iniziata (cutoff in migration 005) — riallineo con il server
      setSaveStates((prev) => ({ ...prev, [match.id]: { status: 'error', message: 'Partita iniziata — pronostico bloccato' } }))
      router.refresh()
    } else {
      setSaveStates((prev) => ({ ...prev, [match.id]: { status: 'error', message: 'Errore di rete — tocca di nuovo per riprovare' } }))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollToCard(currentIndex - 1)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollToCard(currentIndex + 1)
    }
  }

  if (matches.length === 0) return null

  const single = matches.length === 1
  const manyDots = matches.length > 12
  const showDots = matches.length <= 24
  // Toggle rose visibile solo quando almeno una squadra ha atleti nel DB
  const hasPlayers = matches.some((m) => (m.homePlayers?.length ?? 0) > 0 || (m.awayPlayers?.length ?? 0) > 0)

  return (
    <div>
      {(!single || hasPlayers) && (
        <>
          <div className={`flex items-center gap-2 ${single ? 'mb-3' : 'mb-1'}`}>
            {!single && (
              <button
                type="button"
                onClick={() => scrollToCard(currentIndex - 1)}
                disabled={currentIndex === 0}
                aria-label="Partita precedente"
                className="flex-none p-2 rounded-full bg-slate-800 text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="flex-1 flex justify-center items-center">
              {!single && showDots &&
                matches.map((m, i) => {
                  const fill = m.locked ? 'bg-slate-800' : selections[m.id] ? 'bg-amber-400' : 'bg-slate-600'
                  const ring = i === currentIndex ? ' ring-2 ring-white/50' : ''
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => scrollToCard(i)}
                      aria-label={`Partita ${i + 1}: ${m.homeTeamName} - ${m.awayTeamName}`}
                      aria-current={i === currentIndex}
                      className="p-1"
                    >
                      <span className={`block rounded-full ${manyDots ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${fill}${ring}`} />
                    </button>
                  )
                })}
            </div>
            {!single && (
              <button
                type="button"
                onClick={() => scrollToCard(currentIndex + 1)}
                disabled={currentIndex === matches.length - 1}
                aria-label="Partita successiva"
                className="flex-none p-2 rounded-full bg-slate-800 text-slate-300 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            )}
            {hasPlayers && (
              <button
                type="button"
                onClick={() => setShowPlayers((v) => !v)}
                aria-pressed={showPlayers}
                aria-label="Mostra le rose"
                className={`flex-none p-2 rounded-full ${showPlayers ? 'bg-slate-700 text-amber-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <Users size={18} />
              </button>
            )}
          </div>
          {!single && (
            <p className="text-center text-xs text-slate-500 mb-3">
              {currentIndex + 1} di {matches.length}
            </p>
          )}
        </>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        role="region"
        aria-roledescription="carosello"
        aria-label="Pronostici partite"
        tabIndex={0}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {matches.map((match, index) => {
          const selected = match.locked ? (match.initialPrediction ?? '') : (selections[match.id] ?? '')
          // Le card già pronosticate partono visivamente "Salvato" senza stato extra
          const save = saveStates[match.id] ?? (match.initialPrediction ? ({ status: 'saved' } as SaveStatus) : null)

          return (
            <div
              key={match.id}
              className={`snap-center shrink-0 ${single ? 'w-full' : 'w-[85%] max-w-sm'} rounded-xl border border-slate-800 p-4 flex flex-col gap-3 ${
                match.locked ? 'bg-slate-900/60' : 'bg-slate-900'
              }`}
            >
              {/* Riga meta ad altezza fissa: le card restano allineate tra loro */}
              <div className="h-4 flex items-center justify-center gap-2.5 text-[10px]">
                {match.phaseLabel && (
                  <span className="font-bold uppercase tracking-wide text-orange-400/80">{match.phaseLabel}</span>
                )}
                {match.postponed && !match.locked && (
                  <span className="font-bold uppercase tracking-wide text-orange-400/80">Rinviata</span>
                )}
                {match.timeLabel && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock size={10} /> {match.timeLabel}
                  </span>
                )}
              </div>

              <div className="text-center">
                <p className={`text-base font-semibold truncate ${match.locked ? 'text-slate-400' : ''}`}>{match.homeTeamName}</p>
                {/* Slot rose ad altezza fissa su ogni card: l'allineamento non cambia */}
                {showPlayers && (
                  <p className={`h-8 text-xs leading-4 line-clamp-2 ${match.locked ? 'text-slate-500' : 'text-slate-400'}`}>
                    {match.homePlayers?.join(', ')}
                  </p>
                )}
                <p className="text-xs text-slate-500 my-0.5">vs</p>
                <p className={`text-base font-semibold truncate ${match.locked ? 'text-slate-400' : ''}`}>{match.awayTeamName}</p>
                {showPlayers && (
                  <p className={`h-8 text-xs leading-4 line-clamp-2 ${match.locked ? 'text-slate-500' : 'text-slate-400'}`}>
                    {match.awayPlayers?.join(', ')}
                  </p>
                )}
              </div>

              {/* Pronostico corrente in uno slot fisso: nessun salto di layout */}
              <div
                className={`h-9 flex items-center justify-center gap-2 font-mono font-bold ${
                  match.locked ? 'text-xl text-slate-400' : selected ? 'text-2xl text-amber-400' : 'text-2xl text-slate-700'
                }`}
              >
                {match.locked && <Lock size={12} className="text-slate-600" />}
                {selected ? selected.replace('-', ' - ') : '—'}
              </div>

              {match.locked ? (
                <p className="h-5 flex items-center justify-center text-xs text-slate-500">
                  {match.postponed
                    ? 'Rinviata'
                    : selected
                      ? 'In corso — in attesa del risultato'
                      : 'In corso — nessun pronostico inserito'}
                </p>
              ) : (
                <>
                  <ScoreButtons
                    selected={selected}
                    onSelect={(key) => handlePick(match, index, key)}
                    columns={2}
                    spaced
                  />
                  <p className="h-5 flex items-center justify-center gap-1.5 text-xs" aria-live="polite">
                    {save?.status === 'saving' && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 size={12} className="animate-spin" /> Salvataggio…
                      </span>
                    )}
                    {save?.status === 'saved' && (
                      <span className="flex items-center gap-1.5 text-green-400">
                        <Check size={12} /> Salvato
                      </span>
                    )}
                    {save?.status === 'error' && (
                      <span className="flex items-center gap-1.5 text-red-400">
                        <AlertCircle size={12} /> {save.message}
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
