import {
  NavLink,
} from 'react-router-dom';

import styles from './layout.module.css';

const navigationItems = [
  {
    to: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    icon: '⌂',
    end: true,
  },
  {
    to: '/migraine',
    label: 'Registrar',
    shortLabel: 'Registrar',
    icon: '◉',
  },
  {
    to: '/history',
    label: 'Historial',
    shortLabel: 'Historial',
    icon: '◷',
  },
  {
    to: '/reports',
    label: 'Reportes',
    shortLabel: 'Reportes',
    icon: '▤',
  },
  {
    to: '/triggers',
    label: 'Desencadenantes',
    shortLabel: 'Factores',
    icon: '⌁',
  },
  {
    to: '/profile',
    label: 'Perfil',
    shortLabel: 'Perfil',
    icon: '♙',
  },
];

export function Sidebar() {
  return (
    <aside
      className={styles.sidebar}
      aria-label="Navegación principal"
    >
      <div className={styles.sidebarBrand}>
        <span
          className={styles.sidebarBrandMark}
          aria-hidden="true"
        >
          S
        </span>

        <div>
          <strong>SYNARA</strong>
          <small>Migraña personal</small>
        </div>
      </div>

      <nav>
        <ul>
          {navigationItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? styles.activeLink
                    : undefined
                }
                aria-label={
                  item.to === '/migraine'
                    ? 'Registrar migraña'
                    : item.label
                }
              >
                <span
                  className={styles.navIcon}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span className={styles.navLabel}>
                  <span className={styles.fullLabel}>
                    {item.label}
                  </span>
                  <span className={styles.shortLabel}>
                    {item.shortLabel}
                  </span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}