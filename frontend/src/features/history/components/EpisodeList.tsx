import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  EpisodeCard,
} from './EpisodeCard';

import styles from '../history.module.css';

function getEpisodeTimestamp(
  createdAt: string,
): number {
  const timestamp =
    new Date(createdAt).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

export function EpisodeList() {
  const history = useMigraineStore(
    state => state.history,
  );

  const sortedEpisodes = [
    ...history,
  ].sort(
    (firstEpisode, secondEpisode) =>
      getEpisodeTimestamp(
        secondEpisode.createdAt,
      ) -
      getEpisodeTimestamp(
        firstEpisode.createdAt,
      ),
  );

  if (sortedEpisodes.length === 0) {
    return (
      <section
        className={styles.emptyState}
        aria-labelledby="empty-history-title"
      >
        <h3 id="empty-history-title">
          Todavía no hay registros
        </h3>

        <p>
          Cuando completes un episodio
          de migraña, aparecerá acá para
          que puedas revisar su
          evolución.
        </p>
      </section>
    );
  }

  return (
    <section
      className={styles.episodeList}
      aria-label="Episodios de migraña registrados"
    >
      {sortedEpisodes.map(
        episode => (
          <EpisodeCard
            key={
              episode.id ??
              episode.createdAt
            }
            episode={episode}
          />
        ),
      )}
    </section>
  );
}
