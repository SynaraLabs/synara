import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import styles from '../dashboard.module.css';

const insightIcons = {
  episodes: '▥',
  intensity: '◉',
  duration: '◷',
  lastEpisode: '⌁',
};

function formatDuration(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

export function InsightsSummary() {
  const history = useMigraineStore(
    state => state.history,
  );

  const totalEpisodes = history.length;

  const averageIntensity =
    totalEpisodes > 0
      ? (
          history.reduce(
            (total, episode) =>
              total +
              (episode.crisis?.intensity ?? 0),
            0,
          ) / totalEpisodes
        ).toFixed(1)
      : '0';

  const averageDurationMinutes =
    totalEpisodes > 0
      ? Math.round(
          history.reduce(
            (total, episode) =>
              total +
              (
                episode.crisis
                  ?.durationMinutes ?? 0
              ),
            0,
          ) / totalEpisodes,
        )
      : 0;

  const lastEpisode =
    totalEpisodes > 0
      ? new Date(
          history[totalEpisodes - 1]
            .createdAt,
        )
      : null;

  const insights = [
    {
      label: 'Episodios',
      value: String(totalEpisodes),
      description:
        totalEpisodes === 1
          ? 'Episodio registrado'
          : 'Episodios registrados',
      icon: insightIcons.episodes,
    },
    {
      label: 'Intensidad promedio',
      value: `${averageIntensity}/10`,
      description: 'Según tu historial',
      icon: insightIcons.intensity,
    },
    {
      label: 'Duración promedio',
      value: formatDuration(
        averageDurationMinutes,
      ),
      description: 'Tiempo de crisis',
      icon: insightIcons.duration,
    },
    {
      label: 'Última crisis',
      value: lastEpisode
        ? lastEpisode.toLocaleDateString(
            'es-AR',
            {
              day: '2-digit',
              month: 'short',
            },
          )
        : 'Sin registros',
      description: lastEpisode
        ? lastEpisode.toLocaleDateString(
            'es-AR',
            {
              year: 'numeric',
            },
          )
        : 'Todavía no hay episodios',
      icon: insightIcons.lastEpisode,
    },
  ];

  return (
    <section
      className={styles.section}
      aria-labelledby="insights-title"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p
            className={
              styles.sectionEyebrow
            }
          >
            Tendencias personales
          </p>

          <h2 id="insights-title">
            Insights SYNARA
          </h2>
        </div>

        <span
          className={styles.sectionHint}
        >
          Calculados con tus episodios
        </span>
      </div>

      <div className={styles.summaryGrid}>
        {insights.map(insight => (
          <article
            key={insight.label}
            className={styles.summaryCard}
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
                {insight.icon}
              </span>

              <p>{insight.label}</p>
            </div>

            <h3>{insight.value}</h3>

            <span>
              {insight.description}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}