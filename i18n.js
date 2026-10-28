/* Campus Mission — textos de la interfaz en inglés y en español sencillo.
   Español sencillo: frases cortas, una idea por frase, palabras comunes (pensado para alumnos Sordos). */
const I18N = {
  en: {
    eyebrow: 'UPSRJ · Tutoring for Immersion',
    phasesNav: 'Phases', st1: 'Phase 1 · Map & photo', st2: 'Phase 2 · Building', st3: 'Phase 3 · Explain it',
    changeTeam: 'Change team', access: 'Reading options',
    btnEn: 'English', btnEs: 'Español sencillo', btnLv: 'Low vision', btnLvOff: 'Standard view',
    lvBar: 'Reading options', bigger: 'Text A+', smaller: 'Text A−', toWhite: 'White background', toBlack: 'Black background',
    demo: 'Demo mode: nothing is sent to your teacher. Everything stays in this browser.',
    beforeStart: 'Before you start', enterTeam: 'Enter your team',
    introLogin: 'Your teacher gives your group a code. Each team creates a 4-digit PIN the first time. With the same code, team and PIN you can come back any day this week, from any phone.',
    groupCode: 'Group code', askTeacher: 'Ask your teacher for it.', team: 'Team', chooseTeam: 'Choose your team…', registered: '(registered)',
    pinLabel: 'Team PIN (4 digits)', pinNew: 'First time: create a 4-digit PIN and share it only with your team.', pinOld: 'This team is registered. Enter the PIN your team created.',
    members: 'Team members', membersPh: 'One full name per line', cont: 'Continue', entering: 'Entering…',
    destination: 'Destination: ', assignments: 'Mission assignments', teamsPlaces: '10 teams, 6 places',
    attempts: 'Attempts: ', googleEarth: 'View in Google Earth ↗', group: 'Group ', teamN: 'Team ', yourDest: 'Your destination: ',
    t1h: 'Find it on the map', t1p: 'Tap the structure you think is your destination. Names are hidden, so you have to recognize it from above.',
    t1list: 'Or choose from this list. Each button describes one place on the map.',
    t2h: 'Go there and take a photo', t2p: 'Walk to the place. The photo must show the whole team with the building or the area sign behind you.',
    upload: 'Upload team photo', fromCam: 'From your camera or gallery', enterBuilding: 'Enter the building',
    phase2: 'Phase 2', drag: 'Drag to rotate', stops: 'Your research stops', backMap: 'Back to map',
    p2intro: 'You have all week. Research on site, ask the staff directly and write in your own words. Answers save automatically, and you can come back with your PIN.',
    noChanges: 'No changes', tryAgain: 'Try again', goF3: 'Go to Phase 3',
    f3eyebrow: 'Phase 3 · Explain it', f3closedH: 'Phase 3 is not open yet', f3closedP: 'Your teacher opens Phase 3 when your group finishes collecting information. Keep working on Phase 2 until then.', checkAgain: 'Check again',
    explainH: 'Explain what you found', explainP: 'Use your Phase 2 notes. Your group will read this to build a mind map of the whole campus, so write clearly and in English.',
    share: 'Share with my group', groupCampus: "Your group's campus",
    groupCampusP: 'This is what every team found. Download it and build your mind map: center = the campus, branches = places, sub-branches = teams and facts.',
    dlMd: 'Mind map outline (.md)', dlOpml: 'XMind / MindMeister (.opml)', dlTxt: 'Copy as text', dlPdf: 'Print / PDF', refresh: 'Refresh', loadingGroup: 'Loading your group…',
    wall: 'Arrivals wall', wallEmpty: 'No team has arrived yet. The first photo will show up here.', arrived: 'Arrived ',
    // mensajes
    offline: 'No connection. Check your internet and try again.', group_not_found: 'That group code does not exist. Check it with your teacher.',
    team_not_found: 'That team is not registered yet.', wrong_pin: 'Wrong PIN for this team. If you forgot it, ask your teacher to reset it.',
    bad_pin: 'The PIN must be exactly 4 digits.', phase3_closed: 'Phase 3 is not open yet.', too_large: 'The photo is too large. Try another one.',
    genericErr: 'Something went wrong ({e}). Try again.', chooseTeamErr: 'Choose your team.', membersErr: 'Write the names of the team members.', opening: 'Opening your team…',
    found: 'Found in {n} {w}. Now go there.', attempt: 'attempt', attemptsW: 'attempts', savedLater: ' Your answer will be saved when you are back online.',
    otherPlace: 'That is another place on campus, not your destination. ', notDest: 'That is not your destination. ', hint: 'Hint: ',
    posting: 'Posting photo…', badImage: 'That file is not a supported image. Use a JPG or PNG photo.', posted: 'Photo posted on your group wall.',
    typing: 'Typing…', saving: 'Saving…', saved: 'Saved ', savedLocal: 'Saved in this browser ', keptPhone: ' Your text is kept on this phone.',
    sharedAt: 'Shared with your group ', draft: 'Draft — not shared yet', savedShared: 'Saved · shared with your group', draftSaved: 'Draft saved ',
    completeAll: 'Complete every field before sharing: {f}.', sharedOk: 'Shared! Your group can now read your explanation. You can still edit it.', shareFail: 'Could not share. Try again.',
    stillWriting: 'Still writing their explanation.', notRegistered: 'Not registered.', funFact: 'Fun fact:', tip: 'Tip:', contactDetails: 'Contact details',
    nothingDl: 'There is nothing to download yet. Wait until teams share their explanations.', copied: 'Copied. Paste it into Canva, Miro, MindMeister or XMind to create the mind map.',
    copyFail: 'Could not copy, so the text was downloaded as a file.', campusRoot: 'UPSRJ Campus – Group ', summary: 'Summary: ', keyFacts: 'Key facts',
    personInCharge: 'Person in charge: ', services: 'Services: ', location: 'Location: ', contact: 'Contact: ', funFactD: 'Fun fact: ', tipD: 'Tip: ',
    buildingText: 'Your building', made: 'Designed and built by Chipo', lsmNote: '', skip: 'Skip to content', photoAlt: 'Team photo on site'
  },
  es: {
    eyebrow: 'UPSRJ · Tutoría de Inmersión',
    phasesNav: 'Fases', st1: 'Fase 1 · Mapa y foto', st2: 'Fase 2 · Edificio', st3: 'Fase 3 · Explícalo',
    changeTeam: 'Cambiar de equipo', access: 'Opciones de lectura',
    btnEn: 'English', btnEs: 'Español sencillo', btnLv: 'Baja visión', btnLvOff: 'Vista normal',
    lvBar: 'Opciones de lectura', bigger: 'Letra A+', smaller: 'Letra A−', toWhite: 'Fondo blanco', toBlack: 'Fondo negro',
    demo: 'Modo de prueba. Nada llega a tu profesor. Todo se guarda solo en este navegador.',
    beforeStart: 'Antes de empezar', enterTeam: 'Entra con tu equipo',
    introLogin: 'Tu profesor te da un código de grupo. La primera vez, tu equipo crea un PIN de 4 números. Con el código, el equipo y el PIN puedes volver cualquier día de esta semana. Puedes usar cualquier celular.',
    groupCode: 'Código de grupo', askTeacher: 'Pídelo a tu profesor.', team: 'Equipo', chooseTeam: 'Elige tu equipo…', registered: '(ya registrado)',
    pinLabel: 'PIN del equipo (4 números)', pinNew: 'Primera vez: crea un PIN de 4 números. Compártelo solo con tu equipo.', pinOld: 'Este equipo ya está registrado. Escribe el PIN de tu equipo.',
    members: 'Integrantes del equipo', membersPh: 'Un nombre completo en cada línea', cont: 'Continuar', entering: 'Entrando…',
    destination: 'Destino: ', assignments: 'Misiones de cada equipo', teamsPlaces: '10 equipos, 6 lugares',
    attempts: 'Intentos: ', googleEarth: 'Ver en Google Earth ↗', group: 'Grupo ', teamN: 'Equipo ', yourDest: 'Tu destino: ',
    t1h: 'Encuéntralo en el mapa', t1p: 'Toca el edificio que crees que es tu destino. Los nombres no aparecen. Tienes que reconocerlo desde arriba.',
    t1list: 'También puedes elegir en esta lista. Cada botón describe un lugar del mapa.',
    t2h: 'Ve al lugar y tómate una foto', t2p: 'Camina al lugar. En la foto debe estar todo el equipo. Atrás debe verse el edificio o el letrero del área.',
    upload: 'Subir la foto del equipo', fromCam: 'Desde la cámara o la galería', enterBuilding: 'Entrar al edificio',
    phase2: 'Fase 2', drag: 'Arrastra para girar', stops: 'Lugares que vas a investigar', backMap: 'Volver al mapa',
    p2intro: 'Tienes toda la semana. Investiga en el lugar. Pregunta al personal. Escribe con tus palabras. Las respuestas se guardan solas. Puedes volver con tu PIN.',
    noChanges: 'Sin cambios', tryAgain: 'Intentar otra vez', goF3: 'Ir a la fase 3',
    f3eyebrow: 'Fase 3 · Explícalo', f3closedH: 'La fase 3 todavía no está abierta', f3closedP: 'Tu profesor abre la fase 3 cuando tu grupo termina de investigar. Mientras, sigue con la fase 2.', checkAgain: 'Revisar otra vez',
    explainH: 'Explica lo que encontraron', explainP: 'Usa tus notas de la fase 2. Tu grupo va a leer esto para hacer un mapa mental de todo el campus. Escribe claro.',
    share: 'Compartir con mi grupo', groupCampus: 'El campus de tu grupo',
    groupCampusP: 'Aquí está lo que encontró cada equipo. Descárgalo y haz tu mapa mental. Centro: el campus. Ramas: los lugares. Ramas pequeñas: los equipos y sus datos.',
    dlMd: 'Esquema para mapa mental (.md)', dlOpml: 'XMind / MindMeister (.opml)', dlTxt: 'Copiar como texto', dlPdf: 'Imprimir / PDF', refresh: 'Actualizar', loadingGroup: 'Cargando tu grupo…',
    wall: 'Muro de llegadas', wallEmpty: 'Todavía no llega ningún equipo. Aquí aparecerá la primera foto.', arrived: 'Llegó ',
    offline: 'No hay internet. Revisa tu conexión e intenta otra vez.', group_not_found: 'Ese código de grupo no existe. Revísalo con tu profesor.',
    team_not_found: 'Ese equipo todavía no está registrado.', wrong_pin: 'El PIN no es correcto. Si lo olvidaste, pide a tu profesor que lo cambie.',
    bad_pin: 'El PIN debe tener 4 números.', phase3_closed: 'La fase 3 todavía no está abierta.', too_large: 'La foto pesa mucho. Prueba con otra.',
    genericErr: 'Algo salió mal ({e}). Intenta otra vez.', chooseTeamErr: 'Elige tu equipo.', membersErr: 'Escribe los nombres de los integrantes.', opening: 'Abriendo tu equipo…',
    found: '¡Lo encontraron! {n} {w}. Ahora vayan al lugar.', attempt: 'intento', attemptsW: 'intentos', savedLater: ' Se guardará cuando vuelva el internet.',
    otherPlace: 'Ese es otro lugar del campus. No es tu destino. ', notDest: 'Ese no es tu destino. ', hint: 'Pista: ',
    posting: 'Subiendo la foto…', badImage: 'Ese archivo no es una foto válida. Usa una foto JPG o PNG.', posted: 'La foto ya está en el muro de tu grupo.',
    typing: 'Escribiendo…', saving: 'Guardando…', saved: 'Guardado ', savedLocal: 'Guardado en este navegador ', keptPhone: ' Tu texto se queda en este celular.',
    sharedAt: 'Compartido con tu grupo ', draft: 'Borrador. Todavía no se comparte.', savedShared: 'Guardado y compartido con tu grupo', draftSaved: 'Borrador guardado ',
    completeAll: 'Llena todos los campos antes de compartir: {f}.', sharedOk: '¡Listo! Tu grupo ya puede leer su explicación. Todavía pueden cambiarla.', shareFail: 'No se pudo compartir. Intenta otra vez.',
    stillWriting: 'Todavía están escribiendo.', notRegistered: 'No está registrado.', funFact: 'Dato curioso:', tip: 'Consejo:', contactDetails: 'Datos de contacto',
    nothingDl: 'Todavía no hay nada que descargar. Espera a que los equipos compartan su explicación.', copied: 'Copiado. Pégalo en Canva, Miro, MindMeister o XMind para hacer el mapa mental.',
    copyFail: 'No se pudo copiar. El texto se descargó como archivo.', campusRoot: 'Campus UPSRJ – Grupo ', summary: 'Resumen: ', keyFacts: 'Datos clave',
    personInCharge: 'Responsable: ', services: 'Servicios: ', location: 'Ubicación: ', contact: 'Contacto: ', funFactD: 'Dato curioso: ', tipD: 'Consejo: ',
    buildingText: 'Tu edificio', made: 'Diseñado y construido por Chipo', lsmNote: 'Si necesitas intérprete de LSM, avisa a tu profesor.', skip: 'Saltar al contenido', photoAlt: 'Foto del equipo en el lugar'
  }
};
function t(k, vars) {
  const d = I18N[typeof IDIOMA !== 'undefined' ? IDIOMA : 'en'] || I18N.en;
  let s = d[k] !== undefined ? d[k] : (I18N.en[k] !== undefined ? I18N.en[k] : k);
  if (vars) Object.keys(vars).forEach(v => { s = s.replace('{' + v + '}', vars[v]); });
  return s;
}
function aplicarTextos() {
  document.documentElement.lang = IDIOMA;
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = t(el.dataset.tPh); });
  document.querySelectorAll('[data-t-alt]').forEach(el => { el.alt = t(el.dataset.tAlt); });
  document.querySelectorAll('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
}
