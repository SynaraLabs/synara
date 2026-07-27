import styles from './crisis-mode.module.css';

import type {
  CrisisPhase,
} from '../../types/migraine.types';

interface Props {
  crisis: CrisisPhase;
  onChange: (value: string) => void;
  onRegister: () => void;
}

export function PainCard({
  crisis,
  onChange,
  onRegister,
}: Props) {
  return (
    <div className={styles.card}>
      <h2>
        Dolor actual
      </h2>

      <strong>
        {crisis.intensity}/10
      </strong>

      <input
        type="range"
        min="0"
        max="10"
        value={crisis.intensity}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

      <button
        type="button"
        className={styles.primary}
        onClick={onRegister}
      >
        Registrar actualización
      </button>
    </div>
  );
}