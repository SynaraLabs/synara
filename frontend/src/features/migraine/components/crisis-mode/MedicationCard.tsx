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

  const [
    showNotes,
    setShowNotes,
  ] = useState(false);

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

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
    setShowNotes(false);
    setTakenAt(
      getCurrentLocalDateTime(),
    );
  };

  const lastRecord =
    records.at(-1);

  return (
    <div
      className={
        styles.medicationCard
      }
    >
      <header
        className={
          styles.medicationHeader
        }
      >
        <div>
          <p
            className={
              styles.painEyebrow
            }
          >
            Tratamiento
          </p>

          <h2>
            Registrar medicación
          </h2>

          <p>
            Anotá la toma. Podés dejar
            dosis y notas vacías.
          </p>
        </div>
      </header>

      <label
        className={
          styles.medicationMainField
        }
      >
        <span>
          Medicamento
        </span>

        <input
          type="text"
          value={medication}
          placeholder="Ej.: ibuprofeno"
          autoComplete="off"
          autoFocus
          onChange={event =>
            setMedication(
              event.target.value,
            )
          }
        />
      </label>

      <div
        className={
          styles.medicationMetaGrid
        }
      >
        <label>
          <span>
            Dosis
            <small>
              Opcional
            </small>
          </span>

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
          <span>
            Fecha y hora
          </span>

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
      </div>

      <button
        type="button"
        className={
          styles.medicationSecondaryAction
        }
        aria-expanded={showNotes}
        onClick={() =>
          setShowNotes(
            current => !current,
          )
        }
      >
        {showNotes
          ? 'Ocultar nota'
          : 'Agregar nota'}
      </button>

      {showNotes && (
        <label
          className={
            styles.medicationNotes
          }
        >
          <span>
            Nota opcional
          </span>

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
      )}

      <button
        type="button"
        className={
          styles.medicationPrimaryAction
        }
        onClick={handleRegister}
        disabled={
          !medication.trim() ||
          !takenAt
        }
      >
        Registrar medicación
      </button>

      {lastRecord && (
        <section
          className={
            styles.medicationHistory
          }
        >
          <button
            type="button"
            className={
              styles.medicationHistoryToggle
            }
            aria-expanded={
              showHistory
            }
            onClick={() =>
              setShowHistory(
                current => !current,
              )
            }
          >
            <span>
              <small>
                Última toma
              </small>

              <strong>
                {lastRecord.medication}
                {lastRecord.dose
                  ? ` · ${lastRecord.dose}`
                  : ''}
              </strong>
            </span>

            <span>
              {formatMedicationTime(
                lastRecord.takenAt,
              )}
            </span>
          </button>

          {showHistory && (
            <div
              className={
                styles.medicationHistoryList
              }
            >
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
                      <span>
                        {record.dose}
                      </span>
                    )}

                    <small>
                      {formatMedicationTime(
                        record.takenAt,
                      )}
                    </small>

                    {record.notes && (
                      <p>
                        {record.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}