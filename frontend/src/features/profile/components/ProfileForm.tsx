import type {
  UserSex,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import {
  MenstrualContextSection,
} from './MenstrualContextSection';

import {
  MigraineHistorySection,
} from './MigraineHistorySection';

import {
  MigraineTerminologyNote,
} from './MigraineTerminologyNote';

import styles from '../../migraine/migraine.module.css';

const isUserSex = (
  value: string,
): value is UserSex => {
  return (
    value === 'female' ||
    value === 'male' ||
    value === 'other' ||
    value === 'preferNotToSay'
  );
};

export function ProfileForm() {
  const profile =
    useProfileStore(
      state => state.profile,
    );

  const updateField =
    useProfileStore(
      state =>
        state.updateField,
    );

  return (
    <>
      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="personal-profile-title"
      >
        <div>
          <h2 id="personal-profile-title">
            Perfil personal
          </h2>

          <p>
            Estos datos ayudan a SYNARA
            a interpretar tus episodios
            en contexto.
          </p>
        </div>

        <label>
          Nombre

          <input
            type="text"
            value={profile.name}
            autoComplete="name"
            onChange={event =>
              updateField(
                'name',
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Fecha de nacimiento

          <input
            type="date"
            value={
              profile.birthDate
            }
            onChange={event =>
              updateField(
                'birthDate',
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Sexo

          <select
            value={profile.sex}
            onChange={event => {
              const value =
                event.target.value;

              if (
                !isUserSex(value)
              ) {
                return;
              }

              updateField(
                'sex',
                value,
              );
            }}
          >
            <option value="preferNotToSay">
              Prefiero no decirlo
            </option>

            <option value="female">
              Femenino
            </option>

            <option value="male">
              Masculino
            </option>

            <option value="other">
              Otro
            </option>
          </select>
        </label>
      </section>

      <MigraineTerminologyNote />

      <MigraineHistorySection />

      <MenstrualContextSection />
    </>
  );
}