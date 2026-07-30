import type {
  PostdromeSymptom,
  PostdromeSymptomCategory,
} from '../types/migraine.types';


export interface PostdromeSymptomDefinition {
  value: PostdromeSymptom;

  category:
    PostdromeSymptomCategory;

  frequent?: boolean;

  searchTerms?: string[];
}


export const POSTDROME_CATEGORY_ORDER:
  readonly PostdromeSymptomCategory[] = [
  'energy',
  'cognitive',
  'sensory',
  'muscular',
  'emotional',
  'sleep',
  'digestive',
  'other',
];


export const POSTDROME_CATEGORY_LABELS:
  Record<
    PostdromeSymptomCategory,
    string
  > = {
  energy:
    'Energía y agotamiento',

  cognitive:
    'Síntomas cognitivos',

  sensory:
    'Sensibilidad y dolor residual',

  muscular:
    'Cuello y músculos',

  emotional:
    'Estado emocional',

  sleep:
    'Sueño',

  digestive:
    'Apetito e hidratación',

  other:
    'Sensaciones generales',
};


export const POSTDROME_SYMPTOM_CATALOG:
  readonly PostdromeSymptomDefinition[] = [
  {
    value: 'fatigue',
    category: 'energy',
    frequent: true,
    searchTerms: [
      'cansancio',
      'fatiga',
      'sin energía',
    ],
  },
  {
    value: 'extremeExhaustion',
    category: 'energy',
    frequent: true,
    searchTerms: [
      'agotamiento',
      'agotada',
      'exhausta',
    ],
  },
  {
    value: 'weakness',
    category: 'energy',
    frequent: true,
    searchTerms: [
      'debilidad',
      'falta de fuerza',
    ],
  },

  {
    value: 'brainFog',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'niebla mental',
      'mente nublada',
    ],
  },
  {
    value: 'concentrationDifficulty',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'concentración',
      'distracción',
      'no puedo concentrarme',
    ],
  },
  {
    value: 'mentalSlowness',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'lentitud mental',
      'pensamiento lento',
    ],
  },

  {
    value: 'residualSensitivity',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'sensibilidad residual',
      'hipersensibilidad',
    ],
  },
  {
    value: 'lightSensitivity',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'luz',
      'fotofobia',
    ],
  },
  {
    value: 'soundSensitivity',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'ruido',
      'sonido',
      'fonofobia',
    ],
  },
  {
    value: 'smellSensitivity',
    category: 'sensory',
    searchTerms: [
      'olor',
      'olores',
      'osmofobia',
    ],
  },
  {
    value: 'scalpTenderness',
    category: 'sensory',
    searchTerms: [
      'cuero cabelludo',
      'dolor al tocar el pelo',
      'sensibilidad en la cabeza',
    ],
  },
  {
    value: 'residualPain',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'dolor residual',
      'molestia',
      'dolor leve',
    ],
  },
  {
    value: 'dizziness',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'mareo',
      'inestabilidad',
    ],
  },

  {
    value: 'neckDiscomfort',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'molestia cervical',
      'molestia en el cuello',
    ],
  },
  {
    value: 'neckStiffness',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'rigidez cervical',
      'cuello rígido',
    ],
  },
  {
    value: 'shoulderPain',
    category: 'muscular',
    searchTerms: [
      'dolor de hombros',
      'hombros',
    ],
  },

  {
    value: 'moodChange',
    category: 'emotional',
    frequent: true,
    searchTerms: [
      'cambio de ánimo',
      'estado de ánimo',
    ],
  },
  {
    value: 'sadness',
    category: 'emotional',
    searchTerms: [
      'tristeza',
      'ánimo bajo',
    ],
  },
  {
    value: 'irritability',
    category: 'emotional',
    frequent: true,
    searchTerms: [
      'irritabilidad',
      'mal humor',
    ],
  },
  {
    value: 'euphoria',
    category: 'emotional',
    searchTerms: [
      'euforia',
      'energía emocional',
    ],
  },

  {
    value: 'sleepiness',
    category: 'sleep',
    frequent: true,
    searchTerms: [
      'sueño',
      'somnolencia',
    ],
  },
  {
    value: 'excessiveSleep',
    category: 'sleep',
    searchTerms: [
      'dormir mucho',
      'sueño excesivo',
    ],
  },
  {
    value: 'insomnia',
    category: 'sleep',
    searchTerms: [
      'insomnio',
      'no puedo dormir',
    ],
  },

  {
    value: 'hunger',
    category: 'digestive',
    searchTerms: [
      'hambre',
      'apetito',
    ],
  },
  {
    value: 'thirst',
    category: 'digestive',
    searchTerms: [
      'sed',
      'deshidratación',
    ],
  },

  {
    value: 'hangoverFeeling',
    category: 'other',
    frequent: true,
    searchTerms: [
      'resaca',
      'sensación de resaca',
      'como después de beber',
    ],
  },
  {
    value:
      'difficultyReturningToActivities',
    category: 'other',
    frequent: true,
    searchTerms: [
      'actividades',
      'trabajar',
      'volver a la rutina',
      'funcionar',
    ],
  },
];


export const FREQUENT_POSTDROME_SYMPTOMS:
  readonly PostdromeSymptom[] =
  POSTDROME_SYMPTOM_CATALOG
    .filter(
      definition =>
        definition.frequent === true,
    )
    .map(
      definition =>
        definition.value,
    );


export function normalizePostdromeSearch(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase(
      'es-AR',
    );
}


export function getPostdromeDefinitionsByCategory(
  category:
    PostdromeSymptomCategory,
): PostdromeSymptomDefinition[] {
  return POSTDROME_SYMPTOM_CATALOG.filter(
    definition =>
      definition.category ===
      category,
  );
}