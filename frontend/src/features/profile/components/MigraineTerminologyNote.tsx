import styles from '../../migraine/migraine.module.css';

export function MigraineTerminologyNote() {
  return (
    <aside
      className={
        styles.symptomSelector
      }
      aria-labelledby="migraine-terminology-title"
    >
      <div>
        <h3 id="migraine-terminology-title">
          Antes de completar tu historia
        </h3>

        <p>
          En SYNARA, una crisis y un
          episodio no significan
          exactamente lo mismo.
        </p>
      </div>

      <div>
        <p>
          <b>
            Episodio:
          </b>{' '}
          es el proceso completo. Puede
          comenzar con señales
          premonitorias, continuar con
          aura o crisis y finalizar con
          el postdromo o recuperación.
        </p>

        <p>
          <b>
            Crisis:
          </b>{' '}
          es la fase en la que aparecen
          el dolor y los síntomas más
          activos de la migraña.
        </p>

        <p>
          No todos los episodios tienen
          todas las fases. También puede
          haber señales premonitorias o
          aura que no evolucionen hacia
          una crisis.
        </p>
      </div>
    </aside>
  );
}