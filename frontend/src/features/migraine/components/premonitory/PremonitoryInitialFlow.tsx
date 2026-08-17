import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  ClinicalSymptomCategory,
  ExtendedPremonitorySymptom,
  SymptomDefinition,
} from '../../types/migraine.types';

import {
  clinicalSymptomCategoryLabels,
  getSymptomDefinition,
  getSymptomsForPhase,
} from '../../data/clinicalSymptomCatalog';

import styles from './PremonitoryInitialFlow.module.css';

type InitialStep =
  | 'time'
  | 'symptoms'
  | 'details';

interface Props {
  dateTime: string;
  maxDateTime: string;
  selectedSymptoms:
    ExtendedPremonitorySymptom[];
  intensity: string;
  notes: string;
  onDateTimeChange: (
    value: string,
  ) => void;
  onToggleSymptom: (
    symptom:
      ExtendedPremonitorySymptom,
  ) => void;
  onIntensityChange: (
    value: string,
  ) => void;
  onNotesChange: (
    value: string,
  ) => void;
  onSave: () => void;
}

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

const FREQUENT_SYMPTOMS =
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

const catalog:
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

export function PremonitoryInitialFlow({
  dateTime,
  maxDateTime,
  selectedSymptoms,
  intensity,
  notes,
  onDateTimeChange,
  onToggleSymptom,
  onIntensityChange,
  onNotesChange,
  onSave,
}: Props) {
  const flowRef =
    useRef<HTMLElement | null>(
      null,
    );

  const [
    step,
    setStep,
  ] = useState<InitialStep>(
    'time',
  );

  const [
    showAllSymptoms,
    setShowAllSymptoms,
  ] = useState(false);

  const [
    symptomSearch,
    setSymptomSearch,
  ] = useState('');

  const [
    expandedCategory,
    setExpandedCategory,
  ] = useState<
    ClinicalSymptomCategory | null
  >(null);

  useEffect(() => {
    const frame =
      window.requestAnimationFrame(
        () => {
          flowRef.current?.scrollIntoView({
            block: 'start',
            behavior: 'auto',
          });
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );
    };
  }, [
    step,
  ]);

  const frequentDefinitions =
    useMemo(
      () =>
        catalog.filter(
          definition =>
            FREQUENT_SYMPTOMS.has(
              definition.value,
            ),
        ),
      [],
    );

  const normalizedSearch =
    normalizeText(
      symptomSearch.trim(),
    );

  const searchedDefinitions =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return catalog.filter(
        definition => {
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
            normalizedSearch,
          );
        },
      );
    }, [
      normalizedSearch,
    ]);

  const canContinueFromTime =
    dateTime.length > 0 &&
    dateTime <= maxDateTime;

  const selectedCount =
    selectedSymptoms.length;

  const renderChoice = (
    definition:
      SymptomDefinition<
        ExtendedPremonitorySymptom
      >,
  ) => {
    const isSelected =
      selectedSymptoms.includes(
        definition.value,
      );

    return (
      <button
        key={definition.value}
        type="button"
        className={
          styles.symptomChoice
        }
        aria-pressed={
          isSelected
        }
        onClick={() =>
          onToggleSymptom(
            definition.value,
          )
        }
      >
        <span>
          {definition.label}
        </span>

        {definition.uncommon && (
          <small>
            Menos frecuente
          </small>
        )}
      </button>
    );
  };

  if (step === 'time') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-time-title"
      >
        <div
          className={
            styles.stepHeader
          }
        >
          <p
            className={
              styles.eyebrow
            }
          >
            Señales previas
          </p>

          <p
            className={
              styles.stepCount
            }
          >
            1 de 3
          </p>
        </div>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-time-title"
          >
            ¿Cuándo empezaste a
            notarlas?
          </h3>

          <p>
            Registrá el momento más
            aproximado que recuerdes.
          </p>
        </div>

        <label
          className={
            styles.field
          }
        >
          <span>
            Fecha y hora de inicio
          </span>

          <input
            type="datetime-local"
            value={dateTime}
            max={maxDateTime}
            onChange={event =>
              onDateTimeChange(
                event.target.value,
              )
            }
          />
        </label>

        <div
          className={
            styles.actions
          }
        >
          <button
            type="button"
            className={
              styles.primaryAction
            }
            disabled={
              !canContinueFromTime
            }
            onClick={() =>
              setStep('symptoms')
            }
          >
            Siguiente
          </button>
        </div>
      </section>
    );
  }

  if (step === 'symptoms') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-symptoms-title"
      >
        <div
          className={
            styles.stepHeader
          }
        >
          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={() =>
              setStep('time')
            }
          >
            Volver
          </button>

          <p
            className={
              styles.stepCount
            }
          >
            2 de 3
          </p>
        </div>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-symptoms-title"
          >
            ¿Qué señales notaste?
          </h3>

          <p>
            Elegí todas las que
            reconozcas. La lista
            completa sigue disponible
            sin mostrarla toda de
            golpe.
          </p>
        </div>

        {selectedCount > 0 && (
          <section
            className={
              styles.selectedArea
            }
            aria-labelledby="premonitory-selected-title"
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <h4
                id="premonitory-selected-title"
              >
                Seleccionadas
              </h4>

              <span>
                {selectedCount}
              </span>
            </div>

            <div
              className={
                styles.selectedChips
              }
            >
              {selectedSymptoms.map(
                symptom => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      onToggleSymptom(
                        symptom,
                      )
                    }
                    aria-label={`Quitar ${getSymptomLabel(symptom)}`}
                  >
                    {getSymptomLabel(
                      symptom,
                    )}

                    <span
                      aria-hidden="true"
                    >
                      ×
                    </span>
                  </button>
                ),
              )}
            </div>
          </section>
        )}

        {!showAllSymptoms && (
          <section
            className={
              styles.frequentArea
            }
            aria-labelledby="premonitory-frequent-title"
          >
          <div
            className={
              styles.sectionHeading
            }
          >
            <div>
              <h4
                id="premonitory-frequent-title"
              >
                Más frecuentes
              </h4>

              <p>
                Para registrar rápido
                lo más habitual.
              </p>
            </div>
          </div>

          <div
            className={
              styles.choiceGrid
            }
          >
            {frequentDefinitions.map(
              renderChoice,
            )}
          </div>
          </section>
        )}

        <button
          type="button"
          className={
            styles.showAllButton
          }
          aria-expanded={
            showAllSymptoms
          }
          onClick={() => {
            setShowAllSymptoms(
              current => {
                const next =
                  !current;

                if (!next) {
                  setSymptomSearch('');
                  setExpandedCategory(
                    null,
                  );
                }

                return next;
              },
            );
          }}
        >
          <span>
            {showAllSymptoms
              ? 'Ocultar lista completa'
              : 'Ver todas las señales'}
          </span>

          <span
            aria-hidden="true"
          >
            {showAllSymptoms
              ? '−'
              : '+'}
          </span>
        </button>

        {showAllSymptoms && (
          <section
            className={
              styles.allSymptoms
            }
            aria-label="Lista completa de señales premonitorias"
          >
            <label
              className={
                styles.searchField
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
                onChange={event =>
                  setSymptomSearch(
                    event.target.value,
                  )
                }
                placeholder="Ej.: rigidez, mareo, hambre…"
              />
            </label>

            {normalizedSearch ? (
              <section
                className={
                  styles.searchResults
                }
              >
                <div
                  className={
                    styles.sectionHeading
                  }
                >
                  <h4>
                    Resultados
                  </h4>

                  <span>
                    {
                      searchedDefinitions.length
                    }
                  </span>
                </div>

                {searchedDefinitions.length >
                0 ? (
                  <div
                    className={
                      styles.choiceGrid
                    }
                  >
                    {searchedDefinitions.map(
                      renderChoice,
                    )}
                  </div>
                ) : (
                  <p
                    className={
                      styles.emptyMessage
                    }
                  >
                    No encontramos
                    señales con ese
                    nombre.
                  </p>
                )}
              </section>
            ) : (
              <div
                className={
                  styles.categoryList
                }
              >
                {CATEGORY_ORDER.map(
                  category => {
                    const definitions =
                      catalog.filter(
                        definition =>
                          definition.category ===
                          category,
                      );

                    if (
                      definitions.length ===
                      0
                    ) {
                      return null;
                    }

                    const isExpanded =
                      expandedCategory ===
                      category;

                    const selectedInCategory =
                      definitions.filter(
                        definition =>
                          selectedSymptoms.includes(
                            definition.value,
                          ),
                      ).length;

                    return (
                      <section
                        key={category}
                        className={
                          styles.category
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.categoryButton
                          }
                          aria-expanded={
                            isExpanded
                          }
                          onClick={() =>
                            setExpandedCategory(
                              current =>
                                current ===
                                category
                                  ? null
                                  : category,
                            )
                          }
                        >
                          <span>
                            {
                              clinicalSymptomCategoryLabels[
                                category
                              ]
                            }
                          </span>

                          <span
                            className={
                              styles.categoryMeta
                            }
                          >
                            {selectedInCategory >
                              0 && (
                              <small>
                                {
                                  selectedInCategory
                                }{' '}
                                seleccionada
                                {selectedInCategory ===
                                1
                                  ? ''
                                  : 's'}
                              </small>
                            )}

                            <span
                              aria-hidden="true"
                            >
                              {isExpanded
                                ? '−'
                                : '+'}
                            </span>
                          </span>
                        </button>

                        {isExpanded && (
                          <div
                            className={
                              styles.categoryContent
                            }
                          >
                            <div
                              className={
                                styles.choiceGrid
                              }
                            >
                              {definitions.map(
                                renderChoice,
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}

        <div
          className={
            styles.actions
          }
        >
          <button
            type="button"
            className={
              styles.primaryAction
            }
            onClick={() =>
              setStep('details')
            }
          >
            Siguiente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={flowRef}
      className={styles.flow}
      aria-labelledby="premonitory-details-title"
    >
      <div
        className={
          styles.stepHeader
        }
      >
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() =>
            setStep('symptoms')
          }
        >
          Volver
        </button>

        <p
          className={
            styles.stepCount
          }
        >
          3 de 3
        </p>
      </div>

      <div
        className={
          styles.question
        }
      >
        <h3
          id="premonitory-details-title"
        >
          ¿Querés agregar algún
          detalle?
        </h3>

        <p>
          La intensidad y la nota son
          opcionales. Podés guardar
          las señales sin completarlas.
        </p>
      </div>

      <label
        className={
          styles.field
        }
      >
        <span>
          Intensidad general de las
          señales
        </span>

        <select
          value={intensity}
          onChange={event =>
            onIntensityChange(
              event.target.value,
            )
          }
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

      <label
        className={
          styles.field
        }
      >
        <span>
          Nota
        </span>

        <textarea
          value={notes}
          onChange={event =>
            onNotesChange(
              event.target.value,
            )
          }
          placeholder="Algo que quieras recordar sobre este momento"
          rows={3}
        />
      </label>

      <div
        className={
          styles.summary
        }
      >
        <span>
          {selectedCount}
        </span>

        <p>
          {selectedCount === 1
            ? '1 señal seleccionada'
            : `${selectedCount} señales seleccionadas`}
        </p>
      </div>

      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          className={
            styles.primaryAction
          }
          onClick={onSave}
        >
          Iniciar señales
        </button>
      </div>
    </section>
  );
}