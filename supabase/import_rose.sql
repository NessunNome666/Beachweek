-- ════════════════════════════════════════════════════════════════════════
-- IMPORT ROSE — Tito Beach Week 2026 (generato dalla distinta CSV 2026-07-07)
-- Da eseguire UNA VOLTA nell'SQL Editor (migration 010 già applicata).
-- Rieseguibile senza danni: sovrascrive semplicemente le rose.
--
-- Nomi in formato "Nome Cognome", ordinati alfabeticamente.
-- Esclusi i settimi/ottavi annotati nel CSV (max 6 a referto da regolamento):
--   A' T'NIT NA CASA: Sofia Spera · TENUTA CARUSO (le riserve): Cristiano
--   Tullipani · TENUTA CARUSO DREAM TEAM: Linda Rosalinda Nicastro ·
--   ACCSCI FORT: Domenico Guglione · LAURENZANA 2.0: Antonio Carlucci,
--   Giuseppe Criscio
-- DYNAMIKA: nel CSV c'è un sesto "Di Senso" senza nome di battesimo — omesso.
-- ════════════════════════════════════════════════════════════════════════
BEGIN;

-- ── Beach Volley 4v4 Amatoriale ──

UPDATE teams SET players = ARRAY['Antonio Pagano', 'Gabriele Colangelo', 'Gerardo Criscio', 'Nicole Buongermino', 'Rocco Fiore']
WHERE name = 'GIO DONATI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Christian Salvatore', 'Francesco Montano', 'Lorenzo Stigliano', 'Michela Carbone', 'Renato Valente']
WHERE name = '3 UOMINI E 1 DONNA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Alessandro Caterino', 'Antonio La Torre', 'Antonio Sabia', 'Giulia Fatigante', 'Paola Salvatore', 'Pierlorenzo Sigliano']
WHERE name = 'D&P INSTALLAZIONI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Alessandro Viglione', 'Angelo Galasso', 'Fabrizio Cerbasi', 'Fiorella Fiore', 'Stefania Belmonte', 'Vincenzo Serlenga']
WHERE name = 'GLI IMPROBABILI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Gina Giurni', 'Maria Caulo', 'Martina Cavallo', 'Nico Romano', 'Rocco Oliveto', 'Sebastiana Prete']
WHERE name = 'GLI STELLOSCOPICI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonio Sangiacomo', 'Carlo La Torre', 'Emanuela Meola', 'Emanuele Oliveto', 'Mariapia Pignato', 'Martino Dolce']
WHERE name = 'MARESCIALLO NON CI PRENDI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Attilio Gatta', 'Flavia Giuzio', 'Francesco Salinardi', 'Laviero Iummati', 'Nicola Tomasillo', 'Sophia Altieri']
WHERE name = 'I CONFUSI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonio Faniello', 'Antonio Felitti', 'Carmine Santopietro', 'Lucia Laurino', 'Mariarosaria Santini', 'Pietro Pignato']
WHERE name = 'AVIS'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonella Laurino', 'Arcangelo Gabriele Pastore', 'Gabriele Gennaro Criscio', 'Gianluca Spera']
WHERE name = 'LI COMMODI(NI)'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Andrea Laurino', 'Daniele Laurino', 'Denise De Stefano', 'Gherardo Spera', 'Matteo Doti', 'Vittoria Cappiello']
WHERE name = 'TENUTA CARUSO (le riserve)'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Carmine Passavanti', 'Guglielmo Spera', 'Mariachiara Buscicchio', 'Mattia Oliveto', 'Michele Spera', 'Zeineb Alt Ettouch']
WHERE name = 'TENUTA CARUSO DREAM TEAM'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Francesca Benedetto', 'Gerardo Carleo', 'Manuel Ostuni', 'Maria Carleo', 'Marina Sileo', 'Salvatore Lomonaco']
WHERE name = 'STANCHI NOI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Alessio Aliandro', 'Antonio Carbone', 'Antonio Dodaro', 'Carlo Salvia', 'Domenico Paciello', 'Laura Scavone']
WHERE name = 'LA BOTTEGA DEL QUARTIERE'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Claudio Di Roma', 'Cristiano Arcieri', 'Franco Carbone', 'Ilyes Ounane', 'Lucia Stigliano']
WHERE name = 'SAND STORM'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Carmine Genovese', 'Giovanna Canora', 'Ilaria Nigro', 'Luana Genovese', 'Mary Di Brizzi']
WHERE name = 'LE CENTRIFUGATE'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Adriana Giuzio', 'Antonio Laurenzana', 'Emanuele Giuzio', 'Fausto Bisaccia', 'Francesco Giuzio', 'Tommaso De Luca']
WHERE name = 'SESSO & SABBIA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonio Manna', 'Giovanni Prete', 'Mafalda Senatore', 'Mariasilvia Sannicandro', 'Raffaele La Regina', 'Simone Luongo']
WHERE name = 'POTENZA DENUNCIA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Andrea La Torre', 'Antonella Salvia', 'Carmine Iummati', 'Francesca Pia Carlucci', 'Gianluigi Stigliano', 'Pasquale Giurni']
WHERE name = 'CORTO MUSO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Grazia Ramaglia', 'Leonardo Lorusso', 'Matteo La Torre', 'Mattia La Torre', 'Michela Moscarelli', 'Tonia Meliante']
WHERE name = 'SENZA FIATO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Carlo La Torre', 'Lorenza Andresini', 'Roberta Trotta', 'Stefano Salvia', 'Viero Salvia']
WHERE name = 'EDIL SALVIA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Dario Di Senso', 'Donatella Pignataro', 'Francesca Cerone', 'Guglielmo Verovia', 'Pasquale Scaringi']
WHERE name = 'DYNAMIKA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Angela De Luca', 'Sergio Desiati', 'Simone Arcieri', 'Stefano Priolo']
WHERE name = 'KISS MY ASSS'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Alessia Tirone', 'Antonio Tirone', 'Francesco Cocina', 'Ilaria Giurni', 'Rosa Martiriggiano', 'Salvatore Martiriggiano']
WHERE name = 'ACCSCI FORT'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Arianna Caponigro', 'Laviero Buono', 'Mara Carella', 'Mariarosaria Lettieri', 'Rocco Carella', 'Rocco Tolla']
WHERE name = 'DIFETTI DI FABBRICA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Adela Miron', 'Alessandro Lorusso', 'Emanuele Oliveto', 'Simone Potenza', 'Sofia Salvatore']
WHERE name = 'FENICOTTERI ROSA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonio Crisci', 'Fabio Laurenzana', 'Giammarco Giurni', 'Gianluigi Passavanti', 'Luciateresa Passavanti', 'Valerio Giancola']
WHERE name = 'LAURENZANA 2.0'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Angela Marino', 'Angelo Coviello', 'Francesco Rinaldi', 'Giuseppe Lidi', 'Rosellina Marino', 'Vincenzo Marino']
WHERE name = 'GLI SCHIACCIATI DI CASA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

