import type {
  TreatmentEffectiveness,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

const effectivenessOptions: {
  value: TreatmentEffectiveness;
  label: string;
}[] = [
  {
    value: 'none',
    label: 'No funcionó',
  },
  {
    value: 'low',
    label: 'Funcionó poco',
  },
  {
    value: 'medium',
    label: 'Funcionó moderadamente',
  },
  {
    value: 'high',
    label: 'Funcionó mucho',
  },
];

export function TreatmentSelector() {
  const treatment = useMigraineStore(
    state => state.episode.treatment,
  );

  const updateTreatment =
    useMigraineStore(
      state => state.updateTreatment,
    );

  const hasTreatmentData = Boolean(
    treatment.medication?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment.responseTimeMinutes !==
        undefined,
  );

  const handleMedicationChange = (
    value: string,
  ) => {
    updateTreatment({
      ...treatment,
      medication: value,
    });
  };

  const handleDoseChange = (
    value: string,
  ) => {
    updateTreatment({
      ...treatment,
      dose: value,
    });
  };

  const handleTakenAtChange = (
    value: string,
  ) => {
    updateTreatment({
      ...treatment,
      takenAt: value,
    });
  };

  const handleEffectivenessChange = (
    value: string,
  ) => {
    updateTreatment({
      ...treatment,
      effectiveness:
        value === ''
          ? undefined
          : (value as TreatmentEffectiveness),
    });
  };

  const handleResponseTimeChange = (
    value: string,
  ) => {
    if (value === '') {
      updateTreatment({
        ...treatment,
        responseTimeMinutes: undefined,
      });

      return;
    }

    const parsedValue = Number(value);

    if (
      Number.isNaN(parsedValue) ||
      parsedValue < 0
    ) {
      return;
    }

    updateTreatment({
      ...treatment,
      responseTimeMinutes:
        parsedValue,
    });
  };

  return (
    <section
      className={
        styles.treatmentSelector
      }
      aria-labelledby="treatment-title"
    >
      <div>
        <h3 id="treatment-title">
          Tratamiento utilizado
        </h3>

        <p>
          Registrá qué tomaste durante
          la crisis y cómo respondió tu
          cuerpo.
        </p>
      </div>

      <div
        className={
          styles.treatmentForm
        }
      >
        <label>
          Medicación

          <input
            type="text"
            value={
              treatment.medication ?? ''
            }
            placeholder="Ejemplo: ibuprofeno"
            autoComplete="off"
            onChange={event =>
              handleMedicationChange(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Dosis

          <input
            type="text"
            value={
              treatment.dose ?? ''
            }
            placeholder="Ejemplo: 600 mg"
            autoComplete="off"
            onChange={event =>
              handleDoseChange(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Hora de toma

          <input
            type="time"
            value={
              treatment.takenAt ?? ''
            }
            onChange={event =>
              handleTakenAtChange(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Resultado percibido

          <select
            value={
              treatment.effectiveness ??
              ''
            }
            onChange={event =>
              handleEffectivenessChange(
                event.target.value,
              )
            }
          >
            <option value="">
              Seleccionar resultado
            </option>

            {effectivenessOptions.map(
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

        <label
          className={
            styles.responseTimeField
          }
        >
          Tiempo hasta sentir mejoría

          <div
            className={
              styles.numberInputGroup
            }
          >
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={
                treatment
                  .responseTimeMinutes ??
                ''
              }
              placeholder="Ejemplo: 45"
              onChange={event =>
                handleResponseTimeChange(
                  event.target.value,
                )
              }
            />

            <span>minutos</span>
          </div>
        </label>
      </div>

      {hasTreatmentData && (
        <div
          className={
            styles.treatmentSummary
          }
          role="status"
        >
          <span aria-hidden="true">
            ✓
          </span>

          <div>
            <strong>
              Tratamiento registrado
            </strong>

            <small>
              Podés modificar estos datos
              antes de finalizar el
              episodio.
            </small>
          </div>
        </div>
      )}
    </section>
  );
}