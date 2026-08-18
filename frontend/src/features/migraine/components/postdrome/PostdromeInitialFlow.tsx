import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  PostdromeSymptom,
  RecoveryLevel,
} from '../../types/migraine.types';

import {
  FREQUENT_POSTDROME_SYMPTOMS,
  POSTDROME_CATEGORY_LABELS,
  POSTDROME_CATEGORY_ORDER,
  POSTDROME_SYMPTOM_CATALOG,
  normalizePostdromeSearch,
} from '../../data/postdromeSymptomCatalog';

import { postdromeSymptomLabels } from '../../../history/utils/migraineLabels';

import styles from './PostdromeInitialFlow.module.css';

type InitialStep =
  | 'symptoms'
  | 'recovery';

interface Props {
  selectedSymptoms:
    PostdromeSymptom[];
  recoveryLevel:
    RecoveryLevel | '';
  dateTime: string;
  minDateTime: string;
  maxDateTime: string;
  notes: string;
  onToggleSymptom: (
    symptom:
      PostdromeSymptom,
  ) => void;
  onRecoveryLevelChange: (
    value:
      RecoveryLevel | '',
  ) => void;
  onDateTimeChange: (
    value: string,
  ) => void;
  onNotesChange: (
    value: string,
  ) => void;
  onSave: () => void;
}

const frequentSymptoms =
  new Set<PostdromeSymptom>(
    FREQUENT_POSTDROME_SYMPTOMS,
  );

const getSymptomLabel = (
  symptom:
    PostdromeSymptom,
): string => {
  return (
    postdromeSymptomLabels[
      symptom
    ] ?? symptom
  );
};

export function PostdromeInitialFlow({
  selectedSymptoms,
  recoveryLevel,
  dateTime,
  minDateTime,
  maxDateTime,
  notes,
  onToggleSymptom,
  onRecoveryLevelChange,
  onDateTimeChange,
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
    'symptoms',
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
    (typeof POSTDROME_CATEGORY_ORDER)[number] | null
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
  }, [step]);

  const frequentDefinitions =
    useMemo(
      () =>
        POSTDROME_SYMPTOM_CATALOG
          .filter(definition =>
            frequentSymptoms.has(
              definition.value,
            ),
          )
          .slice(0, 8),
      [],
    );

  const normalizedSearch =
    normalizePostdromeSearch(
      searchQuery.trim(),
    );

  const searchResults =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return POSTDROME_SYMPTOM_CATALOG.filter(
        definition => {
          const searchable =
            normalizePostdromeSearch(
              [
                getSymptomLabel(
                  definition.value,
                ),
                definition.value,
                ...(
                  definition.searchTerms ??
                  []
                ),
              ].join(' '),
            );

          return searchable.includes(
            normalizedSearch,
          );
        },
      );
    }, [normalizedSearch]);

  const renderSymptom = (
    definition:
      (typeof POSTDROME_SYMPTOM_CATALOG)[number],
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
        {getSymptomLabel(
          definition.value,
        )}
      </button>
    );
  };

  if (step === 'symptoms') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="postdrome-symptoms-title"
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
            Recuperación
          </p>

          <p
            className={
              styles.stepCount
            }
          >
            1 de 2
          </p>
        </div>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="postdrome-symptoms-title"
          >
            ¿Cómo te sentís después
            de la crisis?
          </h3>

          <p>
            Elegí lo que estés
            sintiendo ahora.
          </p>
        </div>

        {selectedSymptoms.length >
          0 && (
          <section
            className={
              styles.selectedArea
            }
            aria-labelledby="postdrome-selected-title"
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <h4
                id="postdrome-selected-title"
              >
                Seleccionados
              </h4>

              <span>
                {
                  selectedSymptoms.length
                }
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
                  cómo quedó tu cuerpo
                  después de la crisis.
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
            aria-label="Lista completa de síntomas del postdromo"
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
                placeholder="Ej.: agotamiento, niebla mental…"
                onChange={event =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
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
                {POSTDROME_CATEGORY_ORDER.map(
                  category => {
                    const definitions =
                      POSTDROME_SYMPTOM_CATALOG.filter(
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
                              POSTDROME_CATEGORY_LABELS[
                                category
                              ]
                            }
                          </span>

                          <span
                            aria-hidden="true"
                          >
                            {isExpanded
                              ? '−'
                              : '+'}
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
              setStep('recovery')
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
      aria-labelledby="postdrome-recovery-title"
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
          2 de 2
        </p>
      </div>

      <div
        className={
          styles.question
        }
      >
        <h3
          id="postdrome-recovery-title"
        >
          ¿Cómo sentís tu
          recuperación?
        </h3>

        <p>
          Podés registrar solo el nivel
          de recuperación, síntomas o
          una nota.
        </p>
      </div>

      <fieldset
        className={
          styles.recoveryOptions
        }
      >
        <legend>
          Nivel de recuperación
        </legend>

        <div
          className={
            styles.recoveryGrid
          }
        >
          {[
            {
              value:
                'minimal' as const,
              label:
                'Recuperación mínima',
            },
            {
              value:
                'partial' as const,
              label:
                'Recuperación parcial',
            },
            {
              value:
                'mostlyRecovered' as const,
              label:
                'Casi completamente recuperada',
            },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              className={
                styles.recoveryChoice
              }
              aria-pressed={
                recoveryLevel ===
                option.value
              }
              onClick={() =>
                onRecoveryLevelChange(
                  recoveryLevel ===
                    option.value
                    ? ''
                    : option.value,
                )
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label
        className={
          styles.field
        }
      >
        <span>
          ¿Cuándo registrás este
          estado?
        </span>

        <input
          type="datetime-local"
          value={dateTime}
          min={minDateTime}
          max={maxDateTime}
          onChange={event =>
            onDateTimeChange(
              event.target.value,
            )
          }
        />
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
          placeholder="Algo que quieras recordar sobre tu recuperación"
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
          {selectedSymptoms.length}
        </span>

        <p>
          {selectedSymptoms.length ===
          1
            ? '1 síntoma seleccionado'
            : `${selectedSymptoms.length} síntomas seleccionados`}
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
          Registrar recuperación
        </button>
      </div>
    </section>
  );
}