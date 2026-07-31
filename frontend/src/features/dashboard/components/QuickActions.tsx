import {
  useNavigate,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import styles from './QuickActions.module.css';

export function QuickActions() {
  const navigate =
    useNavigate();

  const activeEpisode =
    useMigraineStore(
      state =>
        state.activeEpisode,
    );

  if (activeEpisode) {
    return null;
  }

  const handleStart =
    () => {
      navigate('/migraine');
    };

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="quick-action-title"
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Registro guiado
          </p>

          <h2
            id="quick-action-title"
          >
            ¿Qué estás sintiendo ahora?
          </h2>
        </div>

        <p
          className={
            styles.hint
          }
        >
          Empezá por la señal o fase que
          puedas reconocer. Podés
          completar el resto después.
        </p>
      </div>

      <button
        type="button"
        className={
          styles.action
        }
        onClick={
          handleStart
        }
        aria-label="Comenzar un registro de migraña"
      >
        <span
          className={
            styles.icon
          }
          aria-hidden="true"
        >
          ◉
        </span>

        <span
          className={
            styles.content
          }
        >
          <span
            className={
              styles.titleRow
            }
          >
            <h3>
              Registrar migraña
            </h3>

            <span
              className={
                styles.badge
              }
            >
              Principal
            </span>
          </span>

          <span
            className={
              styles.description
            }
          >
            Registrá señales
            premonitorias, aura, dolor,
            síntomas, tratamiento o
            recuperación. No hace falta
            completar todo de una vez.
          </span>
        </span>

        <span
          className={
            styles.cta
          }
        >
          Comenzar registro

          <span
            className={
              styles.arrow
            }
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </button>
    </section>
  );
}