import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from '../migraine.module.css';

import premonitoryStyles from './premonitory-selector.module.css';

import type {
  ExtendedPremonitorySymptom,
  PainIntensity,
  PhaseTime,
  PremonitorySymptom,
  PremonitoryUpdateData,
  RecordMode,
  SymptomSelection,
  TimePrecision,
} from '../types/migraine.types';

import {
  getSymptomDefinition,
} from '../data/clinicalSymptomCatalog';

import {
  useMigraineStore,
  type PremonitoryResolution,
} from '../store/migraine.store';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import {
  PremonitoryInitialFlow,
} from './premonitory/PremonitoryInitialFlow';

import {
  PremonitoryUpdateFlow,
} from './premonitory/PremonitoryUpdateFlow';


interface PremonitorySelectorProps {
  context?:
    | 'tracking'
    | 'crisis'
    | 'recovery';

  onComplete?: () => void;
}


type EndedPremonitoryOutcome =
  Extract<
    PremonitoryResolution,
    | 'endedWithoutCrisis'
    | 'evolvedToAura'
  >;


const LEGACY_PREMONITORY_SYMPTOMS:
  readonly PremonitorySymptom[] = [
  // Cognitive
  'brainFog',
  'concentrationDifficulty',
  'mentalSlowness',
  'wordFindingDifficulty',
  'memoryDifficulty',
  'disconnectionFeeling',
  'clumsiness',

  // Emotional
  'moodChange',
  'irritability',
  'anxiety',
  'sadness',
  'apathy',
  'euphoria',
  'emotionalSensitivity',
  'restlessness',

  // Energy and sleep
  'fatigue',
  'sleepiness',
  'yawning',
  'insomnia',
  'unusualEnergy',
  'nonRestorativeSleep',

  // Appetite and digestion
  'foodCraving',
  'sweetCraving',
  'saltyCraving',
  'increasedHunger',
  'lossOfAppetite',
  'thirst',
  'mildNausea',
  'bowelChanges',

  // Muscular
  'neckStiffness',
  'neckPain',
  'jawTension',
  'shoulderTension',
  'trapeziusTension',
  'heavyNeckFeeling',

  // Sensory
  'lightSensitivity',
  'soundSensitivity',
  'smellSensitivity',
  'blurredVision',
  'coldFeeling',
  'chills',

  // Autonomic
  'frequentUrination',
  'fluidRetention',
  'sweating',
  'temperatureChange',
  'paleness',
  'nasalCongestion',
];


const legacyPremonitorySymptomSet =
  new Set<string>(
    LEGACY_PREMONITORY_SYMPTOMS,
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
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() ===
      day &&
    date.getHours() ===
      hour &&
    date.getMinutes() ===
      minute;

  return isValid
    ? date
    : undefined;
};


