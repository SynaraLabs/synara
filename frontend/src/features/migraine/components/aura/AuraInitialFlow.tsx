import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  AuraClinicalSymptom,
  AuraTiming,
  BodySide,
  ClinicalSymptomCategory,
} from '../../types/migraine.types';

import {
  AURA_CATALOG,
  AURA_CATEGORY_ORDER,
  AURA_SIDE_OPTIONS,
  AURA_TIMING_OPTIONS,
  getAuraSymptomLabel,
  normalizeAuraSearch,
} from '../../utils/auraClinical';

import styles from './AuraInitialFlow.module.css';

type InitialStep =
  | 'time'
  | 'symptoms'
  | 'details';

interface Props {
  dateTime: string;
  maxDateTime: string;
  selectedSymptoms:
    AuraClinicalSymptom[];
  timing: AuraTiming | '';
  side: BodySide | '';
  notes: string;
  onDateTimeChange: (
    value: string,
  ) => void;
  onToggleSymptom: (
    symptom:
      AuraClinicalSymptom,
  ) => void;
  onTimingChange: (
    value: AuraTiming | '',
  ) => void;
  onSideChange: (
    value: BodySide | '',
  ) => void;
  onNotesChange: (
    value: string,
  ) => void;
  onSave: () => void;
}

const FREQUENT_AURA_SYMPTOMS =
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

const getCategoryLabel = (
  category:
    ClinicalSymptomCategory,
): string => {
  return (
    categoryLabels[category] ??
    category
  );
};

export function AuraInitialFlow({
  dateTime,
  maxDateTime,
  selectedSymptoms,
  timing,
  side,
  notes,
  onDateTimeChange,
  onToggleSymptom,
  onTimingChange,
  onSideChange,
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
    searchQuery,
    setSearchQuery,
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
        AURA_CATALOG.filter(
          definition =>
            FREQUENT_AURA_SYMPTOMS.has(
              definition.value,
            ),
        ).slice(0, 8),
      [],
    );

  const normalizedSearch =
    normalizeAuraSearch(
      searchQuery.trim(),
    );

  const searchResults =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return AURA_CATALOG.filter(
        definition =>
          normalizeAuraSearch(
            `${definition.label} ${definition.value}`,
          ).includes(
            normalizedSearch,
          ),
      );
    }, [
      normalizedSearch,
    ]);

  const selectedCount =
    selectedSymptoms.length;

  const renderSymptom = (
    definition:
      (typeof AURA_CATALOG)[number],
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
        {definition.label}
      </button>
    );
  };

  if (step === 'time') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="aura-time-title"
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
            Aura
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
            id="aura-time-title"
          >
            ¿Cuándo comenzó el aura?
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
              !dateTime
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
        aria-labelledby="aura-symptoms-title"
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
            id="aura-symptoms-title"
          >
            ¿Qué estás sintiendo?
          </h3>

          <p>
            Elegí todos los síntomas
            que reconozcas.
          </p>
        </div>

        {selectedCount > 0 && (
          <section
            className={
              styles.selectedArea
            }
            aria-labelledby="aura-selected-title"
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <h4
                id="aura-selected-title"
              >
                Seleccionados
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
                    aria-label={`Quitar ${getAuraSymptomLabel(symptom)}`}
                  >
                    {getAuraSymptomLabel(
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
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <div>
                <h4>
                  Más frecuentes
                </h4>

                <p>
                  Para registrar rápido
                  los síntomas más
                  habituales.
                </p>
              </div>
            </div>

            <div
              className={
                styles.choiceGrid
              }
            >
              {frequentDefinitions.map(
                renderSymptom,
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
                  setSearchQuery('');
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
              : 'Ver todos los síntomas'}
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
            aria-label="Lista completa de síntomas del aura"
          >
            <label
              className={
                styles.searchField
              }
            >
              <span>
                Buscar un síntoma
              </span>

              <input
                type="search"
                value={searchQuery}
                onChange={event =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Ej.: destellos, hormigueo, vértigo…"
              />
            </label>

            {normalizedSearch ? (
              searchResults.length >
              0 ? (
                <div
                  className={
                    styles.choiceGrid
                  }
                >
                  {searchResults.map(
                    renderSymptom,
                  )}
                </div>
              ) : (
                <p
                  className={
                    styles.emptyMessage
                  }
                >
                  No encontramos
                  síntomas con esa
                  búsqueda.
                </p>
              )
            ) : (
              <div
                className={
                  styles.categoryList
                }
              >
                {AURA_CATEGORY_ORDER.map(
                  category => {
                    const definitions =
                      AURA_CATALOG.filter(
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
                            {getCategoryLabel(
                              category,
                            )}
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
                                seleccionad
                                {selectedInCategory ===
                                1
                                  ? 'o'
                                  : 'os'}
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
                                renderSymptom,
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
      aria-labelledby="aura-details-title"
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
          id="aura-details-title"
        >
          Algunos detalles sobre
          el aura
        </h3>

        <p>
          Estos datos son opcionales,
          pero pueden ayudarte a
          reconocer patrones.
        </p>
      </div>

      <label
        className={
          styles.field
        }
      >
        <span>
          ¿Cuándo ocurrió respecto
          del dolor?
        </span>

        <select
          value={timing}
          onChange={event =>
            onTimingChange(
              event.target.value as
                | AuraTiming
                | '',
            )
          }
        >
          <option value="">
            Sin indicar
          </option>

          {AURA_TIMING_OPTIONS.map(
            option => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
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
          Lado afectado
        </span>

        <select
          value={side}
          onChange={event =>
            onSideChange(
              event.target.value as
                | BodySide
                | '',
            )
          }
        >
          <option value="">
            Sin indicar
          </option>

          {AURA_SIDE_OPTIONS.map(
            option => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
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
          rows={3}
          placeholder="Algo que quieras recordar sobre este momento"
          onChange={event =>
            onNotesChange(
              event.target.value,
            )
          }
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
            ? '1 síntoma seleccionado'
            : `${selectedCount} síntomas seleccionados`}
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
          Iniciar aura
        </button>
      </div>
    </section>
  );
}