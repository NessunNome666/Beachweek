import type { TournamentFormat, TournamentStatus, MatchStatus } from './supabase/types'
import type { StandingRow } from './qualification'

// ─────────────────────────────────────────
// TORNEI
// ─────────────────────────────────────────
export const TOURNAMENTS = [
  {
    id: 'ama',
    slug: 'beach-volley-amatoriale',
    name: 'Beach Volley 4v4 Amatoriale',
    format: 'mixed' as TournamentFormat,
    status: 'in_progress' as TournamentStatus,
    description: '28 squadre, 7 gironi. Le migliori 16 accedono al tabellone finale.',
    predictions_locked: false,
    created_at: '',
  },
  {
    id: 'pro',
    slug: 'beach-volley-pro',
    name: 'Beach Volley 4v4 Pro',
    format: 'mixed' as TournamentFormat,
    status: 'in_progress' as TournamentStatus,
    description: '8 squadre, 2 gironi. Tutte ai quarti di finale con accoppiamenti incrociati.',
    predictions_locked: false,
    created_at: '',
  },
  {
    id: 'fv',
    slug: 'foot-volley-2v2',
    name: 'Foot Volley 2v2',
    format: 'mixed' as TournamentFormat,
    status: 'in_progress' as TournamentStatus,
    description: '16 squadre, 4 gironi. Le prime 2 per girone accedono ai quarti.',
    predictions_locked: false,
    created_at: '',
  },
]

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────
function team(id: string, name: string, tournamentId: string, group: string | null) {
  return { id, name, tournament_id: tournamentId, group_name: group, created_at: '' }
}

function match(
  id: string,
  tournamentId: string,
  phase: 'girone' | 'quarti' | 'semifinale' | 'finale' | 'terzo_posto',
  round: number,
  homeId: string | null,
  awayId: string | null,
  scoreHome: number | null,
  scoreAway: number | null,
  status: MatchStatus,
  court: string | null = null
) {
  return {
    id,
    tournament_id: tournamentId,
    phase,
    round,
    team_home_id: homeId,
    team_away_id: awayId,
    score_home: scoreHome,
    score_away: scoreAway,
    scheduled_at: '2026-06-12T10:00:00Z',
    status,
    court,
  }
}

// ─────────────────────────────────────────
// TORNEO 1 — BEACH VOLLEY AMATORIALE
// 7 gironi (A→G), 4 squadre ciascuno
// ─────────────────────────────────────────
export const TEAMS_AMA = [
  // Girone A
  team('a1', 'Squadra A1', 'ama', 'Girone A'), team('a2', 'Squadra A2', 'ama', 'Girone A'),
  team('a3', 'Squadra A3', 'ama', 'Girone A'), team('a4', 'Squadra A4', 'ama', 'Girone A'),
  // Girone B
  team('b1', 'Squadra B1', 'ama', 'Girone B'), team('b2', 'Squadra B2', 'ama', 'Girone B'),
  team('b3', 'Squadra B3', 'ama', 'Girone B'), team('b4', 'Squadra B4', 'ama', 'Girone B'),
  // Girone C
  team('c1', 'Squadra C1', 'ama', 'Girone C'), team('c2', 'Squadra C2', 'ama', 'Girone C'),
  team('c3', 'Squadra C3', 'ama', 'Girone C'), team('c4', 'Squadra C4', 'ama', 'Girone C'),
  // Girone D
  team('d1', 'Squadra D1', 'ama', 'Girone D'), team('d2', 'Squadra D2', 'ama', 'Girone D'),
  team('d3', 'Squadra D3', 'ama', 'Girone D'), team('d4', 'Squadra D4', 'ama', 'Girone D'),
  // Girone E
  team('e1', 'Squadra E1', 'ama', 'Girone E'), team('e2', 'Squadra E2', 'ama', 'Girone E'),
  team('e3', 'Squadra E3', 'ama', 'Girone E'), team('e4', 'Squadra E4', 'ama', 'Girone E'),
  // Girone F
  team('f1', 'Squadra F1', 'ama', 'Girone F'), team('f2', 'Squadra F2', 'ama', 'Girone F'),
  team('f3', 'Squadra F3', 'ama', 'Girone F'), team('f4', 'Squadra F4', 'ama', 'Girone F'),
  // Girone G
  team('g1', 'Squadra G1', 'ama', 'Girone G'), team('g2', 'Squadra G2', 'ama', 'Girone G'),
  team('g3', 'Squadra G3', 'ama', 'Girone G'), team('g4', 'Squadra G4', 'ama', 'Girone G'),
]

