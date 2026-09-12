"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { WEIGHTS, resolveDamageGeometry, resolveDamageLogic } from "../../lib/damage-logic";

type RGB = { r:number; g:number; b:number };
type CMYK = { c:number; m:number; y:number; k:number };
type Portrait = { id:string; thumb:string; source:string; title:string; credit:string; license:string; licenseUrl:string; group?:string };
type Corpus = { count:number; portraits:Portrait[] };
type SystemState = { id:string; name:string; stress:number; trend?:number; confidence?:number; sourceUrl?:string; sourceAuthority?:string; sourceDate?:string|null };

const imageCache=new Map<string,Promise<HTMLImageElement>>();
const portraitColorCache=new Map<string,RGB>();
const portraitCmykCache=new Map<string,CMYK>();
const earthCanvasCache=new Map<string,HTMLCanvasElement>();
const SURFACE_DAMAGE_COLORS:Record<string,[number,number,number]>={C:[118,178,203],O:[84,153,190],B:[154,103,51],W:[81,155,181],F:[190,135,66],E:[215,116,45],H:[194,82,55],G:[137,91,71],T:[151,111,151]};
const SURFACE_FOOTPRINTS:Array<{id:string;lon:number;lat:number;scale:number}>=[
  {id:"O",lon:-34,lat:23,scale:1.35},{id:"O",lon:-17,lat:-34,scale:1.2},{id:"O",lon:18,lat:36,scale:.7},
  {id:"B",lon:-59,lat:-5,scale:1.25},{id:"B",lon:22,lat:0,scale:1.15},{id:"B",lon:47,lat:-19,scale:.72},
  {id:"W",lon:-62,lat:-4,scale:.86},{id:"W",lon:24,lat:-2,scale:.82},{id:"W",lon:31,lat:20,scale:.78},
  {id:"F",lon:10,lat:14,scale:1.25},{id:"F",lon:25,lat:-28,scale:.9},{id:"F",lon:-48,lat:-15,scale:.82},
  {id:"E",lon:3,lat:55,scale:.72},{id:"E",lon:48,lat:26,scale:.78},{id:"E",lon:-76,lat:38,scale:.68},
  {id:"H",lon:3,lat:7,scale:.72},{id:"H",lon:31,lat:30,scale:.62},{id:"H",lon:10,lat:49,scale:.66},
];
const SURFACE_EXPRESSIONS:Record<string,string>={C:"Atmosphere",O:"Ocean surface",B:"Living land",W:"Freshwater basins",F:"Food & soil belts",E:"Energy regions",H:"Human settlements",G:"Whole-system field",T:"Whole-system field"};

