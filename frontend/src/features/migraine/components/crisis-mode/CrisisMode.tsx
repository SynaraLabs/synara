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

  return date.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const points: PainLocationPoint[] = [];

  if (location.primary) {
    points.push(location.primary);
  }

  if (location.origin) {
    points.push(location.origin);
  }

  points.push(...location.additional);

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

    anatomicalMap: location,

    anatomicalPoints:
      getAnatomicalPoints(location),

    onsetPoint: location.origin,

    radiationPaths:
      location.radiation ?? [],

    changedOverTime:
      hadPreviousLocations ||
      location.changesSide === true,

    notes: location.notes,
  };
};


export function CrisisMode({
  onExit,
}: Props) {
  const crisis = useMigraineStore(
    state => state.episode.crisis,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updateCrisis =
    useMigraineStore(
      state => state.updateCrisis,
    );

  const startCrisis =
    useMigraineStore(
      state => state.startCrisis,
    );

  const finishCrisis =
    useMigraineStore(
      state => state.finishCrisis,
    );


  const intensityHistory =
    crisis.intensityHistory ?? [];

  const events =
    crisis.events ?? [];

  const symptoms =
    crisis.symptoms ?? [];

  const locationHistory =
    crisis.locationHistory ?? [];


  const crisisStart =
    timeline?.crisisStart ||
    crisis.startTime ||
    crisis.time?.start?.value;


  const anatomicalLocation =
    crisis.anatomicalLocation ??
    crisis.locationDetails
      ?.anatomicalMap ?? {
      additional: [],
    };


  const ensureCrisisStarted = () => {
    if (
      !timeline?.crisisStart ||
      !crisis.active
    ) {
      startCrisis();
    }
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

    ensureCrisisStarted();

    const updatedCrisis:
      CrisisPhase = {
      ...crisis,
      active: true,
      intensity: numericValue,
    };

    updateCrisis(updatedCrisis);
  };


  const handlePainRegister = () => {
    const now =
      new Date().toISOString();

    ensureCrisisStarted();

    updateCrisis({
      ...crisis,

      active: true,

      intensityHistory: [
        ...intensityHistory,
        {
          id: generateId(),
          time: now,
          intensity:
            crisis.intensity,
          location:
            crisis.locationDetails,
        },
      ],

      events: [
        ...events,
        {
          id: generateId(),
          type: 'intensity',
          timestamp: now,
          data: {
            intensity:
              crisis.intensity,

            anatomicalLocation:
              crisis.anatomicalLocation,
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

    ensureCrisisStarted();

    const locationRecord =
      createLocationRecord(
        location,
        crisis.locationDetails,
        locationHistory.length > 0,
      );

    updateCrisis({
      ...crisis,

      active: true,

      anatomicalLocation:
        location,

      locationDetails:
        locationRecord,

      locationHistory: [
        ...locationHistory,
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
        ...events,
        {
          id: generateId(),
          type: 'location',
          timestamp: now,
          data: {
            anatomicalLocation:
              location,
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

    ensureCrisisStarted();

    updateCrisis({
      ...crisis,

      active: true,

      events: [
        ...events,
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
    ensureCrisisStarted();

    const updatedSymptoms =
      symptoms.includes(symptom)
        ? symptoms.filter(
            currentSymptom =>
              currentSymptom !==
              symptom,
          )
        : [
            ...symptoms,
            symptom,
          ];

    updateCrisis({
      ...crisis,
      active: true,
      symptoms: updatedSymptoms,
    });
  };


  const handleFinish = (
    selection?: CrisisEndSelection,
  ) => {
    if (!selection) {
      return;
    }

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
      className={styles.container}
    >
      <header>
        <h1>Crisis activa</h1>

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
        crisis={crisis}
        onChange={
          handlePainChange
        }
        onRegister={
          handlePainRegister
        }
      />


      <PainLocationSelector
        value={anatomicalLocation}
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
        symptoms={symptoms}
        onToggle={
          handleSymptomToggle
        }
      />


      <FinishCrisisButton
        crisisStart={crisisStart}
        onFinish={handleFinish}
      />
    </section>
  );
}