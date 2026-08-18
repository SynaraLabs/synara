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

import styles from './PostdromeUpdateFlow.module.css';

type UpdateChoice =
  | 'add'
  | 'remove'
  | 'recovery'
  | 'note'
  | 'same'
  | null;

interface Props {
  currentSymptoms:
    PostdromeSymptom[];
  selectedSymptoms:
    PostdromeSymptom[];
  currentRecoveryLevel:
    RecoveryLevel | '';
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
  onResetDraft: () => void;
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
  onOpenEnd: () => void;
}

const frequentSymptoms =
  new Set<PostdromeSymptom>(
    FREQUENT_POSTDROME_SYMPTOMS,
  );

const recoveryLabels:
  Partial<
    Record<
      RecoveryLevel,
      string
    >
  > = {
  minimal:
    'Recuperación mínima',
  partial:
    'Recuperación parcial',
  mostlyRecovered:
    'Casi completamente recuperada',
  fullyRecovered:
    'Recuperación completa',
};

const getSymptomLabel = (
  symptom:
    PostdromeSymptom,
): string =>
  postdromeSymptomLabels[
    symptom
  ] ?? symptom;

export function PostdromeUpdateFlow({
  currentSymptoms,
  selectedSymptoms,
  currentRecoveryLevel,
  recoveryLevel,
  dateTime,
  minDateTime,
  maxDateTime,
  notes,
  onToggleSymptom,
  onResetDraft,
  onRecoveryLevelChange,
  onDateTimeChange,
  onNotesChange,
  onSave,
  onOpenEnd,
}: Props) {
  const flowRef =
    useRef<HTMLElement | null>(
      null,
    );

  const [
    choice,
    setChoice,
  ] = useState<UpdateChoice>(
    null,
  );

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
  }, [choice]);

  const availableDefinitions =
    useMemo(
      () =>
        POSTDROME_SYMPTOM_CATALOG.filter(
          definition =>
            !currentSymptoms.includes(
              definition.value,
            ),
        ),
      [currentSymptoms],
    );

  const frequentAvailable =
    useMemo(
      () =>
        availableDefinitions
          .filter(definition =>
            frequentSymptoms.has(
              definition.value,
            ),
          )
          .slice(0, 8),
      [availableDefinitions],
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

      return availableDefinitions.filter(
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
    }, [
      availableDefinitions,
      normalizedSearch,
    ]);

  const resetBranch = () => {
    onResetDraft();
    setSearchQuery('');
    setExpandedCategory(null);
  };

  const openChoice = (
    nextChoice:
      Exclude<
        UpdateChoice,
        null
      >,
  ) => {
    resetBranch();
    setChoice(nextChoice);
  };

  const goBack = () => {
    resetBranch();
    setChoice(null);
  };

  const renderAvailableSymptom = (
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

  if (!choice) {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="postdrome-update-title"
      >
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            Recuperación
          </p>

          <h3 id="postdrome-update-title">
            ¿Qué cambió?
          </h3>

          <p>
            Elegí solo lo que necesitás
            registrar ahora.
          </p>
        </div>

        <div
          className={
            styles.actionList
          }
        >
          <button
            type="button"
            className={
              styles.actionButton
            }
            onClick={() =>
              openChoice('add')
            }
          >
            <strong>
              Aparecieron nuevos síntomas
            </strong>

            <span>
              Sumá lo que empezó a
              sentirse durante la
              recuperación.
            </span>
          </button>

          {currentSymptoms.length >
            0 && (
            <button
              type="button"
              className={
                styles.actionButton
              }
              onClick={() =>
                openChoice('remove')
              }
            >
              <strong>
                Algunos síntomas ya no
                están
              </strong>

              <span>
                Marcá cuáles dejaron de
                sentirse.
              </span>
            </button>
          )}

          <button
            type="button"
            className={
              styles.actionButton
            }
            onClick={() =>
              openChoice('recovery')
            }
          >
            <strong>
              Cambió mi nivel de recuperación
            </strong>

            <span>
              Actualizá cómo sentís tu
              recuperación ahora.
            </span>
          </button>

          <button
            type="button"
            className={
              styles.actionButton
            }
            onClick={() =>
              openChoice('note')
            }
          >
            <strong>
              Quiero agregar una nota
            </strong>

            <span>
              Registrá algo que quieras
              recordar.
            </span>
          </button>

          {(currentSymptoms.length >
            0 ||
            Boolean(
              currentRecoveryLevel,
            )) && (
            <button
              type="button"
              className={
                styles.actionButton
              }
              onClick={() =>
                openChoice('same')
              }
            >
              <strong>
                Sigo igual
              </strong>

              <span>
                Registrá que la recuperación
                continúa sin cambios.
              </span>
            </button>
          )}
        </div>

        <button
          type="button"
          className={
            styles.endAction
          }
          onClick={onOpenEnd}
        >
          Recuperación completa
        </button>
      </section>
    );
  }

  const branchTitle = {
    add:
      '¿Qué síntomas aparecieron?',
    remove:
      '¿Qué síntomas ya no están?',
    recovery:
      '¿Cómo sentís tu recuperación ahora?',
    note:
      'Agregar una nota',
    same:
      '¿Seguís igual?',
  }[choice];

  const branchDescription = {
    add:
      'Seleccioná solo los síntomas nuevos.',
    remove:
      'Dejá seleccionados solo los síntomas que siguen presentes.',
    recovery:
      'Elegí el nivel que mejor describe este momento.',
    note:
      'Escribí solo lo que quieras recordar de esta actualización.',
    same:
      'Registraremos que tu estado continúa sin cambios.',
  }[choice];

  return (
    <section
      ref={flowRef}
      className={styles.flow}
      aria-labelledby="postdrome-update-branch-title"
    >
      <div
        className={
          styles.branchHeader
        }
      >
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={goBack}
        >
          Volver
        </button>
      </div>

      <div className={styles.intro}>
        <h3
          id="postdrome-update-branch-title"
        >
          {branchTitle}
        </h3>

        <p>
          {branchDescription}
        </p>
      </div>

      {choice === 'add' && (
        <>
          {frequentAvailable.length >
            0 && (
            <section
              className={
                styles.selectionArea
              }
            >
              <h4>
                Más frecuentes
              </h4>

              <div
                className={
                  styles.choiceGrid
                }
              >
                {frequentAvailable.map(
                  renderAvailableSymptom,
                )}
              </div>
            </section>
          )}

          <section
            className={
              styles.allSymptoms
            }
          >
            <label
              className={
                styles.field
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
                    renderAvailableSymptom,
                  )}
                </div>
              ) : (
                <p
                  className={
                    styles.helper
                  }
                >
                  No encontramos síntomas
                  nuevos con esa búsqueda.
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
                      availableDefinitions.filter(
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
                                renderAvailableSymptom,
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
        </>
      )}

      {choice === 'remove' && (
        <section
          className={
            styles.selectionArea
          }
        >
          <h4>
            Síntomas actuales
          </h4>

          <p className={styles.helper}>
            Dejá seleccionados solo los
            que siguen presentes.
          </p>

          <div
            className={
              styles.choiceGrid
            }
          >
            {currentSymptoms.map(
              symptom => {
                const isSelected =
                  selectedSymptoms.includes(
                    symptom,
                  );

                return (
                  <button
                    key={symptom}
                    type="button"
                    className={
                      styles.symptomChoice
                    }
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      onToggleSymptom(
                        symptom,
                      )
                    }
                  >
                    {getSymptomLabel(
                      symptom,
                    )}
                  </button>
                );
              },
            )}
          </div>
        </section>
      )}

      {choice === 'recovery' && (
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
              'minimal',
              'partial',
              'mostlyRecovered',
            ].map(value => {
              const typedValue =
                value as RecoveryLevel;

              return (
                <button
                  key={typedValue}
                  type="button"
                  className={
                    styles.recoveryChoice
                  }
                  aria-pressed={
                    recoveryLevel ===
                    typedValue
                  }
                  onClick={() =>
                    onRecoveryLevelChange(
                      recoveryLevel ===
                        typedValue
                        ? ''
                        : typedValue,
                    )
                  }
                >
                  {
                    recoveryLabels[
                      typedValue
                    ]
                  }
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {choice === 'note' && (
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
            rows={4}
            placeholder="Algo que quieras recordar sobre este momento"
            onChange={event =>
              onNotesChange(
                event.target.value,
              )
            }
          />
        </label>
      )}

      {choice === 'same' && (
        <div
          className={
            styles.sameNotice
          }
        >
          {currentSymptoms.length >
            0 && (
            <p>
              {currentSymptoms.length ===
              1
                ? '1 síntoma continúa presente.'
                : `${currentSymptoms.length} síntomas continúan presentes.`}
            </p>
          )}

          {currentRecoveryLevel && (
            <p>
              Nivel actual:{' '}
              <strong>
                {
                  recoveryLabels[
                    currentRecoveryLevel
                  ]
                }
              </strong>
            </p>
          )}
        </div>
      )}

      <label
        className={
          styles.field
        }
      >
        <span>
          ¿Cuándo ocurrió este cambio?
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
          {choice === 'same'
            ? 'Registrar sin cambios'
            : 'Guardar actualización'}
        </button>
      </div>
    </section>
  );
}