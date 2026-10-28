/* Campus Mission — lógica de la página de alumnos */
const API = window.CampusAPI;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
const hora = iso => { try { return iso ? new Date(iso).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : ''; } catch { return ''; } };
const ERR = {
  offline: 'No connection. Check your internet and try again.',
  group_not_found: 'That group code does not exist. Check it with your teacher.',
  team_not_found: 'That team is not registered yet.',
  wrong_pin: 'Wrong PIN for this team. If you forgot it, ask your teacher to reset it.',
  bad_pin: 'The PIN must be exactly 4 digits.',
  phase3_closed: 'Phase 3 is not open yet.',
  too_large: 'The photo is too large. Try another one.'
};
const msgErr = r => ERR[r && r.error] || 'Something went wrong (' + ((r && r.error) || 'error') + '). Try again.';

let S = lsGet('campusMission.sesion', null); // {codigo, equipo, pin}
let D = null;  // estado del equipo (desde el servidor)
let G = null;  // info del grupo
let vista = 'inicio';
const eqActual = () => EQUIPOS.find(e => e.n === (D ? D.equipo : S && S.equipo));
const draftKey = () => 'campusMission.borrador.' + S.codigo + '.' + S.equipo;

function aviso(t) { const a = $('#aviso'); a.textContent = t || ''; a.hidden = !t; }
function setMsg(el, t, tipo) { el.textContent = t; el.className = 'msg' + (tipo ? ' ' + tipo : ''); el.hidden = !t; }
if (API.DEMO) $('#demo').hidden = false;

/* ===================== VISTAS ===================== */
function fase1Lista() { return D && D.ubicado && (D.tieneFoto || D.sinFoto); }
function mostrar(v) {
  vista = v;
  ['inicio', 'mision', 'edificio', 'fase3'].forEach(n => { const el = $('#v' + n[0].toUpperCase() + n.slice(1)); if (el) el.hidden = n !== v; });
  $('#vFase3').hidden = v !== 'fase3';
  $('#vMuro').hidden = !(D && (v === 'mision' || v === 'edificio'));
  $('#btnSalir').hidden = v === 'inicio';
  const listo = fase1Lista();
  const b1 = $('#st1'), b2 = $('#st2'), b3 = $('#st3');
  b1.disabled = !D; b2.disabled = !listo; b3.disabled = !listo;
  b1.className = 'step' + (v === 'mision' ? ' on' : '') + (listo ? ' done' : '');
  b2.className = 'step' + (v === 'edificio' ? ' on' : '');
  b3.className = 'step' + (v === 'fase3' ? ' on' : '') + (D && D.explicadoEn ? ' done' : '');
  if (v === 'edificio') arrancar3D(); else parar3D();
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}
async function transicion(fn) {
  const f = $('#flash');
  if (reduce) { fn(); return; }
  f.classList.add('on'); await new Promise(r => setTimeout(r, 340)); fn(); await new Promise(r => setTimeout(r, 60)); f.classList.remove('on');
}
$('#st1').addEventListener('click', () => transicion(() => { pintarMision(); mostrar('mision'); if (D.ubicado) enfocar(D.lugar, false); }));
$('#st2').addEventListener('click', () => transicion(() => { pintarEdificio(); mostrar('edificio'); }));
$('#st3').addEventListener('click', () => irFase3());

