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
    label: 'Registrar',
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
    icon: '♙',
  },
];

export function Sidebar() {
  return (
    <aside
      className={
        styles.sidebar
      }
      aria-label="Navegación principal"
    >
      <div
        className={
          styles.sidebarBrand
        }
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
          <strong>
            SYNARA
          </strong>

          <small>
            Migraña personal
          </small>
        </div>
      </div>

      <nav>
        <ul>
          {navigationItems.map(
            item => (
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
                  aria-label={
                    item.to ===
                    '/migraine'
                      ? 'Registrar migraña'
                      : item.label
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
            ),
          )}
        </ul>
      </nav>
    </aside>
  );
}