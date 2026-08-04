import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  TRIGGER_EDUCATION_SECTIONS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerQuestionAnswer,
  TriggerQuestionId,
} from '../data/triggerEducationCatalog';

import {
  TRIGGER_QUESTION_MAPPINGS,
} from '../data/triggerQuestionMapping';

import type {
  TriggerMappingKind,
} from '../data/triggerQuestionMapping';

import type {
  TriggerQuestionResponses,
} from '../types/triggerExploration.types';

export type TriggerComparisonDataQuality =
  | 'none'
  | 'insufficient'
  | 'usable';

export type TriggerRecordedOccurrence =
  | 'none'
  | 'isolated'
  | 'repeated';

export type TriggerPerceptionAlignment =
  | 'aligned'
  | 'different'
  | 'inconclusive';

export interface TriggerHistoryComparisonItem {
  questionId:
    TriggerQuestionId;

  question: string;

  categoryTitle: string;

  categoryIcon: string;

  perceivedAnswer:
    TriggerQuestionAnswer;

  mappingKind:
    TriggerMappingKind;

  mappingExplanation?: string;

  totalHistoryEpisodes: number;

  episodesWithTriggerData: number;

  matchingEpisodes: number;

  matchingPercentage: number;

  dataQuality:
    TriggerComparisonDataQuality;

  occurrence:
    TriggerRecordedOccurrence;

  alignment:
    TriggerPerceptionAlignment;
}

export interface TriggerHistoryComparison {
  items:
    TriggerHistoryComparisonItem[];

  totalHistoryEpisodes: number;

  episodesWithTriggerData: number;

  minimumEpisodesRequired:
    number;
}

const MINIMUM_EPISODES_REQUIRED = 5;

const QUESTION_DEFINITIONS =
  new Map(
    TRIGGER_EDUCATION_SECTIONS.flatMap(
      section =>
        section.questions.map(
          question => [
            question.id,
            {
              question:
                question.question,

              categoryTitle:
                section.title,

              categoryIcon:
                section.icon,
            },
          ] as const,
        ),
    ),
  );

const getDataQuality = (
  episodesWithTriggerData: number,
): TriggerComparisonDataQuality => {
  if (
    episodesWithTriggerData === 0
  ) {
    return 'none';
  }

  if (
    episodesWithTriggerData <
    MINIMUM_EPISODES_REQUIRED
  ) {
    return 'insufficient';
  }

  return 'usable';
};

const getOccurrence = (
  matchingEpisodes: number,
): TriggerRecordedOccurrence => {
  if (matchingEpisodes === 0) {
    return 'none';
  }

  if (matchingEpisodes === 1) {
    return 'isolated';
  }

  return 'repeated';
};

const getAlignment = (
  perceivedAnswer:
    TriggerQuestionAnswer,
  dataQuality:
    TriggerComparisonDataQuality,
  occurrence:
    TriggerRecordedOccurrence,
): TriggerPerceptionAlignment => {
  if (
    dataQuality !== 'usable'
  ) {
    return 'inconclusive';
  }

  const perceivedAssociation =
    perceivedAnswer ===
      'often' ||
    perceivedAnswer ===
      'sometimes';

  if (perceivedAssociation) {
    if (
      occurrence === 'repeated'
    ) {
      return 'aligned';
    }

    if (
      occurrence === 'none'
    ) {
      return 'different';
    }

    return 'inconclusive';
  }

  if (
    perceivedAnswer === 'never'
  ) {
    if (
      occurrence === 'repeated'
    ) {
      return 'different';
    }

    if (
      occurrence === 'none'
    ) {
      return 'aligned';
    }
  }

  return 'inconclusive';
};

export const compareTriggerExplorationWithHistory =
  (
    responses:
      TriggerQuestionResponses,
    history:
      MigraineEpisode[],
  ): TriggerHistoryComparison => {
    const episodesWithTriggerData =
      history.filter(
        episode =>
          (
            episode.triggers ??
            []
          ).length > 0,
      );

    const items =
      Object.entries(
        responses,
      ).flatMap(
        ([
          rawQuestionId,
          response,
        ]) => {
          if (!response) {
            return [];
          }

          const questionId =
            rawQuestionId as
              TriggerQuestionId;

          const definition =
            QUESTION_DEFINITIONS.get(
              questionId,
            );

          const mapping =
            TRIGGER_QUESTION_MAPPINGS[
              questionId
            ];

          if (
            !definition ||
            !mapping
          ) {
            return [];
          }

          const matchingEpisodes =
            episodesWithTriggerData.filter(
              episode => {
                const triggers =
                  episode.triggers ??
                  [];

                return mapping.triggers.some(
                  trigger =>
                    triggers.includes(
                      trigger,
                    ),
                );
              },
            ).length;

          const dataQuality =
            getDataQuality(
              episodesWithTriggerData.length,
            );

          const occurrence =
            getOccurrence(
              matchingEpisodes,
            );

          const matchingPercentage =
            episodesWithTriggerData.length >
            0
              ? Math.round(
                  (
                    matchingEpisodes /
                    episodesWithTriggerData.length
                  ) * 100,
                )
              : 0;

          return [
            {
              questionId,

              question:
                definition.question,

              categoryTitle:
                definition.categoryTitle,

              categoryIcon:
                definition.categoryIcon,

              perceivedAnswer:
                response.answer,

              mappingKind:
                mapping.kind,

              mappingExplanation:
                mapping.explanation,

              totalHistoryEpisodes:
                history.length,

              episodesWithTriggerData:
                episodesWithTriggerData.length,

              matchingEpisodes,

              matchingPercentage,

              dataQuality,

              occurrence,

              alignment:
                getAlignment(
                  response.answer,
                  dataQuality,
                  occurrence,
                ),
            },
          ];
        },
      );

    return {
      items,

      totalHistoryEpisodes:
        history.length,

      episodesWithTriggerData:
        episodesWithTriggerData.length,

      minimumEpisodesRequired:
        MINIMUM_EPISODES_REQUIRED,
    };
  };