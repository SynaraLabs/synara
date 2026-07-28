import {
  NavLink,
} from 'react-router-dom';

import styles from './layout.module.css';

const navigationItems = [
  {
    to: '/',
    label: 'Inicio',
    icon: '⌂',
    end: true,
  },
  {
    to: '/migraine',
    label: 'Migrañas',
    icon: '◉',
  },
  {
    to: '/history',
    label: 'Historial',
    icon: '◷',
  },
  {
    to: '/profile',
    label: 'Perfil',
    icon: '○',
  },
  {
    to: '/anxiety',
    label: 'Ansiedad',
    icon: '≈',
  },
  {
    to: '/panic',
    label: 'Pánico',
    icon: '!',
  },
  {
    to: '/journal',
    label: 'Diario',
    icon: '✎',
  },
  {
    to: '/reports',
    label: 'Reportes',
    icon: '▥',
  },
];

export function Sidebar() {
  return (
    <aside
      className={styles.sidebar}
      aria-label="Navegación principal"
    >
      <div
        className={styles.sidebarBrand}
      >
        <span
          className={
            styles.sidebarBrandMark
          }
          aria-hidden="true"
        >
          S
        </span>

        <div>
          <strong>SYNARA</strong>

          <small>
            Salud personal
          </small>
        </div>
      </div>

      <nav>
        <ul>
          {navigationItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? styles.activeLink
                    : undefined
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span
                  className={
                    styles.navLabel
                  }
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}