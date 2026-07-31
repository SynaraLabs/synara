import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  getBasicMigrainePatterns,
} from '../utils/migrainePatternCalculations';

import styles from './InsightsSummary.module.css';

const insightIcons = {
  episodes: '▥',
  intensity: '◉',
  duration: '◷',
  lastEpisode: '⌁',
};

const formatDuration = (
  totalMinutes?: number,
): string => {
  if (totalMinutes === undefined) {
    return 'Sin datos';
  }

  if (totalMinutes < 60) {
    return `${Math.round(
      totalMinutes,
    )} min`;
  }

  const hours =
    Math.floor(
      totalMinutes / 60,
    );

  const minutes =
    Math.round(
      totalMinutes % 60,
    );

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
};

const formatLastCrisisDate = (
  value?: string,
): {
  date: string;
  year: string;
} => {
  if (!value) {
    return {
      date: 'Sin registros',
      year:
        'Todavía no hay crisis',
    };
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return {
      date: 'Sin registros',
      year:
        'Fecha no disponible',
    };
  }

  return {
    date:
      date.toLocaleDateString(
        'es-AR',
        {
          day: '2-digit',
          month: 'short',
        },
      ),

    year:
      date.toLocaleDateString(
        'es-AR',
        {
          year: 'numeric',
        },
      ),
  };
};

export function InsightsSummary() {
  const history =
    useMigraineStore(
      state => state.history,
    );

  const patterns =
    getBasicMigrainePatterns(
      history,
    );

  const lastCrisis =
    formatLastCrisisDate(
      patterns.lastCrisisDate,
    );

  const recordDescription =
    patterns.totalRecords === 1
      ? '1 registro clínico'
      : `${patterns.totalRecords} registros clínicos`;

  const insights = [
    {
      label:
        'Crisis registradas',

      value:
        String(
          patterns.crisisCount,
        ),

      description:
        recordDescription,

      icon:
        insightIcons.episodes,
    },
    {
      label:
        'Intensidad habitual',

      value:
        patterns.crisisCount > 0
          ? `${patterns.averageMaxPain}/10`
          : 'Sin datos',

      description:
        patterns.crisisCount > 0
          ? `Máxima: ${patterns.maximumPain}/10`
          : 'Todavía no hay crisis',

      icon:
        insightIcons.intensity,
    },
    {
      label:
        'Duración habitual',

      value:
        formatDuration(
          patterns
            .averageCrisisDurationMinutes,
        ),

      description:
        patterns
          .averageCrisisDurationMinutes !==
        undefined
          ? 'Promedio por crisis'
          : 'Sin crisis finalizadas',

      icon:
        insightIcons.duration,
    },
    {
      label:
        'Última crisis',

      value:
        lastCrisis.date,

      description:
        lastCrisis.year,

      icon:
        insightIcons.lastEpisode,
    },
  ];

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby="insights-title"
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
            Resumen personal
          </p>

          <h2 id="insights-title">
            Tu panorama
          </h2>
        </div>

        <span
          className={
            styles.hint
          }
        >
          Se actualiza con tus episodios
        </span>
      </div>

      <div
        className={
          styles.grid
        }
      >
        {insights.map(
          insight => (
            <article
              key={
                insight.label
              }
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
                  {
                    insight.icon
                  }
                </span>

                <p
                  className={
                    styles.label
                  }
                >
                  {insight.label}
                </p>
              </div>

              <strong
                className={
                  styles.value
                }
              >
                {insight.value}
              </strong>

              <span
                className={
                  styles.description
                }
              >
                {
                  insight.description
                }
              </span>
            </article>
          ),
        )}
      </div>
    </section>
  );
}