import { useState } from 'react';

import styles from './crisis-mode.module.css';

interface Props {

  onFinish: () => void;

}

export function FinishCrisisButton({

  onFinish,

}: Props) {

  const [
    confirm,
    setConfirm,
  ] = useState(false);

  const handleClick = () => {

    if (!confirm) {

      setConfirm(true);

      return;

    }

    onFinish();

  };

  return (

    <button

      type="button"

      className={styles.secondary}

      onClick={handleClick}

    >

      {

        confirm

          ? '¿Confirmar finalización?'

          : 'Finalizar crisis'

      }

    </button>

  );

}