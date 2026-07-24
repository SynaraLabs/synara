import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';


import {
  EpisodeCard,
} from './EpisodeCard';


import styles from '../history.module.css';





export function EpisodeList() {



  const history =
    useMigraineStore(
      state => state.history,
    );







  const sortedEpisodes =
    [...history]
      .sort(
        (a,b) =>
          new Date(b.createdAt).getTime()
          -
          new Date(a.createdAt).getTime(),
      );







  if(history.length === 0) {

    return (

      <section className={styles.emptyState}>

        <h3>
          Todavía no hay registros
        </h3>


        <p>
          Cuando registres una migraña,
          aparecerá aquí tu historial.
        </p>


      </section>

    );

  }







  return (

    <section className={styles.episodeList}>


      {
        sortedEpisodes.map(
          episode => (

            <EpisodeCard

              key={
                episode.id ??
                episode.createdAt
              }

              episode={episode}

            />

          ),
        )
      }


    </section>

  );

}
