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

import styles from './PremonitoryUpdateFlow.module.css';

type UpdateChoice =
  | 'add'
  | 'remove'
  | 'intensity'
  | 'note'
  | 'same';

interface Props {
  currentSymptoms:
    ExtendedPremonitorySymptom[];
  selectedSymptoms:
    ExtendedPremonitorySymptom[];
  dateTime: string;
  maxDateTime: string;
  intensity: string;
  notes: string;
  onToggleSymptom: (
    symptom:
      ExtendedPremonitorySymptom,
  ) => void;
  onResetSymptoms: () => void;
  onDateTimeChange: (
    value: string,
  ) => void;
  onIntensityChange: (
    value: string,
  ) => void;
  onNotesChange: (
    value: string,
  ) => void;
  onSave: () => void;
  onOpenResolution: () => void;
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

export function PremonitoryUpdateFlow({
  currentSymptoms,
  selectedSymptoms,
  dateTime,
  maxDateTime,
  intensity,
  notes,
  onToggleSymptom,
  onResetSymptoms,
  onDateTimeChange,
  onIntensityChange,
  onNotesChange,
  onSave,
  onOpenResolution,
}: Props) {
  const flowRef =
    useRef<HTMLElement | null>(
      null,
    );

  const [
    choice,
    setChoice,
  ] = useState<
    UpdateChoice | null
  >(null);

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
    choice,
  ]);

  const resetBranch = () => {
    onResetSymptoms();
    setSymptomSearch('');
    setExpandedCategory(null);
    setChoice(null);
  };

  const normalizedSearch =
    normalizeText(
      symptomSearch.trim(),
    );

  const availableToAdd =
    useMemo(
      () =>
        catalog.filter(
          definition =>
            !currentSymptoms.includes(
              definition.value,
            ),
        ),
      [
        currentSymptoms,
      ],
    );

  const frequentToAdd =
    useMemo(
      () =>
        availableToAdd.filter(
          definition =>
            FREQUENT_SYMPTOMS.has(
              definition.value,
            ),
        ),
      [
        availableToAdd,
      ],
    );

  const searchedDefinitions =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return availableToAdd.filter(
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
      availableToAdd,
      normalizedSearch,
    ]);

  const addedSymptoms =
    selectedSymptoms.filter(
      symptom =>
        !currentSymptoms.includes(
          symptom,
        ),
    );

  const removedSymptoms =
    currentSymptoms.filter(
      symptom =>
        !selectedSymptoms.includes(
          symptom,
        ),
    );

  const canSaveAdd =
    addedSymptoms.length > 0;

  const canSaveRemove =
    removedSymptoms.length > 0;

  const canSaveIntensity =
    intensity !== '';

  const canSaveNote =
    notes.trim().length > 0;

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

  const renderMomentField = () => (
    <label
      className={styles.field}
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
  );

  if (!choice) {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-update-title"
      >
        <div
          className={
            styles.question
          }
        >
          <p
            className={
              styles.eyebrow
            }
          >
            Señales previas
          </p>

          <h3
            id="premonitory-update-title"
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
            onClick={() =>
              setChoice('add')
            }
          >
            <span>
              Aparecieron nuevas señales
            </span>

            <small>
              Agregar síntomas que no
              estaban antes.
            </small>
          </button>

          <button
            type="button"
            onClick={() =>
              setChoice('remove')
            }
            disabled={
              currentSymptoms.length ===
              0
            }
          >
            <span>
              Algunas ya no están
            </span>

            <small>
              Marcar señales que dejaron
              de estar presentes.
            </small>
          </button>

          <button
            type="button"
            onClick={() =>
              setChoice('intensity')
            }
          >
            <span>
              Cambió la intensidad
            </span>

            <small>
              Registrar cómo se sienten
              en general.
            </small>
          </button>

          <button
            type="button"
            onClick={() =>
              setChoice('note')
            }
          >
            <span>
              Quiero agregar una nota
            </span>

            <small>
              Guardar algo que quieras
              recordar.
            </small>
          </button>

          <button
            type="button"
            onClick={() =>
              setChoice('same')
            }
          >
            <span>
              Siguen igual
            </span>

            <small>
              Registrar que no hubo
              cambios.
            </small>
          </button>

          <button
            type="button"
            className={
              styles.endAction
            }
            onClick={
              onOpenResolution
            }
          >
            <span>
              Las señales terminaron
            </span>

            <small>
              Indicar cómo finalizó esta
              fase.
            </small>
          </button>
        </div>
      </section>
    );
  }

  if (choice === 'add') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-add-title"
      >
        <button
          type="button"
          className={styles.backButton}
          onClick={resetBranch}
        >
          Volver
        </button>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-add-title"
          >
            ¿Qué apareció?
          </h3>

          <p>
            Seleccioná solamente las
            señales nuevas.
          </p>
        </div>

        {addedSymptoms.length > 0 && (
          <section
            className={
              styles.selectedArea
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <h4>
                Nuevas señales
              </h4>

              <span>
                {addedSymptoms.length}
              </span>
            </div>

            <div
              className={
                styles.selectedChips
              }
            >
              {addedSymptoms.map(
                symptom => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      onToggleSymptom(
                        symptom,
                      )
                    }
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

        {frequentToAdd.length > 0 && (
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
              <h4>
                Frecuentes
              </h4>
            </div>

            <div
              className={
                styles.choiceGrid
              }
            >
              {frequentToAdd.map(
                renderChoice,
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
              styles.searchField
            }
          >
            <span>
              Buscar otra señal
            </span>

            <input
              type="search"
              value={symptomSearch}
              onChange={event =>
                setSymptomSearch(
                  event.target.value,
                )
              }
              placeholder="Ej.: mareo, hambre, tensión…"
            />
          </label>

          {normalizedSearch ? (
            searchedDefinitions.length >
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
                No encontramos señales
                con ese nombre.
              </p>
            )
          ) : (
            <div
              className={
                styles.categoryList
              }
            >
              {CATEGORY_ORDER.map(
                category => {
                  const definitions =
                    availableToAdd.filter(
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
                            clinicalSymptomCategoryLabels[
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

        {renderMomentField()}

        <button
          type="button"
          className={
            styles.primaryAction
          }
          disabled={!canSaveAdd}
          onClick={onSave}
        >
          Registrar nuevas señales
        </button>
      </section>
    );
  }

  if (choice === 'remove') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-remove-title"
      >
        <button
          type="button"
          className={styles.backButton}
          onClick={resetBranch}
        >
          Volver
        </button>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-remove-title"
          >
            ¿Cuáles ya no están?
          </h3>

          <p>
            Tocá las señales que dejaron
            de estar presentes.
          </p>
        </div>

        <div
          className={
            styles.choiceGrid
          }
        >
          {currentSymptoms.map(
            symptom => {
              const isRemoved =
                removedSymptoms.includes(
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
                    isRemoved
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

        {removedSymptoms.length > 0 && (
          <p
            className={
              styles.changeSummary
            }
          >
            {removedSymptoms.length ===
            1
              ? '1 señal dejará de figurar como activa.'
              : `${removedSymptoms.length} señales dejarán de figurar como activas.`}
          </p>
        )}

        {renderMomentField()}

        <button
          type="button"
          className={
            styles.primaryAction
          }
          disabled={
            !canSaveRemove
          }
          onClick={onSave}
        >
          Registrar cambio
        </button>
      </section>
    );
  }

  if (choice === 'intensity') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-intensity-title"
      >
        <button
          type="button"
          className={styles.backButton}
          onClick={resetBranch}
        >
          Volver
        </button>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-intensity-title"
          >
            ¿Qué intensidad tienen
            ahora?
          </h3>

          <p>
            Es una valoración general de
            las señales premonitorias.
          </p>
        </div>

        <label
          className={styles.field}
        >
          <span>
            Intensidad general
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

        {renderMomentField()}

        <button
          type="button"
          className={
            styles.primaryAction
          }
          disabled={
            !canSaveIntensity
          }
          onClick={onSave}
        >
          Registrar intensidad
        </button>
      </section>
    );
  }

  if (choice === 'note') {
    return (
      <section
        ref={flowRef}
        className={styles.flow}
        aria-labelledby="premonitory-note-title"
      >
        <button
          type="button"
          className={styles.backButton}
          onClick={resetBranch}
        >
          Volver
        </button>

        <div
          className={
            styles.question
          }
        >
          <h3
            id="premonitory-note-title"
          >
            Agregar una nota
          </h3>

          <p>
            Guardá solo lo que te resulte
            útil recordar.
          </p>
        </div>

        <label
          className={styles.field}
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
            placeholder="Ej.: hoy la rigidez cervical apareció antes que ayer"
            rows={4}
          />
        </label>

        {renderMomentField()}

        <button
          type="button"
          className={
            styles.primaryAction
          }
          disabled={!canSaveNote}
          onClick={onSave}
        >
          Guardar nota
        </button>
      </section>
    );
  }

  return (
    <section
      ref={flowRef}
      className={styles.flow}
      aria-labelledby="premonitory-same-title"
    >
      <button
        type="button"
        className={styles.backButton}
        onClick={resetBranch}
      >
        Volver
      </button>

      <div
        className={
          styles.question
        }
      >
        <h3
          id="premonitory-same-title"
        >
          ¿Siguen igual?
        </h3>

        <p>
          Se registrará una actualización
          con las mismas señales activas.
        </p>
      </div>

      {renderMomentField()}

      <button
        type="button"
        className={
          styles.primaryAction
        }
        onClick={onSave}
      >
        Registrar sin cambios
      </button>
    </section>
  );
}