/* ===================== INICIO ===================== */
function pintarInicio() {
  $('#listaEquipos').innerHTML = EQUIPOS.map(e => `<div class="eq" style="--c:${e.color}"><div class="n">${e.n}</div><b>${esc(e.titulo)}</b><span>${esc(LUGARES[e.lugar].nombre)}</span></div>`).join('');
}
let ultimoCodigo = '';
async function revisarCodigo() {
  const codigo = $('#inCodigo').value.trim().toUpperCase();
  if (!codigo || codigo === ultimoCodigo) return;
  ultimoCodigo = codigo;
  const err = $('#errInicio'); err.hidden = true;
  $('#grupoOk').hidden = true; $('#pasoEquipo').hidden = true;
  const r = await API.llamar({ a: 'grupo', codigo });
  if (!r.ok) { setMsg(err, msgErr(r), 'bad'); ultimoCodigo = ''; return; }
  G = r;
  $('#grupoOk').textContent = '✓ ' + r.nombre; $('#grupoOk').hidden = false;
  const usados = new Set(r.equiposRegistrados || []);
  $('#inEquipo').innerHTML = '<option value="">Choose your team…</option>' + EQUIPOS.map(e => `<option value="${e.n}">Team ${e.n} · ${esc(e.titulo)}${usados.has(e.n) ? ' (registered)' : ''}</option>`).join('');
  if (S && S.codigo === r.codigo) $('#inEquipo').value = S.equipo;
  $('#pasoEquipo').hidden = false;
  ajustarAyuda();
}
function ajustarAyuda() {
  const n = +$('#inEquipo').value; const reg = G && (G.equiposRegistrados || []).includes(n);
  $('#ayudaPin').textContent = reg ? 'This team is registered. Enter the PIN your team created.' : 'First time: create a 4-digit PIN and share it only with your team.';
  $('#campoIntegrantes').hidden = !!reg;
  $('#ayudaEquipo').textContent = n ? 'Destination: ' + LUGARES[EQUIPOS[n - 1].lugar].nombre : '';
}
$('#inCodigo').addEventListener('change', revisarCodigo);
$('#inCodigo').addEventListener('blur', revisarCodigo);
$('#inCodigo').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); revisarCodigo(); } });
$('#inEquipo').addEventListener('change', ajustarAyuda);
$('#fInicio').addEventListener('submit', async ev => {
  ev.preventDefault();
  const err = $('#errInicio');
  if (!G) { await revisarCodigo(); if (!G) return; }
  const equipo = +$('#inEquipo').value, pin = $('#inPin').value.trim(), integrantes = $('#inIntegrantes').value.trim();
  if (!equipo) { setMsg(err, 'Choose your team.', 'bad'); return; }
  if (!/^\d{4}$/.test(pin)) { setMsg(err, ERR.bad_pin, 'bad'); return; }
  const reg = (G.equiposRegistrados || []).includes(equipo);
  if (!reg && !integrantes) { setMsg(err, 'Write the names of the team members.', 'bad'); return; }
  const btn = $('#btnEntrarEquipo'); btn.disabled = true; btn.textContent = 'Entering…';
  const r = await API.llamar({ a: 'entrar', codigo: G.codigo, equipo, pin, integrantes });
  btn.disabled = false; btn.textContent = 'Continue';
  if (!r.ok) { setMsg(err, msgErr(r), 'bad'); return; }
  err.hidden = true;
  S = { codigo: G.codigo, equipo, pin }; lsSet('campusMission.sesion', S);
  abrir(r.team);
});
$('#btnSalir').addEventListener('click', () => {
  lsDel('campusMission.sesion'); S = null; D = null; G = null; ultimoCodigo = '';
  clearInterval(tMuro); $('#inPin').value = ''; $('#inIntegrantes').value = ''; $('#pasoEquipo').hidden = true; $('#grupoOk').hidden = true;
  mostrar('inicio');
});

function abrir(team) {
  D = team;
  aplicarBorrador();
  iniciarMuro();
  if (D.fase3 && fase1Lista()) { irFase3(); return; }
  if (fase1Lista()) { pintarEdificio(); mostrar('edificio'); }
  else { pintarMision(); mostrar('mision'); if (D.ubicado) enfocar(D.lugar, false); }
}
async function reanudar() {
  if (!S) return;
  aviso('Opening your team…');
  const r = await API.llamar({ a: 'entrar', codigo: S.codigo, equipo: S.equipo, pin: S.pin });
  aviso('');
  if (r.ok) { G = { codigo: S.codigo }; abrir(r.team); }
  else if (r.error === 'offline') aviso(ERR.offline);
  else { lsDel('campusMission.sesion'); S = null; }
}

/* ===================== GUARDAR ===================== */
let cola = Promise.resolve();
function guardar(datos) {
  cola = cola.then(async () => {
    const r = await API.llamar({ a: 'guardar', codigo: S.codigo, equipo: S.equipo, pin: S.pin, datos });
    if (r.ok) { D = Object.assign(D, r.team); return true; }
    return r;
  });
  return cola;
}
/* Borrador local por si se cae la conexión */
function guardarBorrador() { lsSet(draftKey(), { respuestas: pendientes, explicacion: pendientes3 }); }
function aplicarBorrador() {
  const b = lsGet(draftKey(), null); if (!b) return;
  pendientes = Object.assign({}, b.respuestas || {}); pendientes3 = Object.assign({}, b.explicacion || {});
  Object.assign(D.respuestas, pendientes); Object.assign(D.explicacion, pendientes3);
  if (Object.keys(pendientes).length) setTimeout(vaciar, 500);
}

