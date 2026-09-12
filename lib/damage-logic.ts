export const WEIGHTS = { C: .16, O: .13, B: .16, W: .11, F: .10, E: .08, H: .09, G: .10, T: .07 } as const;
export type DamageSystemId = keyof typeof WEIGHTS;
export type DamageInput = { id: string; stress: number; trend?: number };

const clip = (n:number,lo=0,hi=1)=>Math.min(hi,Math.max(lo,n));

export function resolveDamageGeometry(stressValue:number){
  const stress=clip(stressValue),damage=stress**1.35;
  return {damage,areaPercent:100*(.12+.76*damage),density:18+122*damage,widthPx:.45+2.8*damage,polygonPx:18-12*damage,branching:1.2+3.8*damage,angularity:Math.max(.58,.25+.7*damage)};
}

export function resolveDamageLogic(systems:DamageInput[],momentumOverride?:number){
  const completed=systems.map(system=>({...system,stress:clip(system.stress),...resolveDamageGeometry(system.stress)}));
  const by=Object.fromEntries(completed.map(system=>[system.id,system])) as Record<DamageSystemId,(typeof completed)[number]>;
  const weighted=(key:"stress"|"damage")=>completed.reduce((sum,system)=>sum+(WEIGHTS[system.id as DamageSystemId]??0)*system[key],0);
  const coherence=1-weighted("stress");
  const momentum=clip(momentumOverride??completed.reduce((sum,system)=>sum+(WEIGHTS[system.id as DamageSystemId]??0)*(system.trend??0),0),-1,1);
  const fracture=clip(.45*(1-coherence)+.25*weighted("damage")+.2*Math.max(...completed.map(system=>system.damage))+.1*Math.max(momentum,0));
  const tearHydrology=clip(.4*by.W.stress+.15*by.O.stress+.25*fracture+.1*Math.max(momentum,0)+.1*(1-coherence));
  const right=.3*by.O.stress+.4*by.B.stress+.2*by.W.stress+.1*by.T.stress;
  const left=.55*by.C.stress+.2*by.F.stress+.25*by.E.stress;
  return {systems:completed,coherence,momentum,fracture,tearHydrology,
    tears:{count:Math.round(1+5*tearHydrology),length:.08+.44*tearHydrology,widthPx:.8+2.8*tearHydrology,opacity:.24+.66*tearHydrology,residue:.3+.6*by.W.stress},
    pose:{headRoll:clip(18*momentum,-15,15),upperFaceTorsion:4*(.6*by.G.stress+.4*by.C.stress),dx:.018*(right-left),dy:-.022*(.65*by.G.stress+.35*by.C.stress)},
    expression:{innerBrowRaise:.38*fracture,browLowering:.62*fracture,upperLidLowering:.28*fracture,lowerLidTension:.46*fracture,lipPress:.34*fracture,lipSeparation:.018*fracture,jawTension:.52*fracture,eyeMoisture:.15+.5*fracture}};
}
