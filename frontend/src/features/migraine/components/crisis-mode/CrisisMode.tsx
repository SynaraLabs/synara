import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

import type {
  AnatomicalPainMap,
  CrisisPhase,
  CrisisSymptom,
  PainIntensity,
  PainLocationPoint,
  PainLocationRecord,
  PhaseTime,
} from '../../types/migraine.types';

import type {
  NonPharmacologicalMeasure,
} from '../../data/nonPharmacologicalMeasureCatalog';

import {
  getFunctionalCapacityRecords,
  getMedicationRecords,
  getNonPharmacologicalRecords,
} from '../../utils/crisisEventRecords';

import {
  useMigraineStore,
} from '../../store/migraine.store';

import {
  FinishCrisisButton,
  type CrisisEndSelection,
} from './FinishCrisisButton';

import type {
  AffectedActivity,
  FunctionalCapacityLevel,
} from './FunctionalCapacityCard';

import {
  CrisisTools,
} from './CrisisTools';

import {
  PainCard,
} from './PainCard';

interface Props {
  onExit?: () => void;
}

const generateId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const formatCrisisStart = (
  value?: string,
): string => {
  if (!value) {
    return 'Hora de inicio no registrada';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Hora de inicio no registrada';
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

const isValidPainIntensity = (
  value: number,
): value is PainIntensity => {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  );
};

const createExactPhaseTime = (
  value: string,
): PhaseTime => {
  return {
    value,
    precision: 'exact',
    recordMode: 'realTime',
  };
};

const getAnatomicalPoints = (
  location: AnatomicalPainMap,
): PainLocationPoint[] => {
  const points:
    PainLocationPoint[] = [];

  if (location.primary) {
    points.push(
      location.primary,
    );
  }

  if (location.origin) {
    points.push(
      location.origin,
    );
  }

  points.push(
    ...(location.additional ?? []),
  );

  return points;
};

const createLocationRecord = (
  location: AnatomicalPainMap,
  previousRecord?: PainLocationRecord,
  hadPreviousLocations = false,
): PainLocationRecord => {
  return {
    ...(previousRecord ?? {
      additional: [],
    }),

    anatomicalMap:
      location,

    anatomicalPoints:
      getAnatomicalPoints(
        location,
      ),

    onsetPoint:
      location.origin,

    radiationPaths:
      location.radiation ?? [],

    changedOverTime:
      hadPreviousLocations ||
      location.changesSide === true,

    notes:
      location.notes,
  };
};

const getCurrentCrisis =
  (): CrisisPhase => {
    return useMigraineStore.getState()
      .episode.crisis;
  };

const ensureCrisisStarted =
  (): CrisisPhase => {
    const state =
      useMigraineStore.getState();

    const currentCrisis =
      state.episode.crisis;

    const currentTimeline =
      state.episode.timeline;

    if (
      !currentTimeline?.crisisStart ||
      !currentCrisis.active
    ) {
      state.startCrisis();

      return useMigraineStore.getState()
        .episode.crisis;
    }

    return currentCrisis;
  };

const normalizeLocalDateTime = (
  value: string,
): string | null => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toISOString();
};

