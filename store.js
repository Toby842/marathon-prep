// Speichert Einstellungen und Trainingseinträge lokal auf dem Gerät (localStorage).

const KEY = 'marathon-prep-v1';
const DEFAULT_SETTINGS = { hm: 6300, goal: 12570 }; // HM 1:45:00, Ziel 3:29:30

function normalize(data) {
  if (!data || typeof data !== 'object' || (data.logs && typeof data.logs !== 'object')) {
    throw new Error('Ungültige Datei');
  }
  return {
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
    logs: { ...data.logs },
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : normalize({});
  } catch {
    return normalize({});
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function toJson(state) {
  return JSON.stringify({ app: 'marathon-prep', version: 1, exported: new Date().toISOString(), ...state }, null, 2);
}

export function fromJson(text) {
  return normalize(JSON.parse(text));
}
