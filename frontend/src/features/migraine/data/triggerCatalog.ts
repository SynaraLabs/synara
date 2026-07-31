import type {
  MigraineTrigger,
} from '../types/migraine.types';

export type TriggerCategory =
  | 'emotional'
  | 'sleep'
  | 'hydrationNutrition'
  | 'hormonal'
  | 'weather'
  | 'sensory'
  | 'physical'
  | 'travel'
  | 'other';

export interface TriggerDefinition {
  value: MigraineTrigger;

  label: string;

  category: TriggerCategory;

  frequent?: boolean;

  searchTerms?: string[];
}

export const TRIGGER_CATEGORY_ORDER:
  readonly TriggerCategory[] = [
  'emotional',
  'sleep',
  'hydrationNutrition',
  'hormonal',
  'weather',
  'sensory',
  'physical',
  'travel',
  'other',
];

export const TRIGGER_CATEGORY_LABELS:
  Record<
    TriggerCategory,
    string
  > = {
  emotional:
    'Estrés y emociones',

  sleep:
    'Sueño',

  hydrationNutrition:
    'Hidratación y alimentación',

  hormonal:
    'Hormonal',

  weather:
    'Clima y temperatura',

  sensory:
    'Estímulos sensoriales',

  physical:
    'Factores físicos',

  travel:
    'Viajes',

  other:
    'Otros',
};

