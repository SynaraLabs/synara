import { useState } from 'react';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from '../common/PhaseEndSelector';

import styles from './crisis-mode.module.css';


export interface CrisisEndSelection
  extends PhaseEndSelection {
  hadPostdrome: boolean;
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

  const [
    pendingEndSelection,
    setPendingEndSelection,
  ] = useState<
    PhaseEndSelection | undefined
  >();


  const handleOpen = () => {
    setShowSelector(true);

    setPendingEndSelection(
      undefined,
    );
  };


  const handleEndTimeConfirm = (
    selection: PhaseEndSelection,
  ) => {
    /*
     * Primero guardamos temporalmente
     * cuándo terminó la crisis.
     *
     * Todavía no finalizamos la fase:
     * antes necesitamos saber si
     * comenzó un postdromo.
     */
    setPendingEndSelection(
      selection,
    );
  };


  const handlePostdromeAnswer = (
    hadPostdrome: boolean,
  ) => {
    if (!pendingEndSelection) {
      return;
    }

    onFinish({
      ...pendingEndSelection,

      /*
       * Si hubo postdromo, su inicio
       * deberá coincidir exactamente
       * con el final de la crisis.
       */
      hadPostdrome,
    });

    setShowSelector(false);

    setPendingEndSelection(
      undefined,
    );
  };


  const handleContinueCrisis =
    () => {
      setShowSelector(false);

      setPendingEndSelection(
        undefined,
      );
    };


  const handleBackToEndTime =
    () => {
      setPendingEndSelection(
        undefined,
      );
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


  if (!pendingEndSelection) {
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


  return (
    <section>
      <h2>
        ¿Tuviste postdromo después de
        la crisis?
      </h2>

      <p>
        El postdromo es el período de
        recuperación que puede incluir
        cansancio, niebla mental,
        sensibilidad residual, mareo u
        otros síntomas.
      </p>

      <p>
        Si hubo postdromo, se
        considerará que comenzó en el
        mismo momento en que terminó la
        crisis.
      </p>


      <button
        type="button"
        onClick={() =>
          handlePostdromeAnswer(
            true,
          )
        }
      >
        Sí, tuve postdromo
      </button>


      <button
        type="button"
        onClick={() =>
          handlePostdromeAnswer(
            false,
          )
        }
      >
        No tuve postdromo
      </button>


      <button
        type="button"
        onClick={
          handleBackToEndTime
        }
      >
        Volver
      </button>


      <button
        type="button"
        onClick={
          handleContinueCrisis
        }
      >
        Cancelar finalización
      </button>
    </section>
  );
}