import styles from '../migraine.module.css';

import type {
  PremonitorySymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

type PremonitorySymptomOption = {
  value: PremonitorySymptom;
  label: string;
};

const symptoms: PremonitorySymptomOption[] = [
  {
    value: 'fatigue',
    label: 'Fatiga o cansancio',
  },
  {
    value: 'yawning',
    label: 'Bostezos frecuentes',
  },
  {
    value: 'moodChange',
    label: 'Cambios de ánimo',
  },
  {
    value: 'irritability',
    label: 'Irritabilidad',
  },
  {
    value: 'brainFog',
    label: 'Niebla mental',
  },
  {
    value: 'foodCraving',
    label: 'Antojos alimentarios',
  },
  {
    value: 'neckStiffness',
    label: 'Rigidez cervical',
  },
  {
    value: 'thirst',
    label: 'Mayor sensación de sed',
  },
  {
    value: 'sleepiness',
    label: 'Somnolencia',
  },
  {
    value: 'concentrationDifficulty',
    label: 'Dificultad para concentrarse',
  },
];

function toLocalDateTimeValue(
  isoDate?: string,
): string {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const hours = String(
    date.getHours(),
  ).padStart(2, '0');

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getCurrentLocalDateTimeValue(): string {
  return toLocalDateTimeValue(
    new Date().toISOString(),
  );
}

export function PremonitorySelector() {
  const premonitory = useMigraineStore(
    state => state.episode.premonitory,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updatePremonitory =
    useMigraineStore(
      state => state.updatePremonitory,
    );

  const updateTimeline =
    useMigraineStore(
      state => state.updateTimeline,
    );

  const hasPremonitorySymptoms =
    premonitory.symptoms.length > 0;

  const premonitoryStartValue =
    toLocalDateTimeValue(
      timeline?.premonitoryStart,
    );

  const maximumStartDate =
    timeline?.crisisStart
      ? toLocalDateTimeValue(
          timeline.crisisStart,
        )
      : getCurrentLocalDateTimeValue();

  const hasInvalidTimeline =
    Boolean(
      timeline?.premonitoryStart &&
        timeline?.crisisStart &&
        new Date(
          timeline.premonitoryStart,
        ).getTime() >
          new Date(
            timeline.crisisStart,
          ).getTime(),
    );

  const toggleSymptom = (
    symptom: PremonitorySymptom,
  ) => {
    const symptomIsSelected =
      premonitory.symptoms.includes(
        symptom,
      );

    const updatedSymptoms =
      symptomIsSelected
        ? premonitory.symptoms.filter(
            currentSymptom =>
              currentSymptom !== symptom,
          )
        : [
            ...premonitory.symptoms,
            symptom,
          ];

    const hasSymptoms =
      updatedSymptoms.length > 0;

    updatePremonitory({
      ...premonitory,
      present: hasSymptoms,
      symptoms: updatedSymptoms,
      hoursBeforeAttack: undefined,
    });

    if (!hasSymptoms) {
      updateTimeline({
        premonitoryStart: undefined,
        premonitoryEnd: undefined,
      });
    }
  };

  const handleStartChange = (
    value: string,
  ) => {
    if (!value) {
      updateTimeline({
        premonitoryStart: undefined,
        premonitoryEnd: undefined,
      });

      return;
    }

    const selectedDate = new Date(value);

    if (
      Number.isNaN(
        selectedDate.getTime(),
      )
    ) {
      return;
    }

    const crisisStartDate =
      timeline?.crisisStart
        ? new Date(
            timeline.crisisStart,
          )
        : null;

    const startsAfterCrisis =
      crisisStartDate &&
      selectedDate.getTime() >
        crisisStartDate.getTime();

    if (startsAfterCrisis) {
      return;
    }

    updateTimeline({
      premonitoryStart:
        selectedDate.toISOString(),
      premonitoryEnd:
        timeline?.crisisStart,
    });
  };

  return (
    <section
      className={styles.symptomSelector}
      aria-labelledby="premonitory-title"
    >
      <div>
        <h3 id="premonitory-title">
          Señales antes de la migraña
        </h3>

        <p>
          Seleccioná las señales que
          aparecieron antes del inicio
          del dolor.
        </p>
      </div>

      <div
        className={styles.symptomGrid}
        role="group"
        aria-label="Síntomas premonitorios"
      >
        {symptoms.map(symptom => {
          const isSelected =
            premonitory.symptoms.includes(
              symptom.value,
            );

          return (
            <label
              key={symptom.value}
              className={
                styles.symptomOption
              }
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  toggleSymptom(
                    symptom.value,
                  )
                }
              />

              <span>
                {symptom.label}
              </span>
            </label>
          );
        })}
      </div>

      {hasPremonitorySymptoms && (
        <div
          className={styles.dateSelector}
        >
          <label>
            ¿Cuándo comenzaron estas
            señales?

            <input
              type="datetime-local"
              value={
                premonitoryStartValue
              }
              max={maximumStartDate}
              onChange={event =>
                handleStartChange(
                  event.target.value,
                )
              }
            />
          </label>

          <p>
            El final de esta fase se
            calculará automáticamente
            cuando comience la crisis.
          </p>

          {hasInvalidTimeline && (
            <p role="alert">
              Las señales premonitorias
              deben comenzar antes de la
              crisis.
            </p>
          )}
        </div>
      )}
    </section>
  );
}