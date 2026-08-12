import styles from './MigraineTerminologyNote.module.css';

export function MigraineTerminologyNote() {
  return (
    <aside
      className={styles.note}
      aria-labelledby="migraine-terminology-title"
    >
      <details>
        <summary>
          <span>
            <small>
              Antes de completar tu historia
            </small>

            <strong
              id="migraine-terminology-title"
            >
              Episodio y crisis no significan
              lo mismo
            </strong>
          </span>

          <span
            className={styles.chevron}
            aria-hidden="true"
          />
        </summary>

        <div
          className={styles.content}
        >
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
      </details>
    </aside>
  );
}