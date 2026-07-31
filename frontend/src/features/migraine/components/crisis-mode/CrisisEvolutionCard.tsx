import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

import type {
  CrisisPhase,
} from '../../types/migraine.types';

import {
  getCrisisEvolution,
  type CrisisEvolutionRecord,
} from '../../utils/crisisEvolution';

interface Props {
  crisis: CrisisPhase;
}

const INITIAL_VISIBLE_RECORDS = 8;

const formatTimestamp = (
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

const getRecordTitle = (
  record:
    CrisisEvolutionRecord,
): string => {
  if (
    record.type ===
    'intensity'
  ) {
    return `Dolor ${record.intensity}/10`;
  }

  if (
    record.type ===
    'location'
  ) {
    return 'Cambio de localización';
  }

  return record.symptomAction ===
    'removed'
    ? 'Síntoma retirado'
    : 'Síntoma agregado';
};

const getRecordDetail = (
  record:
    CrisisEvolutionRecord,
): string | undefined => {
  if (
    record.type ===
      'location' &&
    record.locations &&
    record.locations.length > 0
  ) {
    return record.locations.join(
      ', ',
    );
  }

  if (
    record.type ===
      'symptom' &&
    record.symptomLabel
  ) {
    return record.symptomLabel;
  }

  return undefined;
};

export function CrisisEvolutionCard({
  crisis,
}: Props) {
  const [
    showCompleteEvolution,
    setShowCompleteEvolution,
  ] = useState(false);

  const evolution =
    getCrisisEvolution(
      crisis,
    );

  const visibleEvolution =
    showCompleteEvolution
      ? evolution
      : evolution.slice(
          -INITIAL_VISIBLE_RECORDS,
        );

  return (
    <section
      className={styles.card}
      aria-labelledby="crisis-evolution-title"
    >
      <header>
        <h2 id="crisis-evolution-title">
          Evolución de la crisis
        </h2>

        <p>
          Dolor, localización y
          síntomas ordenados por
          fecha y hora.
        </p>
      </header>

      {evolution.length === 0 ? (
        <p>
          Todavía no hay
          actualizaciones para mostrar.
        </p>
      ) : (
        <>
          <p>
            {evolution.length}{' '}
            {evolution.length === 1
              ? 'actualización registrada'
              : 'actualizaciones registradas'}
          </p>

          <ol>
            {visibleEvolution.map(
              record => {
                const detail =
                  getRecordDetail(
                    record,
                  );

                return (
                  <li key={record.id}>
                    <div>
                      <time
                        dateTime={
                          record.timestamp
                        }
                      >
                        {formatTimestamp(
                          record.timestamp,
                        )}
                      </time>
                    </div>

                    <strong>
                      {getRecordTitle(
                        record,
                      )}
                    </strong>

                    {detail && (
                      <div>
                        {detail}
                      </div>
                    )}

                    {record.type ===
                      'symptom' &&
                      record.activeSymptoms && (
                        <div>
                          Síntomas activos
                          después del cambio:{' '}
                          {
                            record
                              .activeSymptoms
                              .length
                          }
                        </div>
                      )}
                  </li>
                );
              },
            )}
          </ol>

          {evolution.length >
            INITIAL_VISIBLE_RECORDS && (
            <button
              type="button"
              aria-expanded={
                showCompleteEvolution
              }
              onClick={() =>
                setShowCompleteEvolution(
                  current =>
                    !current,
                )
              }
            >
              {showCompleteEvolution
                ? 'Mostrar últimas actualizaciones'
                : 'Mostrar evolución completa'}
            </button>
          )}
        </>
      )}
    </section>
  );
}