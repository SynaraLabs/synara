import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from '../migraine.module.css';

import premonitoryStyles from './premonitory-selector.module.css';

import type {
  ClinicalSymptomCategory,
  ExtendedPremonitorySymptom,
  PainIntensity,
  PhaseTime,
  PremonitorySymptom,
  PremonitoryUpdateData,
  RecordMode,
  SymptomDefinition,
  SymptomSelection,
  TimePrecision,
} from '../types/migraine.types';

import {
  clinicalSymptomCategoryLabels,
  getSymptomDefinition,
  getSymptomsForPhase,
} from '../data/clinicalSymptomCatalog';

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

  onComplete?: () => void;
}


type EndedPremonitoryOutcome =
  Extract<
    PremonitoryResolution,
    | 'endedWithoutCrisis'
    | 'evolvedToAura'
  >;


const CATEGORY_ORDER:
  ClinicalSymptomCategory[] = [
  'cognitive',
  'language',
  'emotional',
  'energy',
  'sleep',
  'appetite',
  'digestive',
  'musculoskeletal',
  'sensory',
  'visual',
  'vestibular',
  'motor',
  'autonomic',
  'pain',
  'general',
  'other',
];

type PremonitoryCategory =
  (typeof CATEGORY_ORDER)[number];

const FREQUENT_PREMONITORY_SYMPTOMS =
  new Set<
    ExtendedPremonitorySymptom
  >([
    'yawning',
    'neckStiffness',
    'fatigue',
    'irritability',
    'concentrationDifficulty',
    'lightSensitivity',
    'foodCraving',
    'sleepiness',
  ]);


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


const premonitoryCatalog:
  SymptomDefinition<
    ExtendedPremonitorySymptom
  >[] = getSymptomsForPhase(
  'premonitory',
).map(definition => ({
  ...definition,

  value:
    definition.value as
      ExtendedPremonitorySymptom,
}));


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


