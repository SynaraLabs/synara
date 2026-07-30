import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from '../migraine.module.css';

import type {
  PhaseTime,
  PostdromeSymptom,
  PostdromeUpdateData,
  RecordMode,
  RecoveryLevel,
  TimePrecision,
} from '../types/migraine.types';

import { useMigraineStore } from '../store/migraine.store';

import {
  FREQUENT_POSTDROME_SYMPTOMS,
  POSTDROME_CATEGORY_LABELS,
  POSTDROME_CATEGORY_ORDER,
  POSTDROME_SYMPTOM_CATALOG,
  normalizePostdromeSearch,
  type PostdromeSymptomDefinition,
} from '../data/postdromeSymptomCatalog';

import { postdromeSymptomLabels } from '../../history/utils/migraineLabels';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';


const frequentSymptoms =
  new Set<PostdromeSymptom>(
    FREQUENT_POSTDROME_SYMPTOMS,
  );


const recoveryLevelLabels:
  Record<RecoveryLevel, string> = {
  minimal:
    'Recuperación mínima',

  partial:
    'Recuperación parcial',

  mostlyRecovered:
    'Casi completamente recuperada',

  fullyRecovered:
    'Recuperación completa',
};


const generateId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};


const padNumber = (
  value: number,
): string => {
  return String(value).padStart(
    2,
    '0',
  );
};


const toLocalDateTimeValue = (
  isoDate?: string,
): string => {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const year =
    date.getFullYear();

  const month = padNumber(
    date.getMonth() + 1,
  );

  const day = padNumber(
    date.getDate(),
  );

  const hours = padNumber(
    date.getHours(),
  );

  const minutes = padNumber(
    date.getMinutes(),
  );

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const getCurrentLocalDateTimeValue =
  (): string => {
    return toLocalDateTimeValue(
      new Date().toISOString(),
    );
  };


const parseLocalDateTime = (
  value: string,
): Date | undefined => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  ] = match;

  const year =
    Number(yearValue);

  const month =
    Number(monthValue);

  const day =
    Number(dayValue);

  const hour =
    Number(hourValue);

  const minute =
    Number(minuteValue);

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  );

  const isValid =
    !Number.isNaN(
      date.getTime(),
    ) &&
    date.getFullYear() === year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() ===
      minute;

  return isValid
    ? date
    : undefined;
};


const isValidDate = (
  value?: string,
): value is string => {
  return Boolean(
    value &&
      !Number.isNaN(
        new Date(value).getTime(),
      ),
  );
};


const inferRecordMode = (
  occurredAt: string,
): RecordMode => {
  const difference =
    Math.abs(
      Date.now() -
        new Date(
          occurredAt,
        ).getTime(),
    );

  return difference <= 60_000
    ? 'realTime'
    : 'retrospective';
};


const buildPhaseTime = (
  value: string,
  precision: TimePrecision,
  recordMode: RecordMode,
): PhaseTime => {
  return {
    value,
    precision,
    recordMode,
  };
};


