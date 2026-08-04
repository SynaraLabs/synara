import type {
  MigraineTrigger,
} from '../../migraine/types/migraine.types';

import type {
  TriggerQuestionId,
} from './triggerEducationCatalog';

export type TriggerMappingKind =
  | 'exact'
  | 'related';

export interface TriggerQuestionMapping {
  questionId:
    TriggerQuestionId;

  triggers:
    MigraineTrigger[];

  kind:
    TriggerMappingKind;

  explanation?: string;
}

export const TRIGGER_QUESTION_MAPPINGS:
  Record<
    TriggerQuestionId,
    TriggerQuestionMapping
  > = {
  routineChange: {
    questionId:
      'routineChange',

    triggers: [
      'sleepChange',
      'travel',
    ],

    kind: 'related',

    explanation:
      'Se compara con cambios de sueño y viajes, porque el registro de episodios todavía no tiene un factor general de cambio de rutina.',
  },

  weekendChange: {
    questionId:
      'weekendChange',

    triggers: [
      'excessSleep',
      'sleepChange',
    ],

    kind: 'related',

    explanation:
      'Se compara con dormir más y con cambios de sueño. El fin de semana todavía no se registra como un factor independiente.',
  },

  lessSleep: {
    questionId:
      'lessSleep',

    triggers: [
      'lackOfSleep',
    ],

    kind: 'exact',
  },

  moreSleep: {
    questionId:
      'moreSleep',

    triggers: [
      'excessSleep',
    ],

    kind: 'exact',
  },

  irregularSleep: {
    questionId:
      'irregularSleep',

    triggers: [
      'sleepChange',
    ],

    kind: 'exact',
  },

  skippedMeals: {
    questionId:
      'skippedMeals',

    triggers: [
      'fasting',
    ],

    kind: 'exact',
  },

  longFasting: {
    questionId:
      'longFasting',

    triggers: [
      'fasting',
    ],

    kind: 'exact',
  },

  lowHydration: {
    questionId:
      'lowHydration',

    triggers: [
      'dehydration',
    ],

    kind: 'exact',
  },

  highStress: {
    questionId:
      'highStress',

    triggers: [
      'stress',
    ],

    kind: 'exact',
  },

  stressRelease: {
    questionId:
      'stressRelease',

    triggers: [
      'stress',
    ],

    kind: 'related',

    explanation:
      'El registro actual indica estrés en general y todavía no diferencia el período de exigencia del momento de relajación posterior.',
  },

  menstruationTiming: {
    questionId:
      'menstruationTiming',

    triggers: [
      'menstruation',
      'hormonal',
    ],

    kind: 'exact',
  },

  ovulationTiming: {
    questionId:
      'ovulationTiming',

    triggers: [
      'ovulation',
      'hormonal',
    ],

    kind: 'exact',
  },

  caffeineIncrease: {
    questionId:
      'caffeineIncrease',

    triggers: [
      'caffeine',
    ],

    kind: 'exact',
  },

  caffeineReduction: {
    questionId:
      'caffeineReduction',

    triggers: [
      'caffeineWithdrawal',
    ],

    kind: 'exact',
  },

  alcoholUse: {
    questionId:
      'alcoholUse',

    triggers: [
      'alcohol',
      'wine',
    ],

    kind: 'exact',
  },

  strongLight: {
    questionId:
      'strongLight',

    triggers: [
      'brightLight',
      'screens',
    ],

    kind: 'exact',
  },

  strongSounds: {
    questionId:
      'strongSounds',

    triggers: [
      'noise',
    ],

    kind: 'exact',
  },

  strongSmells: {
    questionId:
      'strongSmells',

    triggers: [
      'smell',
      'sweetSmell',
    ],

    kind: 'exact',
  },

  weatherChange: {
    questionId:
      'weatherChange',

    triggers: [
      'weather',
      'heat',
      'cold',
      'pressureChange',
    ],

    kind: 'exact',
  },

  neckTension: {
    questionId:
      'neckTension',

    triggers: [
      'neckTension',
      'posture',
    ],

    kind: 'exact',
  },

  unusualExercise: {
    questionId:
      'unusualExercise',

    triggers: [
      'physicalActivity',
    ],

    kind: 'exact',
  },
};