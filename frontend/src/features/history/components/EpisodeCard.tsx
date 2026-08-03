import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import styles from '../history.module.css';

import timelineStyles from './EpisodeTimeline.module.css';

import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getEpisodeDuration,
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import {
  TRIGGER_LABELS,
} from '../../migraine/data/triggerCatalog';

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
  PostdromeHistorySection,
} from './PostdromeHistorySection';

import {
  PremonitoryHistorySection,
} from './PremonitoryHistorySection';

interface Props {
  episode: MigraineEpisode;

  isOpen: boolean;

  onOpenChange: (
    isOpen: boolean,
  ) => void;
}

const hasAuraData = (
  episode: MigraineEpisode,
): boolean => {
  const aura = episode.aura;
  const timeline = episode.timeline;

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
  const crisis = episode.crisis;
  const timeline = episode.timeline;

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
      postdrome.clinicalSymptoms?.length ||
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
  episode: MigraineEpisode,
  hasAura: boolean,
  hasCrisis: boolean,
  hasPostdrome: boolean,
): string[] => {
  const phases: string[] = [];

  if (
    episode.premonitory.present
  ) {
    phases.push('Premonitorio');
  }

  if (hasAura) {
    phases.push('Aura');
  }

  if (hasCrisis) {
    phases.push('Crisis');
  }

  if (hasPostdrome) {
    phases.push('Postdromo');
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

  const hasAura =
    hasAuraData(episode);

  const hasCrisis =
    hasCrisisData(episode);

  const hasPostdrome =
    hasPostdromeData(episode);

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

  const triggers =
    episode.triggers ?? [];

  const phases =
    getPhaseSummary(
      episode,
      hasAura,
      hasCrisis,
      hasPostdrome,
    );

  const detailId =
    createDetailId(episode);

  const hasContext =
    triggers.length > 0 ||
    Boolean(
      episode.notes?.trim(),
    );

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
    onOpenChange(!isOpen);

    if (isOpen) {
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
            {isOpen ? '⌃' : '⌄'}
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
          <div
            className={
              timelineStyles.timeline
            }
            aria-label="Evolución del episodio"
          >
            {premonitory.present && (
              <PremonitoryHistorySection
                episode={episode}
                hasCrisis={hasCrisis}
                hasAura={hasAura}
              />
            )}

            {hasAura && (
              <AuraHistorySection
                episode={episode}
              />
            )}

            {hasCrisis && (
              <CrisisHistorySection
                episode={episode}
              />
            )}

            {hasPostdrome && (
              <PostdromeHistorySection
                episode={episode}
              />
            )}
          </div>

          {hasContext && (
            <section
              className={
                timelineStyles.context
              }
              aria-labelledby={`${detailId}-context-title`}
            >
              <div
                className={
                  timelineStyles.contextHeader
                }
              >
                <span
                  className={
                    timelineStyles.contextIcon
                  }
                  aria-hidden="true"
                >
                  ◇
                </span>

                <div>
                  <small>
                    Contexto
                  </small>

                  <strong
                    id={`${detailId}-context-title`}
                  >
                    Lo que acompañó
                    este episodio
                  </strong>
                </div>
              </div>

              <div
                className={
                  timelineStyles.contextItems
                }
              >
                {triggers.length > 0 && (
                  <p>
                    <b>
                      Posibles
                      desencadenantes
                    </b>

                    {triggers
                      .map(
                        trigger =>
                          TRIGGER_LABELS[
                            trigger
                          ],
                      )
                      .join(', ')}
                  </p>
                )}

                {episode.notes?.trim() && (
                  <p>
                    <b>
                      Notas personales
                    </b>

                    {
                      episode.notes.trim()
                    }
                  </p>
                )}
              </div>
            </section>
          )}

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