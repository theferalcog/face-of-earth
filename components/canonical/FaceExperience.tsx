"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import PhenotypeMosaic from "./phenotype-mosaic";
import CurrentEvidence from "./CurrentEvidence";

type Subsystem = { id: string; name: string; stress: number; confidence: number; trend: number; damage?:number; areaPercent?:number; density?:number; widthPx?:number; polygonPx?:number; branching?:number; angularity?:number; sourceUrl: string; sourceTitle: string; sourceAuthority: string; sourceDate: string | null };
type Edition = {
  id: string;
  status: "canonical" | "collecting" | "calculating" | "rendering" | "ready" | "failed";
  observationDate: string;
  generatedAt: string;
  imageUrl: string;
  imageStatus: "canonical" | "generating" | "generated" | "failed";
  evidenceMode: "canonical" | "live" | "canonical_fallback";
  failureStage?: string;
  failureCode?: string;
  coherence: number;
  confidence: number;
  momentum: number;
  fracture: number;
  tearHydrology: number;
  sources: number;
  changed: boolean;
  phenotype: { skinTone:number; eyeColor:number; hairColor:number; hairTexture:number; noseWidth:number; lipFullness:number; cheekboneHeight:number; eyeShape:number; faceWidth:number; jawStructure:number; browStructure:number; genderPresentation:number; facialHair:number; facialHairTexture:number };
  subsystems: Subsystem[];
};
type ContributionReview = { status:"pending"|"reviewing"|"approve_candidate"|"admitted"|"rejected"|"human_review"|"review_failed"; kernelId?:string|null; review:null|{reason:string;confidence:number;publisher:string;claim:string;falsifier:string;methodUrl:string;limitations:string;extractedValue:string|null;observationDate:string|null;citations:Array<{title:string;url:string}>;checks:Record<string,boolean>} };
type SourceKernel = { id:string; system:string; url:string; title:string; publisher:string; sourceTier:string; claim:string; falsifier:string; methodUrl:string; limitations:string; observationDate:string|null; scoreRole:"current_indicator"|"corroboration"|"context"; gateVersion:string; gate:Record<string,boolean>; reviewerConfidence:number; citations:Array<{title:string;url:string}>; admittedAt:string; admittedWeek:string; receiptHash:string };
type GateDefinition = { id:string; label:string; rule:string };
const defaultSourceGate:GateDefinition[]=[
  {id:"self",label:"Self",rule:"Claim, publisher, date, and boundary are identifiable."},{id:"agency",label:"Agency",rule:"A possible falsifier is stated."},{id:"witness",label:"Witness",rule:"Evidence is freely inspectable."},{id:"relatability",label:"Relatability",rule:"Evidence maps to the named planetary system."},{id:"propagation",label:"Propagation",rule:"Method or data can be checked again."},{id:"integration",label:"Integration",rule:"Independent verification is possible."},{id:"degradation",label:"Degradation",rule:"Uncertainty and limits remain visible."},
];
const essentialAxiom = [
  ["Agree first", "Set the rules before a claim is checked. Do not move them while the check is running."],
  ["Claims submit", "Drop or narrow a claim that fails. Renaming it does not rescue it."],
  ["The verifier can say no", "The person checking a claim must be free to refuse and cannot be overruled by its author."],
  ["The verifier is checkable", "A refusal can itself be examined from outside the loop. Independence protects standing, not infallibility."],
  ["Keep the ledger", "Record what survived, what was removed, and what was corrected beside the claim."],
  ["Nothing is final", "Every result remains open to another agreed check, including these rules themselves."],
] as const;

const unifyingPrinciple = "No part of a living whole remains coherent alone: each part must remain itself, relate truthfully to the whole, and repair what its participation degrades.";

const canonical: Edition = {
  id: "canonical-2026-07-31",
  status: "canonical",
  observationDate: "31 July 2026",
  generatedAt: "Canonical standard",
  imageUrl: "/canonical-face-of-earth.png",
  imageStatus: "canonical",
  evidenceMode: "canonical",
  coherence: 0.288,
  confidence: 0.823,
  momentum: 0.141,
  fracture: 0.652,
  tearHydrology: 0.6518,
  sources: 0,
  changed: false,
  phenotype: { skinTone:.52, eyeColor:.3, hairColor:.2, hairTexture:.5, noseWidth:.52, lipFullness:.48, cheekboneHeight:.5, eyeShape:.52, faceWidth:.5, jawStructure:.5, browStructure:.5, genderPresentation:.5, facialHair:0, facialHairTexture:.5 },
  subsystems: [
    ["C", "Climate", .8], ["O", "Ocean + cryosphere", .77], ["B", "Biosphere", .84],
    ["W", "Freshwater", .72], ["F", "Food + soil", .68], ["E", "Energy transition", .48],
    ["H", "Human systems", .65], ["G", "Governance", .76], ["T", "Technology", .42],
  ].map(([id, name, stress]) => {
    const sources: Record<string,[string,string,string]> = {
      C:["WMO","Global mean surface-temperature anomaly","https://wmo.int/publication-series/state-of-global-climate/state-of-global-climate-2025"], O:["NOAA NCEI","Global ocean heat and salt content","https://www.ncei.noaa.gov/access/global-ocean-heat-content/"], B:["Living Planet Index / ZSL","Living Planet Index","https://www.livingplanetindex.org/"], W:["UN-Water","Progress on level of water stress","https://www.unwater.org/publications/progress-level-water-stress-2024-update"], F:["FAO SOFI","State of Food Security and Nutrition","https://www.fao.org/publications/fao-flagship-publications/the-state-of-food-security-and-nutrition-in-the-world/en"], E:["Energy Institute","Statistical Review of World Energy","https://www.energyinst.org/statistical-review"], H:["UNHCR","Global Trends","https://www.unhcr.org/global-trends"], G:["V-Dem Institute","Democracy Reports","https://www.v-dem.net/publications/democracy-reports/"], T:["ITU / UNITAR","Global E-waste Monitor","https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx"]
    };
    const source=sources[String(id)]; return { id:String(id),name:String(name),stress:Number(stress),confidence:.823,trend:0,sourceAuthority:source[0],sourceTitle:source[1],sourceUrl:source[2],sourceDate:null };
  }),
};