function loadImage(src:string,cors=false){
  const key=`${cors?"cors":"same"}:${src}`;
  const cached=imageCache.get(key); if(cached)return cached;
  const pending=new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();if(cors)img.crossOrigin="anonymous";img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
  imageCache.set(key,pending);return pending;
}
function drawCover(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h=w){
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;
  ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h);
}
function averageCoverColor(img:HTMLImageElement):RGB{
  const cached=portraitColorCache.get(img.src);if(cached)return cached;
  const sample=document.createElement("canvas");sample.width=16;sample.height=16;const ctx=sample.getContext("2d",{willReadFrequently:true});if(!ctx)return {r:128,g:128,b:128};
  drawCover(ctx,img,0,0,16);try{const data=ctx.getImageData(0,0,16,16).data;let r=0,g=0,b=0,n=0;for(let i=0;i<data.length;i+=16){r+=data[i];g+=data[i+1];b+=data[i+2];n++;}const color={r:r/n,g:g/n,b:b/n};portraitColorCache.set(img.src,color);return color;}catch{return{r:128,g:128,b:128};}
}
function clamp(v:number,min=0,max=1){return Math.max(min,Math.min(max,v));}
function smoothstep(v:number){const x=clamp(v);return x*x*(3-2*x);}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function rgbToCmyk({r,g,b}:RGB):CMYK{
  const rn=clamp(r/255),gn=clamp(g/255),bn=clamp(b/255),k=1-Math.max(rn,gn,bn);
  if(k>.999999)return{c:0,m:0,y:0,k:1};
  const d=1-k;return{c:(1-rn-k)/d,m:(1-gn-k)/d,y:(1-bn-k)/d,k};
}
function cmykToRgb({c,m,y,k}:CMYK):RGB{return{r:255*(1-clamp(c))*(1-clamp(k)),g:255*(1-clamp(m))*(1-clamp(k)),b:255*(1-clamp(y))*(1-clamp(k))};}
function mixCmyk(a:CMYK,b:CMYK,t:number):CMYK{return{c:lerp(a.c,b.c,t),m:lerp(a.m,b.m,t),y:lerp(a.y,b.y,t),k:lerp(a.k,b.k,t)};}
function cmykDistance(a:CMYK,b:CMYK){const dc=a.c-b.c,dm=a.m-b.m,dy=a.y-b.y,dk=a.k-b.k;return dc*dc+dm*dm+dy*dy+dk*dk*1.25;}
function averageCoverCmyk(img:HTMLImageElement):CMYK{
  const cached=portraitCmykCache.get(img.src);if(cached)return cached;
  const value=rgbToCmyk(averageCoverColor(img));portraitCmykCache.set(img.src,value);return value;
}
function hash01(n:number,seed:number){const x=Math.sin((n+1)*12.9898+(seed+1)*78.233)*43758.5453;return x-Math.floor(x);}
function portraitThumb(src:string){return src.replace(/([?&])width=\d+/i,"$1width=256");}
function portraitConfidence(p:Portrait){
  const title=p.title.toLowerCase();
  if(/cosplay|costume|double portrait|group portrait|group photo|crowd|statue|sculpt|painting|drawing|illustrat|mannequin|poster|mural/.test(title))return 0;
  let score=1;
  if(/portrait|headshot|head shot|face|close[- ]?up|primer plano|profile/.test(title))score+=4;
  if(/woman|women|man|men|girl|boy|actress|actor|author|writer|artist|scientist|professor|doctor|minister|politician/.test(title))score+=2;
  if(p.group==="women"||p.group==="men")score+=1;
  return score;
}

/**
 * Builds the canonical planetary endpoint as Earth itself. The immutable base is
 * a derivative-chain image carrying the Face's photographic/material grammar but
 * none of its anatomy. Natural Earth supplies the geographic evidence mask, and
 * S_i -> damage_i = S_i^1.35 supplies the live diagnostic damage above the base.
 */
