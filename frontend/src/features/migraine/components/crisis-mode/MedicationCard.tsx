import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

export interface CrisisMedicationRecord {
  id: string;

  medication: string;

  dose?: string;

  takenAt: string;

  notes?: string;
}

interface Props {
  records?: CrisisMedicationRecord[];

  onRegister: (
    medication: string,
    dose: string,
    takenAt: string,
    notes: string,
  ) => void;
}

const getCurrentLocalDateTime =
  (): string => {
    const now = new Date();

    const timezoneOffset =
      now.getTimezoneOffset() *
      60_000;

    return new Date(
      now.getTime() -
        timezoneOffset,
    )
      .toISOString()
      .slice(0, 16);
  };

const formatMedicationTime = (
  value: string,
): string => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Horario no disponible';
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

export function MedicationCard({
  records = [],
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

  const [
    takenAt,
    setTakenAt,
  ] = useState(
    getCurrentLocalDateTime,
  );

  const [
    notes,
    setNotes,
  ] = useState('');

  const handleRegister = () => {
    const normalizedMedication =
      medication.trim();

    const normalizedDose =
      dose.trim();

    const normalizedNotes =
      notes.trim();

    if (
      !normalizedMedication ||
      !takenAt
    ) {
      return;
    }

    onRegister(
      normalizedMedication,
      normalizedDose,
      takenAt,
      normalizedNotes,
    );

    setMedication('');
    setDose('');
    setNotes('');
    setTakenAt(
      getCurrentLocalDateTime(),
    );
  };

  return (
    <div className={styles.card}>
      <h2>
        Medicación durante la crisis
      </h2>

      <label>
        Medicamento
        <input
          type="text"
          value={medication}
          placeholder="Ej.: ibuprofeno"
          autoComplete="off"
          onChange={event =>
            setMedication(
              event.target.value,
            )
          }
        />
      </label>

      <label>
        Dosis
        <input
          type="text"
          value={dose}
          placeholder="Ej.: 600 mg"
          autoComplete="off"
          onChange={event =>
            setDose(
              event.target.value,
            )
          }
        />
      </label>

      <label>
        Fecha y hora de la toma
        <input
          type="datetime-local"
          value={takenAt}
          onChange={event =>
            setTakenAt(
              event.target.value,
            )
          }
        />
      </label>

      <label>
        Notas opcionales
        <textarea
          value={notes}
          placeholder="Ej.: lo tomé después de comer"
          rows={3}
          onChange={event =>
            setNotes(
              event.target.value,
            )
          }
        />
      </label>

      <button
        type="button"
        onClick={handleRegister}
        disabled={
          !medication.trim() ||
          !takenAt
        }
      >
        Registrar medicación
      </button>

      {records.length > 0 && (
        <section>
          <h3>
            Medicación registrada
          </h3>

          <p>
            {records.length}{' '}
            {records.length === 1
              ? 'toma registrada'
              : 'tomas registradas'}
          </p>

          <ul>
            {records.map(record => (
              <li key={record.id}>
                <strong>
                  {record.medication}
                </strong>

                {record.dose && (
                  <>
                    {' — '}
                    {record.dose}
                  </>
                )}

                <div>
                  {formatMedicationTime(
                    record.takenAt,
                  )}
                </div>

                {record.notes && (
                  <div>
                    {record.notes}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}