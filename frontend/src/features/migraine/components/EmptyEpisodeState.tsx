import styles from './EmptyEpisodeState.module.css';

interface Props {
  onStart: () => void;
}

const STARTING_POINTS = [
  {
    title: 'Señales',
    description:
      'Cambios que aparecen antes del dolor.',
  },
  {
    title: 'Aura',
    description:
      'Síntomas visuales, sensitivos o del lenguaje.',
  },
  {
    title: 'Dolor',
    description:
      'Una crisis que está comenzando o ya empezó.',
  },
];

export function EmptyEpisodeState({
  onStart,
}: Props) {
  return (
    <section
      className={styles.emptyState}
      aria-labelledby="empty-episode-title"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          Nuevo registro
        </p>

        <h1 id="empty-episode-title">
          Registrá lo que está pasando
        </h1>

        <p className={styles.introduction}>
          No necesitás identificar todas
          las fases ni saber cómo va a
          evolucionar. Empezá por lo que
          reconocés ahora.
        </p>
      </header>

      <div
        className={styles.startingPoints}
        aria-label="Podés comenzar por"
      >
        {STARTING_POINTS.map(
          item => (
            <div
              key={item.title}
              className={styles.startingPoint}
            >
              <strong>{item.title}</strong>

              <span>
                {item.description}
              </span>
            </div>
          ),
        )}
      </div>

      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.startButton}
          onClick={onStart}
        >
          Empezar mi registro

          <span aria-hidden="true">
            →
          </span>
        </button>

        <p>
          El registro se guarda
          automáticamente en este
          dispositivo.
        </p>
      </div>
    </section>
  );
}