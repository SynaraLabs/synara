import styles from '../migraine.module.css';

import type {
  AuraTiming,
  AuraType,
  LanguageAura,
  SensoryAura,
  VisualAura,
} from '../types/migraine.types';

import { useMigraineStore } from '../store/migraine.store';

const auraTypes: {
  value: AuraType;
  label: string;
}[] = [
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

const visualSymptoms: {
  value: VisualAura;
  label: string;
}[] = [
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

const sensorySymptoms: {
  value: SensoryAura;
  label: string;
}[] = [
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

const languageSymptoms: {
  value: LanguageAura;
  label: string;
}[] = [
  {
    value: 'wordFindingDifficulty',
    label: 'Dificultad para encontrar palabras',
  },
  {
    value: 'speechDifficulty',
    label: 'Dificultad al hablar',
  },
];

const auraTimingOptions: {
  value: AuraTiming;
  label: string;
}[] = [
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

  const toggleType = (type: AuraType) => {
    const updatedTypes = aura.types.includes(type)
      ? aura.types.filter(item => item !== type)
      : [...aura.types, type];

    updateAura({
      ...aura,
      present: updatedTypes.length > 0,
      types: updatedTypes,
    });
  };

  const handleDurationChange = (
    value: string,
  ) => {
    const parsedValue = Number(value);

    const durationMinutes =
      value === '' ||
      Number.isNaN(parsedValue) ||
      parsedValue < 0
        ? undefined
        : parsedValue;

    updateAura({
      ...aura,
      durationMinutes,
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
    <section className={styles.symptomSelector}>
      <h3>Aura</h3>

      <p>
        ¿Experimentaste síntomas de aura?
      </p>

      <div className={styles.symptomGrid}>
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
          items={visualSymptoms}
          selected={aura.visualSymptoms}
          onChange={values =>
            updateAura({
              ...aura,
              visualSymptoms: values,
            })
          }
        />
      )}

      {aura.types.includes('sensory') && (
        <AuraCheckboxGroup
          title="Síntomas sensitivos"
          items={sensorySymptoms}
          selected={aura.sensorySymptoms}
          onChange={values =>
            updateAura({
              ...aura,
              sensorySymptoms: values,
            })
          }
        />
      )}

      {aura.types.includes('language') && (
        <AuraCheckboxGroup
          title="Síntomas de lenguaje"
          items={languageSymptoms}
          selected={aura.languageSymptoms}
          onChange={values =>
            updateAura({
              ...aura,
              languageSymptoms: values,
            })
          }
        />
      )}

      {aura.types.length > 0 && (
        <div>
          <label>
            Duración del aura en minutos

            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={
                aura.durationMinutes ?? ''
              }
              placeholder="Ejemplo: 30"
              onChange={event =>
                handleDurationChange(
                  event.target.value,
                )
              }
            />
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
                Seleccionar
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

          <p>
            SYNARA calculará automáticamente
            el inicio y el final del aura
            tomando como referencia la crisis.
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

  items: {
    value: T;
    label: string;
  }[];

  selected: T[];

  onChange: (values: T[]) => void;
}

function AuraCheckboxGroup<
  T extends string,
>({
  title,
  items,
  selected,
  onChange,
}: AuraCheckboxGroupProps<T>) {
  const toggleValue = (value: T) => {
    const updatedValues =
      selected.includes(value)
        ? selected.filter(
            item => item !== value,
          )
        : [...selected, value];

    onChange(updatedValues);
  };

  return (
    <div>
      <h4>{title}</h4>

      <div className={styles.symptomGrid}>
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