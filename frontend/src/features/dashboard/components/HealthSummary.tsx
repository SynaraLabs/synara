import styles from '../dashboard.module.css';


import {
  useProfileStore,
} from '../../profile/store/profile.store';


import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';





export function HealthSummary() {



  const profile =
    useProfileStore(
      state => state.profile,
    );



  const crisis =
    useMigraineStore(
      state => state.episode.crisis,
    );







  const healthData = [



    {


      label:'Sueño',


      value:


        profile.lifestyle?.averageSleepHours !== undefined


        ?


        `${profile.lifestyle.averageSleepHours} h`


        :


        'Sin registrar',



      description:
        'Último registro',


    },







    {


      label:'Estrés',


      value:


        profile.emotionalContext?.baselineStress !== undefined


        ?


        `${profile.emotionalContext.baselineStress}/10`


        :


        'Sin registrar',



      description:
        'Nivel habitual',


    },









    {


      label:'Dolor',


      value:


        `${crisis.intensity} / 10`,



      description:


        crisis.active


        ?


        'Crisis activa'


        :


        'Sin crisis activa',


    },



  ];









  return (


    <section className={styles.section}>


      <h2>
        Estado actual
      </h2>





      <div className={styles.summaryGrid}>


        {


          healthData.map((item)=>(


            <article


              key={item.label}


              className={styles.summaryCard}


            >


              <p>
                {item.label}
              </p>



              <h3>
                {item.value}
              </h3>



              <span>
                {item.description}
              </span>



            </article>


          ))


        }



      </div>


    </section>


  );

}