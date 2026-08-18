import {
  useMemo,
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

const INITIAL_VISIBLE_GROUPS = 6;

type SymptomEvolutionRecord =
  CrisisEvolutionRecord & {
    type: 'symptom';
  };

interface EvolutionGroup {
  id: string;

  timestamp: string;

  records:
    CrisisEvolutionRecord[];

  kind:
    | 'single'
    | 'symptoms';
}

const isSymptomEvolutionRecord = (
  record:
    CrisisEvolutionRecord,
): record is SymptomEvolutionRecord => {
  return record.type === 'symptom';
};

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

const groupEvolution = (
  evolution:
    CrisisEvolutionRecord[],
): EvolutionGroup[] => {
  const groups:
    EvolutionGroup[] = [];

  evolution.forEach(record => {
    const previousGroup =
      groups.at(-1);

    const canJoinPrevious =
      record.type === 'symptom' &&
      previousGroup?.kind ===
        'symptoms' &&
      previousGroup.records.at(-1)
        ?.type === 'symptom' &&
      previousGroup.records.at(-1)
        ?.symptomAction ===
        record.symptomAction &&
      formatTimestamp(
        previousGroup.timestamp,
      ) ===
        formatTimestamp(
          record.timestamp,
        );

    if (canJoinPrevious) {
      previousGroup.records.push(
        record,
      );

      return;
    }

    groups.push({
      id: record.id,
      timestamp:
        record.timestamp,
      records: [record],
      kind:
        record.type ===
        'symptom'
          ? 'symptoms'
          : 'single',
    });
  });

  return groups;
};

interface LocationPart {
  label: string;

  value: string;
}

const getLocationParts = (
  record:
    CrisisEvolutionRecord,
): LocationPart[] => {
  if (
    record.type !==
      'location' ||
    !record.locations ||
    record.locations.length === 0
  ) {
    return [];
  }

  const text =
    record.locations.join(' · ');

  const matches =
    Array.from(
      text.matchAll(
        /(Inicio|Principal|Adicionales):\s*(.*?)(?=\s·\s(?:Inicio|Principal|Adicionales):|$)/g,
      ),
    );

  return matches
    .map(match => ({
      label: match[1],
      value: match[2].trim(),
    }))
    .filter(
      part =>
        part.label &&
        part.value,
    );
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

  const groupedEvolution =
    useMemo(
      () =>
        groupEvolution(
          evolution,
        ),
      [evolution],
    );

  const visibleEvolution =
    showCompleteEvolution
      ? groupedEvolution
      : groupedEvolution.slice(
          -INITIAL_VISIBLE_GROUPS,
        );

  return (
    <section
      className={
        styles.evolutionCard
      }
      aria-labelledby="crisis-evolution-title"
    >
      <header
        className={
          styles.evolutionHeader
        }
      >
        <div>
          <p
            className={
              styles.painEyebrow
            }
          >
            Resumen
          </p>

          <h2
            id="crisis-evolution-title"
          >
            Evolución de la crisis
          </h2>

          <p>
            Dolor, localización y
            síntomas ordenados por
            fecha y hora.
          </p>
        </div>
      </header>

      {evolution.length === 0 ? (
        <p
          className={
            styles.evolutionEmpty
          }
        >
          Todavía no hay
          actualizaciones para mostrar.
        </p>
      ) : (
        <>
          <div
            className={
              styles.evolutionSummary
            }
          >
            <strong>
              {evolution.length}
            </strong>

            <span>
              {evolution.length === 1
                ? 'actualización registrada'
                : 'actualizaciones registradas'}
            </span>
          </div>

          <ol
            className={
              styles.evolutionList
            }
          >
            {visibleEvolution.map(
              group => {
                const firstRecord =
                  group.records[0];

                if (
                  group.kind ===
                    'symptoms' &&
                  firstRecord.type ===
                    'symptom'
                ) {
                  const symptomRecords =
                    group.records.filter(
                      isSymptomEvolutionRecord,
                    );

                  const symptomLabels =
                    symptomRecords
                      .map(
                        record =>
                          record.symptomLabel,
                      )
                      .filter(
                        (
                          label,
                        ): label is string =>
                          Boolean(label),
                      );

                  const lastRecord =
                    symptomRecords.at(-1);

                  const isRemoved =
                    firstRecord.symptomAction ===
                    'removed';

                  return (
                    <li
                      key={group.id}
                      className={
                        styles.evolutionItem
                      }
                    >
                      <div
                        className={
                          styles.evolutionItemTop
                        }
                      >
                        <time
                          dateTime={
                            group.timestamp
                          }
                        >
                          {formatTimestamp(
                            group.timestamp,
                          )}
                        </time>

                        <span
                          className={
                            styles.evolutionCount
                          }
                        >
                          {isRemoved
                            ? `−${symptomRecords.length}`
                            : `+${symptomRecords.length}`}
                        </span>
                      </div>

                      <strong
                        className={
                          styles.evolutionTitle
                        }
                      >
                        {isRemoved
                          ? symptomRecords.length ===
                            1
                            ? 'Síntoma retirado'
                            : 'Síntomas retirados'
                          : symptomRecords.length ===
                            1
                            ? 'Síntoma agregado'
                            : 'Síntomas agregados'}
                      </strong>

                      {symptomLabels.length >
                        0 && (
                        <div
                          className={
                            styles.evolutionSymptomList
                          }
                        >
                          {symptomLabels.map(
                            (
                              label,
                              index,
                            ) => (
                              <span
                                key={`${group.id}-${index}-${label}`}
                              >
                                {label}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                      {lastRecord
                        ?.activeSymptoms && (
                        <p
                          className={
                            styles.evolutionMeta
                          }
                        >
                          {
                            lastRecord
                              .activeSymptoms
                              .length
                          }{' '}
                          {lastRecord
                            .activeSymptoms
                            .length === 1
                            ? 'síntoma activo'
                            : 'síntomas activos'}{' '}
                          después del cambio
                        </p>
                      )}
                    </li>
                  );
                }

                const record =
                  firstRecord;

                const detail =
                  getRecordDetail(
                    record,
                  );

                const locationParts =
                  getLocationParts(
                    record,
                  );

                return (
                  <li
                    key={group.id}
                    className={
                      styles.evolutionItem
                    }
                  >
                    <div
                      className={
                        styles.evolutionItemTop
                      }
                    >
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

                    <strong
                      className={
                        styles.evolutionTitle
                      }
                    >
                      {getRecordTitle(
                        record,
                      )}
                    </strong>

                    {record.type ===
                      'location' &&
                    locationParts.length >
                      0 ? (
                      <div
                        className={
                          styles.evolutionLocation
                        }
                      >
                        {locationParts.map(
                          (
                            part,
                            index,
                          ) => (
                            <div
                              key={`${group.id}-location-${index}`}
                              className={
                                styles.evolutionLocationRow
                              }
                            >
                              <strong>
                                {part.label}
                              </strong>

                              <span>
                                {part.value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      detail && (
                        <p
                          className={
                            styles.evolutionDetail
                          }
                        >
                          {detail}
                        </p>
                      )
                    )}
                  </li>
                );
              },
            )}
          </ol>

          {groupedEvolution.length >
            INITIAL_VISIBLE_GROUPS && (
            <button
              type="button"
              className={
                styles.evolutionToggle
              }
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
                ? 'Mostrar solo lo reciente'
                : 'Ver evolución completa'}
            </button>
          )}
        </>
      )}
    </section>
  );
}