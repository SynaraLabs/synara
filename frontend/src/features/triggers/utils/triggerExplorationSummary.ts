import {
  TRIGGER_EDUCATION_SECTIONS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerEducationCategory,
  TriggerQuestionAnswer,
  TriggerQuestionId,
} from '../data/triggerEducationCatalog';

import type {
  TriggerQuestionResponses,
} from '../types/triggerExploration.types';

export interface TriggerSummaryItem {
  questionId:
    TriggerQuestionId;

  categoryId:
    TriggerEducationCategory;

  categoryTitle: string;

  categoryIcon: string;

  question: string;

  answer:
    TriggerQuestionAnswer;

  notes?: string;
}

export interface TriggerCategorySummary {
  categoryId:
    TriggerEducationCategory;

  title: string;

  icon: string;

  frequentCount: number;

  occasionalCount: number;

  observedCount: number;

  answeredCount: number;

  totalCount: number;
}

export interface TriggerExplorationSummary {
  frequent:
    TriggerSummaryItem[];

  occasional:
    TriggerSummaryItem[];

  uncertain:
    TriggerSummaryItem[];

  notObserved:
    TriggerSummaryItem[];

  categories:
    TriggerCategorySummary[];

  answeredCount: number;

  totalCount: number;
}

export const createTriggerExplorationSummary =
  (
    responses:
      TriggerQuestionResponses,
  ): TriggerExplorationSummary => {
    const frequent:
      TriggerSummaryItem[] = [];

    const occasional:
      TriggerSummaryItem[] = [];

    const uncertain:
      TriggerSummaryItem[] = [];

    const notObserved:
      TriggerSummaryItem[] = [];

    const categories =
      TRIGGER_EDUCATION_SECTIONS.map(
        section => {
          let frequentCount = 0;
          let occasionalCount = 0;
          let answeredCount = 0;

          section.questions.forEach(
            question => {
              const response =
                responses[
                  question.id
                ];

              if (!response) {
                return;
              }

              answeredCount += 1;

              const summaryItem:
                TriggerSummaryItem = {
                questionId:
                  question.id,

                categoryId:
                  section.id,

                categoryTitle:
                  section.title,

                categoryIcon:
                  section.icon,

                question:
                  question.question,

                answer:
                  response.answer,

                notes:
                  response.notes
                    ?.trim() ||
                  undefined,
              };

              if (
                response.answer ===
                'often'
              ) {
                frequentCount += 1;

                frequent.push(
                  summaryItem,
                );

                return;
              }

              if (
                response.answer ===
                'sometimes'
              ) {
                occasionalCount += 1;

                occasional.push(
                  summaryItem,
                );

                return;
              }

              if (
                response.answer ===
                'unknown'
              ) {
                uncertain.push(
                  summaryItem,
                );

                return;
              }

              notObserved.push(
                summaryItem,
              );
            },
          );

          return {
            categoryId:
              section.id,

            title:
              section.title,

            icon:
              section.icon,

            frequentCount,

            occasionalCount,

            observedCount:
              frequentCount +
              occasionalCount,

            answeredCount,

            totalCount:
              section.questions
                .length,
          };
        },
      );

    const sortedCategories = [
      ...categories,
    ].sort(
      (
        first,
        second,
      ) => {
        if (
          second.observedCount !==
          first.observedCount
        ) {
          return (
            second.observedCount -
            first.observedCount
          );
        }

        if (
          second.frequentCount !==
          first.frequentCount
        ) {
          return (
            second.frequentCount -
            first.frequentCount
          );
        }

        return first.title.localeCompare(
          second.title,
          'es-AR',
        );
      },
    );

    const totalCount =
      TRIGGER_EDUCATION_SECTIONS.reduce(
        (
          total,
          section,
        ) =>
          total +
          section.questions.length,
        0,
      );

    return {
      frequent,

      occasional,

      uncertain,

      notObserved,

      categories:
        sortedCategories,

      answeredCount:
        frequent.length +
        occasional.length +
        uncertain.length +
        notObserved.length,

      totalCount,
    };
  };