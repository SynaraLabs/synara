import type {
  PhasePatterns,
  PhasePresencePattern,
} from '../utils/phasePatternCalculations';

import styles from './PhasePatternsSummary.module.css';

interface Props {
  patterns: PhasePatterns;

  totalCrises: number;
}

interface PhaseCardProps {
  label: string;

  icon: string;

  pattern: PhasePresencePattern;

  totalCrises: number;
}

function PhaseCard({
  label,
  icon,
  pattern,
  totalCrises,
}: PhaseCardProps) {
  const description =
    totalCrises === 0
      ? 'Todavía no hay crisis'
      : `En ${pattern.count} de ${totalCrises} crisis`;

  return (
    <article
      className={
        styles.card
      }
    >
      <div
        className={
          styles.cardHeader
        }
      >
        <span
          className={
            styles.icon
          }
          aria-hidden="true"
        >
          {icon}
        </span>

        <p
          className={
            styles.label
          }
        >
          {label}
        </p>
      </div>

      <strong
        className={
          styles.value
        }
      >
        {totalCrises > 0
          ? `${pattern.percentage}%`
          : 'Sin datos'}
      </strong>

      <span
        className={
          styles.description
        }
      >
        {description}
      </span>
    </article>
  );
}

export function PhasePatternsSummary({
  patterns,
  totalCrises,
}: Props) {
  const frequencyValue =
    patterns
      .averageCrisesPer30Days !==
    undefined
      ? String(
          patterns
            .averageCrisesPer30Days,
        )
      : String(
          patterns
            .crisesLast30Days,
        );

  const frequencyLabel =
    patterns
      .averageCrisesPer30Days !==
    undefined
      ? 'Promedio mensual'
      : 'Últimos 30 días';

  const frequencyDescription =
    patterns
      .averageCrisesPer30Days !==
    undefined
      ? `Estimado con ${patterns.observationPeriodDays} días`
      : totalCrises > 1
        ? 'Faltan más días para estimar el promedio'
        : 'Se necesitan más registros';

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="phase-patterns-title"
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Perfil de los episodios
          </p>

          <h2
            id="phase-patterns-title"
          >
            Frecuencia y fases
          </h2>
        </div>

        <span
          className={
            styles.hint
          }
        >
          Comparación entre crisis
        </span>
      </div>

      <div
        className={
          styles.grid
        }
      >
        <article
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <span
              className={
                styles.icon
              }
              aria-hidden="true"
            >
              #
            </span>

            <p
              className={
                styles.label
              }
            >
              {frequencyLabel}
            </p>
          </div>

          <strong
            className={
              styles.value
            }
          >
            {frequencyValue}
          </strong>

          <span
            className={
              styles.description
            }
          >
            {
              frequencyDescription
            }
          </span>
        </article>

        <PhaseCard
          label="Premonitorio"
          icon="◌"
          pattern={
            patterns.premonitory
          }
          totalCrises={
            totalCrises
          }
        />

        <PhaseCard
          label="Aura"
          icon="◉"
          pattern={
            patterns.aura
          }
          totalCrises={
            totalCrises
          }
        />

        <PhaseCard
          label="Postdromo"
          icon="↘"
          pattern={
            patterns.postdrome
          }
          totalCrises={
            totalCrises
          }
        />
      </div>
    </section>
  );
}