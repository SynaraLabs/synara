import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from './AuraSelector.module.css';

import type {
  AuraClinicalSymptom,
  AuraTiming,
  AuraUpdateData,
  BodySide,
  ClinicalSymptomCategory,
} from '../types/migraine.types';

import { useMigraineStore } from '../store/migraine.store';

import {
  AURA_CATALOG,
  AURA_CATEGORY_ORDER,
  AURA_SIDE_OPTIONS,
  AURA_TIMING_OPTIONS,
  buildAuraLegacyFields,
  buildAuraPhaseTime,
  calculateAuraDurationMinutes,
  createAuraClinicalSelections,
  formatAuraDateTime,
  generateAuraRecordId,
  getAuraSymptomLabel,
  getAuraTypes,
  getAuraUpdateSymptoms,
  getCurrentLocalDateTimeValue,
  getEarlierAuraDate,
  getSelectedAuraSymptoms,
  inferAuraRecordMode,
  isValidAuraDate,
  normalizeAuraSearch,
  parseLocalDateTime,
  toLocalDateTimeValue,
} from '../utils/auraClinical';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';


const frequentAuraSymptoms =
  new Set<string>([
    'flashes',
    'zigzagLines',
    'blindSpots',
    'blurredVision',
    'visualSpots',
    'tingling',
    'numbness',
    'spreadingParesthesia',
    'wordFindingDifficulty',
    'speechDifficulty',
    'vertigo',
    'imbalance',
  ]);

type AuraCategory =
  (typeof AURA_CATEGORY_ORDER)[number];


const categoryLabels:
  Partial<
    Record<
      ClinicalSymptomCategory,
      string
    >
  > = {
  visual:
    'Síntomas visuales',

  sensory:
    'Síntomas sensitivos',

  language:
    'Lenguaje y comunicación',

  motor:
    'Síntomas motores',

  vestibular:
    'Equilibrio y orientación',

  cognitive:
    'Síntomas cognitivos',

  general:
    'Otros síntomas del aura',

  other:
    'Otros',
};


function getCategoryLabel(
  category:
    ClinicalSymptomCategory,
): string {
  return (
    categoryLabels[category] ??
    category
  );
}


interface AuraSelectorProps {
  onComplete?: () => void;
}