/* ===================== FASE 1 ===================== */
function pintarMision() {
  const eq = eqActual(); if (!eq || !D) return;
  if (!$('#mapa')) { $('#mapaBox').innerHTML = mapaSVG(); conectarMapa(); }
  $('#mBadge').textContent = eq.n; $('#mBadge').style.setProperty('--c', eq.color);
  $('#mGrupo').textContent = 'Group ' + D.grupo; $('#mTitulo').textContent = 'Team ' + eq.n + ' · ' + eq.titulo;
  $('#mLugar').textContent = LUGARES[eq.lugar].nombre;
  $('#mAreas').innerHTML = eq.areas.map(a => `<span class="area">${esc(a)}</span>`).join('');
  $('#chipIntentos').textContent = 'Attempts: ' + (D.intentos || 0);
  $('#t1').className = 'task ' + (D.ubicado ? 'ok' : 'on');
  if (D.ubicado) {
    setMsg($('#t1msg'), `Found in ${D.intentos || 1} ${D.intentos === 1 ? 'attempt' : 'attempts'}. Now go there.`, 'good');
    document.querySelectorAll('.bld').forEach(g => g.classList.toggle('si', g.dataset.id === eq.lugar));
  }
  const tieneFoto = D.tieneFoto || D.sinFoto;
  $('#t2').className = 'task ' + (!D.ubicado ? 'locked' : (tieneFoto ? 'ok' : 'on'));
  $('#inFoto').disabled = !D.ubicado;
  const im = $('#fotoPrev');
  if (D.mini && !im.dataset.local) { im.src = D.mini; im.hidden = false; }
  $('#btnEdificio').disabled = !(D.ubicado && tieneFoto);
}
function conectarMapa() {
  const svg = $('#mapa');
  const act = async g => {
    const eq = eqActual(); const id = g.dataset.id;
    if (D.ubicado) { if (id !== eq.lugar) { g.classList.remove('no'); void g.getBBox(); g.classList.add('no'); } return; }
    const intentos = (D.intentos || 0) + 1;
    D.intentos = intentos; $('#chipIntentos').textContent = 'Attempts: ' + intentos;
    if (id === eq.lugar) {
      D.ubicado = true;
      g.classList.add('si'); enfocar(id, true); pintarMision();
      const r = await guardar({ intentos, ubicado: true });
      if (r !== true) setMsg($('#t1msg'), msgErr(r) + ' Your answer will be saved when you are back online.', 'bad');
    } else {
      g.classList.remove('no'); void g.getBBox(); g.classList.add('no');
      setMsg($('#t1msg'), (LUGARES[id] ? 'That is another place on campus, not your destination. ' : 'That is not your destination. ') + 'Hint: ' + LUGARES[eq.lugar].pista, 'bad');
      guardar({ intentos });
    }
  };
  svg.addEventListener('click', e => { const g = e.target.closest('.bld'); if (g) act(g); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('.bld'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); act(g); } });
}
async function aJpeg(file, max, q) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}
$('#inFoto').addEventListener('change', async ev => {
  const file = ev.target.files && ev.target.files[0]; if (!file) return;
  const m = $('#t2msg'); const im = $('#fotoPrev');
  im.src = URL.createObjectURL(file); im.dataset.local = '1'; im.hidden = false;
  setMsg(m, 'Posting photo…');
  let grande, mini;
  try { grande = await aJpeg(file, 1600, .82); mini = await aJpeg(file, 360, .6); }
  catch { setMsg(m, 'That file is not a supported image. Use a JPG or PNG photo.', 'bad'); return; }
  const r = await API.llamar({ a: 'foto', codigo: S.codigo, equipo: S.equipo, pin: S.pin, foto: grande.split(',')[1], mini });
  if (r.ok) { D = Object.assign(D, r.team); setMsg(m, 'Photo posted on your group wall.', 'good'); pintarMision(); cargarMuro(); }
  else setMsg(m, msgErr(r), 'bad');
});
$('#btnEdificio').addEventListener('click', () => transicion(() => { pintarEdificio(); mostrar('edificio'); }));
$('#btnMapa').addEventListener('click', () => transicion(() => { pintarMision(); mostrar('mision'); enfocar(D.lugar, false); }));

