import {
  useState,
} from 'react';

import {
  useLocation,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../store/migraine.store';

import styles from '../../migraine.module.css';

export function MigraineDevTools() {
  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const location =
    useLocation();

  const clearHistory =
    useMigraineStore(
      state =>
        state.clearHistory,
    );

  const historyCount =
    useMigraineStore(
      state =>
        state.history.length,
    );

  const normalizedPath =
    location.pathname
      .toLocaleLowerCase(
        'es-AR',
      );

  const isHistoryPage =
    normalizedPath.endsWith(
      '/history',
    ) ||
    normalizedPath.endsWith(
      '/historial',
    );

  const handleClearHistory =
    () => {
      clearHistory();

      setShowConfirmation(
        false,
      );
    };

  if (
    !import.meta.env.DEV ||
    !isHistoryPage ||
    historyCount === 0
  ) {
    return null;
  }

  if (!showConfirmation) {
    return (
      <section
        className={
          styles.devTools
        }
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
            Herramientas del historial
          </h3>

          <p>
            Elimina todos los episodios
            guardados. El episodio
            activo no se modificará.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.devToolsButton
          }
          onClick={() =>
            setShowConfirmation(
              true,
            )
          }
        >
          Borrar historial de prueba
        </button>
      </section>
    );
  }

  return (
    <section
      className={
        styles.devTools
      }
      aria-labelledby="clear-history-confirmation-title"
    >
      <h3
        id="clear-history-confirmation-title"
      >
        ¿Borrar todo el historial?
      </h3>

      <p>
        Se eliminarán{' '}
        {historyCount}{' '}
        {historyCount === 1
          ? 'episodio guardado'
          : 'episodios guardados'}.

        Esta acción no se puede
        deshacer.
      </p>

      <button
        type="button"
        className={
          styles.devToolsButton
        }
        onClick={
          handleClearHistory
        }
      >
        Confirmar borrado
      </button>

      <button
        type="button"
        onClick={() =>
          setShowConfirmation(
            false,
          )
        }
      >
        Cancelar
      </button>
    </section>
  );
}