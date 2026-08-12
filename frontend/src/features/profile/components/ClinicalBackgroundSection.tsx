import {
  useProfileStore,
} from '../store/profile.store';

import {
  ProfileStringListField,
} from './ProfileStringListField';

import styles from './ClinicalBackgroundSection.module.css';

export function ClinicalBackgroundSection() {
  const clinicalBackground =
    useProfileStore(
      state =>
        state.profile
          .clinicalBackground,
    ) ?? {};

  const updateClinicalBackground =
    useProfileStore(
      state =>
        state.updateClinicalBackground,
    );

  return (
    <section
      className={styles.section}
      aria-labelledby="clinical-background-title"
    >
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>
          Contexto de salud
        </p>

        <h2 id="clinical-background-title">
          Antecedentes clínicos
        </h2>

        <p>
          Incluí solamente la información que consideres
          relevante para comprender tus migrañas y acompañar
          mejor tu atención médica.
        </p>
      </header>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Diagnósticos</p>
            <h3>Condiciones que forman parte de tu historia</h3>
          </div>

          <span>01</span>
        </header>

        <div className={styles.listGrid}>
          <ProfileStringListField
            label="Otros diagnósticos de dolor de cabeza"
            value={clinicalBackground.otherHeadacheDiagnoses}
            placeholder={
              'Escribí uno por línea.\nEjemplo: cefalea tensional'
            }
            onChange={otherHeadacheDiagnoses =>
              updateClinicalBackground({
                otherHeadacheDiagnoses,
              })
            }
          />

          <ProfileStringListField
            label="Otras condiciones médicas relevantes"
            value={clinicalBackground.relevantConditions}
            placeholder={
              'Escribí una por línea.\nEjemplo: hipertensión, asma, ansiedad'
            }
            onChange={relevantConditions =>
              updateClinicalBackground({
                relevantConditions,
              })
            }
          />
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Medicación y seguridad</p>
            <h3>Información importante para tu atención</h3>
          </div>

          <span>02</span>
        </header>

        <div className={styles.listGrid}>
          <ProfileStringListField
            label="Medicación habitual"
            value={clinicalBackground.currentMedications}
            placeholder={
              'Incluí medicación que usás regularmente, aunque no sea para la migraña.'
            }
            onChange={currentMedications =>
              updateClinicalBackground({
                currentMedications,
              })
            }
          />

          <ProfileStringListField
            label="Alergias o reacciones a medicamentos"
            value={clinicalBackground.medicationAllergies}
            placeholder={
              'Escribí una por línea. Si recordás la reacción, podés incluirla.'
            }
            onChange={medicationAllergies =>
              updateClinicalBackground({
                medicationAllergies,
              })
            }
          />
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Información adicional</p>
            <h3>Otros antecedentes relevantes</h3>
          </div>

          <span>03</span>
        </header>

        <div className={styles.blockContent}>
          <label className={styles.notesField}>
            <span>
              Cirugías, internaciones, lesiones u otros datos
            </span>

            <textarea
              value={clinicalBackground.otherRelevantHistory ?? ''}
              rows={4}
              placeholder="Agregá otra información que consideres importante."
              onChange={event =>
                updateClinicalBackground({
                  otherRelevantHistory: event.target.value,
                })
              }
            />
          </label>

          <aside className={styles.note}>
            Estos datos se guardan en tu perfil para acompañar
            tus registros. SYNARA no los utiliza para realizar
            un diagnóstico.
          </aside>
        </div>
      </div>
    </section>
  );
}