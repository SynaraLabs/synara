import {
  create,
} from 'zustand';

import {
  persist,
} from 'zustand/middleware';

import {
  TRIGGER_EDUCATION_SECTIONS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerEducationCategory,
  TriggerQuestionAnswer,
  TriggerQuestionId,
} from '../data/triggerEducationCatalog';

import type {
  TriggerExploration,
  TriggerQuestionResponses,
} from '../types/triggerExploration.types';

interface TriggerExplorationStore {
  exploration:
    TriggerExploration;

  setActiveCategory: (
    category:
      TriggerEducationCategory,
  ) => void;

  updateResponse: (
    questionId:
      TriggerQuestionId,
    answer:
      TriggerQuestionAnswer,
  ) => void;

  updateResponseNotes: (
    questionId:
      TriggerQuestionId,
    notes: string,
  ) => void;

  completeExploration:
    () => void;

  resetExploration:
    () => void;
}

const STORAGE_NAME =
  'synara-trigger-exploration-storage';

const STORAGE_VERSION = 1;

const QUESTION_IDS =
  new Set<TriggerQuestionId>(
    TRIGGER_EDUCATION_SECTIONS.flatMap(
      section =>
        section.questions.map(
          question =>
            question.id,
        ),
    ),
  );

const CATEGORY_IDS =
  new Set<TriggerEducationCategory>(
    TRIGGER_EDUCATION_SECTIONS.map(
      section => section.id,
    ),
  );

const createInitialExploration =
  (): TriggerExploration => {
    const now =
      new Date().toISOString();

    return {
      responses: {},

      activeCategory:
        TRIGGER_EDUCATION_SECTIONS[0]
          ?.id,

      startedAt: now,

      updatedAt: now,
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

const isQuestionId = (
  value: string,
): value is TriggerQuestionId => {
  return QUESTION_IDS.has(
    value as TriggerQuestionId,
  );
};

const isCategory = (
  value: unknown,
): value is TriggerEducationCategory => {
  return (
    typeof value === 'string' &&
    CATEGORY_IDS.has(
      value as TriggerEducationCategory,
    )
  );
};

const isAnswer = (
  value: unknown,
): value is TriggerQuestionAnswer => {
  return (
    value === 'often' ||
    value === 'sometimes' ||
    value === 'never' ||
    value === 'unknown'
  );
};

const normalizeResponses = (
  value: unknown,
): TriggerQuestionResponses => {
  if (!isRecord(value)) {
    return {};
  }

  const responses:
    TriggerQuestionResponses = {};

  Object.entries(value).forEach(
    ([
      questionId,
      response,
    ]) => {
      if (
        !isQuestionId(
          questionId,
        ) ||
        !isRecord(response) ||
        !isAnswer(
          response.answer,
        )
      ) {
        return;
      }

      responses[questionId] = {
        answer:
          response.answer,

        notes:
          typeof response.notes ===
            'string'
            ? response.notes
            : undefined,

        updatedAt:
          typeof response.updatedAt ===
            'string'
            ? response.updatedAt
            : new Date().toISOString(),
      };
    },
  );

  return responses;
};

const normalizeExploration = (
  value: unknown,
): TriggerExploration => {
  const initialExploration =
    createInitialExploration();

  if (!isRecord(value)) {
    return initialExploration;
  }

  return {
    responses:
      normalizeResponses(
        value.responses,
      ),

    activeCategory:
      isCategory(
        value.activeCategory,
      )
        ? value.activeCategory
        : initialExploration
            .activeCategory,

    startedAt:
      typeof value.startedAt ===
        'string'
        ? value.startedAt
        : initialExploration
            .startedAt,

    updatedAt:
      typeof value.updatedAt ===
        'string'
        ? value.updatedAt
        : initialExploration
            .updatedAt,

    completedAt:
      typeof value.completedAt ===
        'string'
        ? value.completedAt
        : undefined,
  };
};

export const useTriggerExplorationStore =
  create<TriggerExplorationStore>()(
    persist(
      set => ({
        exploration:
          createInitialExploration(),

        setActiveCategory:
          activeCategory =>
            set(state => ({
              exploration: {
                ...state.exploration,

                activeCategory,

                updatedAt:
                  new Date()
                    .toISOString(),
              },
            })),

        updateResponse:
          (
            questionId,
            answer,
          ) =>
            set(state => {
              const now =
                new Date()
                  .toISOString();

              const previousResponse =
                state.exploration
                  .responses[
                    questionId
                  ];

              return {
                exploration: {
                  ...state.exploration,

                  responses: {
                    ...state
                      .exploration
                      .responses,

                    [questionId]: {
                      answer,

                      notes:
                        previousResponse
                          ?.notes,

                      updatedAt: now,
                    },
                  },

                  updatedAt: now,

                  completedAt:
                    undefined,
                },
              };
            }),

        updateResponseNotes:
          (
            questionId,
            notes,
          ) =>
            set(state => {
              const currentResponse =
                state.exploration
                  .responses[
                    questionId
                  ];

              if (!currentResponse) {
                return state;
              }

              const now =
                new Date()
                  .toISOString();

              return {
                exploration: {
                  ...state.exploration,

                  responses: {
                    ...state
                      .exploration
                      .responses,

                    [questionId]: {
                      ...currentResponse,

                      notes:
                        notes.trim()
                          ? notes
                          : undefined,

                      updatedAt: now,
                    },
                  },

                  updatedAt: now,

                  completedAt:
                    undefined,
                },
              };
            }),

        completeExploration: () =>
          set(state => {
            const now =
              new Date()
                .toISOString();

            return {
              exploration: {
                ...state.exploration,

                updatedAt: now,

                completedAt: now,
              },
            };
          }),

        resetExploration: () =>
          set({
            exploration:
              createInitialExploration(),
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

            exploration:
              normalizeExploration(
                persistedState
                  .exploration,
              ),
          };
        },
      },
    ),
  );