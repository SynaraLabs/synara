import { useState } from 'react';

import styles from '../migraine.module.css';

import type {
  PostdromeSymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import {
  PhaseDateSelector,
} from './common/PhaseDateSelector';

const symptoms: {
  value: PostdromeSymptom;
  label: string;
}[] = [
  {
    value: 'fatigue',
    label: 'Cansancio extremo',
  },
  {
    value: 'brainFog',
    label: 'Niebla mental',
  },
  {
    value: 'weakness',
    label: 'Debilidad corporal',
  },
  {
    value: 'moodChange',
    label: 'Cambios emocionales',
  },
  {
    value: 'residualSensitivity',
    label: 'Sensibilidad residual',
  },
  {
    value: 'neckDiscomfort',
    label: 'Molestia cervical',
  },
];

export function PostdromeSelector() {
  const [showEndDate, setShowEndDate] = useState(false);

  const postdrome = useMigraineStore(
    state => state.episode.postdrome,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updatePostdrome = useMigraineStore(
    state => state.updatePostdrome,
  );

  const updateTimeline = useMigraineStore(
    state => state.updateTimeline,
  );

  const toggleSymptom = (
    symptom: PostdromeSymptom,
  ) => {
    const updated = postdrome.symptoms.includes(symptom)
      ? postdrome.symptoms.filter(
          item => item !== symptom,
        )
      : [
          ...postdrome.symptoms,
          symptom,
        ];

    updatePostdrome({
      ...postdrome,
      present: updated.length > 0,
      symptoms: updated,
    });
  };

  const handleEndDate = (
    date: string,
  ) => {
    updateTimeline({
      postdromeEnd: date,
    });

    setShowEndDate(false);
  };

  return (
    <section>
      <h3>
        Después de la crisis
      </h3>

      <p>
        Algunas personas continúan con síntomas
        después de que baja el dolor.
      </p>

      {timeline?.postdromeStart && (
        <p className={styles.helperText}>
          Inicio del postdromo:{' '}
          {new Date(
            timeline.postdromeStart,
          ).toLocaleString()}
        </p>
      )}

      <div className={styles.symptomGrid}>
        {symptoms.map(item => (
          <label
            key={item.value}
            className={styles.symptomOption}
          >
            <input
              type="checkbox"
              checked={postdrome.symptoms.includes(
                item.value,
              )}
              onChange={() =>
                toggleSymptom(item.value)
              }
            />

            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {postdrome.present &&
        timeline?.postdromeStart &&
        !timeline?.postdromeEnd && (
          <button
            type="button"
            onClick={() =>
              setShowEndDate(true)
            }
          >
            Indicar recuperación completa
          </button>
        )}

      {showEndDate && (
        <PhaseDateSelector
          title="¿Cuándo sentiste recuperación completa?"
          value={
            timeline?.postdromeEnd
          }
          onChange={handleEndDate}
        />
      )}
    </section>
  );
}