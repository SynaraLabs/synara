import { useNavigate } from 'react-router-dom';

import styles from '../dashboard.module.css';

const actions = [
  {
    title: 'Registrar migraña',
    description:
      'Registrá las fases, el dolor, los síntomas y el tratamiento.',
    path: '/migraine',
    icon: '◉',
    isPrimary: true,
  },
  {
    title: 'Registrar ansiedad',
    description:
      'Anotá la intensidad, los síntomas y los posibles desencadenantes.',
    path: '/anxiety',
    icon: '≈',
    isPrimary: false,
  },
  {
    title: 'Ataque de pánico',
    description:
      'Registrá el episodio, su duración y el contexto en que ocurrió.',
    path: '/panic',
    icon: '!',
    isPrimary: false,
  },
  {
    title: 'Nuevo diario',
    description:
      'Escribí cómo te sentís y qué ocurrió durante el día.',
    path: '/journal',
    icon: '✎',
    isPrimary: false,
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section
      className={styles.section}
      aria-labelledby="quick-actions-title"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>
            Registro rápido
          </p>

          <h2 id="quick-actions-title">
            ¿Qué querés registrar?
          </h2>
        </div>

        <span className={styles.sectionHint}>
          Elegí una opción para comenzar
        </span>
      </div>

      <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <button
            key={action.path}
            className={`${styles.actionCard} ${
              action.isPrimary
                ? styles.primaryActionCard
                : ''
            }`}
            type="button"
            onClick={() => navigate(action.path)}
          >
            <span
              className={styles.actionIcon}
              aria-hidden="true"
            >
              {action.icon}
            </span>

            <span className={styles.actionContent}>
              <span className={styles.actionTitleRow}>
                <h3>{action.title}</h3>

                {action.isPrimary && (
                  <span className={styles.primaryBadge}>
                    Principal
                  </span>
                )}
              </span>

              <p>{action.description}</p>
            </span>

            <span
              className={styles.actionArrow}
              aria-hidden="true"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}