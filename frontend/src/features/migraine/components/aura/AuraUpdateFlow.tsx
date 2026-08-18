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

import styles from './AuraUpdateFlow.module.css';

type UpdateChoice =
  | 'add'
  | 'remove'
  | 'timing'
  | 'side'
  | 'note'
  | 'same'
  | null;

interface Props {
  currentSymptoms:
    AuraClinicalSymptom[];
  selectedSymptoms:
    AuraClinicalSymptom[];
  dateTime: string;
  maxDateTime: string;
  timing: AuraTiming | '';
  side: BodySide | '';
  notes: string;
  onToggleSymptom: (
    symptom:
      AuraClinicalSymptom,
  ) => void;
  onResetSymptoms: () => void;
  onDateTimeChange: (
    value: string,
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
  onOpenEnd: () => void;
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
  visual: 'Síntomas visuales',
  sensory: 'Síntomas sensitivos',
  language:
    'Lenguaje y comunicación',
  motor: 'Síntomas motores',
  vestibular:
    'Equilibrio y orientación',
  cognitive:
    'Síntomas cognitivos',
  general:
    'Otros síntomas del aura',
  other: 'Otros',
};

const getCategoryLabel = (
  category:
    ClinicalSymptomCategory,
): string =>
  categoryLabels[category] ??
  category;

export function AuraUpdateFlow({
  currentSymptoms,
  selectedSymptoms,
  dateTime,
  maxDateTime,
  timing,
  side,
  notes,
  onToggleSymptom,
  onResetSymptoms,
  onDateTimeChange,
  onTimingChange,
  onSideChange,
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
  }, [choice]);

  const normalizedSearch =
    normalizeAuraSearch(
      searchQuery.trim(),
    );

  const availableDefinitions =
    useMemo(
      () =>
        AURA_CATALOG.filter(
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
            FREQUENT_AURA_SYMPTOMS.has(
              definition.value,
            ),
          )
          .slice(0, 8),
      [availableDefinitions],
    );

  const searchResults =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return availableDefinitions.filter(
        definition =>
          normalizeAuraSearch(
            `${definition.label} ${definition.value}`,
          ).includes(
            normalizedSearch,
          ),
      );
    }, [
      availableDefinitions,
      normalizedSearch,
    ]);

  const resetBranch = () => {
    onResetSymptoms();
    onNotesChange('');
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

  if (!choice) {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="aura-update-title"
      >
        <div
          className={
            styles.intro
          }
        >
          <p
            className={
              styles.eyebrow
            }
          >
            Aura
          </p>

          <h3
            id="aura-update-title"
          >
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
              sentirse.
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
              openChoice('timing')
            }
          >
            <strong>
              Cambió respecto del dolor
            </strong>

            <span>
              Actualizá cuándo ocurre
              el aura en relación con
              el dolor.
            </span>
          </button>

          <button
            type="button"
            className={
              styles.actionButton
            }
            onClick={() =>
              openChoice('side')
            }
          >
            <strong>
              Cambió el lado afectado
            </strong>

            <span>
              Actualizá la lateralidad
              del aura.
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

          {currentSymptoms.length >
            0 && (
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
                Sigue igual
              </strong>

              <span>
                Registrá que los síntomas
                continúan sin cambios.
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
          El aura terminó
        </button>
      </section>
    );
  }

  const branchTitle = {
    add:
      '¿Qué síntomas aparecieron?',
    remove:
      '¿Qué síntomas ya no están?',
    timing:
      '¿Cómo cambió respecto del dolor?',
    side:
      '¿Qué lado está afectado ahora?',
    note:
      'Agregar una nota',
    same:
      '¿Sigue igual?',
  }[choice];

  const branchDescription = {
    add:
      'Seleccioná solo los síntomas nuevos.',
    remove:
      'Desmarcá los síntomas que ya no sentís.',
    timing:
      'Elegí la opción que describe mejor este momento.',
    side:
      'Actualizá el lado afectado.',
    note:
      'Escribí solo lo que quieras recordar de esta actualización.',
    same:
      'Registraremos que los síntomas continúan sin cambios.',
  }[choice];

  return (
    <section
      ref={flowRef}
      className={styles.flow}
      aria-labelledby="aura-update-branch-title"
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

      <div
        className={
          styles.intro
        }
      >
        <h3
          id="aura-update-branch-title"
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
                placeholder="Ej.: destellos, hormigueo, vértigo…"
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
                    styles.emptyMessage
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
                {AURA_CATEGORY_ORDER.map(
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
                            {getCategoryLabel(
                              category,
                            )}
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

          <p
            className={
              styles.helper
            }
          >
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
                    {getAuraSymptomLabel(
                      symptom,
                    )}
                  </button>
                );
              },
            )}
          </div>
        </section>
      )}

      {choice === 'timing' && (
        <label
          className={
            styles.field
          }
        >
          <span>
            Respecto del dolor
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
      )}

      {choice === 'side' && (
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
          <p>
            {currentSymptoms.length === 1
              ? '1 síntoma continúa activo.'
              : `${currentSymptoms.length} síntomas continúan activos.`}
          </p>
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