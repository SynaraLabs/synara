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
      state =>
        state.episode.crisis,
    );





  const updateCrisis =
    useMigraineStore(
      state =>
        state.updateCrisis,
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


    };




    updateCrisis(updated);


  };









  const registerPainUpdate = ()=>{


    const now =
      new Date().toISOString();





    const updated:CrisisPhase = {


      ...crisis,



      intensityHistory:[


        ...crisis.intensityHistory,



        {

          time:now,


          intensity:
            crisis.intensity,


        },


      ],





      events:[


        ...(crisis.events ?? []),



        {


          id:
            crypto.randomUUID(),



          type:
            'intensity',



          timestamp:
            now,



          data:{


            intensity:
              crisis.intensity,


          },


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

        item =>
          item !== symptom,

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












  const finishCrisis = ()=>{



    updateCrisis({


      ...crisis,


      active:false,


      endTime:
        new Date().toISOString(),


    });



    onExit?.();



  };












  return (



    <section className={styles.container}>


      <header>


        <h1>
          Crisis activa
        </h1>


        <p>
          Registrá cómo evoluciona tu migraña.
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



        onClick={
          registerPainUpdate
        }



      >


        Registrar actualización


      </button>












      <button


        type="button"


        className={styles.secondary}



        onClick={
          finishCrisis
        }



      >


        Finalizar crisis


      </button>







    </section>


  );

}