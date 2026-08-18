import {
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

export type FunctionalCapacityLevel =
  | 'normal'
  | 'limited'
  | 'veryLimited'
  | 'unable';

export type AffectedActivity =
  | 'personalCare'
  | 'walking'
  | 'eatingDrinking'
  | 'communicating'
  | 'usingScreens'
  | 'workingStudying'
  | 'householdTasks'
  | 'driving';

export interface FunctionalCapacityRecord {
  id: string;

  level:
    FunctionalCapacityLevel;

  affectedActivities:
    AffectedActivity[];

  occurredAt: string;

  notes?: string;
}

interface Props {
  records?:
    FunctionalCapacityRecord[];

  onRegister: (
    level:
      FunctionalCapacityLevel,
    affectedActivities:
      AffectedActivity[],
    occurredAt: string,
    notes: string,
  ) => void;
}

interface LevelOption {
  value:
    FunctionalCapacityLevel;

  label: string;

  description: string;
}

interface ActivityOption {
  value: AffectedActivity;

  label: string;
}

const LEVEL_OPTIONS:
  readonly LevelOption[] = [
  {
    value: 'normal',
    label: 'Puedo funcionar',
    description:
      'Puedo realizar mis actividades habituales.',
  },
  {
    value: 'limited',
    label: 'Con limitaciones',
    description:
      'Puedo hacer algunas actividades, pero con dificultad.',
  },
  {
    value: 'veryLimited',
    label: 'Muy limitada',
    description:
      'Solo puedo realizar actividades esenciales.',
  },
  {
    value: 'unable',
    label: 'No puedo funcionar',
    description:
      'Necesito detener mis actividades o recibir ayuda.',
  },
];

const ACTIVITY_OPTIONS:
  readonly ActivityOption[] = [
  {
    value: 'personalCare',
    label: 'Cuidado personal',
  },
  {
    value: 'walking',
    label: 'Caminar o moverme',
  },
  {
    value: 'eatingDrinking',
    label: 'Comer o beber',
  },
  {
    value: 'communicating',
    label: 'Hablar o comunicarme',
  },
  {
    value: 'usingScreens',
    label: 'Usar pantallas',
  },
  {
    value: 'workingStudying',
    label: 'Trabajar o estudiar',
  },
  {
    value: 'householdTasks',
    label: 'Tareas del hogar',
  },
  {
    value: 'driving',
    label: 'Conducir',
  },
];

const LEVEL_LABELS:
  Record<
    FunctionalCapacityLevel,
    string
  > = {
  normal:
    'Puedo funcionar',

  limited:
    'Con limitaciones',

  veryLimited:
    'Muy limitada',

  unable:
    'No puedo funcionar',
};

const ACTIVITY_LABELS:
  Record<
    AffectedActivity,
    string
  > = ACTIVITY_OPTIONS.reduce(
  (
    labels,
    activity,
  ) => {
    labels[activity.value] =
      activity.label;

    return labels;
  },
  {} as Record<
    AffectedActivity,
    string
  >,
);

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

const formatOccurredAt = (
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

export function FunctionalCapacityCard({
  records = [],
  onRegister,
}: Props) {
  const [
    level,
    setLevel,
  ] = useState<
    FunctionalCapacityLevel | null
  >(null);

  const [
    affectedActivities,
    setAffectedActivities,
  ] = useState<
    AffectedActivity[]
  >([]);

  const [
    occurredAt,
    setOccurredAt,
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

  const handleActivityToggle = (
    activity: AffectedActivity,
  ) => {
    setAffectedActivities(
      currentActivities =>
        currentActivities.includes(
          activity,
        )
          ? currentActivities.filter(
              currentActivity =>
                currentActivity !==
                activity,
            )
          : [
              ...currentActivities,
              activity,
            ],
    );
  };

  const handleLevelChange = (
    nextLevel:
      FunctionalCapacityLevel,
  ) => {
    setLevel(nextLevel);

    if (nextLevel === 'normal') {
      setAffectedActivities([]);
    }
  };

  const handleRegister = () => {
    if (
      !level ||
      !occurredAt
    ) {
      return;
    }

    onRegister(
      level,
      affectedActivities,
      occurredAt,
      notes.trim(),
    );

    setLevel(null);
    setAffectedActivities([]);
    setNotes('');
    setShowNotes(false);
    setOccurredAt(
      getCurrentLocalDateTime(),
    );
  };

  const lastRecord =
    records.at(-1);

  return (
    <div
      className={
        styles.capacityCard
      }
    >
      <header
        className={
          styles.capacityHeader
        }
      >
        <div>
          <p
            className={
              styles.painEyebrow
            }
          >
            Impacto
          </p>

          <h2>
            Capacidad funcional
          </h2>

          <p>
            ¿Cuánto está limitando
            esta crisis lo que podés
            hacer ahora?
          </p>
        </div>
      </header>

      <section
        className={
          styles.capacityLevels
        }
      >
        <h3>
          Elegí una opción
        </h3>

        <div
          className={
            styles.capacityLevelGrid
          }
        >
          {LEVEL_OPTIONS.map(
            option => {
              const isActive =
                level ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={
                    isActive
                      ? styles.active
                      : ''
                  }
                  aria-pressed={
                    isActive
                  }
                  onClick={() =>
                    handleLevelChange(
                      option.value,
                    )
                  }
                >
                  <strong>
                    {option.label}
                  </strong>

                  <span>
                    {
                      option.description
                    }
                  </span>
                </button>
              );
            },
          )}
        </div>
      </section>

      {level &&
        level !== 'normal' && (
          <section
            className={
              styles.capacityActivities
            }
          >
            <header>
              <h3>
                ¿Qué actividades están
                afectadas?
              </h3>

              <p>
                Podés marcar más de una.
              </p>
            </header>

            <div
              className={
                styles.capacityActivityGrid
              }
            >
              {ACTIVITY_OPTIONS.map(
                activity => {
                  const isActive =
                    affectedActivities.includes(
                      activity.value,
                    );

                  return (
                    <button
                      key={
                        activity.value
                      }
                      type="button"
                      className={
                        isActive
                          ? styles.active
                          : ''
                      }
                      aria-pressed={
                        isActive
                      }
                      onClick={() =>
                        handleActivityToggle(
                          activity.value,
                        )
                      }
                    >
                      {
                        activity.label
                      }
                    </button>
                  );
                },
              )}
            </div>
          </section>
        )}

      <label
        className={
          styles.capacityDateField
        }
      >
        <span>
          Fecha y hora
        </span>

        <input
          type="datetime-local"
          value={occurredAt}
          onChange={event =>
            setOccurredAt(
              event.target.value,
            )
          }
        />
      </label>

      <button
        type="button"
        className={
          styles.capacitySecondaryAction
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
            styles.capacityNotes
          }
        >
          <span>
            Nota opcional
          </span>

          <textarea
            value={notes}
            placeholder="Ej.: tuve que dejar de trabajar y acostarme"
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
          styles.capacityPrimaryAction
        }
        disabled={
          !level ||
          !occurredAt
        }
        onClick={handleRegister}
      >
        Registrar capacidad
      </button>

      {lastRecord && (
        <section
          className={
            styles.capacityHistory
          }
        >
          <button
            type="button"
            className={
              styles.capacityHistoryToggle
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
                Última actualización
              </small>

              <strong>
                {
                  LEVEL_LABELS[
                    lastRecord.level
                  ]
                }
              </strong>
            </span>

            <span>
              {formatOccurredAt(
                lastRecord.occurredAt,
              )}
            </span>
          </button>

          {showHistory && (
            <div
              className={
                styles.capacityHistoryList
              }
            >
              <p>
                {records.length}{' '}
                {records.length === 1
                  ? 'actualización'
                  : 'actualizaciones'}
              </p>

              <ul>
                {records.map(record => (
                  <li key={record.id}>
                    <strong>
                      {
                        LEVEL_LABELS[
                          record.level
                        ]
                      }
                    </strong>

                    <small>
                      {formatOccurredAt(
                        record.occurredAt,
                      )}
                    </small>

                    {record
                      .affectedActivities
                      .length > 0 && (
                      <p>
                        Afecta:{' '}
                        {record
                          .affectedActivities
                          .map(
                            activity =>
                              ACTIVITY_LABELS[
                                activity
                              ],
                          )
                          .join(', ')}
                      </p>
                    )}

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