export function AuraSelector({
  onComplete,
}: AuraSelectorProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    AuraCategory | null
  >(null);

  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<
    AuraClinicalSymptom[]
  >([]);

  const [
    draftTiming,
    setDraftTiming,
  ] = useState<
    AuraTiming | ''
  >('');

  const [
    draftSide,
    setDraftSide,
  ] = useState<
    BodySide | ''
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
    showEndSelector,
    setShowEndSelector,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState('');


  const aura = useMigraineStore(
    state => state.episode.aura,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updateAura =
    useMigraineStore(
      state => state.updateAura,
    );

  const updateTimeline =
    useMigraineStore(
      state => state.updateTimeline,
    );


  const updates =
    aura.updates ?? [];

  /*
   * Conserva la misma referencia
   * mientras el aura almacenada no
   * cambie.
   *
   * Sin useMemo, se generaba un array
   * nuevo en cada render y el efecto
   * borraba las selecciones realizadas.
   */
  const currentSymptoms =
    useMemo(
      () =>
        getSelectedAuraSymptoms(
          aura,
        ),
      [aura],
    );

  const auraStart =
    timeline?.auraStart ??
    aura.time?.start?.value;

  const auraEnd =
    timeline?.auraEnd ??
    aura.time?.end?.value;

  const isEnded =
    aura.status === 'ended' ||
    isValidAuraDate(auraEnd);

  const isActive =
    aura.present && !isEnded;


  useEffect(() => {
    setDraftSymptoms(
      currentSymptoms,
    );

    setDraftTiming(
      aura.timing ?? '',
    );

    setDraftSide(
      aura.side ?? '',
    );
  }, [
    aura.side,
    aura.timing,
    currentSymptoms,
  ]);


  const normalizedSearchQuery =
    normalizeAuraSearch(
      searchQuery,
    );


  const visibleDefinitions =
    useMemo(() => {
      const definitions =
        AURA_CATALOG.filter(
        definition => {
          const matchesSearch =
            normalizedSearchQuery.length >
              0 &&
            normalizeAuraSearch(
              `${definition.label} ${definition.value}`,
            ).includes(
              normalizedSearchQuery,
            );

          if (
            normalizedSearchQuery.length >
            0
          ) {
            return matchesSearch;
          }

          if (activeCategory) {
            return (
              definition.category ===
              activeCategory
            );
          }

          return frequentAuraSymptoms.has(
            definition.value,
          );
        },
      );

      return activeCategory ||
        normalizedSearchQuery
        ? definitions
        : definitions.slice(0, 8);
    }, [
      activeCategory,
      normalizedSearchQuery,
    ]);


  const visibleCategories =
    useMemo(() => {
      return AURA_CATEGORY_ORDER
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
      return [...updates].sort(
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
    }, [updates]);


  const toggleSymptom = (
    symptom:
      AuraClinicalSymptom,
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
      if (isEnded) {
        return;
      }

      const occurredAtDate =
        parseLocalDateTime(
          updateDateTime,
        );

      if (!occurredAtDate) {
        setFeedback(
          'Ingresá una fecha y hora válidas para el registro.',
        );

        return;
      }

      if (
        occurredAtDate.getTime() >
        Date.now()
      ) {
        setFeedback(
          'El registro del aura no puede estar en el futuro.',
        );

        return;
      }

      const normalizedNotes =
        draftNotes.trim();

      if (
        draftSymptoms.length === 0 &&
        !normalizedNotes
      ) {
        setFeedback(
          'Seleccioná al menos un síntoma o agregá una nota.',
        );

        return;
      }

      const occurredAt =
        occurredAtDate.toISOString();

      const now =
        new Date().toISOString();

      const recordMode =
        inferAuraRecordMode(
          occurredAt,
        );

      const effectiveStart =
        getEarlierAuraDate(
          auraStart,
          occurredAt,
        ) ?? occurredAt;

      const existingStart =
        aura.time?.start;

      const shouldUpdateStart =
        !isValidAuraDate(
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
          ? buildAuraPhaseTime(
              effectiveStart,
              'exact',
              inferAuraRecordMode(
                effectiveStart,
              ),
            )
          : existingStart;

      const side =
        draftSide || undefined;

      const timing =
        draftTiming || undefined;

      const legacyFields =
        buildAuraLegacyFields(
          draftSymptoms,
        );

      const clinicalSymptoms =
        createAuraClinicalSelections(
          draftSymptoms,
          side,
          aura.clinicalSymptoms,
          true,
        );

      const types =
        getAuraTypes(
          draftSymptoms,
          aura.types,
        );

      const updateData:
        AuraUpdateData = {
        types,

        ...legacyFields,

        clinicalSymptoms,

        symptomsStillActive:
          draftSymptoms.length > 0,
      };

      updateAura({
        ...aura,

        present: true,

        status: 'active',

        types,

        ...legacyFields,

        clinicalSymptoms,

        timing,

        side,

        occurredWithoutPain:
          timing === 'withoutPain',

        durationMinutes:
          undefined,

        time: {
          ...aura.time,

          start:
            startPhaseTime,

          end: undefined,
        },

        updates: [
          ...updates,

          {
            id:
              generateAuraRecordId(),

            createdAt: now,

            occurredAt:
              buildAuraPhaseTime(
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
        auraStart:
          effectiveStart,

        auraEnd:
          undefined,

        episodeStart:
          getEarlierAuraDate(
            timeline?.episodeStart,
            effectiveStart,
          ),
      });

      setUpdateDateTime(
        getCurrentLocalDateTimeValue(),
      );

      setDraftNotes('');

      setFeedback(
        aura.present
          ? 'Actualización del aura registrada.'
          : 'Aura iniciada y primera actualización registrada.',
      );

      onComplete?.();
    };


  const finishAura = (
    selection:
      PhaseEndSelection,
  ) => {
    if (
      !isValidAuraDate(
        auraStart,
      )
    ) {
      setFeedback(
        'Primero registrá el inicio del aura.',
      );

      return;
    }

    const {
      endTime,
      precision,
      recordMode,
    } = selection;

    if (
      !isValidAuraDate(endTime)
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
      setFeedback(
        'El final del aura no puede estar en el futuro.',
      );

      return;
    }

    if (
      endTimestamp <
      new Date(
        auraStart,
      ).getTime()
    ) {
      setFeedback(
        'El final del aura no puede ser anterior a su inicio.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const side =
      draftSide || undefined;

    const timing =
      draftTiming || undefined;

    const legacyFields =
      buildAuraLegacyFields(
        draftSymptoms,
      );

    const clinicalSymptoms =
      createAuraClinicalSelections(
        draftSymptoms,
        side,
        aura.clinicalSymptoms,
        false,
      );

    const types =
      getAuraTypes(
        draftSymptoms,
        aura.types,
      );

    const endPhaseTime =
      buildAuraPhaseTime(
        endTime,
        precision,
        recordMode,
      );

    const updateData:
      AuraUpdateData = {
      types,

      ...legacyFields,

      clinicalSymptoms,

      symptomsStillActive:
        false,
    };

    updateAura({
      ...aura,

      present: true,

      status: 'ended',

      types,

      ...legacyFields,

      clinicalSymptoms,

      timing,

      side,

      occurredWithoutPain:
        timing === 'withoutPain',

      durationMinutes:
        calculateAuraDurationMinutes(
          auraStart,
          endTime,
        ),

      time: {
        ...aura.time,

        start:
          aura.time?.start ??
          buildAuraPhaseTime(
            auraStart,
            'exact',
            inferAuraRecordMode(
              auraStart,
            ),
          ),

        end:
          endPhaseTime,
      },

      updates: [
        ...updates,

        {
          id:
            generateAuraRecordId(),

          createdAt: now,

          occurredAt:
            endPhaseTime,

          data:
            updateData,

          notes:
            draftNotes.trim() ||
            undefined,
        },
      ],
    });

    updateTimeline({
      auraStart,

      auraEnd:
        endTime,
    });

    setDraftNotes('');

    setShowEndSelector(false);

    setFeedback(
      'Final del aura registrado.',
    );

    onComplete?.();
  };


  const handleContinueAura = () => {
    setShowEndSelector(false);

    setFeedback(
      'El aura continúa abierta.',
    );
  };


  return (
    <section
      className={
        styles.symptomSelector
      }
      aria-labelledby="aura-title"
    >
      <header>
        <h3 id="aura-title">
          Aura
        </h3>

        <p>
          El aura puede incluir cambios
          visuales, sensitivos, de
          lenguaje, motores o de
          equilibrio. Podés registrar
          varias actualizaciones.
        </p>
      </header>


      {aura.present && (
        <p
          className={
            styles.helperText
          }
        >
          Inicio del aura:{' '}
          {formatAuraDateTime(
            auraStart,
            aura.time?.start
              ?.precision,
          )}

          {isEnded && (
            <>
              {' · '}
              Final:{' '}
              {formatAuraDateTime(
                auraEnd,
                aura.time?.end
                  ?.precision,
              )}
            </>
          )}
        </p>
      )}


      {!isEnded && (
        <>
          {draftSymptoms.length > 0 && (
            <section
              className={
                styles.compactSelected
              }
              aria-labelledby="selected-aura-symptoms"
            >
              <h4 id="selected-aura-symptoms">
                Seleccionados
              </h4>

              <div
                className={
                  styles.compactChips
                }
              >
                {draftSymptoms.map(
                  symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() =>
                        toggleSymptom(
                          symptom,
                        )
                      }
                      aria-label={`Quitar ${getAuraSymptomLabel(symptom)}`}
                    >
                      {getAuraSymptomLabel(
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


          <label>
            Buscar síntomas de aura

            <input
              type="search"
              value={searchQuery}
              placeholder="Ejemplo: destellos, hormigueo o dificultad al hablar"
              onChange={event => {
                setSearchQuery(
                  event.target.value,
                );

                if (
                  event.target.value
                ) {
                  setActiveCategory(
                    null,
                  );
                }

                setFeedback('');
              }}
            />
          </label>


          {!normalizedSearchQuery && (
            <div
              className={
                styles.compactCategories
              }
              aria-label="Categorías de síntomas del aura"
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

              {AURA_CATEGORY_ORDER.map(
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
                    {getCategoryLabel(
                      category,
                    )}
                  </button>
                ),
              )}
            </div>
          )}


          <section
            className={
              styles.compactResults
            }
          >
            <h4>
              {normalizedSearchQuery
                ? 'Resultados'
                : activeCategory
                  ? getCategoryLabel(
                      activeCategory,
                    )
                  : 'Más frecuentes'}
            </h4>

            {visibleCategories.map(
              group => (
                <div
                key={
                  group.category
                }
              >
                <div
                  className={
                    styles.compactChoiceGrid
                  }
                  role="group"
                  aria-label={
                    getCategoryLabel(
                      group.category,
                    )
                  }
                >
                  {group.symptoms.map(
                    definition => (
                      <button
                        key={
                          definition.value
                        }
                        type="button"
                        className={
                          styles.compactChoice
                        }
                        aria-pressed={
                          draftSymptoms.includes(
                            definition.value,
                          )
                        }
                        onClick={() =>
                          toggleSymptom(
                            definition.value,
                          )
                        }
                      >
                        {definition.label}
                      </button>
                    ),
                  )}
                </div>
                </div>
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
          </section>


          <div
            className={
              styles.auraDetailsGrid
            }
          >
            <label>
              ¿Cuándo ocurrió respecto
              del dolor?

              <select
                value={draftTiming}
                onChange={event => {
                  setDraftTiming(
                    event.target
                      .value as
                      | AuraTiming
                      | '',
                  );

                  setFeedback('');
                }}
              >
                <option value="">
                  Sin indicar
                </option>

                {AURA_TIMING_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Lado afectado

              <select
                value={draftSide}
                onChange={event => {
                  setDraftSide(
                    event.target
                      .value as
                      | BodySide
                      | '',
                  );

                  setFeedback('');
                }}
              >
                <option value="">
                  Sin indicar
                </option>

                {AURA_SIDE_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>


          <label>
            ¿Cuándo ocurrió esta
            actualización?

            <input
              type="datetime-local"
              value={
                updateDateTime
              }
              max={
                getCurrentLocalDateTimeValue()
              }
              min={
                toLocalDateTimeValue(
                  auraStart,
                )
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
            Nota de esta actualización

            <textarea
              value={draftNotes}
              rows={3}
              placeholder="Ejemplo: el hormigueo comenzó en la mano y avanzó hacia el rostro"
              onChange={event => {
                setDraftNotes(
                  event.target.value,
                );

                setFeedback('');
              }}
            />
          </label>


          <button
            type="button"
            onClick={
              handleRegisterUpdate
            }
          >
            {aura.present
              ? 'Registrar actualización'
              : 'Registrar inicio del aura'}
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


      {visibleUpdates.length > 0 && (
        <section>
          <h4>
            Evolución del aura
          </h4>

          <ul>
            {visibleUpdates.map(
              update => {
                const updateTime =
                  update.occurredAt
                    .value ??
                  update.createdAt;

                const symptoms =
                  getAuraUpdateSymptoms(
                    update.data,
                  );

                return (
                  <li
                    key={update.id}
                  >
                    <p>
                      <b>
                        {formatAuraDateTime(
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
                              getAuraSymptomLabel,
                            )
                            .join(', ')
                        : 'Sin síntomas seleccionados'}
                    </p>

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
                        Final del aura.
                      </p>
                    )}
                  </li>
                );
              },
            )}
          </ul>
        </section>
      )}


      {isActive &&
        !showEndSelector && (
          <button
            type="button"
            onClick={() => {
              setShowEndSelector(
                true,
              );

              setFeedback('');
            }}
          >
            Indicar que terminó el aura
          </button>
        )}


      {isActive &&
        showEndSelector && (
          <PhaseEndSelector
            title="¿Cuándo terminó el aura?"
            startTime={auraStart}
            onConfirm={finishAura}
            onContinue={
              handleContinueAura
            }
          />
        )}


      {isEnded && (
        <p
          className={
            styles.helperText
          }
        >
          Aura finalizada. Duración
          registrada:{' '}

          {aura.durationMinutes !==
          undefined
            ? `${aura.durationMinutes} minutos`
            : 'no calculada'}
        </p>
      )}
    </section>
  );
}