export function CrisisMode({
  onExit,
}: Props) {
  const [
    isConfirmingDiscard,
    setIsConfirmingDiscard,
  ] = useState(false);

  const crisis =
    useMigraineStore(
      state =>
        state.episode.crisis,
    );

  const timeline =
    useMigraineStore(
      state =>
        state.episode.timeline,
    );

  const finishCrisis =
    useMigraineStore(
      state =>
        state.finishCrisis,
    );

  const resetEpisode =
    useMigraineStore(
      state =>
        state.resetEpisode,
    );

  const symptoms =
    crisis.symptoms ?? [];

  const medicationRecords =
    getMedicationRecords(
      crisis,
    );

  const nonPharmacologicalRecords =
    getNonPharmacologicalRecords(
      crisis,
    );

  const functionalCapacityRecords =
    getFunctionalCapacityRecords(
      crisis,
    );

  const crisisStart =
    timeline?.crisisStart ??
    crisis.startTime ??
    crisis.time?.start?.value;

  const anatomicalLocation:
    AnatomicalPainMap =
    crisis.anatomicalLocation ??
    crisis.locationDetails
      ?.anatomicalMap ?? {
      additional: [],
      radiation: [],
    };

  const handlePainChange = (
    value: string,
  ) => {
    const numericValue =
      Number(value);

    if (
      !isValidPainIntensity(
        numericValue,
      )
    ) {
      return;
    }

    const currentCrisis =
      ensureCrisisStarted();

    useMigraineStore
      .getState()
      .updateCrisis({
        ...currentCrisis,
        active: true,
        intensity:
          numericValue,
      });
  };

  const handlePainRegister =
    () => {
      const now =
        new Date().toISOString();

      const currentCrisis =
        ensureCrisisStarted();

      const currentIntensityHistory =
        currentCrisis
          .intensityHistory ?? [];

      const currentEvents =
        currentCrisis.events ?? [];

      useMigraineStore
        .getState()
        .updateCrisis({
          ...currentCrisis,
          active: true,

          intensityHistory: [
            ...currentIntensityHistory,
            {
              id: generateId(),
              time: now,
              intensity:
                currentCrisis.intensity,
              location:
                currentCrisis
                  .locationDetails,
            },
          ],

          events: [
            ...currentEvents,
            {
              id: generateId(),
              type: 'intensity',
              timestamp: now,
              data: {
                intensity:
                  currentCrisis
                    .intensity,
                anatomicalLocation:
                  currentCrisis
                    .anatomicalLocation,
              },
            },
          ],
        });
    };

  const handleLocationChange = (
    location: AnatomicalPainMap,
  ) => {
    const now =
      new Date().toISOString();

    const currentCrisis =
      ensureCrisisStarted();

    const currentLocationHistory =
      currentCrisis
        .locationHistory ?? [];

    const currentEvents =
      currentCrisis.events ?? [];

    const normalizedLocation:
      AnatomicalPainMap = {
      ...location,
      additional:
        location.additional ?? [],
      radiation:
        location.radiation ?? [],
    };

    const locationRecord =
      createLocationRecord(
        normalizedLocation,
        currentCrisis
          .locationDetails,
        currentLocationHistory.length >
          0,
      );

    useMigraineStore
      .getState()
      .updateCrisis({
        ...currentCrisis,
        active: true,
        anatomicalLocation:
          normalizedLocation,
        locationDetails:
          locationRecord,

        locationHistory: [
          ...currentLocationHistory,
          {
            id: generateId(),
            occurredAt:
              createExactPhaseTime(
                now,
              ),
            location:
              locationRecord,
          },
        ],

        events: [
          ...currentEvents,
          {
            id: generateId(),
            type: 'location',
            timestamp: now,
            data: {
              anatomicalLocation:
                normalizedLocation,
            },
          },
        ],
      });
  };

  const handleMedicationRegister = (
    medication: string,
    dose: string,
    takenAt: string,
    notes: string,
  ) => {
    const normalizedMedication =
      medication.trim();

    if (
      !normalizedMedication ||
      !takenAt
    ) {
      return;
    }

    const normalizedTakenAt =
      normalizeLocalDateTime(
        takenAt,
      );

    if (!normalizedTakenAt) {
      return;
    }

    const currentCrisis =
      ensureCrisisStarted();

    const currentEvents =
      currentCrisis.events ?? [];

    useMigraineStore
      .getState()
      .updateCrisis({
        ...currentCrisis,
        active: true,

        events: [
          ...currentEvents,
          {
            id: generateId(),
            type: 'medication',
            timestamp:
              normalizedTakenAt,
            data: {
              medication:
                normalizedMedication,
              dose:
                dose.trim(),
              takenAt:
                normalizedTakenAt,
              recordedAt:
                new Date()
                  .toISOString(),
              notes:
                notes.trim(),
            },
          },
        ],
      });
  };

  const handleNonPharmacologicalRegister =
    (
      measures:
        NonPharmacologicalMeasure[],
      appliedAt: string,
      notes: string,
    ) => {
      if (
        measures.length === 0 ||
        !appliedAt
      ) {
        return;
      }

      const normalizedAppliedAt =
        normalizeLocalDateTime(
          appliedAt,
        );

      if (!normalizedAppliedAt) {
        return;
      }

      const currentCrisis =
        ensureCrisisStarted();

      const currentEvents =
        currentCrisis.events ?? [];

      useMigraineStore
        .getState()
        .updateCrisis({
          ...currentCrisis,
          active: true,

          events: [
            ...currentEvents,
            {
              id: generateId(),
              type: 'note',
              timestamp:
                normalizedAppliedAt,
              data: {
                kind:
                  'nonPharmacological',
                measures: [
                  ...measures,
                ],
                appliedAt:
                  normalizedAppliedAt,
                recordedAt:
                  new Date()
                    .toISOString(),
                notes:
                  notes.trim(),
              },
            },
          ],
        });
    };

  const handleFunctionalCapacityRegister =
    (
      level:
        FunctionalCapacityLevel,
      affectedActivities:
        AffectedActivity[],
      occurredAt: string,
      notes: string,
    ) => {
      if (!occurredAt) {
        return;
      }

      const normalizedOccurredAt =
        normalizeLocalDateTime(
          occurredAt,
        );

      if (!normalizedOccurredAt) {
        return;
      }

      const currentCrisis =
        ensureCrisisStarted();

      const currentEvents =
        currentCrisis.events ?? [];

      useMigraineStore
        .getState()
        .updateCrisis({
          ...currentCrisis,
          active: true,
          unableToFunction:
            level === 'unable',

          events: [
            ...currentEvents,
            {
              id: generateId(),
              type: 'note',
              timestamp:
                normalizedOccurredAt,
              data: {
                kind:
                  'functionalCapacity',
                level,
                affectedActivities: [
                  ...affectedActivities,
                ],
                occurredAt:
                  normalizedOccurredAt,
                recordedAt:
                  new Date()
                    .toISOString(),
                notes:
                  notes.trim(),
              },
            },
          ],
        });
    };

  const handleSymptomToggle = (
    symptom: CrisisSymptom,
  ) => {
    const now =
      new Date().toISOString();

    const currentCrisis =
      ensureCrisisStarted();

    const currentSymptoms =
      currentCrisis.symptoms ?? [];

    const currentEvents =
      currentCrisis.events ?? [];

    const symptomWasActive =
      currentSymptoms.includes(
        symptom,
      );

    const updatedSymptoms =
      symptomWasActive
        ? currentSymptoms.filter(
            currentSymptom =>
              currentSymptom !==
              symptom,
          )
        : [
            ...currentSymptoms,
            symptom,
          ];

    useMigraineStore
      .getState()
      .updateCrisis({
        ...currentCrisis,
        active: true,
        symptoms:
          updatedSymptoms,

        events: [
          ...currentEvents,
          {
            id: generateId(),
            type: 'symptom',
            timestamp: now,
            data: {
              symptom,
              action:
                symptomWasActive
                  ? 'removed'
                  : 'added',
              symptoms: [
                ...updatedSymptoms,
              ],
            },
          },
        ],
      });
  };

  const handleFinish = (
    selection?:
      CrisisEndSelection,
  ) => {
    if (!selection) {
      return;
    }

    const currentCrisis =
      getCurrentCrisis();

    useMigraineStore
      .getState()
      .updateCrisis(
        currentCrisis,
      );

    finishCrisis({
      endTime:
        selection.endTime,
      precision:
        selection.precision,
      recordMode:
        selection.recordMode,
      hadPostdrome:
        selection.hadPostdrome,
    });

    onExit?.();
  };

  const handleDiscardEpisode =
    () => {
      resetEpisode();
      setIsConfirmingDiscard(
        false,
      );
      onExit?.();
    };

  return (
    <section
      className={
        styles.container
      }
    >
      <header>
        <h1>
          Crisis activa
        </h1>

        <p>
          Desde{' '}
          {formatCrisisStart(
            crisisStart,
          )}
        </p>

        <p>
          Registrá solo lo que necesites.
          Los cambios se guardan durante
          la evolución de la crisis.
        </p>

        <button
          type="button"
          aria-expanded={
            isConfirmingDiscard
          }
          onClick={() =>
            setIsConfirmingDiscard(
              true,
            )
          }
        >
          Cancelar registro
        </button>

        {isConfirmingDiscard && (
          <div
            className={
              styles.discardConfirmation
            }
            role="alertdialog"
            aria-labelledby="crisis-discard-title"
            aria-describedby="crisis-discard-description"
          >
            <div>
              <h2
                id="crisis-discard-title"
              >
                ¿Eliminar este episodio?
              </h2>

              <p
                id="crisis-discard-description"
              >
                El registro se descartará
                y no aparecerá en tu
                historial.
              </p>
            </div>

            <div
              className={
                styles.discardActions
              }
            >
              <button
                type="button"
                className={
                  styles.keepEpisode
                }
                onClick={() =>
                  setIsConfirmingDiscard(
                    false,
                  )
                }
              >
                Volver
              </button>

              <button
                type="button"
                className={
                  styles.confirmDiscard
                }
                onClick={
                  handleDiscardEpisode
                }
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        )}
      </header>

      <PainCard
        crisis={crisis}
        onChange={
          handlePainChange
        }
        onRegister={
          handlePainRegister
        }
      />

      <CrisisTools
        crisis={crisis}
        symptoms={symptoms}
        anatomicalLocation={
          anatomicalLocation
        }
        medicationRecords={
          medicationRecords
        }
        nonPharmacologicalRecords={
          nonPharmacologicalRecords
        }
        functionalCapacityRecords={
          functionalCapacityRecords
        }
        onSymptomToggle={
          handleSymptomToggle
        }
        onLocationChange={
          handleLocationChange
        }
        onMedicationRegister={
          handleMedicationRegister
        }
        onNonPharmacologicalRegister={
          handleNonPharmacologicalRegister
        }
        onFunctionalCapacityRegister={
          handleFunctionalCapacityRegister
        }
      />

      <FinishCrisisButton
        crisisStart={
          crisisStart
        }
        onFinish={
          handleFinish
        }
      />
    </section>
  );
}