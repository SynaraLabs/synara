import {
  useLocation,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../features/migraine/store/migraine.store';

import styles from './layout.module.css';

interface HeaderContent {
  title: string;

  description: string;
}

const getHeaderContent = (
  pathname: string,
  crisisIsActive: boolean,
): HeaderContent => {
  if (
    pathname.startsWith(
      '/migraine',
    ) &&
    crisisIsActive
  ) {
    return {
      title:
        'Crisis en curso',

      description:
        'Vamos de a poco. Registrá solo lo que cambió.',
    };
  }

  if (
    pathname.startsWith(
      '/migraine',
    )
  ) {
    return {
      title:
        'Registrar migraña',

      description:
        'Avanzá a tu ritmo. Podés actualizar el episodio cuando lo necesites.',
    };
  }

  if (
    pathname.startsWith(
      '/history',
    )
  ) {
    return {
      title:
        'Historial',

      description:
        'Revisá la evolución de tus episodios y la información que registraste.',
    };
  }

  return {
    title:
      'Inicio',

    description:
      'Tu espacio para registrar, comprender y acompañar la migraña.',
  };
};

export function Header() {
  const location =
    useLocation();

  const crisisIsActive =
    useMigraineStore(
      state =>
        state.activeEpisode
          ?.crisis.active === true ||
        state.episode.crisis
          .active === true,
    );

  const content =
    getHeaderContent(
      location.pathname,
      crisisIsActive,
    );

  return (
    <header
      className={
        styles.header
      }
    >
      <div>
        <h1>
          {content.title}
        </h1>

        <span>
          {content.description}
        </span>
      </div>
    </header>
  );
}