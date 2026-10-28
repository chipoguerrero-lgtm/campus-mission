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
const COL = ['#c8261d','#1f5fbf','#e0a21b','#2f8a3e','#7a3fb0','#d4572a','#118a8a','#8a5a2b','#b02f6b','#3d4b5c'];
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
const C3 = {green:0x2f8a3e,blue:0x1f5fbf,terra:0xb4563f,brown:0x8a4b2f,white:0xf1f2f0,lgrey:0xc9ced3,grey:0x8b939b,red:0xc8261d,wood:0x9c6b3c,orange:0xe07a2e,leaf:0x5aa04a,glass:0x7fb8e6,panel:0x1d2f55,plate:0x4f9446,yellow:0xf2c230};
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
