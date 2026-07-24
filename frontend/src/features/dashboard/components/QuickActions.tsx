import { useNavigate } from 'react-router-dom';

import styles from '../dashboard.module.css';



export function QuickActions() {


  const navigate =
    useNavigate();




  const actions = [

    {
      title:'Registrar migraña',
      description:'Dolor, duración y síntomas asociados.',
      path:'/migraine',
    },


    {
      title:'Registrar ansiedad',
      description:'Nivel de ansiedad y factores relacionados.',
      path:'/anxiety',
    },


    {
      title:'Ataque de pánico',
      description:'Registrar episodio y contexto.',
      path:'/panic',
    },


    {
      title:'Nuevo Journal',
      description:'Escribí cómo te sentís hoy.',
      path:'/journal',
    },


  ];







  return (

    <section className={styles.section}>


      <h2>
        ¿Qué querés registrar?
      </h2>





      <div className={styles.actionsGrid}>


        {

          actions.map((action)=>(


            <button


              key={action.title}


              className={styles.actionCard}


              type="button"


              onClick={()=>


                navigate(
                  action.path,
                )


              }


            >


              <h3>
                {action.title}
              </h3>



              <p>
                {action.description}
              </p>



            </button>


          ))

        }


      </div>


    </section>


  );

}