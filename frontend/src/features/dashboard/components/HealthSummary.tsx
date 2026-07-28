import {
  useProfileStore,
} from '../../profile/store/profile.store';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import styles from '../dashboard.module.css';

const healthIcons = {
  sleep: '☾',
  stress: '≈',
  pain: '◉',
};

export function HealthSummary() {
  const profile = useProfileStore(
    state => state.profile,
  );

  const crisis = useMigraineStore(
    state => state.episode.crisis,
  );

  const sleepHours =
    profile.lifestyle?.averageSleepHours;

  const baselineStress =
    profile.emotionalContext?.baselineStress;

  const healthData = [
    {
      label: 'Sueño',
      value:
        sleepHours !== undefined
          ? `${sleepHours} h`
          : 'Sin registrar',
      description: 'Promedio habitual',
      icon: healthIcons.sleep,
      status: 'neutral',
    },
    {
      label: 'Estrés',
      value:
        baselineStress !== undefined
          ? `${baselineStress}/10`
          : 'Sin registrar',
      description: 'Nivel habitual',
      icon: healthIcons.stress,
      status:
        baselineStress !== undefined &&
        baselineStress >= 7
          ? 'warning'
          : 'neutral',
    },
    {
      label: 'Dolor',
      value: `${crisis.intensity} / 10`,
      description: crisis.active
        ? 'Crisis activa'
        : 'Sin crisis activa',
      icon: healthIcons.pain,
      status: crisis.active
        ? 'active'
        : 'neutral',
    },
  ];

  return (
    <section
      className={styles.section}
      aria-labelledby="health-summary-title"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>
            Resumen personal
          </p>

          <h2 id="health-summary-title">
            Estado actual
          </h2>
        </div>

        <span className={styles.sectionHint}>
          Datos de tu perfil y registros
        </span>
      </div>

      <div className={styles.summaryGrid}>
        {healthData.map(item => (
          <article
            key={item.label}
            className={`${styles.summaryCard} ${
              item.status === 'active'
                ? styles.summaryCardActive
                : ''
            } ${
              item.status === 'warning'
                ? styles.summaryCardWarning
                : ''
            }`}
          >
            <div
              className={styles.summaryCardHeader}
            >
              <span
                className={styles.summaryIcon}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <p>{item.label}</p>
            </div>

            <h3>{item.value}</h3>

            <span>{item.description}</span>
          </article>
        ))}
      </div>
    </section>
  );
}