export const TRIGGER_CATALOG:
  readonly TriggerDefinition[] = [
  {
    value: 'stress',
    label: 'Estrés',
    category: 'emotional',
    frequent: true,
    searchTerms: [
      'tensión emocional',
      'preocupación',
      'ansiedad',
    ],
  },

  {
    value: 'lackOfSleep',
    label: 'Dormir poco',
    category: 'sleep',
    frequent: true,
    searchTerms: [
      'falta de sueño',
      'pocas horas',
      'insomnio',
    ],
  },
  {
    value: 'excessSleep',
    label: 'Dormir más de lo habitual',
    category: 'sleep',
    frequent: true,
    searchTerms: [
      'exceso de sueño',
      'dormir mucho',
    ],
  },
  {
    value: 'sleepChange',
    label: 'Cambio en el horario de sueño',
    category: 'sleep',
    frequent: true,
    searchTerms: [
      'cambio de rutina',
      'horario distinto',
      'fin de semana',
    ],
  },

  {
    value: 'fasting',
    label: 'Ayuno o saltear comidas',
    category: 'hydrationNutrition',
    frequent: true,
    searchTerms: [
      'no comer',
      'saltear comida',
      'muchas horas sin comer',
    ],
  },
  {
    value: 'dehydration',
    label: 'Deshidratación',
    category: 'hydrationNutrition',
    frequent: true,
    searchTerms: [
      'poca agua',
      'no tomar agua',
    ],
  },
  {
    value: 'food',
    label: 'Algún alimento',
    category: 'hydrationNutrition',
    frequent: true,
    searchTerms: [
      'comida',
      'alimento desencadenante',
    ],
  },
  {
    value: 'chocolate',
    label: 'Chocolate',
    category: 'hydrationNutrition',
    searchTerms: [
      'cacao',
    ],
  },
  {
    value: 'iceCream',
    label: 'Helado o alimento muy frío',
    category: 'hydrationNutrition',
    searchTerms: [
      'helado',
      'comida fría',
      'bebida fría',
    ],
  },
  {
    value: 'fattyFood',
    label: 'Comida grasa o pesada',
    category: 'hydrationNutrition',
    searchTerms: [
      'fritura',
      'grasas',
      'comida pesada',
    ],
  },
  {
    value: 'caffeine',
    label: 'Consumo de cafeína',
    category: 'hydrationNutrition',
    searchTerms: [
      'café',
      'mate',
      'energizante',
    ],
  },
  {
    value: 'caffeineWithdrawal',
    label: 'Falta o reducción de cafeína',
    category: 'hydrationNutrition',
    searchTerms: [
      'no tomar café',
      'abstinencia de cafeína',
    ],
  },
  {
    value: 'alcohol',
    label: 'Alcohol',
    category: 'hydrationNutrition',
    frequent: true,
    searchTerms: [
      'bebida alcohólica',
    ],
  },
  {
    value: 'wine',
    label: 'Vino',
    category: 'hydrationNutrition',
    searchTerms: [
      'vino tinto',
      'vino blanco',
    ],
  },

  {
    value: 'hormonal',
    label: 'Cambio hormonal',
    category: 'hormonal',
    frequent: true,
    searchTerms: [
      'hormonas',
      'ciclo menstrual',
    ],
  },
  {
    value: 'menstruation',
    label: 'Menstruación',
    category: 'hormonal',
    frequent: true,
    searchTerms: [
      'período',
      'regla',
      'sangrado menstrual',
    ],
  },
  {
    value: 'ovulation',
    label: 'Ovulación',
    category: 'hormonal',
    frequent: true,
    searchTerms: [
      'mitad del ciclo',
      'fase ovulatoria',
    ],
  },

  {
    value: 'weather',
    label: 'Cambio climático',
    category: 'weather',
    frequent: true,
    searchTerms: [
      'clima',
      'cambio de tiempo',
    ],
  },
  {
    value: 'heat',
    label: 'Calor',
    category: 'weather',
    searchTerms: [
      'temperatura alta',
      'mucho calor',
    ],
  },
  {
    value: 'cold',
    label: 'Frío',
    category: 'weather',
    searchTerms: [
      'temperatura baja',
      'mucho frío',
    ],
  },
  {
    value: 'pressureChange',
    label: 'Cambio de presión atmosférica',
    category: 'weather',
    frequent: true,
    searchTerms: [
      'presión',
      'tormenta',
      'viento',
    ],
  },

  {
    value: 'smell',
    label: 'Olor fuerte',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'perfume',
      'humo',
      'producto de limpieza',
    ],
  },
  {
    value: 'sweetSmell',
    label: 'Olor dulce o empalagoso',
    category: 'sensory',
    searchTerms: [
      'perfume dulce',
      'aroma dulce',
    ],
  },
  {
    value: 'noise',
    label: 'Ruido',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'sonido fuerte',
      'mucho ruido',
    ],
  },
  {
    value: 'brightLight',
    label: 'Luz intensa',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'sol',
      'luz brillante',
      'reflejo',
    ],
  },
  {
    value: 'screens',
    label: 'Pantallas',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'celular',
      'computadora',
      'televisión',
    ],
  },

  {
    value: 'physicalActivity',
    label: 'Actividad o esfuerzo físico',
    category: 'physical',
    searchTerms: [
      'ejercicio',
      'entrenamiento',
      'esfuerzo',
    ],
  },
  {
    value: 'posture',
    label: 'Postura mantenida o incómoda',
    category: 'physical',
    frequent: true,
    searchTerms: [
      'mala postura',
      'estar sentada',
      'posición',
    ],
  },
  {
    value: 'neckTension',
    label: 'Tensión cervical',
    category: 'physical',
    frequent: true,
    searchTerms: [
      'cuello',
      'contractura',
      'cervicales',
      'trapecios',
    ],
  },

  {
    value: 'travel',
    label: 'Viaje o traslado',
    category: 'travel',
    searchTerms: [
      'auto',
      'micro',
      'avión',
      'movimiento',
    ],
  },

  {
    value: 'unknown',
    label: 'No identificado',
    category: 'other',
    frequent: true,
    searchTerms: [
      'no sé',
      'desconocido',
    ],
  },
  {
    value: 'other',
    label: 'Otro posible desencadenante',
    category: 'other',
    searchTerms: [
      'otro',
    ],
  },
];

export const TRIGGER_LABELS:
  Record<
    MigraineTrigger,
    string
  > = TRIGGER_CATALOG.reduce(
  (
    labels,
    definition,
  ) => {
    labels[definition.value] =
      definition.label;

    return labels;
  },
  {} as Record<
    MigraineTrigger,
    string
  >,
);

export const FREQUENT_TRIGGERS:
  readonly MigraineTrigger[] =
  TRIGGER_CATALOG
    .filter(
      definition =>
        definition.frequent === true,
    )
    .map(
      definition =>
        definition.value,
    );

export const normalizeTriggerSearch = (
  value: string,
): string => {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase(
      'es-AR',
    );
};