import type {
  ClinicalAnswer,
  DiagnosingProfessional,
  MigraineAuraPattern,
  MigraineCourse,
  MigraineDiagnosisStatus,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import styles from '../../migraine/migraine.module.css';

const CURRENT_YEAR =
  new Date().getFullYear();

const isDiagnosisStatus = (
  value: string,
): value is MigraineDiagnosisStatus => {
  return (
    value === 'diagnosed' ||
    value === 'suspected' ||
    value === 'notDiagnosed' ||
    value === 'unknown'
  );
};

const isDiagnosingProfessional = (
  value: string,
): value is DiagnosingProfessional => {
  return (
    value === 'neurologist' ||
    value ===
      'headacheSpecialist' ||
    value ===
      'generalPractitioner' ||
    value === 'other' ||
    value === 'unknown'
  );
};

const isAuraPattern = (
  value: string,
): value is MigraineAuraPattern => {
  return (
    value === 'never' ||
    value === 'sometimes' ||
    value === 'usually' ||
    value === 'always' ||
    value === 'unknown'
  );
};

const isMigraineCourse = (
  value: string,
): value is MigraineCourse => {
  return (
    value === 'episodic' ||
    value === 'chronic' ||
    value === 'variable' ||
    value === 'unknown'
  );
};

const isClinicalAnswer = (
  value: string,
): value is ClinicalAnswer => {
  return (
    value === 'yes' ||
    value === 'no' ||
    value === 'unknown'
  );
};

const parseOptionalNumber = (
  value: string,
): number | undefined => {
  if (value === '') {
    return undefined;
  }

  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue,
  )
    ? parsedValue
    : undefined;
};

