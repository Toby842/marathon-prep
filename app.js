import { weeks, weekIndexFor, daysUntilRace, TYPES, PHASES } from './plan.js';
import { paceZones, fmtPace, fmtDuration, parseDuration } from './paces.js';
import { load, save, toJson, fromJson } from './store.js';

const plan = weeks();
let state = load();
let tab = 'week';
let weekNo = weekIndexFor(Date.now());
let chartPick = null;

const view = document.getElementById('view');
const sheet = document.getElementById('sheet');

// ---------- Hilfen ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const km = n => (Math.round(n * 10) / 10).toLocaleString('de-AT');
const dm = t => { const d = new Date(t); return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.`; };
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const zones = () => paceZones(state.settings.hm, state.settings.goal);
const zoneText = t => { const [a, b] = zones()[t]; return `${fmtPace(a)}–${fmtPace(b)} /km`; };
const currentWeek = () => weekIndexFor(Date.now());
const findWorkout = id => plan.flatMap(w => w.workouts).find(x => x.id === id);

function persist() {
  try { save(state); } catch { alert('Speichern fehlgeschlagen. Ist der Speicher voll?'); }
}

function logLine(log) {
  if (!log) return '';
  if (log.status === 'skipped') return '<div class="result skipped">Übersprungen</div>';
  const parts = [];
  if (log.km) parts.push(`${km(log.km)} km`);
  if (log.sec) parts.push(fmtDuration(log.sec));
  if (log.km && log.sec) parts.push(`${fmtPace(log.sec / log.km)} /km`);
  if (log.feel) parts.push(`Gefühl ${log.feel}/5`);
  return `<div class="result done">✓ ${parts.join(' · ') || 'Erledigt'}</div>`;
}

function weekStats(w) {
  const logs = w.workouts.map(x => state.logs[x.id]);
  const done = logs.filter(l => l?.status === 'done');
  return { done: done.length, km: done.reduce((s, l) => s + (l.km || 0), 0) };
}

// ---------- Ansichten ----------

function renderWeek() {
  const w = plan[weekNo - 1];
  const s = weekStats(w);
  const days = daysUntilRace(Date.now());
  const countdown = days > 0 ? `Noch ${days} Tage bis Salzburg` : days === 0 ? 'Heute ist Renntag!' : 'Rennen vorbei – Glückwunsch!';
  return `
    <header class="top center">
      <div class="countdown">${countdown}${w.n === currentWeek() ? ' · diese Woche' : ''}</div>
      <div class="weeknav">
        <button class="icon" data-act="prev" ${weekNo === 1 ? 'disabled' : ''} aria-label="Vorige Woche">‹</button>
        <div>
          <h1>Woche ${w.n} <small>/ ${plan.length}</small></h1>
          <div class="sub">${w.phase} · ${dm(w.start)} – ${dm(w.end)}</div>
        </div>
        <button class="icon" data-act="next" ${weekNo === plan.length ? 'disabled' : ''} aria-label="Nächste Woche">›</button>
      </div>
      <div class="progress"><div style="width:${(s.done / 4) * 100}%"></div></div>
      <div class="sub">${s.done}/4 erledigt · ${km(s.km)} von ${km(w.km)} km</div>
      ${weekNo !== currentWeek() ? '<button class="link" data-act="today">Zur aktuellen Woche</button>' : ''}
    </header>
    ${w.note ? `<p class="note">${esc(w.note)}</p>` : ''}
    <section class="cards">
      ${w.workouts.map(x => `
        <button class="card t-${x.t} ${state.logs[x.id]?.status || ''}" data-log="${x.id}">
          <div class="row">
            <span class="badge">${TYPES[x.t].label}</span>
            <span class="km">${km(x.km)} km</span>
          </div>
          <p>${esc(x.d)}</p>
          <div class="pace">Ziel-Pace ${zoneText(x.t)}</div>
          ${logLine(state.logs[x.id])}
        </button>`).join('')}
    </section>`;
}

function renderPlan() {
  const cur = currentWeek();
  return `
    <header class="top"><h1>Trainingsplan</h1><div class="sub">31 Wochen · 4 Läufe pro Woche · Ziel unter 3:30</div></header>
    ${PHASES.map(p => `
      <h2>${p}</h2>
      <div class="list">
        ${plan.filter(w => w.phase === p).map(w => {
          const s = weekStats(w);
          const dots = w.workouts.map(x => `<i class="${state.logs[x.id]?.status || ''}"></i>`).join('');
          return `
            <button class="week-row ${w.n === cur ? 'current' : ''}" data-week="${w.n}">
              <span class="wn">W${w.n}</span>
              <span class="wd">${dm(w.start)}–${dm(w.end)}${w.note.startsWith('Entlastung') ? ' · leicht' : ''}</span>
              <span class="wk">${s.km ? `${km(s.km)}/` : ''}${km(w.km)} km</span>
              <span class="dots">${dots}</span>
            </button>`;
        }).join('')}
      </div>`).join('')}`;
}

function renderStats() {
  const now = Date.now();
  const cur = currentWeek();
  const all = plan.flatMap(w => w.workouts.map(x => ({ ...x, week: w.n, log: state.logs[x.id] })));
  const done = all.filter(x => x.log?.status === 'done');
  const due = all.filter(x => x.week < cur || x.log).length;
  const total = done.reduce((s, x) => s + (x.log.km || 0), 0);
  const recent = done.filter(x => ['easy', 'long'].includes(x.t) && x.log.km && x.log.sec && now - new Date(x.log.date).getTime() < 28 * 86400000);
  const easyPace = recent.length ? recent.reduce((s, x) => s + x.log.sec, 0) / recent.reduce((s, x) => s + x.log.km, 0) : null;
  const longest = done.reduce((m, x) => Math.max(m, x.log.km || 0), 0);

  const max = Math.max(...plan.map(w => Math.max(w.km, weekStats(w).km)));
  const bars = plan.map(w => {
    const s = weekStats(w);
    const sel = chartPick === w.n ? 'sel' : '';
    return `
      <button class="bar ${sel} ${w.n === cur ? 'cur' : ''}" data-bar="${w.n}" aria-label="Woche ${w.n}: Soll ${km(w.km)} km, Ist ${km(s.km)} km">
        <span class="soll" style="height:${(w.km / max) * 100}%"></span>
        <span class="ist" style="height:${(s.km / max) * 100}%"></span>
      </button>`;
  }).join('');
  const pick = plan[(chartPick || cur) - 1];
  const pickStats = weekStats(pick);

  return `
    <header class="top"><h1>Statistik</h1><div class="sub">Stand ${dm(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))}</div></header>
    <section class="tiles">
      <div class="tile"><b>${km(total)}</b><span>km gelaufen</span></div>
      <div class="tile"><b>${done.length}<small>/${due}</small></b><span>Workouts erledigt</span></div>
      <div class="tile"><b>${due ? Math.round((done.length / due) * 100) : 0}%</b><span>Planerfüllung</span></div>
      <div class="tile"><b>${easyPace ? fmtPace(easyPace) : '–'}</b><span>Ø Pace locker (28 Tage)</span></div>
      <div class="tile"><b>${km(longest)}</b><span>Längster Lauf (km)</span></div>
      <div class="tile"><b>${Math.max(daysUntilRace(now), 0)}</b><span>Tage bis zum Rennen</span></div>
    </section>
    <h2>Wochenumfang</h2>
    <div class="chart-card">
      <div class="legend"><span><i class="ist"></i>Gelaufen</span><span><i class="soll"></i>Geplant</span></div>
      <div class="chart">${bars}</div>
      <div class="axis"><span>W1</span><span>W10</span><span>W20</span><span>W31</span></div>
      <div class="pick"><b>Woche ${pick.n}</b> · ${pick.phase} · gelaufen ${km(pickStats.km)} km von ${km(pick.km)} km · ${pickStats.done}/4 Workouts</div>
    </div>`;
}

function renderSettings() {
  const z = zones();
  const rows = [['easy', 'Locker'], ['long', 'Langer Lauf'], ['mp', 'Marathon-Tempo'], ['tempo', 'Schwelle / Fahrtspiel zügig'], ['interval', 'Intervalle']];
  return `
    <header class="top"><h1>Einstellungen</h1></header>
    <form class="panel" id="settings-form">
      <label>Referenz-Halbmarathonzeit
        <input name="hm" value="${fmtDuration(state.settings.hm)}" inputmode="text" autocomplete="off" placeholder="1:45:00">
        <small>Daraus werden deine Trainings-Paces berechnet. Nach dem Test-Halbmarathon in Woche 20 aktualisieren.</small>
      </label>
      <label>Marathon-Zielzeit
        <input name="goal" value="${fmtDuration(state.settings.goal)}" inputmode="text" autocomplete="off" placeholder="3:29:30">
        <small>Bestimmt das Marathon-Tempo. 3:29:30 entspricht etwa 4:58 /km.</small>
      </label>
      <button class="primary" type="submit">Speichern</button>
    </form>
    <h2>Deine Pace-Zonen</h2>
    <div class="panel zones">
      ${rows.map(([k, l]) => `<div><span>${l}</span><b>${fmtPace(z[k][0])}–${fmtPace(z[k][1])}</b></div>`).join('')}
    </div>
    <h2>Backup</h2>
    <div class="panel">
      <p class="hint">Deine Daten liegen nur auf diesem Gerät. Exportiere ab und zu ein Backup (z. B. in die Dateien-App oder iCloud Drive).</p>
      <button class="secondary" data-act="export">Backup exportieren</button>
      <label class="secondary file">Backup importieren<input type="file" accept="application/json,.json" id="import"></label>
      <button class="danger" data-act="reset">Alle Einträge löschen</button>
    </div>`;
}

function render() {
  view.innerHTML = { week: renderWeek, plan: renderPlan, stats: renderStats, settings: renderSettings }[tab]();
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

// ---------- Eintragen ----------

function openLog(id) {
  const x = findWorkout(id);
  const log = state.logs[id] || {};
  const status = log.status || 'done';
  const min = log.sec ? Math.floor(log.sec / 60) : '';
  const sec = log.sec ? log.sec % 60 : '';
  sheet.dataset.id = id;
  sheet.innerHTML = `
    <form method="dialog" id="log-form">
      <div class="row"><span class="badge t-${x.t}">${TYPES[x.t].label}</span><span class="km">Plan: ${km(x.km)} km</span></div>
      <p class="hint">${esc(x.d)}</p>
      <div class="seg">
        <label><input type="radio" name="status" value="done" ${status === 'done' ? 'checked' : ''}><span>Erledigt</span></label>
        <label><input type="radio" name="status" value="skipped" ${status === 'skipped' ? 'checked' : ''}><span>Übersprungen</span></label>
      </div>
      <div class="fields">
        <label>Datum<input type="date" name="date" value="${esc(log.date || todayIso())}"></label>
        <label>Distanz (km)<input name="km" inputmode="decimal" value="${log.km != null ? String(log.km).replace('.', ',') : String(x.km).replace('.', ',')}"></label>
        <div class="two">
          <label>Dauer Min<input name="min" inputmode="numeric" value="${min}" placeholder="z. B. 32"></label>
          <label>Sek<input name="sec" inputmode="numeric" value="${sec}" placeholder="0"></label>
        </div>
        <div class="pace-live" id="pace-live"></div>
        <fieldset class="feel"><legend>Gefühl (1 = sehr leicht, 5 = sehr hart)</legend>
          ${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="feel" value="${n}" ${log.feel === n ? 'checked' : ''}><span>${n}</span></label>`).join('')}
        </fieldset>
        <label>Notiz<textarea name="note" rows="2" placeholder="Wetter, Beine, Puls …">${esc(log.note)}</textarea></label>
      </div>
      <div class="actions">
        ${state.logs[id] ? '<button type="button" class="danger" data-act="clear">Eintrag löschen</button>' : ''}
        <button type="button" class="secondary" data-act="close">Abbrechen</button>
        <button type="submit" class="primary">Speichern</button>
      </div>
    </form>`;
  const form = sheet.querySelector('form');
  const updatePace = () => {
    const d = parseFloat(form.km.value.replace(',', '.'));
    const s = (parseInt(form.min.value, 10) || 0) * 60 + (parseInt(form.sec.value, 10) || 0);
    sheet.querySelector('#pace-live').textContent = d > 0 && s > 0 ? `Pace ${fmtPace(s / d)} /km · Ziel ${zoneText(x.t)}` : '';
    form.classList.toggle('skipped', form.status.value === 'skipped');
  };
  form.addEventListener('input', updatePace);
  updatePace();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const entry = { status: f.get('status'), date: f.get('date') || todayIso(), note: f.get('note').trim() };
    if (entry.status === 'done') {
      const d = parseFloat(String(f.get('km')).replace(',', '.'));
      const s = (parseInt(f.get('min'), 10) || 0) * 60 + (parseInt(f.get('sec'), 10) || 0);
      if (d > 0) entry.km = Math.round(d * 100) / 100;
      if (s > 0) entry.sec = s;
      if (f.get('feel')) entry.feel = Number(f.get('feel'));
    }
    state.logs[id] = entry;
    persist();
    sheet.close();
    render();
  });
  sheet.showModal();
}

