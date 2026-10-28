/* Campus Mission — datos de lugares, equipos, preguntas y modelos.
   Para cambiar una pregunta o una pista, edita este archivo. */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ===================== DATOS (ajustables) ===================== */
// Ubicación de cada lugar en el mapa: propuesta a partir de la imagen satelital; corregir aquí si hace falta.
const LUGARES = {
  learning:  {nombre:'Learning Center', pista:'It is east of the roundabout and has a grey roof with solar panels.'},
  edificio1: {nombre:'Building 1', pista:'It is the long building with solar panels, facing the main parking lot.'},
  almacen:   {nombre:'Warehouse & Sustainability Cabin', pista:'They are two small structures on the east side, next to the white tent.'},
  edificio2: {nombre:'Building 2', pista:'It is the large white-roofed hall on the north side, next to the dirt parking lot.'},
  metra:     {nombre:'Metra Center', pista:'It is west of the roundabout: part of its roof is brown and part is white.'},
  acopio:    {nombre:'Collection Center', pista:'It is a small structure about 10 meters behind the Warehouse & Sustainability Cabin, on the east side.'},
  lombricomposta: {nombre:'Vermicompost', pista:'It is on the east edge of campus, just past the Warehouse & Sustainability Cabin.'},
  bebederos: {nombre:'Wildlife water stations', pista:'They are on the far west edge of campus, in the tree line beside the lower parking lot.'}
};
const COL = ['#031926','#468189','#2f6f66','#1d4552','#3c7a8a','#245a5f','#0f2e3c','#4d7f73','#2a5361','#5a7f86'];
const EQUIPOS = [
  {n:1, lugar:'learning', titulo:'Animation and Visual Effects Engineering Academy', areas:['Animation and Visual Effects Academy'],
   extra:['Which labs, specialized equipment or software does the program use?','Which projects or events of the program can students from other programs visit?']},
  {n:2, lugar:'learning', titulo:'Human Development Academy', areas:['Human Development','Inclusion','Culture and Sports','Psychopedagogy Department'],
   extra:['Which cultural workshops and sports teams are there, and how do you sign up?','What support does Inclusion offer to students with disabilities or specific needs?','How do you book an appointment with Psychopedagogy, and what kind of support do they give?']},
  {n:3, lugar:'learning', titulo:'Languages Academy', areas:['Languages Academy','Certification Center','External courses','Certifications'],
   extra:['Which language certifications can you take here, and how much do they cost?','Which external courses are offered, and who can take them?','What English level is required during your degree, and how do you prove it?']},
  {n:4, lugar:'edificio1', titulo:'Physical Therapy Academy', areas:['Physical Therapy Academy','Clinic'],
   extra:['What services does the clinic offer, and how much does each one cost?','Who can be treated (students, staff, the public), and how do you book?','Who treats patients: students in practice, teachers, or both?']},
  {n:5, lugar:'edificio1', titulo:'Administration', areas:['Internationalization','Industry Liaison (Vinculación)','Sustainability Office','Academic Secretariat'],
   extra:['Which procedures does the Academic Secretariat handle?','Which exchange programs does Internationalization offer, and what are the requirements?','What does Industry Liaison do (internships, social service, job board)?','Which programs does the Sustainability Office run, and how can you take part?']},
  {n:6, lugar:'edificio1', titulo:'Typhlotechnical Room, STEM Office and Cecyteq Area', areas:['Typhlotechnical Room','STEM Office','Cecyteq Area'],
   extra:['What is the typhlotechnical room, what equipment does it have, and whom does it support?','Which activities or programs does the STEM Office organize?','What does Cecyteq do inside the university?']},
  {n:7, lugar:'almacen', titulo:'Warehouse, Germination and Monarch Butterfly', areas:['Warehouse','Tool warehouse','Germination area','Monarch butterfly care'],
   extra:['How do you borrow materials or tools, and what are the rules?','What is grown in the germination area, and what for?','How is the monarch butterfly cared for here, and how can students take part?']},
  {n:8, lugar:'acopio', titulo:'Waste, Vermicompost and Wildlife Water Stations', areas:['Collection Center (waste)','Vermicompost (east edge, past the Cabin)','Water stations for peri-urban wildlife (west tree line)'],
   extra:['Which types of waste are separated, and where does each one go?','How does the vermicompost work, and what do you get from it?','Which peri-urban animals use the water stations, and why are they needed?']},
  {n:9, lugar:'edificio2', titulo:'Automotive Engineering Academy', areas:['Lab 1','Lab 2','Lab 3','Tramvet Lab','Continuous Research Area'],
   extra:['What is done in Labs 1, 2 and 3? Main equipment in each one.','What is the Tramvet Lab, and what projects does it have?','Which lines does the Continuous Research Area work on, and how can a student join?']},
  {n:10, lugar:'metra', titulo:'ITIID and IRC Academy', areas:['ITIID Academy','IRC Academy','Innovation Room','Labs'],
   extra:['Which programs does the ITIID and IRC Academy include?','What is the Innovation Room used for, and how do you book it?','Which labs are there, and what is done in each one?']}
];
EQUIPOS.forEach((e,i)=>e.color=COL[i]);
function preguntas(eq){
  const multi = eq.areas.length>1;
  if (typeof IDIOMA !== 'undefined' && IDIOMA === 'es') return preguntasES(eq, multi);
  const base = [
    ['c1','Person in charge', multi?'Who is in charge of each area? Full name and position.':'Who is in charge? Full name and position.'],
    ['c2','What it includes','What does it include? Programs, areas, staff or spaces that make it up.'],
    ['c3','Location','Where exactly is it? Floor, room number, or a landmark to get there.'],
    ['c4','Services','What services does it offer to students, and how do you request them?'],
    ['c5','Contact','Office hours and how to contact them (email, extension or social media).']
  ];
  const esp = eq.extra.map((t,i)=>['e'+(i+1),'Specific',t]);
  return [...base, ...esp, ['c6','For new students','In one sentence: what every new student should know about this place.']];
}

