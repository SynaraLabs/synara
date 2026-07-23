import styles from './crisis-mode.module.css';

import type {
  CrisisSymptom,
  PainIntensity,
  CrisisPhase,
} from '../../types/migraine.types';


import {
  useMigraineStore,
} from '../../store/migraine.store';



interface Props {

  onExit?: () => void;

}





const quickSymptoms: {
  value:CrisisSymptom;
  label:string;
}[] = [

  {
    value:'lightSensitivity',
    label:'Luz molesta',
  },

  {
    value:'soundSensitivity',
    label:'Sonidos molestos',
  },

  {
    value:'nausea',
    label:'Náuseas',
  },

  {
    value:'dizziness',
    label:'Mareo',
  },

  {
    value:'confusion',
    label:'Niebla mental',
  },

];






export function CrisisMode({

  onExit,

}:Props) {



  const crisis =
    useMigraineStore(
      state => state.episode.crisis,
    );



  const updateCrisis =
    useMigraineStore(
      state => state.updateCrisis,
    );







  const updatePain = (
    value:string,
  )=>{


    const intensity =
      Number(value) as PainIntensity;



    const updated:CrisisPhase = {


      ...crisis,


      active:true,


      intensity,



      intensityHistory:[

        ...crisis.intensityHistory,


        {

          time:
            new Date().toISOString(),


          intensity,

        },

      ],


    };



    updateCrisis(updated);


  };








  const toggleSymptom = (

    symptom:CrisisSymptom,

  )=>{



    const updatedSymptoms =


      crisis.symptoms.includes(
        symptom,
      )


      ?


      crisis.symptoms.filter(
        item => item !== symptom,
      )


      :


      [

        ...crisis.symptoms,

        symptom,

      ];





    updateCrisis({

      ...crisis,


      symptoms:
        updatedSymptoms,


    });



  };








  return (

    <section className={styles.container}>


      <header>


        <h1>
          Crisis activa
        </h1>


        <p>
          Registro rápido durante una migraña.
        </p>


      </header>







      <div className={styles.card}>


        <h2>
          Dolor actual
        </h2>



        <strong>

          {crisis.intensity}/10

        </strong>





        <input

          type="range"

          min="0"

          max="10"

          value={
            crisis.intensity
          }


          onChange={(e)=>

            updatePain(
              e.target.value,
            )

          }


        />



      </div>








      <div className={styles.card}>


        <h2>
          Síntomas rápidos
        </h2>





        <div className={styles.grid}>


        {


          quickSymptoms.map(item=>(


            <button


              key={
                item.value
              }


              type="button"



              className={


                crisis.symptoms.includes(
                  item.value,
                )


                ?


                styles.active


                :


                ''


              }



              onClick={()=>


                toggleSymptom(
                  item.value,
                )


              }


            >


              {item.label}


            </button>


          ))


        }



        </div>


      </div>









      <button

        type="button"

        className={styles.primary}


        onClick={()=>{

          updateCrisis({

            ...crisis,

            active:true,

          });

        }}

      >


        Registrar actualización


      </button>









      {

        onExit &&


        (

          <button


            type="button"


            className={styles.secondary}


            onClick={onExit}


          >

            Salir de crisis


          </button>


        )

      }





    </section>

  );

}