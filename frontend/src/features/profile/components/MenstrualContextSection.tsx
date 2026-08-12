import type {
  MigraineHormonalRelation,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import styles from './MenstrualContextSection.module.css';

const isHormonalRelation = (
  value: string,
): value is MigraineHormonalRelation => {
  return (
    value === 'menstruation' ||
    value === 'ovulation' ||
    value === 'both' ||
    value === 'none' ||
    value === 'unknown'
  );
};

export function MenstrualContextSection() {
  const menstrual =
    useProfileStore(
      state =>
        state.profile.menstrual,
    );

  const updateMenstrualContext =
    useProfileStore(
      state =>
        state.updateMenstrualContext,
    );

  const hasMenstrualCycle =
    menstrual
      ?.hasMenstrualCycle ??
    false;

  return (
    <section
      className={styles.section}
      aria-labelledby="menstrual-context-title"
    >
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>
          Observación personal
        </p>

        <h2 id="menstrual-context-title">
          Contexto hormonal
        </h2>

        <p>
          Esta información permite observar posibles
          relaciones temporales entre las crisis y el ciclo
          menstrual. Completala solamente si corresponde a tu
          situación actual.
        </p>
      </header>

      <div className={styles.block}>
        <header className={styles.blockHeader}>
          <div>
            <p>Ciclo menstrual</p>
            <h3>Información para comparar con tus episodios</h3>
          </div>
        </header>

        <div className={styles.fields}>
          <label className={styles.cycleQuestion}>
            <span>¿Tenés ciclo menstrual?</span>

            <select
              value={hasMenstrualCycle ? 'yes' : 'no'}
              onChange={event =>
                updateMenstrualContext({
                  hasMenstrualCycle:
                    event.target.value === 'yes',
                })
              }
            >
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
          </label>

          {!hasMenstrualCycle && (
            <p className={styles.inactiveMessage} role="status">
              No necesitás completar esta sección. Podés cambiar
              la respuesta si tu situación se modifica.
            </p>
          )}

          {hasMenstrualCycle && (
            <div className={styles.cycleDetails}>
              <div className={styles.pairedFields}>
                <label>
                  <span>Duración promedio del ciclo</span>

                  <div className={styles.inputWithUnit}>
                    <input
                      type="number"
                      min="15"
                      max="60"
                      step="1"
                      inputMode="numeric"
                      value={menstrual?.averageCycleDays ?? ''}
                      placeholder="Ejemplo: 28"
                      onChange={event => {
                        const value = event.target.value;

                        updateMenstrualContext({
                          averageCycleDays:
                            value === ''
                              ? undefined
                              : Number(value),
                        });
                      }}
                    />

                    <span>días</span>
                  </div>
                </label>

                <label>
                  <span>Fecha de última menstruación</span>

                  <input
                    type="date"
                    value={menstrual?.lastPeriodDate ?? ''}
                    onChange={event =>
                      updateMenstrualContext({
                        lastPeriodDate:
                          event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>

              <div className={styles.relationRow}>
                <label>
                  <span>
                    Relación que observaste con las migrañas
                  </span>

                  <select
                    value={menstrual?.hormonalRelation ?? ''}
                    onChange={event => {
                      const value = event.target.value;

                      updateMenstrualContext({
                        hormonalRelation:
                          isHormonalRelation(value)
                            ? value
                            : undefined,
                      });
                    }}
                  >
                    <option value="">Seleccionar</option>
                    <option value="menstruation">
                      Alrededor de la menstruación
                    </option>
                    <option value="ovulation">
                      Alrededor de la ovulación
                    </option>
                    <option value="both">
                      En ambos momentos
                    </option>
                    <option value="none">
                      No observé relación
                    </option>
                    <option value="unknown">
                      Todavía no lo sé
                    </option>
                  </select>
                </label>

                <aside className={styles.note}>
                  Una coincidencia temporal no confirma por sí
                  sola un desencadenante. SYNARA comparará esta
                  información con los episodios registrados.
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}