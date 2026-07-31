import {
  useMemo,
  useState,
} from 'react';

import type {
  MigraineTrigger,
} from '../types/migraine.types';

import {
  FREQUENT_TRIGGERS,
  TRIGGER_CATALOG,
  TRIGGER_CATEGORY_LABELS,
  TRIGGER_CATEGORY_ORDER,
  normalizeTriggerSearch,
  type TriggerDefinition,
} from '../data/triggerCatalog';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

export function TriggerSelector() {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    showAllTriggers,
    setShowAllTriggers,
  ] = useState(false);

  const selectedTriggers =
    useMigraineStore(
      state =>
        state.episode.triggers,
    ) ?? [];

  const updateTriggers =
    useMigraineStore(
      state =>
        state.updateTriggers,
    );

  const normalizedSearch =
    normalizeTriggerSearch(
      searchTerm.trim(),
    );

  const quickTriggers =
    useMemo(() => {
      return TRIGGER_CATALOG.filter(
        definition =>
          FREQUENT_TRIGGERS.includes(
            definition.value,
          ) ||
          selectedTriggers.includes(
            definition.value,
          ),
      );
    }, [selectedTriggers]);

  const searchResults =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return TRIGGER_CATALOG.filter(
        definition => {
          const searchableText =
            normalizeTriggerSearch(
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

  const toggleTrigger = (
    trigger: MigraineTrigger,
  ) => {
    const isSelected =
      selectedTriggers.includes(
        trigger,
      );

    const updatedTriggers =
      isSelected
        ? selectedTriggers.filter(
            selectedTrigger =>
              selectedTrigger !==
              trigger,
          )
        : [
            ...selectedTriggers,
            trigger,
          ];

    updateTriggers(
      updatedTriggers,
    );
  };

  const renderTrigger = (
    trigger:
      TriggerDefinition,
  ) => {
    const isSelected =
      selectedTriggers.includes(
        trigger.value,
      );

    return (
      <label
        key={trigger.value}
        className={
          styles.symptomOption
        }
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() =>
            toggleTrigger(
              trigger.value,
            )
          }
        />

        <span>
          {trigger.label}
        </span>
      </label>
    );
  };

  const renderCategories = (
    definitions:
      readonly TriggerDefinition[],
    excludeFrequent = false,
  ) => {
    return TRIGGER_CATEGORY_ORDER.map(
      category => {
        const categoryTriggers =
          definitions.filter(
            definition =>
              definition.category ===
                category &&
              (
                !excludeFrequent ||
                !definition.frequent
              ),
          );

        if (
          categoryTriggers.length ===
          0
        ) {
          return null;
        }

        return (
          <fieldset
            key={category}
            className={
              styles.triggerCategory
            }
          >
            <legend>
              {
                TRIGGER_CATEGORY_LABELS[
                  category
                ]
              }
            </legend>

            <div
              className={
                styles.symptomGrid
              }
            >
              {categoryTriggers.map(
                renderTrigger,
              )}
            </div>
          </fieldset>
        );
      },
    );
  };

  const isSearching =
    normalizedSearch.length > 0;

  return (
    <section
      className={
        styles.triggerSelector
      }
      aria-labelledby="trigger-title"
    >
      <div>
        <h3 id="trigger-title">
          Posibles desencadenantes
        </h3>

        <p>
          Seleccioná los factores que
          podrían haber influido en este
          episodio. Podés marcar más de
          uno.
        </p>
      </div>

      <label>
        Buscar desencadenante

        <input
          type="search"
          value={searchTerm}
          placeholder="Ej.: ovulación, cuello, perfume"
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
          {searchResults.length > 0 ? (
            renderCategories(
              searchResults,
            )
          ) : (
            <p>
              No se encontraron
              desencadenantes.
            </p>
          )}
        </>
      ) : (
        <>
          <fieldset
            className={
              styles.triggerCategory
            }
          >
            <legend>
              Frecuentes y seleccionados
            </legend>

            <div
              className={
                styles.symptomGrid
              }
            >
              {quickTriggers.map(
                renderTrigger,
              )}
            </div>
          </fieldset>

          <button
            type="button"
            aria-expanded={
              showAllTriggers
            }
            onClick={() =>
              setShowAllTriggers(
                current =>
                  !current,
              )
            }
          >
            {showAllTriggers
              ? 'Ocultar desencadenantes adicionales'
              : 'Mostrar todos los desencadenantes'}
          </button>

          {showAllTriggers &&
            renderCategories(
              TRIGGER_CATALOG,
              true,
            )}
        </>
      )}

      <div
        className={
          styles.selectionSummary
        }
        role="status"
      >
        {selectedTriggers.length > 0 && (
          <span aria-hidden="true">
            ✓
          </span>
        )}

        <p>
          {selectedTriggers.length === 0
            ? 'Ningún desencadenante seleccionado'
            : selectedTriggers.length ===
                1
              ? '1 desencadenante seleccionado'
              : `${selectedTriggers.length} desencadenantes seleccionados`}
        </p>
      </div>
    </section>
  );
}