// ---------- Ereignisse ----------

document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  if (tab === 'week' && b.classList.contains('active')) weekNo = currentWeek();
  render();
  window.scrollTo(0, 0);
});

view.addEventListener('click', async e => {
  const el = e.target.closest('[data-act],[data-log],[data-week],[data-bar]');
  if (!el) return;
  if (el.dataset.log) return openLog(el.dataset.log);
  if (el.dataset.week) { weekNo = Number(el.dataset.week); tab = 'week'; render(); window.scrollTo(0, 0); return; }
  if (el.dataset.bar) { chartPick = Number(el.dataset.bar); render(); return; }
  const act = el.dataset.act;
  if (act === 'prev' && weekNo > 1) weekNo--;
  if (act === 'next' && weekNo < plan.length) weekNo++;
  if (act === 'today') weekNo = currentWeek();
  if (act === 'export') return exportBackup();
  if (act === 'reset') {
    if (!confirm('Wirklich alle Trainingseinträge löschen? Das kann nicht rückgängig gemacht werden.')) return;
    state.logs = {};
    persist();
  }
  render();
});

view.addEventListener('submit', e => {
  if (e.target.id !== 'settings-form') return;
  e.preventDefault();
  const hm = parseDuration(e.target.hm.value);
  const goal = parseDuration(e.target.goal.value);
  if (!hm || hm < 3600 || hm > 3 * 3600) return alert('Bitte Halbmarathonzeit als h:mm:ss eingeben, z. B. 1:45:00');
  if (!goal || goal < 2 * 3600 || goal > 6 * 3600) return alert('Bitte Marathon-Zielzeit als h:mm:ss eingeben, z. B. 3:29:30');
  state.settings = { hm, goal };
  persist();
  render();
});

view.addEventListener('change', async e => {
  if (e.target.id !== 'import' || !e.target.files[0]) return;
  try {
    const imported = fromJson(await e.target.files[0].text());
    if (!confirm(`Backup mit ${Object.keys(imported.logs).length} Einträgen laden? Aktuelle Daten werden ersetzt.`)) return;
    state = imported;
    persist();
    render();
  } catch {
    alert('Diese Datei ist kein gültiges Backup.');
  }
});

sheet.addEventListener('click', e => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'close' || e.target === sheet) sheet.close();
  if (act === 'clear') {
    delete state.logs[sheet.dataset.id];
    persist();
    sheet.close();
    render();
  }
});

async function exportBackup() {
  const name = `marathon-backup-${todayIso()}.json`;
  const file = new File([toJson(state)], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Marathon Backup' }); } catch { /* abgebrochen */ }
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

render();