/* Mapa: coordenadas trazadas sobre la imagen satelital (viewBox 676 × 1180) */
const MAPA_W=676, MAPA_H=1180;
const CONSTRUCCIONES = [
  {id:'edificio1', parts:[{x:232,y:327,w:152,h:35,top:'#b4563f',panels:true},{x:222,y:331,w:12,h:27,top:'#b4563f'},{x:384,y:333,w:16,h:20,top:'#cfd4d8'}]},
  {id:'edificio2', parts:[{x:442,y:130,w:118,h:54,top:'#e8ebee'},{x:442,y:130,w:10,h:54,top:'#b0432f'}]},
  {id:'almacen', parts:[{x:486,y:320,w:36,h:22,top:'#eef0f2'},{x:536,y:321,w:28,h:18,top:'#c8693a'}]},
  {id:'learning', parts:[{x:348,y:482,w:102,h:74,top:'#8f979f',panels:true},{x:348,y:482,w:16,h:16,top:'#d8dce0'}]},
  {id:'metra', parts:[{x:168,y:545,w:88,h:47,top:'#a65a3e'},{x:168,y:592,w:88,h:42,top:'#e4e7ea'}]},
  {id:'acopio', parts:[{x:496,y:346,w:40,h:13,top:'#5d6670'}]},
  {id:'bebederos', parts:[{x:4,y:458,w:16,h:16,top:'#4f8fc4'}]},
  {id:'lombricomposta', parts:[{x:590,y:310,w:18,h:16,top:'#7a4a2e'}]},
  {id:'x-norte', parts:[{x:440,y:44,w:86,h:30,top:'#e3e6e9'}]},
  {id:'x-carpa', tent:true, parts:[{x:490,y:230,w:56,h:66,top:'#f4f4f2'}]},
  {id:'x-curvo', parts:[{x:76,y:655,w:62,h:52,top:'#b86048'},{x:138,y:662,w:68,h:40,top:'#d6d1c8'}]},
  {id:'x-caseta', parts:[{x:428,y:448,w:20,h:24,top:'#eceff1'}]},
  {id:'x-gimnasio', parts:[{x:388,y:1080,w:80,h:56,top:'#dfe3e6'}]},
  {id:'x-bodega', parts:[{x:305,y:1004,w:24,h:24,top:'#e9ecee'}]},
  {id:'x-acceso', parts:[{x:116,y:342,w:16,h:14,top:'#a8573c'}]}
];

