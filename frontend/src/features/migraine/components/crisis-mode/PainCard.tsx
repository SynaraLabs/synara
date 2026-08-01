import {
  useEffect,
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

import type {
  CrisisPhase,
  PainIntensity,
} from '../../types/migraine.types';

interface Props {
  crisis: CrisisPhase;

  onRegister: (
    intensity: PainIntensity,
  ) => void;

  onUndo: () => void;
}

const PAIN_LEVELS:
  readonly PainIntensity[] = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
];

const getPainDescription = (
  intensity: PainIntensity,
): string => {
  if (intensity === 0) {
    return 'Sin dolor';
  }

  if (intensity <= 3) {
    return 'Dolor leve';
  }

  if (intensity <= 6) {
    return 'Dolor moderado';
  }

  if (intensity <= 8) {
    return 'Dolor intenso';
  }

  return 'Dolor muy intenso';
};

const formatTime = (
  value?: string,
): string => {
  if (!value) {
    return 'Sin registrar';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Sin registrar';
  }

  return date.toLocaleTimeString(
    'es-AR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

export function PainCard({
  crisis,
  onRegister,
  onUndo,
}: Props) {
  const intensityHistory =
    crisis.intensityHistory ?? [];

  const lastRecord =
    intensityHistory.at(-1);

  const [
    draftIntensity,
    setDraftIntensity,
  ] = useState<PainIntensity>(
    crisis.intensity,
  );

  const [
    hasPendingSelection,
    setHasPendingSelection,
  ] = useState(false);

  useEffect(() => {
    if (hasPendingSelection) {
      return;
    }

    setDraftIntensity(
      crisis.intensity,
    );
  }, [
    crisis.intensity,
    hasPendingSelection,
  ]);

  const selectIntensity = (
    intensity: PainIntensity,
  ) => {
    setDraftIntensity(intensity);
    setHasPendingSelection(true);
  };

  const handleRegister = () => {
    if (!hasPendingSelection) {
      return;
    }

    onRegister(draftIntensity);
    setHasPendingSelection(false);
  };

  const handleUndo = () => {
    onUndo();
    setHasPendingSelection(false);
  };

  return (
    <section
      className={styles.card}
      aria-labelledby="current-pain-title"
    >
      <header>
        <h2 id="current-pain-title">
          Dolor actual
        </h2>

        <p>
          Elegí una intensidad. No se
          guardará hasta que confirmes
          la actualización.
        </p>
      </header>

      <div aria-live="polite">
        <strong>
          {draftIntensity}/10
        </strong>

        <p>
          {getPainDescription(
            draftIntensity,
          )}
        </p>

        {hasPendingSelection && (
          <span>
            Sin guardar
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Seleccionar intensidad del dolor"
      >
        {PAIN_LEVELS.map(
          intensity => (
            <button
              key={intensity}
              type="button"
              onClick={() =>
                selectIntensity(
                  intensity,
                )
              }
              aria-pressed={
                draftIntensity ===
                intensity
              }
              aria-label={`Seleccionar dolor ${intensity} de 10`}
            >
              {intensity}
            </button>
          ),
        )}
      </div>

      <label>
        Ajustar intensidad

        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={draftIntensity}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={
            draftIntensity
          }
          aria-valuetext={`${draftIntensity} de 10, ${getPainDescription(
            draftIntensity,
          )}`}
          onChange={event =>
            selectIntensity(
              Number(
                event.target.value,
              ) as PainIntensity,
            )
          }
        />
      </label>

      <button
        type="button"
        className={styles.primary}
        disabled={
          !hasPendingSelection
        }
        onClick={handleRegister}
      >
        Registrar actualización
      </button>

      {lastRecord ? (
        <aside aria-live="polite">
          <p>
            <b>
              Última actualización:
            </b>{' '}

            {formatTime(
              lastRecord.time,
            )}
            {' · '}
            {lastRecord.intensity}/10
          </p>

          <p>
            Actualizaciones registradas:{' '}

            {
              intensityHistory.length
            }
          </p>

          <button
            type="button"
            className={
              styles.secondary
            }
            onClick={handleUndo}
          >
            Deshacer última actualización
          </button>
        </aside>
      ) : (
        <p>
          Todavía no registraste una
          actualización del dolor.
        </p>
      )}
    </section>
  );
}