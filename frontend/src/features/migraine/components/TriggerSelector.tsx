import {
  useEffect,
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

interface Props {
  value?: MigraineTrigger[];

  onChange?: (
    triggers: MigraineTrigger[],
  ) => void;

  onComplete?: () => void;
}

type TriggerCategory =
  (typeof TRIGGER_CATEGORY_ORDER)[number];

const getTriggerLabel = (
  trigger: MigraineTrigger,
): string => {
  return (
    TRIGGER_CATALOG.find(
      definition =>
        definition.value === trigger,
    )?.label ?? trigger
  );
};

export function TriggerSelector({
  value,
  onChange,
  onComplete,
}: Props) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    TriggerCategory | null
  >(null);

  const storeTriggers =
    useMigraineStore(
      state =>
        state.episode.triggers,
    ) ?? [];

  const updateStoreTriggers =
    useMigraineStore(
      state =>
        state.updateTriggers,
    );

  const selectedTriggers =
    value ?? storeTriggers;

  const [
    draftTriggers,
    setDraftTriggers,
  ] = useState<
    MigraineTrigger[]
  >(
    selectedTriggers,
  );

  useEffect(() => {
    setDraftTriggers(
      selectedTriggers,
    );
  }, [
    selectedTriggers,
  ]);

  const normalizedSearch =
    normalizeTriggerSearch(
      searchTerm.trim(),
    );

  const frequentTriggers =
    useMemo(() => {
      return TRIGGER_CATALOG.filter(
        definition =>
          FREQUENT_TRIGGERS.includes(
            definition.value,
          ),
      ).slice(0, 8);
    }, []);

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
                  definition
                    .searchTerms ?? []
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

  const categoryTriggers =
    useMemo(() => {
      if (!activeCategory) {
        return [];
      }

      return TRIGGER_CATALOG.filter(
        definition =>
          definition.category ===
          activeCategory,
      );
    }, [
      activeCategory,
    ]);

  const hasChanges =
    draftTriggers.length !==
      selectedTriggers.length ||
    draftTriggers.some(
      trigger =>
        !selectedTriggers.includes(
          trigger,
        ),
    );

  const toggleTrigger = (
    trigger: MigraineTrigger,
  ) => {
    setDraftTriggers(current =>
      current.includes(trigger)
        ? current.filter(
            value =>
              value !== trigger,
          )
        : [
            ...current,
            trigger,
          ],
    );
  };

  const handleSave = () => {
    if (!hasChanges) {
      return;
    }

    const updatedTriggers = [
      ...draftTriggers,
    ];

    if (onChange) {
      onChange(
        updatedTriggers,
      );
    } else {
      updateStoreTriggers(
        updatedTriggers,
      );
    }

    setSearchTerm('');
    setActiveCategory(null);

    onComplete?.();
  };

  const renderTrigger = (
    trigger: TriggerDefinition,
  ) => {
    const isSelected =
      draftTriggers.includes(
        trigger.value,
      );

    return (
      <button
        key={trigger.value}
        type="button"
        className={
          styles.compactChoice
        }
        aria-pressed={isSelected}
        onClick={() =>
          toggleTrigger(
            trigger.value,
          )
        }
      >
        {trigger.label}
      </button>
    );
  };

  const visibleTriggers =
    normalizedSearch
      ? searchResults
      : activeCategory
        ? categoryTriggers
        : frequentTriggers;

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
          Marcá los factores que podrían
          haber influido y guardá cuando
          termines.
        </p>
      </div>

      {draftTriggers.length >
        0 && (
        <section
          className={
            styles.compactSelected
          }
          aria-labelledby="selected-triggers-title"
        >
          <h4 id="selected-triggers-title">
            Seleccionados
          </h4>

          <div
            className={
              styles.compactChips
            }
          >
            {draftTriggers.map(
              trigger => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() =>
                    toggleTrigger(
                      trigger,
                    )
                  }
                  aria-label={`Quitar ${getTriggerLabel(
                    trigger,
                  )}`}
                >
                  {
                    getTriggerLabel(
                      trigger,
                    )
                  }

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

      <label>
        Buscar desencadenante

        <input
          type="search"
          value={searchTerm}
          placeholder="Ej.: ovulación, cuello, perfume"
          autoComplete="off"
          onChange={event => {
            setSearchTerm(
              event.target.value,
            );

            if (
              event.target.value
            ) {
              setActiveCategory(
                null,
              );
            }
          }}
        />
      </label>

      {!normalizedSearch && (
        <div
          className={
            styles.compactCategories
          }
          aria-label="Categorías de desencadenantes"
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

          {TRIGGER_CATEGORY_ORDER.map(
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
                  TRIGGER_CATEGORY_LABELS[
                    category
                  ]
                }
              </button>
            ),
          )}
        </div>
      )}

      <section
        className={
          styles.compactResults
        }
      >
        <h4>
          {normalizedSearch
            ? 'Resultados'
            : activeCategory
              ? TRIGGER_CATEGORY_LABELS[
                  activeCategory
                ]
              : 'Más frecuentes'}
        </h4>

        {visibleTriggers.length >
        0 ? (
          <div
            className={
              styles.compactChoiceGrid
            }
          >
            {visibleTriggers.map(
              renderTrigger,
            )}
          </div>
        ) : (
          <p
            className={
              styles.helperText
            }
          >
            No se encontraron
            desencadenantes.
          </p>
        )}
      </section>

      <div
        className={
          styles.selectionSummary
        }
        role="status"
      >
        {draftTriggers.length >
          0 && (
          <span aria-hidden="true">
            ✓
          </span>
        )}

        <p>
          {draftTriggers.length ===
          0
            ? 'Ningún desencadenante seleccionado'
            : draftTriggers.length ===
                1
              ? '1 desencadenante seleccionado'
              : `${draftTriggers.length} desencadenantes seleccionados`}
        </p>
      </div>

      <button
        type="button"
        disabled={!hasChanges}
        onClick={handleSave}
      >
        {hasChanges
          ? 'Guardar desencadenantes'
          : 'Desencadenantes guardados'}
      </button>
    </section>
  );
}