function drawDiagnosticEarth(ctx:CanvasRenderingContext2D,planet:HTMLImageElement,size:number,systems:SystemState[],momentum:number){
  const logic=resolveDamageLogic(systems,momentum),damage=Object.fromEntries(logic.systems.map(system=>[system.id,system.damage])) as Record<string,number>;
  const geometry=Object.fromEntries(logic.systems.map(system=>[system.id,system])) as Record<string,(typeof logic.systems)[number]>;
  const {fracture,tears,pose}=logic;
  const nonSpatial=((damage.E??0)+(damage.H??0)+(damage.G??0)+(damage.T??0))/4;

  drawCover(ctx,planet,0,0,size);
  const inset=size*.04,diameter=size*.92,radius=diameter/2,cx=size/2,cy=size/2;
  const rasterSize=Math.min(620,Math.max(300,Math.round(size))),out=document.createElement("canvas");out.width=rasterSize;out.height=rasterSize;const ox=out.getContext("2d");if(!ox)return;
  const landMask=document.createElement("canvas");landMask.width=rasterSize;landMask.height=rasterSize;const lx=landMask.getContext("2d",{willReadFrequently:true});if(!lx)return;
  const projection=geoOrthographic().translate([rasterSize/2,rasterSize/2]).scale(rasterSize*.49).rotate([-12,-8,0]).clipAngle(90).precision(.25);
  const land=feature(world as never,(world as {objects:{land:never}}).objects.land);
  lx.fillStyle="#fff";lx.beginPath();geoPath(projection,lx)(land as never);lx.fill();
  const landData=lx.getImageData(0,0,rasterSize,rasterSize).data;
  // Damage is a translucent, deterministic evidence field laid over the
  // generated canonical base. It never invents a second geography or replaces
  // the source image's museum-grade material detail.
  const frame=ox.createImageData(rasterSize,rasterSize),data=frame.data;
  for(let y=0;y<rasterSize;y++)for(let x=0;x<rasterSize;x++){
    const nx=(x+.5-rasterSize/2)/(rasterSize/2),ny=(y+.5-rasterSize/2)/(rasterSize/2),rr=nx*nx+ny*ny,di=(y*rasterSize+x)*4;
    if(rr>1){data[di+3]=0;continue;}
    const isLand=landData[di+3]>0;
    const terrestrial=((damage.B??0)+(damage.F??0)+(damage.W??0))/3;
    const domain=isLand?terrestrial:(damage.O??0),climate=damage.C??0;
    data[di]=isLand?129:126;data[di+1]=isLand?67:72;data[di+2]=isLand?31:66;
    data[di+3]=Math.round(255*clamp(.02+.15*domain+.05*climate+.045*nonSpatial,0,.31));
  }
  ox.putImageData(frame,0,0);
  ctx.drawImage(out,inset,inset,diameter,diameter);

  // Project current global indicators onto the visible domains they describe.
  // These are real surface footprints, not unsupported local estimates:
  // intensity is exact to the indicator; precision stays at the source scope.
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
  for(const footprint of SURFACE_FOOTPRINTS){
    const point=projection([footprint.lon,footprint.lat]);if(!point)continue;
    const profile=geometry[footprint.id];if(!profile||profile.damage<=0)continue;const d=profile.damage;
    const px=inset+point[0]*diameter/rasterSize,py=inset+point[1]*diameter/rasterSize,pr=radius*(.045+.12*profile.areaPercent/100)*footprint.scale;
    const [r,g,b]=SURFACE_DAMAGE_COLORS[footprint.id]??[178,104,62];
    const glow=ctx.createRadialGradient(px,py,pr*.08,px,py,pr);glow.addColorStop(0,`rgba(${r},${g},${b},${.16+.25*d})`);glow.addColorStop(.42,`rgba(${r},${g},${b},${.09+.17*d})`);glow.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(${r},${g},${b},${.16+.34*d})`;ctx.lineWidth=Math.max(.45,profile.widthPx*size/1600);ctx.beginPath();ctx.arc(px,py,pr*(.34+.08*hash01(Math.round(footprint.lon*10),23)),0,Math.PI*2);ctx.stroke();
    const branches=Math.round(profile.branching),segments=Math.max(1,Math.round(profile.density/28));for(let j=0;j<branches*segments;j++){const a=Math.PI*2*hash01(j+Math.round(footprint.lat*10),Math.round(footprint.lon));const turn=(hash01(j,71)-.5)*(1-profile.angularity);const len=Math.max(pr*.18,profile.polygonPx*size/1600)*(1+.7*hash01(j,47));ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a)*len,py+Math.sin(a)*len);ctx.lineTo(px+Math.cos(a+turn)*len*1.55,py+Math.sin(a+turn)*len*1.55);ctx.stroke();}
  }
  ctx.restore();

  // The Face's hydro-emotive control is not discarded at the Planet endpoint:
  // identical count, length, width, opacity and residue become surface water
  // channels beginning in the visible freshwater-basin footprints.
  const waterOrigins=SURFACE_FOOTPRINTS.filter(footprint=>footprint.id==="W");
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();ctx.lineCap="round";
  for(let i=0;i<tears.count;i++){const origin=waterOrigins[i%waterOrigins.length],point=projection([origin.lon,origin.lat]);if(!point)continue;const x=inset+point[0]*diameter/rasterSize,y=inset+point[1]*diameter/rasterSize,len=radius*tears.length*(.48+.12*hash01(i,113));ctx.strokeStyle=`rgba(178,211,224,${tears.opacity})`;ctx.lineWidth=Math.max(.6,tears.widthPx*size/1600);ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+radius*pose.dx,y+len*.28,x-radius*pose.dx*.6,y+len*.68,x-radius*pose.dx,y+len);ctx.stroke();ctx.strokeStyle=`rgba(222,207,177,${.12+.2*tears.residue})`;ctx.lineWidth=Math.max(.35,tears.widthPx*size/3200);ctx.stroke();}
  ctx.restore();

  // Geographic edges are geometry, not imagery: this is an accurate land mask
  // projected on the sphere, so the endpoint does not depend on a stock Earth.
  ctx.save();ctx.translate(inset,inset);ctx.scale(diameter/rasterSize,diameter/rasterSize);ctx.strokeStyle="rgba(227,223,207,.16)";ctx.lineWidth=.7;ctx.beginPath();geoPath(projection,ctx)(land as never);ctx.stroke();ctx.restore();

  // The fracture network is a deterministic expression of the same aggregate
  // fracture scalar used by the Face; it carries no invented geographic claim.
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
  const meanDensity=logic.systems.reduce((sum,system)=>sum+(WEIGHTS[system.id as keyof typeof WEIGHTS]??0)*system.density,0),meanWidth=logic.systems.reduce((sum,system)=>sum+(WEIGHTS[system.id as keyof typeof WEIGHTS]??0)*system.widthPx,0),meanPolygon=logic.systems.reduce((sum,system)=>sum+(WEIGHTS[system.id as keyof typeof WEIGHTS]??0)*system.polygonPx,0),meanAngularity=logic.systems.reduce((sum,system)=>sum+(WEIGHTS[system.id as keyof typeof WEIGHTS]??0)*system.angularity,0);
  const crackCount=Math.round(6+meanDensity*fracture*.32),crackAlpha=.08+.30*fracture;
  ctx.strokeStyle=`rgba(166,112,76,${crackAlpha})`;ctx.lineWidth=Math.max(.45,meanWidth*size/1600);
  for(let k=0;k<crackCount;k++){
    const a=2*Math.PI*hash01(k,19),rad=radius*(.16+.72*hash01(k,37)),x0=cx+Math.cos(a)*rad,y0=cy+Math.sin(a)*rad,len=Math.max(meanPolygon*size/1600,radius*(.035+.12*fracture))*(.65+.7*hash01(k,53));
    const dir=a+pose.upperFaceTorsion*Math.PI/180+(.5-hash01(k,71))*(1-meanAngularity);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(dir)*len*.48,y0+Math.sin(dir)*len*.48);ctx.lineTo(x0+Math.cos(dir+(1-meanAngularity)*(hash01(k,91)-.5))*len,y0+Math.sin(dir+(1-meanAngularity)*(hash01(k,91)-.5))*len);ctx.stroke();
  }
  ctx.restore();
  ctx.save();ctx.globalCompositeOperation="screen";ctx.strokeStyle=`rgba(119,169,197,${.10+.16*(damage.C??0)})`;ctx.lineWidth=Math.max(1,size*.004);ctx.beginPath();ctx.arc(cx,cy,radius-size*.003,0,Math.PI*2);ctx.stroke();ctx.restore();
}

function diagnosticEarth(planet:HTMLImageElement,size:number,systems:SystemState[],momentum:number){
  const key=`derived-v1|${size}|${momentum.toFixed(4)}|${systems.map(s=>`${s.id}:${s.stress.toFixed(4)}`).join("|")}`;
  const cached=earthCanvasCache.get(key);if(cached)return cached;
  const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d",{willReadFrequently:true});if(ctx)drawDiagnosticEarth(ctx,planet,size,systems,momentum);
  earthCanvasCache.set(key,canvas);while(earthCanvasCache.size>6){const oldest=earthCanvasCache.keys().next().value;if(oldest)earthCanvasCache.delete(oldest);else break;}return canvas;
}

export default function PhenotypeMosaic({source,systems,momentum=0}:{source:string;systems:SystemState[];momentum?:number}){
  const hostRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null);
  const [corpus,setCorpus]=useState<Corpus|null>(null),[phase,setPhase]=useState(1/3),[generation,setGeneration]=useState(0);
  useEffect(()=>{let dead=false;fetch("/human-corpus.json").then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Corpus>;}).then(v=>{if(!dead)setCorpus(v);}).catch(()=>{if(!dead)setCorpus(null);});return()=>{dead=true;};},[]);

  const diagnostic=useMemo(()=>{
    const weightedStress=systems.reduce((sum,system)=>sum+(WEIGHTS[system.id]??0)*clamp(system.stress),0);
    const pressures=[...systems].sort((a,b)=>(WEIGHTS[b.id]??0)*clamp(b.stress)-(WEIGHTS[a.id]??0)*clamp(a.stress)).slice(0,3);
    const evidenceDate=systems.map(system=>system.sourceDate).filter((date):date is string=>Boolean(date)).sort().at(-1)??"31 July 2026 reference";
    const damageLogic=resolveDamageLogic(systems,momentum);
    return {coherence:damageLogic.coherence,weightedStress,pressures,evidenceDate,damageLogic};
  },[systems]);

  const systemCount=Math.max(1,systems.length),cols=systemCount,total=cols*cols;
  const facePopulate=smoothstep(phase/(1/3));
  const faceToEarth=smoothstep((phase-1/3)/(1/3));
  const earthResolve=smoothstep((phase-2/3)/(1/3));
  const activePortraits=phase<=1/3?Math.round(total*facePopulate):phase<=2/3?total:Math.round(total*(1-earthResolve));

  useEffect(()=>{
    let cancelled=false,frame=0;const host=hostRef.current,canvas=canvasRef.current;if(!host||!canvas)return;
    const draw=async()=>{
      const size=Math.max(280,Math.floor(host.getBoundingClientRect().width)),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=size*dpr;canvas.height=size*dpr;canvas.style.width=`${size}px`;canvas.style.height=`${size}px`;
      const ctx=canvas.getContext("2d",{alpha:false});if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
      let face:HTMLImageElement,planet:HTMLImageElement;try{[face,planet]=await Promise.all([loadImage(source),loadImage("/canonical-planet-derived.png")]);}catch{return;}if(cancelled)return;

      const faceWorld=document.createElement("canvas");faceWorld.width=size;faceWorld.height=size;const faceCtx=faceWorld.getContext("2d",{willReadFrequently:true});if(!faceCtx)return;drawCover(faceCtx,face,0,0,size);
      let facePixels:Uint8ClampedArray;try{facePixels=faceCtx.getImageData(0,0,size,size).data;}catch{return;}
      const earthWorld=diagnosticEarth(planet,size,systems,momentum),earthCtx=earthWorld.getContext("2d",{willReadFrequently:true});if(!earthCtx)return;

      // Endpoints are mathematically governed targets. Portraits literally
      // replace their corresponding square pixel-blocks between those anchors.
      if(phase<2/3)ctx.drawImage(faceWorld,0,0,size,size);else ctx.drawImage(earthWorld,0,0,size,size);
      if(activePortraits<=0)return;

      let earthPixels:Uint8ClampedArray;try{earthPixels=earthCtx.getImageData(0,0,size,size).data;}catch{return;}
      const people=corpus?.portraits||[];if(!people.length)return;
      // Prefer genuinely face-forward photographs before palette matching. The
      // corpus is large and category membership alone does not guarantee that
      // a centered square crop still reads as a person (group shots, cosplay,
      // sculptures, etc. occur in the source category). This filter changes
      // selection only; it never changes a photograph's native pixels.
      const candidateIndices=people.map((p,index)=>({index,score:portraitConfidence(p),jitter:hash01(index,generation+313)}))
        .filter(v=>v.score>0)
        .sort((a,b)=>b.score-a.score||a.jitter-b.jitter)
        .slice(0,Math.min(people.length,total*3))
        .map(v=>v.index);
      const loaded=(await Promise.all(candidateIndices.map(async index=>{try{const img=await loadImage(portraitThumb(people[index].thumb),true);return{index,img,color:averageCoverCmyk(img)};}catch{return null;}}))).filter((v):v is {index:number;img:HTMLImageElement;color:CMYK}=>v!==null);
      if(cancelled||!loaded.length)return;

      const tile=size/cols,available=loaded.slice(0,total),assignments:Array<{cell:number;img:HTMLImageElement}>=[];
      const targetMix=phase<=1/3?0:phase<=2/3?faceToEarth:1;
      for(let row=0;row<cols;row++)for(let col=0;col<cols;col++){
        if(!available.length)break;const px=clamp(Math.floor((col+.5)*tile),0,size-1),py=clamp(Math.floor((row+.5)*tile),0,size-1),i=(py*size+px)*4;
        const targetColor=mixCmyk(rgbToCmyk({r:facePixels[i],g:facePixels[i+1],b:facePixels[i+2]}),rgbToCmyk({r:earthPixels[i],g:earthPixels[i+1],b:earthPixels[i+2]}),targetMix);let best=0,d=Infinity;
        for(let k=0;k<available.length;k++){const next=cmykDistance(targetColor,available[k].color);if(next<d){d=next;best=k;}}
        const [choice]=available.splice(best,1);assignments.push({cell:row*cols+col,img:choice.img});
      }
      const revealOrder=assignments.map((_,i)=>i).sort((a,b)=>hash01(a,generation+101)-hash01(b,generation+101));
      const visible=new Set(revealOrder.slice(0,Math.min(activePortraits,assignments.length)));
      for(let i=0;i<assignments.length;i++)if(visible.has(i)){const {cell,img}=assignments[i],row=Math.floor(cell/cols),col=cell%cols;drawCover(ctx,img,col*tile,row*tile,tile);}
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>void draw());};const observer=new ResizeObserver(schedule);observer.observe(host);schedule();return()=>{cancelled=true;cancelAnimationFrame(frame);observer.disconnect();};
  },[source,systems,momentum,corpus,phase,generation,cols,total,activePortraits,faceToEarth]);

  const countLabel=phase===0?"Face":phase===1?"Planet":activePortraits.toLocaleString();
  const diagnosticView=phase<1/3?"Face":phase<2/3?"Humanity":"Planet";
  return <section className="human-mosaic" aria-labelledby="human-mosaic-title">
    <div className="human-mosaic-copy">
      <div><p className="eyebrow">From Face to Planet</p><h2 id="human-mosaic-title">One diagnosis,<br/><em>seen two ways.</em></h2></div>
      <div><p>The endpoints are one diagnosis rendered in two forms. The current Face is one finite CMYK field; the Canonical Planet is a derivative-chain Earth carrying the same photographic, mineral-fresco, and fracture grammar beneath accurate geography and illustrative damage. The same nine canonical reference values govern both. Regional marks are illustrative, not measurements of local damage.</p><p>Between them, {systemCount} × {systemCount} = {total} real human portraits replace image cells, remain fixed while the Face recomposes into the Planet, then resolve into the derived Earth. Moving the slider changes the view—not the evidence, weights, score, or provenance.</p></div>
    </div>
    <div className="human-mosaic-stage humanity-earth-stage" ref={hostRef}>
      <canvas ref={canvasRef} aria-label={phase===0?"The canonical Face of Earth":phase<1/3?`${activePortraits} real-person portrait tiles replacing pixels of the canonical Face`:phase<=2/3?`${total} real-person portraits recomposing the canonical Face into the canonical Earth`:`${activePortraits} real-person portrait tiles resolving into canonical Earth`} />
    </div>
    <div className="human-mosaic-controls">
      <label><span>From Face to Planet</span><input aria-label="Move the evidence-based diagnostic from Face to Planet" type="range" min="0" max="1" step="0.001" value={phase} onChange={e=>setPhase(Number(e.target.value))}/><small><b>Face</b><b>Humanity · {systemCount}×{systemCount}</b><b>Earth · {systemCount}×{systemCount}</b><b>Planet</b></small></label>
      <div className="human-mosaic-count"><strong>{countLabel}</strong><span>{phase===0?"canonical face":phase===1?"canonical planet":`${activePortraits} portrait pixels`}</span></div>
      <button onClick={()=>setGeneration(v=>v+1)}>Recompose humanity</button>
    </div>
    <div className="face-planet-diagnostic" aria-live="polite">
      <div><span>Current view</span><strong>{diagnosticView}</strong></div>
      <div><span>Coherence</span><strong>{diagnostic.coherence.toFixed(3)}</strong></div>
      <div><span>Weighted stress</span><strong>{diagnostic.weightedStress.toFixed(3)}</strong></div>
      <div><span>Evidence field</span><strong>{systems.length} reference systems</strong></div>
      <div className="diagnostic-pressures"><span>Largest weighted pressures</span><p>{diagnostic.pressures.map((system,index)=>system.sourceUrl?<a href={system.sourceUrl} target="_blank" rel="noreferrer" key={system.id}>{index+1}. {system.name} · {system.stress.toFixed(3)} ↗</a>:<b key={system.id}>{index+1}. {system.name} · {system.stress.toFixed(3)}</b>)}</p></div>
    </div>
    <div className="surface-profile" aria-label="Canonical reference surface damage profile">
      <div className="surface-profile-head"><div><span>Identical diagnostic lock</span><strong>One damage object · two substrates</strong></div><p>The Planet now receives the Canonical Face’s exact affected area, crack density, width, polygon scale, branching, angularity, fracture, strain and tear-hydrology controls. Only the coordinate surface changes. F {diagnostic.damageLogic.fracture.toFixed(3)} · T {diagnostic.damageLogic.tearHydrology.toFixed(3)} · evidence {diagnostic.evidenceDate}.</p></div>
      <div className="surface-profile-grid">{systems.map(system=>{const [r,g,b]=SURFACE_DAMAGE_COLORS[system.id]??[178,104,62],profile=resolveDamageGeometry(system.stress);return <a href={system.sourceUrl} target="_blank" rel="noreferrer" key={system.id}><i style={{background:`rgb(${r},${g},${b})`}}/><span><b>{system.id} · {system.name}</b><small>{SURFACE_EXPRESSIONS[system.id]??"Whole-system field"} · {profile.areaPercent.toFixed(1)}% rendered coverage</small></span><strong>{profile.damage.toFixed(3)}</strong></a>;})}</div>
    </div>
    <p className="human-mosaic-note">The renderer never recolors a human photograph and never repeats one within a composition. Face RGB samples and the Planet RGB field are converted into CMYK targets; stock portraits are matched to those targets by their own native CMYK averages. Through the center, the same N = m² portraits are reassigned from the human target field to the planetary target field. Face and Planet resolve one shared canonical damage object: Sᵢ → Sᵢ¹·³⁵ governs affected area, density, width, polygon scale, branching and angularity; the same weighted function governs fracture, strain and tear hydrology. The Face maps it to anatomy. Natural Earth maps it to planetary domains. The diagnostic never changes—only the substrate does.</p>
    <details className="human-mosaic-sources"><summary>Image, planet & human provenance</summary><div><a href="/human-corpus.json" target="_blank" rel="noreferrer">Current human provenance manifest</a><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth · geographic geometry</a><a href="https://commons.wikimedia.org/wiki/Category:Portrait_photographs" target="_blank" rel="noreferrer">Wikimedia Commons · portraits</a></div></details>
  </section>;
}
