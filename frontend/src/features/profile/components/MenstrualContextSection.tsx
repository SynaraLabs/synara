import type {
  MigraineHormonalRelation,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import styles from '../../migraine/migraine.module.css';

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
      className={
        styles.symptomSelector
      }
      aria-labelledby="menstrual-context-title"
    >
      <div>
        <h2 id="menstrual-context-title">
          Contexto hormonal
        </h2>

        <p>
          Esta información permite
          observar posibles relaciones
          temporales entre las crisis y
          el ciclo menstrual.
        </p>
      </div>

      <label>
        ¿Tenés ciclo menstrual?

        <select
          value={
            hasMenstrualCycle
              ? 'yes'
              : 'no'
          }
          onChange={event =>
            updateMenstrualContext({
              hasMenstrualCycle:
                event.target.value ===
                'yes',
            })
          }
        >
          <option value="yes">
            Sí
          </option>

          <option value="no">
            No
          </option>
        </select>
      </label>

      {hasMenstrualCycle && (
        <>
          <label>
            Duración promedio del ciclo

            <input
              type="number"
              min="15"
              max="60"
              step="1"
              inputMode="numeric"
              value={
                menstrual
                  ?.averageCycleDays ??
                ''
              }
              placeholder="Ejemplo: 28"
              onChange={event => {
                const value =
                  event.target.value;

                updateMenstrualContext({
                  averageCycleDays:
                    value === ''
                      ? undefined
                      : Number(value),
                });
              }}
            />
          </label>

          <label>
            Fecha de última menstruación

            <input
              type="date"
              value={
                menstrual
                  ?.lastPeriodDate ??
                ''
              }
              onChange={event =>
                updateMenstrualContext({
                  lastPeriodDate:
                    event.target.value ||
                    undefined,
                })
              }
            />
          </label>

          <label>
            Relación que observaste con
            las migrañas

            <select
              value={
                menstrual
                  ?.hormonalRelation ??
                ''
              }
              onChange={event => {
                const value =
                  event.target.value;

                updateMenstrualContext({
                  hormonalRelation:
                    isHormonalRelation(
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

              <option value="menstruation">
                Alrededor de la
                menstruación
              </option>

              <option value="ovulation">
                Alrededor de la
                ovulación
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

          <div>
            <p>
              Una coincidencia temporal
              no confirma por sí sola un
              desencadenante. SYNARA
              comparará esta información
              con los episodios
              registrados.
            </p>
          </div>
        </>
      )}
    </section>
  );
}