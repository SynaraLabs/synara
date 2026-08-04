import type {
  TriggerEducationCategory,
  TriggerQuestionAnswer,
  TriggerQuestionId,
} from '../data/triggerEducationCatalog';

export interface TriggerQuestionResponse {
  answer:
    TriggerQuestionAnswer;

  notes?: string;

  updatedAt: string;
}

export type TriggerQuestionResponses =
  Partial<
    Record<
      TriggerQuestionId,
      TriggerQuestionResponse
    >
  >;

export interface TriggerExploration {
  responses:
    TriggerQuestionResponses;

  activeCategory?:
    TriggerEducationCategory;

  startedAt: string;

  updatedAt: string;

  completedAt?: string;
}