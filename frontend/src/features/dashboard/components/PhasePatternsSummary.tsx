import type {
  PhasePatterns,
  PhasePresencePattern,
} from '../utils/phasePatternCalculations';

import styles from '../dashboard.module.css';

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
      ? 'Todavía no hay crisis registradas'
      : `Presente en ${pattern.count} de ${totalCrises} crisis`;

  return (
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
          {icon}
        </span>

        <p>{label}</p>
      </div>

      <h3>
        {totalCrises > 0
          ? `${pattern.percentage}%`
          : 'Sin datos'}
      </h3>

      <span>
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
      ? 'Promedio cada 30 días'
      : 'Crisis en últimos 30 días';

  const frequencyDescription =
    patterns
      .averageCrisesPer30Days !==
    undefined
      ? `Calculado sobre ${patterns.observationPeriodDays} días de registros`
      : totalCrises > 1
        ? 'Se necesitan al menos 7 días entre registros para estimar un promedio'
        : 'Se necesitan más registros para estimar una frecuencia';

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="phase-patterns-title"
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
            styles.sectionHint
          }
        >
          Comparación entre crisis
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
              #
            </span>

            <p>
              {frequencyLabel}
            </p>
          </div>

          <h3>
            {frequencyValue}
          </h3>

          <span>
            {
              frequencyDescription
            }
          </span>
        </article>

        <PhaseCard
          label="Señales premonitorias"
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