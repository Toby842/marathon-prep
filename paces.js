// Pace-Zonen (Sekunden pro km) aus Halbmarathon-Referenzzeit und Marathon-Zielzeit.

const HM_KM = 21.0975;
const M_KM = 42.195;

export function paceZones(hmSeconds, marathonSeconds) {
  const p = hmSeconds / HM_KM;
  const mp = marathonSeconds / M_KM;
  const z = (a, b) => [Math.round(p * a), Math.round(p * b)];
  const tempo = z(0.99, 1.02);
  const marathon = [Math.round(mp - 3), Math.round(mp + 2)];
  return {
    easy: z(1.18, 1.30),
    long: z(1.18, 1.28),
    fartlek: tempo,
    tempo,
    interval: z(0.91, 0.94),
    test: z(0.97, 1.0),
    mp: marathon,
    race: marathon,
  };
}

export function fmtPace(sec) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtDuration(sec) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

// "1:45:00", "45:30" oder "45" (Minuten) -> Sekunden; null bei ungültiger Eingabe.
export function parseDuration(text) {
  const parts = String(text).trim().split(':');
  if (!parts[0] || parts.length > 3 || parts.some(x => !/^\d+$/.test(x))) return null;
  const n = parts.map(Number);
  if (n.length === 1) return n[0] * 60;
  if (n.length === 2) return n[0] * 60 + n[1];
  return n[0] * 3600 + n[1] * 60 + n[2];
}