const formatDateTime = (
  value?: string,
  precision?: TimePrecision,
): string => {
  if (!isValidDate(value)) {
    return 'Sin registrar';
  }

  const date =
    new Date(value);

  if (
    precision === 'dateOnly' ||
    precision === 'unknown'
  ) {
    return date.toLocaleDateString(
      'es-AR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};


const getSymptomLabel = (
  symptom: PostdromeSymptom,
): string => {
  return (
    postdromeSymptomLabels[
      symptom
    ] ?? symptom
  );
};


export function PostdromeSelector() {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    showAllSymptoms,
    setShowAllSymptoms,
  ] = useState(false);

  const [
    showEndSelector,
    setShowEndSelector,
  ] = useState(false);

  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<
    PostdromeSymptom[]
  >([]);

  const [
    draftRecoveryLevel,
    setDraftRecoveryLevel,
  ] = useState<
    RecoveryLevel | ''
  >('');

  const [
    draftNotes,
    setDraftNotes,
  ] = useState('');

  const [
    updateDateTime,
    setUpdateDateTime,
  ] = useState(
    getCurrentLocalDateTimeValue,
  );

  const [
    feedback,
    setFeedback,
  ] = useState('');


  const postdrome =
    useMigraineStore(
      state =>
        state.episode.postdrome,
    );

  const timeline =
    useMigraineStore(
      state =>
        state.episode.timeline,
    );

  const crisisEnd =
    useMigraineStore(
      state =>
        state.episode.timeline
          ?.crisisEnd ??
        state.episode.crisis
          .endTime ??
        state.episode.crisis.time
          ?.end?.value,
    );

  const updatePostdrome =
    useMigraineStore(
      state =>
        state.updatePostdrome,
    );

  const updateTimeline =
    useMigraineStore(
      state =>
        state.updateTimeline,
    );


  const updates =
    postdrome.updates ?? [];


  const currentSymptoms =
    useMemo(
      () =>
        postdrome.symptoms ?? [],
      [postdrome.symptoms],
    );


  /*
   * El inicio del postdromo coincide
   * siempre con el final de la crisis.
   */
  const postdromeStart =
    timeline?.postdromeStart ??
    postdrome.startTime ??
    postdrome.time?.start
      ?.value ??
    crisisEnd;


  const postdromeEnd =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end
      ?.value;


  const isEnded =
    postdrome.status ===
      'ended' ||
    Boolean(postdromeEnd);


  useEffect(() => {
    setDraftSymptoms(
      currentSymptoms,
    );

    setDraftRecoveryLevel(
      postdrome.recoveryLevel ??
        '',
    );
  }, [
    currentSymptoms,
    postdrome.recoveryLevel,
  ]);


  const allDefinitions =
    useMemo(() => {
      const knownSymptoms =
        new Set<PostdromeSymptom>(
          POSTDROME_SYMPTOM_CATALOG.map(
            definition =>
              definition.value,
          ),
        );

      const legacySymptoms =
        Array.from(
          new Set<PostdromeSymptom>([
            ...currentSymptoms,

            ...draftSymptoms,

            ...updates.flatMap(
              update =>
                update.data
                  .symptoms ?? [],
            ),
          ]),
        ).filter(
          symptom =>
            !knownSymptoms.has(
              symptom,
            ),
        );

      const legacyDefinitions:
        PostdromeSymptomDefinition[] =
        legacySymptoms.map(
          symptom => ({
            value: symptom,

            category: 'other',

            searchTerms: [],
          }),
        );

      return [
        ...POSTDROME_SYMPTOM_CATALOG,
        ...legacyDefinitions,
      ];
    }, [
      currentSymptoms,
      draftSymptoms,
      updates,
    ]);


  const visibleDefinitions =
    useMemo(() => {
      const normalizedQuery =
        normalizePostdromeSearch(
          searchQuery,
        );

      return allDefinitions.filter(
        definition => {
          const isSelected =
            draftSymptoms.includes(
              definition.value,
            );

          if (
            normalizedQuery.length >
            0
          ) {
            const searchableText =
              normalizePostdromeSearch(
                [
                  getSymptomLabel(
                    definition.value,
                  ),

                  definition.value,

                  ...(
                    definition
                      .searchTerms ?? []
                  ),
                ].join(' '),
              );

            return searchableText.includes(
              normalizedQuery,
            );
          }

          if (showAllSymptoms) {
            return true;
          }

          return (
            frequentSymptoms.has(
              definition.value,
            ) ||
            isSelected
          );
        },
      );
    }, [
      allDefinitions,
      draftSymptoms,
      searchQuery,
      showAllSymptoms,
    ]);


  const visibleCategories =
    useMemo(() => {
      return POSTDROME_CATEGORY_ORDER
        .map(category => ({
          category,

          symptoms:
            visibleDefinitions.filter(
              definition =>
                definition.category ===
                category,
            ),
        }))
        .filter(
          group =>
            group.symptoms.length > 0,
        );
    }, [visibleDefinitions]);


  const visibleUpdates =
    useMemo(() => {
      return [...updates]
        .filter(update => {
          return (
            update.data.symptoms
              .length > 0 ||
            Boolean(
              update.data
                .recoveryLevel,
            ) ||
            update.data
              .symptomsStillActive ===
              false ||
            Boolean(
              update.notes?.trim(),
            )
          );
        })
        .sort(
          (
            first,
            second,
          ) => {
            const firstDate =
              first.occurredAt
                .value ??
              first.createdAt;

            const secondDate =
              second.occurredAt
                .value ??
              second.createdAt;

            return (
              new Date(
                firstDate,
              ).getTime() -
              new Date(
                secondDate,
              ).getTime()
            );
          },
        );
    }, [updates]);


  const toggleDraftSymptom = (
    symptom: PostdromeSymptom,
  ) => {
    setFeedback('');

    setDraftSymptoms(
      currentDraft =>
        currentDraft.includes(
          symptom,
        )
          ? currentDraft.filter(
              currentSymptom =>
                currentSymptom !==
                symptom,
            )
          : [
              ...currentDraft,
              symptom,
            ],
    );
  };


  const handleRegisterUpdate =
    () => {
      if (
        !postdrome.present ||
        isEnded
      ) {
        return;
      }

      if (
        !isValidDate(
          postdromeStart,
        )
      ) {
        setFeedback(
          'No se encontró la hora de finalización de la crisis.',
        );

        return;
      }

      const occurredAtDate =
        parseLocalDateTime(
          updateDateTime,
        );

      if (!occurredAtDate) {
        setFeedback(
          'Ingresá una fecha y hora válidas para la actualización.',
        );

        return;
      }

      const occurredAt =
        occurredAtDate
          .toISOString();

      if (
        occurredAtDate.getTime() >
        Date.now()
      ) {
        setFeedback(
          'La actualización no puede registrarse en el futuro.',
        );

        return;
      }

      if (
        occurredAtDate.getTime() <
        new Date(
          postdromeStart,
        ).getTime()
      ) {
        setFeedback(
          'La actualización no puede ser anterior al final de la crisis.',
        );

        return;
      }

      const normalizedNotes =
        draftNotes.trim();

      const hasInformation =
        draftSymptoms.length >
          0 ||
        Boolean(
          draftRecoveryLevel,
        ) ||
        Boolean(
          normalizedNotes,
        );

      if (!hasInformation) {
        setFeedback(
          'Seleccioná al menos un síntoma, un nivel de recuperación o agregá una nota.',
        );

        return;
      }

      const now =
        new Date().toISOString();

      const recordMode =
        inferRecordMode(
          occurredAt,
        );

      const updateData:
        PostdromeUpdateData = {
        symptoms:
          draftSymptoms,

        symptomsStillActive:
          true,

        ...(draftRecoveryLevel
          ? {
              recoveryLevel:
                draftRecoveryLevel,
            }
          : {}),
      };

      updatePostdrome({
        ...postdrome,

        present: true,

        status: 'active',

        startTime:
          postdromeStart,

        endTime:
          undefined,

        symptoms:
          draftSymptoms,

        recoveryLevel:
          draftRecoveryLevel ||
          postdrome.recoveryLevel,

        time: {
          ...postdrome.time,

          start:
            postdrome.time
              ?.start ??
            buildPhaseTime(
              postdromeStart,
              'exact',
              inferRecordMode(
                postdromeStart,
              ),
            ),

          end: undefined,
        },

        updates: [
          ...updates,

          {
            id: generateId(),

            createdAt: now,

            occurredAt:
              buildPhaseTime(
                occurredAt,
                'exact',
                recordMode,
              ),

            data:
              updateData,

            notes:
              normalizedNotes ||
              undefined,
          },
        ],
      });

      setUpdateDateTime(
        getCurrentLocalDateTimeValue(),
      );

      setDraftNotes('');

      setFeedback(
        'Actualización registrada.',
      );
    };


  const finishPostdrome = (
    selection:
      PhaseEndSelection,
  ) => {
    if (
      !isValidDate(
        postdromeStart,
      )
    ) {
      return;
    }

    const {
      endTime,
      precision,
      recordMode,
    } = selection;

    if (
      !isValidDate(endTime)
    ) {
      return;
    }

    const endTimestamp =
      new Date(
        endTime,
      ).getTime();

    if (
      endTimestamp >
      Date.now()
    ) {
      return;
    }

    if (
      endTimestamp <
      new Date(
        postdromeStart,
      ).getTime()
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    const occurredAt =
      buildPhaseTime(
        endTime,
        precision,
        recordMode,
      );

    const normalizedNotes =
      draftNotes.trim();

    updatePostdrome({
      ...postdrome,

      present: true,

      status: 'ended',

      startTime:
        postdromeStart,

      endTime,

      recoveryLevel:
        'fullyRecovered',

      symptoms:
        draftSymptoms,

      time: {
        ...postdrome.time,

        start:
          postdrome.time
            ?.start ??
          buildPhaseTime(
            postdromeStart,
            'exact',
            inferRecordMode(
              postdromeStart,
            ),
          ),

        end:
          occurredAt,
      },

      updates: [
        ...updates,

        {
          id: generateId(),

          createdAt: now,

          occurredAt,

          data: {
            symptoms:
              draftSymptoms,

            recoveryLevel:
              'fullyRecovered',

            symptomsStillActive:
              false,
          },

          notes:
            normalizedNotes ||
            undefined,
        },
      ],
    });

    updateTimeline({
      postdromeStart,

      postdromeEnd:
        endTime,
    });

    setDraftRecoveryLevel(
      'fullyRecovered',
    );

    setDraftNotes('');

    setShowEndSelector(
      false,
    );

    setFeedback(
      'Recuperación completa registrada.',
    );
  };


  const handleContinue = () => {
    setShowEndSelector(false);
  };


  if (!postdrome.present) {
    return (
      <section>
        <h3>
          Después de la crisis
        </h3>

        <p
          className={
            styles.helperText
          }
        >
          Registraste que esta crisis
          no tuvo postdromo.
        </p>
      </section>
    );
  }


  return (
    <section>
      <h3>
        Después de la crisis
      </h3>

      <p>
        El postdromo comenzó cuando
        terminó la crisis. Puede cambiar
        durante varias horas o días.
      </p>

      <p
        className={
          styles.helperText
        }
      >
        Inicio del postdromo:{' '}

        {formatDateTime(
          postdromeStart,
          postdrome.time?.start
            ?.precision,
        )}
      </p>


      {!isEnded && (
        <>
          <h4>
            ¿Cómo te sentís en esta
            actualización?
          </h4>

          <p
            className={
              styles.helperText
            }
          >
            Seleccioná tu estado actual.
            Podés registrar cambios
            diferentes durante todo el
            postdromo.
          </p>


          <label>
            Buscar síntomas del
            postdromo

            <input
              type="search"
              value={
                searchQuery
              }
              placeholder="Ejemplo: agotamiento, niebla mental o sensibilidad a la luz"
              onChange={event => {
                setSearchQuery(
                  event.target.value,
                );

                setFeedback('');
              }}
            />
          </label>


          <button
            type="button"
            onClick={() => {
              setShowAllSymptoms(
                current => !current,
              );

              setFeedback('');
            }}
          >
            {showAllSymptoms
              ? 'Mostrar solo los más frecuentes'
              : 'Mostrar todos los síntomas'}
          </button>


          {visibleCategories.map(
            group => (
              <section
                key={
                  group.category
                }
                className={
                  styles.auraGroup
                }
              >
                <h4>
                  {
                    POSTDROME_CATEGORY_LABELS[
                      group.category
                    ]
                  }
                </h4>

                <div
                  className={
                    styles.symptomGrid
                  }
                  role="group"
                  aria-label={
                    POSTDROME_CATEGORY_LABELS[
                      group.category
                    ]
                  }
                >
                  {group.symptoms.map(
                    definition => (
                      <label
                        key={
                          definition.value
                        }
                        className={
                          styles.symptomOption
                        }
                      >
                        <input
                          type="checkbox"
                          checked={draftSymptoms.includes(
                            definition.value,
                          )}
                          onChange={() =>
                            toggleDraftSymptom(
                              definition.value,
                            )
                          }
                        />

                        <span>
                          {getSymptomLabel(
                            definition.value,
                          )}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </section>
            ),
          )}


          {visibleDefinitions.length ===
            0 && (
            <p
              className={
                styles.helperText
              }
            >
              No encontramos síntomas
              con esa búsqueda.
            </p>
          )}


          <label>
            ¿Cuándo ocurrió esta
            actualización?

            <input
              type="datetime-local"
              value={
                updateDateTime
              }
              min={
                toLocalDateTimeValue(
                  postdromeStart,
                )
              }
              max={
                getCurrentLocalDateTimeValue()
              }
              onChange={event => {
                setUpdateDateTime(
                  event.target.value,
                );

                setFeedback('');
              }}
            />
          </label>


          <label>
            Nivel de recuperación

            <select
              value={
                draftRecoveryLevel
              }
              onChange={event => {
                setDraftRecoveryLevel(
                  event.target.value as
                    | RecoveryLevel
                    | '',
                );

                setFeedback('');
              }}
            >
              <option value="">
                Sin indicar
              </option>

              <option value="minimal">
                Recuperación mínima
              </option>

              <option value="partial">
                Recuperación parcial
              </option>

              <option value="mostlyRecovered">
                Casi completamente
                recuperada
              </option>
            </select>
          </label>


          <label>
            Nota de esta actualización

            <textarea
              value={
                draftNotes
              }
              onChange={event => {
                setDraftNotes(
                  event.target.value,
                );

                setFeedback('');
              }}
              placeholder="Ejemplo: dormí dos horas y la niebla mental disminuyó"
              rows={3}
            />
          </label>


          <button
            type="button"
            onClick={
              handleRegisterUpdate
            }
          >
            Registrar actualización
          </button>
        </>
      )}


      {feedback && (
        <p
          className={
            styles.helperText
          }
          aria-live="polite"
        >
          {feedback}
        </p>
      )}


      {visibleUpdates.length >
        0 && (
        <section>
          <h4>
            Evolución del postdromo
          </h4>

          <ul>
            {visibleUpdates.map(
              update => {
                const updateTime =
                  update.occurredAt
                    .value ??
                  update.createdAt;

                const symptoms =
                  update.data
                    .symptoms;

                const recoveryLevel =
                  update.data
                    .recoveryLevel;

                return (
                  <li
                    key={
                      update.id
                    }
                  >
                    <p>
                      <b>
                        {formatDateTime(
                          updateTime,
                          update
                            .occurredAt
                            .precision,
                        )}
                      </b>
                    </p>

                    <p>
                      <b>
                        Síntomas:
                      </b>{' '}

                      {symptoms.length >
                      0
                        ? symptoms
                            .map(
                              getSymptomLabel,
                            )
                            .join(', ')
                        : 'Sin síntomas seleccionados'}
                    </p>

                    {recoveryLevel && (
                      <p>
                        <b>
                          Recuperación:
                        </b>{' '}

                        {
                          recoveryLevelLabels[
                            recoveryLevel
                          ]
                        }
                      </p>
                    )}

                    {update.notes && (
                      <p>
                        <b>
                          Nota:
                        </b>{' '}

                        {
                          update.notes
                        }
                      </p>
                    )}

                    {update.data
                      .symptomsStillActive ===
                      false && (
                      <p>
                        Recuperación
                        completa.
                      </p>
                    )}
                  </li>
                );
              },
            )}
          </ul>
        </section>
      )}


      {!isEnded &&
        !showEndSelector && (
          <button
            type="button"
            onClick={() =>
              setShowEndSelector(
                true,
              )
            }
          >
            Indicar recuperación
            completa
          </button>
        )}


      {!isEnded &&
        showEndSelector && (
          <PhaseEndSelector
            title="¿Cuándo terminó el postdromo?"
            startTime={
              postdromeStart
            }
            onConfirm={
              finishPostdrome
            }
            onContinue={
              handleContinue
            }
          />
        )}


      {isEnded && (
        <p
          className={
            styles.helperText
          }
        >
          Recuperación completa:{' '}

          {formatDateTime(
            postdromeEnd,
            postdrome.time?.end
              ?.precision,
          )}
        </p>
      )}
    </section>
  );
}