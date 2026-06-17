Modifiche all'header:
1. Rimuovere l'icona della coppa nell'header e lasciare solo Tito Beach Week 2026.
2. Il menu a panino attualmente presenta:
per utenti non loggati l'elenco delle pagine in colonna: Tornei, Partite, Fanta, Classifica Fanta, >accedi; 
per utenti loggati l'elenco delle pagine in colonna: Tornei, Partite, Fanta, Classifica Fanta, i miei pronostici, <nome utente>,>esci;
per admin loggati l'elenco delle pagine in colonna: Tornei, Partite, Fanta, Classifica Fanta, i miei pronostici, Calendario, Risultati, <nome utente>, >esci; 
Vorrei riorganizzare il tutto con più pulizia senza toccare l'aspetto:
per utenti non loggati non cambia nulla; 
per utenti loggati l'elenco delle pagine in colonna: Tornei, Partite, Rimuovere Fanta dato che è una pagina CTA per un'azione che l'utente ha già compiuto, Classifica Fanta, i miei pronostici, <nome utente> e >esci sulla stessa riga;
per admin loggati l'elenco delle pagine in colonna: Tornei, Partite, Rimuovere Fanta dato che è una pagina CTA per un'azione che l'utente ha già compiuto, Classifica Fanta, i miei pronostici, Calendario, Risultati, <nome utente> e >esci sulla stessa riga; 

Modifiche alla home:
1. il primo elemento è un "bottone" non cliccabile con scritto Giugno 2026, da modificare in Luglio 2026.
2. Il sottotitolo "Tre tornei di pallavolo, risultati in tempo reale e la tua chance di vincere la fantacompetizione." va cambiato in "Tre tornei sulla sabbia, risultati in tempo reale e la tua chance di vincere la fantacompetizione.
3. La card Gioca al fanta mostra 5 pt Vincitore torneo ma abbiamo cambiato il sistema aggiungendo anche pt per secondi e terzi posti indovinati, va pensata una dicitura breve e aggiornata.

Modifiche alle pagine torneo:
1. La sezione dei gironi è troppo lunga da visitare per chi partecipa ai gironi in fondo, renderei almeno le partite mostrate sotto un menu a tendina cosi da rimpicciolire il tutto.
2. La tabella dei gironi dovrebbe approntarsi ad un'altra grande modifica che ti descriverò in un'altra pagina: il risultato da registrare non è solo riguardante i set ma anche i "punti?" fatti in ognuno di quei set es. 21-15, 21-10. Lo avevo messo anche fra i criteri di classificazione in un'altra chat ma non è stato implementato.
3. La sezione Fase a eliminazione del Beach Volley 4v4 Amatoriale è stata popolata per errore dal cambio nome fatto ad una squadra tramite SQL editor, mi viene da pensare che non sia responsive quindi la ideerei come una sezione che si popolerà automaticamente col prosieguo del torneo.

Modifiche alla pagina Partite:
1. Rendere i vari Giorno 1, Giorno 2 ecc dei "menu a tendina" nascondibili per accorciare il tutto (gli ultimi giorni bisognerà scorrere tanto per vedere il calendario
2. Le partite delle Fasi a eliminazione sono state popolate per errore dal cambio nome fatto ad una squadra tramite SQL editor, mi viene da pensare che non sia responsive quindi la ideerei come una sezione che si popolerà automaticamente col prosieguo del torneo.

Modifiche alla pagina Fanta:
1. La card Sistema di punteggio va aggiornata sempre dal +5 Vincitore torneo al + 5 anche per secondi e terzi (stessa nuova dicitura della home).

Modifiche alla pagina I miei pronostici:
1. Il sottotiolo va migliorato.


Modifiche alla pagina admin Gestione calendario:
1. Il primo elemento è una riga informativa con Area Amministrazione - accesso riservato, Calendario e Risultati, possiamo rimuoverla.
2. Il sottotitolo non si è aggiornato a seguito della modifica che voleva rimuovere le info sul campo in cui si gioca la partita.
3. Applicherei lo stesso criterio fatto altrove, cioè filtrare le partite per Giornata e non per torneo.
4. Il layout attuale da smartphone nasconde completamente la squadra "away" rendendo impossibile la modifica.

Modifiche alla pagina admin Risultati:
1. Il primo elemento è una riga informativa con Area Amministrazione - accesso riservato, Calendario e Risultati, possiamo rimuoverla.
2. Va aggiornato anche il sistema che suggerisce il sottotitolo forse, Le classifiche che si aggiornano automaticamente riguardano anche la fanta competizione e i pronostici? Verifica e se è già così salta questo passaggio.
3. La card della partita fa inserire 2-0, 2-1, 1-2, 0-2 e non i punteggi dei singoli set utili ai criteri di classificazione che ti avevo detto: Punti, Numero di vittorie, Quoziente set (set vinti / set persi), Quoziente punti (punti fatti / punti subiti), Scontri diretti, Sorteggio. Va ridisegnata e resa funzionante anche nel suo scopo
 
