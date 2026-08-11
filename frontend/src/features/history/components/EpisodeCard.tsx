import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import type {
  ClinicalPhase,
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getEpisodeDuration,
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import {
  deleteHistoryEpisode,
} from '../utils/deleteHistoryEpisode';

import {
  formatCreatedDate,
  formatDateTime,
  isValidDate,
} from '../utils/historyFormatters';

import {
  AuraHistorySection,
} from './AuraHistorySection';

import {
  CrisisHistorySection,
} from './CrisisHistorySection';

import {
  EpisodeGeneralSummary,
} from './EpisodeGeneralSummary';

import {
  PostdromeHistorySection,
} from './PostdromeHistorySection';

import {
  PremonitoryHistorySection,
} from './PremonitoryHistorySection';

import styles from '../history.module.css';

import timelineStyles from './EpisodeTimeline.module.css';

import navigationStyles from './EpisodeDetailNavigation.module.css';

interface Props {
  episode: MigraineEpisode;

  isOpen: boolean;

  onOpenChange: (
    isOpen: boolean,
  ) => void;
}

type DetailView =
  | 'summary'
  | ClinicalPhase;

interface DetailNavigationItem {
  id: DetailView;
  label: string;
  available: boolean;
}

const hasPremonitoryData = (
  episode: MigraineEpisode,
): boolean => {
  const premonitory =
    episode.premonitory;

  const timeline =
    episode.timeline;

  const start =
    timeline?.premonitoryStart ??
    premonitory.time?.start?.value;

  const end =
    timeline?.premonitoryEnd ??
    premonitory.time?.end?.value;

  return Boolean(
    premonitory.present === true ||
      premonitory.symptoms.length > 0 ||
      premonitory
        .clinicalSymptoms?.length ||
      premonitory.updates?.length ||
      isValidDate(start) ||
      isValidDate(end),
  );
};

const hasAuraData = (
  episode: MigraineEpisode,
): boolean => {
  const aura =
    episode.aura;

  const timeline =
    episode.timeline;

  const start =
    timeline?.auraStart ??
    aura.time?.start?.value;

  const end =
    timeline?.auraEnd ??
    aura.time?.end?.value;

  return Boolean(
    aura.present === true ||
      aura.types.length > 0 ||
      aura.visualSymptoms.length > 0 ||
      aura.sensorySymptoms.length > 0 ||
      aura.languageSymptoms.length > 0 ||
      aura.motorSymptoms?.length ||
      aura.vestibularSymptoms?.length ||
      aura.clinicalSymptoms?.length ||
      aura.updates?.length ||
      isValidDate(start) ||
      isValidDate(end),
  );
};

const hasCrisisData = (
  episode: MigraineEpisode,
): boolean => {
  const crisis =
    episode.crisis;

  const timeline =
    episode.timeline;

  const start =
    timeline?.crisisStart ??
    crisis.startTime ??
    crisis.time?.start?.value;

  const end =
    timeline?.crisisEnd ??
    crisis.endTime ??
    crisis.time?.end?.value;

  return Boolean(
    crisis.active === true ||
      isValidDate(start) ||
      isValidDate(end) ||
      crisis.intensityHistory?.length ||
      crisis.events?.length ||
      crisis.locationHistory?.length,
  );
};

const hasPostdromeData = (
  episode: MigraineEpisode,
): boolean => {
  const postdrome =
    episode.postdrome;

  const timeline =
    episode.timeline;

  const start =
    timeline?.postdromeStart ??
    postdrome.startTime ??
    postdrome.time?.start?.value;

  const end =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end?.value;

  return Boolean(
    postdrome.present === true ||
      postdrome.symptoms.length > 0 ||
      postdrome
        .clinicalSymptoms?.length ||
      postdrome.updates?.length ||
      isValidDate(start) ||
      isValidDate(end),
  );
};

const getRecordTitle = (
  episode: MigraineEpisode,
  hasCrisis: boolean,
  hasAura: boolean,
): string => {
  const premonitory =
    episode.premonitory;

  if (hasCrisis) {
    return 'Migraña';
  }

  if (
    premonitory.endedWithoutCrisis ===
      true ||
    episode.completionReason ===
      'phaseEndedWithoutCrisis'
  ) {
    return 'Señales sin crisis';
  }

  if (
    episode.status ===
      'incomplete' ||
    premonitory.status ===
      'uncertain'
  ) {
    return 'Desenlace incierto';
  }

  if (hasAura) {
    return 'Aura sin crisis';
  }

  return 'Señales premonitorias';
};

const getPhaseSummary = (
  hasPremonitory: boolean,
  hasAura: boolean,
  hasCrisis: boolean,
  hasPostdrome: boolean,
): string[] => {
  const phases: string[] = [];

  if (hasPremonitory) {
    phases.push(
      'Premonitorio',
    );
  }

  if (hasAura) {
    phases.push('Aura');
  }

  if (hasCrisis) {
    phases.push('Crisis');
  }

  if (hasPostdrome) {
    phases.push(
      'Postdromo',
    );
  }

  return phases;
};

const createDetailId = (
  episode: MigraineEpisode,
): string => {
  const source =
    episode.id ??
    episode.createdAt;

  const safeId =
    source.replace(
      /[^a-zA-Z0-9_-]/g,
      '-',
    );

  return `episode-detail-${safeId}`;
};

export function EpisodeCard({
  episode,
  isOpen,
  onOpenChange,
}: Props) {
  const navigate =
    useNavigate();

  const [
    activeView,
    setActiveView,
  ] = useState<DetailView>(
    'summary',
  );

  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  const timeline =
    episode.timeline;

  const premonitory =
    episode.premonitory;

  const hasPremonitory =
    hasPremonitoryData(
      episode,
    );

  const hasAura =
    hasAuraData(
      episode,
    );

  const hasCrisis =
    hasCrisisData(
      episode,
    );

  const hasPostdrome =
    hasPostdromeData(
      episode,
    );

  const isUncertain =
    episode.status ===
      'incomplete' ||
    premonitory.status ===
      'uncertain';

  const title =
    getRecordTitle(
      episode,
      hasCrisis,
      hasAura,
    );

  const headerStatus =
    hasCrisis
      ? `${getMaxPainIntensity(
          episode,
        )}/10`
      : isUncertain
        ? 'Incierto'
        : 'Sin crisis';

  const episodeStart =
    timeline?.episodeStart ??
    timeline?.premonitoryStart ??
    premonitory.time?.start?.value ??
    timeline?.auraStart ??
    episode.aura.time?.start?.value ??
    timeline?.crisisStart ??
    episode.crisis.startTime ??
    episode.crisis.time?.start?.value ??
    episode.createdAt;

  const episodeDuration =
    getEpisodeDuration(
      episode,
    );

  const phases =
    getPhaseSummary(
      hasPremonitory,
      hasAura,
      hasCrisis,
      hasPostdrome,
    );

  const detailId =
    createDetailId(
      episode,
    );

  const navigationItems:
    DetailNavigationItem[] = [
    {
      id: 'summary',
      label: 'Resumen',
      available: true,
    },
    {
      id: 'premonitory',
      label: 'Señales',
      available:
        hasPremonitory,
    },
    {
      id: 'aura',
      label: 'Aura',
      available: hasAura,
    },
    {
      id: 'crisis',
      label: 'Crisis',
      available: hasCrisis,
    },
    {
      id: 'postdrome',
      label: 'Post',
      available:
        hasPostdrome,
    },
  ];

  const handleDelete = () => {
    const episodeId =
      episode.id?.trim();

    if (!episodeId) {
      setDeleteError(
        'Este episodio no tiene un identificador válido y no se puede eliminar.',
      );

      return;
    }

    const wasDeleted =
      deleteHistoryEpisode(
        episodeId,
      );

    if (!wasDeleted) {
      setDeleteError(
        'No se pudo eliminar el episodio.',
      );
    }
  };

  const handleEdit = () => {
    const episodeId =
      episode.id?.trim();

    if (!episodeId) {
      return;
    }

    navigate(
      `/history/${encodeURIComponent(
        episodeId,
      )}/edit`,
    );
  };

  const handleToggle = () => {
    const nextIsOpen =
      !isOpen;

    onOpenChange(
      nextIsOpen,
    );

    if (!nextIsOpen) {
      setActiveView(
        'summary',
      );

      setShowDeleteConfirmation(
        false,
      );

      setDeleteError('');
    }
  };

  return (
    <article
      className={
        styles.episodeCard
      }
    >
      <div
        className={
          styles.episodeCompact
        }
      >
        <div
          className={
            styles.episodeCompactMain
          }
        >
          <div
            className={
              styles.episodeHeading
            }
          >
            <div>
              <p
                className={
                  styles.episodeDate
                }
              >
                {formatCreatedDate(
                  episode.createdAt,
                )}
              </p>

              <h3>
                {title}
              </h3>
            </div>

            <strong
              className={
                styles.episodeIntensity
              }
            >
              {headerStatus}
            </strong>
          </div>

          <div
            className={
              styles.episodeQuickInfo
            }
          >
            <span>
              <small>
                Inicio
              </small>

              <b>
                {formatDateTime(
                  episodeStart,
                )}
              </b>
            </span>

            <span>
              <small>
                Duración
              </small>

              <b>
                {episodeDuration !==
                undefined
                  ? formatDuration(
                      episodeDuration,
                    )
                  : 'No determinada'}
              </b>
            </span>
          </div>

          {phases.length > 0 && (
            <div
              className={
                styles.phaseChips
              }
              aria-label="Fases registradas"
            >
              {phases.map(
                phase => (
                  <span key={phase}>
                    {phase}
                  </span>
                ),
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className={
            styles.episodeToggle
          }
          aria-expanded={isOpen}
          aria-controls={detailId}
          onClick={handleToggle}
        >
          {isOpen
            ? 'Cerrar'
            : 'Ver episodio'}

          <span
            aria-hidden="true"
          >
            {isOpen
              ? '⌃'
              : '⌄'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          id={detailId}
          className={
            styles.episodeDetail
          }
        >
          <nav
            className={
              navigationStyles.navigation
            }
            aria-label="Información del episodio"
          >
            {navigationItems.map(
              item => (
                <button
                  key={item.id}
                  type="button"
                  data-tone={item.id}
                  disabled={
                    !item.available
                  }
                  aria-current={
                    activeView ===
                    item.id
                      ? 'page'
                      : undefined
                  }
                  onClick={() =>
                    setActiveView(
                      item.id,
                    )
                  }
                >
                  <b>
                    {item.label}
                  </b>
                </button>
              ),
            )}
          </nav>

          <div
            className={
              navigationStyles.content
            }
          >
            {activeView ===
              'summary' && (
              <EpisodeGeneralSummary
                episode={episode}
                episodeStart={
                  episodeStart
                }
                phases={phases}
                hasCrisis={
                  hasCrisis
                }
              />
            )}

            {activeView ===
              'premonitory' &&
              hasPremonitory && (
                <div
                  className={
                    timelineStyles.timeline
                  }
                  data-tone="premonitory"
                >
                  <PremonitoryHistorySection
                    episode={episode}
                    hasCrisis={
                      hasCrisis
                    }
                    hasAura={
                      hasAura
                    }
                  />
                </div>
              )}

            {activeView ===
              'aura' &&
              hasAura && (
                <div
                  className={
                    timelineStyles.timeline
                  }
                  data-tone="aura"
                >
                  <AuraHistorySection
                    episode={episode}
                  />
                </div>
              )}

            {activeView ===
              'crisis' &&
              hasCrisis && (
                <div
                  className={
                    timelineStyles.timeline
                  }
                  data-tone="crisis"
                >
                  <CrisisHistorySection
                    episode={episode}
                  />
                </div>
              )}

            {activeView ===
              'postdrome' &&
              hasPostdrome && (
                <div
                  className={
                    timelineStyles.timeline
                  }
                  data-tone="postdrome"
                >
                  <PostdromeHistorySection
                    episode={episode}
                  />
                </div>
              )}
          </div>

          <div
            className={
              styles.episodeActions
            }
          >
            <button
              type="button"
              className={
                styles.episodeToggle
              }
              disabled={!episode.id}
              onClick={handleEdit}
            >
              Editar o completar
              episodio
            </button>

            {!showDeleteConfirmation ? (
              <button
                type="button"
                className={
                  styles.deleteButton
                }
                onClick={() => {
                  setShowDeleteConfirmation(
                    true,
                  );

                  setDeleteError('');
                }}
              >
                Eliminar registro
              </button>
            ) : (
              <section
                className={
                  styles.deleteConfirmation
                }
              >
                <div>
                  <h4>
                    ¿Eliminar este
                    registro?
                  </h4>

                  <p>
                    Se eliminará
                    únicamente este
                    episodio. Esta
                    acción no se puede
                    deshacer.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className={
                      styles.deleteConfirmButton
                    }
                    onClick={
                      handleDelete
                    }
                  >
                    Sí, eliminar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirmation(
                        false,
                      );

                      setDeleteError(
                        '',
                      );
                    }}
                  >
                    Cancelar
                  </button>
                </div>

                {deleteError && (
                  <p role="alert">
                    {deleteError}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </article>
  );
}