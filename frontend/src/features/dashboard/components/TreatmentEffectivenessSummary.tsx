import type {
  TreatmentPatterns,
} from '../utils/treatmentPatternCalculations';

import styles from '../dashboard.module.css';

interface Props {
  patterns: TreatmentPatterns;
}

const formatResponseTime = (
  minutes?: number,
): string => {
  if (minutes === undefined) {
    return 'Sin datos';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
};

export function TreatmentEffectivenessSummary({
  patterns,
}: Props) {
  const effectiveness =
    patterns.effectiveness;

  const evaluatedDescription =
    effectiveness.total === 1
      ? '1 tratamiento con resultado registrado'
      : `${effectiveness.total} tratamientos con resultado registrado`;

  const favorableDescription =
    effectiveness.total > 0
      ? `${effectiveness.high} funcionaron mucho · ${effectiveness.medium} moderadamente`
      : 'Todavía no hay respuestas evaluadas';

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="treatment-effectiveness-title"
    >
      <div
        className={
          styles.sectionHeader
        }
      >
        <div>
          <p
            className={
              styles.sectionEyebrow
            }
          >
            Respuesta percibida
          </p>

          <h2
            id="treatment-effectiveness-title"
          >
            Efectividad de tratamientos
          </h2>
        </div>

        <span
          className={
            styles.sectionHint
          }
        >
          Según tus registros
        </span>
      </div>

      <div
        className={
          styles.summaryGrid
        }
      >
        <article
          className={
            styles.summaryCard
          }
        >
          <div
            className={
              styles.summaryCardHeader
            }
          >
            <span
              className={
                styles.summaryIcon
              }
              aria-hidden="true"
            >
              ✓
            </span>

            <p>
              Respuesta favorable
            </p>
          </div>

          <h3>
            {effectiveness
              .positivePercentage !==
            undefined
              ? `${effectiveness.positivePercentage}%`
              : 'Sin datos'}
          </h3>

          <span>
            {
              favorableDescription
            }
          </span>
        </article>

        <article
          className={
            styles.summaryCard
          }
        >
          <div
            className={
              styles.summaryCardHeader
            }
          >
            <span
              className={
                styles.summaryIcon
              }
              aria-hidden="true"
            >
              ◷
            </span>

            <p>
              Tiempo hasta mejoría
            </p>
          </div>

          <h3>
            {formatResponseTime(
              patterns
                .averageResponseTimeMinutes,
            )}
          </h3>

          <span>
            Promedio de los tiempos
            registrados
          </span>
        </article>

        <article
          className={
            styles.summaryCard
          }
        >
          <div
            className={
              styles.summaryCardHeader
            }
          >
            <span
              className={
                styles.summaryIcon
              }
              aria-hidden="true"
            >
              +
            </span>

            <p>
              Respuestas evaluadas
            </p>
          </div>

          <h3>
            {effectiveness.total}
          </h3>

          <span>
            {
              evaluatedDescription
            }
          </span>
        </article>
      </div>

      {effectiveness.total > 0 && (
        <p
          className={
            styles.sectionHint
          }
        >
          La efectividad refleja tu
          percepción registrada y no
          reemplaza una evaluación
          profesional.
        </p>
      )}
    </section>
  );
}