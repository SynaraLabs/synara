import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from './PostdromeSelector.module.css';

import type {
  PhaseTime,
  PostdromeSymptom,
  PostdromeUpdateData,
  RecordMode,
  RecoveryLevel,
  TimePrecision,
} from '../types/migraine.types';

import { useMigraineStore } from '../store/migraine.store';

import { postdromeSymptomLabels } from '../../history/utils/migraineLabels';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import {
  PostdromeInitialFlow,
} from './postdrome/PostdromeInitialFlow';

import {
  PostdromeUpdateFlow,
} from './postdrome/PostdromeUpdateFlow';

import evolutionStyles from './postdrome/PostdromeEvolution.module.css';


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


interface PostdromeSelectorProps {
  onComplete?: () => void;
}


export function PostdromeSelector({
  onComplete,
}: PostdromeSelectorProps) {
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

  const [
    showEvolution,
    setShowEvolution,
  ] = useState(false);


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

  const isFirstUpdate =
    updates.length === 0 &&
    postdrome.present &&
    !isEnded;


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

      onComplete?.();
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

    onComplete?.();
  };


  const handleContinue = () => {
    setShowEndSelector(false);
  };


  if (!postdrome.present) {
    return (
      <section
        className={styles.emptyState}
      >
        <h3>
          Después de la crisis
        </h3>

        <p className={styles.helperText}>
          Registraste que esta crisis
          no tuvo postdromo.
        </p>
      </section>
    );
  }


  return (
    <section className={styles.root}>
      {isEnded && (
        <div className={styles.introduction}>
          <h3>
            Después de la crisis
          </h3>

          <p>
            El postdromo comenzó cuando
            terminó la crisis. Puede cambiar
            durante varias horas o días.
          </p>
        </div>
      )}

      <p className={styles.startInfo}>
        Inicio del postdromo:{' '}

        <strong>
          {formatDateTime(
            postdromeStart,
            postdrome.time?.start
              ?.precision,
          )}
        </strong>
      </p>


      {!isEnded && (
        <>
          {isFirstUpdate ? (
            <PostdromeInitialFlow
              selectedSymptoms={
                draftSymptoms
              }
              recoveryLevel={
                draftRecoveryLevel
              }
              dateTime={
                updateDateTime
              }
              minDateTime={
                toLocalDateTimeValue(
                  postdromeStart,
                )
              }
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              notes={draftNotes}
              onToggleSymptom={
                toggleDraftSymptom
              }
              onRecoveryLevelChange={value => {
                setDraftRecoveryLevel(value);
                setFeedback('');
              }}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onNotesChange={value => {
                setDraftNotes(value);
                setFeedback('');
              }}
              onSave={
                handleRegisterUpdate
              }
            />
          ) : !showEndSelector ? (
            <PostdromeUpdateFlow
              currentSymptoms={
                currentSymptoms
              }
              selectedSymptoms={
                draftSymptoms
              }
              currentRecoveryLevel={
                postdrome.recoveryLevel ??
                ''
              }
              recoveryLevel={
                draftRecoveryLevel
              }
              dateTime={
                updateDateTime
              }
              minDateTime={
                toLocalDateTimeValue(
                  postdromeStart,
                )
              }
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              notes={draftNotes}
              onToggleSymptom={
                toggleDraftSymptom
              }
              onResetDraft={() => {
                setDraftSymptoms(
                  currentSymptoms,
                );
                setDraftRecoveryLevel(
                  postdrome.recoveryLevel ??
                  '',
                );
                setDraftNotes('');
                setFeedback('');
              }}
              onRecoveryLevelChange={value => {
                setDraftRecoveryLevel(value);
                setFeedback('');
              }}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onNotesChange={value => {
                setDraftNotes(value);
                setFeedback('');
              }}
              onSave={
                handleRegisterUpdate
              }
              onOpenEnd={() => {
                setShowEndSelector(
                  true,
                );
                setFeedback('');
              }}
            />
          ) : null}
        </>
      )}


      {feedback && (
        <p
          className={styles.feedback}
          aria-live="polite"
        >
          {feedback}
        </p>
      )}


      {visibleUpdates.length > 0 && (
        <section
          className={
            evolutionStyles.evolutionSection
          }
        >
          <button
            type="button"
            className={
              evolutionStyles.evolutionToggle
            }
            aria-expanded={
              showEvolution
            }
            onClick={() =>
              setShowEvolution(
                current =>
                  !current,
              )
            }
          >
            <span>
              {showEvolution
                ? 'Ocultar evolución'
                : 'Ver evolución'}
            </span>

            <span aria-hidden="true">
              {showEvolution
                ? '−'
                : '+'}
            </span>
          </button>

          {showEvolution && (
            <div
              className={
                evolutionStyles.evolutionContent
              }
            >
              <h4>
                Evolución del postdromo
              </h4>

          <ul className={evolutionStyles.updateList}>
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
                    className={evolutionStyles.updateCard}
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
            </div>
          )}
        </section>
      )}


      {!isEnded &&
        isFirstUpdate &&
        !showEndSelector && (
          <button
            type="button"
            className={styles.completeAction}
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
          className={styles.completedState}
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