export const MATCHES_AMA = [
  // Girone A (round-robin: 6 partite)
  match('ma1',  'ama','girone',1,'a1','a2',2,0,'completed','Campo 1'),
  match('ma2',  'ama','girone',1,'a3','a4',2,1,'completed','Campo 2'),
  match('ma3',  'ama','girone',2,'a1','a3',2,1,'completed','Campo 1'),
  match('ma4',  'ama','girone',2,'a2','a4',2,0,'completed','Campo 2'),
  match('ma5',  'ama','girone',3,'a1','a4',null,null,'scheduled','Campo 1'),
  match('ma6',  'ama','girone',3,'a2','a3',null,null,'scheduled','Campo 2'),
  // Girone B
  match('mb1',  'ama','girone',1,'b1','b2',2,1,'completed','Campo 3'),
  match('mb2',  'ama','girone',1,'b3','b4',0,2,'completed','Campo 4'),
  match('mb3',  'ama','girone',2,'b1','b3',2,0,'completed','Campo 3'),
  match('mb4',  'ama','girone',2,'b2','b4',1,2,'completed','Campo 4'),
  match('mb5',  'ama','girone',3,'b1','b4',null,null,'scheduled','Campo 3'),
  match('mb6',  'ama','girone',3,'b2','b3',null,null,'scheduled','Campo 4'),
  // Girone C
  match('mc1',  'ama','girone',1,'c1','c2',2,0,'completed','Campo 1'),
  match('mc2',  'ama','girone',1,'c3','c4',2,1,'completed','Campo 2'),
  match('mc3',  'ama','girone',2,'c1','c3',1,2,'completed','Campo 1'),
  match('mc4',  'ama','girone',2,'c2','c4',2,0,'completed','Campo 2'),
  match('mc5',  'ama','girone',3,'c1','c4',null,null,'scheduled','Campo 1'),
  match('mc6',  'ama','girone',3,'c2','c3',null,null,'scheduled','Campo 2'),
  // Girone D
  match('md1',  'ama','girone',1,'d1','d2',2,1,'completed','Campo 3'),
  match('md2',  'ama','girone',1,'d3','d4',2,0,'completed','Campo 4'),
  match('md3',  'ama','girone',2,'d1','d3',2,0,'completed','Campo 3'),
  match('md4',  'ama','girone',2,'d2','d4',1,2,'completed','Campo 4'),
  match('md5',  'ama','girone',3,'d1','d4',null,null,'scheduled','Campo 3'),
  match('md6',  'ama','girone',3,'d2','d3',null,null,'scheduled','Campo 4'),
  // Girone E
  match('me1',  'ama','girone',1,'e1','e2',0,2,'completed','Campo 1'),
  match('me2',  'ama','girone',1,'e3','e4',2,1,'completed','Campo 2'),
  match('me3',  'ama','girone',2,'e1','e3',1,2,'completed','Campo 1'),
  match('me4',  'ama','girone',2,'e2','e4',2,0,'completed','Campo 2'),
  match('me5',  'ama','girone',3,'e1','e4',null,null,'scheduled','Campo 1'),
  match('me6',  'ama','girone',3,'e2','e3',null,null,'scheduled','Campo 2'),
  // Girone F
  match('mf1',  'ama','girone',1,'f1','f2',2,0,'completed','Campo 3'),
  match('mf2',  'ama','girone',1,'f3','f4',2,0,'completed','Campo 4'),
  match('mf3',  'ama','girone',2,'f1','f3',2,1,'completed','Campo 3'),
  match('mf4',  'ama','girone',2,'f2','f4',2,1,'completed','Campo 4'),
  match('mf5',  'ama','girone',3,'f1','f4',null,null,'scheduled','Campo 3'),
  match('mf6',  'ama','girone',3,'f2','f3',null,null,'scheduled','Campo 4'),
  // Girone G
  match('mg1',  'ama','girone',1,'g1','g2',2,1,'completed','Campo 1'),
  match('mg2',  'ama','girone',1,'g3','g4',1,2,'completed','Campo 2'),
  match('mg3',  'ama','girone',2,'g1','g3',2,0,'completed','Campo 1'),
  match('mg4',  'ama','girone',2,'g2','g4',2,1,'completed','Campo 2'),
  match('mg5',  'ama','girone',3,'g1','g4',null,null,'scheduled','Campo 1'),
  match('mg6',  'ama','girone',3,'g2','g3',null,null,'scheduled','Campo 2'),
  // Fase eliminazione: non ancora disponibile (sorteggio dal vivo)
]

