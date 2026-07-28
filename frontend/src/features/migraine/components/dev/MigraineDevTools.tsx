import {
  useMigraineStore,
} from '../../store/migraine.store';

import styles from '../../migraine.module.css';

export function MigraineDevTools() {
  const clearHistory =
    useMigraineStore(
      state => state.clearHistory,
    );

  const resetEpisode =
    useMigraineStore(
      state => state.resetEpisode,
    );

  const clearAll = () => {
    clearHistory();
    resetEpisode();

    localStorage.removeItem(
      'synara-migraine-storage',
    );

    window.location.reload();
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <section
      className={styles.devTools}
      aria-labelledby="migraine-dev-tools-title"
    >
      <div>
        <p
          className={
            styles.cardEyebrow
          }
        >
          Solo desarrollo
        </p>

        <h3
          id="migraine-dev-tools-title"
        >
          Herramientas de prueba
        </h3>

        <p>
          Borra el episodio activo y
          todo el historial local de
          migrañas.
        </p>
      </div>

      <button
        type="button"
        className={
          styles.devToolsButton
        }
        onClick={clearAll}
      >
        Borrar registros de prueba
      </button>
    </section>
  );
}