const isValidDate = (
  value?: string,
): value is string => {
  return (
    typeof value ===
      'string' &&
    value.length > 0 &&
    !Number.isNaN(
      new Date(
        value,
      ).getTime(),
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

  return new Date(
    first,
  ).getTime() <=
    new Date(
      second,
    ).getTime()
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


const isLegacyPremonitorySymptom = (
  symptom:
    ExtendedPremonitorySymptom,
): symptom is PremonitorySymptom => {
  return legacyPremonitorySymptomSet.has(
    symptom,
  );
};


const getSymptomLabel = (
  symptom:
    ExtendedPremonitorySymptom,
): string => {
  return (
    getSymptomDefinition(
      symptom,
    )?.label ??
    symptom
  );
};


const getSelectedSymptoms = (
  legacySymptoms:
    readonly PremonitorySymptom[],
  clinicalSymptoms:
    | readonly SymptomSelection<
        ExtendedPremonitorySymptom
      >[]
    | undefined,
): ExtendedPremonitorySymptom[] => {
  if (
    clinicalSymptoms &&
    clinicalSymptoms.length > 0
  ) {
    return Array.from(
      new Set(
        clinicalSymptoms.map(
          selection =>
            selection.symptom,
        ),
      ),
    );
  }

  return Array.from(
    new Set(
      legacySymptoms,
    ),
  );
};


const getUpdateSymptoms = (
  update:
    PremonitoryUpdateData,
): ExtendedPremonitorySymptom[] => {
  if (
    update.clinicalSymptoms &&
    update.clinicalSymptoms
      .length > 0
  ) {
    return Array.from(
      new Set(
        update.clinicalSymptoms.map(
          selection =>
            selection.symptom,
        ),
      ),
    );
  }

  return Array.from(
    new Set(
      update.symptoms,
    ),
  );
};


const createClinicalSelections = (
  symptoms:
    ExtendedPremonitorySymptom[],
  previousSelections:
    | readonly SymptomSelection<
        ExtendedPremonitorySymptom
      >[]
    | undefined,
): SymptomSelection<
  ExtendedPremonitorySymptom
>[] => {
  const previousBySymptom =
    new Map(
      (
        previousSelections ??
        []
      ).map(selection => [
        selection.symptom,
        selection,
      ]),
    );

  return symptoms.map(
    symptom => ({
      ...previousBySymptom.get(
        symptom,
      ),

      symptom,

      stillPresent: true,
    }),
  );
};


export function PremonitorySelector({
  context = 'tracking',
  onComplete,
}: PremonitorySelectorProps) {
  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<
    ExtendedPremonitorySymptom[]
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
    showEvolution,
    setShowEvolution,
  ] = useState(false);

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
        state.episode
          .premonitory,
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
    premonitory.symptoms ??
    [];

  const updates =
    premonitory.updates ??
    [];


  const currentClinicalSymptoms =
    useMemo(
      () =>
        getSelectedSymptoms(
          currentSymptoms,
          premonitory
            .clinicalSymptoms,
        ),
      [
        currentSymptoms,
        premonitory
          .clinicalSymptoms,
      ],
    );


  const premonitoryStart =
    timeline
      ?.premonitoryStart ??
    premonitory.time?.start
      ?.value;

  const premonitoryEnd =
    timeline?.premonitoryEnd ??
    premonitory.time?.end
      ?.value;


  const isEnded =
    premonitory.status ===
      'ended' ||
    premonitory.status ===
      'uncertain' ||
    Boolean(
      premonitoryEnd,
    );


  const isFirstUpdate =
    updates.length === 0 &&
    !premonitory.present;


  const isTrackingContext =
    context === 'tracking';


  useEffect(() => {
    setDraftSymptoms(
      currentClinicalSymptoms,
    );
  }, [
    currentClinicalSymptoms,
  ]);


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

    setShowResolutionOptions(
      false,
    );

    setEndingOutcome(null);

    setShowUncertainConfirmation(
      false,
    );
  }, [
    isTrackingContext,
  ]);


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
    symptom:
      ExtendedPremonitorySymptom,
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
        : Number(
            draftIntensity,
          );

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
      draftSymptoms.length >
        0 ||
      intensity !== undefined ||
      Boolean(
        normalizedNotes,
      );

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


    const legacySymptoms =
      draftSymptoms.filter(
        isLegacyPremonitorySymptom,
      );


    const clinicalSymptoms =
      createClinicalSelections(
        draftSymptoms,
        premonitory
          .clinicalSymptoms,
      );


    const updateData:
      PremonitoryUpdateData = {
      symptoms:
        legacySymptoms,

      clinicalSymptoms,

      symptomsStillActive:
        true,

      ...(intensity !==
      undefined
        ? {
            intensity,
          }
        : {}),
    };


    updatePremonitory({
      ...premonitory,

      present: true,

      status: 'active',

      /*
       * Campo compatible con episodios
       * y componentes anteriores.
       */
      symptoms:
        legacySymptoms,

      /*
       * Campo clínico v7. Incluye
       * tanto síntomas anteriores
       * como los nuevos.
       */
      clinicalSymptoms,

      hoursBeforeAttack:
        undefined,

      endedWithoutCrisis:
        false,

      time: {
        ...premonitory.time,

        start:
          startPhaseTime,

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

    onComplete?.();
  };


  const handleOpenResolution =
    () => {
      setShowResolutionOptions(
        true,
      );

      setEndingOutcome(null);

      setShowUncertainConfirmation(
        false,
      );

      setFeedback('');
    };


  const handleCancelResolution =
    () => {
      setShowResolutionOptions(
        false,
      );

      setEndingOutcome(null);

      setShowUncertainConfirmation(
        false,
      );
    };


  const handleContinueSignals =
    () => {
      handleCancelResolution();

      setFeedback(
        'Las señales continúan abiertas.',
      );
    };


  const handleContinueWithAura =
    () => {
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
    selection:
      PhaseEndSelection,
  ) => {
    if (!endingOutcome) {
      return;
    }

    resolvePremonitory({
      outcome:
        endingOutcome,

      endTime:
        selection.endTime,

      precision:
        selection.precision,

      recordMode:
        selection.recordMode,
    });

    handleCancelResolution();

    onComplete?.();
  };


  const handleConfirmUncertain =
    () => {
      resolvePremonitory({
        outcome:
          'uncertain',

        precision:
          'unknown',

        recordMode:
          'retrospective',
      });

    handleCancelResolution();

    onComplete?.();
    };


  return (
    <section
      className={`${styles.symptomSelector} ${premonitoryStyles.root}`}
    >
      {context === 'crisis' &&
        !isEnded && (
          <p
            className={
              premonitoryStyles.contextNotice
            }
          >
            Las señales siguen abiertas
            durante la crisis. Registrá
            solamente si algo cambió.
          </p>
        )}


      {context === 'recovery' &&
        !isEnded && (
          <p
            className={
              premonitoryStyles.contextNotice
            }
          >
            La crisis terminó y estas
            señales todavía están
            abiertas. Podés actualizarlas
            o indicar cuándo terminaron.
          </p>
        )}


      {premonitory.present && (
        <p
          className={
            premonitoryStyles.phaseStatus
          }
        >
          <span>
            Señales iniciadas
          </span>{' '}

          {formatDateTime(
            premonitoryStart,
            premonitory.time
              ?.start?.precision,
          )}
        </p>
      )}


      {!isEnded && (
        <>
          {isFirstUpdate ? (
            <PremonitoryInitialFlow
              dateTime={updateDateTime}
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              selectedSymptoms={
                draftSymptoms
              }
              intensity={
                draftIntensity
              }
              notes={draftNotes}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onToggleSymptom={
                toggleDraftSymptom
              }
              onIntensityChange={value => {
                setDraftIntensity(value);
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
          ) : !showResolutionOptions ? (
            <PremonitoryUpdateFlow
              currentSymptoms={
                currentClinicalSymptoms
              }
              selectedSymptoms={
                draftSymptoms
              }
              dateTime={
                updateDateTime
              }
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              intensity={
                draftIntensity
              }
              notes={draftNotes}
              onToggleSymptom={
                toggleDraftSymptom
              }
              onResetSymptoms={() => {
                setDraftSymptoms(
                  currentClinicalSymptoms,
                );
                setFeedback('');
              }}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onIntensityChange={value => {
                setDraftIntensity(value);
                setFeedback('');
              }}
              onNotesChange={value => {
                setDraftNotes(value);
                setFeedback('');
              }}
              onSave={
                handleRegisterUpdate
              }
              onOpenResolution={
                handleOpenResolution
              }
            />
          ) : null}
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
          <section
            className={
              premonitoryStyles.resolutionOptions
            }
          >
            <h4>
              ¿Qué pasó con estas
              señales?
            </h4>

            <button
              type="button"
              className={
                premonitoryStyles.resolutionAction
              }
              onClick={
                handleContinueSignals
              }
            >
              Todavía continúan
            </button>

            <button
              type="button"
              className={
                premonitoryStyles.resolutionAction
              }
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
              className={
                premonitoryStyles.resolutionAction
              }
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
              className={
                premonitoryStyles.resolutionAction
              }
              onClick={
                handleContinueWithAura
              }
            >
              Continúan durante el aura
            </button>

            <button
              type="button"
              className={
                premonitoryStyles.resolutionAction
              }
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
              className={
                premonitoryStyles.resolutionCancel
              }
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
            title={
              resolutionTitle
            }
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
        <section
          className={
            premonitoryStyles.evolutionSection
          }
        >
          <button
            type="button"
            className={
              premonitoryStyles.evolutionToggle
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

            <span
              aria-hidden="true"
            >
              {showEvolution
                ? '−'
                : '+'}
            </span>
          </button>

          {showEvolution && (
            <div
              className={
                premonitoryStyles.evolutionContent
              }
            >
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
                  getUpdateSymptoms(
                    update.data,
                  );

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
                        Señales:
                      </b>{' '}
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
                        <b>
                          Nota:
                        </b>{' '}
                        {
                          update.notes
                        }
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

          {premonitory
            .endedWithoutCrisis && (
            <p>
              Resultado: las señales
              terminaron sin evolucionar
              a crisis.
            </p>
          )}

          {premonitory
            .evolvedToAura && (
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