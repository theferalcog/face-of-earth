/**
 * FACE OF EARTH v0.1
 *
 * Main page: disillusionment -> shock (the data) -> visualization ->
 * explanation -> evidence. The raw scores and methodology stay behind
 * the practitioner info panel.
 */

import { useEffect, useState } from 'react';
import FaceRenderer from '../components/FaceRenderer';
import styles from '../styles/index.module.css';

const SYSTEMS = [
  { key: 'climate', label: 'Climate', blurb: "Temperature, CO2, and how often extreme weather is hitting." },
  { key: 'biodiversity', label: 'Biodiversity', blurb: 'How fast species and wild populations are disappearing.' },
  { key: 'soil', label: 'Soil', blurb: 'The ground that grows your food — degrading or holding.' },
  { key: 'water', label: 'Water', blurb: 'Aquifers, rivers, and groundwater you depend on.' },
  { key: 'energy', label: 'Energy', blurb: "What powers your life, and how stable that supply is." },
  { key: 'governance', label: 'Governance', blurb: 'Whether the institutions meant to respond actually can.' }
];

const SOURCES = [
  'NOAA — global temperature anomaly',
  'Mauna Loa Observatory — atmospheric CO2',
  'IUCN Red List — extinction rate',
  'Living Planet Index — wildlife population trends',
  'FAO — forest and arable land assessments',
  'UN Land Degradation Neutrality — soil degradation',
  'USDA — arable land loss',
  'IEA — global energy mix',
  'Edelman Trust Barometer — institutional trust',
  'RSF Press Freedom Index',
  'World Bank Governance Indicators'
];

