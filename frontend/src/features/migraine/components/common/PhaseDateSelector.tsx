import styles from '../../migraine.module.css';


interface PhaseDateSelectorProps {

  title:string;

  value?:string;

  onChange:(date:string)=>void;

}



export function PhaseDateSelector({

  title,

  value,

  onChange,

}:PhaseDateSelectorProps){



  const today =
    new Date()
      .toISOString()
      .split('T')[0];



  const setRelativeDate = (
    daysAgo:number,
  )=>{


    const date =
      new Date();



    date.setDate(
      date.getDate() - daysAgo,
    );



    onChange(

      date
        .toISOString()
        .split('T')[0]

    );


  };





  return (

    <section className={styles.dateSelector}>


      <h4>

        {title}

      </h4>



      <div>


        <button

          type="button"

          onClick={() =>
            setRelativeDate(0)
          }

        >

          Hoy

        </button>




        <button

          type="button"

          onClick={() =>
            setRelativeDate(1)
          }

        >

          Ayer

        </button>




        <button

          type="button"

          onClick={() =>
            setRelativeDate(2)
          }

        >

          Hace 2-3 días

        </button>



      </div>





      <label>

        Elegir fecha


        <input

          type="date"

          max={today}

          value={
            value ?? ''
          }

          onChange={(event)=>

            onChange(
              event.target.value
            )

          }

        />


      </label>



    </section>

  );

}