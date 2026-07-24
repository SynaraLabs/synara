import styles from '../dashboard.module.css';



import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';







export function RecentEpisodes() {



  const history =
    useMigraineStore(
      state => state.history,
    );





  const episodes =

    history

      .slice()

      .reverse()

      .slice(0,5)

      .map((episode)=>{


        const maxIntensity =

          episode.crisis.intensityHistory.length > 0

          ?

          Math.max(

            ...episode.crisis.intensityHistory.map(

              item => item.intensity

            )

          )

          :

          episode.crisis.intensity;



        return {


          id:
            episode.id,


          type:
            'Migraña',



          date:

            new Date(

              episode.createdAt

            ).toLocaleDateString(),




          detail:

            `Duración: ${
              
              episode.crisis.durationMinutes ?? '—'

            } min · Intensidad máxima: ${
              
              maxIntensity

            }/10`,



        };


      });









  return (


    <section className={styles.section}>


      <h2>

        Últimos registros

      </h2>







      {


        episodes.length === 0


        ?


        <p>

          Todavía no registraste episodios.

        </p>


        :


        <div className={styles.episodesList}>


          {


            episodes.map((episode)=>(


              <article


                key={episode.id}


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


            ))


          }



        </div>


      }



    </section>


  );

}