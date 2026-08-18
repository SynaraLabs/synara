import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

import {
  FREQUENT_NON_PHARMACOLOGICAL_MEASURES,
  NON_PHARMACOLOGICAL_CATEGORY_LABELS,
  NON_PHARMACOLOGICAL_CATEGORY_ORDER,
  NON_PHARMACOLOGICAL_MEASURE_CATALOG,
  NON_PHARMACOLOGICAL_MEASURE_LABELS,
  type NonPharmacologicalMeasure,
} from '../../data/nonPharmacologicalMeasureCatalog';

export interface NonPharmacologicalRecord {
  id: string;

  measures:
    NonPharmacologicalMeasure[];

  appliedAt: string;

  notes?: string;
}

interface Props {
  records?: NonPharmacologicalRecord[];

  onRegister: (
    measures:
      NonPharmacologicalMeasure[],
    appliedAt: string,
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

const formatAppliedTime = (
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

export function NonPharmacologicalCard({
  records = [],
  onRegister,
}: Props) {
  const [
    selectedMeasures,
    setSelectedMeasures,
  ] = useState<
    NonPharmacologicalMeasure[]
  >([]);

  const [
    appliedAt,
    setAppliedAt,
  ] = useState(
    getCurrentLocalDateTime,
  );

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    showAllMeasures,
    setShowAllMeasures,
  ] = useState(false);

  const [
    showNotes,
    setShowNotes,
  ] = useState(false);

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

  const handleToggle = (
    measure:
      NonPharmacologicalMeasure,
  ) => {
    setSelectedMeasures(
      currentMeasures =>
        currentMeasures.includes(
          measure,
        )
          ? currentMeasures.filter(
              currentMeasure =>
                currentMeasure !==
                measure,
            )
          : [
              ...currentMeasures,
              measure,
            ],
    );
  };

  const handleRegister = () => {
    if (
      selectedMeasures.length === 0 ||
      !appliedAt
    ) {
      return;
    }

    onRegister(
      selectedMeasures,
      appliedAt,
      notes.trim(),
    );

    setSelectedMeasures([]);
    setNotes('');
    setShowNotes(false);
    setAppliedAt(
      getCurrentLocalDateTime(),
    );
  };

  const renderMeasureButton = (
    measure:
      (typeof NON_PHARMACOLOGICAL_MEASURE_CATALOG)[number],
  ) => {
    const isActive =
      selectedMeasures.includes(
        measure.value,
      );

    return (
      <button
        key={measure.value}
        type="button"
        className={
          isActive
            ? styles.active
            : ''
        }
        aria-pressed={isActive}
        onClick={() =>
          handleToggle(
            measure.value,
          )
        }
      >
        {measure.label}
      </button>
    );
  };

  const frequentMeasures =
    NON_PHARMACOLOGICAL_MEASURE_CATALOG.filter(
      definition =>
        FREQUENT_NON_PHARMACOLOGICAL_MEASURES.includes(
          definition.value,
        ),
    );

  const lastRecord =
    records.at(-1);

  return (
    <div
      className={
        styles.reliefCard
      }
    >
      <header
        className={
          styles.reliefHeader
        }
      >
        <div>
          <p
            className={
              styles.painEyebrow
            }
          >
            Alivio
          </p>

          <h2>
            Medidas de alivio
          </h2>

          <p>
            Marcá solo lo que hiciste
            en este momento.
          </p>
        </div>
      </header>

      <section
        className={
          styles.reliefFrequent
        }
      >
        <h3>
          Frecuentes
        </h3>

        <div className={styles.grid}>
          {frequentMeasures.map(
            renderMeasureButton,
          )}
        </div>
      </section>

      <button
        type="button"
        className={
          styles.reliefSecondaryAction
        }
        aria-expanded={
          showAllMeasures
        }
        onClick={() =>
          setShowAllMeasures(
            current =>
              !current,
          )
        }
      >
        {showAllMeasures
          ? 'Ocultar todas las medidas'
          : 'Ver todas las medidas'}
      </button>

      {showAllMeasures &&
        NON_PHARMACOLOGICAL_CATEGORY_ORDER.map(
          category => {
            const categoryMeasures =
              NON_PHARMACOLOGICAL_MEASURE_CATALOG.filter(
                definition =>
                  definition.category ===
                    category &&
                  !definition.frequent,
              );

            if (
              categoryMeasures.length ===
              0
            ) {
              return null;
            }

            return (
              <section
                key={category}
                className={
                  styles.reliefCategory
                }
              >
                <h3>
                  {
                    NON_PHARMACOLOGICAL_CATEGORY_LABELS[
                      category
                    ]
                  }
                </h3>

                <div
                  className={
                    styles.grid
                  }
                >
                  {categoryMeasures.map(
                    renderMeasureButton,
                  )}
                </div>
              </section>
            );
          },
        )}

      <div
        className={
          styles.reliefSelectionStatus
        }
        aria-live="polite"
      >
        {selectedMeasures.length === 0
          ? 'Ninguna medida seleccionada'
          : `${selectedMeasures.length} ${
              selectedMeasures.length ===
              1
                ? 'medida seleccionada'
                : 'medidas seleccionadas'
            }`}
      </div>

      <label
        className={
          styles.reliefDateField
        }
      >
        <span>
          Fecha y hora
        </span>

        <input
          type="datetime-local"
          value={appliedAt}
          onChange={event =>
            setAppliedAt(
              event.target.value,
            )
          }
        />
      </label>

      <button
        type="button"
        className={
          styles.reliefSecondaryAction
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
            styles.reliefNotes
          }
        >
          <span>
            Nota opcional
          </span>

          <textarea
            value={notes}
            placeholder="Ej.: descansé en una habitación oscura durante una hora"
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
          styles.reliefPrimaryAction
        }
        disabled={
          selectedMeasures.length ===
            0 ||
          !appliedAt
        }
        onClick={handleRegister}
      >
        Registrar medidas
      </button>

      {lastRecord && (
        <section
          className={
            styles.reliefHistory
          }
        >
          <button
            type="button"
            className={
              styles.reliefHistoryToggle
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
                Último registro
              </small>

              <strong>
                {lastRecord.measures
                  .map(
                    measure =>
                      NON_PHARMACOLOGICAL_MEASURE_LABELS[
                        measure
                      ],
                  )
                  .join(', ')}
              </strong>
            </span>

            <span>
              {formatAppliedTime(
                lastRecord.appliedAt,
              )}
            </span>
          </button>

          {showHistory && (
            <div
              className={
                styles.reliefHistoryList
              }
            >
              <p>
                {records.length}{' '}
                {records.length === 1
                  ? 'registro'
                  : 'registros'}
              </p>

              <ul>
                {records.map(record => (
                  <li key={record.id}>
                    <strong>
                      {record.measures
                        .map(
                          measure =>
                            NON_PHARMACOLOGICAL_MEASURE_LABELS[
                              measure
                            ],
                        )
                        .join(', ')}
                    </strong>

                    <small>
                      {formatAppliedTime(
                        record.appliedAt,
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