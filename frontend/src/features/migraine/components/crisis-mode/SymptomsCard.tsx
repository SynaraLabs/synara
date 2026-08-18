import {
  useMemo,
  useState,
} from 'react';

import styles from './crisis-mode.module.css';

import type {
  CrisisSymptom,
  CrisisSymptomCategory,
} from '../../types/migraine.types';

import {
  CRISIS_CATEGORY_LABELS,
  CRISIS_CATEGORY_ORDER,
  CRISIS_SYMPTOM_CATALOG,
  FREQUENT_CRISIS_SYMPTOMS,
  normalizeCrisisSymptomSearch,
} from '../../data/crisisSymptomCatalog';

interface Props {
  symptoms: CrisisSymptom[];

  onToggle: (
    symptom: CrisisSymptom,
  ) => void;

  onDone: () => void;
}

type SymptomDefinition =
  (typeof CRISIS_SYMPTOM_CATALOG)[number];

const MAX_FREQUENT_SYMPTOMS = 8;

export function SymptomsCard({
  symptoms,
  onToggle,
  onDone,
}: Props) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    CrisisSymptomCategory | null
  >(null);

  const [
    showAllSymptoms,
    setShowAllSymptoms,
  ] = useState(false);

  const normalizedSearch =
    normalizeCrisisSymptomSearch(
      searchTerm.trim(),
    );

  const selectedDefinitions =
    useMemo(() => {
      return CRISIS_SYMPTOM_CATALOG.filter(
        definition =>
          symptoms.includes(
            definition.value,
          ),
      );
    }, [symptoms]);

  const frequentSymptoms =
    useMemo(() => {
      return CRISIS_SYMPTOM_CATALOG.filter(
        definition =>
          FREQUENT_CRISIS_SYMPTOMS.includes(
            definition.value,
          ),
      ).slice(
        0,
        MAX_FREQUENT_SYMPTOMS,
      );
    }, []);

  const searchResults =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return CRISIS_SYMPTOM_CATALOG.filter(
        definition => {
          const searchableText =
            normalizeCrisisSymptomSearch(
              [
                definition.label,
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
    }, [normalizedSearch]);

  const categorySymptoms =
    useMemo(() => {
      if (!activeCategory) {
        return [];
      }

      return CRISIS_SYMPTOM_CATALOG.filter(
        definition =>
          definition.category ===
          activeCategory,
      );
    }, [activeCategory]);

  const categoryCounts =
    useMemo(() => {
      return new Map(
        CRISIS_CATEGORY_ORDER.map(
          category => [
            category,
            CRISIS_SYMPTOM_CATALOG.filter(
              definition =>
                definition.category ===
                category,
            ).length,
          ],
        ),
      );
    }, []);

  const renderSymptomButton = (
    symptom: SymptomDefinition,
  ) => {
    const isActive =
      symptoms.includes(
        symptom.value,
      );

    return (
      <button
        key={symptom.value}
        type="button"
        className={
          isActive
            ? styles.active
            : ''
        }
        aria-pressed={isActive}
        onClick={() =>
          onToggle(
            symptom.value,
          )
        }
      >
        {symptom.label}
      </button>
    );
  };

  const isSearching =
    normalizedSearch.length > 0;

  const handleToggleAll = () => {
    setShowAllSymptoms(
      current => !current,
    );

    setSearchTerm('');
    setActiveCategory(null);
  };

  return (
    <div
      className={styles.symptomsCard}
    >
      <header
        className={
          styles.symptomsHeader
        }
      >
        <div>
          <h2>
            Síntomas durante la crisis
          </h2>

          <p>
            {symptoms.length === 0
              ? 'Ningún síntoma seleccionado'
              : `${symptoms.length} ${
                  symptoms.length === 1
                    ? 'síntoma seleccionado'
                    : 'síntomas seleccionados'
                }`}
          </p>
        </div>
      </header>

      {selectedDefinitions.length >
        0 && (
        <section
          className={
            styles.selectedSymptoms
          }
          aria-labelledby="selected-crisis-symptoms"
        >
          <h3
            id="selected-crisis-symptoms"
          >
            Seleccionados
          </h3>

          <div>
            {selectedDefinitions.map(
              definition => (
                <button
                  key={
                    definition.value
                  }
                  type="button"
                  aria-label={`Quitar ${definition.label}`}
                  onClick={() =>
                    onToggle(
                      definition.value,
                    )
                  }
                >
                  {definition.label}
                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      )}

      <section
        className={
          styles.quickSymptoms
        }
      >
        <h3>
          Frecuentes
        </h3>

        <div
          className={
            styles.symptomGrid
          }
        >
          {frequentSymptoms.map(
            renderSymptomButton,
          )}
        </div>
      </section>

      <button
        type="button"
        className={styles.secondary}
        aria-expanded={
          showAllSymptoms
        }
        onClick={
          handleToggleAll
        }
      >
        {showAllSymptoms
          ? 'Ocultar todos los síntomas'
          : 'Ver todos los síntomas'}
      </button>

      {showAllSymptoms && (
        <>
          <label
            className={
              styles.symptomSearch
            }
          >
            <span>
              Buscar síntomas
            </span>

            <input
              type="search"
              value={searchTerm}
              placeholder="Ej.: náuseas, cuello, mareo"
              autoComplete="off"
              onChange={event =>
                setSearchTerm(
                  event.target.value,
                )
              }
            />
          </label>

          {isSearching ? (
            <section
              className={
                styles.symptomResults
              }
              aria-live="polite"
            >
              <h3>
                Resultados
              </h3>

              {searchResults.length >
              0 ? (
                <div
                  className={
                    styles.symptomGrid
                  }
                >
                  {searchResults.map(
                    renderSymptomButton,
                  )}
                </div>
              ) : (
                <p
                  className={
                    styles.symptomEmpty
                  }
                >
                  No encontramos síntomas
                  con ese nombre.
                </p>
              )}
            </section>
          ) : (
            <section
              className={
                styles.symptomCategories
              }
              aria-labelledby="crisis-symptom-categories"
            >
              <h3
                id="crisis-symptom-categories"
              >
                Buscar por categoría
              </h3>

              <div
                className={
                  styles.categoryScroller
                }
                role="list"
              >
                {CRISIS_CATEGORY_ORDER.map(
                  category => (
                    <button
                      key={category}
                      type="button"
                      role="listitem"
                      aria-pressed={
                        activeCategory ===
                        category
                      }
                      onClick={() =>
                        setActiveCategory(
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
                          CRISIS_CATEGORY_LABELS[
                            category
                          ]
                        }
                      </span>

                      <small>
                        {
                          categoryCounts.get(
                            category,
                          ) ?? 0
                        }
                      </small>
                    </button>
                  ),
                )}
              </div>

              {activeCategory && (
                <div
                  className={
                    styles.categoryPanel
                  }
                >
                  <div
                    className={
                      styles.categoryPanelHeader
                    }
                  >
                    <h4>
                      {
                        CRISIS_CATEGORY_LABELS[
                          activeCategory
                        ]
                      }
                    </h4>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          null,
                        )
                      }
                    >
                      Cerrar
                    </button>
                  </div>

                  <div
                    className={
                      styles.symptomGrid
                    }
                  >
                    {categorySymptoms.map(
                      renderSymptomButton,
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <button
        type="button"
        className={
          styles.symptomsDone
        }
        onClick={onDone}
      >
        Listo
      </button>
    </div>
  );
}