// Classifiche parziali (dopo round 1-2, round 3 non ancora giocato)
export const STANDINGS_AMA: StandingRow[] = [
  // Girone A: A1 primo, A3 secondo, A2 terza
  { team_id:'a1', team_name:'Squadra A1', group_name:'Girone A', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:84, points_conceded:42, points:6 },
  { team_id:'a3', team_name:'Squadra A3', group_name:'Girone A', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:3, sets_lost:2, points_scored:63, points_conceded:58, points:3 },
  { team_id:'a2', team_name:'Squadra A2', group_name:'Girone A', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:2, points_scored:55, points_conceded:60, points:2 },
  { team_id:'a4', team_name:'Squadra A4', group_name:'Girone A', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:1, sets_lost:4, points_scored:40, points_conceded:82, points:1 },
  // Girone B: B1 primo, B4 secondo, B2 terza
  { team_id:'b1', team_name:'Squadra B1', group_name:'Girone B', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:80, points_conceded:50, points:5 },
  { team_id:'b4', team_name:'Squadra B4', group_name:'Girone B', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:3, sets_lost:2, points_scored:62, points_conceded:55, points:3 },
  { team_id:'b2', team_name:'Squadra B2', group_name:'Girone B', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:3, points_scored:57, points_conceded:62, points:3 },
  { team_id:'b3', team_name:'Squadra B3', group_name:'Girone B', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:0, sets_lost:4, points_scored:38, points_conceded:70, points:0 },
  // Girone C: C3 primo, C2 secondo, C1 terza (capovolgimento!)
  { team_id:'c3', team_name:'Squadra C3', group_name:'Girone C', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:79, points_conceded:45, points:5 },
  { team_id:'c2', team_name:'Squadra C2', group_name:'Girone C', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:3, sets_lost:2, points_scored:65, points_conceded:58, points:3 },
  { team_id:'c1', team_name:'Squadra C1', group_name:'Girone C', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:3, points_scored:58, points_conceded:65, points:3 },
  { team_id:'c4', team_name:'Squadra C4', group_name:'Girone C', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:1, sets_lost:4, points_scored:42, points_conceded:76, points:1 },
  // Girone D: D1 primo, D3 secondo, D4 terza
  { team_id:'d1', team_name:'Squadra D1', group_name:'Girone D', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:0, points_scored:84, points_conceded:38, points:6 },
  { team_id:'d3', team_name:'Squadra D3', group_name:'Girone D', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:2, points_scored:60, points_conceded:60, points:2 },
  { team_id:'d4', team_name:'Squadra D4', group_name:'Girone D', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:2, points_scored:58, points_conceded:62, points:2 },
  { team_id:'d2', team_name:'Squadra D2', group_name:'Girone D', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:0, sets_lost:4, points_scored:36, points_conceded:78, points:0 },
  // Girone E: E2 primo, E3 secondo, E4 terza
  { team_id:'e2', team_name:'Squadra E2', group_name:'Girone E', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:82, points_conceded:48, points:5 },
  { team_id:'e3', team_name:'Squadra E3', group_name:'Girone E', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:3, sets_lost:2, points_scored:66, points_conceded:57, points:3 },
  { team_id:'e4', team_name:'Squadra E4', group_name:'Girone E', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:2, points_scored:57, points_conceded:61, points:2 },
  { team_id:'e1', team_name:'Squadra E1', group_name:'Girone E', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:1, sets_lost:4, points_scored:44, points_conceded:83, points:1 },
  // Girone F: F1 primo, F3 secondo, F2 terza
  { team_id:'f1', team_name:'Squadra F1', group_name:'Girone F', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:83, points_conceded:47, points:5 },
  { team_id:'f3', team_name:'Squadra F3', group_name:'Girone F', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:2, points_scored:60, points_conceded:62, points:2 },
  { team_id:'f2', team_name:'Squadra F2', group_name:'Girone F', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:3, points_scored:59, points_conceded:65, points:3 },
  { team_id:'f4', team_name:'Squadra F4', group_name:'Girone F', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:1, sets_lost:3, points_scored:44, points_conceded:72, points:1 },
  // Girone G: G1 primo, G2 secondo, G4 terza
  { team_id:'g1', team_name:'Squadra G1', group_name:'Girone G', tournament_id:'ama', matches_played:2, wins:2, losses:0, sets_won:4, sets_lost:1, points_scored:80, points_conceded:50, points:5 },
  { team_id:'g2', team_name:'Squadra G2', group_name:'Girone G', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:3, sets_lost:2, points_scored:68, points_conceded:59, points:4 },
  { team_id:'g4', team_name:'Squadra G4', group_name:'Girone G', tournament_id:'ama', matches_played:2, wins:1, losses:1, sets_won:2, sets_lost:3, points_scored:57, points_conceded:66, points:3 },
  { team_id:'g3', team_name:'Squadra G3', group_name:'Girone G', tournament_id:'ama', matches_played:2, wins:0, losses:2, sets_won:1, sets_lost:4, points_scored:43, points_conceded:73, points:1 },
]

