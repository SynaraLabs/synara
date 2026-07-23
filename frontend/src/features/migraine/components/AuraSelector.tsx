import styles from '../migraine.module.css';

import type {
  AuraType,
  VisualAura,
  SensoryAura,
  LanguageAura,
  AuraTiming,
} from '../types/migraine.types';


import {
  useMigraineStore,
} from '../store/migraine.store';



const auraTypes: {
  value: AuraType;
  label: string;
}[] = [

  {
    value: 'visual',
    label: 'Visual',
  },

  {
    value: 'sensory',
    label: 'Sensitiva',
  },

  {
    value: 'language',
    label: 'Lenguaje',
  },

];



const visualSymptoms: {
  value: VisualAura;
  label: string;
}[] = [

  {
    value: 'flashes',
    label: 'Destellos de luz',
  },

  {
    value: 'zigzagLines',
    label: 'Líneas zigzag',
  },

  {
    value: 'blindSpots',
    label: 'Puntos ciegos',
  },

  {
    value: 'blurredVision',
    label: 'Visión borrosa',
  },

];



const sensorySymptoms: {
  value: SensoryAura;
  label: string;
}[] = [

  {
    value: 'tingling',
    label: 'Hormigueo',
  },

  {
    value: 'numbness',
    label: 'Entumecimiento',
  },

  {
    value: 'electricSensation',
    label: 'Sensación eléctrica',
  },

];



const languageSymptoms: {
  value: LanguageAura;
  label: string;
}[] = [

  {
    value: 'wordFindingDifficulty',
    label: 'Dificultad para encontrar palabras',
  },

  {
    value: 'speechDifficulty',
    label: 'Dificultad al hablar',
  },

];




export function AuraSelector() {


  const aura =
    useMigraineStore(
      state => state.episode.aura,
    );


  const updateAura =
    useMigraineStore(
      state => state.updateAura,
    );




  const toggleType = (
    type: AuraType,
  ) => {


    const updatedTypes =

      aura.types.includes(type)

        ?

        aura.types.filter(
          item => item !== type,
        )

        :

        [
          ...aura.types,
          type,
        ];



    updateAura({

      ...aura,

      present:
        updatedTypes.length > 0,

      types:
        updatedTypes,

    });


  };





  return (

    <div className={styles.symptomSelector}>


      <h3>
        Aura
      </h3>


      <p>
        ¿Experimentaste síntomas de aura?
      </p>




      <div className={styles.symptomGrid}>


        {
          auraTypes.map(item => (


            <label

              key={item.value}

              className={
                styles.symptomOption
              }

            >


              <input

                type="checkbox"

                checked={
                  aura.types.includes(
                    item.value,
                  )
                }


                onChange={() =>
                  toggleType(
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
        aura.types.includes('visual') && (


          <AuraCheckboxGroup

            title="Síntomas visuales"

            items={visualSymptoms}

            selected={
              aura.visualSymptoms
            }


            onChange={(values)=>

              updateAura({

                ...aura,

                visualSymptoms:
                  values,

              })

            }

          />


        )
      }






      {
        aura.types.includes('sensory') && (


          <AuraCheckboxGroup

            title="Síntomas sensitivos"

            items={sensorySymptoms}

            selected={
              aura.sensorySymptoms
            }


            onChange={(values)=>

              updateAura({

                ...aura,

                sensorySymptoms:
                  values,

              })

            }

          />


        )
      }






      {
        aura.types.includes('language') && (


          <AuraCheckboxGroup

            title="Síntomas de lenguaje"

            items={languageSymptoms}

            selected={
              aura.languageSymptoms
            }


            onChange={(values)=>

              updateAura({

                ...aura,

                languageSymptoms:
                  values,

              })

            }

          />


        )
      }







      {
        aura.types.length > 0 && (

          <>


            <label>

              Duración de la aura (minutos)


              <input

                type="number"

                min="0"

                value={
                  aura.durationMinutes ?? ''
                }


                onChange={(e)=>

                  updateAura({

                    ...aura,

                    durationMinutes:
                      Number(
                        e.target.value,
                      ),

                  })

                }

              />

            </label>





            <label>

              Momento de aparición


              <select

                value={
                  aura.timing ?? ''
                }


                onChange={(e)=>

                  updateAura({

                    ...aura,

                    timing:
                      e.target.value as AuraTiming,

                  })

                }

              >

                <option value="">
                  Seleccionar
                </option>


                <option value="beforePain">
                  Antes del dolor
                </option>


                <option value="duringPain">
                  Durante el dolor
                </option>


                <option value="afterPain">
                  Después del dolor
                </option>


              </select>


            </label>


          </>

        )
      }



    </div>

  );

}







interface GroupProps<T extends string> {

  title:string;

  items:{
    value:T;
    label:string;
  }[];

  selected:T[];

  onChange:(values:T[])=>void;

}





function AuraCheckboxGroup<T extends string>({

  title,

  items,

  selected,

  onChange,

}:GroupProps<T>) {


  const toggle = (
    value:T,
  ) => {


    const updated =

      selected.includes(value)

      ?

      selected.filter(
        item => item !== value,
      )

      :

      [
        ...selected,
        value,
      ];



    onChange(updated);

  };




  return (

    <div>


      <h4>
        {title}
      </h4>



      <div className={styles.symptomGrid}>


        {
          items.map(item => (


            <label

              key={item.value}

              className={
                styles.symptomOption
              }

            >


              <input

                type="checkbox"

                checked={
                  selected.includes(
                    item.value,
                  )
                }


                onChange={() =>
                  toggle(
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


    </div>

  );

}