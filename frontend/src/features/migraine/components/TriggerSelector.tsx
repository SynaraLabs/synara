import type {
  MigraineTrigger,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

type TriggerCategory =
  | 'Emocional'
  | 'Sueño'
  | 'Alimentación'
  | 'Hormonal'
  | 'Ambiente'
  | 'Otros';

type TriggerOption = {
  value: MigraineTrigger;
  label: string;
  category: TriggerCategory;
};

const triggers: TriggerOption[] = [
  {
    value: 'stress',
    label: 'Estrés',
    category: 'Emocional',
  },
  {
    value: 'lackOfSleep',
    label: 'Dormir poco',
    category: 'Sueño',
  },
  {
    value: 'food',
    label: 'Alimentos desencadenantes',
    category: 'Alimentación',
  },
  {
    value: 'caffeine',
    label: 'Cafeína',
    category: 'Alimentación',
  },
  {
    value: 'alcohol',
    label: 'Alcohol',
    category: 'Alimentación',
  },
  {
    value: 'hormonal',
    label: 'Cambios hormonales',
    category: 'Hormonal',
  },
  {
    value: 'weather',
    label: 'Cambios climáticos',
    category: 'Ambiente',
  },
  {
    value: 'smell',
    label: 'Olores fuertes',
    category: 'Ambiente',
  },
  {
    value: 'noise',
    label: 'Ruido',
    category: 'Ambiente',
  },
  {
    value: 'unknown',
    label: 'No identificado',
    category: 'Otros',
  },
];

const categories: TriggerCategory[] = [
  'Emocional',
  'Sueño',
  'Alimentación',
  'Hormonal',
  'Ambiente',
  'Otros',
];

export function TriggerSelector() {
  const selectedTriggers =
    useMigraineStore(
      state => state.episode.triggers,
    ) ?? [];

  const updateTriggers =
    useMigraineStore(
      state => state.updateTriggers,
    );

  const toggleTrigger = (
    trigger: MigraineTrigger,
  ) => {
    const isSelected =
      selectedTriggers.includes(trigger);

    const updatedTriggers =
      isSelected
        ? selectedTriggers.filter(
            selectedTrigger =>
              selectedTrigger !== trigger,
          )
        : [
            ...selectedTriggers,
            trigger,
          ];

    updateTriggers(updatedTriggers);
  };

  return (
    <section
      className={styles.triggerSelector}
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

      {categories.map(category => {
        const categoryTriggers =
          triggers.filter(
            trigger =>
              trigger.category ===
              category,
          );

        return (
          <fieldset
            key={category}
            className={
              styles.triggerCategory
            }
          >
            <legend>
              {category}
            </legend>

            <div
              className={
                styles.symptomGrid
              }
            >
              {categoryTriggers.map(
                trigger => {
                  const isSelected =
                    selectedTriggers.includes(
                      trigger.value,
                    );

                  return (
                    <label
                      key={
                        trigger.value
                      }
                      className={
                        styles.symptomOption
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          isSelected
                        }
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
                },
              )}
            </div>
          </fieldset>
        );
      })}

      {selectedTriggers.length > 0 && (
        <div
          className={
            styles.selectionSummary
          }
          role="status"
        >
          <span aria-hidden="true">
            ✓
          </span>

          <p>
            {selectedTriggers.length === 1
              ? '1 desencadenante seleccionado'
              : `${selectedTriggers.length} desencadenantes seleccionados`}
          </p>
        </div>
      )}
    </section>
  );
}