// ─────────────────────────────────────────
// TORNEO 2 — BEACH VOLLEY PRO
// 2 gironi (A, B), 4 squadre ciascuno
// ─────────────────────────────────────────
export const TEAMS_PRO = [
  team('pa1','Pro A1','pro','Girone A'), team('pa2','Pro A2','pro','Girone A'),
  team('pa3','Pro A3','pro','Girone A'), team('pa4','Pro A4','pro','Girone A'),
  team('pb1','Pro B1','pro','Girone B'), team('pb2','Pro B2','pro','Girone B'),
  team('pb3','Pro B3','pro','Girone B'), team('pb4','Pro B4','pro','Girone B'),
]

export const MATCHES_PRO = [
  // Girone A
  match('mpa1','pro','girone',1,'pa1','pa2',2,0,'completed','Campo 1'),
  match('mpa2','pro','girone',1,'pa3','pa4',2,1,'completed','Campo 2'),
  match('mpa3','pro','girone',2,'pa1','pa3',2,1,'completed','Campo 1'),
  match('mpa4','pro','girone',2,'pa2','pa4',0,2,'completed','Campo 2'),
  match('mpa5','pro','girone',3,'pa1','pa4',null,null,'scheduled','Campo 1'),
  match('mpa6','pro','girone',3,'pa2','pa3',null,null,'scheduled','Campo 2'),
  // Girone B
  match('mpb1','pro','girone',1,'pb1','pb2',1,2,'completed','Campo 3'),
  match('mpb2','pro','girone',1,'pb3','pb4',2,0,'completed','Campo 4'),
  match('mpb3','pro','girone',2,'pb1','pb3',2,1,'completed','Campo 3'),
  match('mpb4','pro','girone',2,'pb2','pb4',2,1,'completed','Campo 4'),
  match('mpb5','pro','girone',3,'pb1','pb4',null,null,'scheduled','Campo 3'),
  match('mpb6','pro','girone',3,'pb2','pb3',null,null,'scheduled','Campo 4'),
  // Quarti (slot vuoti — accoppiamenti calcolati dalla classifica finale)
  match('mpq1','pro','quarti',1,null,null,null,null,'scheduled','Campo 1'),
  match('mpq2','pro','quarti',1,null,null,null,null,'scheduled','Campo 2'),
  match('mpq3','pro','quarti',1,null,null,null,null,'scheduled','Campo 3'),
  match('mpq4','pro','quarti',1,null,null,null,null,'scheduled','Campo 4'),
]

export const STANDINGS_PRO: StandingRow[] = [
  // Girone A
  { team_id:'pa1',team_name:'Pro A1',group_name:'Girone A',tournament_id:'pro',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:83,points_conceded:47,points:5 },
  { team_id:'pa4',team_name:'Pro A4',group_name:'Girone A',tournament_id:'pro',matches_played:2,wins:1,losses:1,sets_won:3,sets_lost:2,points_scored:64,points_conceded:58,points:3 },
  { team_id:'pa3',team_name:'Pro A3',group_name:'Girone A',tournament_id:'pro',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:3,points_scored:58,points_conceded:64,points:3 },
  { team_id:'pa2',team_name:'Pro A2',group_name:'Girone A',tournament_id:'pro',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:44,points_conceded:80,points:1 },
  // Girone B
  { team_id:'pb2',team_name:'Pro B2',group_name:'Girone B',tournament_id:'pro',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:80,points_conceded:50,points:5 },
  { team_id:'pb1',team_name:'Pro B1',group_name:'Girone B',tournament_id:'pro',matches_played:2,wins:1,losses:1,sets_won:3,sets_lost:2,points_scored:65,points_conceded:60,points:4 },
  { team_id:'pb3',team_name:'Pro B3',group_name:'Girone B',tournament_id:'pro',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:2,points_scored:57,points_conceded:62,points:2 },
  { team_id:'pb4',team_name:'Pro B4',group_name:'Girone B',tournament_id:'pro',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:43,points_conceded:73,points:1 },
]

