import styles from './crisis-mode.module.css';

import type {
  CrisisPhase,
  PainIntensity,
} from '../../types/migraine.types';


interface Props {
  crisis: CrisisPhase;

  onChange: (
    value: string,
  ) => void;

  onRegister: () => void;
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
  onChange,
  onRegister,
}: Props) {
  const intensityHistory =
    crisis.intensityHistory ?? [];

  const lastRecord =
    intensityHistory.at(-1);


  const handleQuickRegister = (
    intensity: PainIntensity,
  ) => {
    /*
     * Zustand actualiza el store de
     * manera sincrónica. CrisisMode
     * vuelve a leer el estado más
     * reciente antes de registrar.
     */
    onChange(
      String(intensity),
    );

    onRegister();
  };


  return (
    <section
      className={
        styles.card
      }
      aria-labelledby="current-pain-title"
    >
      <header>
        <h2 id="current-pain-title">
          Dolor actual
        </h2>

        <p>
          Tocá un número para guardar
          rápidamente la intensidad
          actual.
        </p>
      </header>


      <div aria-live="polite">
        <strong>
          {crisis.intensity}/10
        </strong>

        <p>
          {getPainDescription(
            crisis.intensity,
          )}
        </p>
      </div>


      <div
        role="group"
        aria-label="Intensidad rápida del dolor"
      >
        {PAIN_LEVELS.map(
          intensity => (
            <button
              key={
                intensity
              }
              type="button"
              onClick={() =>
                handleQuickRegister(
                  intensity,
                )
              }
              aria-pressed={
                crisis.intensity ===
                intensity
              }
              aria-label={`Registrar dolor ${intensity} de 10`}
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
          value={
            crisis.intensity
          }
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={
            crisis.intensity
          }
          aria-valuetext={`${crisis.intensity} de 10, ${getPainDescription(
            crisis.intensity,
          )}`}
          onChange={event =>
            onChange(
              event.target.value,
            )
          }
        />
      </label>


      <button
        type="button"
        className={
          styles.primary
        }
        onClick={
          onRegister
        }
      >
        Guardar intensidad actual
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