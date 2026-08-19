import {
  useMemo,
  useState,
} from 'react';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import {
  EpisodeCard,
} from './EpisodeCard';

import styles from '../history.module.css';

import listStyles from './EpisodeList.module.css';

type HistoryFilter =
  | 'all'
  | 'crisis'
  | 'withoutCrisis'
  | 'uncertain';

const getEpisodeTimestamp = (
  createdAt: string,
): number => {
  const timestamp =
    new Date(createdAt).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const hasCrisisData = (
  episode: MigraineEpisode,
): boolean => {
  const crisis =
    episode.crisis;

  const timeline =
    episode.timeline;

  return Boolean(
    crisis.active ||
      timeline?.crisisStart ||
      timeline?.crisisEnd ||
      crisis.startTime ||
      crisis.endTime ||
      crisis.time?.start?.value ||
      crisis.time?.end?.value ||
      crisis.intensityHistory
        ?.length ||
      crisis.events?.length,
  );
};

const isUncertainEpisode = (
  episode: MigraineEpisode,
): boolean => {
  return (
    episode.status ===
      'incomplete' ||
    episode.premonitory.status ===
      'uncertain'
  );
};

const getEpisodeKey = (
  episode: MigraineEpisode,
): string => {
  return (
    episode.id ??
    episode.createdAt
  );
};

const matchesSearch = (
  episode: MigraineEpisode,
  query: string,
): boolean => {
  if (!query) {
    return true;
  }

  const createdDate =
    new Date(
      episode.createdAt,
    );

  const formattedDate =
    Number.isNaN(
      createdDate.getTime(),
    )
      ? ''
      : createdDate.toLocaleDateString(
          'es-AR',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
        );

  const searchableText = [
    formattedDate,
    episode.createdAt,
    episode.notes ?? '',
    ...(episode.triggers ?? []),
    ...(
      episode.triggerRecords?.map(
        record =>
          record.notes ?? '',
      ) ?? []
    ),
    ...(
      episode.premonitory
        .symptoms ?? []
    ),
    ...(
      episode.crisis.symptoms ??
      []
    ),
    ...(
      episode.postdrome
        .symptoms ?? []
    ),
  ]
    .join(' ')
    .toLocaleLowerCase(
      'es-AR',
    );

  return searchableText.includes(
    query,
  );
};

export function EpisodeList() {
  const history =
    useMigraineStore(
      state => state.history,
    );

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<HistoryFilter>(
    'all',
  );

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    openEpisodeKey,
    setOpenEpisodeKey,
  ] = useState<
    string | null
  >(null);

  const sortedEpisodes =
    useMemo(() => {
      return [
        ...history,
      ].sort(
        (
          firstEpisode,
          secondEpisode,
        ) =>
          getEpisodeTimestamp(
            secondEpisode.createdAt,
          ) -
          getEpisodeTimestamp(
            firstEpisode.createdAt,
          ),
      );
    }, [history]);

  const crisisCount =
    useMemo(() => {
      return sortedEpisodes.filter(
        hasCrisisData,
      ).length;
    }, [sortedEpisodes]);

  const uncertainCount =
    useMemo(() => {
      return sortedEpisodes.filter(
        isUncertainEpisode,
      ).length;
    }, [sortedEpisodes]);

  const highestIntensity =
    useMemo(() => {
      return sortedEpisodes.reduce(
        (
          currentMaximum,
          episode,
        ) => {
          if (
            !hasCrisisData(
              episode,
            )
          ) {
            return currentMaximum;
          }

          return Math.max(
            currentMaximum,
            getMaxPainIntensity(
              episode,
            ),
          );
        },
        0,
      );
    }, [sortedEpisodes]);

  const normalizedSearch =
    searchTerm
      .trim()
      .toLocaleLowerCase(
        'es-AR',
      );

  const filteredEpisodes =
    useMemo(() => {
      return sortedEpisodes.filter(
        episode => {
          const hasCrisis =
            hasCrisisData(
              episode,
            );

          const isUncertain =
            isUncertainEpisode(
              episode,
            );

          const matchesFilter =
            activeFilter ===
              'all' ||
            (
              activeFilter ===
                'crisis' &&
              hasCrisis
            ) ||
            (
              activeFilter ===
                'withoutCrisis' &&
              !hasCrisis
            ) ||
            (
              activeFilter ===
                'uncertain' &&
              isUncertain
            );

          return (
            matchesFilter &&
            matchesSearch(
              episode,
              normalizedSearch,
            )
          );
        },
      );
    }, [
      activeFilter,
      normalizedSearch,
      sortedEpisodes,
    ]);

  const handleFilterChange = (
    filter: HistoryFilter,
  ) => {
    setActiveFilter(filter);
    setOpenEpisodeKey(null);
  };

  if (
    sortedEpisodes.length === 0
  ) {
    return (
      <section
        className={
          styles.emptyState
        }
        aria-labelledby="empty-history-title"
      >
        <h3 id="empty-history-title">
          Todavía no hay registros
        </h3>

        <p>
          Cuando completes un episodio
          de migraña, aparecerá acá para
          que puedas revisar su
          evolución.
        </p>
      </section>
    );
  }

  return (
    <section
        className={`${styles.historyExplorer} ${listStyles.explorer}`}
      aria-label="Episodios de migraña registrados"
    >
      <div
          className={`${styles.historyMetrics} ${listStyles.metrics}`}
        aria-label="Resumen de episodios"
      >
        <article>
          <small>
            Registros
          </small>

          <strong>
            {
              sortedEpisodes.length
            }
          </strong>

          <span>
            episodios guardados
          </span>
        </article>

        <article>
          <small>
            Con crisis
          </small>

          <strong>
            {crisisCount}
          </strong>

          <span>
            crisis registradas
          </span>
        </article>

        <article>
          <small>
            Intensidad máxima
          </small>

          <strong>
            {highestIntensity}/10
          </strong>

          <span>
            mayor dolor registrado
          </span>
        </article>
      </div>

      <div
          className={`${styles.historyControls} ${listStyles.controls}`}
      >
        <label
            className={`${styles.historySearch} ${listStyles.search}`}
        >
          <span>
            Buscar en el historial
          </span>

          <input
            type="search"
            value={searchTerm}
            placeholder="Fecha, síntoma o nota"
            autoComplete="off"
            onChange={event => {
              setSearchTerm(
                event.target.value,
              );

              setOpenEpisodeKey(
                null,
              );
            }}
          />
        </label>

        <div
            className={`${styles.historyFilters} ${listStyles.filters}`}
          role="group"
          aria-label="Filtrar episodios"
        >
          <button
            type="button"
            aria-pressed={
              activeFilter ===
              'all'
            }
            onClick={() =>
              handleFilterChange(
                'all',
              )
            }
          >
            Todos
            <span>
              {
                sortedEpisodes.length
              }
            </span>
          </button>

          <button
            type="button"
            aria-pressed={
              activeFilter ===
              'crisis'
            }
            onClick={() =>
              handleFilterChange(
                'crisis',
              )
            }
          >
            Con crisis
            <span>
              {crisisCount}
            </span>
          </button>

          <button
            type="button"
            aria-pressed={
              activeFilter ===
              'withoutCrisis'
            }
            onClick={() =>
              handleFilterChange(
                'withoutCrisis',
              )
            }
          >
            Sin crisis
            <span>
              {
                sortedEpisodes.length -
                crisisCount
              }
            </span>
          </button>

          {uncertainCount > 0 && (
            <button
              type="button"
              aria-pressed={
                activeFilter ===
                'uncertain'
              }
              onClick={() =>
                handleFilterChange(
                  'uncertain',
                )
              }
            >
              Inciertos
              <span>
                {uncertainCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <div
          className={`${styles.resultsHeader} ${listStyles.results}`}
        aria-live="polite"
      >
        <p>
          {filteredEpisodes.length ===
          1
            ? '1 episodio encontrado'
            : `${filteredEpisodes.length} episodios encontrados`}
        </p>

        {(
          activeFilter !==
            'all' ||
          normalizedSearch
        ) && (
          <button
            type="button"
            onClick={() => {
              setActiveFilter(
                'all',
              );

              setSearchTerm('');
              setOpenEpisodeKey(
                null,
              );
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredEpisodes.length >
      0 ? (
        <div
          className={
            styles.episodeList
          }
        >
          {filteredEpisodes.map(
            episode => {
              const episodeKey =
                getEpisodeKey(
                  episode,
                );

              return (
                <EpisodeCard
                  key={episodeKey}
                  episode={episode}
                  isOpen={
                    openEpisodeKey ===
                    episodeKey
                  }
                  onOpenChange={
                    isOpen =>
                      setOpenEpisodeKey(
                        isOpen
                          ? episodeKey
                          : null,
                      )
                  }
                />
              );
            },
          )}
        </div>
      ) : (
        <section
          className={
            styles.noResults
          }
        >
          <h3>
            No encontramos episodios
          </h3>

          <p>
            Probá otra búsqueda o
            quitá los filtros
            seleccionados.
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveFilter(
                'all',
              );

              setSearchTerm('');
            }}
          >
            Mostrar todo
          </button>
        </section>
      )}
    </section>
  );
}