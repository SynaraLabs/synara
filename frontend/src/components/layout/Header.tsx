import {
  useLocation,
} from 'react-router-dom';

import styles from './layout.module.css';

interface HeaderContent {
  title: string;

  description: string;
}

const getHeaderContent = (
  pathname: string,
): HeaderContent => {
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

  const content =
    getHeaderContent(
      location.pathname,
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