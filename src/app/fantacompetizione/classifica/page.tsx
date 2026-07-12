import { createClient } from '@/lib/supabase/server'
import { toGameDate, dayNumber } from '@/lib/game-date'
import DayAccordion from '@/components/DayAccordion'
import LeaderboardTabs from './LeaderboardTabs'
import ScrollToMe from './ScrollToMe'

export const revalidate = 0

interface LeaderboardRow {
  user_id: string
  display_name: string
  total_points: number
  match_points: number
  winner_points: number
  correct_exact: number
  correct_winner: number
}

interface DailyRow {
  user_id: string
  display_name: string
  game_date: string
  day_points: number
  correct_exact: number
  correct_winner: number
}

const MEDALS = ['🥇', '🥈', '🥉']

export default async function FantaClassificaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('fanta_leaderboard').select('*')
  const sorted = (data ?? []) as LeaderboardRow[]

  // Classifica per giornata: solo punti partite del giorno (podio escluso),
  // solo giornate con partite concluse. Ordine garantito dalla view.
  const { data: dailyRaw } = await supabase.from('fanta_leaderboard_daily').select('*')
  const dailyRows = (dailyRaw ?? []) as DailyRow[]

  // Ancora per "Giorno N" = prima partita in calendario, come /partite
  const { data: firstMatch } = await supabase
    .from('matches')
    .select('scheduled_at')
    .order('scheduled_at')
    .limit(1)
  const firstGameDate = firstMatch?.[0] ? toGameDate(firstMatch[0].scheduled_at) : null
  const todayGameDate = toGameDate(new Date().toISOString())

  const dayGroups = new Map<string, DailyRow[]>()
  for (const r of dailyRows) {
    if (!dayGroups.has(r.game_date)) dayGroups.set(r.game_date, [])
    dayGroups.get(r.game_date)!.push(r)
  }
  const days = Array.from(dayGroups, ([dateKey, rows]) => ({ dateKey, rows }))
  const lastDateKey = days.length > 0 ? days[days.length - 1].dateKey : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-2">Classifica Fanta</h1>
      <p className="text-slate-400 text-sm mb-6">
        Giocare è gratuito e aperto a tutti. Solo per aggiudicarsi il premio finale serve la
        quota di 3 €, da versare a un dirigente dell&apos;organizzazione entro il 12 luglio.
      </p>

      <LeaderboardTabs
        general={
          <>
            <div className="flex flex-col gap-3">
              {sorted.map((row, i) => (
                <div
                  key={row.user_id}
                  id={row.user_id === user?.id ? 'me' : undefined}
                  className={`flex items-center gap-4 border rounded-xl px-5 py-4 ${
                    i === 0 ? 'bg-orange-500/5 border-orange-400' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-xl font-bold text-white w-6 text-center">{i + 1}</span>
                  {i < 3 && <span className="text-xl">{MEDALS[i]}</span>}
                  <span className="flex-1 font-semibold text-white">{row.display_name}</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-400">{row.total_points}</div>
                    <div className="text-xs text-slate-500">punti</div>
                  </div>
                </div>
              ))}
            </div>

            {sorted.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p>Nessun punteggio ancora. Sii il primo a partecipare!</p>
              </div>
            )}
          </>
        }
        daily={
          days.length > 0 ? (
            <div className="space-y-6">
              {days.map(({ dateKey, rows }) => {
                const isToday = dateKey === todayGameDate
                return (
                  <DayAccordion
                    key={dateKey}
                    dayLabel={`Giorno ${firstGameDate ? dayNumber(dateKey, firstGameDate) : 1}`}
                    isToday={isToday}
                    isPast={dateKey < todayGameDate}
                    defaultOpen={dateKey === lastDateKey}
                    badge={isToday ? (
                      <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        Oggi
                      </span>
                    ) : undefined}
                  >
                    <div className="flex flex-col gap-3 mb-4">
                      {rows.map((row, i) => (
                        <div
                          key={row.user_id}
                          className={`flex items-center gap-4 border rounded-xl px-5 py-4 ${
                            i === 0 ? 'bg-orange-500/5 border-orange-400' : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <span className="text-xl font-bold text-white w-6 text-center">{i + 1}</span>
                          {i < 3 && <span className="text-xl">{MEDALS[i]}</span>}
                          <span className="flex-1 font-semibold text-white">{row.display_name}</span>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-400">{row.day_points}</div>
                            <div className="text-xs text-slate-500">punti</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DayAccordion>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <p>La classifica di giornata apparirà dopo le prime partite concluse.</p>
            </div>
          )
        }
      />

      <ScrollToMe />
    </div>
  )
}
