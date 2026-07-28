import {
  useEffect,
  useState,
} from 'react';

import styles from '../migraine.module.css';

import type {
  PainIntensity,
  PhaseTime,
  PremonitorySymptom,
  PremonitoryUpdateData,
  RecordMode,
  TimePrecision,
} from '../types/migraine.types';

import {
  useMigraineStore,
  type PremonitoryResolution,
} from '../store/migraine.store';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

interface PremonitorySelectorProps {
  context?:
    | 'tracking'
    | 'crisis'
    | 'recovery';
}

interface SymptomOption {
  value: PremonitorySymptom;
  label: string;
}

type EndedPremonitoryOutcome =
  Extract<
    PremonitoryResolution,
    | 'endedWithoutCrisis'
    | 'evolvedToAura'
  >;

const symptomOptions:
  readonly SymptomOption[] = [
  {
    value: 'fatigue',
    label: 'Fatiga o cansancio',
  },
  {
    value: 'yawning',
    label: 'Bostezos frecuentes',
  },
  {
    value: 'moodChange',
    label: 'Cambios de ánimo',
  },
  {
    value: 'irritability',
    label: 'Irritabilidad',
  },
  {
    value: 'brainFog',
    label: 'Niebla mental',
  },
  {
    value: 'foodCraving',
    label: 'Antojos alimentarios',
  },
  {
    value: 'neckStiffness',
    label: 'Rigidez cervical',
  },
  {
    value: 'neckPain',
    label: 'Dolor cervical',
  },
  {
    value: 'thirst',
    label: 'Mayor sensación de sed',
  },
  {
    value: 'sleepiness',
    label: 'Somnolencia',
  },
  {
    value: 'concentrationDifficulty',
    label:
      'Dificultad para concentrarse',
  },
  {
    value: 'mentalSlowness',
    label: 'Lentitud mental',
  },
  {
    value: 'jawTension',
    label: 'Tensión mandibular',
  },
  {
    value: 'shoulderTension',
    label: 'Tensión en hombros',
  },
  {
    value: 'trapeziusTension',
    label: 'Tensión en trapecios',
  },
  {
    value: 'lightSensitivity',
    label: 'Sensibilidad a la luz',
  },
  {
    value: 'soundSensitivity',
    label: 'Sensibilidad al sonido',
  },
  {
    value: 'smellSensitivity',
    label: 'Sensibilidad a olores',
  },
  {
    value: 'mildNausea',
    label: 'Náuseas leves',
  },
  {
    value: 'frequentUrination',
    label:
      'Orinar con más frecuencia',
  },
];

const symptomLabelMap =
  symptomOptions.reduce<
    Partial<
      Record<
        PremonitorySymptom,
        string
      >
    >
  >(
    (labels, symptom) => {
      labels[symptom.value] =
        symptom.label;

      return labels;
    },
    {},
  );

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

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();

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

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(
    minuteValue,
  );

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
    date.getMinutes() === minute;

  return isValid
    ? date
    : undefined;
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

const inferRecordMode = (
  occurredAt: string,
): RecordMode => {
  const difference = Math.abs(
    Date.now() -
      new Date(
        occurredAt,
      ).getTime(),
  );

  return difference <= 60_000
    ? 'realTime'
    : 'retrospective';
};

