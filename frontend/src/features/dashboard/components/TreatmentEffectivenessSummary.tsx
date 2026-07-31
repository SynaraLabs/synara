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
    return 'Sin registrar';
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

  const hasUsefulData =
    effectiveness.total > 0 ||
    patterns
      .averageResponseTimeMinutes !==
      undefined;

  if (!hasUsefulData) {
    return null;
  }

  const evaluatedDescription =
    effectiveness.total === 1
      ? '1 tratamiento evaluado'
      : `${effectiveness.total} tratamientos evaluados`;

  const favorableDescription =
    effectiveness.total > 0
      ? `${effectiveness.high} con respuesta alta · ${effectiveness.medium} moderada`
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
              : 'Sin registrar'}
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
    </section>
  );
}