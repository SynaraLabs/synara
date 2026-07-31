import type {
  CrisisSymptom,
  CrisisSymptomCategory,
} from '../types/migraine.types';


export interface CrisisSymptomDefinition {
  value: CrisisSymptom;

  label: string;

  category:
    CrisisSymptomCategory;

  frequent?: boolean;

  searchTerms?: string[];
}


export const CRISIS_CATEGORY_ORDER:
  readonly CrisisSymptomCategory[] = [
  'digestive',
  'sensory',
  'vestibular',
  'cognitive',
  'muscular',
  'autonomic',
  'emotional',
  'other',
];


export const CRISIS_CATEGORY_LABELS:
  Record<
    CrisisSymptomCategory,
    string
  > = {
  digestive:
    'Digestivos',

  sensory:
    'Sensibilidad y visión',

  vestibular:
    'Mareo y equilibrio',

  cognitive:
    'Cognitivos y funcionales',

  muscular:
    'Cuello y músculos',

  autonomic:
    'Autonómicos',

  emotional:
    'Emocionales',

  other:
    'Otros',
};


export const CRISIS_SYMPTOM_CATALOG:
  readonly CrisisSymptomDefinition[] = [
  // --------------------------------
  // DIGESTIVOS
  // --------------------------------

  {
    value: 'nausea',
    label: 'Náuseas',
    category: 'digestive',
    frequent: true,
    searchTerms: [
      'nausea',
      'ganas de vomitar',
      'estómago revuelto',
    ],
  },
  {
    value: 'vomiting',
    label: 'Vómitos',
    category: 'digestive',
    frequent: true,
    searchTerms: [
      'vomito',
      'vomitar',
    ],
  },
  {
    value: 'abdominalPain',
    label: 'Dolor abdominal',
    category: 'digestive',
    searchTerms: [
      'dolor de panza',
      'dolor de estómago',
      'vientre',
    ],
  },
  {
    value: 'diarrhea',
    label: 'Diarrea',
    category: 'digestive',
    searchTerms: [
      'diarrea',
      'evacuaciones',
    ],
  },
  {
    value: 'lossOfAppetite',
    label: 'Pérdida del apetito',
    category: 'digestive',
    searchTerms: [
      'sin hambre',
      'falta de apetito',
      'no quiero comer',
    ],
  },
  {
    value: 'slowDigestion',
    label: 'Digestión lenta',
    category: 'digestive',
    searchTerms: [
      'pesadez',
      'digestión pesada',
      'estómago lento',
    ],
  },


  // --------------------------------
  // SENSITIVOS
  // --------------------------------

  {
    value: 'lightSensitivity',
    label:
      'Sensibilidad a la luz',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'luz',
      'fotofobia',
      'claridad',
      'pantalla',
    ],
  },
  {
    value: 'soundSensitivity',
    label:
      'Sensibilidad al sonido',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'ruido',
      'sonidos',
      'fonofobia',
    ],
  },
  {
    value: 'smellSensitivity',
    label:
      'Sensibilidad a los olores',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'olor',
      'olores',
      'perfume',
      'osmofobia',
    ],
  },
  {
    value: 'touchSensitivity',
    label:
      'Sensibilidad al tacto',
    category: 'sensory',
    searchTerms: [
      'tacto',
      'roce',
      'contacto',
    ],
  },
  {
    value: 'allodynia',
    label:
      'Dolor ante el roce o contacto',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'alodinia',
      'duele tocar',
      'dolor al peinarse',
      'dolor del cuero cabelludo',
      'ropa molesta',
    ],
  },
  {
    value: 'blurredVision',
    label: 'Visión borrosa',
    category: 'sensory',
    frequent: true,
    searchTerms: [
      'vista borrosa',
      'no veo bien',
      'visión desenfocada',
    ],
  },
  {
    value: 'focusDifficulty',
    label:
      'Dificultad para enfocar la vista',
    category: 'sensory',
    searchTerms: [
      'enfocar',
      'vista cansada',
      'dificultad visual',
    ],
  },


  // --------------------------------
  // VESTIBULARES
  // --------------------------------

  {
    value: 'dizziness',
    label: 'Mareo',
    category: 'vestibular',
    frequent: true,
    searchTerms: [
      'mareos',
      'cabeza liviana',
    ],
  },
  {
    value: 'vertigo',
    label: 'Vértigo',
    category: 'vestibular',
    frequent: true,
    searchTerms: [
      'todo gira',
      'sensación de giro',
    ],
  },
  {
    value: 'imbalance',
    label:
      'Inestabilidad o pérdida del equilibrio',
    category: 'vestibular',
    frequent: true,
    searchTerms: [
      'equilibrio',
      'inestable',
      'caminar torcida',
    ],
  },
  {
    value: 'movementSensation',
    label:
      'Sensación de movimiento',
    category: 'vestibular',
    searchTerms: [
      'balanceo',
      'movimiento sin moverme',
      'flotar',
    ],
  },
  {
    value: 'faintFeeling',
    label:
      'Sensación de desmayo',
    category: 'vestibular',
    searchTerms: [
      'desvanecimiento',
      'me voy a desmayar',
      'presíncope',
    ],
  },


  // --------------------------------
  // COGNITIVOS
  // --------------------------------

  {
    value: 'brainFog',
    label: 'Niebla mental',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'mente nublada',
      'no puedo pensar',
      'confusión mental',
    ],
  },
  {
    value: 'confusion',
    label: 'Confusión',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'desorientación',
      'confundida',
    ],
  },
  {
    value: 'speechDifficulty',
    label:
      'Dificultad para hablar',
    category: 'cognitive',
    searchTerms: [
      'hablar',
      'formar frases',
      'lenguaje',
    ],
  },
  {
    value: 'readingDifficulty',
    label:
      'Dificultad para leer',
    category: 'cognitive',
    searchTerms: [
      'lectura',
      'leer',
      'comprender texto',
    ],
  },
  {
    value: 'workDifficulty',
    label:
      'Dificultad para trabajar o realizar tareas',
    category: 'cognitive',
    frequent: true,
    searchTerms: [
      'trabajar',
      'estudiar',
      'hacer tareas',
      'funcionar',
    ],
  },
  {
    value: 'disconnectionFeeling',
    label:
      'Sensación de desconexión',
    category: 'cognitive',
    searchTerms: [
      'desconectada',
      'irrealidad',
      'estar ausente',
      'no estar presente',
    ],
  },


  // --------------------------------
  // MUSCULARES Y CERVICALES
  // --------------------------------

  {
    value: 'neckPain',
    label: 'Dolor cervical',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'cuello',
      'dolor de cuello',
      'cervicalgia',
    ],
  },
  {
    value: 'neckStiffness',
    label: 'Rigidez cervical',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'cuello rígido',
      'rigidez de cuello',
    ],
  },
  {
    value: 'jawTension',
    label:
      'Tensión mandibular',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'mandíbula tensa',
      'apretar dientes',
      'bruxismo',
    ],
  },
  {
    value: 'jawPain',
    label:
      'Dolor mandibular',
    category: 'muscular',
    searchTerms: [
      'dolor de mandíbula',
      'maxilar',
    ],
  },
  {
    value: 'trapeziusPain',
    label:
      'Dolor en trapecios',
    category: 'muscular',
    frequent: true,
    searchTerms: [
      'trapecio',
      'espalda alta',
      'contractura',
    ],
  },
  {
    value: 'shoulderPain',
    label:
      'Dolor en hombros',
    category: 'muscular',
    searchTerms: [
      'hombro',
      'hombros',
    ],
  },
  {
    value: 'armTingling',
    label:
      'Hormigueo en brazos',
    category: 'muscular',
    searchTerms: [
      'brazo dormido',
      'hormigueo del brazo',
      'cosquilleo',
    ],
  },
  {
    value: 'handWeakness',
    label:
      'Debilidad en las manos',
    category: 'muscular',
    searchTerms: [
      'mano débil',
      'falta de fuerza',
      'se me caen las cosas',
    ],
  },


  // --------------------------------
  // AUTONÓMICOS
  // --------------------------------

  {
    value: 'tearing',
    label: 'Lagrimeo',
    category: 'autonomic',
    searchTerms: [
      'lágrimas',
      'ojo lloroso',
      'llora un ojo',
    ],
  },
  {
    value: 'nasalCongestion',
    label: 'Congestión nasal',
    category: 'autonomic',
    searchTerms: [
      'nariz tapada',
      'congestión',
    ],
  },
  {
    value: 'runnyNose',
    label: 'Secreción nasal',
    category: 'autonomic',
    searchTerms: [
      'moco',
      'nariz que gotea',
      'rinorrea',
    ],
  },
  {
    value: 'droopingEyelid',
    label:
      'Caída del párpado',
    category: 'autonomic',
    searchTerms: [
      'párpado caído',
      'ojo caído',
      'ptosis',
    ],
  },
  {
    value: 'facialSweating',
    label:
      'Sudoración facial',
    category: 'autonomic',
    searchTerms: [
      'sudor en la cara',
      'cara transpirada',
    ],
  },
  {
    value: 'paleness',
    label: 'Palidez',
    category: 'autonomic',
    searchTerms: [
      'pálida',
      'cara blanca',
    ],
  },
  {
    value: 'chills',
    label:
      'Escalofríos',
    category: 'autonomic',
    searchTerms: [
      'frío',
      'temblores de frío',
      'piel de gallina',
    ],
  },
  {
    value: 'heatFeeling',
    label:
      'Sensación de calor',
    category: 'autonomic',
    searchTerms: [
      'calor',
      'sofoco',
      'calor corporal',
    ],
  },


  // --------------------------------
  // EMOCIONALES
  // --------------------------------

  {
    value: 'anxiety',
    label: 'Ansiedad',
    category: 'emotional',
    frequent: true,
    searchTerms: [
      'nervios',
      'inquietud',
      'angustia',
    ],
  },
  {
    value: 'irritability',
    label: 'Irritabilidad',
    category: 'emotional',
    searchTerms: [
      'mal humor',
      'enojo',
      'molestia emocional',
    ],
  },
  {
    value: 'fear',
    label: 'Miedo',
    category: 'emotional',
    searchTerms: [
      'temor',
      'pánico',
      'asustada',
    ],
  },
];


export const CRISIS_SYMPTOM_LABELS:
  Record<
    CrisisSymptom,
    string
  > = CRISIS_SYMPTOM_CATALOG.reduce(
  (
    labels,
    definition,
  ) => {
    labels[definition.value] =
      definition.label;

    return labels;
  },
  {} as Record<
    CrisisSymptom,
    string
  >,
);


export const FREQUENT_CRISIS_SYMPTOMS:
  readonly CrisisSymptom[] =
  CRISIS_SYMPTOM_CATALOG
    .filter(
      definition =>
        definition.frequent === true,
    )
    .map(
      definition =>
        definition.value,
    );


export function normalizeCrisisSymptomSearch(
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


export function getCrisisSymptomDefinition(
  symptom: CrisisSymptom,
): CrisisSymptomDefinition | undefined {
  return CRISIS_SYMPTOM_CATALOG.find(
    definition =>
      definition.value === symptom,
  );
}


export function getCrisisSymptomsByCategory(
  category:
    CrisisSymptomCategory,
): CrisisSymptomDefinition[] {
  return CRISIS_SYMPTOM_CATALOG.filter(
    definition =>
      definition.category ===
      category,
  );
}