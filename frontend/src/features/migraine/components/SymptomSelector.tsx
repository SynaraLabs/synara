import styles from '../migraine.module.css';


import type {
  CrisisSymptom,
} from '../types/migraine.types';


import {
  useMigraineStore,
} from '../store/migraine.store';






const symptoms: {
  value: CrisisSymptom;
  label: string;
}[] = [


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
    label:'Sensibilidad a la luz',
  },


  {
    value:'soundSensitivity',
    label:'Sensibilidad al sonido',
  },


  {
    value:'smellSensitivity',
    label:'Sensibilidad a los olores',
  },


  {
    value:'dizziness',
    label:'Mareo',
  },


  {
    value:'confusion',
    label:'Confusión o dificultad mental',
  },


  {
    value:'neckPain',
    label:'Dolor o rigidez cervical',
  },


  {
    value:'jawTension',
    label:'Tensión mandibular',
  },


];








export function SymptomSelector() {



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






  const selected =
    crisis.symptoms;







  const toggleSymptom = (

    symptom:CrisisSymptom,

  ) => {



    const updated =


      selected.includes(symptom)



      ?


      selected.filter(

        item =>
          item !== symptom,

      )



      :


      [

        ...selected,

        symptom,

      ];








    updateCrisis({


      ...crisis,



      symptoms:
        updated,



    });



  };








  return (



    <div className={styles.symptomSelector}>


      <h3>
        Síntomas durante la crisis
      </h3>



      <div className={styles.symptomGrid}>



        {

          symptoms.map((symptom)=>(



            <label


              key={symptom.value}


              className={
                styles.symptomOption
              }



            >



              <input


                type="checkbox"



                checked={

                  selected.includes(

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