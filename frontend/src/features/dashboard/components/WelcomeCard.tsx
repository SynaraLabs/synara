import styles from '../dashboard.module.css';

export function WelcomeCard() {
  return (
    <section className={styles.welcomeCard}>
      <div>
        <p className={styles.greeting}>
          Bienvenido a SYNARA
        </p>

        <h1>
          Observá tu salud,
          <br />
          entendé tus patrones.
        </h1>

        <p className={styles.description}>
          Registrá síntomas, emociones y hábitos
          para comprender mejor cómo responde tu cuerpo.
        </p>
      </div>
    </section>
  );
}