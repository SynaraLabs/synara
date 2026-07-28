import {
  EpisodeList,
} from '../components/EpisodeList';

import styles from '../history.module.css';

export function HistoryPage() {
  return (
    <section className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>
            Seguimiento personal
          </p>

          <h1>
            Historial de migrañas
          </h1>

          <p className={styles.pageDescription}>
            Revisá tus episodios registrados,
            compará su evolución y detectá
            posibles patrones a lo largo del
            tiempo.
          </p>
        </div>

        <div
          className={styles.historySummary}
          aria-label="Resumen del historial"
        >
          <span
            className={styles.historySummaryIcon}
            aria-hidden="true"
          >
            ◷
          </span>

          <div>
            <small>
              Registro clínico personal
            </small>

            <strong>
              Tus episodios en un solo lugar
            </strong>
          </div>
        </div>
      </header>

      <EpisodeList />
    </section>
  );
}