UPDATE teams SET players = ARRAY['Antonio Luongo', 'Kassy Pietrafesa', 'Loris Langone', 'Luca Galotti', 'Michele Gatta']
WHERE name = 'DISASTRO TOTALE'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-amatoriale');

-- ── Beach Volley 4v4 Pro ──

UPDATE teams SET players = ARRAY['Alex D''Onofrio', 'Francesco Pace', 'Franco Mancino', 'Giovanni Santopietro', 'Marianna Albano', 'Vito Pace']
WHERE name = 'TRA ALTI E BASSI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Angelo Federici', 'Giuseppe Carlucci', 'Luca Cerone', 'Simona Scaringi', 'Valentina Lasaponara']
WHERE name = 'GELATERIA OLIVETO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Bruno Cella', 'Domenico Marra', 'Giacomo Laurino', 'Mattia Marra', 'Rocco Sinisgalli', 'Veronica Sinisgalli']
WHERE name = 'I NOVASIRESI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Dominique Muliere', 'Edvige Donnarumma', 'Fabio Marsico', 'Gabriella Verrastro', 'Monica Turetta', 'Renzo Capece']
WHERE name = 'BUBU VOLLEY'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Clarissa Troiano', 'Giovanni Vassallo', 'Giulia Salvatore', 'Giuseppe Passeri', 'Luca Mauro', 'Simone Cuccaro']
WHERE name = 'I SUDDITI DI TRIPLA T'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Fabrizio Marano', 'Giuliana Di Bitonto', 'Mara Molfese', 'Massimo D''Onofrio', 'Mirko Montagnoli', 'Monia Telesca']
WHERE name = 'A'' T''NIT NA CASA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Francesco Di Virgillo', 'Mariarosaria Lauria', 'Marika Decimo', 'Michele Ruoti', 'Paola Asprella', 'Paola Calbi']
WHERE name = 'T''NIA NA VIGNA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

