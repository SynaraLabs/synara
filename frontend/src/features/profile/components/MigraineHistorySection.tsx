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

import styles from './MigraineHistorySection.module.css';

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
    value === 'headacheSpecialist' ||
    value === 'generalPractitioner' ||
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
      className={styles.section}
      aria-labelledby="migraine-history-title"
    >
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>
          Tu recorrido
        </p>

        <h2 id="migraine-history-title">
          Historia de migraña
        </h2>

        <p>
          Contanos lo que sepas hasta
          ahora. Podés dejar cualquier
          dato sin responder y volver
          cuando quieras.
        </p>
      </header>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Inicio y diagnóstico</p>
            <h3>
              Cómo comenzó tu historia
            </h3>
          </div>

          <span>01</span>
        </header>

        <div className={styles.fields}>
          <label>
            <span>
              ¿A qué edad comenzaron tus
              migrañas o dolores de cabeza
              similares?
            </span>

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
            <span>
              Situación del diagnóstico
            </span>

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
                Tengo diagnóstico profesional
              </option>
              <option value="suspected">
                Está en estudio o existe sospecha
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
            <div className={styles.conditionalFields}>
              <label>
                <span>
                  Año aproximado del diagnóstico
                </span>

                <input
                  type="number"
                  min="1900"
                  max={CURRENT_YEAR}
                  step="1"
                  inputMode="numeric"
                  value={
                    migraineHistory
                      .diagnosisYear ?? ''
                  }
                  placeholder={`Ejemplo: ${CURRENT_YEAR - 5}`}
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
                <span>
                  Profesional que realizó el diagnóstico
                </span>

                <select
                  value={
                    migraineHistory
                      .diagnosedBy ?? ''
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
                  <option value="">Seleccionar</option>
                  <option value="neurologist">Neurólogo/a</option>
                  <option value="headacheSpecialist">Especialista en cefaleas</option>
                  <option value="generalPractitioner">Médico/a general o clínico/a</option>
                  <option value="other">Otro profesional</option>
                  <option value="unknown">No lo recuerdo</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Características habituales</p>
            <h3>Cómo suelen presentarse</h3>
          </div>

          <span>02</span>
        </header>

        <div className={styles.fields}>
          <label>
            <span>¿Con qué frecuencia tenés aura?</span>

            <select
              value={migraineHistory.auraPattern ?? ''}
              onChange={event => {
                const value = event.target.value;

                updateMigraineHistory({
                  auraPattern:
                    isAuraPattern(value)
                      ? value
                      : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="never">Nunca</option>
              <option value="sometimes">En algunas crisis</option>
              <option value="usually">En la mayoría de las crisis</option>
              <option value="always">En todas o casi todas</option>
              <option value="unknown">No sé identificarla</option>
            </select>
          </label>

          <aside className={styles.note}>
            El aura puede incluir cambios visuales,
            sensaciones, dificultades del lenguaje u
            otros síntomas neurológicos temporales.
            No es lo mismo que las señales premonitorias.
          </aside>

          <label>
            <span>Patrón habitual de la migraña</span>

            <select
              value={migraineHistory.course ?? ''}
              onChange={event => {
                const value = event.target.value;

                updateMigraineHistory({
                  course:
                    isMigraineCourse(value)
                      ? value
                      : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="episodic">Episódica</option>
              <option value="chronic">Crónica</option>
              <option value="variable">Cambia según el período</option>
              <option value="unknown">No lo sé</option>
            </select>
          </label>

          <aside
            className={styles.note}
            aria-label="Diferencia entre migraña episódica y crónica"
          >
            En general, se considera episódica cuando hay
            dolor de cabeza menos de 15 días al mes. La
            migraña crónica implica 15 o más días al mes
            durante más de 3 meses, con características de
            migraña en al menos 8 de esos días. Si nunca te
            lo indicaron, elegí “No lo sé”: esta referencia
            no reemplaza una evaluación profesional.
          </aside>
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Frecuencia y duración</p>
            <h3>Tu patrón aproximado</h3>
          </div>

          <span>03</span>
        </header>

        <div className={styles.fields}>
          <div className={styles.pairedFields}>
            <label>
              <span>Días con cualquier dolor de cabeza por mes</span>
              <input
                type="number"
                min="0"
                max="31"
                step="1"
                inputMode="numeric"
                value={migraineHistory.headacheDaysPerMonth ?? ''}
                placeholder="Entre 0 y 31"
                onChange={event =>
                  updateMigraineHistory({
                    headacheDaysPerMonth:
                      parseOptionalNumber(event.target.value),
                  })
                }
              />
            </label>

            <label>
              <span>De esos días, ¿cuántos suelen tener características de migraña?</span>
              <input
                type="number"
                min="0"
                max="31"
                step="1"
                inputMode="numeric"
                value={migraineHistory.migraineDaysPerMonth ?? ''}
                placeholder="Entre 0 y 31"
                onChange={event =>
                  updateMigraineHistory({
                    migraineDaysPerMonth:
                      parseOptionalNumber(event.target.value),
                  })
                }
              />
            </label>
          </div>

          <aside className={styles.note}>
            Contá días, no cantidad de crisis. Una misma
            crisis puede abarcar más de un día.
          </aside>

          <div className={styles.durationRow}>
            <div className={styles.durationFields}>
              <label>
                <span>Duración mínima habitual de una crisis</span>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    min="0"
                    max="720"
                    step="0.5"
                    inputMode="decimal"
                    value={migraineHistory.usualDurationMinHours ?? ''}
                    placeholder="0"
                    onChange={event =>
                      updateMigraineHistory({
                        usualDurationMinHours:
                          parseOptionalNumber(event.target.value),
                      })
                    }
                  />
                  <span>horas</span>
                </div>
              </label>

              <label>
                <span>Duración máxima habitual de una crisis</span>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    min="0"
                    max="720"
                    step="0.5"
                    inputMode="decimal"
                    value={migraineHistory.usualDurationMaxHours ?? ''}
                    placeholder="0"
                    onChange={event =>
                      updateMigraineHistory({
                        usualDurationMaxHours:
                          parseOptionalNumber(event.target.value),
                      })
                    }
                  />
                  <span>horas</span>
                </div>
              </label>
            </div>

            <aside
              className={styles.note}
              aria-label="Diferencia entre crisis y episodio"
            >
              En SYNARA, la crisis es la fase en la que
              aparecen el dolor y los síntomas más activos.
              El episodio es el recorrido completo y también
              puede incluir señales premonitorias, aura y
              postdromo.
            </aside>
          </div>
        </div>
      </div>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Antecedentes</p>
            <h3>Datos importantes para el contexto</h3>
          </div>

          <span>04</span>
        </header>

        <div className={styles.fields}>
          <label>
            <span>¿Hay antecedentes de migraña en tu familia?</span>
            <select
              value={migraineHistory.familyHistory ?? ''}
              onChange={event => {
                const value = event.target.value;
                updateMigraineHistory({
                  familyHistory:
                    isClinicalAnswer(value) ? value : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unknown">No sé</option>
            </select>
          </label>

          <label>
            <span>¿Alguna crisis duró más de 72 horas?</span>
            <select
              value={migraineHistory.statusMigrainosusHistory ?? ''}
              onChange={event => {
                const value = event.target.value;
                updateMigraineHistory({
                  statusMigrainosusHistory:
                    isClinicalAnswer(value) ? value : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unknown">No sé</option>
            </select>
          </label>

          <label>
            <span>¿Tuviste que consultar en una guardia o recibir atención urgente por una crisis?</span>
            <select
              value={migraineHistory.emergencyCareHistory ?? ''}
              onChange={event => {
                const value = event.target.value;
                updateMigraineHistory({
                  emergencyCareHistory:
                    isClinicalAnswer(value) ? value : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unknown">No sé</option>
            </select>
          </label>

          <label>
            <span>¿Notaste un cambio reciente importante en la frecuencia, duración o características?</span>
            <select
              value={migraineHistory.recentPatternChange ?? ''}
              onChange={event => {
                const value = event.target.value;
                updateMigraineHistory({
                  recentPatternChange:
                    isClinicalAnswer(value) ? value : undefined,
                });
              }}
            >
              <option value="">Seleccionar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unknown">No estoy segura/o</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}