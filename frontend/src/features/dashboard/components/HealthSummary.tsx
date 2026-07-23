import styles from '../dashboard.module.css';

const healthData = [
  {
    label: 'Sueño',
    value: '7 h 30 min',
    description: 'Última noche',
  },
  {
    label: 'Estrés',
    value: 'Moderado',
    description: 'Nivel registrado',
  },
  {
    label: 'Dolor',
    value: '0 / 10',
    description: 'Intensidad actual',
  },
];

export function HealthSummary() {
  return (
    <section className={styles.section}>

      <h2>
        Estado actual
      </h2>

      <div className={styles.summaryGrid}>

        {healthData.map((item) => (
          <article
            key={item.label}
            className={styles.summaryCard}
          >

            <p>
              {item.label}
            </p>

            <h3>
              {item.value}
            </h3>

            <span>
              {item.description}
            </span>

          </article>
        ))}

      </div>

    </section>
  );
}