import styles from '../history.module.css';

import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  triggerLabels,
  symptomLabels,
} from '../utils/migraineLabels';



interface Props {

  episode: MigraineEpisode;

}





export function EpisodeCard({
  episode,
}: Props) {



  const crisis =
    episode.crisis;



  const createdDate =
    new Date(
      episode.createdAt,
    ).toLocaleDateString(
      'es-AR',
      {
        day:'numeric',
        month:'long',
        year:'numeric',
      },
    );






  /*
    Tomamos el pico máximo de dolor
    registrado durante la crisis
  */
  const maxIntensity =
    crisis.intensityHistory.length > 0

      ?

      Math.max(
        ...crisis.intensityHistory.map(
          record => record.intensity,
        ),
      )

      :

      crisis.intensity;






  const formattedTriggers =
    episode.triggers.length > 0

      ?

      episode.triggers
        .map(
          trigger =>
            triggerLabels[trigger],
        )
        .join(', ')

      :

      'Sin triggers registrados';







  const formattedSymptoms =
    crisis.symptoms.length > 0

      ?

      crisis.symptoms
        .map(
          symptom =>
            symptomLabels[symptom],
        )
        .join(', ')

      :

      'Sin síntomas registrados';






  const medications =
    crisis.events?.filter(
      event =>
        event.type === 'medication',
    ) ?? [];








  return (

    <article className={styles.episodeCard}>


      <header className={styles.episodeHeader}>


        <div>


          <h3>
            Migraña
          </h3>


          <span>
            {createdDate}
          </span>


        </div>





        <strong>

          {maxIntensity}/10

        </strong>



      </header>









      <div className={styles.episodeInfo}>


        <p>

          <b>
            Dolor máximo:
          </b>{' '}

          {maxIntensity}/10


        </p>









        {
          crisis.intensityHistory.length > 0 && (


            <div>


              <p>

                <b>
                  Evolución del dolor:
                </b>


              </p>





              <ul>


                {
                  crisis.intensityHistory.map(
                    (record,index)=>(


                      <li
                        key={index}
                      >


                        {
                          new Date(
                            record.time,
                          ).toLocaleTimeString(
                            'es-AR',
                            {
                              hour:'2-digit',
                              minute:'2-digit',
                            },
                          )
                        }


                        {' → '}


                        {record.intensity}/10


                      </li>


                    )
                  )
                }


              </ul>


            </div>


          )
        }









        <p>

          <b>
            Duración:
          </b>{' '}


          {
            crisis.durationMinutes

              ?

              `${crisis.durationMinutes} minutos`

              :

              'Sin registrar'

          }


        </p>









        <p>

          <b>
            Síntomas:
          </b>{' '}


          {formattedSymptoms}


        </p>









        <p>

          <b>
            Triggers:
          </b>{' '}


          {formattedTriggers}


        </p>









        {
          medications.length > 0 && (


            <div>


              <p>

                <b>
                  Medicación durante la crisis:
                </b>


              </p>





              <ul>


                {
                  medications.map(
                    (event,index)=>(


                      <li
                        key={index}
                      >


                        {
                          new Date(
                            event.timestamp,
                          ).toLocaleTimeString(
                            'es-AR',
                            {
                              hour:'2-digit',
                              minute:'2-digit',
                            },
                          )
                        }


                        {' → '}


                        {
                          String(
                            event.data.medication ?? '',
                          )
                        }


                        {
                          event.data.dose &&

                          ` (${String(event.data.dose)})`

                        }


                      </li>


                    )
                  )
                }


              </ul>


            </div>


          )
        }









        {
          episode.postdrome.present && (


            <p>


              <b>
                Postdromo:
              </b>{' '}


              Registrado


            </p>


          )
        }







      </div>



    </article>


  );

}