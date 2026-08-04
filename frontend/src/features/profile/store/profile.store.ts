import {
  create,
} from 'zustand';

import {
  persist,
} from 'zustand/middleware';

import type {
  ClinicalBackground,
  EmotionalContext,
  LifestyleProfile,
  MenstrualContext,
  MigraineCare,
  MigraineHistory,
  UserProfile,
  UserSex,
} from '../types/profile.types';

interface ProfileStore {
  profile: UserProfile;

  updateProfile: (
    profile: UserProfile,
  ) => void;

  updateField: <
    Field extends keyof UserProfile,
  >(
    field: Field,
    value: UserProfile[Field],
  ) => void;

  updateMigraineHistory: (
    migraineHistory:
      Partial<MigraineHistory>,
  ) => void;

  updateMigraineCare: (
    migraineCare:
      Partial<MigraineCare>,
  ) => void;

  updateClinicalBackground: (
    clinicalBackground:
      Partial<ClinicalBackground>,
  ) => void;

  updateMenstrualContext: (
    menstrual:
      Partial<MenstrualContext>,
  ) => void;

  updateLifestyle: (
    lifestyle:
      Partial<LifestyleProfile>,
  ) => void;

  updateEmotionalContext: (
    emotionalContext:
      Partial<EmotionalContext>,
  ) => void;

  resetProfile: () => void;
}

const STORAGE_NAME =
  'synara-profile-storage';

const STORAGE_VERSION = 2;

const generateId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const createInitialProfile =
  (): UserProfile => {
    const now =
      new Date().toISOString();

    return {
      id: generateId(),

      createdAt: now,

      updatedAt: now,

      name: '',

      birthDate: '',

      sex: 'preferNotToSay',
    };
  };

const isRecord = (
  value: unknown,
): value is Record<
  string,
  unknown
> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isUserSex = (
  value: unknown,
): value is UserSex => {
  return (
    value === 'female' ||
    value === 'male' ||
    value === 'other' ||
    value === 'preferNotToSay'
  );
};

const normalizeMigraineHistory = (
  value: unknown,
): MigraineHistory | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const persistedHistory =
    value as Partial<MigraineHistory>;

  const diagnosisStatus =
    persistedHistory
      .diagnosisStatus ??
    (
      typeof persistedHistory
        .diagnosed === 'boolean'
        ? persistedHistory.diagnosed
          ? 'diagnosed'
          : 'notDiagnosed'
        : undefined
    );

  const auraPattern =
    persistedHistory.auraPattern ??
    (
      persistedHistory.type ===
      'withAura'
        ? 'sometimes'
        : persistedHistory.type ===
            'withoutAura'
          ? 'never'
          : persistedHistory.type ===
              'unknown'
            ? 'unknown'
            : undefined
    );

  const migraineDaysPerMonth =
    persistedHistory
      .migraineDaysPerMonth ??
    persistedHistory
      .monthlyFrequency;

  const usualDurationMinHours =
    persistedHistory
      .usualDurationMinHours ??
    persistedHistory
      .usualDurationHours;

  const usualDurationMaxHours =
    persistedHistory
      .usualDurationMaxHours ??
    persistedHistory
      .usualDurationHours;

  return {
    ...persistedHistory,

    diagnosisStatus,

    auraPattern,

    migraineDaysPerMonth,

    usualDurationMinHours,

    usualDurationMaxHours,
  };
};

const normalizeProfile = (
  value: unknown,
): UserProfile => {
  const initialProfile =
    createInitialProfile();

  if (!isRecord(value)) {
    return initialProfile;
  }

  const persistedProfile =
    value as Partial<UserProfile>;

  const id =
    typeof persistedProfile.id ===
      'string' &&
    persistedProfile.id.trim()
      ? persistedProfile.id
      : initialProfile.id;

  const createdAt =
    typeof persistedProfile
      .createdAt === 'string' &&
    persistedProfile.createdAt
      ? persistedProfile.createdAt
      : initialProfile.createdAt;

  const updatedAt =
    typeof persistedProfile
      .updatedAt === 'string' &&
    persistedProfile.updatedAt
      ? persistedProfile.updatedAt
      : createdAt;

  return {
    ...initialProfile,
    ...persistedProfile,

    id,
    createdAt,
    updatedAt,

    name:
      typeof persistedProfile.name ===
      'string'
        ? persistedProfile.name
        : '',

    birthDate:
      typeof persistedProfile
        .birthDate === 'string'
        ? persistedProfile.birthDate
        : '',

    sex: isUserSex(
      persistedProfile.sex,
    )
      ? persistedProfile.sex
      : 'preferNotToSay',

    migraineHistory:
      normalizeMigraineHistory(
        persistedProfile
          .migraineHistory,
      ),
  };
};

const getUpdatedAt = (): string => {
  return new Date().toISOString();
};

export const useProfileStore =
  create<ProfileStore>()(
    persist(
      set => ({
        profile:
          createInitialProfile(),

        updateProfile:
          profile =>
            set({
              profile: {
                ...profile,

                updatedAt:
                  getUpdatedAt(),
              },
            }),

        updateField:
          (
            field,
            value,
          ) =>
            set(state => ({
              profile: {
                ...state.profile,

                [field]: value,

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateMigraineHistory:
          migraineHistory =>
            set(state => ({
              profile: {
                ...state.profile,

                migraineHistory: {
                  ...state.profile
                    .migraineHistory,

                  ...migraineHistory,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateMigraineCare:
          migraineCare =>
            set(state => ({
              profile: {
                ...state.profile,

                migraineCare: {
                  ...state.profile
                    .migraineCare,

                  ...migraineCare,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateClinicalBackground:
          clinicalBackground =>
            set(state => ({
              profile: {
                ...state.profile,

                clinicalBackground: {
                  ...state.profile
                    .clinicalBackground,

                  ...clinicalBackground,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateMenstrualContext:
          menstrual =>
            set(state => ({
              profile: {
                ...state.profile,

                menstrual: {
                  hasMenstrualCycle:
                    state.profile
                      .menstrual
                      ?.hasMenstrualCycle ??
                    false,

                  ...state.profile
                    .menstrual,

                  ...menstrual,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateLifestyle:
          lifestyle =>
            set(state => ({
              profile: {
                ...state.profile,

                lifestyle: {
                  ...state.profile
                    .lifestyle,

                  ...lifestyle,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        updateEmotionalContext:
          emotionalContext =>
            set(state => ({
              profile: {
                ...state.profile,

                emotionalContext: {
                  ...state.profile
                    .emotionalContext,

                  ...emotionalContext,
                },

                updatedAt:
                  getUpdatedAt(),
              },
            })),

        resetProfile: () =>
          set({
            profile:
              createInitialProfile(),
          }),
      }),

      {
        name: STORAGE_NAME,

        version:
          STORAGE_VERSION,

        migrate:
          persistedState =>
            persistedState,

        merge: (
          persistedState,
          currentState,
        ) => {
          if (
            !isRecord(
              persistedState,
            )
          ) {
            return currentState;
          }

          return {
            ...currentState,

            profile:
              normalizeProfile(
                persistedState.profile,
              ),
          };
        },
      },
    ),
  );