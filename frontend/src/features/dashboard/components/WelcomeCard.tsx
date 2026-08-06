import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  useProfileStore,
} from '../../profile/store/profile.store';

import styles from '../dashboard.module.css';

export function WelcomeCard() {
  const activeEpisode =
    useMigraineStore(
      state =>
        state.activeEpisode,
    );

  const name =
    useProfileStore(
      state =>
        state.profile.name,
    );

  if (activeEpisode) {
    return null;
  }

  const greeting =
    name?.trim()
      ? `Hola, ${name.trim()}`
      : 'Tu acompañamiento';

  return (
    <section
      className={
        styles.welcomeCard
      }
      aria-labelledby="welcome-title"
    >
      <header
        className={
          styles.welcomeHeader
        }
      >
        <span
          className={
            styles.welcomeIcon
          }
          aria-hidden="true"
        >
          S
        </span>

        <div>
          <p
            className={
              styles.greeting
            }
          >
            {greeting}
          </p>

          <p
            className={
              styles.welcomeHeaderDescription
            }
          >
            Tu espacio para registrar,
            comprender y acompañar tu
            salud.
          </p>
        </div>
      </header>

      <div
        className={
          styles.welcomePaper
        }
      >
        <h1 id="welcome-title">
          Registrá lo que te pasa.
          <br />

          Comprendé cómo evoluciona.
        </h1>

        <p
          className={
            styles.description
          }
        >
          SYNARA te acompaña a registrar
          cada fase de la migraña con
          claridad, a tu ritmo y sin
          necesidad de completar todo de
          una vez.
        </p>
      </div>
    </section>
  );
}