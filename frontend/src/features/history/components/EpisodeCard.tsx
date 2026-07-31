import {
  useState,
} from 'react';

import styles from '../history.module.css';

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

import { AuraHistorySection } from './AuraHistorySection';
import { CrisisHistorySection } from './CrisisHistorySection';
import { PostdromeHistorySection } from './PostdromeHistorySection';
import { PremonitoryHistorySection } from './PremonitoryHistorySection';

interface Props {
  episode: MigraineEpisode;
}

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
      aura.visualSymptoms.length >
        0 ||
      aura.sensorySymptoms.length >
        0 ||
      aura.languageSymptoms.length >
        0 ||
      aura.motorSymptoms?.length ||
      aura.vestibularSymptoms
        ?.length ||
      aura.clinicalSymptoms
        ?.length ||
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
      crisis.intensityHistory
        ?.length ||
      crisis.events?.length ||
      crisis.locationHistory
        ?.length,
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
    postdrome.time?.start
      ?.value;

  const end =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end
      ?.value;

  return Boolean(
    postdrome.present === true ||
      postdrome.symptoms.length >
        0 ||
      postdrome.clinicalSymptoms
        ?.length ||
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
    premonitory
      .endedWithoutCrisis ===
      true ||
    episode.completionReason ===
      'phaseEndedWithoutCrisis'
  ) {
    return 'Señales previas sin crisis';
  }

  if (
    episode.status ===
      'incomplete' ||
    premonitory.status ===
      'uncertain'
  ) {
    return 'Registro de señales — desenlace incierto';
  }

  if (hasAura) {
    return 'Aura sin crisis confirmada';
  }

  return 'Registro de señales previas';
};

export function EpisodeCard({
  episode,
}: Props) {
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
    premonitory.time?.start
      ?.value ??
    timeline?.auraStart ??
    episode.aura.time?.start
      ?.value ??
    timeline?.crisisStart ??
    episode.crisis.startTime ??
    episode.crisis.time?.start
      ?.value ??
    episode.createdAt;

  const episodeDuration =
    getEpisodeDuration(
      episode,
    );

  const triggers =
    episode.triggers ?? [];

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

  return (
    <article
      className={
        styles.episodeCard
      }
    >
      <header
        className={
          styles.episodeHeader
        }
      >
        <div>
          <h3>{title}</h3>

          <span>
            {formatCreatedDate(
              episode.createdAt,
            )}
          </span>
        </div>

        <strong>
          {headerStatus}
        </strong>
      </header>

      <div
        className={
          styles.episodeInfo
        }
      >
        <p>
          <b>
            Inicio del registro:
          </b>{' '}
          {formatDateTime(
            episodeStart,
          )}
        </p>

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

        {!hasCrisis &&
          triggers.length > 0 && (
            <p>
              <b>
                Posibles
                desencadenantes:
              </b>{' '}
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

        {hasPostdrome && (
          <PostdromeHistorySection
            episode={episode}
          />
        )}

        {episode.notes?.trim() && (
          <p>
            <b>
              Notas generales:
            </b>{' '}
            {episode.notes.trim()}
          </p>
        )}

        {episodeDuration !==
          undefined && (
          <p>
            <b>
              Duración total del
              registro:
            </b>{' '}
            {formatDuration(
              episodeDuration,
            )}
          </p>
        )}

        {episodeDuration ===
          undefined &&
          isUncertain && (
            <p>
              <b>
                Duración total:
              </b>{' '}
              No determinada
            </p>
          )}

        {!showDeleteConfirmation ? (
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirmation(
                true,
              );

              setDeleteError('');
            }}
          >
            Eliminar este registro
          </button>
        ) : (
          <section>
            <h4>
              ¿Eliminar este registro?
            </h4>

            <p>
              Se eliminará únicamente
              este episodio del
              historial. Esta acción no
              se puede deshacer.
            </p>

            <button
              type="button"
              onClick={
                handleDelete
              }
            >
              Confirmar eliminación
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirmation(
                  false,
                );

                setDeleteError('');
              }}
            >
              Cancelar
            </button>

            {deleteError && (
              <p role="alert">
                {deleteError}
              </p>
            )}
          </section>
        )}
      </div>
    </article>
  );
}