import {
  useNavigate,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import styles from '../dashboard.module.css';

const getActivePhaseLabel = (
  episode: MigraineEpisode,
): string => {
  const postdromeOpen =
    episode.postdrome.present &&
    episode.postdrome.status !==
      'ended' &&
    !episode.postdrome.endTime &&
    !episode.postdrome.time?.end
      ?.value;

  const auraOpen =
    episode.aura.present &&
    episode.aura.status !==
      'ended' &&
    episode.aura.status !==
      'uncertain';

  const premonitoryOpen =
    episode.premonitory.present &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain';

  if (episode.crisis.active) {
    return 'Crisis activa';
  }

  if (postdromeOpen) {
    return 'Recuperación en curso';
  }

  if (auraOpen) {
    return 'Aura activa';
  }

  if (premonitoryOpen) {
    return 'Señales premonitorias';
  }

  return 'Episodio en curso';
};

const formatLastUpdate = (
  episode: MigraineEpisode,
): string => {
  const value =
    episode.updatedAt ??
    episode.createdAt;

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Actualización no disponible';
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

export function HealthSummary() {
  const navigate =
    useNavigate();

  const activeEpisode =
    useMigraineStore(
      state =>
        state.activeEpisode,
    );

  if (!activeEpisode) {
    return null;
  }

  const phaseLabel =
    getActivePhaseLabel(
      activeEpisode,
    );

  const lastUpdate =
    formatLastUpdate(
      activeEpisode,
    );

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="active-episode-title"
    >
      <div
        className={
          styles.sectionHeader
        }
      >
        <div>
          <p
            className={
              styles.sectionEyebrow
            }
          >
            Ahora
          </p>

          <h2
            id="active-episode-title"
          >
            Tenés un registro en curso
          </h2>
        </div>

        <span
          className={
            styles.sectionHint
          }
        >
          Tus cambios se guardan
          automáticamente
        </span>
      </div>

      <article
        className={
          styles.episodeCard
        }
      >
        <div
          className={
            styles.episodeMain
          }
        >
          <span
            className={
              styles.episodeIcon
            }
            aria-hidden="true"
          >
            ◉
          </span>

          <div>
            <h3>
              {phaseLabel}
            </h3>

            <div
              className={
                styles.episodeDetails
              }
            >
              {activeEpisode
                .crisis.active && (
                <span>
                  Dolor actual:{' '}

                  <strong>
                    {
                      activeEpisode
                        .crisis
                        .intensity
                    }
                    /10
                  </strong>
                </span>
              )}

              <span>
                Última actualización:{' '}

                <strong>
                  {lastUpdate}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/migraine',
            )
          }
        >
          Continuar registro
        </button>
      </article>
    </section>
  );
}