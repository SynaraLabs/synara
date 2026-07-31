export type NonPharmacologicalMeasureCategory =
  | 'environment'
  | 'temperature'
  | 'rest'
  | 'hydrationNutrition'
  | 'physical'
  | 'relaxation'
  | 'other';

export type NonPharmacologicalMeasure =
  | 'darkRoom'
  | 'quietEnvironment'
  | 'screenAvoidance'
  | 'coldCompress'
  | 'heatApplication'
  | 'sleep'
  | 'rest'
  | 'hydration'
  | 'food'
  | 'caffeine'
  | 'stretching'
  | 'massage'
  | 'breathing'
  | 'meditation'
  | 'other';

export interface NonPharmacologicalMeasureDefinition {
  value: NonPharmacologicalMeasure;

  label: string;

  category:
    NonPharmacologicalMeasureCategory;

  frequent?: boolean;
}

export const NON_PHARMACOLOGICAL_CATEGORY_ORDER:
  readonly NonPharmacologicalMeasureCategory[] = [
  'environment',
  'temperature',
  'rest',
  'hydrationNutrition',
  'physical',
  'relaxation',
  'other',
];

export const NON_PHARMACOLOGICAL_CATEGORY_LABELS:
  Record<
    NonPharmacologicalMeasureCategory,
    string
  > = {
  environment:
    'Ambiente',

  temperature:
    'Frío o calor',

  rest:
    'Descanso',

  hydrationNutrition:
    'Hidratación y alimentación',

  physical:
    'Medidas físicas',

  relaxation:
    'Relajación',

  other:
    'Otras',
};

export const NON_PHARMACOLOGICAL_MEASURE_CATALOG:
  readonly NonPharmacologicalMeasureDefinition[] = [
  {
    value: 'darkRoom',
    label: 'Habitación oscura',
    category: 'environment',
    frequent: true,
  },
  {
    value: 'quietEnvironment',
    label: 'Ambiente silencioso',
    category: 'environment',
    frequent: true,
  },
  {
    value: 'screenAvoidance',
    label: 'Evitar pantallas',
    category: 'environment',
    frequent: true,
  },
  {
    value: 'coldCompress',
    label: 'Compresa fría',
    category: 'temperature',
    frequent: true,
  },
  {
    value: 'heatApplication',
    label: 'Aplicación de calor',
    category: 'temperature',
  },
  {
    value: 'sleep',
    label: 'Dormir',
    category: 'rest',
    frequent: true,
  },
  {
    value: 'rest',
    label: 'Reposo',
    category: 'rest',
    frequent: true,
  },
  {
    value: 'hydration',
    label: 'Tomar agua',
    category: 'hydrationNutrition',
    frequent: true,
  },
  {
    value: 'food',
    label: 'Comer algo',
    category: 'hydrationNutrition',
  },
  {
    value: 'caffeine',
    label: 'Consumir cafeína',
    category: 'hydrationNutrition',
  },
  {
    value: 'stretching',
    label: 'Estiramientos',
    category: 'physical',
  },
  {
    value: 'massage',
    label: 'Masaje',
    category: 'physical',
  },
  {
    value: 'breathing',
    label: 'Respiración guiada',
    category: 'relaxation',
  },
  {
    value: 'meditation',
    label: 'Meditación',
    category: 'relaxation',
  },
  {
    value: 'other',
    label: 'Otra medida',
    category: 'other',
  },
];

export const FREQUENT_NON_PHARMACOLOGICAL_MEASURES:
  readonly NonPharmacologicalMeasure[] =
  NON_PHARMACOLOGICAL_MEASURE_CATALOG
    .filter(
      definition =>
        definition.frequent === true,
    )
    .map(
      definition =>
        definition.value,
    );

export const NON_PHARMACOLOGICAL_MEASURE_LABELS:
  Record<
    NonPharmacologicalMeasure,
    string
  > =
  NON_PHARMACOLOGICAL_MEASURE_CATALOG.reduce(
    (
      labels,
      definition,
    ) => {
      labels[definition.value] =
        definition.label;

      return labels;
    },
    {} as Record<
      NonPharmacologicalMeasure,
      string
    >,
  );