const phases: Record<Edition["status"], string> = {
  canonical: "Reference edition",
  collecting: "Checking the latest evidence",
  calculating: "Bringing the numbers together",
  rendering: "Creating the current portrait",
  ready: "Current edition verified",
  failed: "We couldn’t complete this edition",
};

const restorationMeasures = [
  { term:"R₁", system:"Climate", weight:"0.16", status:"enabler", statusLabel:"Enabling measure", measure:"Deliver the 2035 NDC commitments, cut greenhouse-gas emissions in absolute terms, and replace high-carbon energy with low-carbon supply.", signal:"The November 2025 UNFCCC update projects global emissions 12% below 2019 levels by 2035, based on NDCs from 113 Parties.", gate:"A promise to reduce pressure is not yet R₁. The climate state σ₁ has to measurably improve before the calculus credits restoration.", links:[{label:"UNFCCC · NDC update",url:"https://unfccc.int/news/update-to-ndc-synthesis-report-shows-the-emissions-curve-is-being-bent-downwards-but-urgent"},{label:"WMO · climate state",url:"https://wmo.int/publication-series/state-of-global-climate/state-of-global-climate-2025"}] },
  { term:"R₂", system:"Ocean + cryosphere", weight:"0.13", status:"enabler", statusLabel:"Enabling measure", measure:"Protect the high seas through the BBNJ Agreement and marine protected areas, while reducing the climate pressure driving ocean heat.", signal:"The BBNJ Agreement entered into force on 17 January 2026, opening a new route for area-based protection including marine protected areas.", gate:"Because σ₂ is anchored to ocean heat, protection alone cannot be counted as R₂. The measured heat state has to improve.", links:[{label:"UN · BBNJ Agreement",url:"https://www.un.org/bbnjagreement/en"},{label:"NOAA · ocean heat",url:"https://www.ncei.noaa.gov/access/global-ocean-heat-content/"}] },
  { term:"R₃", system:"Biosphere", weight:"0.16", status:"partial", statusLabel:"Partial / candidate", measure:"Bring degraded ecosystems back: protect habitat, remove invasive species, and rebuild viable populations under GBF Target 2.", signal:"CBD Target 2 calls for 30% of degraded ecosystems to be under effective restoration by 2030; UNEP documents major recovery work already underway.", gate:"Local recovery matters, and measured gains belong in the ledger. Global R₃ still needs those gains translated into the same biosphere state used for σ₃.", links:[{label:"CBD · Target 2 Road Map",url:"https://www.cbd.int/restoration/implementation/T2Roadmap.shtml"},{label:"UNEP · restoration outcomes",url:"https://www.unep.org/news-and-stories/story/back-brink-six-species-saved-ecosystem-restoration"}] },
  { term:"R₄", system:"Freshwater", weight:"0.11", status:"partial", statusLabel:"Partial / candidate", measure:"Restore rivers and wetlands, use water more efficiently, and manage freshwater as one connected system.", signal:"The Freshwater Challenge targets 300,000 km of rivers and 350 million ha of wetlands; global water-use efficiency rose 24% from 2015 to 2023.", gate:"These are encouraging signals. R₄ is credited only where the improvement maps back to the same water-stress state used for σ₄.", links:[{label:"UNEP · Freshwater Challenge",url:"https://www.unep.org/events/unep-event/freshwater-challenge"},{label:"FAO · SDG 6.4.1",url:"https://www.fao.org/sustainable-development-goals-data-portal/data/indicators/641-change-in-water-use-efficiency-over-time/en"}] },
  { term:"R₅", system:"Food + soil", weight:"0.10", status:"measured", statusLabel:"Measured outcome", measure:"Reduce hunger, build resilient food systems, and restore the degraded land and soil those systems depend on.", signal:"FAO reports global hunger at 7.8% in 2025, down from 8.6% in 2022; sustainable land-management programmes target degraded soils directly.", gate:"The food-state improvement can be measured now. Soil restoration remains separate until σ₅ formally includes a soil sub-indicator.", links:[{label:"FAO · Hunger Map 2026",url:"https://www.fao.org/interactive/hunger-map/en/"},{label:"FAO · sustainable land management",url:"https://www.fao.org/land-water/land/sustainable-land-management/en/"}] },
  { term:"R₆", system:"Energy transition", weight:"0.08", status:"measured", statusLabel:"Measured outcome", measure:"Replace fossil generation with low-carbon power, then build the grids, storage, electrification and efficiency needed to make that change durable.", signal:"In 2025 renewables and hydro overtook coal in global electricity generation; IRENA records 692 GW of renewable capacity added, up 15.5% year on year.", gate:"This is measurable movement. It enters R₆ only after normalization against the same energy-transition definition and interval used for σ₆.", links:[{label:"Energy Institute · 2026 review",url:"https://www.energyinst.org/statistical-review"},{label:"IRENA · 2026 capacity",url:"https://www.irena.org/Publications/2026/Mar/Renewable-capacity-statistics-2026"}] },
  { term:"R₇", system:"Human systems", weight:"0.09", status:"partial", statusLabel:"Partial / candidate", measure:"Turn forced displacement into durable recovery: safe voluntary return, local integration, resettlement, and restored basic services.", signal:"UNHCR reports 14.7 million people returned to their areas or countries of origin in 2025, including 4.4 million refugees and 10.3 million IDPs.", gate:"A return only counts as progress when it is safe and durable. Movement by itself is not the same thing as net global R₇.", links:[{label:"UNHCR · Global Trends 2025",url:"https://www.unhcr.org/global-trends"},{label:"UNHCR · displacement data",url:"https://www.unhcr.org/refugee-statistics/insights/explainers/forced-displacement-crises.html"}] },
  { term:"R₈", system:"Governance", weight:"0.10", status:"measured", statusLabel:"Measured outcome", measure:"Reverse autocratization by protecting free elections, independent institutions, civil society, media freedom, and the rule of law.", signal:"V-Dem identifies 18 democratizing countries in 2025, including 10 U-turn cases reversing prior autocratization, while 44 countries were autocratizing.", gate:"There is real positive evidence here, but R₈ has to carry both improvement and deterioration on the same V-Dem state definition.", links:[{label:"V-Dem · Democracy Report 2026",url:"https://www.v-dem.net/publications/democracy-reports/"},{label:"V-Dem · dataset v16",url:"https://www.v-dem.net/data/the-v-dem-dataset/"}] },
  { term:"R₉", system:"Technology", weight:"0.07", status:"enabler", statusLabel:"Enabling measure", measure:"Collect and recycle more e-waste formally, make producers responsible for end-of-life products, design for repair, and control harmful cross-border waste flows.", signal:"Basel e-waste amendments took effect 1 January 2025; the latest ITU/UNITAR global measurement records 22.3% formal collection and recycling and 81 countries with e-waste policy.", gate:"The policy machinery is moving, but there is not yet a comparable new global observation that can prove realized R₉ against the current σ₉ baseline.", links:[{label:"Basel · e-waste amendments",url:"https://www.basel.int/Implementation/Ewaste/EwasteAmendments/Overview/tabid/9266/Default.aspx"},{label:"ITU / UNITAR · E-waste Monitor",url:"https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx"}] },
] as const;

