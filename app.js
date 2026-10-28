/* Campus Mission — lógica de la página de alumnos */
const API = window.CampusAPI;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
const hora = iso => { try { return iso ? new Date(iso).toLocaleString(IDIOMA === 'es' ? 'es-MX' : 'en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : ''; } catch { return ''; } };
const ERRS = ['offline', 'group_not_found', 'team_not_found', 'wrong_pin', 'bad_pin', 'phase3_closed', 'too_large'];
const msgErr = r => { const e = (r && r.error) || 'error'; return ERRS.includes(e) ? t(e) : t('genericErr', { e }); };

let S = lsGet('campusMission.sesion', null); // {codigo, equipo, pin}
let D = null;  // estado del equipo (desde el servidor)
let G = null;  // info del grupo
let vista = 'inicio';
const eqActual = () => EQUIPOS.find(e => e.n === (D ? D.equipo : S && S.equipo));
const draftKey = () => 'campusMission.borrador.' + S.codigo + '.' + S.equipo;

function aviso(txt) { const a = $('#aviso'); a.textContent = txt || ''; a.hidden = !txt; }
function setMsg(el, txt, tipo) { el.textContent = txt; el.className = 'msg' + (tipo ? ' ' + tipo : ''); el.hidden = !txt; }

/* ===================== IDIOMA Y LECTURA ===================== */
let LV = false;
function cambiarIdioma(lang) {
  aplicarIdiomaDatos(lang);
  try { localStorage.setItem('campusMission.lang', IDIOMA); } catch {}
  aplicarTextos();
  $('#btnEn').setAttribute('aria-pressed', IDIOMA === 'en' ? 'true' : 'false');
  $('#btnEs').setAttribute('aria-pressed', IDIOMA === 'es' ? 'true' : 'false');
  const nota = t('lsmNote'); $('#lsmNote').textContent = nota; $('#lsmNote').hidden = !nota;
  $('#demo').hidden = !API.DEMO;
  repintar();
}
function cambiarLV(on) {
  LV = !!on;
  document.documentElement.classList.toggle('lv', LV);
  try { localStorage.setItem('campusMission.lv', LV ? '1' : '0'); } catch {}
  $('#btnLv').setAttribute('aria-pressed', LV ? 'true' : 'false');
  $('#btnLv').querySelector('[data-t]').dataset.t = LV ? 'btnLvOff' : 'btnLv';
  aplicarTextos(); temaTexto();
  if (vista === 'edificio') { if (LV) parar3D(); else arrancar3D(); }
}
let lvFs = parseInt((() => { try { return localStorage.getItem('campusMission.fs'); } catch { return null; } })() || '22', 10);
function aplicarFs() { document.documentElement.style.setProperty('--lv-fs', lvFs + 'px'); try { localStorage.setItem('campusMission.fs', String(lvFs)); } catch {} }
function temaTexto() { $('#lvTema').textContent = t(document.documentElement.classList.contains('lv-claro') ? 'toBlack' : 'toWhite'); }
$('#btnEn').addEventListener('click', () => cambiarIdioma('en'));
$('#btnEs').addEventListener('click', () => cambiarIdioma('es'));
$('#btnLv').addEventListener('click', () => cambiarLV(!LV));
$('#lvMas').addEventListener('click', () => { lvFs = Math.min(lvFs + 4, 40); aplicarFs(); });
$('#lvMenos').addEventListener('click', () => { lvFs = Math.max(lvFs - 4, 16); aplicarFs(); });
$('#lvTema').addEventListener('click', () => {
  const claro = !document.documentElement.classList.contains('lv-claro');
  document.documentElement.classList.toggle('lv-claro', claro);
  try { localStorage.setItem('campusMission.lvClaro', claro ? '1' : '0'); } catch {}
  temaTexto();
});
function repintar() {
  pintarInicio();
  if (G) pintarListaEquipos();
  ajustarAyuda();
  const m = $('#mapa'); if (m) { m.remove(); }
  if (!D) { mostrar(vista); return; }
  if (vista === 'mision') { pintarMision(); if (D.ubicado) enfocar(D.lugar, false); }
  if (vista === 'edificio') pintarEdificio();
  if (vista === 'fase3') pintarFase3();
  cargarMuro();
  mostrar(vista, true);
}

/* ===================== VISTAS ===================== */
function fase1Lista() { return D && D.ubicado && (D.tieneFoto || D.sinFoto); }
function mostrar(v, sinScroll) {
  vista = v;
  $('#vInicio').hidden = v !== 'inicio'; $('#vMision').hidden = v !== 'mision';
  $('#vEdificio').hidden = v !== 'edificio'; $('#vFase3').hidden = v !== 'fase3';
  $('#vMuro').hidden = !(D && (v === 'mision' || v === 'edificio'));
  $('#btnSalir').hidden = v === 'inicio';
  const listo = fase1Lista();
  const b1 = $('#st1'), b2 = $('#st2'), b3 = $('#st3');
  b1.disabled = !D; b2.disabled = !listo; b3.disabled = !listo;
  b1.className = 'step' + (v === 'mision' ? ' on' : '') + (listo ? ' done' : '');
  b2.className = 'step' + (v === 'edificio' ? ' on' : '');
  b3.className = 'step' + (v === 'fase3' ? ' on' : '') + (D && D.explicadoEn ? ' done' : '');
  [b1, b2, b3].forEach(b => b.toggleAttribute('aria-current', b.classList.contains('on')));
  if (v === 'edificio' && !LV) arrancar3D(); else parar3D();
  if (!sinScroll) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}
async function transicion(fn) {
  const f = $('#flash');
  if (reduce || LV) { fn(); return; }
  f.classList.add('on'); await new Promise(r => setTimeout(r, 340)); fn(); await new Promise(r => setTimeout(r, 60)); f.classList.remove('on');
}
$('#st1').addEventListener('click', () => transicion(() => { pintarMision(); mostrar('mision'); if (D.ubicado) enfocar(D.lugar, false); }));
$('#st2').addEventListener('click', () => transicion(() => { pintarEdificio(); mostrar('edificio'); }));
$('#st3').addEventListener('click', () => irFase3());

/* ===================== INICIO ===================== */
function pintarInicio() {
  $('#listaEquipos').innerHTML = EQUIPOS.map(e => `<div class="eq" style="--c:${e.color}"><div class="n">${e.n}</div><b>${esc(e.titulo)}</b><span>${esc(LUGARES[e.lugar].nombre)}</span></div>`).join('');
}
function pintarListaEquipos() {
  const sel = $('#inEquipo'); const prev = sel.value;
  const usados = new Set(G.equiposRegistrados || []);
  sel.innerHTML = `<option value="">${esc(t('chooseTeam'))}</option>` + EQUIPOS.map(e => `<option value="${e.n}">${esc(t('teamN'))}${e.n} · ${esc(e.titulo)}${usados.has(e.n) ? ' ' + esc(t('registered')) : ''}</option>`).join('');
  sel.value = prev || (S && S.codigo === G.codigo ? S.equipo : '');
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
  pintarListaEquipos();
  $('#pasoEquipo').hidden = false;
  ajustarAyuda();
}
function ajustarAyuda() {
  const n = +$('#inEquipo').value; const reg = G && (G.equiposRegistrados || []).includes(n);
  $('#ayudaPin').textContent = t(reg ? 'pinOld' : 'pinNew');
  $('#campoIntegrantes').hidden = !!reg;
  $('#ayudaEquipo').textContent = n ? t('destination') + LUGARES[EQUIPOS[n - 1].lugar].nombre : '';
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
  if (!equipo) { setMsg(err, t('chooseTeamErr'), 'bad'); return; }
  if (!/^\d{4}$/.test(pin)) { setMsg(err, t('bad_pin'), 'bad'); return; }
  const reg = (G.equiposRegistrados || []).includes(equipo);
  if (!reg && !integrantes) { setMsg(err, t('membersErr'), 'bad'); return; }
  const btn = $('#btnEntrarEquipo'); btn.disabled = true; btn.textContent = t('entering');
  const r = await API.llamar({ a: 'entrar', codigo: G.codigo, equipo, pin, integrantes });
  btn.disabled = false; btn.textContent = t('cont');
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
  aviso(t('opening'));
  const r = await API.llamar({ a: 'entrar', codigo: S.codigo, equipo: S.equipo, pin: S.pin });
  aviso('');
  if (r.ok) { G = { codigo: S.codigo }; abrir(r.team); }
  else if (r.error === 'offline') aviso(t('offline'));
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
  $('#mGrupo').textContent = t('group') + D.grupo; $('#mTitulo').textContent = t('teamN') + eq.n + ' · ' + eq.titulo;
  $('#mLugar').textContent = LUGARES[eq.lugar].nombre;
  $('#mAreas').innerHTML = eq.areas.map(a => `<span class="area">${esc(a)}</span>`).join('');
  $('#chipIntentos').textContent = t('attempts') + (D.intentos || 0);
  $('#t1').className = 'task ' + (D.ubicado ? 'ok' : 'on');
  pintarListaMapa();
  if (D.ubicado) {
    setMsg($('#t1msg'), t('found', { n: D.intentos || 1, w: t(D.intentos === 1 ? 'attempt' : 'attemptsW') }), 'good');
    document.querySelectorAll('.bld').forEach(g => g.classList.toggle('si', g.dataset.id === eq.lugar));
  }
  const tieneFoto = D.tieneFoto || D.sinFoto;
  $('#t2').className = 'task ' + (!D.ubicado ? 'locked' : (tieneFoto ? 'ok' : 'on'));
  $('#inFoto').disabled = !D.ubicado;
  const im = $('#fotoPrev'); im.alt = t('photoAlt');
  if (D.mini && !im.dataset.local) { im.src = D.mini; im.hidden = false; }
  $('#btnEdificio').disabled = !(D.ubicado && tieneFoto);
}
/* Lista de construcciones (alternativa al mapa, visible en baja visión) */
function pintarListaMapa() {
  const desc = DESCRIPCIONES[IDIOMA] || DESCRIPCIONES.en;
  const ids = CONSTRUCCIONES.map(c => c.id);
  // Orden fijo y mezclado para no delatar el destino
  const orden = ids.slice().sort((a, b) => desc[a].localeCompare(desc[b]));
  $('#listaBotones').innerHTML = orden.map(id => `<button type="button" class="lugar-btn${D && D.ubicado && id === D.lugar ? ' si' : ''}" data-id="${id}">${esc(desc[id])}</button>`).join('');
  $('#listaBotones').querySelectorAll('button').forEach(b => b.addEventListener('click', () => elegir(b.dataset.id)));
}
async function elegir(id) {
  const eq = eqActual();
  const g = document.querySelector(`.bld[data-id="${id}"]`);
  const sacudir = () => { if (g) { g.classList.remove('no'); void g.getBBox(); g.classList.add('no'); } };
  if (D.ubicado) { if (id !== eq.lugar) sacudir(); return; }
  const intentos = (D.intentos || 0) + 1;
  D.intentos = intentos; $('#chipIntentos').textContent = t('attempts') + intentos;
  if (id === eq.lugar) {
    D.ubicado = true;
    if (g) g.classList.add('si');
    enfocar(id, true); pintarMision();
    const r = await guardar({ intentos, ubicado: true });
    if (r !== true) setMsg($('#t1msg'), msgErr(r) + t('savedLater'), 'bad');
  } else {
    sacudir();
    setMsg($('#t1msg'), (LUGARES[id] ? t('otherPlace') : t('notDest')) + t('hint') + LUGARES[eq.lugar].pista, 'bad');
    guardar({ intentos });
  }
}
function conectarMapa() {
  const svg = $('#mapa');
  svg.addEventListener('click', e => { const g = e.target.closest('.bld'); if (g) elegir(g.dataset.id); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('.bld'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); elegir(g.dataset.id); } });
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
  setMsg(m, t('posting'));
  let grande, mini;
  try { grande = await aJpeg(file, 1600, .82); mini = await aJpeg(file, 360, .6); }
  catch { setMsg(m, t('badImage'), 'bad'); return; }
  const r = await API.llamar({ a: 'foto', codigo: S.codigo, equipo: S.equipo, pin: S.pin, foto: grande.split(',')[1], mini });
  if (r.ok) { D = Object.assign(D, r.team); setMsg(m, t('posted'), 'good'); pintarMision(); cargarMuro(); }
  else setMsg(m, msgErr(r), 'bad');
});
$('#btnEdificio').addEventListener('click', () => transicion(() => { pintarEdificio(); mostrar('edificio'); }));
$('#btnMapa').addEventListener('click', () => transicion(() => { pintarMision(); mostrar('mision'); enfocar(D.lugar, false); }));

/* ===================== MURO ===================== */
let tMuro = null;
function iniciarMuro() { clearInterval(tMuro); cargarMuro(); tMuro = setInterval(() => { if (!document.hidden && (vista === 'mision' || vista === 'edificio')) cargarMuro(); }, 45000); }
async function cargarMuro() {
  if (!S) return;
  $('#muroGrupo').textContent = t('group') + (D && D.grupo || '');
  const r = await API.llamar({ a: 'muro', codigo: S.codigo });
  if (!r.ok) return;
  const fotos = r.fotos.sort((a, b) => String(a.fotoEn).localeCompare(String(b.fotoEn)));
  const nom = lg => esc(LUGARES[lg] && LUGARES[lg].nombre);
  $('#muro').innerHTML = fotos.length ? fotos.map(d => `<figure class="polaroid" style="margin:0"><img src="${esc(d.mini)}" alt="${esc(t('teamN'))}${d.equipo} · ${nom(d.lugar)}" loading="lazy"><b>${esc(t('teamN'))}${d.equipo} · ${nom(d.lugar)}</b><span>${esc(t('arrived'))}${hora(d.fotoEn)}</span></figure>`).join('') : `<p class="empty">${esc(t('wallEmpty'))}</p>`;
}

/* ===================== FASE 2 ===================== */
let pendientes = {}, tGuardar = null;
function pintarEdificio() {
  const eq = eqActual();
  $('#eBadge').textContent = eq.n; $('#eBadge').style.setProperty('--c', eq.color);
  $('#eGrupo').textContent = t('group') + D.grupo + ' · ' + LUGARES[eq.lugar].nombre;
  $('#eTitulo').textContent = t('teamN') + eq.n + ' · ' + eq.titulo;
  $('#eLugar').textContent = LUGARES[eq.lugar].nombre;
  $('#eAreas').innerHTML = eq.areas.map(a => `<span class="area">${esc(a)}</span>`).join('');
  $('#qs').innerHTML = preguntas(eq).map(([id, tag, q]) => `<div class="q"><span class="tag">${esc(tag)}</span><label for="q-${id}">${esc(q)}</label><textarea id="q-${id}" data-q="${id}" rows="3"></textarea></div>`).join('');
  document.querySelectorAll('#qs textarea').forEach(ta => {
    ta.value = (D.respuestas || {})[ta.dataset.q] || '';
    ta.addEventListener('input', () => { pendientes[ta.dataset.q] = ta.value; guardarBorrador(); estado(t('typing')); clearTimeout(tGuardar); tGuardar = setTimeout(vaciar, 1500); progreso(); });
    ta.addEventListener('blur', () => { if (Object.keys(pendientes).length) { clearTimeout(tGuardar); vaciar(); } });
  });
  progreso();
  estado(D.actualizado ? t('saved') + hora(D.actualizado) : t('noChanges'));
  construir3D(eq.lugar);
}
async function vaciar() {
  const p = pendientes; if (!Object.keys(p).length) return;
  pendientes = {};
  estado(t('saving')); $('#btnReintentar').hidden = true;
  const r = await guardar({ respuestas: p });
  if (r === true) { guardarBorrador(); estado((API.DEMO ? t('savedLocal') : t('saved')) + hora(D.actualizado)); }
  else { pendientes = Object.assign(p, pendientes); guardarBorrador(); estado(msgErr(r) + t('keptPhone')); $('#btnReintentar').hidden = false; }
}
$('#btnReintentar').addEventListener('click', vaciar);
function estado(txt) { $('#saveState').textContent = txt; }
function progreso() {
  const tas = [...document.querySelectorAll('#qs textarea')]; if (!tas.length) return;
  const n = tas.filter(x => x.value.trim().length >= 3).length;
  $('#prog').style.width = (n / tas.length * 100) + '%';
}
$('#btnIrF3').addEventListener('click', async () => { if (Object.keys(pendientes).length) await vaciar(); irFase3(); });

/* ===================== FASE 3 ===================== */
let pendientes3 = {}, tGuardar3 = null, GRUPO3 = null;
async function irFase3() {
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
  $('#xLugar').textContent = t('teamN') + eq.n + ' · ' + LUGARES[eq.lugar].nombre;
  $('#xs').innerHTML = EXPLICACION.map(([id, tag, q, rows]) => `<div class="q"><span class="tag">${esc(tag)}</span><label for="x-${id}">${esc(q)}</label><textarea id="x-${id}" data-x="${id}" rows="${rows}"></textarea></div>`).join('');
  document.querySelectorAll('#xs textarea').forEach(ta => {
    ta.value = pendientes3[ta.dataset.x] !== undefined ? pendientes3[ta.dataset.x] : ((D.explicacion || {})[ta.dataset.x] || '');
    ta.addEventListener('input', () => { pendientes3[ta.dataset.x] = ta.value; guardarBorrador(); $('#saveState3').textContent = t('typing'); clearTimeout(tGuardar3); tGuardar3 = setTimeout(() => vaciar3(false), 1500); });
  });
  $('#saveState3').textContent = D.explicadoEn ? t('sharedAt') + hora(D.explicadoEn) : t('draft');
  $('#grupoMapa').innerHTML = `<p class="empty">${esc(t('loadingGroup'))}</p>`;
  cargarGrupo();
}
async function vaciar3(enviar) {
  const p = pendientes3; pendientes3 = {};
  $('#saveState3').textContent = t('saving');
  const r = await guardar({ explicacion: p, enviarExplicacion: !!enviar });
  if (r === true) { guardarBorrador(); $('#saveState3').textContent = D.explicadoEn ? t('savedShared') : t('draftSaved') + hora(D.actualizado); return true; }
  pendientes3 = Object.assign(p, pendientes3); guardarBorrador(); $('#saveState3').textContent = msgErr(r); return false;
}
$('#fExplica').addEventListener('submit', async ev => {
  ev.preventDefault();
  document.querySelectorAll('#xs textarea').forEach(ta => { pendientes3[ta.dataset.x] = ta.value; });
  const vacios = EXPLICACION.filter(([id]) => ((pendientes3[id] !== undefined ? pendientes3[id] : D.explicacion[id]) || '').trim().length < 3);
  if (vacios.length) { setMsg($('#xMsg'), t('completeAll', { f: vacios.map(v => v[1]).join(', ') }), 'bad'); return; }
  clearTimeout(tGuardar3);
  const ok = await vaciar3(true);
  if (ok) { setMsg($('#xMsg'), t('sharedOk'), 'good'); cargarGrupo(); mostrar('fase3', true); }
  else setMsg($('#xMsg'), t('shareFail'), 'bad');
});

const ORDEN_LUGARES = ['learning', 'edificio1', 'edificio2', 'metra', 'almacen', 'acopio'];
async function cargarGrupo() {
  const box = $('#grupoMapa');
  const r = await API.llamar({ a: 'grupoFase3', codigo: S.codigo, equipo: S.equipo, pin: S.pin });
  if (!r.ok) { box.innerHTML = `<p class="empty">${esc(msgErr(r))}</p>`; return; }
  GRUPO3 = r;
  $('#gNombre').textContent = t('group') + r.grupo;
  box.innerHTML = ORDEN_LUGARES.map(lg => {
    const eqs = EQUIPOS.filter(e => e.lugar === lg);
    return `<div class="place"><h3>${esc(LUGARES[lg].nombre)}</h3>${eqs.map(e => {
      const tm = r.equipos.find(x => x.equipo === e.n);
      if (!tm || !tm.explicadoEn) return `<div class="tcard"><b>${esc(t('teamN'))}${e.n} · ${esc(e.titulo)}</b><span class="pending">${esc(t(tm ? 'stillWriting' : 'notRegistered'))}</span></div>`;
      const x = tm.explicacion;
      return `<div class="tcard"><b>${esc(t('teamN'))}${e.n} · ${esc(e.titulo)}</b><p>${esc(x.resumen)}</p><ul class="facts">${[x.dato1, x.dato2, x.dato3].filter(Boolean).map(f => `<li>${esc(f)}</li>`).join('')}</ul><p><b>${esc(t('funFact'))}</b> ${esc(x.curioso)}</p><p><b>${esc(t('tip'))}</b> ${esc(x.consejo)}</p>${tm.respuestas.c1 ? `<details><summary>${esc(t('contactDetails'))}</summary><dl class="ans"><dt>${esc(ETIQUETAS.c1)}</dt><dd>${esc(tm.respuestas.c1)}</dd><dt>${esc(ETIQUETAS.c3)}</dt><dd>${esc(tm.respuestas.c3)}</dd><dt>${esc(ETIQUETAS.c5)}</dt><dd>${esc(tm.respuestas.c5)}</dd></dl></details>` : ''}</div>`;
    }).join('')}</div>`;
  }).join('');
}
$('#btnRecargar').addEventListener('click', cargarGrupo);

/* ---------- Descargas para el mapa mental ---------- */
function arbol() {
  const r = GRUPO3; if (!r) return null;
  const raiz = { t: t('campusRoot') + r.grupo, h: [] };
  ORDEN_LUGARES.forEach(lg => {
    const nodo = { t: LUGARES[lg].nombre, h: [] };
    EQUIPOS.filter(e => e.lugar === lg).forEach(e => {
      const tm = r.equipos.find(x => x.equipo === e.n); if (!tm) return;
      const x = tm.explicacion || {}, a = tm.respuestas || {};
      const hijos = [];
      if (x.resumen) hijos.push({ t: t('summary') + x.resumen });
      const datos = [x.dato1, x.dato2, x.dato3].filter(Boolean);
      if (datos.length) hijos.push({ t: t('keyFacts'), h: datos.map(d => ({ t: d })) });
      if (a.c1) hijos.push({ t: t('personInCharge') + a.c1 });
      if (a.c4) hijos.push({ t: t('services') + a.c4 });
      if (a.c3) hijos.push({ t: t('location') + a.c3 });
      if (a.c5) hijos.push({ t: t('contact') + a.c5 });
      if (x.curioso) hijos.push({ t: t('funFactD') + x.curioso });
      if (x.consejo) hijos.push({ t: t('tipD') + x.consejo });
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
const nombreArchivo = ext => 'campus-mission-' + (GRUPO3 ? GRUPO3.grupo : 'group').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-') + '.' + ext;
function sinDatos() { const a = arbol(); if (!a || !a.h.length) { setMsg($('#dlMsg'), t('nothingDl'), 'bad'); return null; } $('#dlMsg').hidden = true; return a; }
$('#dlMd').addEventListener('click', () => { const a = sinDatos(); if (a) bajar(nombreArchivo('md'), aMarkdown(a), 'text/markdown;charset=utf-8'); });
$('#dlOpml').addEventListener('click', () => { const a = sinDatos(); if (a) bajar(nombreArchivo('opml'), aOpml(a), 'text/x-opml;charset=utf-8'); });
$('#dlTxt').addEventListener('click', async () => {
  const a = sinDatos(); if (!a) return; const txt = aTexto(a);
  try { await navigator.clipboard.writeText(txt); setMsg($('#dlMsg'), t('copied'), 'good'); }
  catch { bajar(nombreArchivo('txt'), txt, 'text/plain;charset=utf-8'); setMsg($('#dlMsg'), t('copyFail'), 'good'); }
});
$('#dlPdf').addEventListener('click', () => window.print());

/* ===================== ARRANQUE ===================== */
LV = document.documentElement.classList.contains('lv');
$('#btnLv').setAttribute('aria-pressed', LV ? 'true' : 'false');
$('#btnLv').querySelector('[data-t]').dataset.t = LV ? 'btnLvOff' : 'btnLv';
aplicarFs();
cambiarIdioma((() => { try { return localStorage.getItem('campusMission.lang'); } catch { return null; } })() || 'en');
temaTexto();
mostrar('inicio');
reanudar();
