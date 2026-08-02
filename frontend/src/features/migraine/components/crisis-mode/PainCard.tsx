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
    return 'Sin hora';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin hora';
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
      className={`${styles.card} ${styles.painCard}`}
      aria-labelledby="current-pain-title"
    >
      <header
        className={
          styles.painHeader
        }
      >
        <div>
          <p
            className={
              styles.painEyebrow
            }
          >
            Ahora
          </p>

          <h2 id="current-pain-title">
            ¿Cuánto te duele?
          </h2>
        </div>

        <p>
          Elegí un número y confirmalo.
        </p>
      </header>

      <div
        className={styles.painValue}
        aria-live="polite"
      >
        <strong>
          {draftIntensity}
          <small>/10</small>
        </strong>

        <p>
          {getPainDescription(
            draftIntensity,
          )}
        </p>

        {hasPendingSelection && (
          <span
            className={
              styles.pendingBadge
            }
          >
            Sin guardar
          </span>
        )}
      </div>

      <div
        className={styles.painScale}
        role="group"
        aria-label="Intensidad rápida del dolor"
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
                  intensity &&
                (
                  hasPendingSelection ||
                  Boolean(lastRecord)
                )
              }
              aria-label={`Seleccionar dolor ${intensity} de 10`}
            >
              {intensity}
            </button>
          ),
        )}
      </div>

      <label
        className={
          styles.painSlider
        }
      >
        Ajustar con deslizador

        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={draftIntensity}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={draftIntensity}
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

      {lastRecord ? (
        <aside
          className={
            styles.painHistory
          }
          aria-live="polite"
        >
          <p>
            <b>Último:</b>{' '}
            {lastRecord.intensity}/10
            {' · '}
            {formatTime(lastRecord.time)}
            {' · '}
            {intensityHistory.length}{' '}
            {intensityHistory.length === 1
              ? 'registro'
              : 'registros'}
          </p>

          <button
            type="button"
            className={styles.secondary}
            onClick={handleUndo}
          >
            Deshacer
          </button>
        </aside>
      ) : (
        <p
          className={
            styles.painFirstUpdate
          }
        >
          Esta será la primera
          actualización del dolor.
        </p>
      )}

      <button
        type="button"
        className={styles.primary}
        disabled={!hasPendingSelection}
        onClick={handleRegister}
      >
        {hasPendingSelection
          ? `Guardar dolor ${draftIntensity}/10`
          : lastRecord
            ? 'Dolor actual guardado'
            : 'Elegí una intensidad'}
      </button>
    </section>
  );
}