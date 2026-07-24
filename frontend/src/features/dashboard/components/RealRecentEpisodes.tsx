import styles from '../dashboard.module.css';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';



export function RealRecentEpisodes(){


  const history =
    useMigraineStore(
      state => state.history,
    );



  const episodes =
    history
      .slice()
      .reverse()
      .slice(0,5);





  return (

    <section className={styles.section}>


      <h2>
        Últimos registros
      </h2>



      {
        episodes.length === 0 ?


        (

          <p>
            Todavía no hay episodios registrados.
          </p>

        )


        :


        (

          <div className={styles.episodesList}>


          {

          episodes.map((episode)=>(


            <article

              key={episode.id}

              className={styles.episodeCard}

            >


              <div>


                <h3>
                  Migraña
                </h3>



                <p>

                  Intensidad:
                  {' '}
                  {episode.crisis.intensity}/10

                </p>



                <p>

                  Duración:
                  {' '}

                  {
                    episode.crisis.durationMinutes
                    ??
                    0
                  }
                  {' '}
                  minutos

                </p>


              </div>



              <span>

                {
                  new Date(
                    episode.createdAt,
                  )
                  .toLocaleDateString()

                }

              </span>



            </article>


          ))

          }


          </div>

        )


      }


    </section>


  );

}