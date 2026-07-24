import { useState } from 'react';

import styles from '../migraine.module.css';

import type {
  PremonitorySymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import {
  PhaseDateSelector,
} from './common/PhaseDateSelector';






const symptoms: {
  value: PremonitorySymptom;
  label:string;
}[] = [

  {
    value:'fatigue',
    label:'Fatiga o cansancio',
  },

  {
    value:'yawning',
    label:'Bostezos frecuentes',
  },

  {
    value:'moodChange',
    label:'Cambios de ánimo',
  },

  {
    value:'irritability',
    label:'Irritabilidad',
  },

  {
    value:'brainFog',
    label:'Niebla mental',
  },

  {
    value:'foodCraving',
    label:'Antojos alimentarios',
  },

  {
    value:'neckStiffness',
    label:'Rigidez cervical',
  },

  {
    value:'thirst',
    label:'Mayor sensación de sed',
  },

  {
    value:'sleepiness',
    label:'Somnolencia',
  },

  {
    value:'concentrationDifficulty',
    label:'Dificultad para concentrarse',
  },

];









export function PremonitorySelector(){



  const [showDateSelector,setShowDateSelector] =
    useState(false);





  const premonitory =
    useMigraineStore(
      state=>state.episode.premonitory,
    );



  const timeline =
    useMigraineStore(
      state=>state.episode.timeline,
    );



  const updatePremonitory =
    useMigraineStore(
      state=>state.updatePremonitory,
    );



  const updateTimeline =
    useMigraineStore(
      state=>state.updateTimeline,
    );








  const toggleSymptom = (

    symptom:PremonitorySymptom,

  )=>{



    const updated =

      premonitory.symptoms.includes(symptom)

      ?

      premonitory.symptoms.filter(

        item=>item !== symptom,

      )

      :

      [

        ...premonitory.symptoms,

        symptom,

      ];






    updatePremonitory({

      present:
        updated.length > 0,

      symptoms:
        updated,

    });








    if(

      updated.length > 0

      &&

      !timeline?.premonitoryStart

    ){

      setShowDateSelector(true);

    }



  };









  const handleDateChange = (

    date:string,

  )=>{



    updateTimeline({



      episodeStart:

        timeline?.episodeStart
        ??
        date,



      premonitoryStart:

        date,



    });



    setShowDateSelector(false);



  };













  return (


    <div className={styles.symptomSelector}>


      <h3>
        Señales antes de la migraña
      </h3>



      <p>
        Podés registrar síntomas aunque los hayas notado días atrás.
      </p>





      <div className={styles.symptomGrid}>


        {

          symptoms.map((symptom)=>(


            <label

              key={symptom.value}

              className={styles.symptomOption}

            >


              <input

                type="checkbox"


                checked={

                  premonitory.symptoms.includes(

                    symptom.value,

                  )

                }



                onChange={()=>


                  toggleSymptom(

                    symptom.value,

                  )

                }


              />



              <span>

                {symptom.label}

              </span>


            </label>


          ))

        }


      </div>








      {

        showDateSelector

        &&

        (

          <PhaseDateSelector


            title="¿Cuándo empezaste a notar estas señales?"


            value={
              timeline?.premonitoryStart
            }


            onChange={
              handleDateChange
            }


          />

        )

      }






    </div>


  );


}