/**
 * Campus Mission — servidor en Google Apps Script
 * Universidad Politécnica de Santa Rosa Jáuregui · Tutoring for Immersion
 *
 * Guarda todo en el Drive de la cuenta que publique este script
 * (cguerrero@upsrj.edu.mx): una hoja de cálculo con grupos y equipos,
 * y una carpeta con las fotos de cada equipo.
 *
 * INSTALACIÓN (una sola vez)
 *  1. Cambia PIN_DOCENTE abajo por un PIN que solo tú conozcas.
 *  2. En el menú de funciones elige "instalar" y pulsa Ejecutar. Acepta los permisos.
 *     Se crea la carpeta "Campus Mission (datos)" en tu Drive, con la hoja y la carpeta de fotos.
 *  3. Implementar > Nueva implementación > Tipo: Aplicación web
 *       Ejecutar como: Yo (cguerrero@upsrj.edu.mx)
 *       Quién tiene acceso: Cualquier usuario
 *     Copia la URL que termina en /exec y pégala en config.js de la página.
 */

const PIN_DOCENTE = 'CAMBIA-ESTE-PIN';

// Lugar de cada equipo (debe coincidir con data.js de la página)
const LUGAR_EQUIPO = {1:'learning',2:'learning',3:'learning',4:'edificio1',5:'edificio1',6:'edificio1',7:'almacen',8:'acopio',9:'edificio2',10:'metra'};

const PREGUNTAS = ['c1','c2','c3','c4','c5','e1','e2','e3','e4','c6'];
const EXPLICA = ['resumen','dato1','dato2','dato3','curioso','consejo'];

const COLS_EQUIPOS = ['clave','codigo','grupo','equipo','lugar','integrantes','pinHash','ubicado','intentos','ubicadoEn',
  'fotoId','fotoEn','sinFoto'].concat(PREGUNTAS.map(function(q){return 'r_'+q;}))
  .concat(EXPLICA.map(function(k){return 'x_'+k;})).concat(['explicadoEn','creado','actualizado']);
const ENCABEZADOS_LEGIBLES = {
  clave:'Clave', codigo:'Código de grupo', grupo:'Grupo', equipo:'Equipo', lugar:'Lugar', integrantes:'Integrantes',
  pinHash:'(PIN cifrado)', ubicado:'¿Ubicó el edificio?', intentos:'Intentos en el mapa', ubicadoEn:'Ubicado en',
  fotoId:'Foto (Drive)', fotoEn:'Foto en', sinFoto:'Sin foto',
  r_c1:'Person in charge', r_c2:'What it includes', r_c3:'Location', r_c4:'Services', r_c5:'Contact',
  r_e1:'Specific 1', r_e2:'Specific 2', r_e3:'Specific 3', r_e4:'Specific 4', r_c6:'For new students',
  x_resumen:'F3 · Summary', x_dato1:'F3 · Key fact 1', x_dato2:'F3 · Key fact 2', x_dato3:'F3 · Key fact 3',
  x_curioso:'F3 · Fun fact', x_consejo:'F3 · Tip for new students', explicadoEn:'F3 · Enviado en',
  creado:'Creado', actualizado:'Última modificación'
};

/* ---------------- instalación ---------------- */
function instalar() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) { Logger.log('Ya estaba instalado: ' + SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl()); return; }
  const carpeta = DriveApp.createFolder('Campus Mission (datos)');
  const fotos = carpeta.createFolder('Fotos');
  const ss = SpreadsheetApp.create('Campus Mission – Respuestas');
  DriveApp.getFileById(ss.getId()).moveTo(carpeta);
  const g = ss.getSheets()[0]; g.setName('Grupos');
  g.appendRow(['Código', 'Nombre del grupo', 'Fase 3 abierta', 'Creado']); g.setFrozenRows(1);
  const e = ss.insertSheet('Equipos');
  e.appendRow(COLS_EQUIPOS.map(function(c){return ENCABEZADOS_LEGIBLES[c] || c;})); e.setFrozenRows(1);
  e.hideColumns(COLS_EQUIPOS.indexOf('pinHash') + 1);
  const m = ss.insertSheet('Miniaturas');
  m.appendRow(['Clave', 'Miniatura']); m.hideSheet();
  props.setProperties({ SHEET_ID: ss.getId(), FOTOS_ID: fotos.getId(), CARPETA_ID: carpeta.getId() });
  Logger.log('Listo. Hoja: ' + ss.getUrl());
}

