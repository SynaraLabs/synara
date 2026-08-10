import {
  useNavigate,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import styles from './RealRecentEpisodes.module.css';

function formatDuration(
  totalMinutes: number,
) {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours =
    Math.floor(
      totalMinutes / 60,
    );

  const minutes =
    totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

function formatEpisodeDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Fecha no disponible';
  }

  return date.toLocaleDateString(
    'es-AR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

export function RealRecentEpisodes() {
  const navigate =
    useNavigate();

  const history =
    useMigraineStore(
      state => state.history,
    );

  const episodes =
    history
      .slice()
      .reverse()
      .slice(0, 5);

  return (
    <section
      className={
        styles.recentSection
      }
      aria-labelledby="recent-episodes-title"
    >
      <div
        className={
          styles.recentHeader
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Actividad reciente
          </p>

          <h2 id="recent-episodes-title">
            Últimos registros
          </h2>
        </div>

        {episodes.length > 0 && (
          <button
            className={
              styles.historyLink
            }
            type="button"
            onClick={() =>
              navigate('/history')
            }
          >
            Ver historial

            <span aria-hidden="true">
              →
            </span>
          </button>
        )}
      </div>

      {episodes.length === 0 ? (
        <div
          className={
            styles.emptyState
          }
        >
          <span
            className={
              styles.emptyStateIcon
            }
            aria-hidden="true"
          >
            ◷
          </span>

          <div>
            <h3>
              Todavía no hay episodios
            </h3>

            <p>
              Cuando completes un
              registro de migraña,
              aparecerá en esta sección.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/migraine')
            }
          >
            Registrar migraña
          </button>
        </div>
      ) : (
        <div
          className={
            styles.episodesList
          }
        >
          {episodes.map(
            episode => {
              const intensity =
                episode.crisis
                  ?.intensity ?? 0;

              const duration =
                episode.crisis
                  ?.durationMinutes ?? 0;

              return (
                <article
                  key={episode.id}
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
                        Episodio de migraña
                      </h3>

                      <div
                        className={
                          styles.episodeDetails
                        }
                      >
                        <span>
                          Intensidad{' '}

                          <strong>
                            {intensity}/10
                          </strong>
                        </span>

                        <span>
                          Duración{' '}

                          <strong>
                            {
                              formatDuration(
                                duration,
                              )
                            }
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <time
                    className={
                      styles.episodeDate
                    }
                    dateTime={
                      episode.createdAt
                    }
                  >
                    {
                      formatEpisodeDate(
                        episode.createdAt,
                      )
                    }
                  </time>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}