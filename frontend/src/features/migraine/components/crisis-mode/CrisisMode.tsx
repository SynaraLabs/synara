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

import { useMigraineStore } from '../../store/migraine.store';

import { PainLocationSelector } from '../common/PainLocationSelector';

import {
  FinishCrisisButton,
  type CrisisEndSelection,
} from './FinishCrisisButton';

import { MedicationCard } from './MedicationCard';
import { PainCard } from './PainCard';
import { SymptomsCard } from './SymptomsCard';


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

  if (Number.isNaN(date.getTime())) {
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


export function CrisisMode({
  onExit,
}: Props) {
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


  const symptoms =
    crisis.symptoms ?? [];


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
  ) => {
    const normalizedMedication =
      medication.trim();

    const normalizedDose =
      dose.trim();

    if (!normalizedMedication) {
      return;
    }

    const now =
      new Date().toISOString();

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

            timestamp: now,

            data: {
              medication:
                normalizedMedication,

              dose:
                normalizedDose,
            },
          },
        ],
      });
  };


  const handleSymptomToggle = (
    symptom: CrisisSymptom,
  ) => {
    const currentCrisis =
      ensureCrisisStarted();

    const currentSymptoms =
      currentCrisis.symptoms ?? [];

    const updatedSymptoms =
      currentSymptoms.includes(
        symptom,
      )
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
      });
  };


  const handleFinish = (
    selection?:
      CrisisEndSelection,
  ) => {
    if (!selection) {
      return;
    }

    /*
     * Antes de finalizar, verificamos
     * que el store conserve la última
     * versión completa de la crisis.
     */
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
          Registrá cómo evoluciona tu
          migraña.
        </p>
      </header>


      <PainCard
        crisis={
          crisis
        }
        onChange={
          handlePainChange
        }
        onRegister={
          handlePainRegister
        }
      />


      <PainLocationSelector
        value={
          anatomicalLocation
        }
        onChange={
          handleLocationChange
        }
        title="¿Dónde sentís el dolor?"
      />


      <MedicationCard
        onRegister={
          handleMedicationRegister
        }
      />


      <SymptomsCard
        symptoms={
          symptoms
        }
        onToggle={
          handleSymptomToggle
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