const normalizeText = (
  value: string,
): string => {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase(
      'es-AR',
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
    symptomSearch,
    setSymptomSearch,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    PremonitoryCategory | null
  >(null);

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


  const normalizedSymptomSearch =
    normalizeText(
      symptomSearch.trim(),
    );


  const visibleDefinitions =
    useMemo(() => {
      const definitions =
        premonitoryCatalog.filter(
        definition => {
          if (
            activeCategory &&
            !normalizedSymptomSearch
          ) {
            return (
              definition.category ===
              activeCategory
            );
          }

          if (
            !normalizedSymptomSearch
          ) {
            return FREQUENT_PREMONITORY_SYMPTOMS.has(
              definition.value,
            );
          }

          const searchableText =
            normalizeText(
              [
                definition.label,
                definition.value,
                definition.description ??
                  '',
                ...(
                  definition.searchTerms ??
                  []
                ),
              ].join(' '),
            );

          return searchableText.includes(
            normalizedSymptomSearch,
          );
        },
      );

      return activeCategory ||
        normalizedSymptomSearch
        ? definitions
        : definitions.slice(0, 8);
    }, [
      activeCategory,
      normalizedSymptomSearch,
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
      <header
        className={
          premonitoryStyles.premonitoryIntro
        }
      >
        <h3>
          {isFirstUpdate
            ? '¿Qué estás sintiendo ahora?'
            : '¿Qué cambió desde la última vez?'}
        </h3>

        <p
          className={
            premonitoryStyles.phaseLead
          }
        >
          {isFirstUpdate
            ? 'Elegí todas las señales que reconozcas. Podrás actualizarlas después.'
            : 'Marcá cómo están tus señales ahora. Guardaremos una nueva actualización sin borrar las anteriores.'}
        </p>
      </header>


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
          <label
            className={
              premonitoryStyles.searchField
            }
          >
            <span>
              Buscar una señal
            </span>

            <input
              type="search"
              value={
                symptomSearch
              }
              onChange={event => {
                setSymptomSearch(
                  event.target
                    .value,
                );

                if (
                  event.target.value
                ) {
                  setActiveCategory(
                    null,
                  );
                }
              }}
              placeholder="Ej.: rigidez, mareo, hambre…"
            />
          </label>


          {draftSymptoms.length > 0 && (
            <section
              className={
                `${styles.compactSelected} ${premonitoryStyles.selectedArea}`
              }
              aria-labelledby="selected-premonitory-symptoms"
            >
              <h4 id="selected-premonitory-symptoms">
                Seleccionadas
              </h4>

              <div
                className={
                  `${styles.compactChips} ${premonitoryStyles.selectedChips}`
                }
              >
                {draftSymptoms.map(
                  symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() =>
                        toggleDraftSymptom(
                          symptom,
                        )
                      }
                      aria-label={`Quitar ${getSymptomLabel(symptom)}`}
                    >
                      {getSymptomLabel(
                        symptom,
                      )}

                      <span aria-hidden="true">
                        ×
                      </span>
                    </button>
                  ),
                )}
              </div>
            </section>
          )}


          {!normalizedSymptomSearch && (
            <div
              className={
                `${styles.compactCategories} ${premonitoryStyles.categoryRail}`
              }
              aria-label="Categorías de señales premonitorias"
            >
              <button
                type="button"
                aria-pressed={
                  activeCategory ===
                  null
                }
                onClick={() =>
                  setActiveCategory(
                    null,
                  )
                }
              >
                Frecuentes
              </button>

              {CATEGORY_ORDER.map(
                category => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={
                      activeCategory ===
                      category
                    }
                    onClick={() =>
                      setActiveCategory(
                        category,
                      )
                    }
                  >
                    {
                      clinicalSymptomCategoryLabels[
                        category
                      ]
                    }
                  </button>
                ),
              )}
            </div>
          )}


          <section
            className={
              `${styles.compactResults} ${premonitoryStyles.resultsArea}`
            }
          >
            <h4>
              {normalizedSymptomSearch
                ? 'Resultados'
                : activeCategory
                  ? clinicalSymptomCategoryLabels[
                      activeCategory
                    ]
                  : 'Más frecuentes'}
            </h4>

            {visibleDefinitions.length ===
            0 ? (
              <p
                className={
                  styles.helperText
                }
              >
                No encontramos señales
                con ese nombre.
              </p>
            ) : (
              <div
                className={
                  styles.compactChoiceGrid
                }
              >
                {visibleDefinitions.map(
                  definition => (
                    <button
                      key={
                        definition.value
                      }
                      type="button"
                      className={
                        `${styles.compactChoice} ${premonitoryStyles.choiceButton}`
                      }
                      aria-pressed={
                        draftSymptoms.includes(
                          definition.value,
                        )
                      }
                      onClick={() =>
                        toggleDraftSymptom(
                          definition.value,
                        )
                      }
                    >
                      {definition.label}

                      {definition.uncommon
                        ? ' · Menos frecuente'
                        : ''}
                    </button>
                  ),
                )}
              </div>
            )}
          </section>


          <div
            className={
              premonitoryStyles.updateDetailsIntro
            }
          >
            <h4>
              Completá la actualización
            </h4>

            <p>
              La fecha es necesaria. La
              intensidad y la nota son
              opcionales.
            </p>
          </div>


          <label>
            {isFirstUpdate
              ? '¿Cuándo aparecieron estas señales?'
              : '¿Cuándo ocurrió esta actualización?'}

            <input
              type="datetime-local"
              value={
                updateDateTime
              }
              max={
                getCurrentLocalDateTimeValue()
              }
              onChange={event => {
                setUpdateDateTime(
                  event.target
                    .value,
                );

                setFeedback('');
              }}
            />
          </label>


          <label>
            Intensidad general de las
            señales

            <select
              value={
                draftIntensity
              }
              onChange={event => {
                setDraftIntensity(
                  event.target
                    .value,
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
              value={
                draftNotes
              }
              onChange={event => {
                setDraftNotes(
                  event.target
                    .value,
                );

                setFeedback('');
              }}
              placeholder="Ejemplo: ayer tenía rigidez cervical y hoy aparecieron bostezos"
              rows={3}
            />
          </label>


          <button
            type="button"
            className={
              premonitoryStyles.primaryPhaseAction
            }
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


      {visibleUpdates.length >
        0 && (
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