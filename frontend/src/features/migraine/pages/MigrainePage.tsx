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



    /*
      Construimos la fecha como local.
      Evita que JavaScript interprete
      YYYY-MM-DD como UTC y reste un día
      en Argentina.
    */

    const [
      year,
      month,
      day,
    ] = date.split('-');



    const selectedDateObject =
      new Date(

        Number(year),

        Number(month) - 1,

        Number(day),

      );



    const now =
      new Date();



    selectedDateObject.setHours(

      now.getHours(),

      now.getMinutes(),

      now.getSeconds(),

      0,

    );



    const selectedDate =
      selectedDateObject.toISOString();








    updateTimeline({



      /*
        Si hubo premonitorios,
        episodeStart ya existe.

        Si no hubo,
        la crisis inicia el episodio.
      */

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







    /*
      No llamamos startCrisis()
      porque ya actualizamos
      directamente la fase crisis.
    */







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