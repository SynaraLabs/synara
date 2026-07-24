import styles from '../dashboard.module.css';


import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';





export function InsightsSummary(){



  const history =
    useMigraineStore(
      state => state.history,
    );







  const totalEpisodes =
    history.length;






  const averageIntensity =

    totalEpisodes > 0

    ?

    (
      history.reduce(

        (
          total,
          episode,

        )=>

          total + episode.crisis.intensity,

        0,

      )

      /

      totalEpisodes

    ).toFixed(1)


    :

    '0';









  const averageDuration =


    totalEpisodes > 0


    ?


    Math.round(

      history.reduce(

        (
          total,
          episode,

        ) =>


          total +

          (
            episode.crisis.durationMinutes
            ??
            0
          ),


        0,

      )

      /

      totalEpisodes

    )


    :


    0;









  const lastEpisode =

    history.length > 0

    ?


    new Date(

      history[history.length - 1]
      .createdAt,

    )

    :


    null;








  return (


    <section className={styles.section}>


      <h2>

        Insights SYNARA

      </h2>





      <div className={styles.summaryGrid}>



        <article className={styles.summaryCard}>


          <p>
            Episodios
          </p>


          <h3>
            {totalEpisodes}
          </h3>


          <span>
            Registrados
          </span>


        </article>







        <article className={styles.summaryCard}>


          <p>
            Intensidad promedio
          </p>


          <h3>
            {averageIntensity}/10
          </h3>


          <span>
            Histórico
          </span>


        </article>







        <article className={styles.summaryCard}>


          <p>
            Duración promedio
          </p>


          <h3>
            {averageDuration}
          </h3>


          <span>
            Minutos
          </span>


        </article>







        <article className={styles.summaryCard}>


          <p>
            Última crisis
          </p>


          <h3>

            {
              lastEpisode

              ?

              lastEpisode.toLocaleDateString()

              :

              '-'

            }

          </h3>


          <span>
            Fecha
          </span>


        </article>



      </div>


    </section>


  );

}