/* Modelos 3D estilo Lego (unidad = 1 stud) */
const C3 = {green:0x2f8a3e,blue:0x1f5fbf,terra:0xb4563f,brown:0x8a4b2f,white:0xf1f2f0,lgrey:0xc9ced3,grey:0x8b939b,red:0xc8261d,wood:0x9c6b3c,orange:0xe07a2e,leaf:0x5aa04a,glass:0x7fb8e6,panel:0x1d2f55,plate:0x77aca2,yellow:0xf2c230};
const MODELOS = {
  edificio1:[{x:0,z:0,w:16,d:6,h:5,c:'terra',win:true,panels:true},{x:-2,z:1,w:2,d:4,h:4,c:'terra',win:true},{x:16,z:1,w:3,d:4,h:3,c:'lgrey'}],
  learning:[{x:0,z:0,w:10,d:8,h:5,c:'grey',win:true,panels:true},{x:10,z:2,w:3,d:5,h:4,c:'terra',win:true}],
  metra:[{x:0,z:0,w:9,d:6,h:6,c:'brown',win:true},{x:0,z:6,w:9,d:5,h:4,c:'lgrey',top:'white'}],
  edificio2:[{x:0,z:0,w:13,d:7,h:4,c:'lgrey',top:'white'},{x:0,z:7,w:13,d:1,h:5,c:'red',win:true}],
  acopio:[{x:0,z:0,w:5,d:3,h:2,c:'grey',top:'green'},{x:6,z:0,w:2,d:2,h:2,c:'blue'},{x:9,z:0,w:2,d:2,h:2,c:'yellow'},{x:12,z:0,w:2,d:2,h:2,c:'green'},{x:0,z:5,w:14,d:4,h:0,c:'leaf',plants:true}],
  almacen:[{x:0,z:0,w:6,d:4,h:3,c:'white',win:true},{x:8,z:0,w:4,d:4,h:3,c:'wood',top:'orange'},{x:0,z:6,w:12,d:4,h:0,c:'leaf',plants:true}]
};

/* Fase 3: lo que cada equipo explica con sus palabras */
const EXPLICACION = [
  ['resumen','Summary','In 2 or 3 sentences: what is this place and why does it matter to students?',4],
  ['dato1','Key fact 1','The most important thing you found.',2],
  ['dato2','Key fact 2','Another important fact.',2],
  ['dato3','Key fact 3','One more fact.',2],
  ['curioso','Fun fact','Something surprising you did not know.',2],
  ['consejo','Tip for new students','One practical tip a new student can use tomorrow.',2]
];
const ETIQUETAS = {c1:'Person in charge',c2:'What it includes',c3:'Location',c4:'Services',c5:'Contact',c6:'For new students'};


/* ===================== ESPAÑOL SENCILLO (alumnos Sordos) =====================
   Frases cortas, una idea por frase, palabras comunes. */
