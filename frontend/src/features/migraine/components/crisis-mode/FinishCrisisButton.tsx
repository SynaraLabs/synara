import { useState } from 'react';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from '../common/PhaseEndSelector';

import styles from './crisis-mode.module.css';

export type CrisisEndSelection =
  PhaseEndSelection;

interface Props {
  onFinish: (
    selection?: CrisisEndSelection,
  ) => void;

  crisisStart?: string;
}

export function FinishCrisisButton({
  onFinish,
  crisisStart,
}: Props) {
  const [
    showSelector,
    setShowSelector,
  ] = useState(false);

  const handleOpen = () => {
    setShowSelector(true);
  };

  const handleConfirm = (
    selection: PhaseEndSelection,
  ) => {
    onFinish(selection);
    setShowSelector(false);
  };

  const handleContinue = () => {
    setShowSelector(false);
  };

  if (!showSelector) {
    return (
      <button
        type="button"
        className={styles.secondary}
        onClick={handleOpen}
      >
        Finalizar crisis
      </button>
    );
  }

  return (
    <PhaseEndSelector
      title="¿Cuándo terminó la crisis?"
      startTime={crisisStart}
      onConfirm={handleConfirm}
      onContinue={handleContinue}
    />
  );
}