const getEarlierDate = (
  first?: string,
  second?: string,
): string | undefined => {
  if (!isValidDate(first)) {
    return isValidDate(second)
      ? second
      : undefined;
  }

  if (!isValidDate(second)) {
    return first;
  }

  return new Date(first).getTime() <=
    new Date(second).getTime()
    ? first
    : second;
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

const getSymptomLabel = (
  symptom: PremonitorySymptom,
): string => {
  return (
    symptomLabelMap[symptom] ??
    symptom
  );
};

export function PremonitorySelector({
  context = 'tracking',
}: PremonitorySelectorProps) {
  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<
    PremonitorySymptom[]
  >([]);

  const [
    draftIntensity,
    setDraftIntensity,
  ] = useState('');

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
    showResolutionOptions,
    setShowResolutionOptions,
  ] = useState(false);

  const [
    endingOutcome,
    setEndingOutcome,
  ] = useState<
    EndedPremonitoryOutcome | null
  >(null);

  const [
    showUncertainConfirmation,
    setShowUncertainConfirmation,
  ] = useState(false);

  const premonitory =
    useMigraineStore(
      state =>
        state.episode.premonitory,
    );

  const timeline =
    useMigraineStore(
      state =>
        state.episode.timeline,
    );

  const updatePremonitory =
    useMigraineStore(
      state =>
        state.updatePremonitory,
    );

  const updateTimeline =
    useMigraineStore(
      state =>
        state.updateTimeline,
    );

  const resolvePremonitory =
    useMigraineStore(
      state =>
        state.resolvePremonitory,
    );

  const currentSymptoms =
    premonitory.symptoms ?? [];

  const updates =
    premonitory.updates ?? [];

  const premonitoryStart =
    timeline?.premonitoryStart ??
    premonitory.time?.start?.value;

  const premonitoryEnd =
    timeline?.premonitoryEnd ??
    premonitory.time?.end?.value;

  const isEnded =
    premonitory.status ===
      'ended' ||
    premonitory.status ===
      'uncertain' ||
    Boolean(premonitoryEnd);

  const isFirstUpdate =
    updates.length === 0 &&
    !premonitory.present;

  const isTrackingContext =
    context === 'tracking';

  useEffect(() => {
    setDraftSymptoms(
      currentSymptoms,
    );
  }, [currentSymptoms]);

  /*
   * Al entrar en crisis o recuperación
   * cerramos cualquier menú de
   * desenlace que se hubiera abierto
   * en la etapa previa.
   */
  useEffect(() => {
    if (isTrackingContext) {
      return;
    }

    setShowResolutionOptions(false);
    setEndingOutcome(null);

    setShowUncertainConfirmation(
      false,
    );
  }, [isTrackingContext]);

  const selectableSymptoms =
    Array.from(
      new Set<PremonitorySymptom>([
        ...symptomOptions.map(
          symptom =>
            symptom.value,
        ),

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
    [...updates].sort(
      (
        firstUpdate,
        secondUpdate,
      ) => {
        const firstDate =
          firstUpdate.occurredAt
            .value ??
          firstUpdate.createdAt;

        const secondDate =
          secondUpdate.occurredAt
            .value ??
          secondUpdate.createdAt;

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

  const resolutionTitle =
    endingOutcome ===
    'evolvedToAura'
      ? '¿Cuándo terminaron las señales antes del aura?'
      : '¿Cuándo terminaron las señales?';

  const toggleDraftSymptom = (
    symptom: PremonitorySymptom,
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

    if (
      occurredAtDate.getTime() >
      Date.now()
    ) {
      setFeedback(
        'La actualización no puede registrarse en el futuro.',
      );

      return;
    }

    const normalizedNotes =
      draftNotes.trim();

    const parsedIntensity =
      draftIntensity === ''
        ? undefined
        : Number(draftIntensity);

    const intensity =
      typeof parsedIntensity ===
        'number' &&
      Number.isInteger(
        parsedIntensity,
      ) &&
      parsedIntensity >= 0 &&
      parsedIntensity <= 10
        ? (
            parsedIntensity as
              PainIntensity
          )
        : undefined;

    const hasInformation =
      draftSymptoms.length > 0 ||
      intensity !== undefined ||
      Boolean(normalizedNotes);

    if (!hasInformation) {
      setFeedback(
        'Seleccioná al menos una señal, indicá una intensidad o agregá una nota.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const occurredAt =
      occurredAtDate.toISOString();

    const recordMode =
      inferRecordMode(
        occurredAt,
      );

    const effectiveStart =
      getEarlierDate(
        premonitoryStart,
        occurredAt,
      ) ?? occurredAt;

    const existingStart =
      premonitory.time?.start;

    const shouldUpdateStart =
      !isValidDate(
        existingStart?.value,
      ) ||
      new Date(
        effectiveStart,
      ).getTime() <
        new Date(
          existingStart.value,
        ).getTime();

    const startPhaseTime =
      shouldUpdateStart
        ? buildPhaseTime(
            effectiveStart,
            'exact',
            inferRecordMode(
              effectiveStart,
            ),
          )
        : existingStart;

    const updateData:
      PremonitoryUpdateData = {
      symptoms:
        draftSymptoms,

      symptomsStillActive:
        true,

      ...(intensity !== undefined
        ? {
            intensity,
          }
        : {}),
    };

    updatePremonitory({
      ...premonitory,

      present: true,

      status: 'active',

      symptoms:
        draftSymptoms,

      hoursBeforeAttack:
        undefined,

      endedWithoutCrisis:
        false,

      time: {
        ...premonitory.time,

        start: startPhaseTime,

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

          data: updateData,

          notes:
            normalizedNotes ||
            undefined,
        },
      ],
    });

    updateTimeline({
      premonitoryStart:
        effectiveStart,

      premonitoryEnd:
        undefined,

      episodeStart:
        getEarlierDate(
          timeline?.episodeStart,
          effectiveStart,
        ),
    });

    setUpdateDateTime(
      getCurrentLocalDateTimeValue(),
    );

    setDraftNotes('');

    setFeedback(
      isFirstUpdate
        ? 'Señales iniciadas y primera actualización registrada.'
        : 'Actualización premonitoria registrada.',
    );
  };

  const handleOpenResolution = () => {
    setShowResolutionOptions(true);
    setEndingOutcome(null);

    setShowUncertainConfirmation(
      false,
    );

    setFeedback('');
  };

  const handleCancelResolution = () => {
    setShowResolutionOptions(false);
    setEndingOutcome(null);

    setShowUncertainConfirmation(
      false,
    );
  };

  const handleContinueSignals = () => {
    handleCancelResolution();

    setFeedback(
      'Las señales continúan abiertas.',
    );
  };

  const handleContinueWithAura = () => {
    resolvePremonitory({
      outcome:
        'continuesWithAura',
    });

    handleCancelResolution();

    setFeedback(
      'Las señales seguirán abiertas mientras registrás el aura.',
    );
  };

  const handleConfirmEnd = (
    selection: PhaseEndSelection,
  ) => {
    if (!endingOutcome) {
      return;
    }

    resolvePremonitory({
      outcome: endingOutcome,

      endTime:
        selection.endTime,

      precision:
        selection.precision,

      recordMode:
        selection.recordMode,
    });

    handleCancelResolution();
  };

  const handleConfirmUncertain =
    () => {
      resolvePremonitory({
        outcome: 'uncertain',

        precision: 'unknown',

        recordMode:
          'retrospective',
      });

      handleCancelResolution();
    };

  return (
    <section
      className={
        styles.symptomSelector
      }
    >
      <h3>
        Posibles señales previas
      </h3>

      <p>
        Las señales pueden cambiar
        durante varias horas o días.
        Registrá una actualización cada
        vez que notes una evolución.
      </p>

      {context === 'crisis' &&
        !isEnded && (
          <p
            className={
              styles.helperText
            }
          >
            Estas señales continúan
            durante la crisis. Podés
            seguir registrando cambios
            sin cerrar la fase.
          </p>
        )}

      {context === 'recovery' &&
        !isEnded && (
          <p
            className={
              styles.helperText
            }
          >
            La crisis terminó, pero las
            señales previas todavía
            están abiertas. Podés
            registrar cambios hasta
            indicar cuándo terminaron.
          </p>
        )}

      {premonitory.present && (
        <p
          className={
            styles.helperText
          }
        >
          Inicio de las señales:{' '}
          {formatDateTime(
            premonitoryStart,
            premonitory.time?.start
              ?.precision,
          )}
        </p>
      )}

      {!isEnded && (
        <>
          <h4>
            ¿Qué señales tenés en este
            momento?
          </h4>

          <p
            className={
              styles.helperText
            }
          >
            Podés cambiar la selección
            libremente. No se guardará
            hasta que registres la
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
                    {getSymptomLabel(
                      symptom,
                    )}
                  </span>
                </label>
              ),
            )}
          </div>

          <label>
            {isFirstUpdate
              ? '¿Cuándo aparecieron estas señales?'
              : '¿Cuándo ocurrió esta actualización?'}

            <input
              type="datetime-local"
              value={updateDateTime}
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
            Intensidad general de las
            señales

            <select
              value={draftIntensity}
              onChange={event => {
                setDraftIntensity(
                  event.target.value,
                );

                setFeedback('');
              }}
            >
              <option value="">
                Sin indicar
              </option>

              {Array.from(
                {
                  length: 11,
                },
                (_, index) => (
                  <option
                    key={index}
                    value={index}
                  >
                    {index}/10
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Nota de esta actualización

            <textarea
              value={draftNotes}
              onChange={event => {
                setDraftNotes(
                  event.target.value,
                );

                setFeedback('');
              }}
              placeholder="Ejemplo: ayer tenía rigidez cervical y hoy aparecieron bostezos"
              rows={3}
            />
          </label>

          <button
            type="button"
            onClick={
              handleRegisterUpdate
            }
          >
            {isFirstUpdate
              ? 'Iniciar señales'
              : 'Registrar actualización'}
          </button>

          {isTrackingContext &&
            premonitory.present &&
            !showResolutionOptions && (
              <button
                type="button"
                onClick={
                  handleOpenResolution
                }
              >
                Indicar qué pasó con
                estas señales
              </button>
            )}
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

      {isTrackingContext &&
        premonitory.present &&
        !isEnded &&
        showResolutionOptions &&
        !endingOutcome && (
          <section>
            <h4>
              ¿Qué pasó con estas
              señales?
            </h4>

            <button
              type="button"
              onClick={
                handleContinueSignals
              }
            >
              Todavía continúan
            </button>

            <button
              type="button"
              onClick={() =>
                setEndingOutcome(
                  'endedWithoutCrisis',
                )
              }
            >
              Terminaron sin evolucionar
              a crisis
            </button>

            <button
              type="button"
              onClick={() =>
                setEndingOutcome(
                  'evolvedToAura',
                )
              }
            >
              Terminaron y apareció aura
            </button>

            <button
              type="button"
              onClick={
                handleContinueWithAura
              }
            >
              Continúan durante el aura
            </button>

            <button
              type="button"
              onClick={() =>
                setShowUncertainConfirmation(
                  true,
                )
              }
            >
              No estoy segura de qué
              ocurrió
            </button>

            <button
              type="button"
              onClick={
                handleCancelResolution
              }
            >
              Cancelar
            </button>
          </section>
        )}

      {isTrackingContext &&
        showResolutionOptions &&
        endingOutcome && (
          <PhaseEndSelector
            title={resolutionTitle}
            startTime={
              premonitoryStart
            }
            onConfirm={
              handleConfirmEnd
            }
            onContinue={
              handleContinueSignals
            }
          />
        )}

      {isTrackingContext &&
        showResolutionOptions &&
        showUncertainConfirmation &&
        !endingOutcome && (
          <section>
            <p>
              El episodio se guardará
              como incompleto para no
              asumir que estas señales
              estuvieron relacionadas
              con una migraña.
            </p>

            <button
              type="button"
              onClick={
                handleConfirmUncertain
              }
            >
              Guardar como incierto
            </button>

            <button
              type="button"
              onClick={() =>
                setShowUncertainConfirmation(
                  false,
                )
              }
            >
              Volver
            </button>
          </section>
        )}

      {visibleUpdates.length > 0 && (
        <section>
          <h4>
            Evolución de las señales
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
                    .symptoms ?? [];

                return (
                  <li key={update.id}>
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
                      <b>Señales:</b>{' '}
                      {symptoms.length >
                      0
                        ? symptoms
                            .map(
                              symptom =>
                                getSymptomLabel(
                                  symptom,
                                ),
                            )
                            .join(', ')
                        : 'Sin señales seleccionadas'}
                    </p>

                    {update.data
                      .intensity !==
                      undefined && (
                      <p>
                        <b>
                          Intensidad:
                        </b>{' '}
                        {
                          update.data
                            .intensity
                        }
                        /10
                      </p>
                    )}

                    {update.notes && (
                      <p>
                        <b>Nota:</b>{' '}
                        {update.notes}
                      </p>
                    )}
                  </li>
                );
              },
            )}
          </ul>
        </section>
      )}

      {isEnded && (
        <div>
          <p
            className={
              styles.helperText
            }
          >
            Las señales finalizaron el{' '}
            {formatDateTime(
              premonitoryEnd,
              premonitory.time?.end
                ?.precision,
            )}
            .
          </p>

          {premonitory.endedWithoutCrisis && (
            <p>
              Resultado: las señales
              terminaron sin evolucionar
              a crisis.
            </p>
          )}

          {premonitory.evolvedToAura && (
            <p>
              Resultado: las señales
              evolucionaron a aura.
            </p>
          )}
        </div>
      )}
    </section>
  );
}