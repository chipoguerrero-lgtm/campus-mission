/* Campus Mission — mapa del campus y edificio Lego 3D */
function rng(seed){return()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296}}
function dentro(x,y,r){return r.some(b=>x>b.x-8&&x<b.x+b.w+8&&y>b.y-8&&y<b.y+b.h+8)}
function mapaSVG(){
  const ex=[]; CONSTRUCCIONES.forEach(c=>c.parts.forEach(p=>ex.push(p)));
  ex.push({x:297,y:775,w:133,h:207},{x:200,y:60,w:250,h:225},{x:10,y:385,w:100,h:85},{x:196,y:418,w:70,h:70},{x:290,y:360,w:26,h:820},{x:240,y:395,w:240,h:20});
  const r=rng(7); let arboles='';
  for(let i=0;i<330;i++){
    const x=40+r()*620, y=r()*1170;
    const fueraIzq = x<52 && y>300; const camino = y < 345-0.69*x+10 && y > 345-0.69*x-40;
    const campoE = x>462 && y>330 && y<720; const norOeste = y < 345-0.69*x-40;
    if(fueraIzq||camino||campoE||norOeste||dentro(x,y,ex)) continue;
    const rr=4+r()*4.5;
    arboles+=`<circle cx="${x.toFixed(1)}" cy="${(y+2).toFixed(1)}" r="${rr.toFixed(1)}" fill="rgba(0,0,0,.22)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${r()>.5?'var(--m-tree)':'var(--m-tree2)'}"/><circle cx="${(x-rr*.3).toFixed(1)}" cy="${(y-rr*.3).toFixed(1)}" r="${(rr*.35).toFixed(1)}" fill="rgba(255,255,255,.18)"/>`;
  }
  const camino=(pts,w=8,c='var(--m-path)')=>`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let k=0;
  const bld=CONSTRUCCIONES.map(c=>{
    k++;
    const partes=c.parts.map(p=>{
      let s=`<rect x="${p.x+4}" y="${p.y+5}" width="${p.w}" height="${p.h}" rx="2" fill="rgba(0,0,0,.35)"/>`;
      s+=`<rect class="top" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2" fill="${p.top}"/>`;
      if(c.tent){ for(let i=1;i<3;i++) s+=`<line x1="${p.x}" y1="${p.y+p.h*i/3}" x2="${p.x+p.w}" y2="${p.y+p.h*i/3}" stroke="#c9ccc9" stroke-width="2"/>`; }
      else s+=`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2" fill="url(#pTop)"/>`;
      if(p.panels){ for(let yy=p.y+6;yy<p.y+p.h-8;yy+=9) for(let xx=p.x+16;xx<p.x+p.w-14;xx+=22) s+=`<rect x="${xx}" y="${yy}" width="18" height="6" rx="1" fill="#22345c"/>`; }
      return s;
    }).join('');
    const b=bbox(c);
    const nombre=LUGARES[c.id]?LUGARES[c.id].nombre:'';
    const lbl=nombre?`<g class="lbl"><rect x="${b.x+b.w/2-nombre.length*3.6-8}" y="${b.y-26}" width="${nombre.length*7.2+16}" height="20" rx="5" fill="#17202b"/><text x="${b.x+b.w/2}" y="${b.y-12}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#fff">${esc(nombre)}</text></g>`:'';
    return `<g class="bld" data-id="${c.id}" tabindex="0" role="button" aria-label="Structure ${k}">${partes}${lbl}</g>`;
  }).join('');
  return `<svg id="mapa" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMid meet" aria-label="Map of the UPSRJ campus seen from above">
  <defs>
    <pattern id="pStud" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6.6" cy="6.8" r="3.2" fill="rgba(0,0,0,.14)"/><circle cx="6" cy="6" r="3.2" fill="rgba(255,255,255,.13)"/></pattern>
    <pattern id="pTop" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.6" r="2.4" fill="rgba(0,0,0,.10)"/><circle cx="5" cy="5" r="2.4" fill="rgba(255,255,255,.22)"/></pattern>
    <pattern id="pSurco" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="8" height="3" fill="rgba(0,0,0,.08)"/></pattern>
  </defs>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="var(--m-plate)"/>
  <polygon points="0,0 505,0 0,345" fill="var(--m-field2)"/>
  <polygon points="0,320 50,300 50,${MAPA_H} 0,${MAPA_H}" fill="var(--m-field2)"/>
  <polygon points="462,330 676,250 676,720 462,720" fill="var(--m-field)"/><polygon points="462,330 676,250 676,720 462,720" fill="url(#pSurco)"/>
  <polygon points="205,292 448,58 452,252 398,286" fill="var(--m-gravel)"/>
  <polygon points="12,420 70,384 110,440 50,472" fill="#a5abb0"/>
  ${camino([[-20,360],[515,-10]],22,'var(--m-road)')}
  ${camino([[-20,360],[515,-10]],2,'#f2f2ee')}
  ${camino([[70,322],[124,350],[150,345],[230,305]],13,'var(--m-road)')}
  <circle cx="132" cy="358" r="19" fill="var(--m-road)"/><circle cx="132" cy="358" r="9" fill="var(--m-tree2)"/>
  ${camino([[303,370],[303,1180]])}
  ${camino([[255,405],[470,405]])}
  ${camino([[462,190],[462,420],[455,560],[460,820],[470,1170]])}
  ${camino([[150,372],[205,420],[232,452],[303,548]])}
  ${camino([[303,548],[256,568]])}
  ${camino([[303,548],[348,520]])}
  ${camino([[380,240],[440,280],[462,300]],6)}
  ${camino([[60,470],[80,700],[150,750],[303,740],[460,700]],6)}
  ${camino([[150,750],[120,900],[160,1050],[300,1150],[470,1150]],6)}
  <rect x="297" y="775" width="133" height="207" fill="#4aa457"/><rect x="305" y="783" width="117" height="191" fill="none" stroke="#e9f5e9" stroke-width="2"/><line x1="305" y1="878" x2="422" y2="878" stroke="#e9f5e9" stroke-width="2"/><circle cx="363" cy="878" r="15" fill="none" stroke="#e9f5e9" stroke-width="2"/>
  <rect x="255" y="1100" width="34" height="40" fill="#c9cdd1"/>
  <polygon points="232,416 256,426 266,452 256,478 232,488 208,478 198,452 208,426" fill="#e8e1cf"/><polygon points="232,430 246,452 232,474 218,452" fill="#d6ccb3"/>
  <circle cx="303" cy="548" r="16" fill="#e8e1cf" stroke="#c9bf9f" stroke-width="2"/><circle cx="303" cy="548" r="5" fill="var(--m-tree)"/>
  <circle cx="455" cy="1162" r="10" fill="#4f8fc4" stroke="#2c5f89" stroke-width="2"/>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#pStud)" pointer-events="none"/>
  ${arboles}
  ${bld}
  <g font-family="IBM Plex Mono, monospace" font-size="10" fill="#fff" opacity=".85" pointer-events="none">
    <text x="300" y="150" text-anchor="middle" transform="rotate(-34 300 150)">Highway</text>
    <text x="364" y="992" text-anchor="middle">Field</text>
    <text x="232" y="503" text-anchor="middle">Plaza</text>
    <g transform="translate(628,1120)"><circle r="18" fill="rgba(0,0,0,.35)"/><path d="M0 -13 L5 3 L0 0 L-5 3 Z" fill="#fff"/><text y="14" text-anchor="middle" font-size="9">N</text></g>
  </g>
</svg>`;
}
function bbox(c){let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;c.parts.forEach(p=>{x1=Math.min(x1,p.x);y1=Math.min(y1,p.y);x2=Math.max(x2,p.x+p.w);y2=Math.max(y2,p.y+p.h)});return{x:x1,y:y1,w:x2-x1,h:y2-y1}}

