import styles from '../migraine.module.css';

import type {
  PainIntensity,
} from '../types/migraine.types';


import {
  useMigraineStore,
} from '../store/migraine.store';





export function PainScale() {



  const intensity =
    useMigraineStore(
      state =>
        state.episode.crisis.intensity,
    );



  const crisis =
    useMigraineStore(
      state =>
        state.episode.crisis,
    );



  const updateCrisis =
    useMigraineStore(
      state =>
        state.updateCrisis,
    );







  const handleChange = (

    level: PainIntensity,

  ) => {



    updateCrisis({


      ...crisis,



      intensity:
        level,



      intensityHistory:[


        ...crisis.intensityHistory,



        {


          time:
            new Date().toISOString(),



          intensity:
            level,



        },


      ],



    });



  };








  return (



    <div className={styles.painScale}>


      <h3>
        Intensidad del dolor
      </h3>




      <div className={styles.scaleButtons}>


        {

          Array.from(

            { length: 11 },

            (_, index) => index,

          )


          .map((level) => (



            <button


              key={level}


              type="button"



              onClick={() =>


                handleChange(

                  level as PainIntensity,

                )


              }



              className={

                intensity === level

                ?

                styles.selectedPain

                :

                ''

              }



            >


              {level}


            </button>



          ))

        }


      </div>





      <div className={styles.scaleLabels}>


        <span>
          Sin dolor
        </span>



        <span>
          Máximo dolor
        </span>


      </div>




    </div>



  );

}