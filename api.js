/* Campus Mission — conexión con el servidor (Google Apps Script).
   Si config.js no tiene URL, la página funciona en MODO DE PRUEBA:
   todo se guarda solo en este navegador, para ensayar sin servidor. */
(function () {
  const URL_API = (window.CAMPUS_CONFIG && window.CAMPUS_CONFIG.API_URL || '').trim();
  const DEMO = !URL_API;

  async function llamar(datos) {
    if (DEMO) return demo(datos);
    let res;
    try {
      // text/plain evita la verificación previa de CORS; Apps Script lee el cuerpo igual.
      res = await fetch(URL_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos), redirect: 'follow' });
    } catch (e) { return { ok: false, error: 'offline' }; }
    if (!res.ok) return { ok: false, error: 'http_' + res.status };
    try { return await res.json(); } catch (e) { return { ok: false, error: 'bad_response' }; }
  }

  /* ---------- servidor de prueba en el navegador (mismo contrato que Code.gs) ---------- */
  const K = 'campusMission.demo.v1';
  const LUGAR_EQUIPO = { 1: 'learning', 2: 'learning', 3: 'learning', 4: 'edificio1', 5: 'edificio1', 6: 'edificio1', 7: 'almacen', 8: 'acopio', 9: 'edificio2', 10: 'metra' };
  const PIN_DOCENTE_DEMO = '0000';
  function cargar() {
    try { const v = JSON.parse(localStorage.getItem(K)); if (v && v.grupos) return v; } catch (e) {}
    return { grupos: { 'DEMO-A1B2': { codigo: 'DEMO-A1B2', nombre: 'Demo group', fase3: false, creado: new Date().toISOString() } }, equipos: {} };
  }
  function grabar(s) { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} }
  const norm = c => String(c || '').trim().toUpperCase().replace(/\s+/g, '');
  const pub = (t, g) => Object.assign({}, t, { pin: undefined, fase3: !!(g && g.fase3), tieneFoto: !!t.mini });
  function demo(q) {
    const s = cargar(); const now = new Date().toISOString();
    const g = q.codigo ? s.grupos[norm(q.codigo)] : null;
    const clave = g ? g.codigo + '|' + Number(q.equipo) : '';
    const t = clave ? s.equipos[clave] : null;
    const auth = () => !g ? 'group_not_found' : !t ? 'team_not_found' : t.pin !== String(q.pin) ? 'wrong_pin' : null;
    let r;
    switch (q.a) {
      case 'grupo':
        r = g ? { ok: true, codigo: g.codigo, nombre: g.nombre, fase3: g.fase3, equiposRegistrados: Object.values(s.equipos).filter(x => x.codigo === g.codigo).map(x => x.equipo) } : { ok: false, error: 'group_not_found' }; break;
      case 'entrar': {
        if (!g) { r = { ok: false, error: 'group_not_found' }; break; }
        if (!/^\d{4}$/.test(String(q.pin || ''))) { r = { ok: false, error: 'bad_pin' }; break; }
        if (!t) {
          const n = Number(q.equipo);
          s.equipos[clave] = { codigo: g.codigo, grupo: g.nombre, equipo: n, lugar: LUGAR_EQUIPO[n], integrantes: q.integrantes || '', pin: String(q.pin), ubicado: false, intentos: 0, ubicadoEn: '', fotoEn: '', sinFoto: false, mini: '', respuestas: {}, explicacion: {}, explicadoEn: '', actualizado: now };
          grabar(s); r = { ok: true, nuevo: true, team: pub(s.equipos[clave], g) }; break;
        }
        if (t.pin !== String(q.pin)) { r = { ok: false, error: 'wrong_pin' }; break; }
        if (q.integrantes && q.integrantes.trim()) { t.integrantes = q.integrantes; grabar(s); }
        r = { ok: true, nuevo: false, team: pub(t, g) }; break;
      }
      case 'guardar': {
        const e = auth(); if (e) { r = { ok: false, error: e }; break; }
        const d = q.datos || {};
        if (d.intentos !== undefined) t.intentos = Math.max(t.intentos || 0, d.intentos);
        if (d.ubicado && !t.ubicado) { t.ubicado = true; t.ubicadoEn = now; }
        if (d.sinFoto) t.sinFoto = true;
        if (d.respuestas) Object.assign(t.respuestas, d.respuestas);
        if (d.explicacion) { if (!g.fase3) { r = { ok: false, error: 'phase3_closed' }; break; } Object.assign(t.explicacion, d.explicacion); if (d.enviarExplicacion) t.explicadoEn = now; }
        t.actualizado = now; grabar(s); r = { ok: true, team: pub(t, g) }; break;
      }
      case 'foto': {
        const e = auth(); if (e) { r = { ok: false, error: e }; break; }
        t.mini = q.mini || ''; t.fotoEn = now; t.sinFoto = false; t.actualizado = now; grabar(s); r = { ok: true, team: pub(t, g) }; break;
      }
      case 'muro':
        r = g ? { ok: true, fotos: Object.values(s.equipos).filter(x => x.codigo === g.codigo && x.mini).map(x => ({ equipo: x.equipo, lugar: x.lugar, fotoEn: x.fotoEn, mini: x.mini })) } : { ok: false, error: 'group_not_found' }; break;
      case 'grupoFase3': {
        const e = auth(); if (e) { r = { ok: false, error: e }; break; }
        if (!g.fase3) { r = { ok: false, error: 'phase3_closed' }; break; }
        r = { ok: true, grupo: g.nombre, equipos: Object.values(s.equipos).filter(x => x.codigo === g.codigo).map(x => { const p = pub(x, g); delete p.integrantes; return p; }) }; break;
      }
      case 'docente': {
        if (String(q.pinDocente) !== PIN_DOCENTE_DEMO) { r = { ok: false, error: 'wrong_teacher_pin' }; break; }
        if (q.op === 'grupos') r = { ok: true, hoja: '', carpeta: '', grupos: Object.values(s.grupos).map(x => Object.assign({}, x, { equipos: Object.values(s.equipos).filter(e => e.codigo === x.codigo).length })) };
        else if (q.op === 'crearGrupo') {
          const base = String(q.nombre || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GRUPO';
          const codigo = base + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
          s.grupos[codigo] = { codigo, nombre: q.nombre, fase3: false, creado: now }; grabar(s); r = { ok: true, codigo, nombre: q.nombre };
        } else if (q.op === 'fase3') { const gg = s.grupos[norm(q.codigo)]; if (gg) { gg.fase3 = !!q.abierta; grabar(s); r = { ok: true }; } else r = { ok: false, error: 'group_not_found' }; }
        else if (q.op === 'equipos') { const gg = s.grupos[norm(q.codigo)]; r = gg ? { ok: true, grupo: gg, equipos: Object.values(s.equipos).filter(e => e.codigo === gg.codigo).map(e => Object.assign(pub(e, gg), { fotoUrl: '' })) } : { ok: false, error: 'group_not_found' }; }
        else if (q.op === 'reiniciarPin') { const tt = s.equipos[norm(q.codigo) + '|' + Number(q.equipo)]; if (tt) { tt.pin = String(q.pin); grabar(s); r = { ok: true }; } else r = { ok: false, error: 'team_not_found' }; }
        else r = { ok: false, error: 'unknown_op' };
        break;
      }
      default: r = { ok: false, error: 'unknown_action' };
    }
    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(r))), 150));
  }

  window.CampusAPI = { llamar, DEMO };
})();