let vbAnim=null;
function setVB(v){$('#mapa').setAttribute('viewBox',v.map(n=>n.toFixed(1)).join(' '))}
function enfocar(id,anim=true){
  const c=CONSTRUCCIONES.find(c=>c.id===id); if(!c) return;
  const b=bbox(c); const w=Math.max(b.w*2.6,240), h=w*MAPA_H/MAPA_W*0.75;
  const to=[b.x+b.w/2-w/2,b.y+b.h/2-h/2,w,h];
  document.querySelectorAll('.bld').forEach(g=>g.classList.toggle('si',g.dataset.id===id));
  const from=$('#mapa').getAttribute('viewBox').split(/\s+/).map(Number);
  if(!anim||reduce){setVB(to);return;}
  cancelAnimationFrame(vbAnim); const t0=performance.now(), dur=1100;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const step=now=>{const t=Math.min(1,(now-t0)/dur), e=ease(t); setVB(from.map((f,i)=>f+(to[i]-f)*e)); if(t<1) vbAnim=requestAnimationFrame(step)};
  vbAnim=requestAnimationFrame(step);
}
function verTodo(){cancelAnimationFrame(vbAnim);setVB([0,0,MAPA_W,MAPA_H])}

/* ===================== FASE 2: EDIFICIO LEGO 3D ===================== */
let T=null, raf=null;
function initT(){
  const el=$('#stage');
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio,2)); el.appendChild(r.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(38,1,0.1,400);
  scene.add(new THREE.HemisphereLight(0xffffff,0x4a5560,0.85));
  const sun=new THREE.DirectionalLight(0xffffff,0.75); sun.position.set(14,26,18); scene.add(sun);
  const fill=new THREE.DirectionalLight(0xbfd8ff,0.3); fill.position.set(-16,10,-12); scene.add(fill);
  const root=new THREE.Group(); scene.add(root);
  T={r,scene,cam,root,el,theta:-0.7,phi:0.95,rad:30,drag:null,idle:0,piezas:[],t0:0,mats:{}};
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight; if(!w||!h) return; r.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(el); resize();
  const c=r.domElement;
  c.addEventListener('pointerdown',e=>{T.drag={x:e.clientX,y:e.clientY,th:T.theta,ph:T.phi};c.setPointerCapture(e.pointerId);c.style.cursor='grabbing'});
  c.addEventListener('pointermove',e=>{if(!T.drag)return;T.theta=T.drag.th-(e.clientX-T.drag.x)*0.008;T.phi=Math.max(0.35,Math.min(1.35,T.drag.ph-(e.clientY-T.drag.y)*0.006));T.idle=performance.now()});
  const up=()=>{T.drag=null;c.style.cursor='grab';T.idle=performance.now()};
  c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up);
}
function mat(hex,op){
  const k=hex+'|'+(op||1); if(T.mats[k]) return T.mats[k];
  return T.mats[k]=new THREE.MeshStandardMaterial({color:hex,roughness:.38,metalness:0,transparent:!!op,opacity:op||1});
}
const STUD=new (window.THREE?THREE.CylinderGeometry:function(){})(0.3,0.3,0.2,18);
function studs(celdas,y,hex){
  const im=new THREE.InstancedMesh(STUD,mat(hex),celdas.length); const m=new THREE.Matrix4();
  celdas.forEach((c,i)=>{m.makeTranslation(c[0],y+0.1,c[1]);im.setMatrixAt(i,m)}); return im;
}
function construir3D(lugar){
  if(!window.THREE){ $('#stage').insertAdjacentHTML('beforeend','<p class="banner" style="position:absolute;inset:auto 12px 50px 12px">The 3D model could not load in this browser. The questions still work.</p>'); return; }
  if(!T) initT();
  while(T.root.children.length) T.root.remove(T.root.children[0]);
  const vols=MODELOS[lugar]||[];
  let x1=1e9,x2=-1e9,z1=1e9,z2=-1e9; vols.forEach(v=>{x1=Math.min(x1,v.x);x2=Math.max(x2,v.x+v.w);z1=Math.min(z1,v.z);z2=Math.max(z2,v.z+v.d)});
  const cx=(x1+x2)/2, cz=(z1+z2)/2, H=1.2;
  const PW=Math.ceil(x2-x1)+6, PD=Math.ceil(z2-z1)+6;
  // Placa base
  const base=new THREE.Group();
  const pl=new THREE.Mesh(new THREE.BoxGeometry(PW,0.4,PD),mat(C3.plate)); pl.position.y=-0.2; base.add(pl);
  const celdas=[]; for(let i=0;i<PW;i++)for(let j=0;j<PD;j++)celdas.push([-PW/2+i+0.5,-PD/2+j+0.5]);
  base.add(studs(celdas,0,C3.plate)); T.root.add(base);
  T.piezas=[];
  let orden=0;
  vols.forEach(v=>{
    const ox=v.x-cx, oz=v.z-cz;
    if(v.h===0){
      const g=new THREE.Group();
      const p=new THREE.Mesh(new THREE.BoxGeometry(v.w-0.04,0.4,v.d-0.04),mat(C3[v.c])); p.position.set(ox+v.w/2,0.2,oz+v.d/2); g.add(p);
      const cs=[]; for(let i=0;i<v.w;i++)for(let j=0;j<v.d;j++)cs.push([ox+i+0.5,oz+j+0.5]); g.add(studs(cs,0.4,C3[v.c]));
      if(v.plants){ const plantas=[[1.5,1.5,C3.leaf],[3.5,2.5,C3.orange],[5.5,1.5,C3.leaf],[7.5,2.5,C3.yellow],[9.5,1.5,C3.leaf],[10.5,3,C3.orange]];
        plantas.forEach(([px,pz,c])=>{const s=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.4,10),mat(c===C3.leaf?0x2f7a35:c));s.position.set(ox+px,1.1,oz+pz);g.add(s);
          const t=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.5,8),mat(0x6b4a2a));t.position.set(ox+px,0.55,oz+pz);g.add(t);}); }
      T.root.add(g); T.piezas.push({g,delay:orden++}); return;
    }
    for(let L=0;L<v.h;L++){
      const g=new THREE.Group(); const y=0.6+L*H;
      const ultimo=L===v.h-1; const col=C3[(ultimo&&v.top)?v.top:v.c];
      const b=new THREE.Mesh(new THREE.BoxGeometry(v.w-0.05,H-0.05,v.d-0.05),mat(col)); b.position.set(ox+v.w/2,y,oz+v.d/2); g.add(b);
      if(v.win&&L%2===1){
        for(let i=1;i+1<v.w;i+=2){ [oz-0.04,oz+v.d+0.04].forEach(zz=>{const w=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.78,0.1),mat(C3.glass,.82));w.position.set(ox+i+0.5,y,zz);g.add(w)}); }
        if(v.d>=4) for(let j=1;j+1<v.d;j+=2){ [ox-0.04,ox+v.w+0.04].forEach(xx=>{const w=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.78,1.3),mat(C3.glass,.82));w.position.set(xx,y,oz+j+0.5);g.add(w)}); }
      }
      if(ultimo){
        const top=y+H/2-0.025, cs=[];
        for(let i=0;i<v.w;i++)for(let j=0;j<v.d;j++){
          const interior=i>0&&i<v.w-1&&j>0&&j<v.d-1;
          if(v.panels&&interior) continue; cs.push([ox+i+0.5,oz+j+0.5]);
        }
        if(cs.length) g.add(studs(cs,top,col));
        if(v.panels){ for(let i=1;i<v.w-1;i+=2) for(let j=1;j<v.d-1;j++){ const p=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.16,0.9),mat(C3.panel)); p.position.set(ox+i+1,top+0.1,oz+j+0.5); p.rotation.x=-0.12; g.add(p);} }
      }
      T.root.add(g); T.piezas.push({g,delay:orden++});
    }
  });
  T.rad=Math.max(PW,PD)*1.15+8;
  T.t0=performance.now();
  T.piezas.forEach(p=>{p.g.position.y=reduce?0:14});
}
function loop(now){
  if(!T) return;
  const ease=t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375};
  if(!reduce) T.piezas.forEach(p=>{const t=Math.max(0,Math.min(1,(now-T.t0-p.delay*110)/520)); p.g.position.y=14*(1-ease(t));});
  if(!T.drag&&!reduce&&now-T.idle>2500) T.theta+=0.0022;
  const c=T.cam; c.position.set(T.rad*Math.sin(T.phi)*Math.sin(T.theta),T.rad*Math.cos(T.phi)+2,T.rad*Math.sin(T.phi)*Math.cos(T.theta)); c.lookAt(0,2.4,0);
  T.r.render(T.scene,c);
  raf=requestAnimationFrame(loop);
}
function arrancar3D(){ if(!T||raf) return; raf=requestAnimationFrame(loop); }
function parar3D(){ if(raf){cancelAnimationFrame(raf);raf=null;} }
