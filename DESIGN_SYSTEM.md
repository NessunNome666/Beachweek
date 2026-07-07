# Design System — Tito Beach Week 2026

Canone unico della UI, **applicato a tutto il codice il 2026-07-07**. Ogni nuova superficie o
modifica deve usare questi token; se un valore non è qui dentro, probabilmente non va usato.

Decisioni prese con l'utente (2026-07-07, non riproporre alternative):
1. **Un solo accento**: `orange-400`. L'ambra (`amber-*`) e il giallo (`yellow-*`) sono banditi.
2. **Una sola pelle card**: `bg-slate-900 + border-slate-800`. La variante chiara `slate-800/60`
   non esiste più come superficie card.
3. **Font BeachWeek solo dov'è**: `h1` (automatico via globals.css) e nomi girone
   (`.font-heading`). Non estenderlo ad altri titoli.

---

## 1. Fondamenta

### 1.1 Font

| Ruolo | Font | Dove |
|---|---|---|
| Display | **BeachWeek** (`--font-beachweek`, woff2 locale) | `h1` e `.font-heading` (globals.css forza `uppercase`, `letter-spacing 0.03em`, `font-synthesis: none` — solo glifi maiuscoli, un solo peso) |
| Testo | **Geist** (`--font-geist`) | Tutto il resto |
| Numerico | `font-mono` | Punteggi, parziali, percentuali, conteggi |

### 1.2 Palette

**Sfondo app** (globals.css): `#0d0520` + radial-gradient `#2a0e5c → #0d0520`, fixed.
È lo stesso colore di header sticky (`bg-[#0d0520]/95`) e menu overlay (`bg-[#0d0520]/97`).

**Superfici**:

| Livello | Classi | Uso |
|---|---|---|
| Card | `bg-slate-900 border border-slate-800 rounded-xl` | Ogni card di contenuto |
| Annidato | `bg-slate-800` (bordo `border-slate-700` se serve) | Pillola punteggio, thead tabelle, input, bottoni secondari, chip |
| Card "spenta" | `bg-slate-900/60` | Card deck bloccate |

**Accento unico**:

| Token | Uso |
|---|---|
| `orange-400` | Identità E azione: titoli sezione, navbar attiva, punti, selezioni, bottoni Salva/Conferma (`text-slate-900` sopra), focus input, badge Oggi/Rinviata, bordo elemento corrente/leader |
| `hover:bg-orange-300` | Hover dei bottoni pieni |
| Gradiente `from-red-600 to-orange-500` | SOLO CTA hero (home, login, Vota MVP, unauthorized, InstallBanner) + barra risultati MVP in versione `/25` |

**Semantici**:

| Colore | Significato |
|---|---|
| `green-400/500` | Successo/salvato (`bg-green-500/20 text-green-400`), qualificata (badge Q), partita live (dot pulse) |
| `red-400` | Errori, pronostico sbagliato |
| `blue-400` | Dot "In programma" |
| `orange-400` | Rinviata (MAI rossa: il rosso è errore) |

**Testo**:

| Classe | Ruolo |
|---|---|
| `text-white` | Titoli, contenuto primario, nome vincente |
| `text-slate-300` | Corpo dentro le card, nomi squadra neutri |
| `text-slate-400` | Descrizioni sotto i titoli, label form, secondario |
| `text-slate-500` | Meta (orari, fasi, "vs", conteggi), empty state |
| `text-slate-600/700` | Disattivato / passato |

### 1.3 Raggi

| Raggio | Uso |
|---|---|
| `rounded-full` | CTA hero e coppie di bottoni hero, badge pillola, dot, icon button |
| `rounded-xl` | Card (tutte — `rounded-2xl` non si usa) |
| `rounded-lg` | Bottoni normali, input/select, ScoreButtons, accordion-card, pillola punteggio |
| `rounded` | Chip tabella (Q / —) |

### 1.4 Layout pagina

`max-w-{X} mx-auto px-4 py-6` + `h1` `text-3xl font-bold text-white mb-6` (anche admin).

| Larghezza | Pagine |
|---|---|
| `max-w-2xl` | Colonna singola: tornei, fanta, classifica, mvp, login, admin/mvp |
| `max-w-3xl` | Liste partite: partite, pronostici, admin/partite, admin/calendario, sorteggio |
| `max-w-6xl` | Solo griglia gironi (tornei/[slug]) |

