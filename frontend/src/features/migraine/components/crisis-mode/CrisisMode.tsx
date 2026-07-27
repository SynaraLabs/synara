import styles from './crisis-mode.module.css';

import type {
  CrisisSymptom,
  PainIntensity,
  CrisisPhase,
} from '../../types/migraine.types';

import {
  useMigraineStore,
} from '../../store/migraine.store';

import {
  PainCard,
} from './PainCard';

import {
  MedicationCard,
} from './MedicationCard';

import {
  SymptomsCard,
} from './SymptomsCard';

import {
  FinishCrisisButton,
} from './FinishCrisisButton';

interface Props {
  onExit?: () => void;
}

export function CrisisMode({
  onExit,
}: Props) {
  const crisis = useMigraineStore(
    state => state.episode.crisis,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updateCrisis = useMigraineStore(
    state => state.updateCrisis,
  );

  const startCrisis = useMigraineStore(
    state => state.startCrisis,
  );

  const finishCrisis = useMigraineStore(
    state => state.finishCrisis,
  );

  const ensureCrisisStarted = () => {
    if (!timeline?.crisisStart) {
      startCrisis();
    }
  };

  const handlePainChange = (
    value: string,
  ) => {
    const intensity =
      Number(value) as PainIntensity;

    ensureCrisisStarted();

    const updated: CrisisPhase = {
      ...crisis,
      active: true,
      intensity,
    };

    updateCrisis(updated);
  };

  const handlePainRegister = () => {
    const now =
      new Date().toISOString();

    ensureCrisisStarted();

    updateCrisis({
      ...crisis,

      intensityHistory: [
        ...crisis.intensityHistory,
        {
          time: now,
          intensity: crisis.intensity,
        },
      ],

      events: [
        ...crisis.events,
        {
          id: crypto.randomUUID(),
          type: 'intensity',
          timestamp: now,
          data: {
            intensity: crisis.intensity,
          },
        },
      ],
    });
  };

  const handleMedicationRegister = (
    medication: string,
    dose: string,
  ) => {
    const now =
      new Date().toISOString();

    ensureCrisisStarted();

    updateCrisis({
      ...crisis,

      events: [
        ...crisis.events,
        {
          id: crypto.randomUUID(),
          type: 'medication',
          timestamp: now,
          data: {
            medication,
            dose,
          },
        },
      ],
    });
  };

  const handleSymptomToggle = (
    symptom: CrisisSymptom,
  ) => {
    const symptoms =
      crisis.symptoms.includes(symptom)
        ? crisis.symptoms.filter(
            item => item !== symptom,
          )
        : [
            ...crisis.symptoms,
            symptom,
          ];

    updateCrisis({
      ...crisis,
      symptoms,
    });
  };

  const handleFinish = () => {
    finishCrisis();
    onExit?.();
  };

  return (
    <section className={styles.container}>
      <header>
        <h1>
          Crisis activa
        </h1>

        <p>
          Registrá cómo evoluciona tu migraña.
        </p>
      </header>

      <PainCard
        crisis={crisis}
        onChange={handlePainChange}
        onRegister={handlePainRegister}
      />

      <MedicationCard
        onRegister={handleMedicationRegister}
      />

      <SymptomsCard
        symptoms={crisis.symptoms}
        onToggle={handleSymptomToggle}
      />

      <FinishCrisisButton
        onFinish={handleFinish}
      />
    </section>
  );
}