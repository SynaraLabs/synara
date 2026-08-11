import {
  EpisodeList,
} from '../components/EpisodeList';

import styles from './HistoryPage.module.css';

export function HistoryPage() {
  return (
    <section
      className={styles.container}
    >
      <header
        className={styles.pageHeader}
      >
        <div
          className={styles.heading}
        >
          <p
            className={styles.eyebrow}
          >
            Seguimiento personal
          </p>

          <h1>
            Historial de migrañas
          </h1>

          <p
            className={
              styles.description
            }
          >
            Revisá tus episodios,
            compará cómo evolucionaron
            y reconocé patrones a lo
            largo del tiempo.
          </p>
        </div>

        <div
          className={styles.context}
          aria-label="Información sobre el historial"
        >
          <span
            className={
              styles.contextMarker
            }
            aria-hidden="true"
          />

          <p>
            Cada registro conserva el
            recorrido completo de sus
            fases y actualizaciones.
          </p>
        </div>
      </header>

      <EpisodeList />
    </section>
  );
}