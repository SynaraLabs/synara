import { useState } from 'react';

import styles from '../migraine.module.css';

import type {
  CrisisPhase,
  CrisisSymptom,
  PainLocation,
  PainQuality,
  PainIntensity,
} from '../types/migraine.types';



interface Props {

  value?: CrisisPhase;

  onChange?: (
    crisis:CrisisPhase,
  )=>void;

}







const locations:{
  value: PainLocation;
  label:string;
}[]=[

  {
    value:'front',
    label:'Frente',
  },

  {
    value:'temple',
    label:'Sien',
  },

  {
    value:'eye',
    label:'Ojo',
  },

  {
    value:'neck',
    label:'Cuello',
  },

  {
    value:'general',
    label:'Toda la cabeza',
  },

];







const qualities:{
  value: PainQuality;
  label:string;
}[]=[

  {
    value:'pulsating',
    label:'Pulsátil',
  },

  {
    value:'pressure',
    label:'Presión',
  },

  {
    value:'stabbing',
    label:'Punzante',
  },

  {
    value:'burning',
    label:'Ardor',
  },

];







const symptoms:{
  value:CrisisSymptom;
  label:string;
}[]=[

  {
    value:'nausea',
    label:'Náuseas',
  },

  {
    value:'vomiting',
    label:'Vómitos',
  },

  {
    value:'lightSensitivity',
    label:'Molestia con la luz',
  },

  {
    value:'soundSensitivity',
    label:'Molestia con sonidos',
  },

  {
    value:'smellSensitivity',
    label:'Molestia con olores',
  },

  {
    value:'dizziness',
    label:'Mareo',
  },

  {
    value:'confusion',
    label:'Confusión / niebla mental',
  },

  {
    value:'neckPain',
    label:'Dolor cervical',
  },

  {
    value:'jawTension',
    label:'Tensión mandibular',
  },

];









export function CrisisSelector({
  value,
  onChange,
}:Props){



  const [crisis,setCrisis] =
    useState<CrisisPhase>(

      value ??

      {

        active:true,

        startTime:
          new Date().toISOString(),

        intensity:0,

        intensityHistory:[],

        events:[],

        location:[],

        quality:'pulsating',

        symptoms:[],

      }

    );









  const updateLocal = (
    updated:CrisisPhase,
  )=>{

    setCrisis(updated);

  };









  const registerIntensity = ()=>{


    const now =
      new Date().toISOString();



    const updatedCrisis:CrisisPhase = {


      ...crisis,



      intensityHistory:[


        ...crisis.intensityHistory,


        {


          time:now,


          intensity:crisis.intensity,


        }


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


          }


        }


      ]



    };





    setCrisis(updatedCrisis);



    onChange?.(
      updatedCrisis,
    );


  };












  const toggleArrayValue=<T,>(
    array:T[],
    item:T,
  )=>{


    return array.includes(item)

      ?

      array.filter(
        value=>value!==item,
      )

      :

      [
        ...array,
        item,
      ];


  };









  return (

    <section className={styles.symptomSelector}>


      <h3>
        Crisis actual
      </h3>





      <h4>
        Intensidad del dolor
      </h4>





      <input

        type="range"

        min="0"

        max="10"

        value={
          crisis.intensity
        }



        onChange={(e)=>{


          const intensity =
            Number(
              e.target.value
            ) as PainIntensity;



          updateLocal({

            ...crisis,

            intensity,

          });


        }}



      />





      <strong>
        {crisis.intensity}/10
      </strong>





      <button

        type="button"

        onClick={
          registerIntensity
        }

      >

        Registrar actualización del dolor

      </button>









      <h4>
        ¿Dónde duele?
      </h4>





      <div className={styles.symptomGrid}>


      {

        locations.map(item=>(


          <label

            key={item.value}

            className={styles.symptomOption}

          >


            <input

              type="checkbox"


              checked={
                crisis.location.includes(
                  item.value
                )
              }



              onChange={()=>{


                updateLocal({

                  ...crisis,


                  location:
                    toggleArrayValue(
                      crisis.location,
                      item.value,
                    ),

                });


              }}



            />


            <span>
              {item.label}
            </span>


          </label>


        ))

      }


      </div>









      <h4>
        Tipo de dolor
      </h4>





      <select


        value={
          crisis.quality
        }



        onChange={(e)=>{


          updateLocal({

            ...crisis,


            quality:
              e.target.value as PainQuality,


          });


        }}



      >


        {

          qualities.map(item=>(


            <option

              key={item.value}

              value={item.value}

            >

              {item.label}

            </option>


          ))

        }


      </select>









      <h4>
        Síntomas durante la crisis
      </h4>





      <div className={styles.symptomGrid}>


      {

        symptoms.map(item=>(


          <label

            key={item.value}

            className={styles.symptomOption}

          >


            <input


              type="checkbox"


              checked={
                crisis.symptoms.includes(
                  item.value
                )
              }



              onChange={()=>{


                updateLocal({

                  ...crisis,


                  symptoms:
                    toggleArrayValue(
                      crisis.symptoms,
                      item.value,
                    ),


                });


              }}



            />


            <span>
              {item.label}
            </span>


          </label>


        ))

      }


      </div>









      <label>


        <input


          type="checkbox"


          checked={
            crisis.unableToFunction ?? false
          }



          onChange={(e)=>{


            updateLocal({

              ...crisis,


              unableToFunction:
                e.target.checked,


            });


          }}



        />


        Me impidió continuar mis actividades


      </label>





    </section>


  );

}