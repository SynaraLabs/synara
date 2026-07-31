import {
  useState,
} from 'react';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from '../common/PhaseEndSelector';

import styles from './crisis-mode.module.css';

export interface CrisisEndSelection
  extends PhaseEndSelection {
  hadPostdrome: true;
}

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

  const handleEndTimeConfirm = (
    selection: PhaseEndSelection,
  ) => {
    /*
     * El postdromo comienza siempre
     * en el mismo momento en que
     * termina la crisis.
     *
     * Si luego la usuaria confirma que
     * no tuvo postdromo, el episodio se
     * cerrará usando esta misma fecha
     * y hora.
     */
    onFinish({
      ...selection,
      hadPostdrome: true,
    });

    setShowSelector(false);
  };

  const handleContinueCrisis =
    () => {
      setShowSelector(false);
    };

  if (!showSelector) {
    return (
      <button
        type="button"
        className={
          styles.secondary
        }
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
      onConfirm={
        handleEndTimeConfirm
      }
      onContinue={
        handleContinueCrisis
      }
    />
  );
}