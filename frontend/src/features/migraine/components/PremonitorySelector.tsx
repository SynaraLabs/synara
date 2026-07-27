import styles from '../migraine.module.css';

import type {
  PremonitorySymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

const symptoms: {
  value: PremonitorySymptom;
  label: string;
}[] = [
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

const toLocalDateTimeValue = (
  isoDate?: string,
): string => {
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
};

const getCurrentLocalDateTimeValue =
  (): string => {
    return toLocalDateTimeValue(
      new Date().toISOString(),
    );
  };

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

  const toggleSymptom = (
    symptom: PremonitorySymptom,
  ) => {
    const updatedSymptoms =
      premonitory.symptoms.includes(symptom)
        ? premonitory.symptoms.filter(
            item => item !== symptom,
          )
        : [
            ...premonitory.symptoms,
            symptom,
          ];

    const hasSymptoms =
      updatedSymptoms.length > 0;

    updatePremonitory({
      ...premonitory,

      present:
        hasSymptoms,

      symptoms:
        updatedSymptoms,

      hoursBeforeAttack:
        undefined,
    });

    if (!hasSymptoms) {
      updateTimeline({
        premonitoryStart:
          undefined,

        premonitoryEnd:
          undefined,
      });
    }
  };

  const handleStartChange = (
    value: string,
  ) => {
    if (!value) {
      updateTimeline({
        premonitoryStart:
          undefined,

        premonitoryEnd:
          undefined,
      });

      return;
    }

    const selectedDate =
      new Date(value);

    if (
      Number.isNaN(
        selectedDate.getTime(),
      )
    ) {
      return;
    }

    const crisisStart =
      timeline?.crisisStart
        ? new Date(
            timeline.crisisStart,
          )
        : undefined;

    if (
      crisisStart &&
      selectedDate.getTime() >
        crisisStart.getTime()
    ) {
      return;
    }

    updateTimeline({
      premonitoryStart:
        selectedDate.toISOString(),

      premonitoryEnd:
        timeline?.crisisStart,
    });
  };

  const premonitoryStartValue =
    toLocalDateTimeValue(
      timeline?.premonitoryStart,
    );

  const crisisStartLimit =
    timeline?.crisisStart
      ? toLocalDateTimeValue(
          timeline.crisisStart,
        )
      : getCurrentLocalDateTimeValue();

  return (
    <section
      className={
        styles.symptomSelector
      }
    >
      <h3>
        Señales antes de la migraña
      </h3>

      <p>
        Registrá las señales que
        aparecieron antes del inicio del
        dolor.
      </p>

      <div
        className={
          styles.symptomGrid
        }
      >
        {symptoms.map(symptom => (
          <label
            key={symptom.value}
            className={
              styles.symptomOption
            }
          >
            <input
              type="checkbox"
              checked={
                premonitory.symptoms.includes(
                  symptom.value,
                )
              }
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
        ))}
      </div>

      {premonitory.symptoms.length >
        0 && (
        <div>
          <label>
            ¿Cuándo comenzaron estas
            señales?

            <input
              type="datetime-local"
              value={
                premonitoryStartValue
              }
              max={
                crisisStartLimit
              }
              onChange={event =>
                handleStartChange(
                  event.target.value,
                )
              }
            />
          </label>

          <p>
            El final del premonitorio se
            calculará automáticamente
            cuando comience la crisis.
          </p>

          {timeline?.crisisStart &&
            timeline.premonitoryStart &&
            new Date(
              timeline.premonitoryStart,
            ).getTime() >
              new Date(
                timeline.crisisStart,
              ).getTime() && (
              <p role="alert">
                El premonitorio debe
                comenzar antes de la
                crisis.
              </p>
            )}
        </div>
      )}
    </section>
  );
}