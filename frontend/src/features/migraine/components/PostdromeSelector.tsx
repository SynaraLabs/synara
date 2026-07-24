import styles from '../migraine.module.css';


import type {
  PostdromeSymptom,
} from '../types/migraine.types';



import {
  useMigraineStore,
} from '../store/migraine.store';







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








export function PostdromeSelector() {



  const postdrome =
    useMigraineStore(
      state => state.episode.postdrome,
    );



  const updatePostdrome =
    useMigraineStore(
      state => state.updatePostdrome,
    );








  const toggleSymptom = (

    symptom:PostdromeSymptom,

  )=>{



    const updatedSymptoms =


      postdrome.symptoms.includes(
        symptom,
      )


      ?


      postdrome.symptoms.filter(
        item => item !== symptom,
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







      <label>


        Horas de recuperación:



        <input


          type="number"


          min="0"




          value={

            postdrome.recoveryHours ?? ''

          }






          onChange={(e)=>{



            updatePostdrome({



              ...postdrome,




              recoveryHours:


                Number(
                  e.target.value,
                ),




            });



          }}



        />



      </label>



    </section>

  );

}