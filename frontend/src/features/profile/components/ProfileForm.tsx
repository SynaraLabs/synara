import {
  useRef,
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

import styles from './ProfileForm.module.css';

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
}

const PROFILE_SECTIONS:
  ProfileSectionDefinition[] = [
  {
    id: 'personal',
    label: 'Datos personales',
  },
  {
    id: 'migraineHistory',
    label: 'Historia de migraña',
  },
  {
    id: 'care',
    label: 'Tratamientos',
  },
  {
    id: 'clinicalBackground',
    label: 'Antecedentes',
  },
  {
    id: 'menstrual',
    label: 'Contexto hormonal',
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

  const [
    isProfileSaved,
    setIsProfileSaved,
  ] = useState(false);

  const contentRef =
    useRef<HTMLDivElement | null>(
      null,
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

  const activeSectionIndex =
    PROFILE_SECTIONS.findIndex(
      section =>
        section.id ===
        activeSection,
    );

  const isLastSection =
    activeSectionIndex ===
    PROFILE_SECTIONS.length - 1;

  const moveToSection = (
    sectionId: ProfileSectionId,
  ) => {
    setIsProfileSaved(false);
    setActiveSection(
      sectionId,
    );

    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleSaveAndContinue = () => {
    if (isLastSection) {
      setIsProfileSaved(true);

      requestAnimationFrame(() => {
        contentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });

      return;
    }

    const nextSection =
      PROFILE_SECTIONS[
        activeSectionIndex + 1
      ];

    if (!nextSection) {
      return;
    }

    moveToSection(
      nextSection.id,
    );
  };

  return (
    <section
      className={styles.profile}
    >
      <header
        className={styles.pageHeader}
      >
        <p
          className={styles.eyebrow}
        >
          Tu información de salud
        </p>

        <h1>
          Perfil clínico personal
        </h1>

        <p
          className={styles.description}
        >
          Reuní la información que ayuda
          a interpretar tus episodios en
          contexto y a preparar informes
          más completos.
        </p>

        <p
          className={styles.saveNotice}
          role="status"
        >
          Los cambios se guardan
          automáticamente en este
          dispositivo.
        </p>
      </header>

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
                moveToSection(
                  section.id,
                )
              }
            >
              {section.label}
            </button>
          ),
        )}
      </nav>

      <div
        ref={contentRef}
        className={
          navigationStyles.content
        }
      >
        {activeSection ===
          'personal' && (
          <section
            className={styles.personalSection}
            aria-labelledby="personal-profile-title"
          >
            <header
              className={styles.sectionHeader}
            >
              <div>
                <p>
                  Identificación
                </p>

                <h2 id="personal-profile-title">
                  Datos personales
                </h2>
              </div>

              <span>
                Información opcional
              </span>
            </header>

            <p
              className={styles.sectionDescription}
            >
              Estos datos aportan contexto
              a tus registros y a los
              informes que decidas
              descargar.
            </p>

            <div
              className={styles.fieldGrid}
            >
              <label>
                <span>
                  Nombre
                </span>

                <input
                  type="text"
                  value={profile.name}
                  autoComplete="name"
                  placeholder="Tu nombre"
                  onChange={event =>
                    updateField(
                      'name',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Fecha de nacimiento
                </span>

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
                <span>
                  Sexo
                </span>

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
            </div>
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

        <div
          className={styles.sectionActions}
        >
          {isProfileSaved && (
            <p
              className={
                styles.savedMessage
              }
              role="status"
            >
              Perfil actualizado.
            </p>
          )}

          <button
            type="button"
            className={
              styles.continueButton
            }
            onClick={
              handleSaveAndContinue
            }
          >
            {isLastSection
              ? 'Guardar perfil'
              : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </section>
  );
}