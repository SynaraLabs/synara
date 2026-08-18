import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  MigraineTrigger,
  TriggerRecord,
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

import styles from './TriggerSelector.module.css';

interface Props {
  value?: MigraineTrigger[];

  triggerRecords?: TriggerRecord[];

  onChange?: (
    triggers: MigraineTrigger[],
  ) => void;

  onTriggerRecordsChange?: (
    triggerRecords: TriggerRecord[],
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
  triggerRecords,
  onChange,
  onTriggerRecordsChange,
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

  const [
    showExplorer,
    setShowExplorer,
  ] = useState(false);

  const [
    customOtherTrigger,
    setCustomOtherTrigger,
  ] = useState('');

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

  const storeTriggerRecords =
    useMigraineStore(
      state =>
        state.episode
          .triggerRecords ?? [],
    );

  const updateStoreTriggerRecords =
    useMigraineStore(
      state =>
        state.updateTriggerRecords,
    );

  const selectedTriggerRecords =
    triggerRecords ??
    storeTriggerRecords;

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

  useEffect(() => {
    const otherRecord =
      selectedTriggerRecords.find(
        record =>
          record.trigger === 'other',
      );

    setCustomOtherTrigger(
      otherRecord?.notes ?? '',
    );
  }, [
    selectedTriggerRecords,
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

  const selectedOtherNote =
    selectedTriggerRecords.find(
      record =>
        record.trigger === 'other',
    )?.notes?.trim() ?? '';

  const normalizedCustomOther =
    customOtherTrigger.trim();

  const hasOtherSelected =
    draftTriggers.includes(
      'other',
    );

  const otherNoteChanged =
    hasOtherSelected
      ? normalizedCustomOther !==
        selectedOtherNote
      : selectedOtherNote.length > 0;

  const hasChanges =
    draftTriggers.length !==
      selectedTriggers.length ||
    draftTriggers.some(
      trigger =>
        !selectedTriggers.includes(
          trigger,
        ),
    ) ||
    otherNoteChanged;

  const canSave =
    hasChanges &&
    (
      !hasOtherSelected ||
      normalizedCustomOther.length > 0
    );

  const toggleTrigger = (
    trigger: MigraineTrigger,
  ) => {
    setDraftTriggers(current => {
      const isSelected =
        current.includes(trigger);

      if (
        trigger === 'other' &&
        isSelected
      ) {
        setCustomOtherTrigger('');
      }

      return isSelected
        ? current.filter(
            value =>
              value !== trigger,
          )
        : [
            ...current,
            trigger,
          ];
    });
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const updatedTriggers = [
      ...draftTriggers,
    ];

    const updatedTriggerRecords =
      selectedTriggerRecords.filter(
        record =>
          updatedTriggers.includes(
            record.trigger,
          ) &&
          record.trigger !== 'other',
      );

    if (hasOtherSelected) {
      updatedTriggerRecords.push({
        trigger: 'other',
        notes:
          normalizedCustomOther,
      });
    }

    if (onChange) {
      onChange(
        updatedTriggers,
      );
    } else {
      updateStoreTriggers(
        updatedTriggers,
      );
    }

    if (
      onTriggerRecordsChange
    ) {
      onTriggerRecordsChange(
        updatedTriggerRecords,
      );
    } else {
      updateStoreTriggerRecords(
        updatedTriggerRecords,
      );
    }

    setSearchTerm('');
    setActiveCategory(null);
    setShowExplorer(false);

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
          styles.choice
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

  const explorerTriggers =
    normalizedSearch
      ? searchResults
      : activeCategory
        ? categoryTriggers
        : [];

  return (
    <section
      className={
        styles.triggerSelector
      }
      aria-labelledby="trigger-title"
    >
      <header
        className={
          styles.header
        }
      >
        <p
          className={
            styles.eyebrow
          }
        >
          Contexto
        </p>

        <h3 id="trigger-title">
          Posibles desencadenantes
        </h3>

        <p>
          Marcá los factores que
          podrían haber influido.
        </p>
      </header>

      {draftTriggers.length >
        0 && (
        <section
          className={
            styles.selected
          }
          aria-labelledby="selected-triggers-title"
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <h4 id="selected-triggers-title">
              Seleccionados
            </h4>

            <span>
              {draftTriggers.length}
            </span>
          </div>

          <div
            className={
              styles.chips
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
                  {trigger ===
                    'other' &&
                  normalizedCustomOther
                    ? `Otro: ${normalizedCustomOther}`
                    : getTriggerLabel(
                        trigger,
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

      <section
        className={
          styles.frequent
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
              Elegí una o varias.
            </p>
          </div>
        </div>

        <div
          className={
            styles.choiceGrid
          }
        >
          {frequentTriggers.map(
            renderTrigger,
          )}
        </div>
      </section>

      <button
        type="button"
        className={
          styles.explorerToggle
        }
        aria-expanded={
          showExplorer
        }
        onClick={() =>
          setShowExplorer(
            current => !current,
          )
        }
      >
        {showExplorer
          ? 'Ocultar búsqueda y categorías'
          : 'Explorar otros desencadenantes'}
      </button>

      {showExplorer && (
        <section
          className={
            styles.explorer
          }
        >
          <label
            className={
              styles.search
            }
          >
            <span>
              Buscar desencadenante
            </span>

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
                styles.categories
              }
              aria-label="Categorías de desencadenantes"
            >
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
                        current =>
                          current ===
                          category
                            ? null
                            : category,
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

          {(normalizedSearch ||
            activeCategory) && (
            <section
              className={
                styles.results
              }
            >
              <h4>
                {normalizedSearch
                  ? 'Resultados'
                  : activeCategory
                    ? TRIGGER_CATEGORY_LABELS[
                        activeCategory
                      ]
                    : ''}
              </h4>

              {explorerTriggers.length >
              0 ? (
                <div
                  className={
                    styles.choiceGrid
                  }
                >
                  {explorerTriggers.map(
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
          )}
        </section>
      )}

      {hasOtherSelected && (
        <section
          className={
            styles.customTrigger
          }
        >
          <label>
            <span>
              ¿Cuál?
            </span>

            <input
              type="text"
              value={
                customOtherTrigger
              }
              placeholder="Ej.: dormí en una posición incómoda"
              autoComplete="off"
              onChange={event =>
                setCustomOtherTrigger(
                  event.target.value,
                )
              }
            />
          </label>

          <p>
            Escribí el posible
            desencadenante que no
            encontraste en la lista.
          </p>
        </section>
      )}

      <div
        className={
          styles.summary
        }
        role="status"
      >
        <strong>
          {draftTriggers.length}
        </strong>

        <span>
          {draftTriggers.length ===
          0
            ? 'Ningún desencadenante seleccionado'
            : draftTriggers.length ===
                1
              ? 'desencadenante seleccionado'
              : 'desencadenantes seleccionados'}
        </span>
      </div>

      <button
        type="button"
        className={
          styles.saveButton
        }
        disabled={!canSave}
        onClick={handleSave}
      >
        {hasOtherSelected &&
        normalizedCustomOther.length ===
          0
          ? 'Completá el desencadenante'
          : hasChanges
            ? 'Guardar desencadenantes'
            : 'Desencadenantes guardados'}
      </button>
    </section>
  );
}