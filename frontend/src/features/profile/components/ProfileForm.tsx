import {
  useState,
} from 'react';

import type {
  UserSex,
} from '../types/profile.types';

import {
  useProfileStore,
} from '../store/profile.store';

import {
  ClinicalBackgroundSection,
} from './ClinicalBackgroundSection';

import {
  MenstrualContextSection,
} from './MenstrualContextSection';

import {
  MigraineCareSection,
} from './MigraineCareSection';

import {
  MigraineHistorySection,
} from './MigraineHistorySection';

import {
  MigraineTerminologyNote,
} from './MigraineTerminologyNote';

import styles from '../../migraine/migraine.module.css';

import navigationStyles from './ProfileSectionNavigation.module.css';

type ProfileSectionId =
  | 'personal'
  | 'migraineHistory'
  | 'care'
  | 'clinicalBackground'
  | 'menstrual';

interface ProfileSectionDefinition {
  id: ProfileSectionId;
  label: string;
  icon: string;
}

const PROFILE_SECTIONS:
  ProfileSectionDefinition[] = [
  {
    id: 'personal',
    label: 'Datos',
    icon: '♙',
  },
  {
    id: 'migraineHistory',
    label: 'Migraña',
    icon: '◉',
  },
  {
    id: 'care',
    label: 'Tratamientos',
    icon: '+',
  },
  {
    id: 'clinicalBackground',
    label: 'Antecedentes',
    icon: '◫',
  },
  {
    id: 'menstrual',
    label: 'Hormonal',
    icon: '◇',
  },
];

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
  const [
    activeSection,
    setActiveSection,
  ] = useState<ProfileSectionId>(
    'personal',
  );

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
      <nav
        className={
          navigationStyles.navigation
        }
        aria-label="Secciones del perfil"
      >
        {PROFILE_SECTIONS.map(
          section => (
            <button
              key={section.id}
              type="button"
              aria-current={
                activeSection ===
                section.id
                  ? 'page'
                  : undefined
              }
              onClick={() =>
                setActiveSection(
                  section.id,
                )
              }
            >
              <span
                aria-hidden="true"
              >
                {section.icon}
              </span>

              <b>
                {section.label}
              </b>
            </button>
          ),
        )}
      </nav>

      <div
        className={
          navigationStyles.content
        }
      >
        {activeSection ===
          'personal' && (
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
                Estos datos ayudan a
                SYNARA a interpretar
                tus episodios en
                contexto.
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
                    !isUserSex(
                      value,
                    )
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
        )}

        {activeSection ===
          'migraineHistory' && (
          <>
            <MigraineTerminologyNote />

            <MigraineHistorySection />
          </>
        )}

        {activeSection ===
          'care' && (
          <MigraineCareSection />
        )}

        {activeSection ===
          'clinicalBackground' && (
          <ClinicalBackgroundSection />
        )}

        {activeSection ===
          'menstrual' && (
          <MenstrualContextSection />
        )}
      </div>
    </>
  );
}