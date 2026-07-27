import styles from './crisis-mode.module.css';

import type {
  CrisisSymptom,
} from '../../types/migraine.types';

interface SymptomOption {
  value: CrisisSymptom;
  label: string;
}

interface Props {
  symptoms: CrisisSymptom[];
  onToggle: (symptom: CrisisSymptom) => void;
}

const quickSymptoms: SymptomOption[] = [
  {
    value: 'lightSensitivity',
    label: 'Luz molesta',
  },
  {
    value: 'soundSensitivity',
    label: 'Sonidos molestos',
  },
  {
    value: 'nausea',
    label: 'Náuseas',
  },
  {
    value: 'dizziness',
    label: 'Mareo',
  },
  {
    value: 'confusion',
    label: 'Niebla mental',
  },
];

export function SymptomsCard({
  symptoms,
  onToggle,
}: Props) {
  return (
    <div className={styles.card}>
      <h2>
        Síntomas rápidos
      </h2>

      <div className={styles.grid}>
        {quickSymptoms.map(item => {
          const isActive =
            symptoms.includes(item.value);

          return (
            <button
              key={item.value}
              type="button"
              className={
                isActive
                  ? styles.active
                  : ''
              }
              aria-pressed={isActive}
              onClick={() =>
                onToggle(item.value)
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}