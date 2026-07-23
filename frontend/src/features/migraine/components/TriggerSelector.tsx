import styles from '../migraine.module.css';


import type {
  MigraineTrigger,
} from '../types/migraine.types';



import {
  useMigraineStore,
} from '../store/migraine.store';





const triggers: {
  value: MigraineTrigger;
  label: string;
  category: string;

}[] = [

  {
    value:'stress',
    label:'Estrés',
    category:'Emocional',
  },

  {
    value:'lackOfSleep',
    label:'Dormir poco',
    category:'Sueño',
  },

  {
    value:'food',
    label:'Alimentos desencadenantes',
    category:'Alimentación',
  },

  {
    value:'caffeine',
    label:'Cafeína',
    category:'Alimentación',
  },

  {
    value:'alcohol',
    label:'Alcohol',
    category:'Alimentación',
  },

  {
    value:'hormonal',
    label:'Cambios hormonales',
    category:'Hormonal',
  },

  {
    value:'weather',
    label:'Cambios climáticos',
    category:'Ambiente',
  },

  {
    value:'smell',
    label:'Olores fuertes',
    category:'Ambiente',
  },

  {
    value:'noise',
    label:'Ruido',
    category:'Ambiente',
  },

  {
    value:'unknown',
    label:'No identificado',
    category:'Otros',
  },

];





export function TriggerSelector() {



  const selected =
    useMigraineStore(
      state => state.episode.triggers,
    );



  const updateTriggers =
    useMigraineStore(
      state => state.updateTriggers,
    );







  const toggle = (

    trigger:MigraineTrigger,

  )=>{



    const updated =


      selected.includes(trigger)


      ?


      selected.filter(
        item => item !== trigger,
      )


      :


      [

        ...selected,

        trigger,

      ];





    updateTriggers(updated);



  };







  const categories =

    [

      ...new Set(

        triggers.map(
          item => item.category,
        ),

      ),

    ];







  return (

    <section>


      <h3>
        Posibles desencadenantes
      </h3>





      {
        categories.map(category => (


          <div key={category}>


            <h4>
              {category}
            </h4>





            <div className={styles.symptomGrid}>


              {

                triggers

                .filter(

                  item =>
                    item.category === category,

                )


                .map(item => (



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



                      onChange={()=>


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


        ))
      }




    </section>

  );

}