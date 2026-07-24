import type {
  TreatmentEffectiveness,
} from '../types/migraine.types';


import {
  useMigraineStore,
} from '../store/migraine.store';







export function TreatmentSelector() {



  const treatment =
    useMigraineStore(
      state => state.episode.treatment,
    );



  const updateTreatment =
    useMigraineStore(
      state => state.updateTreatment,
    );







  const update = (

    field: keyof typeof treatment,

    value: string | number | TreatmentEffectiveness,

  ) => {



    updateTreatment({

      ...treatment,

      [field]:
        value,

    });



  };







  return (

    <section>


      <h3>
        Tratamiento utilizado
      </h3>


      <p>
        Registrá qué utilizaste durante la crisis.
      </p>







      <label>

        Medicación:


        <input

          type="text"


          value={
            treatment.medication ?? ''
          }


          onChange={(e)=>

            update(

              'medication',

              e.target.value,

            )

          }

        />

      </label>









      <label>

        Dosis:


        <input

          type="text"


          value={
            treatment.dose ?? ''
          }


          onChange={(e)=>

            update(

              'dose',

              e.target.value,

            )

          }

        />

      </label>









      <label>

        Hora de toma:


        <input

          type="time"


          value={
            treatment.takenAt ?? ''
          }


          onChange={(e)=>

            update(

              'takenAt',

              e.target.value,

            )

          }

        />

      </label>









      <h4>
        ¿Qué resultado tuvo?
      </h4>









      <select


        value={
          treatment.effectiveness ?? ''
        }


        onChange={(e)=>

          update(

            'effectiveness',

            e.target.value as TreatmentEffectiveness,

          )

        }


      >


        <option value="">
          Seleccionar
        </option>


        <option value="none">
          No funcionó
        </option>


        <option value="low">
          Funcionó poco
        </option>


        <option value="medium">
          Funcionó moderadamente
        </option>


        <option value="high">
          Funcionó mucho
        </option>


      </select>









      <label>

        Tiempo hasta mejorar (minutos):


        <input


          type="number"


          min="0"




          value={

            treatment.responseTimeMinutes ?? ''

          }




          onChange={(e)=>

            update(

              'responseTimeMinutes',

              Number(
                e.target.value,
              )

            )

          }


        />


      </label>







    </section>

  );

}