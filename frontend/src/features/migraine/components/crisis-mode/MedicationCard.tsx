import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';


interface Props {

  onRegister: (
    medication: string,
    dose: string,
  ) => void;

}


export function MedicationCard({

  onRegister,

}: Props) {

  const [
    medication,
    setMedication,
  ] = useState('');

  const [
    dose,
    setDose,
  ] = useState('');

  const handleRegister = () => {

    const normalizedMedication =
      medication.trim();

    const normalizedDose =
      dose.trim();

    if (!normalizedMedication) {

      return;

    }

    onRegister(
      normalizedMedication,
      normalizedDose,
    );

    setMedication('');
    setDose('');

  };

  return (

    <div className={styles.card}>

      <h2>
        Medicación durante la crisis
      </h2>

      <input
        type="text"
        placeholder="Medicamento"
        value={medication}
        onChange={(event) =>
          setMedication(
            event.target.value,
          )
        }
      />

      <input
        type="text"
        placeholder="Dosis (ej: 600 mg)"
        value={dose}
        onChange={(event) =>
          setDose(
            event.target.value,
          )
        }
      />

      <button
        type="button"
        onClick={handleRegister}
        disabled={!medication.trim()}
      >
        Registrar medicación
      </button>

    </div>

  );

}