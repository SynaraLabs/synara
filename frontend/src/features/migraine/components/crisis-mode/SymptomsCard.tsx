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
}

export function SymptomsCard({
  symptoms,
  onToggle,
}: Props) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    showAllSymptoms,
    setShowAllSymptoms,
  ] = useState(false);

  const normalizedSearch =
    normalizeCrisisSymptomSearch(
      searchTerm.trim(),
    );

  const frequentSymptoms =
    useMemo(() => {
      return CRISIS_SYMPTOM_CATALOG.filter(
        definition =>
          FREQUENT_CRISIS_SYMPTOMS.includes(
            definition.value,
          ),
      );
    }, []);

  const filteredSymptoms =
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

  const symptomsByCategory =
    useMemo(() => {
      const grouped = new Map<
        CrisisSymptomCategory,
        typeof CRISIS_SYMPTOM_CATALOG
      >();

      for (
        const category
        of CRISIS_CATEGORY_ORDER
      ) {
        const categorySymptoms =
          CRISIS_SYMPTOM_CATALOG.filter(
            definition =>
              definition.category ===
                category &&
              !definition.frequent,
          );

        if (
          categorySymptoms.length > 0
        ) {
          grouped.set(
            category,
            categorySymptoms,
          );
        }
      }

      return grouped;
    }, []);

  const searchResultsByCategory =
    useMemo(() => {
      const grouped = new Map<
        CrisisSymptomCategory,
        typeof CRISIS_SYMPTOM_CATALOG
      >();

      for (
        const category
        of CRISIS_CATEGORY_ORDER
      ) {
        const categorySymptoms =
          filteredSymptoms.filter(
            definition =>
              definition.category ===
              category,
          );

        if (
          categorySymptoms.length > 0
        ) {
          grouped.set(
            category,
            categorySymptoms,
          );
        }
      }

      return grouped;
    }, [filteredSymptoms]);

  const renderSymptomButton = (
    symptom:
      (typeof CRISIS_SYMPTOM_CATALOG)[number],
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

  const renderCategories = (
    groupedSymptoms: Map<
      CrisisSymptomCategory,
      typeof CRISIS_SYMPTOM_CATALOG
    >,
  ) => {
    return CRISIS_CATEGORY_ORDER.map(
      category => {
        const categorySymptoms =
          groupedSymptoms.get(
            category,
          );

        if (
          !categorySymptoms ||
          categorySymptoms.length === 0
        ) {
          return null;
        }

        return (
          <section key={category}>
            <h3>
              {
                CRISIS_CATEGORY_LABELS[
                  category
                ]
              }
            </h3>

            <div
              className={styles.grid}
            >
              {categorySymptoms.map(
                renderSymptomButton,
              )}
            </div>
          </section>
        );
      },
    );
  };

  const isSearching =
    normalizedSearch.length > 0;

  return (
    <div className={styles.card}>
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

      <label>
        Buscar síntomas
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
        <>
          {filteredSymptoms.length >
          0 ? (
            renderCategories(
              searchResultsByCategory,
            )
          ) : (
            <p>
              No se encontraron
              síntomas.
            </p>
          )}
        </>
      ) : (
        <>
          <section>
            <h3>
              Síntomas frecuentes
            </h3>

            <div
              className={styles.grid}
            >
              {frequentSymptoms.map(
                renderSymptomButton,
              )}
            </div>
          </section>

          <button
            type="button"
            aria-expanded={
              showAllSymptoms
            }
            onClick={() =>
              setShowAllSymptoms(
                current =>
                  !current,
              )
            }
          >
            {showAllSymptoms
              ? 'Ocultar síntomas adicionales'
              : 'Mostrar todos los síntomas'}
          </button>

          {showAllSymptoms &&
            renderCategories(
              symptomsByCategory,
            )}
        </>
      )}
    </div>
  );
}