# Marathon-Trainings-App: Design

Stand 18.10.2026. Grundlage: [goal_definition.md](../../../goal_definition.md).

## Ziel

Salzburg-Marathon am 23.05.2027 unter 3:30 (≈ 4:58 /km). Ausgangslage: HM 1:41 vor ~6 Monaten, seitdem
langsamer, aktuell < 15 km/Woche. 4 Lauftage pro Woche, Tage frei wählbar.

App aufs iPhone ohne App Store, immer offline, Workouts des Plans tracken. So unkompliziert wie möglich.

## Entscheidungen

- **PWA ohne Build-Schritt** (Vanilla JS-Module), gehostet auf GitHub Pages, installiert über Safari
  „Zum Home-Bildschirm“. Native App verworfen (ohne App Store alle 7 Tage neu signieren).
- **Plan wochenweise**: 4 Workouts pro Woche ohne feste Tage, abgehakt wann es passt.
- **Paces berechnet** aus Referenz-HM-Zeit (Start 1:45:00) und Marathon-Zielzeit (3:29:30), in den
  Einstellungen änderbar. Nach dem Test-HM in Woche 20 aktualisieren.
- **Daten nur lokal** (`localStorage`), JSON-Backup per Teilen-Dialog / Download, Import per Dateiauswahl.

## Plan (31 Wochen, Mo 19.10.2026 – So 23.05.2027)

| Phase | Wochen | km/Woche | Inhalt |
|---|---|---|---|
| Wiedereinstieg | 1–6 | 15 → 28 | nur locker + Steigerungen, langer Lauf bis 11 km |
| Grundlage | 7–14 | 30 → 42 | Fahrtspiel, Schwelle, langer Lauf bis 18 km |
| Aufbau | 15–22 | 43 → 52 | Intervalle/Schwelle, langer Lauf bis 26 km, Test-HM Woche 20 |
| Spezifisch | 23–28 | 54 → 60 | MP-Abschnitte im langen Lauf, 2× 32 km (Wochen 27, 28) |
| Taper | 29–31 | 45 → 34 → Rennen | Umfang runter, Intensität kurz halten |

Entlastungswochen: 4, 8, 12, 16, 24 (Woche 20 ist Testwoche). Je Woche: 1 langer Lauf, ab Woche 7
1 Qualitätseinheit, 2 lockere Läufe.

## App

- **Woche**: aktuelle Woche automatisch, blättern, Countdown, Fortschritt, 4 Workout-Karten mit Ziel-Pace.
- **Eintragen**: erledigt/übersprungen, Datum, km, Dauer (min + s), Pace live, Gefühl 1–5, Notiz.
- **Plan**: alle Wochen nach Phase, Soll-/Ist-km, Status-Punkte, Tippen springt zur Woche.
- **Statistik**: km gesamt, erledigt/fällig, Planerfüllung, Ø Pace locker (28 Tage), längster Lauf,
  Soll/Ist-Balken pro Woche (antippen für Details).
- **Einstellungen**: HM-Referenz, Zielzeit, Pace-Zonen, Backup, Zurücksetzen.

## Tests

- `npm test`: Plan-Struktur (31 Wochen, Mo–So, Rennen am 23.05., Umfangssteigerung ≤ 25 %, langer Lauf
  ≤ +4 km), Wochenerkennung inkl. Zeitzonen, Pace-Zonen, Formatierung, Speichern/Import.
- Manuell im Headless-Chrome (iPhone-Größe, hell/dunkel): Eintragen, Neuladen, Löschen, Navigation,
  Einstellungen, Offline-Start über den Service Worker.