export default function Home() {
  const [coherenceData, setCoherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Fetch coherence data on mount and periodically
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/coherence');
        if (!response.ok) throw new Error('Failed to fetch coherence data');
        const data = await response.json();
        setCoherenceData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching coherence:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every hour
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>The Face of Earth</h1>
        <p>Loading planetary coherence data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>The Face of Earth</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!coherenceData) {
    return (
      <div className={styles.errorContainer}>
        <h1>The Face of Earth</h1>
        <p>No data available</p>
      </div>
    );
  }

  const { scores, momentum } = coherenceData.current;
  const improving = momentum.overall > 0;

  return (
    <div className={styles.page}>
      <section className={`${styles.narrativeSection} ${styles.hero}`}>
        <div className={styles.sectionInner}>
          <p className={styles.eyebrow}>The Face of Earth</p>
          <h1>The planet has vital signs. Most of us never see them.</h1>
          <p className={styles.lede}>
            Not predictions. Not opinions. Six systems that keep this planet
            running, mapped straight from data you can check yourself.
          </p>
          <p className={styles.leadQuestion}>What if you could just look?</p>
          <div className={styles.scrollCue}>↓ keep looking</div>
        </div>
      </section>

      <section className={`${styles.narrativeSection} ${styles.shock}`}>
        <div className={styles.sectionInner}>
          <h2>This isn't an artwork. It's a graph.</h2>
          <p className={styles.lede}>
            Every angle. Every curve. Every gap between where a system sits and where
            it should be. Sourced data. Not interpretation — measurement.
          </p>
        </div>
      </section>

      <section className={`${styles.narrativeSection} ${styles.vizSection}`}>
        <FaceRenderer coherenceData={coherenceData} />
        <div className={styles.vizCaption}>
          <span>The Face of Earth — live</span>
          <span className={styles.scrollCueSmall}>↓ what am I looking at</span>
        </div>
      </section>

      <section className={`${styles.narrativeSection} ${styles.explain}`}>
        <div className={styles.sectionInner}>
          <h2>What you're looking at</h2>

          <div className={styles.systemGrid}>
            {SYSTEMS.map((sys) => (
              <div className={styles.systemCard} key={sys.key}>
                <span className={styles.systemLabel}>{sys.label}</span>
                <strong className={styles.systemScore}>
                  {(scores[sys.key] * 100).toFixed(0)}%
                </strong>
                <p>{sys.blurb}</p>
              </div>
            ))}
          </div>

          <ul className={styles.readingList}>
            <li><strong>Distance from center</strong> — how healthy that system is right now.</li>
            <li><strong>Gap between the hexagon and the outer circle</strong> — how badly it's breaking.</li>
            <li><strong>The eyes</strong> — where it's headed over the next 10 years. Trajectory, not hope.</li>
            <li>
              <strong>The mouth</strong> — how fast things are changing right now.{' '}
              {improving ? 'Climbing.' : 'Slipping.'}
            </li>
          </ul>

          <p className={styles.grounding}>This is your world, performing.</p>
        </div>
      </section>

      <section className={`${styles.narrativeSection} ${styles.evidence}`}>
        <div className={styles.sectionInner}>
          <h2>Where this comes from</h2>
          <p className={styles.lede}>Six systems, scored from sourced data, not opinion.</p>

          <ul className={styles.sourceList}>
            {SOURCES.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>

          <p className={styles.note}>
            Updated {new Date(coherenceData.timestamp).toLocaleDateString()}. This is
            Face of Earth v0.1 — incomplete by design. Open the ℹ️ for the full
            methodology, raw scores, and the Sigma Gamma Challenge.
          </p>
        </div>
      </section>

      <button
        className={styles.toggleButton}
        onClick={() => setShowInfo(!showInfo)}
        aria-label="Toggle methodology panel"
      >
        ℹ️
      </button>

      <div className={`${styles.infoPanel} ${showInfo ? styles.open : ''}`}>
        <div className={styles.infoPanelContent}>
          <h2>The Face of Earth v0.1</h2>

          <section>
            <h3>Current State</h3>
            <div className={styles.scoreGrid}>
              <div className={styles.scoreCard}>
                <span>Climate</span>
                <strong>{(scores.climate * 100).toFixed(1)}%</strong>
              </div>
              <div className={styles.scoreCard}>
                <span>Biodiversity</span>
                <strong>{(scores.biodiversity * 100).toFixed(1)}%</strong>
              </div>
              <div className={styles.scoreCard}>
                <span>Soil</span>
                <strong>{(scores.soil * 100).toFixed(1)}%</strong>
              </div>
              <div className={styles.scoreCard}>
                <span>Water</span>
                <strong>{(scores.water * 100).toFixed(1)}%</strong>
              </div>
              <div className={styles.scoreCard}>
                <span>Energy</span>
                <strong>{(scores.energy * 100).toFixed(1)}%</strong>
              </div>
              <div className={styles.scoreCard}>
                <span>Governance</span>
                <strong>{(scores.governance * 100).toFixed(1)}%</strong>
              </div>
            </div>
            <p><strong>Overall:</strong> {(scores.overall * 100).toFixed(1)}%</p>
          </section>

          <section>
            <h3>Reading the Face</h3>
            <ul>
              <li><strong>The Hexagon:</strong> Your planetary structure. Each vertex is a system.</li>
              <li><strong>The Eyes:</strong> Where Earth is headed (10-year trajectory).</li>
              <li><strong>The Mouth:</strong> How fast things are changing right now.</li>
            </ul>
          </section>

          <section>
            <h3>Current Momentum</h3>
            <p>{improving ? '📈 Improving' : '📉 Declining'}</p>
            <p>Rate: {momentum.overall.toFixed(4)} per year</p>
          </section>

          <section>
            <h3>10-Year Projection</h3>
            <p>Projected overall coherence: {(coherenceData.projected.scores.overall * 100).toFixed(1)}%</p>
          </section>

          <section>
            <h3>Data Quality</h3>
            <p>Updated: {new Date(coherenceData.timestamp).toLocaleString()}</p>
            <p className={styles.note}>
              This is Face of Earth v0.1. It shows real data rendered honestly.
              It's incomplete. We built it to be challenged.
            </p>
            <p className={styles.note}>
              <strong>Join the Sigma Gamma Challenge:</strong> If you can make this more accurate, we want your version running here.
            </p>
          </section>

          <section>
            <h3>Methodology</h3>
            <p>Each system is scored 0-1.0 based on constraint violations:</p>
            <ul>
              <li><strong>Climate:</strong> Temperature, CO2, extreme weather</li>
              <li><strong>Biodiversity:</strong> Extinction rate, habitat loss, population trends</li>
              <li><strong>Soil:</strong> Degradation rate, organic matter, arable loss</li>
              <li><strong>Water:</strong> Aquifer depletion, river flow, groundwater trends</li>
              <li><strong>Energy:</strong> Fossil dependency, renewable growth, grid stability</li>
              <li><strong>Governance:</strong> Institutional trust, coordination capacity, decision speed</li>
            </ul>
          </section>

          <section>
            <h3>The Eyes Never Lie</h3>
            <p>The mouth can show short-term gains. The eyes show where you're actually headed.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
