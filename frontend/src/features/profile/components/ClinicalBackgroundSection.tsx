import {
  useProfileStore,
} from '../store/profile.store';

import {
  ProfileStringListField,
} from './ProfileStringListField';

import styles from '../../migraine/migraine.module.css';

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
      className={
        styles.symptomSelector
      }
      aria-labelledby="clinical-background-title"
    >
      <div>
        <h2 id="clinical-background-title">
          Antecedentes clínicos
        </h2>

        <p>
          Incluí solamente información
          que consideres relevante para
          comprender tus migrañas y tu
          atención médica.
        </p>
      </div>

      <ProfileStringListField
        label="Otros diagnósticos de dolor de cabeza"
        value={
          clinicalBackground
            .otherHeadacheDiagnoses
        }
        placeholder={
          'Escribí uno por línea.\nEjemplo: cefalea tensional'
        }
        onChange={
          otherHeadacheDiagnoses =>
            updateClinicalBackground({
              otherHeadacheDiagnoses,
            })
        }
      />

      <ProfileStringListField
        label="Otras condiciones médicas relevantes"
        value={
          clinicalBackground
            .relevantConditions
        }
        placeholder={
          'Escribí una por línea.\nEjemplo: hipertensión, asma, ansiedad'
        }
        onChange={
          relevantConditions =>
            updateClinicalBackground({
              relevantConditions,
            })
        }
      />

      <ProfileStringListField
        label="Medicación habitual"
        value={
          clinicalBackground
            .currentMedications
        }
        placeholder={
          'Incluí medicación que usás regularmente, aunque no sea para la migraña.'
        }
        onChange={
          currentMedications =>
            updateClinicalBackground({
              currentMedications,
            })
        }
      />

      <ProfileStringListField
        label="Alergias o reacciones a medicamentos"
        value={
          clinicalBackground
            .medicationAllergies
        }
        placeholder={
          'Escribí una por línea. Si recordás la reacción, podés incluirla.'
        }
        onChange={
          medicationAllergies =>
            updateClinicalBackground({
              medicationAllergies,
            })
        }
      />

      <label>
        Otros antecedentes relevantes

        <textarea
          value={
            clinicalBackground
              .otherRelevantHistory ??
            ''
          }
          rows={4}
          placeholder="Podés agregar cirugías, internaciones, lesiones u otra información que consideres importante."
          onChange={event =>
            updateClinicalBackground({
              otherRelevantHistory:
                event.target.value,
            })
          }
        />
      </label>

      <div>
        <p>
          Estos datos se guardan en tu
          perfil para acompañar tus
          registros. SYNARA no los usa
          para realizar un diagnóstico.
        </p>
      </div>
    </section>
  );
}