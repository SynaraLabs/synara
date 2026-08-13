import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  useProfileStore,
} from '../../profile/store/profile.store';

import styles from './WelcomeCard.module.css';

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

  const firstName =
    name
      ?.trim()
      .split(/\s+/)[0];

  return (
    <header
      className={styles.welcome}
      aria-labelledby="welcome-title"
    >
      <p className={styles.eyebrow}>
        {firstName
          ? `Hola, ${firstName}`
          : 'Tu espacio personal'}
      </p>

      <h1 id="welcome-title">
        ¿Cómo estás hoy?
      </h1>

      <p className={styles.description}>
        Registrá lo que reconocés ahora.
        Podés completar o actualizar el
        episodio después.
      </p>
    </header>
  );
}