function preguntasES(eq, multi){
  const base = [
    ['c1','Responsable', multi?'¿Quién es la persona responsable de cada área? Escribe nombre completo y puesto.':'¿Quién es la persona responsable? Escribe nombre completo y puesto.'],
    ['c2','Qué hay aquí','¿Qué hay en este lugar? Escribe carreras, áreas, personas o espacios.'],
    ['c3','Ubicación','¿Dónde está exactamente? Escribe el piso, el número de salón o una referencia.'],
    ['c4','Servicios','¿Qué servicios da a los alumnos? ¿Cómo los pides?'],
    ['c5','Contacto','¿Cuál es el horario? ¿Cuál es el correo, la extensión o la red social?']
  ];
  const esp = eq.extra.map((t,i)=>['e'+(i+1),'Pregunta especial',t]);
  return [...base, ...esp, ['c6','Para alumnos nuevos','Escribe una frase: ¿qué debe saber un alumno nuevo de este lugar?']];
}
const TEXTOS_ES = {
  lugares: {
    learning:  {nombre:'Learning Center', pista:'Está al oriente de la glorieta. Tiene techo gris con paneles solares.'},
    edificio1: {nombre:'Edificio 1', pista:'Es el edificio largo con paneles solares. Está frente al estacionamiento principal.'},
    almacen:   {nombre:'Almacén y cabaña de Sustentabilidad', pista:'Son dos construcciones pequeñas. Están al oriente, junto a la carpa blanca.'},
    edificio2: {nombre:'Edificio 2', pista:'Es la nave grande de techo blanco. Está al norte, junto al estacionamiento de tierra.'},
    metra:     {nombre:'Metra Center', pista:'Está al poniente de la glorieta. Su techo es café y blanco.'},
    acopio:    {nombre:'Centro de acopio', pista:'Es una construcción pequeña. Está 10 metros detrás del almacén y la cabaña.'},
    lombricomposta: {nombre:'Lombricomposta', pista:'Está en la orilla oriente del campus, después de la cabaña.'},
    bebederos: {nombre:'Bebederos de fauna', pista:'Están en la orilla poniente del campus, entre los árboles.'}
  },
  equipos: {
    1:{titulo:'Academia de Ingeniería en Animación y Efectos Visuales', areas:['Academia de Animación y Efectos Visuales'],
       extra:['¿Qué laboratorios, equipo o programas de computadora usa la carrera?','¿Qué proyectos o eventos de la carrera pueden ver alumnos de otras carreras?']},
    2:{titulo:'Academia de Desarrollo Humano', areas:['Desarrollo Humano','Inclusión','Cultura y Deportes','Psicopedagogía'],
       extra:['¿Qué talleres de cultura y equipos de deporte hay? ¿Cómo te inscribes?','¿Qué apoyos da Inclusión a alumnos con discapacidad?','¿Cómo pides una cita en Psicopedagogía? ¿Qué ayuda dan?']},
    3:{titulo:'Academia de Idiomas', areas:['Academia de Idiomas','Centro Certificador','Cursos externos','Certificaciones'],
       extra:['¿Qué certificaciones de idioma puedes hacer aquí? ¿Cuánto cuestan?','¿Qué cursos externos hay? ¿Quién puede tomarlos?','¿Qué nivel de inglés necesitas en tu carrera? ¿Cómo lo demuestras?']},
    4:{titulo:'Academia de Terapia Física', areas:['Academia de Terapia Física','Clínica'],
       extra:['¿Qué servicios da la clínica? ¿Cuánto cuesta cada uno?','¿Quién puede atenderse ahí? ¿Cómo haces una cita?','¿Quién atiende: alumnos, maestros o los dos?']},
    5:{titulo:'Administración', areas:['Internacionalización','Vinculación','Oficina de Sustentabilidad','Secretaría Académica'],
       extra:['¿Qué trámites hace la Secretaría Académica?','¿Qué programas de intercambio hay? ¿Qué piden?','¿Qué hace Vinculación? (estadías, servicio social, bolsa de trabajo)','¿Qué programas tiene la Oficina de Sustentabilidad? ¿Cómo participas?']},
    6:{titulo:'Sala tiflotécnica, oficina de STEM y área de Cecyteq', areas:['Sala tiflotécnica','Oficina de STEM','Área de Cecyteq'],
       extra:['¿Qué es la sala tiflotécnica? ¿Qué equipo tiene? ¿A quién apoya?','¿Qué actividades organiza la oficina de STEM?','¿Qué hace el Cecyteq en la universidad?']},
    7:{titulo:'Almacén, germinación y mariposa monarca', areas:['Almacén','Almacén de herramientas','Área de germinación','Cuidado de la mariposa monarca'],
       extra:['¿Cómo pides material o herramientas prestadas? ¿Cuáles son las reglas?','¿Qué plantas crecen en el área de germinación? ¿Para qué?','¿Cómo cuidan a la mariposa monarca? ¿Cómo pueden ayudar los alumnos?']},
    8:{titulo:'Residuos, lombricomposta y bebederos de fauna', areas:['Centro de acopio (residuos)','Lombricomposta (orilla oriente)','Bebederos de fauna (orilla poniente, entre los árboles)'],
       extra:['¿Qué residuos separan? ¿A dónde va cada uno?','¿Cómo funciona la lombricomposta? ¿Qué se obtiene?','¿Qué animales usan los bebederos? ¿Por qué son necesarios?']},
    9:{titulo:'Academia de Ingeniería Automotriz', areas:['Laboratorio 1','Laboratorio 2','Laboratorio 3','Laboratorio Tramvet','Área de Investigación Continua'],
       extra:['¿Qué hacen en los laboratorios 1, 2 y 3? ¿Qué equipo principal tiene cada uno?','¿Qué es el laboratorio Tramvet? ¿Qué proyectos tiene?','¿Qué investiga el Área de Investigación Continua? ¿Cómo puede entrar un alumno?']},
    10:{titulo:'Academia de ITIID e IRC', areas:['Academia de ITIID','Academia de IRC','Innovation Room','Laboratorios'],
       extra:['¿Qué carreras tiene la academia de ITIID e IRC?','¿Para qué sirve el Innovation Room? ¿Cómo se aparta?','¿Qué laboratorios hay? ¿Qué hacen en cada uno?']}
  },
  explicacion: [
    ['resumen','Resumen','En 2 o 3 frases: ¿qué es este lugar? ¿Por qué es importante para los alumnos?',4],
    ['dato1','Dato clave 1','Lo más importante que encontraron.',2],
    ['dato2','Dato clave 2','Otro dato importante.',2],
    ['dato3','Dato clave 3','Un dato más.',2],
    ['curioso','Dato curioso','Algo que les sorprendió.',2],
    ['consejo','Consejo para alumnos nuevos','Un consejo práctico que un alumno nuevo puede usar mañana.',2]
  ]
};
/* Descripción de cada construcción, para elegir sin ver el mapa (modo baja visión). No dicen el nombre. */
const DESCRIPCIONES = {
  en: {
    'edificio1':'Long building with solar panels, facing the main parking lot.',
    'edificio2':'Large hall with a white roof, in the north, next to the dirt parking lot.',
    'almacen':'Two small buildings on the east side, next to the big white tent.',
    'learning':'Building with a grey roof and solar panels, east of the roundabout.',
    'metra':'Building with a brown and white roof, west of the roundabout.',
    'acopio':'Small structure behind the two small buildings on the east side.',
    'lombricomposta':'Small spot on the east edge of campus.',
    'bebederos':'Small spot on the west edge of campus, in the tree line.',
    'x-norte':'Small building at the far north end of campus.',
    'x-carpa':'Big white tent on the east side.',
    'x-curvo':'Curved building in the south-west.',
    'x-caseta':'Very small booth next to the grey-roofed building.',
    'x-gimnasio':'Large hall at the far south, past the football field.',
    'x-bodega':'Small booth next to the football field.',
    'x-acceso':'Guard booth at the entrance roundabout.'
  },
  es: {
    'edificio1':'Edificio largo con paneles solares. Está frente al estacionamiento principal.',
    'edificio2':'Nave grande de techo blanco. Está al norte, junto al estacionamiento de tierra.',
    'almacen':'Dos edificios pequeños al oriente. Están junto a la carpa blanca.',
    'learning':'Edificio de techo gris con paneles solares. Está al oriente de la glorieta.',
    'metra':'Edificio de techo café y blanco. Está al poniente de la glorieta.',
    'acopio':'Construcción pequeña detrás de los dos edificios pequeños del oriente.',
    'lombricomposta':'Lugar pequeño en la orilla oriente del campus.',
    'bebederos':'Lugar pequeño en la orilla poniente, entre los árboles.',
    'x-norte':'Edificio pequeño en el extremo norte del campus.',
    'x-carpa':'Carpa blanca grande al oriente.',
    'x-curvo':'Edificio curvo al sur poniente.',
    'x-caseta':'Caseta muy pequeña junto al edificio de techo gris.',
    'x-gimnasio':'Nave grande al extremo sur, después de la cancha de fútbol.',
    'x-bodega':'Caseta pequeña junto a la cancha de fútbol.',
    'x-acceso':'Caseta de vigilancia en la glorieta de la entrada.'
  }
};
/* Guardar el inglés original y cambiar de idioma sin recargar */
const TEXTOS_EN = {
  lugares: JSON.parse(JSON.stringify(LUGARES)),
  equipos: Object.fromEntries(EQUIPOS.map(e => [e.n, {titulo:e.titulo, areas:e.areas.slice(), extra:e.extra.slice()}])),
  explicacion: EXPLICACION.map(r => r.slice())
};
var IDIOMA = 'en';
function aplicarIdiomaDatos(lang){
  IDIOMA = lang === 'es' ? 'es' : 'en';
  const src = IDIOMA === 'es' ? TEXTOS_ES : TEXTOS_EN;
  Object.keys(src.lugares).forEach(k => { if (LUGARES[k]) Object.assign(LUGARES[k], src.lugares[k]); });
  EQUIPOS.forEach(e => { const t = src.equipos[e.n]; if (t) { e.titulo = t.titulo; e.areas = t.areas.slice(); e.extra = t.extra.slice(); } });
  EXPLICACION.length = 0; src.explicacion.forEach(r => EXPLICACION.push(r.slice()));
  Object.assign(ETIQUETAS, IDIOMA === 'es'
    ? {c1:'Responsable',c2:'Qué hay aquí',c3:'Ubicación',c4:'Servicios',c5:'Contacto',c6:'Para alumnos nuevos'}
    : {c1:'Person in charge',c2:'What it includes',c3:'Location',c4:'Services',c5:'Contact',c6:'For new students'});
}
