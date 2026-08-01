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

  return (
    <>
      <aside
        className={styles.finishBar}
        aria-label="Acciones de la crisis"
      >
        <div
          className={
            styles.finishBarStatus
          }
        >
          <span aria-hidden="true" />

          <div>
            <strong>
              Crisis activa
            </strong>

            <small>
              El registro continúa
            </small>
          </div>
        </div>

        <button
          type="button"
          className={
            styles.finishBarButton
          }
          onClick={() =>
            setShowSelector(true)
          }
        >
          Finalizar
        </button>
      </aside>

      {showSelector && (
        <div
          className={
            styles.finishSheetBackdrop
          }
          role="presentation"
        >
          <section
            className={
              styles.finishSheet
            }
            role="dialog"
            aria-modal="true"
            aria-label="Finalizar crisis"
          >
            <div
              className={
                styles.finishSheetHandle
              }
              aria-hidden="true"
            />

            <PhaseEndSelector
              title="¿Cuándo terminó la crisis?"
              startTime={crisisStart}
              onConfirm={
                handleEndTimeConfirm
              }
              onContinue={() =>
                setShowSelector(false)
              }
            />
          </section>
        </div>
      )}
    </>
  );
}