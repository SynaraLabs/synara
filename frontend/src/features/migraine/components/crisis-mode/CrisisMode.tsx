import { useState } from 'react';

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





  const [medication,setMedication] =
    useState('');



  const [dose,setDose] =
    useState('');








  const updatePain = (

    value:string,

  )=>{


    const intensity =
      Number(value) as PainIntensity;



    const now =
      new Date().toISOString();





    const updated:CrisisPhase = {


      ...crisis,


      active:true,


      intensity,



      intensityHistory:[

        ...crisis.intensityHistory,


        {

          time:now,

          intensity,

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

            intensity,

          },


        },

      ],


    };



    updateCrisis(updated);


  };









  const registerMedication = ()=>{


    if(!medication.trim()) return;



    const now =
      new Date().toISOString();




    updateCrisis({


      ...crisis,



      events:[

        ...(crisis.events ?? []),



        {


          id:
            crypto.randomUUID(),



          type:
            'medication',



          timestamp:
            now,



          data:{


            medication:


              medication.trim(),



            dose:


              dose.trim(),



          },


        },


      ],



    });




    setMedication('');

    setDose('');



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





    const now =
      new Date().toISOString();




    updateCrisis({


      ...crisis,


      symptoms:
        updatedSymptoms,



      events:[

        ...(crisis.events ?? []),



        {


          id:
            crypto.randomUUID(),



          type:
            'symptom',



          timestamp:
            now,



          data:{

            symptom,

          },


        },


      ],



    });



  };











  const finishCrisis = () => {



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
          Medicación tomada
        </h2>



        <input


          type="text"


          placeholder="Medicamento"



          value={medication}



          onChange={(e)=>

            setMedication(
              e.target.value,
            )

          }


        />



        <input


          type="text"


          placeholder="Dosis (ej: 600 mg)"



          value={dose}



          onChange={(e)=>

            setDose(
              e.target.value,
            )

          }


        />



        <button


          type="button"


          onClick={registerMedication}


        >

          Registrar medicación

        </button>



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









      <button


        type="button"


        className={styles.secondary}



        onClick={finishCrisis}



      >


        Finalizar crisis


      </button>







    </section>


  );

}