// ─────────────────────────────────────────
// TORNEO 3 — FOOT VOLLEY 2v2
// 4 gironi (A→D), 4 squadre ciascuno
// ─────────────────────────────────────────
export const TEAMS_FV = [
  team('fva1','FV A1','fv','Girone A'), team('fva2','FV A2','fv','Girone A'),
  team('fva3','FV A3','fv','Girone A'), team('fva4','FV A4','fv','Girone A'),
  team('fvb1','FV B1','fv','Girone B'), team('fvb2','FV B2','fv','Girone B'),
  team('fvb3','FV B3','fv','Girone B'), team('fvb4','FV B4','fv','Girone B'),
  team('fvc1','FV C1','fv','Girone C'), team('fvc2','FV C2','fv','Girone C'),
  team('fvc3','FV C3','fv','Girone C'), team('fvc4','FV C4','fv','Girone C'),
  team('fvd1','FV D1','fv','Girone D'), team('fvd2','FV D2','fv','Girone D'),
  team('fvd3','FV D3','fv','Girone D'), team('fvd4','FV D4','fv','Girone D'),
]

export const MATCHES_FV = [
  // Girone A
  match('mfva1','fv','girone',1,'fva1','fva2',2,0,'completed','Campo 1'),
  match('mfva2','fv','girone',1,'fva3','fva4',2,1,'completed','Campo 2'),
  match('mfva3','fv','girone',2,'fva1','fva3',2,1,'completed','Campo 1'),
  match('mfva4','fv','girone',2,'fva2','fva4',2,0,'completed','Campo 2'),
  match('mfva5','fv','girone',3,'fva1','fva4',null,null,'scheduled','Campo 1'),
  match('mfva6','fv','girone',3,'fva2','fva3',null,null,'scheduled','Campo 2'),
  // Girone B
  match('mfvb1','fv','girone',1,'fvb1','fvb2',1,2,'completed','Campo 3'),
  match('mfvb2','fv','girone',1,'fvb3','fvb4',2,0,'completed','Campo 4'),
  match('mfvb3','fv','girone',2,'fvb1','fvb3',2,0,'completed','Campo 3'),
  match('mfvb4','fv','girone',2,'fvb2','fvb4',2,1,'completed','Campo 4'),
  match('mfvb5','fv','girone',3,'fvb1','fvb4',null,null,'scheduled','Campo 3'),
  match('mfvb6','fv','girone',3,'fvb2','fvb3',null,null,'scheduled','Campo 4'),
  // Girone C
  match('mfvc1','fv','girone',1,'fvc1','fvc2',2,1,'completed','Campo 1'),
  match('mfvc2','fv','girone',1,'fvc3','fvc4',0,2,'completed','Campo 2'),
  match('mfvc3','fv','girone',2,'fvc1','fvc3',2,0,'completed','Campo 1'),
  match('mfvc4','fv','girone',2,'fvc2','fvc4',2,1,'completed','Campo 2'),
  match('mfvc5','fv','girone',3,'fvc1','fvc4',null,null,'scheduled','Campo 1'),
  match('mfvc6','fv','girone',3,'fvc2','fvc3',null,null,'scheduled','Campo 2'),
  // Girone D
  match('mfvd1','fv','girone',1,'fvd1','fvd2',2,0,'completed','Campo 3'),
  match('mfvd2','fv','girone',1,'fvd3','fvd4',2,1,'completed','Campo 4'),
  match('mfvd3','fv','girone',2,'fvd1','fvd3',1,2,'completed','Campo 3'),
  match('mfvd4','fv','girone',2,'fvd2','fvd4',0,2,'completed','Campo 4'),
  match('mfvd5','fv','girone',3,'fvd1','fvd4',null,null,'scheduled','Campo 3'),
  match('mfvd6','fv','girone',3,'fvd2','fvd3',null,null,'scheduled','Campo 4'),
  // Quarti (slot vuoti)
  match('mfvq1','fv','quarti',1,null,null,null,null,'scheduled','Campo 1'),
  match('mfvq2','fv','quarti',1,null,null,null,null,'scheduled','Campo 2'),
  match('mfvq3','fv','quarti',1,null,null,null,null,'scheduled','Campo 3'),
  match('mfvq4','fv','quarti',1,null,null,null,null,'scheduled','Campo 4'),
]

