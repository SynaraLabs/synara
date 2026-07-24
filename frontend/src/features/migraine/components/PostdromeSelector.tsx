import { useState } from 'react';

import styles from '../migraine.module.css';


import type {
  PostdromeSymptom,
} from '../types/migraine.types';



import {
  useMigraineStore,
} from '../store/migraine.store';



import {
  PhaseDateSelector,
} from './common/PhaseDateSelector';







const symptoms: {
  value: PostdromeSymptom;
  label: string;
}[] = [


  {
    value:'fatigue',
    label:'Cansancio extremo',
  },


  {
    value:'brainFog',
    label:'Niebla mental',
  },


  {
    value:'weakness',
    label:'Debilidad corporal',
  },


  {
    value:'moodChange',
    label:'Cambios emocionales',
  },


  {
    value:'residualSensitivity',
    label:'Sensibilidad residual',
  },


  {
    value:'neckDiscomfort',
    label:'Molestia cervical',
  },


];









export function PostdromeSelector(){



  const [
    showStartDate,
    setShowStartDate,
  ] =
    useState(false);




  const postdrome =
    useMigraineStore(
      state=>state.episode.postdrome,
    );



  const timeline =
    useMigraineStore(
      state=>state.episode.timeline,
    );



  const updatePostdrome =
    useMigraineStore(
      state=>state.updatePostdrome,
    );



  const updateTimeline =
    useMigraineStore(
      state=>state.updateTimeline,
    );







  const toggleSymptom = (

    symptom:PostdromeSymptom,

  )=>{



    const wasEmpty =
      postdrome.symptoms.length === 0;





    const updatedSymptoms =


      postdrome.symptoms.includes(
        symptom,
      )


      ?


      postdrome.symptoms.filter(

        item=>item !== symptom,

      )


      :


      [

        ...postdrome.symptoms,

        symptom,

      ];








    updatePostdrome({


      ...postdrome,


      present:
        updatedSymptoms.length > 0,


      symptoms:
        updatedSymptoms,


    });







    if(

      wasEmpty

      &&

      updatedSymptoms.length > 0

    ){

      setShowStartDate(true);

    }



  };







  const handleStartDate = (

    date:string,

  )=>{


    updateTimeline({


      postdromeStart:

        timeline?.postdromeStart
        ??
        date,


    });


  };







  const handleRecoveryHours = (

    value:string,

  )=>{


    updatePostdrome({


      ...postdrome,


      recoveryHours:

        Number(value),


    });



  };







  const handleEndDate = (

    date:string,

  )=>{


    updateTimeline({


      postdromeEnd:

        timeline?.postdromeEnd
        ??
        date,


    });


  };








  return (


    <section>


      <h3>
        Después de la crisis
      </h3>




      <p>
        Algunas personas continúan con síntomas
        después de que baja el dolor.
      </p>







      <div className={styles.symptomGrid}>


        {

          symptoms.map(item=>(


            <label

              key={item.value}

              className={
                styles.symptomOption
              }


            >


              <input


                type="checkbox"


                checked={

                  postdrome.symptoms.includes(
                    item.value,
                  )

                }


                onChange={()=>


                  toggleSymptom(
                    item.value,
                  )

                }


              />



              <span>

                {item.label}

              </span>


            </label>


          ))

        }


      </div>







      {

        showStartDate

        &&

        (

          <PhaseDateSelector


            title="¿Cuándo empezaron estos síntomas?"


            value={
              timeline?.postdromeStart
            }


            onChange={
              handleStartDate
            }


          />

        )

      }








      <label>


        Horas de recuperación:



        <input


          type="number"


          min="0"



          value={

            postdrome.recoveryHours ?? ''

          }



          onChange={(e)=>

            handleRecoveryHours(
              e.target.value,
            )

          }



        />


      </label>








      {

        postdrome.present

        &&

        (

          <PhaseDateSelector


            title="¿Cuándo sentiste recuperación completa?"


            value={
              timeline?.postdromeEnd
            }


            onChange={
              handleEndDate
            }


          />

        )

      }



    </section>

  );


}