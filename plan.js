// Trainingsplan Salzburg-Marathon 23.05.2027, Ziel sub 3:30, 4 Läufe pro Woche.
// Reine Daten + Hilfsfunktionen, kein DOM-Zugriff.

export const START = Date.UTC(2026, 9, 19); // Mo 19.10.2026
export const RACE = Date.UTC(2027, 4, 23);  // So 23.05.2027
const DAY = 86400000;

export const TYPES = {
  easy:     { label: 'Locker' },
  long:     { label: 'Langer Lauf' },
  fartlek:  { label: 'Fahrtspiel' },
  tempo:    { label: 'Schwelle' },
  interval: { label: 'Intervalle' },
  mp:       { label: 'Marathon-Tempo' },
  test:     { label: 'Test-Halbmarathon' },
  race:     { label: 'Marathon' },
};

const E = (km, d = 'Ganz locker, du kannst dich dabei unterhalten.') => ({ t: 'easy', km, d });
const ES = (km, n = 6) => E(km, `Locker, am Ende ${n}× 20 s Steigerungslauf (zügig, aber entspannt), dazwischen gehen.`);
const L = (km, d = 'Langsam und gleichmäßig. Ziel ist die Zeit auf den Beinen, nicht das Tempo.') => ({ t: 'long', km, d });
const F = (km, d) => ({ t: 'fartlek', km, d });
const T = (km, d) => ({ t: 'tempo', km, d });
const I = (km, d) => ({ t: 'interval', km, d });
const M = (km, d) => ({ t: 'mp', km, d });

const W = (phase, workouts, note = '') => ({ phase, workouts, note });

export const PHASES = ['Wiedereinstieg', 'Grundlage', 'Aufbau', 'Spezifisch', 'Taper'];

