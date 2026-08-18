import {
  useState,
} from 'react';

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

import styles from './TreatmentSelector.module.css';

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
  const [
    showMoreDetails,
    setShowMoreDetails,
  ] = useState(false);

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

  const hasMoreDetails =
    Boolean(
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
            Tratamiento
          </p>

          <h3 id="treatment-title">
            ¿Qué utilizaste?
          </h3>

          <p>
            Registrá el tratamiento y
            cómo respondió tu cuerpo.
          </p>
        </header>
      )}

      <div
        className={
          styles.primaryForm
        }
      >
        <label
          className={
            styles.typeField
          }
        >
          <span>
            Tipo de tratamiento
          </span>

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
          <div
            className={
              styles.medicationGrid
            }
          >
            <label>
              <span>
                {selectedType ===
                'supplement'
                  ? 'Suplemento'
                  : 'Medicación'}
              </span>

              <input
                type="text"
                value={
                  treatment.medication ??
                  ''
                }
                placeholder={
                  selectedType ===
                  'supplement'
                    ? 'Ej.: magnesio'
                    : 'Ej.: ibuprofeno'
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
              <span>
                Dosis
              </span>

              <input
                type="text"
                value={
                  treatment.dose ??
                  ''
                }
                placeholder="Ej.: 600 mg"
                autoComplete="off"
                onChange={event =>
                  handleDoseChange(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        )}

        <label>
          <span>
            Hora de uso
          </span>

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
      </div>

      <section
        className={
          styles.effectiveness
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <h4>
            Resultado percibido
          </h4>

          <p>
            ¿Cuánto te ayudó?
          </p>
        </div>

        <div
          className={
            styles.effectivenessGrid
          }
        >
          {TREATMENT_EFFECTIVENESS_OPTIONS.map(
            option => {
              const isActive =
                treatment.effectiveness ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={
                    isActive
                  }
                  onClick={() =>
                    handleEffectivenessChange(
                      isActive
                        ? ''
                        : option.value,
                    )
                  }
                >
                  {option.label}
                </button>
              );
            },
          )}
        </div>
      </section>

      <button
        type="button"
        className={
          styles.moreToggle
        }
        aria-expanded={
          showMoreDetails
        }
        onClick={() =>
          setShowMoreDetails(
            current => !current,
          )
        }
      >
        {showMoreDetails
          ? 'Ocultar detalles'
          : hasMoreDetails
            ? 'Ver detalles registrados'
            : 'Agregar más detalles'}
      </button>

      {showMoreDetails && (
        <section
          className={
            styles.moreDetails
          }
        >
          <label>
            <span>
              Tiempo hasta sentir
              mejoría
            </span>

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
                placeholder="Ej.: 45"
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
            <span>
              Efectos secundarios
            </span>

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

          <label
            className={
              styles.notesField
            }
          >
            <span>
              Notas opcionales
            </span>

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
        </section>
      )}

      {hasTreatmentData && (
        <div
          className={
            styles.summary
          }
          role="status"
        >
          <strong>
            Tratamiento registrado
          </strong>

          <span>
            Podés modificar estos datos
            antes de finalizar el
            episodio.
          </span>
        </div>
      )}
    </section>
  );
}