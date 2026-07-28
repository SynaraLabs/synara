import {
  useEffect,
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

import { postdromeSymptomLabels } from '../../history/utils/migraineLabels';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import { PhaseDateSelector } from './common/PhaseDateSelector';

const frequentSymptoms:
  readonly PostdromeSymptom[] = [
  'fatigue',
  'brainFog',
  'weakness',
  'moodChange',
  'residualSensitivity',
  'neckDiscomfort',
];

const recoveryLevelLabels: Record<
  RecoveryLevel,
  string
> = {
  minimal: 'Recuperación mínima',
  partial: 'Recuperación parcial',
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

const isValidDate = (
  value?: string,
): value is string => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !Number.isNaN(
      new Date(value).getTime(),
    )
  );
};

const createDateOnlyReference = (
  value: string,
): string | undefined => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
  ] = match;

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  const now = new Date();

  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;

  const date = isToday
    ? now
    : new Date(
        year,
        month - 1,
        day,
        12,
        0,
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
    date.getDate() === day;

  if (
    !isValid ||
    date.getTime() > Date.now()
  ) {
    return undefined;
  }

  return date.toISOString();
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

  const date = new Date(value);

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

export function PostdromeSelector() {
  const [
    showStartDate,
    setShowStartDate,
  ] = useState(false);

  const [
    showEndSelector,
    setShowEndSelector,
  ] = useState(false);

  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<PostdromeSymptom[]>(
    [],
  );

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

  const currentSymptoms =
    postdrome.symptoms ?? [];

  const updates =
    postdrome.updates ?? [];

  const postdromeStart =
    timeline?.postdromeStart ??
    postdrome.startTime ??
    postdrome.time?.start?.value;

  const postdromeEnd =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end?.value;

  const isEnded =
    postdrome.status === 'ended' ||
    Boolean(postdromeEnd);

  /*
   * Al abrir nuevamente la aplicación,
   * el borrador comienza con el último
   * estado persistido del postdromo.
   */
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

  const selectableSymptoms =
    Array.from(
      new Set<PostdromeSymptom>([
        ...frequentSymptoms,
        ...currentSymptoms,
        ...draftSymptoms,
        ...updates.flatMap(
          update =>
            update.data.symptoms ??
            [],
        ),
      ]),
    );

  const visibleUpdates =
    [...updates]
      .filter(update => {
        return (
          update.data.symptoms.length >
            0 ||
          Boolean(
            update.data.recoveryLevel,
          ) ||
          update.data
            .symptomsStillActive ===
            false ||
          Boolean(
            update.notes?.trim(),
          )
        );
      })
      .sort((first, second) => {
        const firstDate =
          first.occurredAt.value ??
          first.createdAt;

        const secondDate =
          second.occurredAt.value ??
          second.createdAt;

        return (
          new Date(
            secondDate,
          ).getTime() -
          new Date(
            firstDate,
          ).getTime()
        );
      });

  const startPostdrome = (
    startTime: string,
    precision: TimePrecision,
    recordMode: RecordMode,
  ) => {
    const startPhaseTime =
      buildPhaseTime(
        startTime,
        precision,
        recordMode,
      );

    updatePostdrome({
      ...postdrome,

      present: true,

      status: 'active',

      startTime,

      endTime: undefined,

      symptoms:
        currentSymptoms,

      time: {
        ...postdrome.time,

        start: startPhaseTime,

        end: undefined,
      },

      /*
       * Iniciar una fase no constituye
       * una actualización clínica.
       * Las actualizaciones solo se
       * crean al pulsar el botón
       * correspondiente.
       */
      updates,
    });

    updateTimeline({
      postdromeStart: startTime,
      postdromeEnd: undefined,
    });

    setShowStartDate(false);

    setFeedback(
      'Postdromo iniciado. Podés registrar cambios durante los próximos días.',
    );
  };

  const handleStartNow = () => {
    startPostdrome(
      new Date().toISOString(),
      'exact',
      'realTime',
    );
  };

  const handleStartDate = (
    date: string,
  ) => {
    const selectedDate =
      createDateOnlyReference(date);

    if (!selectedDate) {
      return;
    }

    startPostdrome(
      selectedDate,
      'dateOnly',
      'retrospective',
    );
  };

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

  const handleRegisterUpdate = () => {
    if (
      !postdrome.present ||
      isEnded
    ) {
      return;
    }

    const normalizedNotes =
      draftNotes.trim();

    const hasInformation =
      draftSymptoms.length > 0 ||
      Boolean(
        draftRecoveryLevel,
      ) ||
      Boolean(normalizedNotes);

    if (!hasInformation) {
      setFeedback(
        'Seleccioná al menos un síntoma, un nivel de recuperación o agregá una nota.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const effectiveStart =
      postdromeStart ?? now;

    const occurredAt =
      buildPhaseTime(
        now,
        'exact',
        'realTime',
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
        postdrome.startTime ??
        effectiveStart,

      endTime: undefined,

      /*
       * La fase conserva el estado más
       * reciente para recuperar el
       * borrador al volver a abrirla.
       */
      symptoms:
        draftSymptoms,

      recoveryLevel:
        draftRecoveryLevel ||
        postdrome.recoveryLevel,

      time: {
        ...postdrome.time,

        start:
          postdrome.time?.start ??
          buildPhaseTime(
            effectiveStart,
            'exact',
            'realTime',
          ),

        end: undefined,
      },

      updates: [
        ...updates,
        {
          id: generateId(),

          createdAt: now,

          occurredAt,

          data: updateData,

          notes:
            normalizedNotes ||
            undefined,
        },
      ],
    });

    if (!postdromeStart) {
      updateTimeline({
        postdromeStart:
          effectiveStart,

        postdromeEnd:
          undefined,
      });
    }

    setDraftNotes('');

    setFeedback(
      'Actualización registrada.',
    );
  };

  const finishPostdrome = (
    selection: PhaseEndSelection,
  ) => {
    const {
      endTime,
      precision,
      recordMode,
    } = selection;

    if (!isValidDate(endTime)) {
      return;
    }

    const endTimestamp =
      new Date(endTime).getTime();

    if (
      endTimestamp > Date.now()
    ) {
      return;
    }

    if (
      isValidDate(postdromeStart) &&
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

      endTime,

      recoveryLevel:
        'fullyRecovered',

      /*
       * El cierre también conserva la
       * última fotografía seleccionada,
       * aunque no se haya registrado
       * previamente como actualización.
       */
      symptoms:
        draftSymptoms,

      time: {
        ...postdrome.time,

        start:
          postdrome.time?.start ??
          (
            postdromeStart
              ? buildPhaseTime(
                  postdromeStart,
                  'exact',
                  'realTime',
                )
              : undefined
          ),

        end: occurredAt,
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
      postdromeEnd: endTime,
    });

    setDraftRecoveryLevel(
      'fullyRecovered',
    );

    setDraftNotes('');

    setShowEndSelector(false);

    setFeedback(
      'Recuperación completa registrada.',
    );
  };

  const handleContinue = () => {
    setShowEndSelector(false);
  };

  return (
    <section>
      <h3>
        Después de la crisis
      </h3>

      <p>
        El postdromo puede cambiar
        durante varias horas o días.
        Registrá una actualización cada
        vez que notes una evolución.
      </p>

      {!postdrome.present && (
        <>
          <p
            className={
              styles.helperText
            }
          >
            Si no tuviste postdromo,
            podés finalizar el episodio
            sin iniciar esta fase.
          </p>

          <div>
            <button
              type="button"
              onClick={handleStartNow}
            >
              Estoy en postdromo ahora
            </button>

            <button
              type="button"
              onClick={() =>
                setShowStartDate(
                  current =>
                    !current,
                )
              }
            >
              Empezó en otra fecha
            </button>
          </div>

          {showStartDate && (
            <PhaseDateSelector
              title="¿Cuándo empezó el postdromo?"
              value={
                postdromeStart
              }
              onChange={
                handleStartDate
              }
            />
          )}
        </>
      )}

      {postdrome.present && (
        <>
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
                ¿Cómo te sentís en este
                momento?
              </h4>

              <p
                className={
                  styles.helperText
                }
              >
                Podés cambiar la
                selección libremente.
                No se guardará hasta que
                registres la
                actualización.
              </p>

              <div
                className={
                  styles.symptomGrid
                }
              >
                {selectableSymptoms.map(
                  symptom => (
                    <label
                      key={symptom}
                      className={
                        styles.symptomOption
                      }
                    >
                      <input
                        type="checkbox"
                        checked={draftSymptoms.includes(
                          symptom,
                        )}
                        onChange={() =>
                          toggleDraftSymptom(
                            symptom,
                          )
                        }
                      />

                      <span>
                        {
                          postdromeSymptomLabels[
                            symptom
                          ]
                        }
                      </span>
                    </label>
                  ),
                )}
              </div>

              <label>
                Nivel de recuperación

                <select
                  value={
                    draftRecoveryLevel
                  }
                  onChange={event =>
                    setDraftRecoveryLevel(
                      event.target
                        .value as
                        | RecoveryLevel
                        | '',
                    )
                  }
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
                Nota de esta
                actualización

                <textarea
                  value={draftNotes}
                  onChange={event =>
                    setDraftNotes(
                      event.target
                        .value,
                    )
                  }
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
                        key={update.id}
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
                                  symptom =>
                                    postdromeSymptomLabels[
                                      symptom
                                    ],
                                )
                                .join(
                                  ', ',
                                )
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
                            <b>Nota:</b>{' '}
                            {update.notes}
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
        </>
      )}
    </section>
  );
}