export const STANDINGS_FV: StandingRow[] = [
  // Girone A
  { team_id:'fva1',team_name:'FV A1',group_name:'Girone A',tournament_id:'fv',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:55,points_conceded:28,points:5 },
  { team_id:'fva3',team_name:'FV A3',group_name:'Girone A',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:3,sets_lost:2,points_scored:42,points_conceded:38,points:3 },
  { team_id:'fva2',team_name:'FV A2',group_name:'Girone A',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:2,points_scored:38,points_conceded:40,points:2 },
  { team_id:'fva4',team_name:'FV A4',group_name:'Girone A',tournament_id:'fv',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:25,points_conceded:54,points:1 },
  // Girone B
  { team_id:'fvb2',team_name:'FV B2',group_name:'Girone B',tournament_id:'fv',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:52,points_conceded:30,points:5 },
  { team_id:'fvb1',team_name:'FV B1',group_name:'Girone B',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:2,points_scored:40,points_conceded:42,points:3 },
  { team_id:'fvb3',team_name:'FV B3',group_name:'Girone B',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:2,points_scored:38,points_conceded:40,points:3 },
  { team_id:'fvb4',team_name:'FV B4',group_name:'Girone B',tournament_id:'fv',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:26,points_conceded:44,points:1 },
  // Girone C
  { team_id:'fvc1',team_name:'FV C1',group_name:'Girone C',tournament_id:'fv',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:51,points_conceded:29,points:5 },
  { team_id:'fvc2',team_name:'FV C2',group_name:'Girone C',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:3,sets_lost:2,points_scored:44,points_conceded:36,points:4 },
  { team_id:'fvc4',team_name:'FV C4',group_name:'Girone C',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:3,points_scored:36,points_conceded:44,points:2 },
  { team_id:'fvc3',team_name:'FV C3',group_name:'Girone C',tournament_id:'fv',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:27,points_conceded:49,points:1 },
  // Girone D
  { team_id:'fvd3',team_name:'FV D3',group_name:'Girone D',tournament_id:'fv',matches_played:2,wins:2,losses:0,sets_won:4,sets_lost:1,points_scored:53,points_conceded:31,points:5 },
  { team_id:'fvd4',team_name:'FV D4',group_name:'Girone D',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:2,points_scored:41,points_conceded:41,points:2 },
  { team_id:'fvd1',team_name:'FV D1',group_name:'Girone D',tournament_id:'fv',matches_played:2,wins:1,losses:1,sets_won:2,sets_lost:3,points_scored:38,points_conceded:43,points:3 },
  { team_id:'fvd2',team_name:'FV D2',group_name:'Girone D',tournament_id:'fv',matches_played:2,wins:0,losses:2,sets_won:1,sets_lost:4,points_scored:24,points_conceded:41,points:1 },
]

// ─────────────────────────────────────────
// AGGREGATI (per le parti del codice che usano array generici)
// ─────────────────────────────────────────
export const TEAMS = [...TEAMS_AMA, ...TEAMS_PRO, ...TEAMS_FV]
export const MATCHES = [...MATCHES_AMA, ...MATCHES_PRO, ...MATCHES_FV]
export const STANDINGS = [...STANDINGS_AMA, ...STANDINGS_PRO, ...STANDINGS_FV]

// Classifica fanta mock
export const FANTA_LEADERBOARD = [
  { user_id:'u1', display_name:'Marco R.', match_points:9, winner_points:0, total_points:9, correct_exact:2, correct_winner:3 },
  { user_id:'u2', display_name:'Sara L.', match_points:7, winner_points:5, total_points:12, correct_exact:1, correct_winner:4 },
  { user_id:'u3', display_name:'Luca M.', match_points:6, winner_points:5, total_points:11, correct_exact:2, correct_winner:2 },
  { user_id:'u4', display_name:'Giulia T.', match_points:4, winner_points:0, total_points:4, correct_exact:0, correct_winner:4 },
  { user_id:'u5', display_name:'Paolo V.', match_points:3, winner_points:0, total_points:3, correct_exact:1, correct_winner:1 },
]
