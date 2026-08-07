import type {
  MigraineEpisode,
  TreatmentEffectiveness,
  TreatmentType,
} from '../types/migraine.types';

import {
  TREATMENT_EFFECTIVENESS_OPTIONS,
  TREATMENT_TYPE_OPTIONS,
  treatmentRequiresMedicationDetails,
} from '../data/treatmentCatalog';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

interface Props {
  value?: MigraineEpisode['treatment'];

  onChange?: (
    treatment: MigraineEpisode['treatment'],
  ) => void;

  showHeader?: boolean;
}

const isTreatmentType = (
  value: string,
): value is TreatmentType => {
  return TREATMENT_TYPE_OPTIONS.some(
    option =>
      option.value === value,
  );
};

const isTreatmentEffectiveness = (
  value: string,
): value is TreatmentEffectiveness => {
  return TREATMENT_EFFECTIVENESS_OPTIONS.some(
    option =>
      option.value === value,
  );
};

export function TreatmentSelector({
  value,
  onChange,
  showHeader = true,
}: Props) {
  const storeTreatment =
    useMigraineStore(
      state =>
        state.episode.treatment,
    );

  const updateStoreTreatment =
    useMigraineStore(
      state =>
        state.updateTreatment,
    );

  const treatment =
    value ?? storeTreatment;

  const updateTreatment = (
    updatedTreatment:
      MigraineEpisode['treatment'],
  ) => {
    if (onChange) {
      onChange(updatedTreatment);
      return;
    }

    updateStoreTreatment(
      updatedTreatment,
    );
  };

  const selectedType =
    treatment.type ??
    'medication';

  const showMedicationDetails =
    treatmentRequiresMedicationDetails(
      selectedType,
    );

  const sideEffectsValue =
    (
      treatment.sideEffects ??
      []
    ).join(', ');

  const hasTreatmentData =
    Boolean(
      treatment.type ||
      treatment.medication?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment.responseTimeMinutes !==
        undefined ||
      treatment.sideEffects?.length ||
      treatment.notes?.trim(),
    );

  const handleTypeChange = (
    selectedValue: string,
  ) => {
    if (
      !isTreatmentType(
        selectedValue,
      )
    ) {
      return;
    }

    updateTreatment({
      ...treatment,
      type: selectedValue,
    });
  };

  const handleMedicationChange = (
    medication: string,
  ) => {
    updateTreatment({
      ...treatment,
      medication,
    });
  };

  const handleDoseChange = (
    dose: string,
  ) => {
    updateTreatment({
      ...treatment,
      dose,
    });
  };

  const handleTakenAtChange = (
    takenAt: string,
  ) => {
    updateTreatment({
      ...treatment,
      takenAt,
    });
  };

  const handleEffectivenessChange = (
    effectiveness: string,
  ) => {
    updateTreatment({
      ...treatment,

      effectiveness:
        isTreatmentEffectiveness(
          effectiveness,
        )
          ? effectiveness
          : undefined,
    });
  };

  const handleResponseTimeChange = (
    responseTime: string,
  ) => {
    if (responseTime === '') {
      updateTreatment({
        ...treatment,

        responseTimeMinutes:
          undefined,
      });

      return;
    }

    const parsedValue =
      Number(responseTime);

    if (
      !Number.isFinite(
        parsedValue,
      ) ||
      parsedValue < 0
    ) {
      return;
    }

    updateTreatment({
      ...treatment,

      responseTimeMinutes:
        Math.round(
          parsedValue,
        ),
    });
  };

  const handleSideEffectsChange = (
    sideEffectsText: string,
  ) => {
    const sideEffects =
      sideEffectsText
        .split(',')
        .map(
          sideEffect =>
            sideEffect.trim(),
        )
        .filter(Boolean);

    updateTreatment({
      ...treatment,
      sideEffects,
    });
  };

  const handleNotesChange = (
    notes: string,
  ) => {
    updateTreatment({
      ...treatment,
      notes,
    });
  };

  return (
    <section
      className={
        styles.treatmentSelector
      }
      aria-labelledby={
        showHeader
          ? 'treatment-title'
          : undefined
      }
      aria-label={
        showHeader
          ? undefined
          : 'Datos del tratamiento utilizado'
      }
    >
      {showHeader && (
        <div>
          <h3 id="treatment-title">
            Tratamiento utilizado
          </h3>

          <p>
            Registrá qué utilizaste y
            cómo respondió tu cuerpo.
          </p>
        </div>
      )}

      <div
        className={
          styles.treatmentForm
        }
      >
        <label>
          Tipo de tratamiento

          <select
            value={selectedType}
            onChange={event =>
              handleTypeChange(
                event.target.value,
              )
            }
          >
            {TREATMENT_TYPE_OPTIONS.map(
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

        {showMedicationDetails && (
          <>
            <label>
              {selectedType ===
              'supplement'
                ? 'Suplemento'
                : 'Medicación'}

              <input
                type="text"
                value={
                  treatment.medication ??
                  ''
                }
                placeholder={
                  selectedType ===
                  'supplement'
                    ? 'Ejemplo: magnesio'
                    : 'Ejemplo: ibuprofeno'
                }
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
                  treatment.dose ??
                  ''
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
          </>
        )}

        <label>
          Hora de uso

          <input
            type="time"
            value={
              treatment.takenAt ??
              ''
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

            {TREATMENT_EFFECTIVENESS_OPTIONS.map(
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

            <span>
              minutos
            </span>
          </div>
        </label>

        <label>
          Efectos secundarios

          <input
            type="text"
            value={
              sideEffectsValue
            }
            placeholder="Separalos con comas"
            autoComplete="off"
            onChange={event =>
              handleSideEffectsChange(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Notas opcionales

          <textarea
            value={
              treatment.notes ??
              ''
            }
            placeholder="Ej.: alivió el dolor, pero continuaron las náuseas"
            rows={3}
            onChange={event =>
              handleNotesChange(
                event.target.value,
              )
            }
          />
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
              Podés modificar estos
              datos antes de finalizar
              el episodio.
            </small>
          </div>
        </div>
      )}
    </section>
  );
}