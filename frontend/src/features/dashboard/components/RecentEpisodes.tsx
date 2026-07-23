import styles from '../dashboard.module.css';

const episodes = [
  {
    type: 'Migraña',
    date: 'Hace 5 días',
    detail: 'Duración: 8 horas · Intensidad: 7/10',
  },
  {
    type: 'Ansiedad',
    date: 'Ayer',
    detail: 'Intensidad: 6/10',
  },
  {
    type: 'Journal',
    date: 'Hoy',
    detail: 'Me sentí más cansada durante la tarde.',
  },
];

export function RecentEpisodes() {
  return (
    <section className={styles.section}>

      <h2>
        Últimos registros
      </h2>

      <div className={styles.episodesList}>

        {episodes.map((episode) => (
          <article
            key={episode.type}
            className={styles.episodeCard}
          >

            <div>

              <h3>
                {episode.type}
              </h3>

              <p>
                {episode.detail}
              </p>

            </div>

            <span>
              {episode.date}
            </span>

          </article>
        ))}

      </div>

    </section>
  );
}