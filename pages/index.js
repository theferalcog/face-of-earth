/**
 * FACE OF EARTH v0.1
 * 
 * Main page: Displays the planetary coherence diagnostic
 * Real-time rendering of Earth's geometric face
 */

import { useEffect, useState } from 'react';
import FaceRenderer from '../components/FaceRenderer';
import styles from '../styles/index.module.css';

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

  return (
    <div className={styles.container}>
      <FaceRenderer coherenceData={coherenceData} />
      
      <div className={styles.infoPanel}>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowInfo(!showInfo)}
        >
          ℹ️
        </button>

        {showInfo && (
          <div className={styles.infoPanelContent}>
            <h2>The Face of Earth v0.1</h2>
            
            <section>
              <h3>Current State</h3>
              <div className={styles.scoreGrid}>
                <div className={styles.scoreCard}>
                  <span>Climate</span>
                  <strong>{(coherenceData.current.scores.climate * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.scoreCard}>
                  <span>Biodiversity</span>
                  <strong>{(coherenceData.current.scores.biodiversity * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.scoreCard}>
                  <span>Soil</span>
                  <strong>{(coherenceData.current.scores.soil * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.scoreCard}>
                  <span>Water</span>
                  <strong>{(coherenceData.current.scores.water * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.scoreCard}>
                  <span>Energy</span>
                  <strong>{(coherenceData.current.scores.energy * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.scoreCard}>
                  <span>Governance</span>
                  <strong>{(coherenceData.current.scores.governance * 100).toFixed(1)}%</strong>
                </div>
              </div>
              <p><strong>Overall:</strong> {(coherenceData.current.scores.overall * 100).toFixed(1)}%</p>
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
              <p>{coherenceData.current.momentum.overall > 0 ? '📈 Improving' : '📉 Declining'}</p>
              <p>Rate: {coherenceData.current.momentum.overall.toFixed(4)} per year</p>
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
              <p>
                Each system is scored 0-1.0 based on constraint violations:
              </p>
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
              <p>
                The mouth can show short-term gains. The eyes show where you're actually headed.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
