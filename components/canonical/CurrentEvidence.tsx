import evidence from "../../public/evidence-latest.json";

export default function CurrentEvidence() {
  return <section className="current-evidence" id="current-evidence" aria-labelledby="current-evidence-title">
    <div className="section-heading"><p className="eyebrow">Evidence checked · 12 September 2026</p>
      <h2 id="current-evidence-title">A closer look at our world.</h2>
      <p>Start anywhere. Water leads to food, habitats to livelihoods, and one reading opens onto another.</p>
    </div>
    <div className="evidence-grid">{evidence.indicators.map(item => <article className="evidence-card" key={item.id}>
      <p className="eyebrow">{item.name}</p><h3>{item.display}</h3><p>{item.metric}</p>
      <p className="evidence-date">Observed: {item.observationPeriod} · Published: {item.published}</p>
      <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.publisher} ↗</a>
      <p className="evidence-limit">{item.limitations}</p>
    </article>)}</div>
    <div className="evidence-note"><strong>A current combined score is not yet available.</strong><p>Two inputs remain unresolved: ocean heat on the agreed baseline, and energy on a comparable accounting method.</p>
      <a href="/evidence-latest.json">View sources and data ↗</a>
    </div>
  </section>;
}
