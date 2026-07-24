import { useState } from 'react';


import { PremonitorySelector } from '../components/PremonitorySelector';
import { PainScale } from '../components/PainScale';
import { SymptomSelector } from '../components/SymptomSelector';
import { AuraSelector } from '../components/AuraSelector';
import { CrisisMode } from '../components/crisis-mode/CrisisMode';
import { PostdromeSelector } from '../components/PostdromeSelector';
import { TriggerSelector } from '../components/TriggerSelector';
import { TreatmentSelector } from '../components/TreatmentSelector';


import {
  useMigraineStore,
} from '../store/migraine.store';


import styles from '../migraine.module.css';



type MigraineMode =
  | 'normal'
  | 'crisis';





export function MigrainePage() {


  const [mode,setMode] =
    useState<MigraineMode>(
      'normal',
    );





  const completeEpisode =
    useMigraineStore(
      state => state.completeEpisode,
    );



  const updateCrisis =
    useMigraineStore(
      state => state.updateCrisis,
    );



  const crisis =
    useMigraineStore(
      state => state.episode.crisis,
    );







  const startCrisis = () => {


    updateCrisis({

      ...crisis,


      active:true,


      startTime:
        new Date().toISOString(),


    });


    setMode('crisis');


  };








  const finishEpisode = () => {


    const now =
      new Date();



    if(crisis.startTime){


      const start =
        new Date(
          crisis.startTime,
        );



      const duration =

        Math.round(

          (
            now.getTime()
            -
            start.getTime()

          )
          /
          60000

        );



      updateCrisis({


        ...crisis,


        active:false,


        endTime:
          now.toISOString(),


        durationMinutes:
          duration,


      });


    }



    completeEpisode();



    setMode('normal');


  };








  return (


    <section className={styles.container}>


      <h1>
        Registro de migrañas
      </h1>



      <p>
        Registrá tus episodios para comprender
        tus patrones a lo largo del tiempo.
      </p>





      {
        mode === 'normal' && (

          <>


            <button

              type="button"

              onClick={startCrisis}

            >

              Estoy teniendo una crisis ahora

            </button>





            <PremonitorySelector />

            <AuraSelector />

            <PainScale />

            <SymptomSelector />

            <PostdromeSelector />

            <TriggerSelector />

            <TreatmentSelector />






            <button

              type="button"

              onClick={finishEpisode}

            >

              Finalizar episodio

            </button>



          </>

        )
      }







      {
        mode === 'crisis' && (

          <CrisisMode

            onExit={() =>
              setMode('normal')
            }

          />

        )
      }



    </section>


  );

}