/* ===================== MURO ===================== */
let tMuro = null;
function iniciarMuro() { clearInterval(tMuro); cargarMuro(); tMuro = setInterval(() => { if (!document.hidden && (vista === 'mision' || vista === 'edificio')) cargarMuro(); }, 45000); }
async function cargarMuro() {
  if (!S) return;
  $('#muroGrupo').textContent = 'Group ' + (D && D.grupo || '');
  const r = await API.llamar({ a: 'muro', codigo: S.codigo });
  if (!r.ok) return;
  const fotos = r.fotos.sort((a, b) => String(a.fotoEn).localeCompare(String(b.fotoEn)));
  $('#muro').innerHTML = fotos.length ? fotos.map(d => `<figure class="polaroid" style="margin:0"><img src="${esc(d.mini)}" alt="Team ${d.equipo} at ${esc(LUGARES[d.lugar] && LUGARES[d.lugar].nombre)}" loading="lazy"><b>Team ${d.equipo} · ${esc(LUGARES[d.lugar] && LUGARES[d.lugar].nombre)}</b><span>Arrived ${hora(d.fotoEn)}</span></figure>`).join('') : '<p class="empty">No team has arrived yet. The first photo will show up here.</p>';
}

/* ===================== FASE 2 ===================== */
let pendientes = {}, tGuardar = null;
function pintarEdificio() {
  const eq = eqActual();
  $('#eBadge').textContent = eq.n; $('#eBadge').style.setProperty('--c', eq.color);
  $('#eGrupo').textContent = 'Group ' + D.grupo + ' · ' + LUGARES[eq.lugar].nombre;
  $('#eTitulo').textContent = 'Team ' + eq.n + ' · ' + eq.titulo;
  $('#eLugar').textContent = LUGARES[eq.lugar].nombre;
  $('#eAreas').innerHTML = eq.areas.map(a => `<span class="area">${esc(a)}</span>`).join('');
  $('#qs').innerHTML = preguntas(eq).map(([id, tag, t]) => `<div class="q"><span class="tag">${esc(tag)}</span><label for="q-${id}">${esc(t)}</label><textarea id="q-${id}" data-q="${id}" rows="3"></textarea></div>`).join('');
  document.querySelectorAll('#qs textarea').forEach(ta => {
    ta.value = (D.respuestas || {})[ta.dataset.q] || '';
    ta.addEventListener('input', () => { pendientes[ta.dataset.q] = ta.value; guardarBorrador(); estado('Typing…'); clearTimeout(tGuardar); tGuardar = setTimeout(vaciar, 1500); progreso(); });
    ta.addEventListener('blur', () => { if (Object.keys(pendientes).length) { clearTimeout(tGuardar); vaciar(); } });
  });
  progreso();
  estado(D.actualizado ? 'Saved ' + hora(D.actualizado) : 'No changes');
  construir3D(eq.lugar);
}
async function vaciar() {
  const p = pendientes; if (!Object.keys(p).length) return;
  pendientes = {};
  estado('Saving…'); $('#btnReintentar').hidden = true;
  const r = await guardar({ respuestas: p });
  if (r === true) { guardarBorrador(); estado((API.DEMO ? 'Saved in this browser ' : 'Saved ') + hora(D.actualizado)); }
  else { pendientes = Object.assign(p, pendientes); guardarBorrador(); estado(msgErr(r) + ' Your text is kept on this phone.'); $('#btnReintentar').hidden = false; }
}
$('#btnReintentar').addEventListener('click', vaciar);
function estado(t) { $('#saveState').textContent = t; }
function progreso() {
  const tas = [...document.querySelectorAll('#qs textarea')]; if (!tas.length) return;
  const n = tas.filter(t => t.value.trim().length >= 3).length;
  $('#prog').style.width = (n / tas.length * 100) + '%';
}
$('#btnIrF3').addEventListener('click', async () => { if (Object.keys(pendientes).length) await vaciar(); irFase3(); });

/* ===================== FASE 2: 3D (en campus.js) ===================== */