const WEEKS = [
  // Wiedereinstieg: nur locker, Umfang behutsam steigern
  W('Wiedereinstieg', [E(4), E(3), E(3), L(5)], 'Sanfter Start. Lieber zu langsam als zu schnell.'),
  W('Wiedereinstieg', [E(5), E(4), E(3), L(6)]),
  W('Wiedereinstieg', [E(5), ES(5), E(4), L(7)]),
  W('Wiedereinstieg', [E(4), ES(4), E(3), L(6)], 'Entlastungswoche.'),
  W('Wiedereinstieg', [E(5), ES(5), E(5), L(9)]),
  W('Wiedereinstieg', [E(6), ES(5), E(6), L(11)]),

  // Grundlage: erste Qualität, langer Lauf bis 18 km
  W('Grundlage', [F(7, '2 km einlaufen, 6× 1 min zügig / 1 min locker, Rest auslaufen.'), E(6), ES(6), L(11)]),
  W('Grundlage', [F(6, '2 km einlaufen, 5× 1 min zügig / 1 min locker, Rest auslaufen.'), E(6), E(4), L(8)], 'Entlastungswoche.'),
  W('Grundlage', [F(8, '2 km einlaufen, 8× 1 min zügig / 1 min locker, Rest auslaufen.'), E(6), ES(6), L(12)]),
  W('Grundlage', [T(9, '2 km einlaufen, 3× 1,5 km im Schwellentempo, 2 min Trabpause, Rest auslaufen.'), E(6), ES(6), L(14)]),
  W('Grundlage', [T(10, '2 km einlaufen, 3× 2 km im Schwellentempo, 2 min Trabpause, Rest auslaufen.'), E(7), ES(6), L(15)]),
  W('Grundlage', [F(8, '2 km einlaufen, 6× 2 min zügig / 1 min locker, Rest auslaufen.'), E(6), E(5), L(11)], 'Entlastungswoche.'),
  W('Grundlage', [T(11, '2 km einlaufen, 2× 3 km im Schwellentempo, 3 min Trabpause, Rest auslaufen.'), E(7), ES(6), L(16)]),
  W('Grundlage', [T(10, '2 km einlaufen, 25 min am Stück im Schwellentempo, Rest auslaufen.'), E(7), ES(7), L(18)]),

  // Aufbau: Intervalle + Schwelle, langer Lauf bis 26 km, Test-HM
  W('Aufbau', [I(11, '2 km einlaufen, 6× 800 m im Intervalltempo, 400 m Trabpause, Rest auslaufen.'), E(7), ES(7), L(18)]),
  W('Aufbau', [T(10, '2 km einlaufen, 3× 2 km im Schwellentempo, 2 min Trabpause, Rest auslaufen.'), E(6), E(6), L(14)], 'Entlastungswoche.'),
  W('Aufbau', [I(12, '2 km einlaufen, 5× 1000 m im Intervalltempo, 400 m Trabpause, Rest auslaufen.'), E(7), ES(6), L(20)]),
  W('Aufbau', [T(12, '2 km einlaufen, 3× 3 km im Schwellentempo, 3 min Trabpause, Rest auslaufen.'), E(8), ES(6), L(22)]),
  W('Aufbau', [I(12, '2 km einlaufen, 4× 1600 m im Intervalltempo, 600 m Trabpause, Rest auslaufen.'), E(8), ES(6), L(24)]),
  W('Aufbau', [E(7), ES(6, 4), E(4, 'Ganz locker, 1–2 Tage vor dem Test.'),
    { t: 'test', km: 24, d: '2 km einlaufen, 21,1 km so schnell wie gleichmäßig möglich, 1 km auslaufen. Ideal als offizieller Wettkampf. Danach die Zeit in den Einstellungen eintragen.' }],
    'Testwoche: Danach die neue Halbmarathon-Zeit in den Einstellungen eintragen, dann passen sich alle Paces an.'),
  W('Aufbau', [T(13, '2 km einlaufen, 2× 5 km im Schwellentempo, 3 min Trabpause, Rest auslaufen.'), E(8), ES(7), L(22)]),
  W('Aufbau', [I(12, '2 km einlaufen, 6× 1000 m im Intervalltempo, 400 m Trabpause, Rest auslaufen.'), E(8), ES(6), L(26)]),

  // Spezifisch: Marathon-Tempo im langen Lauf, 2× 32 km
  W('Spezifisch', [T(13, '2 km einlaufen, 3× 3 km im Schwellentempo, 3 min Trabpause, Rest auslaufen.'), E(8), ES(7),
    L(26, '26 km: km 1–14 locker, km 15–22 im Marathon-Tempo, Rest locker.')]),
  W('Spezifisch', [I(11, '2 km einlaufen, 5× 1000 m im Intervalltempo, 400 m Trabpause, Rest auslaufen.'), E(7), E(6),
    L(20, '20 km: die letzten 6 km im Marathon-Tempo.')], 'Entlastungswoche.'),
  W('Spezifisch', [T(13, '2 km einlaufen, 2× 5 km im Schwellentempo, 3 min Trabpause, Rest auslaufen.'), E(8), ES(7), L(30)]),
  W('Spezifisch', [M(16, '2 km einlaufen, 12 km im Marathon-Tempo, 2 km auslaufen.'), E(8), E(6), L(28)]),
  W('Spezifisch', [I(12, '2 km einlaufen, 4× 1600 m im Intervalltempo, 600 m Trabpause, Rest auslaufen.'), E(9), ES(7),
    L(32, '32 km locker. Nimm Gels/Getränke mit wie im Rennen.')]),
  W('Spezifisch', [T(12, '2 km einlaufen, 3× 2,5 km im Schwellentempo, 2 min Trabpause, Rest auslaufen.'), E(8), ES(8),
    L(32, '32 km: die letzten 8 km im Marathon-Tempo. Rennverpflegung testen.')], 'Letzte große Woche.'),

  // Taper
  W('Taper', [M(12, '2 km einlaufen, 8 km im Marathon-Tempo, 2 km auslaufen.'), E(7), ES(6), L(20)], 'Umfang sinkt, Beine werden frisch.'),
  W('Taper', [I(9, '2 km einlaufen, 4× 1000 m im Intervalltempo, 400 m Trabpause, Rest auslaufen.'), E(7), E(5),
    L(13, '13 km: die letzten 4 km im Marathon-Tempo.')]),
  W('Taper', [M(6, '2 km einlaufen, 3× 1 km im Marathon-Tempo, 1 km Trab, Rest auslaufen.'), E(5), ES(3, 3),
    { t: 'race', km: 42.2, d: 'Salzburg-Marathon. Die ersten 5 km bewusst ruhig, dann gleichmäßig im Marathon-Tempo. Viel Erfolg!' }],
    'Rennwoche: viel schlafen, Kohlenhydrate ab Donnerstag, nichts Neues ausprobieren.'),
];

export function weeks() {
  return WEEKS.map((w, i) => ({
    n: i + 1,
    ...w,
    start: START + i * 7 * DAY,
    end: START + (i * 7 + 6) * DAY,
    km: Math.round(w.workouts.reduce((s, x) => s + x.km, 0) * 10) / 10,
    workouts: w.workouts.map((x, j) => ({ ...x, id: `w${i + 1}-${j}` })),
  }));
}

// Lokales Kalenderdatum als UTC-Mitternacht, damit Zeitzonen nicht stören.
function localDay(time) {
  const d = new Date(time);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

// Wochennummer (1-basiert) für einen Zeitpunkt, auf den Planzeitraum begrenzt.
export function weekIndexFor(time) {
  const n = Math.floor((localDay(time) - START) / (7 * DAY)) + 1;
  return Math.min(Math.max(n, 1), WEEKS.length);
}

export function daysUntilRace(time) {
  return Math.round((RACE - localDay(time)) / DAY);
}
