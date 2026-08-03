import {
  useMemo,
  useState,
} from 'react';

import type {
  ClinicalPhase,
  ClinicalSymptomCategory,
  SymptomSelection,
} from '../../migraine/types/migraine.types';

import {
  clinicalSymptomCategoryLabels,
  getSymptomsForPhase,
  type ClinicalSymptomId,
} from '../../migraine/data/clinicalSymptomCatalog';

import styles from './RetrospectiveSymptomSelector.module.css';

interface Props {
  phase: ClinicalPhase;

  value:
    SymptomSelection<
      ClinicalSymptomId
    >[];

  onChange: (
    value:
      SymptomSelection<
        ClinicalSymptomId
      >[],
  ) => void;
}

const PHASE_LABELS:
  Record<
    ClinicalPhase,
    string
  > = {
  premonitory:
    'señales premonitorias',

  aura:
    'aura',

  crisis:
    'crisis',

  postdrome:
    'postdromo',
};

const normalizeSearch = (
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
    )
    .trim();
};

export function RetrospectiveSymptomSelector({
  phase,
  value,
  onChange,
}: Props) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    ClinicalSymptomCategory | null
  >(null);

  const definitions =
    useMemo(
      () =>
        getSymptomsForPhase(
          phase,
        ),
      [phase],
    );

  const selectedIds =
    useMemo(
      () =>
        new Set(
          value.map(
            selection =>
              selection.symptom,
          ),
        ),
      [value],
    );

  const categories =
    useMemo(() => {
      const result:
        ClinicalSymptomCategory[] =
        [];

      definitions.forEach(
        definition => {
          if (
            !result.includes(
              definition.category,
            )
          ) {
            result.push(
              definition.category,
            );
          }
        },
      );

      return result;
    }, [definitions]);

  const normalizedSearch =
    normalizeSearch(
      searchTerm,
    );

  const visibleDefinitions =
    useMemo(() => {
      if (normalizedSearch) {
        return definitions.filter(
          definition => {
            const searchableText =
              normalizeSearch(
                [
                  definition.label,
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
      }

      if (activeCategory) {
        return definitions.filter(
          definition =>
            definition.category ===
            activeCategory,
        );
      }

      return definitions.filter(
        definition =>
          definition.frequent ||
          selectedIds.has(
            definition.value,
          ),
      );
    }, [
      activeCategory,
      definitions,
      normalizedSearch,
      selectedIds,
    ]);

  const selectedDefinitions =
    useMemo(() => {
      return definitions.filter(
        definition =>
          selectedIds.has(
            definition.value,
          ),
      );
    }, [
      definitions,
      selectedIds,
    ]);

  const toggleSymptom = (
    symptom:
      ClinicalSymptomId,
  ) => {
    const isSelected =
      selectedIds.has(symptom);

    if (isSelected) {
      onChange(
        value.filter(
          selection =>
            selection.symptom !==
            symptom,
        ),
      );

      return;
    }

    onChange([
      ...value,
      {
        symptom,
      },
    ]);
  };

  return (
    <section
      className={
        styles.container
      }
      aria-label={`Editar síntomas de ${PHASE_LABELS[phase]}`}
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <h4>
            Síntomas
          </h4>

          <p>
            Agregá lo que recordaste
            después o quitá un síntoma
            cargado por error.
          </p>
        </div>

        <span
          className={
            styles.count
          }
          aria-live="polite"
        >
          {value.length}
          {' '}
          {value.length === 1
            ? 'seleccionado'
            : 'seleccionados'}
        </span>
      </div>

      {selectedDefinitions.length >
        0 && (
        <div
          className={
            styles.selected
          }
          aria-label="Síntomas seleccionados"
        >
          {selectedDefinitions.map(
            definition => (
              <button
                key={
                  definition.value
                }
                type="button"
                onClick={() =>
                  toggleSymptom(
                    definition.value,
                  )
                }
                aria-label={`Quitar ${definition.label}`}
              >
                {definition.label}

                <span
                  aria-hidden="true"
                >
                  ×
                </span>
              </button>
            ),
          )}
        </div>
      )}

      <label
        className={
          styles.search
        }
      >
        <span>
          Buscar síntoma
        </span>

        <input
          type="search"
          value={searchTerm}
          placeholder="Ej.: bostezo, mareo, cuello"
          autoComplete="off"
          onChange={event =>
            setSearchTerm(
              event.target.value,
            )
          }
        />
      </label>

      {!normalizedSearch && (
        <div
          className={
            styles.categories
          }
          role="group"
          aria-label="Categorías de síntomas"
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

          {categories.map(
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

      <div
        className={
          styles.resultsHeader
        }
      >
        <p>
          {normalizedSearch
            ? 'Resultados de búsqueda'
            : activeCategory
              ? clinicalSymptomCategoryLabels[
                  activeCategory
                ]
              : 'Frecuentes y seleccionados'}
        </p>

        {normalizedSearch && (
          <button
            type="button"
            onClick={() =>
              setSearchTerm('')
            }
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {visibleDefinitions.length >
      0 ? (
        <div
          className={
            styles.grid
          }
        >
          {visibleDefinitions.map(
            definition => {
              const isSelected =
                selectedIds.has(
                  definition.value,
                );

              return (
                <button
                  key={
                    definition.value
                  }
                  type="button"
                  className={
                    isSelected
                      ? styles.active
                      : ''
                  }
                  aria-pressed={
                    isSelected
                  }
                  onClick={() =>
                    toggleSymptom(
                      definition.value,
                    )
                  }
                >
                  <span>
                    {
                      definition.label
                    }
                  </span>

                  {definition.uncommon && (
                    <small>
                      Menos frecuente
                    </small>
                  )}
                </button>
              );
            },
          )}
        </div>
      ) : (
        <p
          className={
            styles.empty
          }
        >
          No encontramos síntomas con
          esa búsqueda.
        </p>
      )}
    </section>
  );
}