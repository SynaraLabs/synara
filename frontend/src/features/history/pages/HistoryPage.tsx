import {
  EpisodeList,
} from '../components/EpisodeList';


import styles from '../history.module.css';





export function HistoryPage() {


  return (


    <section className={styles.container}>


      <header className={styles.pageHeader}>


        <h1>
          Historial de migrañas
        </h1>



        <p>
          Revisá tus episodios registrados
          y observá cómo evoluciona tu patrón.
        </p>


      </header>





      <EpisodeList />



    </section>


  );

}