/* ===================== FASE 3 ===================== */
let pendientes3 = {}, tGuardar3 = null, GRUPO3 = null;
async function irFase3() {
  // Revisar si el maestro ya abrió la fase 3
  const r = await API.llamar({ a: 'entrar', codigo: S.codigo, equipo: S.equipo, pin: S.pin });
  if (r.ok) D = Object.assign(D, r.team);
  transicion(() => { pintarFase3(); mostrar('fase3'); });
}
$('#btnRevisarF3').addEventListener('click', irFase3);
function pintarFase3() {
  $('#f3Cerrada').hidden = !!D.fase3; $('#f3Abierta').hidden = !D.fase3;
  if (!D.fase3) return;
  const eq = eqActual();
  $('#xBadge').textContent = eq.n; $('#xBadge').style.setProperty('--c', eq.color);
  $('#xLugar').textContent = 'Team ' + eq.n + ' · ' + LUGARES[eq.lugar].nombre;
  $('#xs').innerHTML = EXPLICACION.map(([id, tag, t, rows]) => `<div class="q"><span class="tag">${esc(tag)}</span><label for="x-${id}">${esc(t)}</label><textarea id="x-${id}" data-x="${id}" rows="${rows}"></textarea></div>`).join('');
  document.querySelectorAll('#xs textarea').forEach(ta => {
    ta.value = (D.explicacion || {})[ta.dataset.x] || '';
    ta.addEventListener('input', () => { pendientes3[ta.dataset.x] = ta.value; guardarBorrador(); $('#saveState3').textContent = 'Typing…'; clearTimeout(tGuardar3); tGuardar3 = setTimeout(() => vaciar3(false), 1500); });
  });
  $('#saveState3').textContent = D.explicadoEn ? 'Shared with your group ' + hora(D.explicadoEn) : 'Draft — not shared yet';
  cargarGrupo();
}
async function vaciar3(enviar) {
  const p = pendientes3; pendientes3 = {};
  $('#saveState3').textContent = 'Saving…';
  const r = await guardar({ explicacion: p, enviarExplicacion: !!enviar });
  if (r === true) { guardarBorrador(); $('#saveState3').textContent = D.explicadoEn ? 'Saved · shared with your group' : 'Draft saved ' + hora(D.actualizado); return true; }
  pendientes3 = Object.assign(p, pendientes3); guardarBorrador(); $('#saveState3').textContent = msgErr(r); return false;
}
$('#fExplica').addEventListener('submit', async ev => {
  ev.preventDefault();
  document.querySelectorAll('#xs textarea').forEach(ta => { pendientes3[ta.dataset.x] = ta.value; });
  const vacios = EXPLICACION.filter(([id]) => (pendientes3[id] || '').trim().length < 3);
  if (vacios.length) { setMsg($('#xMsg'), 'Complete every field before sharing: ' + vacios.map(v => v[1]).join(', ') + '.', 'bad'); return; }
  clearTimeout(tGuardar3);
  const ok = await vaciar3(true);
  if (ok) { setMsg($('#xMsg'), 'Shared! Your group can now read your explanation. You can still edit it.', 'good'); cargarGrupo(); mostrar('fase3'); }
  else setMsg($('#xMsg'), 'Could not share. Try again.', 'bad');
});

async function cargarGrupo() {
  const box = $('#grupoMapa');
  const r = await API.llamar({ a: 'grupoFase3', codigo: S.codigo, equipo: S.equipo, pin: S.pin });
  if (!r.ok) { box.innerHTML = `<p class="empty">${esc(msgErr(r))}</p>`; return; }
  GRUPO3 = r;
  $('#gNombre').textContent = 'Group ' + r.grupo;
  const porLugar = {};
  r.equipos.forEach(t => { (porLugar[t.lugar] = porLugar[t.lugar] || []).push(t); });
  const orden = ['learning', 'edificio1', 'edificio2', 'metra', 'almacen', 'acopio'];
  box.innerHTML = orden.map(lg => {
    const eqs = EQUIPOS.filter(e => e.lugar === lg);
    return `<div class="place"><h3>${esc(LUGARES[lg].nombre)}</h3>${eqs.map(e => {
      const t = (porLugar[lg] || []).find(x => x.equipo === e.n);
      if (!t || !t.explicadoEn) return `<div class="tcard"><b>Team ${e.n} · ${esc(e.titulo)}</b><span class="pending">${t ? 'Still writing their explanation.' : 'Not registered.'}</span></div>`;
      const x = t.explicacion;
      return `<div class="tcard"><b>Team ${e.n} · ${esc(e.titulo)}</b><p>${esc(x.resumen)}</p><ul class="facts">${[x.dato1, x.dato2, x.dato3].filter(Boolean).map(f => `<li>${esc(f)}</li>`).join('')}</ul><p><b>Fun fact:</b> ${esc(x.curioso)}</p><p><b>Tip:</b> ${esc(x.consejo)}</p>${t.respuestas.c1 ? `<details><summary>Contact details</summary><dl class="ans"><dt>Person in charge</dt><dd>${esc(t.respuestas.c1)}</dd><dt>Location</dt><dd>${esc(t.respuestas.c3)}</dd><dt>Contact</dt><dd>${esc(t.respuestas.c5)}</dd></dl></details>` : ''}</div>`;
    }).join('')}</div>`;
  }).join('');
}
$('#btnRecargar').addEventListener('click', cargarGrupo);

