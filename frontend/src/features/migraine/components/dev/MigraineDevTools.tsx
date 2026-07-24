import {
  useMigraineStore,
} from '../../store/migraine.store';



export function MigraineDevTools(){


  const clearHistory =
    useMigraineStore(
      state => state.clearHistory,
    );


  const resetEpisode =
    useMigraineStore(
      state => state.resetEpisode,
    );



  const clearAll = () => {


    clearHistory();


    resetEpisode();


    localStorage.removeItem(
      'synara-migraine-storage',
    );


    window.location.reload();


  };





  return (

    <section

      style={{

        marginTop:'40px',

        padding:'20px',

        border:'1px dashed #999',

        borderRadius:'12px',

      }}

    >


      <h3>
        Herramientas de prueba
      </h3>



      <button

        type="button"

        onClick={clearAll}

      >

        Borrar registros de prueba

      </button>


    </section>

  );


}