UPDATE teams SET players = ARRAY['Dario Mangieri', 'Marco Molfese', 'Renzo Pascale', 'Teresa De Palma', 'Valentina Brienza', 'Vito Loffredo']
WHERE name = 'SABBIA NELLE MUTANDE'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'beach-volley-pro');

-- ── Foot Volley 2v2 ──

UPDATE teams SET players = ARRAY['Bruno Cella', 'Davide Summa', 'Gabriele Colangelo']
WHERE name = 'B and b'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Antonio Pagano', 'Gerardo Criscio']
WHERE name = 'FC ETTANERA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Gianmario Laurino', 'Iacopo Summa']
WHERE name = 'FERRAMENTA OSTUNI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Giovanni Scavone', 'Salvatore Laurino']
WHERE name = 'EDICOLA LAURINO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Francesco Montano', 'Rocco Fiore']
WHERE name = 'CURAÇAO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Davide Picerni', 'Gerardo Laurino']
WHERE name = 'HASTA EL TERCER TIEMPO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Ernesto Laurino', 'Jacopo Giuzio', 'Renato Valente']
WHERE name = 'CRUNCH PIZZERIA ROSTICCERIA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Andrea La Torre', 'Antonio La Torre', 'Samuele Giurni']
WHERE name = 'MIRTILLO'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Carmine Iummati', 'Gianluigi Stigliano', 'Pasquale Giurni']
WHERE name = 'PANIFICIO ARTE BIANCA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Domenico Paciello', 'Giacomo Laurino', 'Gianluigi Laurino']
WHERE name = 'LA BOTTEGA DEL QUARTIERE'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Giammarco Giurni', 'Nico Romano', 'Pierpaolo Spera']
WHERE name = 'PALA E PICU'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Antonello Arcieri', 'Christian Arcieri', 'Simone Arcieri']
WHERE name = 'ASCARCI'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Carmine Ostuni', 'Rocco Lo Tito']
WHERE name = 'UNO DUE COMPÀ'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Loris Langone', 'Michele Gatta']
WHERE name = 'RYUJIN'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Felice Altieri', 'Luigi La Cava']
WHERE name = 'FC PORCELLONA'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

UPDATE teams SET players = ARRAY['Christian Salvatore', 'Emanuele Picerni', 'Viero Salvia']
WHERE name = 'BURGER GRILL'
  AND tournament_id = (SELECT id FROM tournaments WHERE slug = 'foot-volley-2v2');

-- ── Verifica: attese 0 squadre senza rosa in ogni torneo ──────────────────
SELECT tr.slug,
       count(*) FILTER (WHERE tm.players IS NULL OR cardinality(tm.players) = 0) AS senza_rosa,
       count(*) AS totale
FROM teams tm JOIN tournaments tr ON tr.id = tm.tournament_id
GROUP BY tr.slug;

COMMIT;