/* ---------- Descargas para el mapa mental ---------- */
function arbol() {
  const r = GRUPO3; if (!r) return null;
  const raiz = { t: 'UPSRJ Campus – Group ' + r.grupo, h: [] };
  ['learning', 'edificio1', 'edificio2', 'metra', 'almacen', 'acopio'].forEach(lg => {
    const nodo = { t: LUGARES[lg].nombre, h: [] };
    EQUIPOS.filter(e => e.lugar === lg).forEach(e => {
      const t = r.equipos.find(x => x.equipo === e.n); if (!t) return;
      const x = t.explicacion || {}, a = t.respuestas || {};
      const hijos = [];
      if (x.resumen) hijos.push({ t: 'Summary: ' + x.resumen });
      const datos = [x.dato1, x.dato2, x.dato3].filter(Boolean);
      if (datos.length) hijos.push({ t: 'Key facts', h: datos.map(d => ({ t: d })) });
      if (a.c1) hijos.push({ t: 'Person in charge: ' + a.c1 });
      if (a.c4) hijos.push({ t: 'Services: ' + a.c4 });
      if (a.c3) hijos.push({ t: 'Location: ' + a.c3 });
      if (a.c5) hijos.push({ t: 'Contact: ' + a.c5 });
      if (x.curioso) hijos.push({ t: 'Fun fact: ' + x.curioso });
      if (x.consejo) hijos.push({ t: 'Tip: ' + x.consejo });
      nodo.h.push({ t: e.titulo, h: hijos });
    });
    if (nodo.h.length) raiz.h.push(nodo);
  });
  return raiz;
}
const limpio = s => String(s).replace(/\s+/g, ' ').trim();
function aMarkdown(n, d = 0) {
  if (d < 3) return '#'.repeat(d + 1) + ' ' + limpio(n.t) + '\n\n' + (n.h || []).map(c => aMarkdown(c, d + 1)).join('') + (d < 2 ? '' : '\n');
  return '  '.repeat(d - 3) + '- ' + limpio(n.t) + '\n' + (n.h || []).map(c => aMarkdown(c, d + 1)).join('');
}
function aTexto(n, d = 0) { return '\t'.repeat(d) + limpio(n.t) + '\n' + (n.h || []).map(c => aTexto(c, d + 1)).join(''); }
const xml = s => limpio(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function aOpml(n) {
  const nodo = m => `<outline text="${xml(m.t)}">${(m.h || []).map(nodo).join('')}</outline>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0"><head><title>${xml(n.t)}</title></head><body>${nodo(n)}</body></opml>\n`;
}
function bajar(nombre, texto, tipo) {
  const b = new Blob([texto], { type: tipo }); const u = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
const nombreArchivo = ext => 'campus-mission-' + (GRUPO3 ? GRUPO3.grupo : 'group').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.' + ext;
function sinDatos() { const a = arbol(); if (!a || !a.h.length) { setMsg($('#dlMsg'), 'There is nothing to download yet. Wait until teams share their explanations.', 'bad'); return null; } $('#dlMsg').hidden = true; return a; }
$('#dlMd').addEventListener('click', () => { const a = sinDatos(); if (a) bajar(nombreArchivo('md'), aMarkdown(a), 'text/markdown;charset=utf-8'); });
$('#dlOpml').addEventListener('click', () => { const a = sinDatos(); if (a) bajar(nombreArchivo('opml'), aOpml(a), 'text/x-opml;charset=utf-8'); });
$('#dlTxt').addEventListener('click', async () => {
  const a = sinDatos(); if (!a) return; const t = aTexto(a);
  try { await navigator.clipboard.writeText(t); setMsg($('#dlMsg'), 'Copied. Paste it into Canva, Miro, MindMeister or XMind to create the mind map.', 'good'); }
  catch { bajar(nombreArchivo('txt'), t, 'text/plain;charset=utf-8'); setMsg($('#dlMsg'), 'Could not copy, so the text was downloaded as a file.', 'good'); }
});
$('#dlPdf').addEventListener('click', () => window.print());

/* ===================== ARRANQUE ===================== */
pintarInicio();
mostrar('inicio');
reanudar();
