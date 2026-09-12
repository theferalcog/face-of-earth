import evidence from "../../public/evidence-latest.json";

export default function CurrentEvidence() {
  return <section className="current-evidence" id="current-evidence" aria-labelledby="current-evidence-title">
    <div className="section-heading"><p className="eyebrow">Evidence checked · 12 September 2026</p>
      <h2 id="current-evidence-title">The latest readings we can verify.</h2>
      <p>Earth’s signals arrive at different speeds. These are the latest matching reports located in this review; each keeps its observation period, source and limits. They are not measurements taken today.</p>
    </div>
    <div className="evidence-grid">{evidence.indicators.map(item => <article className="evidence-card" key={item.id}>
      <p className="eyebrow">{item.name}</p><h3>{item.display}</h3><p>{item.metric}</p>
      <p className="evidence-date">Observed: {item.observationPeriod} · Published: {item.published}</p>
      <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.publisher} ↗</a>
      <p className="evidence-limit">{item.limitations}</p>
    </article>)}</div>
    <div className="evidence-note"><strong>A current combined score is not yet available.</strong><p>Ocean heat still needs a verified value on the agreed baseline, and energy needs an accounting-method reconciliation. We have not filled those gaps with old scores. The portrait, face-to-planet illustration and numerical model below remain the clearly labelled 31 July reference.</p>
      <a href="/evidence-latest.json">Open the shared evidence record ↗</a>
    </div>
  </section>;
}
