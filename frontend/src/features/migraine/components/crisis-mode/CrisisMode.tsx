import styles from './crisis-mode.module.css';

import type {
  CrisisPhase,
  CrisisSymptom,
  PainIntensity,
} from '../../types/migraine.types';

import { useMigraineStore } from '../../store/migraine.store';

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

  const crisisStart =
    timeline?.crisisStart ||
    crisis.startTime ||
    crisis.time?.start?.value;

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
          intensity: crisis.intensity,
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
            dose: normalizedDose,
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
      endTime: selection.endTime,
      precision:
        selection.precision,
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