import styles from '../migraine.module.css';

import type {
  PremonitorySymptom,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';



const symptoms: {
  value: PremonitorySymptom;
  label: string;
}[] = [

  {
    value: 'fatigue',
    label: 'Fatiga o cansancio',
  },

  {
    value: 'yawning',
    label: 'Bostezos frecuentes',
  },

  {
    value: 'moodChange',
    label: 'Cambios de ánimo',
  },

  {
    value: 'irritability',
    label: 'Irritabilidad',
  },

  {
    value: 'brainFog',
    label: 'Niebla mental',
  },

  {
    value: 'foodCraving',
    label: 'Antojos alimentarios',
  },

  {
    value: 'neckStiffness',
    label: 'Rigidez cervical',
  },

  {
    value: 'thirst',
    label: 'Mayor sensación de sed',
  },

  {
    value: 'sleepiness',
    label: 'Somnolencia',
  },

  {
    value: 'concentrationDifficulty',
    label: 'Dificultad para concentrarse',
  },

];




export function PremonitorySelector() {


  const premonitory =
    useMigraineStore(
      state => state.episode.premonitory,
    );


  const updatePremonitory =
    useMigraineStore(
      state => state.updatePremonitory,
    );




  const toggleSymptom = (
    symptom: PremonitorySymptom,
  ) => {


    const updated =

      premonitory.symptoms.includes(
        symptom,
      )

      ?

      premonitory.symptoms.filter(
        item => item !== symptom,
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


  };




  return (

    <div className={styles.symptomSelector}>


      <h3>
        Señales antes de la migraña
      </h3>


      <p>
        ¿Notaste cambios antes de que empezara
        el dolor?
      </p>




      <div className={styles.symptomGrid}>


        {
          symptoms.map((symptom) => (


            <label

              key={symptom.value}

              className={
                styles.symptomOption
              }

            >


              <input

                type="checkbox"


                checked={

                  premonitory.symptoms.includes(
                    symptom.value,
                  )

                }


                onChange={() =>
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


    </div>

  );

}