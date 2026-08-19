import type {
  MigraineEpisode,
  MigraineTrigger,
} from '../../migraine/types/migraine.types';

import {
  TRIGGER_LABELS,
} from '../../migraine/data/triggerCatalog';

import {
  TREATMENT_EFFECTIVENESS_OPTIONS,
  TREATMENT_TYPE_OPTIONS,
} from '../../migraine/data/treatmentCatalog';

import {
  formatDuration,
  getEpisodeDuration,
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import {
  formatDateTime,
} from '../utils/historyFormatters';

import styles from './EpisodeGeneralSummary.module.css';

interface Props {
  episode: MigraineEpisode;
  episodeStart: string;
  phases: string[];
  hasCrisis: boolean;
}

const getTreatmentTypeLabel = (
  episode: MigraineEpisode,
): string => {
  const treatmentType =
    episode.treatment.type;

  if (!treatmentType) {
    return 'No especificado';
  }

  return (
    TREATMENT_TYPE_OPTIONS.find(
      option =>
        option.value ===
        treatmentType,
    )?.label ?? treatmentType
  );
};

const getEffectivenessLabel = (
  episode: MigraineEpisode,
): string | null => {
  const effectiveness =
    episode.treatment
      .effectiveness;

  if (!effectiveness) {
    return null;
  }

  return (
    TREATMENT_EFFECTIVENESS_OPTIONS.find(
      option =>
        option.value ===
        effectiveness,
    )?.label ?? effectiveness
  );
};

const hasTreatmentData = (
  episode: MigraineEpisode,
): boolean => {
  const treatment =
    episode.treatment;

  return Boolean(
    treatment.type ||
      treatment.medication?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment.responseTimeMinutes !==
        undefined ||
      treatment.sideEffects?.length ||
      treatment.notes?.trim(),
  );
};

const getTriggerLabel = (
  episode: MigraineEpisode,
  trigger: MigraineTrigger,
): string => {
  if (trigger !== 'other') {
    return (
      TRIGGER_LABELS[trigger] ??
      trigger
    );
  }

  const customOtherTrigger =
    episode.triggerRecords
      ?.find(
        record =>
          record.trigger === 'other',
      )
      ?.notes
      ?.trim();

  if (customOtherTrigger) {
    return `Otro: ${customOtherTrigger}`;
  }

  return (
    TRIGGER_LABELS.other ??
    'Otro posible desencadenante'
  );
};

const getTriggerLabels = (
  episode: MigraineEpisode,
): string[] => {
  const triggers =
    episode.triggers ?? [];

  return triggers.map(
    trigger =>
      getTriggerLabel(
        episode,
        trigger,
      ),
  );
};

const createSummaryId = (
  episode: MigraineEpisode,
): string => {
  const source =
    episode.id ?? episode.createdAt;

  const safeId = source.replace(
    /[^a-zA-Z0-9_-]/g,
    '-',
  );

  return `episode-summary-${safeId}`;
};

export function EpisodeGeneralSummary({
  episode,
  episodeStart,
  phases,
  hasCrisis,
}: Props) {
  const summaryId =
    createSummaryId(episode);

  const episodeDuration =
    getEpisodeDuration(episode);

  const triggerLabels =
    getTriggerLabels(episode);

  const treatment =
    episode.treatment;

  const treatmentRegistered =
    hasTreatmentData(episode);

  const effectivenessLabel =
    getEffectivenessLabel(episode);

  const hasGeneralContext =
    triggerLabels.length > 0 ||
    treatmentRegistered ||
    Boolean(episode.notes?.trim());

  return (
    <section
      className={styles.root}
      aria-labelledby={`${summaryId}-title`}
    >
      <div
        className={styles.panel}
      >
        <div
          className={styles.header}
        >
          <small>
            Resumen general
          </small>

          <strong
            id={`${summaryId}-title`}
          >
            Información del episodio
          </strong>
        </div>

        <div
          className={styles.items}
        >
          <p>
            <b>Inicio</b>
            {formatDateTime(
              episodeStart,
            )}
          </p>

          <p>
            <b>Duración total</b>
            {episodeDuration !==
            undefined
              ? formatDuration(
                  episodeDuration,
                )
              : 'No determinada'}
          </p>

          {hasCrisis && (
            <p>
              <b>
                Intensidad máxima
              </b>
              {getMaxPainIntensity(
                episode,
              )}
              /10
            </p>
          )}

          <p>
            <b>
              Fases registradas
            </b>
            {phases.length > 0
              ? phases.join(', ')
              : 'No determinadas'}
          </p>
        </div>
      </div>

      {hasGeneralContext && (
        <div
          className={`${styles.panel} ${styles.contextPanel}`}
        >
          <div
            className={styles.header}
          >
            <small>Contexto</small>

            <strong>
              Lo que acompañó este
              episodio
            </strong>
          </div>

          <div
            className={styles.items}
          >
            {triggerLabels.length >
              0 && (
              <p>
                <b>
                  Posibles
                  desencadenantes
                </b>

                {triggerLabels.join(
                  ', ',
                )}
              </p>
            )}

            {treatmentRegistered && (
              <>
                <p
                  className={
                    styles.treatmentItem
                  }
                >
                  <b>
                    Tipo de tratamiento
                  </b>
                  {getTreatmentTypeLabel(
                    episode,
                  )}
                </p>

                {treatment.medication
                  ?.trim() && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>
                      Medicación o
                      suplemento
                    </b>
                    {treatment.medication.trim()}
                  </p>
                )}

                {treatment.dose
                  ?.trim() && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>Dosis</b>
                    {treatment.dose.trim()}
                  </p>
                )}

                {treatment.takenAt && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>Hora de uso</b>
                    {treatment.takenAt}
                  </p>
                )}

                {effectivenessLabel && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>
                      Resultado percibido
                    </b>
                    {effectivenessLabel}
                  </p>
                )}

                {treatment
                  .responseTimeMinutes !==
                  undefined && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>
                      Tiempo hasta sentir
                      mejoría
                    </b>
                    {treatment.responseTimeMinutes}{' '}
                    minutos
                  </p>
                )}

                {treatment.sideEffects &&
                  treatment.sideEffects
                    .length > 0 && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>
                      Efectos secundarios
                    </b>
                    {treatment.sideEffects.join(
                      ', ',
                    )}
                  </p>
                )}

                {treatment.notes
                  ?.trim() && (
                  <p
                    className={
                      styles.treatmentItem
                    }
                  >
                    <b>
                      Notas del tratamiento
                    </b>
                    {treatment.notes.trim()}
                  </p>
                )}
              </>
            )}

            {episode.notes?.trim() && (
              <p>
                <b>
                  Notas personales
                </b>
                {episode.notes.trim()}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}