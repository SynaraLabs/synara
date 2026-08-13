import {
  useNavigate,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import styles from './QuickActions.module.css';

export function QuickActions() {
  const navigate = useNavigate();

  const activeEpisode =
    useMigraineStore(
      state =>
        state.activeEpisode,
    );

  if (activeEpisode) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="quick-action-title"
    >
      <div className={styles.heading}>
        <p className={styles.eyebrow}>
          Registro guiado
        </p>

        <h2 id="quick-action-title">
          Empezá por lo que sentís
        </h2>
      </div>

      <button
        type="button"
        className={styles.action}
        onClick={() =>
          navigate('/migraine')
        }
      >
        <span className={styles.copy}>
          <strong>
            Registrar migraña
          </strong>

          <span>
            Señales, aura, dolor o
            recuperación
          </span>
        </span>

        <span
          className={styles.cta}
          aria-hidden="true"
        >
          Comenzar

          <span>→</span>
        </span>
      </button>

      <p className={styles.reassurance}>
        No necesitás saber cómo va a
        evolucionar ni completar todo de
        una vez.
      </p>
    </section>
  );
}