/* ---------------- entrada web ---------------- */
function doGet() { return json_({ ok: true, app: 'Campus Mission', version: 1 }); }

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const r = enrutar_(req);
    return json_(r);
  } catch (err) {
    return json_({ ok: false, error: 'server', detail: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function enrutar_(q) {
  switch (q.a) {
    case 'grupo': return grupoInfo_(q);
    case 'entrar': return entrar_(q);
    case 'guardar': return guardar_(q);
    case 'foto': return foto_(q);
    case 'muro': return muro_(q);
    case 'grupoFase3': return grupoFase3_(q);
    case 'docente': return docente_(q);
  }
  return { ok: false, error: 'unknown_action' };
}

/* ---------------- utilidades de hoja ---------------- */
function ss_() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')); }
function hoja_(n) { return ss_().getSheetByName(n); }
function norm_(c) { return String(c || '').trim().toUpperCase().replace(/\s+/g, ''); }
function ahora_() { return new Date().toISOString(); }
function hash_(codigo, equipo, pin) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, codigo + '|' + equipo + '|' + String(pin) + '|campus');
  return b.map(function(x){ return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function grupos_() {
  const v = hoja_('Grupos').getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) if (v[i][0]) out.push({ fila: i + 1, codigo: String(v[i][0]), nombre: String(v[i][1]), fase3: v[i][2] === true || v[i][2] === 'TRUE', creado: v[i][3] });
  return out;
}
function grupo_(codigo) { const c = norm_(codigo); return grupos_().filter(function(g){ return g.codigo === c; })[0] || null; }

function equipos_() {
  const sh = hoja_('Equipos'); const v = sh.getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) {
    if (!v[i][0]) continue;
    const o = { _fila: i + 1 };
    COLS_EQUIPOS.forEach(function(c, j){ o[c] = v[i][j]; });
    out.push(o);
  }
  return out;
}
function equipo_(codigo, n) { const k = norm_(codigo) + '|' + Number(n); return equipos_().filter(function(t){ return t.clave === k; })[0] || null; }
function escribirEquipo_(t) {
  const fila = COLS_EQUIPOS.map(function(c){ return t[c] === undefined ? '' : t[c]; });
  const sh = hoja_('Equipos');
  if (t._fila) sh.getRange(t._fila, 1, 1, fila.length).setValues([fila]);
  else { sh.appendRow(fila); t._fila = sh.getLastRow(); }
}
function mini_(clave) {
  const v = hoja_('Miniaturas').getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (v[i][0] === clave) return { fila: i + 1, url: String(v[i][1]) };
  return null;
}

function publico_(t, g) {
  const r = {}; PREGUNTAS.forEach(function(q){ r[q] = String(t['r_' + q] || ''); });
  const x = {}; EXPLICA.forEach(function(k){ x[k] = String(t['x_' + k] || ''); });
  const m = t.fotoId ? mini_(t.clave) : null;
  return {
    codigo: t.codigo, grupo: t.grupo, equipo: Number(t.equipo), lugar: t.lugar, integrantes: String(t.integrantes || ''),
    ubicado: t.ubicado === true || t.ubicado === 'TRUE', intentos: Number(t.intentos || 0), ubicadoEn: String(t.ubicadoEn || ''),
    tieneFoto: !!t.fotoId, fotoEn: String(t.fotoEn || ''), sinFoto: t.sinFoto === true || t.sinFoto === 'TRUE', mini: m ? m.url : '',
    respuestas: r, explicacion: x, explicadoEn: String(t.explicadoEn || ''),
    actualizado: String(t.actualizado || ''), fase3: g ? !!g.fase3 : false
  };
}
function auth_(q) {
  const g = grupo_(q.codigo); if (!g) return { error: 'group_not_found' };
  const t = equipo_(g.codigo, q.equipo); if (!t) return { error: 'team_not_found' };
  if (t.pinHash !== hash_(g.codigo, Number(q.equipo), q.pin)) return { error: 'wrong_pin' };
  return { g: g, t: t };
}

/* ---------------- acciones de alumnos ---------------- */
function grupoInfo_(q) {
  const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
  const usados = equipos_().filter(function(t){ return t.codigo === g.codigo; }).map(function(t){ return Number(t.equipo); });
  return { ok: true, codigo: g.codigo, nombre: g.nombre, fase3: g.fase3, equiposRegistrados: usados };
}

function entrar_(q) {
  const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
  const n = Number(q.equipo); if (!(n >= 1 && n <= 10)) return { ok: false, error: 'bad_team' };
  if (!/^\d{4}$/.test(String(q.pin || ''))) return { ok: false, error: 'bad_pin' };
  let t = equipo_(g.codigo, n);
  if (!t) {
    t = { clave: g.codigo + '|' + n, codigo: g.codigo, grupo: g.nombre, equipo: n, lugar: LUGAR_EQUIPO[n],
          integrantes: String(q.integrantes || '').slice(0, 600), pinHash: hash_(g.codigo, n, q.pin),
          ubicado: false, intentos: 0, creado: ahora_(), actualizado: ahora_() };
    escribirEquipo_(t);
    return { ok: true, nuevo: true, team: publico_(t, g) };
  }
  if (t.pinHash !== hash_(g.codigo, n, q.pin)) return { ok: false, error: 'wrong_pin' };
  if (q.integrantes && String(q.integrantes).trim() && String(q.integrantes) !== String(t.integrantes)) {
    t.integrantes = String(q.integrantes).slice(0, 600); t.actualizado = ahora_(); escribirEquipo_(t);
  }
  return { ok: true, nuevo: false, team: publico_(t, g) };
}

function guardar_(q) {
  const a = auth_(q); if (a.error) return { ok: false, error: a.error };
  const t = a.t, d = q.datos || {};
  if (d.intentos !== undefined) t.intentos = Math.max(Number(t.intentos || 0), Number(d.intentos) || 0);
  if (d.ubicado === true && !(t.ubicado === true || t.ubicado === 'TRUE')) { t.ubicado = true; t.ubicadoEn = ahora_(); }
  if (d.sinFoto === true) t.sinFoto = true;
  if (d.respuestas) PREGUNTAS.forEach(function(k){ if (d.respuestas[k] !== undefined) t['r_' + k] = String(d.respuestas[k]).slice(0, 4000); });
  if (d.explicacion) {
    if (!a.g.fase3) return { ok: false, error: 'phase3_closed' };
    EXPLICA.forEach(function(k){ if (d.explicacion[k] !== undefined) t['x_' + k] = String(d.explicacion[k]).slice(0, 4000); });
    if (d.enviarExplicacion) t.explicadoEn = ahora_();
  }
  t.actualizado = ahora_();
  escribirEquipo_(t);
  return { ok: true, team: publico_(t, a.g) };
}

function foto_(q) {
  const a = auth_(q); if (a.error) return { ok: false, error: a.error };
  const t = a.t;
  if (!q.foto) return { ok: false, error: 'no_photo' };
  const bytes = Utilities.base64Decode(String(q.foto));
  if (bytes.length > 8 * 1024 * 1024) return { ok: false, error: 'too_large' };
  const raiz = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOTOS_ID'));
  const sub = raiz.getFoldersByName(t.grupo).hasNext() ? raiz.getFoldersByName(t.grupo).next() : raiz.createFolder(t.grupo);
  const nombre = t.grupo + ' – Equipo ' + t.equipo + '.jpg';
  const viejos = sub.getFilesByName(nombre); while (viejos.hasNext()) viejos.next().setTrashed(true);
  const f = sub.createFile(Utilities.newBlob(bytes, 'image/jpeg', nombre));
  t.fotoId = f.getId(); t.fotoEn = ahora_(); t.sinFoto = false; t.actualizado = ahora_();
  escribirEquipo_(t);
  const mini = String(q.mini || '');
  if (mini.indexOf('data:image/') === 0 && mini.length < 48000) {
    const m = mini_(t.clave); const sh = hoja_('Miniaturas');
    if (m) sh.getRange(m.fila, 2).setValue(mini); else sh.appendRow([t.clave, mini]);
  }
  return { ok: true, team: publico_(t, a.g) };
}

function muro_(q) {
  const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
  const lista = equipos_().filter(function(t){ return t.codigo === g.codigo && t.fotoId; }).map(function(t){
    const m = mini_(t.clave); return { equipo: Number(t.equipo), lugar: t.lugar, fotoEn: String(t.fotoEn), mini: m ? m.url : '' };
  });
  return { ok: true, fotos: lista };
}

function grupoFase3_(q) {
  const a = auth_(q); if (a.error) return { ok: false, error: a.error };
  if (!a.g.fase3) return { ok: false, error: 'phase3_closed' };
  const lista = equipos_().filter(function(t){ return t.codigo === a.g.codigo; }).map(function(t){
    const p = publico_(t, a.g); delete p.integrantes; return p;
  });
  return { ok: true, grupo: a.g.nombre, equipos: lista };
}

/* ---------------- panel docente ---------------- */
function docente_(q) {
  if (String(q.pinDocente || '') !== PIN_DOCENTE || PIN_DOCENTE === 'CAMBIA-ESTE-PIN') return { ok: false, error: 'wrong_teacher_pin' };
  const props = PropertiesService.getScriptProperties();
  if (q.op === 'grupos') {
    const eqs = equipos_();
    return { ok: true, hoja: ss_().getUrl(), carpeta: DriveApp.getFolderById(props.getProperty('CARPETA_ID')).getUrl(),
      grupos: grupos_().map(function(g){ return { codigo: g.codigo, nombre: g.nombre, fase3: g.fase3, creado: String(g.creado),
        equipos: eqs.filter(function(t){ return t.codigo === g.codigo; }).length }; }) };
  }
  if (q.op === 'crearGrupo') {
    const nombre = String(q.nombre || '').trim().slice(0, 60); if (!nombre) return { ok: false, error: 'no_name' };
    const base = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GRUPO';
    const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let codigo;
    do { let s = ''; for (let i = 0; i < 4; i++) s += abc[Math.floor(Math.random() * abc.length)]; codigo = base + '-' + s; } while (grupo_(codigo));
    hoja_('Grupos').appendRow([codigo, nombre, false, ahora_()]);
    return { ok: true, codigo: codigo, nombre: nombre };
  }
  if (q.op === 'fase3') {
    const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
    hoja_('Grupos').getRange(g.fila, 3).setValue(!!q.abierta);
    return { ok: true, codigo: g.codigo, fase3: !!q.abierta };
  }
  if (q.op === 'equipos') {
    const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
    const lista = equipos_().filter(function(t){ return t.codigo === g.codigo; }).map(function(t){
      const p = publico_(t, g); p.fotoUrl = t.fotoId ? 'https://drive.google.com/file/d/' + t.fotoId + '/view' : ''; return p; });
    return { ok: true, grupo: g, equipos: lista };
  }
  if (q.op === 'reiniciarPin') {
    const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
    const t = equipo_(g.codigo, q.equipo); if (!t) return { ok: false, error: 'team_not_found' };
    if (!/^\d{4}$/.test(String(q.pin || ''))) return { ok: false, error: 'bad_pin' };
    t.pinHash = hash_(g.codigo, Number(q.equipo), q.pin); t.actualizado = ahora_(); escribirEquipo_(t);
    return { ok: true };
  }
  if (q.op === 'eliminarEquipo') {
    const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
    const t = equipo_(g.codigo, q.equipo); if (!t) return { ok: false, error: 'team_not_found' };
    archivarEquipos_([t], 'Equipo eliminado');
    return { ok: true };
  }
  if (q.op === 'eliminarGrupo') {
    const g = grupo_(q.codigo); if (!g) return { ok: false, error: 'group_not_found' };
    if (norm_(q.confirmar) !== g.codigo) return { ok: false, error: 'confirm_mismatch' };
    const eqs = equipos_().filter(function(t){ return t.codigo === g.codigo; });
    archivarEquipos_(eqs, 'Grupo eliminado');
    const sh = hoja_('Grupos');
    archivo_('Grupos eliminados', ['Eliminado en', 'Código', 'Nombre del grupo', 'Fase 3 abierta', 'Creado'])
      .appendRow([ahora_(), g.codigo, g.nombre, g.fase3, g.creado]);
    sh.deleteRow(g.fila);
    // La carpeta de fotos del grupo se conserva, solo se renombra
    const raiz = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOTOS_ID'));
    const it = raiz.getFoldersByName(g.nombre);
    if (it.hasNext() && !grupos_().some(function(x){ return x.nombre === g.nombre; })) it.next().setName(g.nombre + ' (eliminado ' + ahora_().slice(0, 10) + ')');
    return { ok: true, equiposArchivados: eqs.length };
  }
  return { ok: false, error: 'unknown_op' };
}

/* ---------------- eliminar sin perder datos ----------------
   Las filas pasan a pestañas de archivo ("Eliminados", "Grupos eliminados")
   y las fotos se quedan en Drive con "(eliminado)" en el nombre. */
function archivo_(nombre, encabezados) {
  const ss = ss_(); let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.appendRow(encabezados); sh.setFrozenRows(1); }
  return sh;
}
function archivarEquipos_(lista, motivo) {
  if (!lista.length) return;
  const arch = archivo_('Eliminados', ['Eliminado en', 'Motivo'].concat(COLS_EQUIPOS.map(function(c){ return ENCABEZADOS_LEGIBLES[c] || c; })));
  const sh = hoja_('Equipos');
  lista.slice().sort(function(a, b){ return b._fila - a._fila; }).forEach(function(t) {
    arch.appendRow([ahora_(), motivo].concat(COLS_EQUIPOS.map(function(c){ return c === 'pinHash' ? '' : (t[c] === undefined ? '' : t[c]); })));
    if (t.fotoId) { try { const f = DriveApp.getFileById(String(t.fotoId)); f.setName(f.getName().replace(/\.jpg$/i, '') + ' (eliminado).jpg'); } catch (e) {} }
    const m = mini_(t.clave); if (m) hoja_('Miniaturas').deleteRow(m.fila);
    sh.deleteRow(t._fila);
  });
}
