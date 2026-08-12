import type {
  ClinicalAnswer,
  TreatingProfessional,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import {
  ProfileStringListField,
} from './ProfileStringListField';

import styles from './MigraineCareSection.module.css';

const isClinicalAnswer = (
  value: string,
): value is ClinicalAnswer => {
  return (
    value === 'yes' ||
    value === 'no' ||
    value === 'unknown'
  );
};

const isTreatingProfessional = (
  value: string,
): value is TreatingProfessional => {
  return (
    value === 'neurologist' ||
    value === 'headacheSpecialist' ||
    value === 'generalPractitioner' ||
    value === 'other'
  );
};

export function MigraineCareSection() {
  const migraineCare =
    useProfileStore(
      state =>
        state.profile
          .migraineCare,
    ) ?? {};

  const updateMigraineCare =
    useProfileStore(
      state =>
        state.updateMigraineCare,
    );

  const hasProfessionalFollowUp =
    migraineCare
      .hasProfessionalFollowUp ??
    '';

  const showProfessionalDetails =
    hasProfessionalFollowUp ===
    'yes';

  return (
    <section
      className={styles.section}
      aria-labelledby="migraine-care-title"
    >
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>
          Atención habitual
        </p>

        <h2 id="migraine-care-title">
          Atención y tratamientos
        </h2>

        <p>
          Reuní el acompañamiento profesional y los
          recursos que utilizás para prevenir o atravesar
          las crisis. Esta información no reemplaza una
          indicación médica.
        </p>
      </header>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Seguimiento</p>
            <h3>Acompañamiento profesional</h3>
          </div>

          <span>01</span>
        </header>

        <div className={styles.fields}>
          <label>
            <span>
              ¿Actualmente realizás seguimiento con un
              profesional por tus migrañas?
            </span>

            <select
              value={hasProfessionalFollowUp}
              onChange={event => {
                const value = event.target.value;

                updateMigraineCare({
                  hasProfessionalFollowUp:
                    isClinicalAnswer(value)
                      ? value
                      : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unknown">No estoy segura/o</option>
            </select>
          </label>

          {showProfessionalDetails && (
            <div className={styles.conditionalFields}>
              <label>
                <span>Profesional principal</span>

                <select
                  value={migraineCare.professionalType ?? ''}
                  onChange={event => {
                    const value = event.target.value;

                    updateMigraineCare({
                      professionalType:
                        isTreatingProfessional(value)
                          ? value
                          : undefined,
                    });
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="neurologist">Neurólogo/a</option>
                  <option value="headacheSpecialist">Especialista en cefaleas</option>
                  <option value="generalPractitioner">Médico/a general o clínico/a</option>
                  <option value="other">Otro profesional</option>
                </select>
              </label>

              <label>
                <span>Fecha de la última consulta</span>

                <input
                  type="date"
                  value={migraineCare.lastConsultationDate ?? ''}
                  onChange={event =>
                    updateMigraineCare({
                      lastConsultationDate:
                        event.target.value || undefined,
                    })
                  }
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Prevención</p>
            <h3>Tratamientos preventivos</h3>
          </div>

          <span>02</span>
        </header>

        <div className={styles.blockContent}>
          <p className={styles.explanation}>
            Son los que se utilizan de manera regular para
            reducir la frecuencia o intensidad de las crisis,
            no solamente cuando aparece el dolor.
          </p>

          <ProfileStringListField
            label="Preventivos actuales"
            value={migraineCare.preventiveTreatments}
            placeholder={
              'Escribí uno por línea.\nEjemplo: topiramato 50 mg'
            }
            onChange={preventiveTreatments =>
              updateMigraineCare({
                preventiveTreatments,
              })
            }
          />
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Durante la crisis</p>
            <h3>Recursos que utilizás</h3>
          </div>

          <span>03</span>
        </header>

        <div className={styles.blockContent}>
          <p className={styles.explanation}>
            Incluí los medicamentos y las medidas que usás al
            comenzar o durante una crisis, aunque no los uses
            en todos los episodios.
          </p>

          <div className={styles.listGrid}>
            <ProfileStringListField
              label="Medicación habitual para las crisis"
              value={migraineCare.acuteTreatments}
              placeholder={
                'Escribí una por línea.\nEjemplo: ibuprofeno 600 mg'
              }
              onChange={acuteTreatments =>
                updateMigraineCare({
                  acuteTreatments,
                })
              }
            />

            <ProfileStringListField
              label="Medidas no farmacológicas habituales"
              value={migraineCare.nonPharmacologicalTreatments}
              placeholder={
                'Escribí una por línea.\nEjemplo: oscuridad, frío, reposo'
              }
              onChange={nonPharmacologicalTreatments =>
                updateMigraineCare({
                  nonPharmacologicalTreatments,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Experiencia previa</p>
            <h3>Lo que probaste y observaste</h3>
          </div>

          <span>04</span>
        </header>

        <div className={styles.blockContent}>
          <ProfileStringListField
            label="Tratamientos utilizados anteriormente"
            value={migraineCare.previousTreatments}
            placeholder={
              'Escribí uno por línea, aunque no haya funcionado o lo hayas suspendido.'
            }
            onChange={previousTreatments =>
              updateMigraineCare({
                previousTreatments,
              })
            }
          />

          <label className={styles.notesField}>
            <span>Notas sobre tratamientos</span>

            <textarea
              value={migraineCare.treatmentNotes ?? ''}
              rows={4}
              placeholder="Ej.: qué funcionó, qué no funcionó o qué produjo efectos secundarios"
              onChange={event =>
                updateMigraineCare({
                  treatmentNotes: event.target.value,
                })
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}