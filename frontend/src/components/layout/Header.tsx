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

const DEFAULT_HEADER: HeaderContent = {
  title: 'Inicio',
  description:
    'Tu espacio para registrar, comprender y acompañar la migraña.',
};

const ROUTE_HEADERS:
  Array<{
    path: string;
    content: HeaderContent;
  }> = [
  {
    path: '/history',
    content: {
      title: 'Historial',
      description:
        'Revisá la evolución de tus episodios y la información que registraste.',
    },
  },
  {
    path: '/reports',
    content: {
      title: 'Reportes',
      description:
        'Prepará información clara para revisar o compartir en consulta.',
    },
  },
  {
    path: '/triggers',
    content: {
      title: 'Desencadenantes',
      description:
        'Explorá posibles relaciones sin asumir una causa única.',
    },
  },
  {
    path: '/profile',
    content: {
      title: 'Perfil',
      description:
        'Reuní el contexto clínico que acompaña tus registros.',
    },
  },
];

const getHeaderContent = (
  pathname: string,
  crisisIsActive: boolean,
): HeaderContent => {
  if (pathname.startsWith('/migraine')) {
    return crisisIsActive
      ? {
          title: 'Crisis en curso',
          description:
            'Vamos de a poco. Registrá solo lo que cambió.',
        }
      : {
          title: 'Registrar migraña',
          description:
            'Avanzá a tu ritmo. Podés actualizar el episodio cuando lo necesites.',
        };
  }

  return (
    ROUTE_HEADERS.find(route =>
      pathname.startsWith(route.path),
    )?.content ?? DEFAULT_HEADER
  );
};

export function Header() {
  const location = useLocation();

  const crisisIsActive =
    useMigraineStore(
      state =>
        state.activeEpisode
          ?.crisis.active === true ||
        state.episode.crisis
          .active === true,
    );

  const content = getHeaderContent(
    location.pathname,
    crisisIsActive,
  );

  return (
    <header className={styles.header}>
      <div>
        <h1>{content.title}</h1>
        <span>{content.description}</span>
      </div>
    </header>
  );
}