import { useState } from 'react';


import { PremonitorySelector } from '../components/PremonitorySelector';
import { AuraSelector } from '../components/AuraSelector';
import { CrisisMode } from '../components/crisis-mode/CrisisMode';
import { PostdromeSelector } from '../components/PostdromeSelector';
import { TriggerSelector } from '../components/TriggerSelector';
import { TreatmentSelector } from '../components/TreatmentSelector';
import { PhaseDateSelector } from '../components/common/PhaseDateSelector';
import { MigraineDevTools } from '../components/dev/MigraineDevTools';


import {
  useMigraineStore,
} from '../store/migraine.store';


import styles from '../migraine.module.css';





type MigraineMode =
  | 'normal'
  | 'crisis';







export function MigrainePage(){



  const [mode,setMode] =
    useState<MigraineMode>('normal');



  const [
    showCrisisDate,
    setShowCrisisDate,
  ] =
    useState(false);






  const episode =
    useMigraineStore(
      state=>state.activeEpisode,
    );



  const startEpisode =
    useMigraineStore(
      state=>state.startEpisode,
    );



  const updateTimeline =
    useMigraineStore(
      state=>state.updateTimeline,
    );



  const updateCrisis =
    useMigraineStore(
      state=>state.updateCrisis,
    );



  const startCrisis =
    useMigraineStore(
      state=>state.startCrisis,
    );



  const finishCrisis =
    useMigraineStore(
      state=>state.finishCrisis,
    );



  const completeEpisode =
    useMigraineStore(
      state=>state.completeEpisode,
    );







  const handleNewEpisode = ()=>{


    startEpisode();


  };








  const handleStartCrisis = ()=>{


    setShowCrisisDate(true);


  };








  const handleCrisisDate = (

    date:string,

  )=>{


    if(!episode) return;



    const selectedDate =
      new Date(date).toISOString();





    updateTimeline({


      episodeStart:

        episode.timeline?.episodeStart
        ??
        selectedDate,



      crisisStart:

        selectedDate,



      premonitoryEnd:

        selectedDate,


    });







    updateCrisis({


      ...episode.crisis,


      active:true,


      startTime:selectedDate,


    });





    startCrisis();




    setShowCrisisDate(false);



    setMode('crisis');


  };



  const handleFinishCrisis = ()=>{


    finishCrisis();


    setMode('normal');


  };







  const handleCompleteEpisode = ()=>{


    completeEpisode();


    setMode('normal');


  };









  return (



    <section className={styles.container}>


      <h1>
        Seguimiento de migraña
      </h1>



      <p>
        Acompañamos todo el episodio:
        señales previas, crisis y recuperación.
      </p>









      {

        !episode

        &&

        (


          <div>


            <h2>
              No hay una migraña activa
            </h2>


            <p>
              Podés iniciar un nuevo registro cuando lo necesites.
            </p>



            <button

              type="button"

              onClick={
                handleNewEpisode
              }

            >

              Registrar nueva migraña

            </button>


          </div>


        )

      }









      {

        episode

        &&

        mode === 'crisis'

        &&

        (

          <CrisisMode

            onExit={
              handleFinishCrisis
            }

          />

        )

      }









      {

        episode

        &&

        mode === 'normal'

        &&

        (

          <>






            {

              !episode.crisis.active

              &&

              (


                <button

                  type="button"

                  onClick={
                    handleStartCrisis
                  }

                >

                  Estoy entrando en crisis

                </button>


              )

            }









            {

              showCrisisDate

              &&

              (


                <PhaseDateSelector


                  title="¿Cuándo empezó el dolor?"


                  value={
                    episode.crisis.startTime
                  }


                  onChange={
                    handleCrisisDate
                  }


                />


              )

            }









            <PremonitorySelector />



            <AuraSelector />









            {

              episode.status === 'postdrome'

              &&

              (


                <>


                  <h2>
                    Recuperación después de la crisis
                  </h2>



                  <PostdromeSelector />



                  <TriggerSelector />



                  <TreatmentSelector />





                  <button

                    type="button"

                    onClick={
                      handleCompleteEpisode
                    }

                  >

                    Finalizar episodio


                  </button>


                </>


              )


            }









            <MigraineDevTools />





          </>


        )

      }







    </section>


  );


}