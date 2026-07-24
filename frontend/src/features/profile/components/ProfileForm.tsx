import styles from '../../migraine/migraine.module.css';


import {
  useProfileStore,
} from '../store/profile.store';




export function ProfileForm(){



  const profile =
    useProfileStore(
      state => state.profile,
    );



  const updateField =
    useProfileStore(
      state => state.updateField,
    );



  const updateMenstrualContext =
    useProfileStore(
      state => state.updateMenstrualContext,
    );







  return (

    <section className={styles.symptomSelector}>


      <h2>
        Perfil personal
      </h2>



      <p>
        Estos datos ayudan a SYNARA a interpretar
        tus episodios.
      </p>








      <label>

        Nombre


        <input

          type="text"

          value={
            profile.name
          }


          onChange={(e)=>

            updateField(
              'name',
              e.target.value,
            )

          }


        />

      </label>








      <label>

        Fecha de nacimiento


        <input

          type="date"


          value={
            profile.birthDate
          }


          onChange={(e)=>

            updateField(
              'birthDate',
              e.target.value,
            )

          }


        />

      </label>








      <label>

        Sexo


        <select


          value={
            profile.sex
          }


          onChange={(e)=>

            updateField(
              'sex',
              e.target.value,
            )

          }


        >


          <option value="preferNotToSay">
            Prefiero no decirlo
          </option>


          <option value="female">
            Femenino
          </option>


          <option value="male">
            Masculino
          </option>


          <option value="other">
            Otro
          </option>


        </select>


      </label>








      <hr />








      <h3>
        Contexto hormonal
      </h3>



      <p>
        SYNARA puede analizar relación entre
        migrañas y ciclo menstrual.
      </p>








      <label>


        ¿Tenés ciclo menstrual?


        <select


          value={

            profile.menstrual?.hasMenstrualCycle

            ? 

            'yes'

            :

            'no'

          }


          onChange={(e)=>

            updateMenstrualContext({

              hasMenstrualCycle:
                e.target.value === 'yes',

            })

          }


        >


          <option value="yes">
            Sí
          </option>


          <option value="no">
            No
          </option>


        </select>


      </label>









      {

        profile.menstrual?.hasMenstrualCycle &&


        <>



          <label>


            Duración promedio del ciclo


            <input


              type="number"


              min="15"


              max="60"


              value={

                profile.menstrual.averageCycleDays ?? ''

              }


              onChange={(e)=>

                updateMenstrualContext({

                  averageCycleDays:
                    Number(e.target.value),

                })

              }


            />


          </label>









          <label>


            Fecha última menstruación


            <input


              type="date"


              value={

                profile.menstrual.lastPeriodDate ?? ''

              }


              onChange={(e)=>

                updateMenstrualContext({

                  lastPeriodDate:
                    e.target.value,

                })

              }


            />


          </label>









          <label>


            Relación con migrañas


            <select


              value={

                profile.menstrual.hormonalRelation ?? ''

              }


              onChange={(e)=>

                updateMenstrualContext({

                  hormonalRelation:
                    e.target.value as any,

                })

              }


            >


              <option value="">
                Seleccionar
              </option>


              <option value="menstruation">
                Menstruación
              </option>


              <option value="ovulation">
                Ovulación
              </option>


              <option value="both">
                Ambas
              </option>


              <option value="none">
                Ninguna
              </option>


              <option value="unknown">
                No sé
              </option>


            </select>


          </label>



        </>


      }







    </section>

  );

}