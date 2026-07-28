import styles from '../migraine.module.css';

import type {
  AuraTiming,
  AuraType,
  LanguageAura,
  SensoryAura,
  VisualAura,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

type SelectableOption<T extends string> = {
  value: T;
  label: string;
};

const auraTypes: SelectableOption<AuraType>[] = [
  {
    value: 'visual',
    label: 'Visual',
  },
  {
    value: 'sensory',
    label: 'Sensitiva',
  },
  {
    value: 'language',
    label: 'Lenguaje',
  },
];

const visualSymptoms: SelectableOption<VisualAura>[] = [
  {
    value: 'flashes',
    label: 'Destellos de luz',
  },
  {
    value: 'zigzagLines',
    label: 'Líneas zigzag',
  },
  {
    value: 'blindSpots',
    label: 'Puntos ciegos',
  },
  {
    value: 'blurredVision',
    label: 'Visión borrosa',
  },
];

const sensorySymptoms: SelectableOption<SensoryAura>[] = [
  {
    value: 'tingling',
    label: 'Hormigueo',
  },
  {
    value: 'numbness',
    label: 'Entumecimiento',
  },
  {
    value: 'electricSensation',
    label: 'Sensación eléctrica',
  },
];

const languageSymptoms: SelectableOption<LanguageAura>[] = [
  {
    value: 'wordFindingDifficulty',
    label: 'Dificultad para encontrar palabras',
  },
  {
    value: 'speechDifficulty',
    label: 'Dificultad al hablar',
  },
];

const auraTimingOptions: SelectableOption<AuraTiming>[] = [
  {
    value: 'beforePain',
    label: 'Antes de que comenzara el dolor',
  },
  {
    value: 'duringPain',
    label: 'Durante el dolor',
  },
  {
    value: 'afterPain',
    label: 'Después de que terminó el dolor',
  },
];

export function AuraSelector() {
  const aura = useMigraineStore(
    state => state.episode.aura,
  );

  const updateAura = useMigraineStore(
    state => state.updateAura,
  );

  const hasAura = aura.types.length > 0;

  const toggleType = (
    type: AuraType,
  ) => {
    const isSelected =
      aura.types.includes(type);

    const updatedTypes = isSelected
      ? aura.types.filter(
          currentType =>
            currentType !== type,
        )
      : [
          ...aura.types,
          type,
        ];

    updateAura({
      ...aura,
      present: updatedTypes.length > 0,
      types: updatedTypes,
    });
  };

  const handleDurationChange = (
    value: string,
  ) => {
    if (value === '') {
      updateAura({
        ...aura,
        durationMinutes: undefined,
      });

      return;
    }

    const parsedValue = Number(value);

    if (
      Number.isNaN(parsedValue) ||
      parsedValue < 1
    ) {
      return;
    }

    updateAura({
      ...aura,
      durationMinutes: parsedValue,
    });
  };

  const handleTimingChange = (
    value: string,
  ) => {
    updateAura({
      ...aura,
      timing:
        value === ''
          ? undefined
          : (value as AuraTiming),
    });
  };

  return (
    <section
      className={styles.symptomSelector}
      aria-labelledby="aura-title"
    >
      <div>
        <h3 id="aura-title">
          Síntomas de aura
        </h3>

        <p>
          Seleccioná el tipo de aura que
          experimentaste durante este
          episodio.
        </p>
      </div>

      <div
        className={styles.symptomGrid}
        role="group"
        aria-label="Tipos de aura"
      >
        {auraTypes.map(item => (
          <label
            key={item.value}
            className={styles.symptomOption}
          >
            <input
              type="checkbox"
              checked={aura.types.includes(
                item.value,
              )}
              onChange={() =>
                toggleType(item.value)
              }
            />

            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {aura.types.includes('visual') && (
        <AuraCheckboxGroup
          title="Síntomas visuales"
          ariaLabel="Síntomas visuales del aura"
          items={visualSymptoms}
          selected={aura.visualSymptoms}
          onChange={visualValues =>
            updateAura({
              ...aura,
              visualSymptoms:
                visualValues,
            })
          }
        />
      )}

      {aura.types.includes('sensory') && (
        <AuraCheckboxGroup
          title="Síntomas sensitivos"
          ariaLabel="Síntomas sensitivos del aura"
          items={sensorySymptoms}
          selected={aura.sensorySymptoms}
          onChange={sensoryValues =>
            updateAura({
              ...aura,
              sensorySymptoms:
                sensoryValues,
            })
          }
        />
      )}

      {aura.types.includes('language') && (
        <AuraCheckboxGroup
          title="Síntomas de lenguaje"
          ariaLabel="Síntomas de lenguaje del aura"
          items={languageSymptoms}
          selected={aura.languageSymptoms}
          onChange={languageValues =>
            updateAura({
              ...aura,
              languageSymptoms:
                languageValues,
            })
          }
        />
      )}

      {hasAura && (
        <div className={styles.dateSelector}>
          <div
            className={styles.auraDetailsGrid}
          >
            <label>
              Duración del aura

              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={
                  aura.durationMinutes ??
                  ''
                }
                placeholder="Ejemplo: 30"
                onChange={event =>
                  handleDurationChange(
                    event.target.value,
                  )
                }
              />

              <small>
                Ingresá la duración en
                minutos.
              </small>
            </label>

            <label>
              ¿Cuándo ocurrió?

              <select
                value={aura.timing ?? ''}
                onChange={event =>
                  handleTimingChange(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Seleccionar momento
                </option>

                {auraTimingOptions.map(
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
          </div>

          <p>
            SYNARA calculará
            automáticamente el inicio y
            el final del aura tomando
            como referencia la crisis.
          </p>
        </div>
      )}
    </section>
  );
}

interface AuraCheckboxGroupProps<
  T extends string,
> {
  title: string;
  ariaLabel: string;
  items: SelectableOption<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
}

function AuraCheckboxGroup<
  T extends string,
>({
  title,
  ariaLabel,
  items,
  selected,
  onChange,
}: AuraCheckboxGroupProps<T>) {
  const toggleValue = (
    value: T,
  ) => {
    const isSelected =
      selected.includes(value);

    const updatedValues = isSelected
      ? selected.filter(
          currentValue =>
            currentValue !== value,
        )
      : [
          ...selected,
          value,
        ];

    onChange(updatedValues);
  };

  return (
    <div className={styles.auraGroup}>
      <h4>{title}</h4>

      <div
        className={styles.symptomGrid}
        role="group"
        aria-label={ariaLabel}
      >
        {items.map(item => (
          <label
            key={item.value}
            className={styles.symptomOption}
          >
            <input
              type="checkbox"
              checked={selected.includes(
                item.value,
              )}
              onChange={() =>
                toggleValue(item.value)
              }
            />

            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}