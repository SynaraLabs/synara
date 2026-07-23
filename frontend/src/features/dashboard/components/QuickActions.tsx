import styles from '../dashboard.module.css';

const actions = [
  {
    title: 'Registrar migraña',
    description: 'Dolor, duración y síntomas asociados.',
  },
  {
    title: 'Registrar ansiedad',
    description: 'Nivel de ansiedad y factores relacionados.',
  },
  {
    title: 'Ataque de pánico',
    description: 'Registrar episodio y contexto.',
  },
  {
    title: 'Nuevo Journal',
    description: 'Escribí cómo te sentís hoy.',
  },
];

export function QuickActions() {
  return (
    <section className={styles.section}>

      <h2>
        ¿Qué querés registrar?
      </h2>

      <div className={styles.actionsGrid}>

        {actions.map((action) => (
          <button
            key={action.title}
            className={styles.actionCard}
          >

            <h3>
              {action.title}
            </h3>

            <p>
              {action.description}
            </p>

          </button>
        ))}

      </div>

    </section>
  );
}