Sezioni: `mb-12` tra i blocchi. Liste di card: `gap-3` / `space-y-3` (righe compatte `space-y-2`).
Header con sottotitolo (login, mvp): `h1 mb-2` + `p text-slate-400 text-sm` (+`mb-6` prima del contenuto).

### 1.5 Tipografia dei titoli

| Livello | Stile |
|---|---|
| h1 pagina | BeachWeek auto, `text-3xl font-bold text-white mb-6` |
| Eyebrow di sezione | `text-xs font-bold uppercase tracking-widest text-orange-400 mb-4` (anche sopra l'h1 in /mvp) |
| h2 di contenuto | `text-lg font-bold text-white` (nomi torneo in sorteggio) |
| h3 nome girone | `font-heading font-bold text-lg text-slate-300` (unico uso di BeachWeek fuori dagli h1) |
| h3 fase eliminazione | `font-bold text-lg` (Geist, bianco) |
| Meta/timestamp | `text-xs text-slate-500` |
| Separatore "vs" | `text-xs text-slate-500` |

### 1.6 Icone

**lucide-react** ovunque, MAI glifi testuali (▲▼ vietati). Chevron accordion: `ChevronDown` +
`rotate-180` quando aperto (`transition-transform`). Taglie: 12–16 inline, 16–18 bottoni,
18 auth navbar, 28 hamburger, 48–56 illustrative.

### 1.7 Feedback (pattern fissi)

- **Salvataggio**: `<Loader2 className="animate-spin"/> Salvataggio…`
- **Salvato**: bottone → `bg-green-500/20 text-green-400` + `<Check/>` + testo **"Salvato"**
  (secco: niente "!", niente code)
- **Errore**: `<p className="flex items-center gap-1.5 text-red-400 text-xs"><AlertCircle size={12}/> …</p>`
- **Empty state**: `text-center py-16 text-slate-500`
- **Disabilitato**: `disabled:opacity-40`

---

## 2. Componenti

### Bottoni — gerarchia a 3 livelli
1. **Hero**: `bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-full
   hover:opacity-90 transition-opacity` (home, login, Vota MVP, unauthorized). Anche i compagni
   di riga di un bottone hero sono `rounded-full` (es. Annulla in MvpVoteForm).
2. **Primario**: `bg-orange-400 text-slate-900 hover:bg-orange-300 rounded-lg text-sm
   font-semibold transition-colors` (Salva, Conferma, Attiva, Aggiungi).
3. **Secondario**: `bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg`.
Ghost/testuale: `text-slate-400 hover:text-orange-400` (o `hover:text-red-400` se distruttivo)
con icona 12px. Icon button: `p-2 rounded-full bg-slate-800 text-slate-300`.

### Pillola toggle (stato on/off persistente)
`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm
font-semibold transition-colors` — **off**: `bg-slate-900 border-slate-800 text-slate-400`;
**on**: `bg-orange-500/15 border-orange-400 text-white` con icona `text-orange-400`.
Usi: riga sotto l'h1 di /pronostici con **Notifiche** (Bell → BellRing,
`NotificationOptIn variant="compact"`; il tap su stato denied/need-install mostra l'hint sotto)
e **Giocatori** (EyeOff → Eye, comanda le rose del deck via store condiviso
`PlayersVisibility.tsx`). Variante icona-sola: occhio 13px nel thead di GironeTable.
Lo stesso schema on/off vale per i bottoni-stato MVP (candidato selezionato, stato votazione).

### MatchCard (pubblica)
`bg-slate-900 border-slate-800 rounded-xl px-4 py-3`. Meta `text-xs text-slate-500`
(fase — Round N | dot + stato). Punteggio in pillola `font-mono font-bold text-lg bg-slate-800
rounded-lg min-w-[5rem]`. Vincente `text-white`, altra `text-slate-300`, nomi mai troncati.
Stati: In programma (dot blu), In corso (dot verde pulse + testo verde), Conclusa (dot verde),
Rinviata (dot + testo orange).

### Card form (fanta + admin)
Card standard con bordo di stato: `border-orange-400` (corrente/attenzione),
`border-green-800/50`÷`green-700/40` (salvato), `border-orange-500/30-40` (rinviata).

### Accordion — due pattern, entrambi con ChevronDown lucide rotate-180
1. **Section-accordion** (riga nuda): DayAccordion, ResultsCollapse. Titolo `text-lg font-bold`,
   aperto `text-orange-400`, chiuso `text-slate-400`, passato `text-slate-600`. Chevron 16px
   stesso schema colore.
2. **Card-accordion** (inscatolato): GroupMatchesAccordion (`bg-slate-900 border-slate-800
   rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200`, chevron 14px),
   AdminCalendarioForm (card espandibile).

### Tabelle (GironeTable = riferimento; terze piazzate identica)
Wrapper `overflow-x-auto rounded-xl border border-slate-800`. Thead `bg-slate-800 text-slate-400
text-xs uppercase tracking-wide`, celle `px-3/px-2 py-2.5`, righe `border-t border-slate-800
hover:bg-slate-800/40`. Colonna Pt: header e valori `text-orange-400` (valori `font-bold`).
**Qualificate**: niente chip (le Q verdi e i — sono stati rimossi) — le righe qualificate sono
evidenziate con `bg-orange-500/10` e bordi `border-orange-400/50` sopra/sotto il blocco
(nessuna evidenza quando tutte qualificano, es. Pro). **Rose**: occhio EyeOff/Eye 13px nel thead
accanto a "Squadra" (solo se esistono dati), mostra le sotto-righe giocatori di tutto il girone
(`text-xs text-slate-400`, mai troncate, tinte orange se la riga è qualificata).

### Badge pillola
`text-xs font-semibold px-2 py-0.5 rounded-full` — Oggi: `bg-orange-500/20 text-orange-400`.
"In corso" (admin, partita corrente): dot verde pulse + `text-green-400` come nella MatchCard.
Micro-badge (`text-[10px] font-bold`): "Il tuo voto" orange, "Bloccato" slate.

### Input / select
`bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none
focus:border-orange-400 transition-colors`. Login (form full-page): `px-4 py-3`, stesso raggio.
Label: `block text-xs text-slate-400 mb-1/2` (`font-semibold` opzionale).

### Navbar
Header `h-16 px-5`; sticky `bg-[#0d0520]/95 backdrop-blur border-b border-slate-800/50`
(assoluto trasparente solo in home). Overlay menu `bg-[#0d0520]/97`. TUTTE le voci (pubbliche e
admin): `text-base py-4 border-t border-slate-700/60`, riposo `text-white hover:text-orange-400`,
attiva `text-orange-400 font-semibold`. Il gruppo admin è introdotto dall'etichetta
`Admin` in `text-[10px] font-bold uppercase tracking-widest text-slate-500`. Icone auth 18px.

---

## 3. Registro incoerenze — risolte il 2026-07-07

25 incoerenze rilevate nell'audit (A1–L2) e chiuse in un'unica passata:

- **A1–A4** accenti: ambra/giallo/3 gradienti/arancio pieno → tutto su orange-400 + gradiente unico
- **B1–B3** superfici: pelle unica slate-900/800, `rounded-2xl` eliminato, overlay `#0d0520`
- **C1–C4** titoli: eyebrow unico text-xs, h1 3xl anche admin, "vs" unico, BeachWeek solo dov'era
- **D1–D3** bottoni: gerarchia a 3, gradiente sempre rounded-full, "Conferma pronostico" ora primario
- **E1–E3** form: focus orange ovunque (aggiunto ai select sorteggio), input rounded-lg, errore login con icona
- **F1–F3** accordion: 2 pattern definiti, chevron lucide ovunque, colori stato apertura unificati
- **G1–G5** stati: Rinviata sempre orange (mai rossa), "In corso" admin = dot verde pulse come pubblico, badge Oggi anche in admin/calendario, chip — unificato, tabella terze = pelle GironeTable
- **H1–H3** testi: "Vedi i tornei" ovunque, descrizioni slate-400, "Salvato" secco
- **I1–I2** layout: `px-4 py-6` + h1 `mb-6` ovunque, admin da 4xl a 3xl, empty state unico `py-16`
- **L1–L2** navbar: voci admin = stesso schema colore + etichetta di gruppo, icone auth 18px

Ritocchi della seconda passata (stesso giorno, su indicazione dell'utente):
- banner notifiche di /pronostici → pillola toggle compatta, affiancata dalla nuova pillola
  **Giocatori** (occhio) che sostituisce il bottone Users nell'header del deck
- rose nei gironi: occhio nel thead al posto dei chevron per riga (mostra tutto il girone)
- qualificazione nelle tabelle: righe evidenziate in accent al posto dei chip Q/—;
  colonna "Stato" e sottotitolo rimossi dalla classifica terze

Nota: `PredictionsBatchForm.tsx` conserva classi pre-canone perché è un file di solo rollback,
mai renderizzato. Se venisse riattivato, va prima allineato al canone.