export function MigraineHistorySection() {
  const migraineHistory =
    useProfileStore(
      state =>
        state.profile
          .migraineHistory,
    ) ?? {};

  const updateMigraineHistory =
    useProfileStore(
      state =>
        state.updateMigraineHistory,
    );

  const diagnosisStatus =
    migraineHistory
      .diagnosisStatus ?? '';

  const showDiagnosisDetails =
    diagnosisStatus ===
    'diagnosed';

  return (
    <section
      className={
        styles.symptomSelector
      }
      aria-labelledby="migraine-history-title"
    >
      <div>
        <h2 id="migraine-history-title">
          Historia de migraña
        </h2>

        <p>
          Esta información ayuda a
          interpretar tus registros en
          contexto. Podés dejar sin
          responder cualquier dato que
          no conozcas.
        </p>
      </div>

      <label>
        ¿A qué edad comenzaron tus
        migrañas o dolores de cabeza
        similares?

        <input
          type="number"
          min="0"
          max="100"
          step="1"
          inputMode="numeric"
          value={
            migraineHistory
              .onsetAge ?? ''
          }
          placeholder="Ejemplo: 16"
          onChange={event =>
            updateMigraineHistory({
              onsetAge:
                parseOptionalNumber(
                  event.target.value,
                ),
            })
          }
        />
      </label>

      <label>
        Situación del diagnóstico

        <select
          value={diagnosisStatus}
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              diagnosisStatus:
                isDiagnosisStatus(
                  value,
                )
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="diagnosed">
            Tengo diagnóstico
            profesional
          </option>

          <option value="suspected">
            Está en estudio o existe
            sospecha
          </option>

          <option value="notDiagnosed">
            No tengo diagnóstico
          </option>

          <option value="unknown">
            No estoy segura/o
          </option>
        </select>
      </label>

      {showDiagnosisDetails && (
        <>
          <label>
            Año aproximado del
            diagnóstico

            <input
              type="number"
              min="1900"
              max={CURRENT_YEAR}
              step="1"
              inputMode="numeric"
              value={
                migraineHistory
                  .diagnosisYear ??
                ''
              }
              placeholder={`Ejemplo: ${
                CURRENT_YEAR - 5
              }`}
              onChange={event =>
                updateMigraineHistory({
                  diagnosisYear:
                    parseOptionalNumber(
                      event.target.value,
                    ),
                })
              }
            />
          </label>

          <label>
            Profesional que realizó el
            diagnóstico

            <select
              value={
                migraineHistory
                  .diagnosedBy ??
                ''
              }
              onChange={event => {
                const value =
                  event.target.value;

                updateMigraineHistory({
                  diagnosedBy:
                    isDiagnosingProfessional(
                      value,
                    )
                      ? value
                      : undefined,
                });
              }}
            >
              <option value="">
                Seleccionar
              </option>

              <option value="neurologist">
                Neurólogo/a
              </option>

              <option value="headacheSpecialist">
                Especialista en
                cefaleas
              </option>

              <option value="generalPractitioner">
                Médico/a general o
                clínico/a
              </option>

              <option value="other">
                Otro profesional
              </option>

              <option value="unknown">
                No lo recuerdo
              </option>
            </select>
          </label>
        </>
      )}

      <label>
        ¿Con qué frecuencia tenés aura?

        <select
          value={
            migraineHistory
              .auraPattern ?? ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              auraPattern:
                isAuraPattern(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="never">
            Nunca
          </option>

          <option value="sometimes">
            En algunas crisis
          </option>

          <option value="usually">
            En la mayoría de las crisis
          </option>

          <option value="always">
            En todas o casi todas
          </option>

          <option value="unknown">
            No sé identificarla
          </option>
        </select>
      </label>

      <div>
        <p>
          El aura puede incluir cambios
          visuales, sensaciones,
          dificultades del lenguaje u
          otros síntomas neurológicos
          temporales. No es lo mismo que
          las señales premonitorias.
        </p>
      </div>

      <label>
        Patrón habitual de la migraña

        <select
          value={
            migraineHistory.course ??
            ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              course:
                isMigraineCourse(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="episodic">
            Episódica
          </option>

          <option value="chronic">
            Crónica
          </option>

          <option value="variable">
            Cambia según el período
          </option>

          <option value="unknown">
            No lo sé
          </option>
        </select>
      </label>

      <div>
        <p>
          Si nunca te indicaron si es
          episódica o crónica, podés
          elegir “No lo sé”. SYNARA no
          usará esta respuesta para
          diagnosticarte.
        </p>
      </div>

      <label>
        Días con cualquier dolor de
        cabeza por mes

        <input
          type="number"
          min="0"
          max="31"
          step="1"
          inputMode="numeric"
          value={
            migraineHistory
              .headacheDaysPerMonth ??
            ''
          }
          placeholder="Entre 0 y 31"
          onChange={event =>
            updateMigraineHistory({
              headacheDaysPerMonth:
                parseOptionalNumber(
                  event.target.value,
                ),
            })
          }
        />
      </label>

      <label>
        De esos días, ¿cuántos suelen
        tener características de
        migraña?

        <input
          type="number"
          min="0"
          max="31"
          step="1"
          inputMode="numeric"
          value={
            migraineHistory
              .migraineDaysPerMonth ??
            ''
          }
          placeholder="Entre 0 y 31"
          onChange={event =>
            updateMigraineHistory({
              migraineDaysPerMonth:
                parseOptionalNumber(
                  event.target.value,
                ),
            })
          }
        />
      </label>

      <div>
        <p>
          Contá días, no cantidad de
          crisis. Una misma crisis puede
          abarcar más de un día.
        </p>
      </div>

      <label>
        Duración mínima habitual de una
        crisis

        <input
          type="number"
          min="0"
          max="720"
          step="0.5"
          inputMode="decimal"
          value={
            migraineHistory
              .usualDurationMinHours ??
            ''
          }
          placeholder="Horas"
          onChange={event =>
            updateMigraineHistory({
              usualDurationMinHours:
                parseOptionalNumber(
                  event.target.value,
                ),
            })
          }
        />
      </label>

      <label>
        Duración máxima habitual de una
        crisis

        <input
          type="number"
          min="0"
          max="720"
          step="0.5"
          inputMode="decimal"
          value={
            migraineHistory
              .usualDurationMaxHours ??
            ''
          }
          placeholder="Horas"
          onChange={event =>
            updateMigraineHistory({
              usualDurationMaxHours:
                parseOptionalNumber(
                  event.target.value,
                ),
            })
          }
        />
      </label>

      <label>
        ¿Hay antecedentes de migraña en
        tu familia?

        <select
          value={
            migraineHistory
              .familyHistory ?? ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              familyHistory:
                isClinicalAnswer(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="yes">
            Sí
          </option>

          <option value="no">
            No
          </option>

          <option value="unknown">
            No sé
          </option>
        </select>
      </label>

      <label>
        ¿Alguna crisis duró más de 72
        horas?

        <select
          value={
            migraineHistory
              .statusMigrainosusHistory ??
            ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              statusMigrainosusHistory:
                isClinicalAnswer(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="yes">
            Sí
          </option>

          <option value="no">
            No
          </option>

          <option value="unknown">
            No sé
          </option>
        </select>
      </label>

      <label>
        ¿Tuviste que consultar en una
        guardia o recibir atención
        urgente por una crisis?

        <select
          value={
            migraineHistory
              .emergencyCareHistory ??
            ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              emergencyCareHistory:
                isClinicalAnswer(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="yes">
            Sí
          </option>

          <option value="no">
            No
          </option>

          <option value="unknown">
            No sé
          </option>
        </select>
      </label>

      <label>
        ¿Notaste un cambio reciente
        importante en la frecuencia,
        duración o características?

        <select
          value={
            migraineHistory
              .recentPatternChange ??
            ''
          }
          onChange={event => {
            const value =
              event.target.value;

            updateMigraineHistory({
              recentPatternChange:
                isClinicalAnswer(value)
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">
            Seleccionar
          </option>

          <option value="yes">
            Sí
          </option>

          <option value="no">
            No
          </option>

          <option value="unknown">
            No estoy segura/o
          </option>
        </select>
      </label>
    </section>
  );
}