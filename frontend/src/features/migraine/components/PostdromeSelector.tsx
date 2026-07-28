import {
  useState,
} from 'react';

import type {
  PostdromeSymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import {
  PhaseDateSelector,
} from './common/PhaseDateSelector';

import styles from '../migraine.module.css';

type PostdromeSymptomOption = {
  value: PostdromeSymptom;
  label: string;
};

const symptoms: PostdromeSymptomOption[] = [
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

function formatDateTime(
  value?: string,
): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

export function PostdromeSelector() {
  const [
    showEndDate,
    setShowEndDate,
  ] = useState(false);

  const postdrome = useMigraineStore(
    state => state.episode.postdrome,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updatePostdrome =
    useMigraineStore(
      state => state.updatePostdrome,
    );

  const updateTimeline =
    useMigraineStore(
      state => state.updateTimeline,
    );

  const selectedSymptoms =
    postdrome.symptoms ?? [];

  const hasPostdromeStart =
    Boolean(
      timeline?.postdromeStart,
    );

  const hasPostdromeEnd =
    Boolean(
      timeline?.postdromeEnd,
    );

  const canRegisterRecovery =
    postdrome.present &&
    hasPostdromeStart &&
    !hasPostdromeEnd;

  const toggleSymptom = (
    symptom: PostdromeSymptom,
  ) => {
    const isSelected =
      selectedSymptoms.includes(
        symptom,
      );

    const updatedSymptoms =
      isSelected
        ? selectedSymptoms.filter(
            currentSymptom =>
              currentSymptom !== symptom,
          )
        : [
            ...selectedSymptoms,
            symptom,
          ];

    updatePostdrome({
      ...postdrome,
      present:
        updatedSymptoms.length > 0,
      symptoms:
        updatedSymptoms,
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
    <section
      className={
        styles.symptomSelector
      }
      aria-labelledby="postdrome-title"
    >
      <div>
        <h3 id="postdrome-title">
          Después de la crisis
        </h3>

        <p>
          Seleccioná los síntomas que
          continuaron después de que
          disminuyó el dolor.
        </p>
      </div>

      {hasPostdromeStart && (
        <div
          className={
            styles.phaseTimeInfo
          }
        >
          <span
            className={
              styles.phaseTimeIcon
            }
            aria-hidden="true"
          >
            ◷
          </span>

          <div>
            <small>
              Inicio de la recuperación
            </small>

            <strong>
              {formatDateTime(
                timeline?.postdromeStart,
              )}
            </strong>
          </div>
        </div>
      )}

      <div
        className={styles.symptomGrid}
        role="group"
        aria-label="Síntomas posteriores a la crisis"
      >
        {symptoms.map(item => {
          const isSelected =
            selectedSymptoms.includes(
              item.value,
            );

          return (
            <label
              key={item.value}
              className={
                styles.symptomOption
              }
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  toggleSymptom(
                    item.value,
                  )
                }
              />

              <span>
                {item.label}
              </span>
            </label>
          );
        })}
      </div>

      {canRegisterRecovery && (
        <div
          className={
            styles.recoveryAction
          }
        >
          <div>
            <h4>
              ¿Ya desaparecieron los
              síntomas?
            </h4>

            <p>
              Registrá el momento en que
              volviste a sentirte
              completamente recuperada.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowEndDate(true)
            }
          >
            Indicar recuperación
          </button>
        </div>
      )}

      {showEndDate && (
        <div
          className={
            styles.recoveryDateArea
          }
        >
          <div
            className={
              styles.recoveryDateHeader
            }
          >
            <h4>
              Recuperación completa
            </h4>

            <button
              className={
                styles.secondaryButton
              }
              type="button"
              onClick={() =>
                setShowEndDate(false)
              }
            >
              Cancelar
            </button>
          </div>

          <PhaseDateSelector
            title="¿Cuándo sentiste recuperación completa?"
            value={
              timeline?.postdromeEnd
            }
            onChange={handleEndDate}
          />
        </div>
      )}

      {hasPostdromeEnd && (
        <div
          className={
            styles.recoveryCompleted
          }
          role="status"
        >
          <span aria-hidden="true">
            ✓
          </span>

          <div>
            <strong>
              Recuperación registrada
            </strong>

            <small>
              {formatDateTime(
                timeline?.postdromeEnd,
              )}
            </small>
          </div>
        </div>
      )}
    </section>
  );
}