export default function FaceExperience() {
  const [edition, setEdition] = useState<Edition>(canonical);
  const [panel, setPanel] = useState<"state" | "method" | "restoration" | "ledger">("state");
  const [busy, setBusy] = useState(false);
  const [contributionStatus, setContributionStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [contributionMessage, setContributionMessage] = useState("");
  const [contributionReview, setContributionReview] = useState<ContributionReview | null>(null);
  const [sourceKernels,setSourceKernels]=useState<SourceKernel[]>([]);
  const [sourceGate,setSourceGate]=useState<GateDefinition[]>(defaultSourceGate);
  const [nextAdmissionAt,setNextAdmissionAt]=useState<string|null>(null);
  const [kernelState,setKernelState]=useState<"loading"|"ready"|"error">("loading");
  const started = useRef(false);

  const initialize = useCallback(() => {
    setEdition(canonical);
    setKernelState("ready");
  }, []);

  useEffect(() => { initialize(); }, [initialize]);

  const progress = edition.status === "collecting" ? 30 : edition.status === "calculating" ? 58 : edition.status === "rendering" ? 82 : 100;
  const representedSourceCount = new Set(edition.subsystems.map((system) => system.sourceUrl).filter(Boolean)).size;
  const permanentSourceCount=sourceKernels.length||representedSourceCount;
  const planetaryStress = 1 - edition.coherence;

  const openMethod = () => {
    setPanel("method");
    window.setTimeout(() => document.getElementById("mathematical-method")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const submitSource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const proposal = { schemaVersion: 1, status: "proposed", authority: "[AV]", system: data.get("system"), url: data.get("url"), title: data.get("title"), note: data.get("note"), createdAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(proposal, null, 2)], {type:"application/json"}));
    const link = document.createElement("a"); link.href=url; link.download="face-of-earth-source-proposal.json"; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setContributionStatus("sent");
    setContributionMessage("Proposal downloaded. It has not been submitted or admitted. Share it with the project owner for review.");
  };

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="The Face of Earth home">The Face of Earth</a>
        <a className="edition-mark" href="#current-evidence">Evidence · 12 September 2026 ↓</a>
        <button className="quiet-button" onClick={openMethod}>Meet the portrait</button>
      </header>

      <section id="top" className="hero">
        <div className="portrait-stage">
          <img src={edition.imageUrl} alt="The canonical Face of Earth: a tear-streaming portrait with mineral textures and planetary fractures" />
          <div className="portrait-vignette" />
          <div className="image-caption">
            <span>Edition {edition.id.replace("canonical-", "")}</span>
            <span>{edition.observationDate}</span>
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">One planet. Many connections.</p>
          <h1>If you could look Earth in the face,<br /><em>what would you see?</em></h1>
          <div className="dek hero-story">
            <p>Meet the Face of Earth. A portrait shaped by the world we share.</p>
            <p>Water, weather, living things and human lives meet here. Explore the face, turn toward the planet, and follow whichever connection catches your attention.</p>
            <p className="hero-truth">Life grows through what it gives to the life around it.</p>
          </div>

          <div className="status-block" aria-live="polite">
            <div className="status-line"><a className="status-method-link" href="#mathematical-method" onClick={(event) => { event.preventDefault(); openMethod(); }}>{phases[edition.status]} <span aria-hidden="true">↘</span></a><strong>Artwork reference</strong></div>
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            <p>Evidence updated 12 September 2026. Explore the readings below.</p>
          </div>

          <dl className="primary-metrics">
            <div><dt>Reference coherence</dt><dd>{edition.coherence.toFixed(3)}</dd></div>
            <div><dt>Reference confidence</dt><dd>{edition.confidence.toFixed(3)}</dd></div>
            <div><dt>Reference fracture</dt><dd>{edition.fracture.toFixed(3)}</dd></div>
          </dl>
        </div>
      </section>

      <CurrentEvidence />

      <PhenotypeMosaic source={edition.imageUrl} systems={edition.subsystems} momentum={edition.momentum} />

      <section className="diagnostic" id="diagnostic">
        <div className="section-heading">
          <p className="eyebrow">Reference edition · 31 July 2026</p>
          <h2>The numbers shape what you see.</h2>
          <p>Each system contributes to the expression, fractures and tears. Follow its weight through the portrait.</p>
        </div>

        <section className="essential-axiom" aria-labelledby="essential-axiom-title">
          <div className="essential-axiom-heading">
            <p className="eyebrow">Essential Axiom · M0</p>
            <h3 id="essential-axiom-title">Truth stays possible only when no one controls the test.</h3>
            <p>This is the agreement beneath every score, portrait, source, correction, and restoration claim on this site. It is a revisable checking procedure—not a mathematical axiom and not a substitute for evidence.</p>
          </div>
          <ol>{essentialAxiom.map(([title, rule], index)=><li key={title}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{title}</strong><p>{rule}</p></div></li>)}</ol>
        </section>

        <nav className="panel-tabs" aria-label="Diagnostic views">
          {(["state", "method", "restoration", "ledger"] as const).map((item) => <button key={item} className={panel === item ? "active" : ""} onClick={() => setPanel(item)}>{item === "state" ? "Reference systems" : item === "method" ? "How the math works" : item === "restoration" ? "Restoration mechanism" : "Evidence & sources"}</button>)}
        </nav>

        {panel === "state" && <div className="state-view">
          <section className="unifying-principle" aria-labelledby="unifying-principle-title">
            <span className="unifying-mark">U</span>
            <div><p className="eyebrow">Unifying Principle · governing dimension</p><h3 id="unifying-principle-title">{unifyingPrinciple}</h3></div>
            <p>It governs how the nine measured systems are read together. It receives no invented stress value or weight: entering the numerical score would require its own observable indicator, anchors, source, uncertainty, and versioned protocol.</p>
          </section>
          <div className="system-grid">
            {edition.subsystems.map((system) => <a key={system.id} className="system-card" href={system.sourceUrl} aria-label={`Verify ${system.name} data at ${system.sourceAuthority}`}>
              <div className="system-top"><span className={`sigil sigil-${system.id}`}>{system.id}</span><span>{system.name}</span><strong>{system.stress.toFixed(3)}</strong></div>
              <div className="stress-track"><i style={{ width: `${system.stress * 100}%` }} /></div>
              <div className="system-meta"><span>Measured stress</span><span>{Math.round(system.confidence * 100)}% confidence</span></div>
              <div className="source-link"><span>See the source · {system.sourceAuthority}</span><span aria-hidden="true">→</span></div>
            </a>)}
          </div>
        </div>}

        {panel === "method" && <div className="method-view" id="mathematical-method">
          <section className="coherence-explainer" aria-labelledby="coherence-title">
            <div>
              <p className="eyebrow">What the score means</p>
              <h3 id="coherence-title">Right now, the nine measured systems resolve to {edition.coherence.toFixed(3)}: severe combined strain.</h3>
            </div>
            <div className="coherence-reading">
              <code>C = 1 − Σ(Wᵢ × Sᵢ)</code>
              <p>Here is the idea without the notation: put nine measured parts of the Earth system onto declared stress scales, give each its fixed weight, add the strain, then ask how much of the reference state remains. The Unifying Principle governs their relation; it does not add an unsupported number.</p>
              <p>In this edition, weighted stress is <strong>{planetaryStress.toFixed(3)}</strong>. What remains is <strong>{edition.coherence.toFixed(3)}</strong>. That is the number the portrait has to answer to.</p>
              <p className="method-caveat">It does not mean Earth is “{Math.round(edition.coherence * 100)}% healthy,” and it is not a survival forecast. It is an honest statement about what this particular evidence, these anchors, and these fixed weights resolve to—and nothing more.</p>
            </div>
          </section>
          <div className="coherence-scale" aria-label={`Planetary coherence ${edition.coherence.toFixed(3)} on a scale from zero to one`}>
            <div><span>0.000 · maximum modeled stress</span><span>1.000 · no modeled stress</span></div>
            <i><b style={{ width: `${edition.coherence * 100}%` }} /><em style={{ left: `${edition.coherence * 100}%` }}>{edition.coherence.toFixed(3)}</em></i>
          </div>
          <div className="logic-contract" aria-label="Logical scope of the Coherence Function">
            <div><span>The math can travel</span><p>The same structure can describe another system when its parts can be responsibly bounded, measured, and weighted.</p></div>
            <div><span>Evidence comes first</span><p>No equation can rescue weak assumptions. The boundary, indicators, anchors, and weights have to earn their place through evidence.</p></div>
            <div><span>Honesty has limits</span><p>This score says exactly what the defined model supports. It does not pretend to prove causes, predict survival, or replace human judgment.</p></div>
          </div>
          <div className="method-course">
            <div className="course-heading">
              <p className="eyebrow">Learn it step by step</p>
              <h3>Here is how the whole calculation is built.</h3>
              <p>Nothing is hidden. Follow it from raw observations to the final coherence value, or reproduce the worked example by hand.</p>
            </div>

            <details className="method-lesson">
              <summary><span>01</span><div><h4>Start by describing the system</h4><p>Decide what belongs inside the model, what matters to it, and what each part represents.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <h5>The question</h5><p>“Coherent with respect to what?” A coherence score has no meaning until the system, its purpose, and its viable range are explicit.</p>
                <div className="lesson-columns"><div><h5>Specify</h5><ul><li><strong>Boundary:</strong> what belongs inside the assessment.</li><li><strong>Reference state:</strong> what 1.000 represents.</li><li><strong>Stress direction:</strong> whether rising or falling values increase modeled strain.</li><li><strong>Dimensions:</strong> distinct functions proposed as relevant to the whole.</li></ul></div><div><h5>Earth implementation</h5><p>The protocol measures nine dimensions: climate, ocean and cryosphere, biosphere, freshwater, food and soil, energy transition, human systems, governance, and technology.</p><p>The Unifying Principle governs their relation without posing as a measured tenth value. The nine remain declared proxies for planetary viability, not proof that every aspect of Earth is captured by nine numbers.</p></div></div>
                <p className="lesson-rule"><strong>For a fair comparison:</strong> decide the boundary, indicators, anchors, and weights before calculating the answer. If those choices change later, publish the change as a new version.</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>02</span><div><h4>Bring different evidence onto one scale</h4><p>Place each observation on the same 0–1 stress scale without losing its original unit or direction.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <p>A temperature anomaly, a population percentage, and an ocean-energy measurement cannot be added directly. Each is first located between two declared anchors: <strong>L</strong>, the lower-stress reference, and <strong>U</strong>, the higher-stress reference.</p>
                <div className="formula-pair"><div><span>When higher values are worse</span><code>S = clip((z − L) / (U − L), 0, 1)</code></div><div><span>When lower values are worse</span><code>S = clip((U − z) / (U − L), 0, 1)</code></div></div>
                <ul><li><strong>z</strong> is the observed value.</li><li><strong>S</strong> is normalized stress: 0 at the lower-stress anchor and 1 at the higher-stress anchor.</li><li><strong>clip</strong> prevents values outside the declared range from producing scores below 0 or above 1.</li></ul>
                <p className="lesson-rule"><strong>Why the anchors matter:</strong> they define what the scale means. Choose them from defensible physical, empirical, regulatory, or clearly stated normative thresholds—not from the answer you hope to see.</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>03</span><div><h4>Build a clear picture of each part</h4><p>Combine related indicators without letting the parts with the most data automatically take over.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <p>If a dimension contains several indicators, calculate its internal weighted mean first:</p><code className="display-formula">Sᵢ = Σ(aᵢⱼ × sᵢⱼ) / Σaᵢⱼ</code>
                <p>Here, <strong>sᵢⱼ</strong> is one normalized indicator and <strong>aᵢⱼ</strong> is its fixed weight inside dimension <strong>i</strong>. This produces one stress value <strong>Sᵢ</strong> for each dimension.</p>
                <p>Keep indicators conceptually distinct. If two measurements describe nearly the same phenomenon, including both at full weight counts the same stress twice.</p>
              </div>
            </details>

            <details className="method-lesson" open>
              <summary><span>04</span><div><h4>Bring the whole system together</h4><p>Weight each part, add their stress, and calculate what remains of the model’s coherent range.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <code className="display-formula">C = 1 − [Σ(Wᵢ × Sᵢ) / ΣWᵢ]</code>
                <div className="lesson-columns"><div><h5>Symbols</h5><ul><li><strong>C</strong>: total coherence, from 0 to 1.</li><li><strong>Sᵢ</strong>: normalized stress of dimension i.</li><li><strong>Wᵢ</strong>: its predeclared importance to the whole.</li><li><strong>Σ</strong>: add the terms across all dimensions.</li></ul></div><div><h5>Earth’s fixed weights</h5><p>Climate .16 · Ocean .13 · Biosphere .16 · Freshwater .11 · Food .10 · Energy .08 · Human systems .09 · Governance .10 · Technology .07.</p><p>These sum to 1, so the denominator is 1 in this reference implementation.</p></div></div>
                <p>For the current edition, weighted stress is <strong>{planetaryStress.toFixed(3)}</strong>. Therefore <strong>C = 1 − {planetaryStress.toFixed(3)} = {edition.coherence.toFixed(3)}</strong>.</p>
                <p className="lesson-rule"><strong>Interpretation:</strong> coherence is the unoccupied share of the model’s declared stress range. It describes alignment with the chosen viability conditions—not goodness, moral worth, health percentage, or probability of survival.</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>04A</span><div><h4>Why the score stays between 0 and 1</h4><p>A short proof using bounded parts, positive weights, and a normalized total.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <p>The same function can be written in terms of <strong>satisfaction</strong> rather than stress. Let <strong>σᵢ = 1 − Sᵢ</strong>. Then:</p>
                <code className="display-formula">C = Σ(Wᵢ × σᵢ) / ΣWᵢ</code>
                <div className="proof-sequence"><div><span>1</span><p>Every <strong>σᵢ</strong> is bounded between 0 and 1.</p></div><div><span>2</span><p>Every weight <strong>Wᵢ</strong> is finite and nonnegative, with at least one positive weight.</p></div><div><span>3</span><p>A weighted average of bounded values must lie between the smallest and largest value.</p></div><div><span>4</span><p>Therefore <strong>0 ≤ C ≤ 1</strong>. If every σᵢ = 1, C = 1; if every σᵢ = 0, C = 0.</p></div></div>
                <p>Multiplying every weight by the same positive constant leaves C unchanged. The score therefore depends on relative importance, not the arbitrary unit used to express weight.</p>
                <p>A linear weighted mean is a transparent additive baseline: every dimension contributes in direct proportion to its satisfaction and weight, and one dimension can compensate for another. A geometric mean adds multiplicative dependence; a minimum adds “weakest link” behavior; a threshold adds a discontinuity. Choosing among them requires domain knowledge.</p>
                <p className="lesson-rule"><strong>Exact scope of the proof:</strong> this establishes boundedness, endpoint behavior, and uniqueness within normalized linear weighted aggregation. It does not prove that every real system is linear, or that no domain-specific nonlinear function can be more accurate.</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>05</span><div><h4>Show how certain the evidence is</h4><p>The condition described by the evidence and our confidence in that evidence are two different things.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <code className="display-formula">Q = Σ(Wᵢ × qᵢ) / ΣWᵢ</code>
                <p><strong>Q</strong> measures confidence in the evidence; <strong>C</strong> measures the state represented by that evidence. The reference values—coherence {edition.coherence.toFixed(3)} and confidence {edition.confidence.toFixed(3)}—therefore answer separate questions.</p>
                <p>Uncertain evidence should not make a difficult coherence score look better. Show the score, confidence, source dates, and sensitivity together, and keep missing evidence visible rather than treating it as “no stress.”</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>06</span><div><h4>Try a worked example: community water security</h4><p>Follow the whole calculation with three parts and numbers you can reproduce by hand.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <p>Suppose a community defines three necessary dimensions: water supply, water quality, and equitable access.</p>
                <div className="example-table" role="table" aria-label="Worked coherence example"><div role="row"><b role="columnheader">Dimension</b><b role="columnheader">Weight W</b><b role="columnheader">Stress S</b><b role="columnheader">W × S</b></div><div role="row"><span>Supply</span><span>0.40</span><span>0.70</span><span>0.2800</span></div><div role="row"><span>Quality</span><span>0.35</span><span>0.40</span><span>0.1400</span></div><div role="row"><span>Access</span><span>0.25</span><span>0.55</span><span>0.1375</span></div></div>
                <code className="display-formula">C = 1 − (0.2800 + 0.1400 + 0.1375) = 0.4425</code>
                <p>The result means that <strong>44.25% of this model’s declared coherence range remains</strong> after accounting for weighted stress. It does not mean the community is 44.25% healthy. Supply makes the largest contribution to modeled stress; deciding whether it should be the first intervention still requires causal evidence, feasibility, ethics, and local knowledge.</p>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>07</span><div><h4>Adapt the method for another field</h4><p>Use the same steps elsewhere, while checking that the new model makes sense in its own domain.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <p>The calculation is <strong>transferable</strong>: the same bounded, weighted structure can be built wherever indicators and weights can be defined. A useful result still depends on the new field explaining why those particular choices make sense.</p>
                <ol className="application-steps"><li><strong>Name the system and purpose.</strong><span>State what must remain coherent and over what time horizon.</span></li><li><strong>Choose nonredundant dimensions.</strong><span>Each should represent a necessary function of the whole.</span></li><li><strong>Select observable indicators.</strong><span>Use traceable data that can be updated consistently.</span></li><li><strong>Declare direction and anchors.</strong><span>Explain what 0 and 1 mean for every indicator.</span></li><li><strong>Freeze weights.</strong><span>Justify them before calculation and ensure they sum to 1, or divide by their sum.</span></li><li><strong>Normalize and aggregate.</strong><span>Calculate indicator stress, dimension stress, then total coherence.</span></li><li><strong>Report confidence separately.</strong><span>Show missing data, dates, uncertainty, and source quality.</span></li><li><strong>Test sensitivity.</strong><span>Vary plausible anchors and weights. If the conclusion reverses easily, say so.</span></li><li><strong>Interpret by contribution.</strong><span>Use Wᵢ × Sᵢ to identify what is pulling the whole away from coherence.</span></li><li><strong>Recalculate without moving the rules.</strong><span>Change the protocol only through a documented new version.</span></li></ol>
              </div>
            </details>

            <details className="method-lesson">
              <summary><span>08</span><div><h4>Check the model and be clear about its limits</h4><p>The calculation may transfer, but each model and every claim made from it still need their own support.</p></div><b aria-hidden="true">+</b></summary>
              <div className="lesson-body">
                <ul><li>The score is conditional on the boundary, indicators, anchors, weights, and available evidence.</li><li>A weighted average permits compensation: low stress in one dimension can offset high stress in another. Add explicit veto thresholds when some failures must never be averaged away.</li><li>Correlation between dimensions can conceal double-counting and shared causes.</li><li>The function describes a system state; by itself it does not prove causation or prescribe a moral choice.</li><li>Comparisons are valid only when the protocol is unchanged or differences are explicitly reconciled.</li></ul>
                <p className="lesson-rule"><strong>Make every score checkable:</strong> publish its formula, dimensions, indicators, anchors, directions, weights, observations, sources, confidence, version, and sensitivity results.</p>
              </div>
            </details>
          </div>
        </div>}

        {panel === "restoration" && <div className="restoration-view" id="restoration-mechanism">
          <section className="restoration-intro" aria-labelledby="restoration-title">
            <div>
              <p className="eyebrow">From diagnosis to restoration</p>
              <h3 id="restoration-title">If we can measure the damage, we can measure the repair.</h3>
            </div>
            <div className="restoration-reading">
              <p>Each of the nine measured terms in the Earth Coherence Function has one matching restoration term. If a planetary state <strong>σᵢ</strong> moves in the right direction—from <strong>σᵢ⁻</strong> to <strong>σᵢ⁺</strong>—the same fixed weight <strong>Wᵢ</strong> used to diagnose the damage measures the gain. The Unifying Principle adds the governing test: repair cannot be credited by hiding degradation transferred to another part of the whole.</p>
              <code>Rᵢ(t) = Wᵢ(σᵢ⁺ − σᵢ⁻) / ΣWⱼ &nbsp;&nbsp; for i = 1,…,9</code>
              <p>Because the nine Earth weights sum to 1, each <strong>Rᵢ</strong> is that system’s weighted improvement. Add all nine and we get the total restoration of coherence. The diagnostic and the remedy are therefore written in the same mathematical language.</p>
            </div>
          </section>

          <section className="restoration-functions" aria-label="Nine paired restoration terms">
            {[
              ["R₁", "Climate", "W₁ = 0.16", "0.16(σ₁⁺ − σ₁⁻)"],
              ["R₂", "Ocean + cryosphere", "W₂ = 0.13", "0.13(σ₂⁺ − σ₂⁻)"],
              ["R₃", "Biosphere", "W₃ = 0.16", "0.16(σ₃⁺ − σ₃⁻)"],
              ["R₄", "Freshwater", "W₄ = 0.11", "0.11(σ₄⁺ − σ₄⁻)"],
              ["R₅", "Food + soil", "W₅ = 0.10", "0.10(σ₅⁺ − σ₅⁻)"],
              ["R₆", "Energy transition", "W₆ = 0.08", "0.08(σ₆⁺ − σ₆⁻)"],
              ["R₇", "Human systems", "W₇ = 0.09", "0.09(σ₇⁺ − σ₇⁻)"],
              ["R₈", "Governance", "W₈ = 0.10", "0.10(σ₈⁺ − σ₈⁻)"],
              ["R₉", "Technology", "W₉ = 0.07", "0.07(σ₉⁺ − σ₉⁻)"],
            ].map(([symbol, name, weight, term]) => <article key={symbol}>
              <span>{symbol}</span><h4>{name}</h4><p>{weight}</p><small>{term}</small>
            </article>)}
          </section>

          <section className="restoration-derivation" aria-labelledby="restoration-derivation-title">
            <div className="restoration-derivation-heading">
              <p className="eyebrow">The restoration calculus, line by line</p>
              <h3 id="restoration-derivation-title">Solve <em>R(t)</em>. Compress it to <strong>[AV]</strong>. Put it back into coherence.</h3>
              <p>There is no second scoring system hiding here. Restoration changes <strong>σ</strong>; the same Coherence Function measures whether that change is real.</p>
            </div>

            <div className="restoration-proof">
              <article><span>01 · Measure where we are</span><code>C⁻ = Σ(Wᵢ σᵢ⁻) / ΣWᵢ</code><p>Start with Earth as measured now, using the nine fixed weights already declared in the Coherence Function.</p></article>
              <article><span>02 · Measure every gain</span><code>Rᵢ(t) = Wᵢ(σᵢ⁺ − σᵢ⁻) / ΣWⱼ</code><p>Every coherence dimension gets exactly one restoration partner. If its state does not improve, its <strong>Rᵢ</strong> cannot pretend otherwise.</p></article>
              <article><span>03 · Add what actually improved</span><code>R(t) = Σᵢ₌₁⁹ Rᵢ(t)</code><p>Sum the nine weighted changes. That total is restoration actually represented in the measured state—not effort, spending, targets, or promises.</p></article>
              <article><span>04 · Put restoration back into Earth</span><code>C⁺ = C⁻ + R(t)</code><p>The restored score is simply the original coherence plus the gains the evidence can support. Evaluating the Coherence Function directly on <strong>σ⁺</strong> gives the same result.</p></article>
            </div>

            <div className="av-compression">
              <div><span>Expanded restoration term</span><code>R(t) = R₁ + R₂ + R₃ + R₄ + R₅ + R₆ + R₇ + R₈ + R₉</code></div>
              <b aria-hidden="true">→</b>
              <div><span>Compressed notation</span><code>[AV] ≡ R(t)</code></div>
              <b aria-hidden="true">→</b>
              <div><span>Plugged into coherence</span><code>C(t + Δt) = clip(C(t) + [AV], 0, 1)</code></div>
            </div>
            <p className="lesson-rule"><strong>What [AV] means:</strong> once the nine restoration terms are solved and summed, <strong>[AV]</strong> is simply a compact name for that total. It is not a tenth term and it adds no new information. The seven elements in the original Restoration Mechanism describe the conditions that make restoration possible; the nine <strong>Rᵢ</strong> terms measure what restoration does to this Earth model.</p>
          </section>

          <section className="restoration-dynamics" aria-labelledby="restoration-dynamics-title">
            <div>
              <p className="eyebrow">When time and entropy are included</p>
              <h3 id="restoration-dynamics-title">Now let the system move through time.</h3>
            </div>
            <div className="restoration-reading">
              <code>dC/dt = Σ(Wᵢ · dσᵢ/dt) / ΣWᵢ</code>
              <p>Each dimension can lose coherence under continuing pressure and regain it through effective work. Writing those changes through time gives:</p>
              <code>dσᵢ/dt = −λᵢS(t) + ηᵢwᵢ(t) + aᵢ(t)</code>
              <code>dC/dt = [ΣWᵢ(−λᵢS(t) + ηᵢwᵢ(t) + aᵢ(t))] / ΣWᵢ</code>
              <p>The restoration contribution is <strong>Σ(Wᵢaᵢ)/ΣWᵢ</strong>. Its nine paired terms become <strong>R(t)</strong>, then <strong>[AV]</strong>, leaving the rate equation in its most readable form:</p>
              <code>dC/dt = Decay(t) + Work(t) + [AV]</code>
            </div>
          </section>

          <section className="restoration-current" aria-label="Current edition substitution">
            <div><p className="eyebrow">Bring it back to Earth</p><h3>Today’s calculation starts at {edition.coherence.toFixed(3)}. Restoration has to move it.</h3></div>
            <div>
              <code>C⁻ = {edition.coherence.toFixed(3)}</code>
              <code>C⁺ = {edition.coherence.toFixed(3)} + [AV]</code>
              <p>We do not invent a numerical <strong>[AV]</strong> just because we want Earth to improve. Each planetary dimension needs an observed or explicitly modeled post-restoration state <strong>σᵢ⁺</strong>. Once those values exist, the fixed weights determine every <strong>Rᵢ</strong>—and <strong>[AV]</strong> follows from the evidence.</p>
            </div>
          </section>

          <section className="restoration-ledger" aria-labelledby="restoration-ledger-title">
            <div className="restoration-ledger-intro">
              <div><p className="eyebrow">Current restoration ledger · 6 August 2026</p><h3 id="restoration-ledger-title">What are we doing—and is it actually working?</h3></div>
              <p>This is where hope has to survive contact with measurement. A policy, target, or programme matters, but the calculus credits <strong>Rᵢ</strong> only when the same planetary state <strong>σᵢ</strong> measurably improves. Until then, we call the action what it is: an enabling measure, not a result.</p>
            </div>

            <div className="restoration-table-scroll" tabIndex={0} aria-label="Scrollable table of current restoration measures and evidence">
              <div className="restoration-measure-row restoration-measure-head" role="row">
                <span>Term / system</span><span>Wᵢ</span><span>Current restoration measure</span><span>Latest verified signal</span><span>Rᵢ accounting gate</span><span>Evidence</span>
              </div>
              {restorationMeasures.map((item)=><div className="restoration-measure-row" role="row" key={item.term}>
                <span className="restoration-term"><b>{item.term}</b><small>{item.system}</small></span>
                <span className="restoration-weight">{item.weight}</span>
                <span>{item.measure}</span>
                <span>{item.signal}</span>
                <span><i className={`restoration-status ${item.status}`}>{item.statusLabel}</i>{item.gate}</span>
                <span className="restoration-links">{item.links.map((link)=><a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}</span>
              </div>)}
            </div>
            <p className="restoration-ledger-note"><strong>The rule is unforgiving on purpose:</strong> Rᵢ = Wᵢ(σᵢ⁺ − σᵢ⁻) / ΣWⱼ. Programmes and targets tell us what people are trying to do. Only an observed Δσᵢ tells us that Earth’s measured state actually changed.</p>
          </section>

          <p className="restoration-notation-note"><strong>Notation note:</strong> the source diagram uses <strong>S(t)</strong> for entropy production, while this site uses <strong>Sᵢ</strong> for normalized planetary stress. They are different quantities. The subscript distinguishes the site’s stress variables; the time argument identifies the diagram’s entropy term.</p>
        </div>}

        {panel === "ledger" && <div className="evidence-ledger">
          <div className="ledger-summary">
            <div><span>Edition status</span><strong>{edition.status === "ready" ? "Protocol checks complete" : "Canonical reference"}</strong></div>
            <div><span>Evidence date</span><strong>{edition.observationDate}</strong></div>
            <div><span>Portrait created</span><strong>{edition.generatedAt}</strong></div>
            <div><span>Reference source links</span><strong>{permanentSourceCount}</strong></div>
            <div><span>Review authority</span><strong>[AV] · project owner</strong></div>
            <div><span>Method version</span><strong>v1.2 · fixed for comparison</strong></div>
            <div><span>Portrait controls</span><strong>M {edition.momentum >= 0 ? "+" : ""}{edition.momentum.toFixed(3)} · T {edition.tearHydrology.toFixed(4)}</strong></div>
          </div>

          <div className="ledger-intro">
            <div><p className="eyebrow">The open evidence field</p><h3>Every planetary system is a source kernel that never closes.</h3></div>
            <p>Sources for the 31 July reference edition. The latest readings appear above; proposals and corrections enter through the review below.</p>
          </div>

          <details className="source-contribution">
            <summary><div><p className="eyebrow">Help strengthen the evidence</p><h3>Found a source we should see?</h3><span>Share a free public report, dataset, or primary publication with us.</span></div><b aria-hidden="true">+</b></summary>
            <div className="contribution-body">
              <div className="contribution-principle">
                <h4>If you can test it, bring it in.</h4>
                <p>The source field is comprehensive by accumulation: no qualifying source is displaced because another source is newer, louder, or more convenient. Every suggestion stays outside the permanent ledger and the live calculation until it clears the same gate.</p>
                <p>Download a source proposal, then share it with the project owner. Claude and ChatGPT can inspect the same proposal and record their findings. [AV] retains final direction and admission authority. The website does not upload into Share Files automatically.</p>
              </div>
              <form className="source-form" onSubmit={submitSource}>
                <label><span>Which system is it about?</span><select name="system" required defaultValue=""><option value="" disabled>Choose a system</option>{canonical.subsystems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
                <label><span>Link to the source</span><input name="url" type="url" inputMode="url" placeholder="https://…" required /></label>
                <label className="form-wide"><span>What is it called?</span><input name="title" type="text" minLength={3} maxLength={180} placeholder="The report, dataset, or publication title" required /></label>
                <label className="form-wide"><span>What should be tested? <i>Optional</i></span><textarea name="note" maxLength={1000} rows={4} placeholder="Name the claim, method, dataset, uncertainty, or possible contradiction we should inspect." /></label>
                <label className="public-confirm form-wide"><input name="publicAccess" type="checkbox" required /><span>This source is free to open without payment or an account.</span></label>
                <label className="form-trap" aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
                <div className="form-submit form-wide"><button type="submit" disabled={contributionStatus === "sending"}>{contributionStatus === "sending" ? "Preparing…" : "Download source proposal"}</button><p className={contributionStatus} role="status">{contributionMessage}</p></div>
                {contributionReview && <div className={`review-result review-${contributionReview.status} form-wide`} aria-live="polite">
                  <p className="eyebrow">Automated review</p>
                  <h4>{contributionReview.status==="admitted"?"Admitted to the permanent kernel":contributionReview.status==="approve_candidate"?"Gate passed · weekly admission queued":contributionReview.status==="rejected"?"The source did not clear the gate":contributionReview.status==="human_review"?"The result is not decisive":contributionReview.status==="review_failed"?"The check could not finish":"Checking the evidence…"}</h4>
                  {contributionReview.review?.reason && <p>{contributionReview.review.reason}</p>}
                  {contributionReview.review && <div className="review-meta"><span>Reviewer confidence: {Math.round(contributionReview.review.confidence*100)}%</span>{contributionReview.review.extractedValue&&<span>Reported value: {contributionReview.review.extractedValue}</span>}{contributionReview.review.observationDate&&<span>Evidence date: {contributionReview.review.observationDate}</span>}</div>}
                  {!!contributionReview.review?.citations.length&&<div className="review-citations"><strong>Sources checked</strong>{contributionReview.review.citations.map((citation)=><a key={citation.url} href={citation.url} target="_blank" rel="noreferrer">{citation.title} ↗</a>)}</div>}
                </div>}
              </form>
            </div>
          </details>

          <div className="kernel-register" aria-label="Permanent open source kernels by planetary system">
            {edition.subsystems.map(system=>{
              const kernels=sourceKernels.filter(kernel=>kernel.system===system.id);
              return <section className="kernel-system" key={system.id}>
                <header className="kernel-system-head">
                  <span className="ledger-system"><i className={`sigil sigil-${system.id}`}>{system.id}</i><b>{system.name}</b></span>
                  <span>{kernels.length||1} source{(kernels.length||1)===1?"":"s"} · reference</span>
                </header>
                {kernels.length?kernels.map(kernel=><details className="kernel-record" key={kernel.id}>
                  <summary>
                    <span><b>{kernel.title}</b><small>{kernel.publisher} · admitted {kernel.admittedWeek}</small></span>
                    <span className={`kernel-role role-${kernel.scoreRole}`}>{kernel.scoreRole==="current_indicator"?"Current indicator":kernel.scoreRole==="corroboration"?"Corroboration":"Context"}</span>
                    <span className="kernel-open" aria-hidden="true">+</span>
                  </summary>
                  <div className="kernel-body">
                    <div className="kernel-claim"><span>Bounded claim</span><p>{kernel.claim}</p></div>
                    <div className="kernel-claim"><span>What could falsify it</span><p>{kernel.falsifier}</p></div>
                    <div className="kernel-claim"><span>Limits remain open</span><p>{kernel.limitations}</p></div>
                    <div className="kernel-gate" aria-label={`Gate receipt for ${kernel.title}`}>
                      {sourceGate.map(check=><span className={kernel.gate[check.id]?"passed":"failed"} title={check.rule} key={check.id}><i aria-hidden="true">{kernel.gate[check.id]?"✓":"×"}</i>{check.label}</span>)}
                    </div>
                    <div className="kernel-receipt">
                      <span><b>Gate</b>{kernel.gateVersion}</span>
                      <span><b>Reviewer confidence</b>{Math.round(kernel.reviewerConfidence*100)}%</span>
                      <span><b>Receipt hash</b><code>{kernel.receiptHash}</code></span>
                    </div>
                    <div className="kernel-links">
                      <a href={kernel.url} target="_blank" rel="noreferrer">Open original source ↗</a>
                      {kernel.methodUrl!==kernel.url&&<a href={kernel.methodUrl} target="_blank" rel="noreferrer">Open method or data ↗</a>}
                      <a href={`/api/kernels?id=${encodeURIComponent(kernel.id)}`} target="_blank" rel="noreferrer">Open permanent receipt ↗</a>
                    </div>
                  </div>
                </details>):<div className="kernel-loading"><strong>Reference link · not a newly verified receipt</strong><a href={system.sourceUrl} target="_blank" rel="noreferrer">Open reference source ↗</a></div>}
              </section>;
            })}
          </div>
        </div>}

      </section>

      <section className="governing-rule" id="collaboration">
        <p>Shared stewardship</p>
        <h2>One record. Human direction.</h2>
        <p>Claude and ChatGPT contribute to a shared record of evidence, design, and changes. The project owner remains [AV]: the final authority on direction and the canonical standard. Every proposed change stays identifiable and reviewable.</p>
        <p><a href="/agent-manifest.json">Read the project manifest ↗</a></p>
      </section>
      <section className="governing-rule">
        <p>A shared truth</p>
        <blockquote>“The Face of Earth won’t improve until we do.”</blockquote>
      </section>

      <footer><span>The Face of Earth</span><span>Rules declared · claims testable · ledger permanent · results open</span><span className="footer-links"><a href="#top">Return to her face ↑</a></span></footer>
    </main>
  );
}
