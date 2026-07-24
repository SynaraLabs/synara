import styles from '../dashboard.module.css';


import {
  useProfileStore,
} from '../../profile/store/profile.store';




export function WelcomeCard() {


  const name =
    useProfileStore(
      state => state.profile.name,
    );



  return (


    <section className={styles.welcomeCard}>


      <div>


        <p className={styles.greeting}>


          {

            name

            ?

            `Hola ${name} 👋`

            :

            'Bienvenido a SYNARA'

          }


        </p>





        <h1>

          Observá tu salud,

          <br />

          entendé tus patrones.

        </h1>





        <p className={styles.description}>

          Registrá síntomas, emociones y hábitos
          para comprender mejor cómo responde tu cuerpo.

        </p>



      </div>


    </section>


  );

}