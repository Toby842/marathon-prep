# Marathon Plan Salzburg 2027

Offline-Trainings-App (PWA) für den Salzburg-Marathon am 23.05.2027, Ziel unter 3:30.
31 Wochen, 4 Läufe pro Woche, ab Mo 19.10.2026.

**App:** https://toby842.github.io/marathon-prep/

## Aufs iPhone holen

1. Den Link oben in **Safari** öffnen (nicht Chrome).
2. Teilen-Symbol → **„Zum Home-Bildschirm“** → Hinzufügen.
3. App einmal vom Home-Bildschirm öffnen. Ab dann läuft sie komplett offline.

Updates kommen automatisch, wenn die App mit Internet geöffnet wird (beim übernächsten Start sichtbar).
Deine Einträge bleiben dabei erhalten. Sie liegen nur auf dem Handy. Ab und zu unter
*Einstellungen → Backup exportieren* sichern.

## Aufbau

| Datei | Zweck |
|---|---|
| `plan.js` | Der Trainingsplan (Daten) + Wochen-/Datumslogik |
| `paces.js` | Pace-Zonen aus HM-Referenzzeit und Marathon-Zielzeit |
| `store.js` | Speichern/Laden in `localStorage`, Backup-Export/-Import |
| `app.js` | Oberfläche: Woche, Plan, Statistik, Einstellungen |
| `sw.js` | Service Worker für Offline-Betrieb |

Den Plan ändern: Workouts in `plan.js` bearbeiten. Wenn Dateien hinzukommen, in `sw.js` die Liste `FILES` ergänzen.

## Entwicklung

```sh
npm test      # Unit-Tests (Node, keine Abhängigkeiten)
npm start     # lokal unter http://localhost:8000
```
