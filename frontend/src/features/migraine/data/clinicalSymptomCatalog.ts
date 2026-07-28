import type {
  AuraClinicalSymptom,
  ClinicalPhase,
  ClinicalSymptomCategory,
  ExtendedCrisisSymptom,
  ExtendedPostdromeSymptom,
  ExtendedPremonitorySymptom,
  SymptomDefinition,
} from '../types/migraine.types';

export type ClinicalSymptomId =
  | ExtendedPremonitorySymptom
  | AuraClinicalSymptom
  | ExtendedCrisisSymptom
  | ExtendedPostdromeSymptom;

interface SymptomOptions {
  description?: string;
  searchTerms?: string[];
  frequent?: boolean;
  uncommon?: boolean;
}

export interface SymptomCatalogFilter {
  category?: ClinicalSymptomCategory;
  frequentOnly?: boolean;
  uncommonOnly?: boolean;
  search?: string;
}

const PREMONITORY: ClinicalPhase[] = [
  'premonitory',
];

const AURA: ClinicalPhase[] = [
  'aura',
];

const CRISIS: ClinicalPhase[] = [
  'crisis',
];

const POSTDROME: ClinicalPhase[] = [
  'postdrome',
];

const PREMONITORY_CRISIS:
  ClinicalPhase[] = [
  'premonitory',
  'crisis',
];

const PREMONITORY_POSTDROME:
  ClinicalPhase[] = [
  'premonitory',
  'postdrome',
];

const CRISIS_POSTDROME:
  ClinicalPhase[] = [
  'crisis',
  'postdrome',
];

const AURA_CRISIS:
  ClinicalPhase[] = [
  'aura',
  'crisis',
];

const AURA_CRISIS_POSTDROME:
  ClinicalPhase[] = [
  'aura',
  'crisis',
  'postdrome',
];

const PREMONITORY_CRISIS_POSTDROME:
  ClinicalPhase[] = [
  'premonitory',
  'crisis',
  'postdrome',
];

const ALL_PHASES:
  ClinicalPhase[] = [
  'premonitory',
  'aura',
  'crisis',
  'postdrome',
];

const defineSymptom = (
  value: ClinicalSymptomId,
  label: string,
  category: ClinicalSymptomCategory,
  phases: ClinicalPhase[],
  options: SymptomOptions = {},
): SymptomDefinition<ClinicalSymptomId> => {
  return {
    value,
    label,
    category,
    phases,
    ...options,
  };
};

export const clinicalSymptomCategoryLabels:
  Record<
    ClinicalSymptomCategory,
    string
  > = {
  cognitive: 'Cognitivos',
  emotional: 'Emocionales',
  energy: 'Energía',
  sleep: 'Sueño',
  appetite: 'Apetito',
  digestive: 'Digestivos',
  musculoskeletal:
    'Musculares y cervicales',
  sensory: 'Sensitivos',
  visual: 'Visuales',
  language: 'Lenguaje',
  motor: 'Motores',
  vestibular:
    'Equilibrio y percepción',
  autonomic: 'Autonómicos',
  pain: 'Dolor y presión',
  general: 'Generales',
  other: 'Otros',
};

export const migraineSymptomCatalog:
  SymptomDefinition<
    ClinicalSymptomId
  >[] = [
  // ----------------------------------------
  // COGNITIVE
  // ----------------------------------------

  defineSymptom(
    'brainFog',
    'Niebla mental',
    'cognitive',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'cabeza lenta',
        'mente nublada',
      ],
    },
  ),

  defineSymptom(
    'concentrationDifficulty',
    'Dificultad para concentrarse',
    'cognitive',
    PREMONITORY_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'falta de concentración',
      ],
    },
  ),

  defineSymptom(
    'mentalSlowness',
    'Lentitud mental',
    'cognitive',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'pensamiento lento',
      ],
    },
  ),

  defineSymptom(
    'wordFindingDifficulty',
    'Dificultad para encontrar palabras',
    'language',
    ALL_PHASES,
    {
      searchTerms: [
        'palabra en la punta de la lengua',
      ],
    },
  ),

  defineSymptom(
    'memoryDifficulty',
    'Dificultad de memoria',
    'cognitive',
    PREMONITORY_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'disconnectionFeeling',
    'Sensación de desconexión',
    'cognitive',
    PREMONITORY_CRISIS_POSTDROME,
    {
      searchTerms: [
        'sentirse desconectada',
      ],
    },
  ),

  defineSymptom(
    'clumsiness',
    'Torpeza inusual',
    'motor',
    PREMONITORY,
  ),

  defineSymptom(
    'decisionDifficulty',
    'Dificultad para tomar decisiones',
    'cognitive',
    PREMONITORY_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'reducedAttention',
    'Atención reducida',
    'cognitive',
    PREMONITORY,
  ),

  defineSymptom(
    'slowReaction',
    'Reacciones más lentas',
    'cognitive',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'spatialDisorientation',
    'Desorientación espacial',
    'cognitive',
    PREMONITORY,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'confusion',
    'Confusión',
    'cognitive',
    CRISIS,
  ),

  defineSymptom(
    'workDifficulty',
    'Dificultad para trabajar o estudiar',
    'cognitive',
    CRISIS,
    {
      frequent: true,
      searchTerms: [
        'no puedo estudiar',
        'no puedo trabajar',
      ],
    },
  ),

  defineSymptom(
    'timePerceptionChange',
    'Alteración de la percepción del tiempo',
    'cognitive',
    CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'depersonalization',
    'Sensación de estar desconectada de una misma',
    'cognitive',
    CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'derealization',
    'Sensación de que el entorno no es real',
    'cognitive',
    CRISIS,
    {
      uncommon: true,
    },
  ),

  // ----------------------------------------
  // EMOTIONAL
  // ----------------------------------------

  defineSymptom(
    'moodChange',
    'Cambios de ánimo',
    'emotional',
    PREMONITORY_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'irritability',
    'Irritabilidad',
    'emotional',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'anxiety',
    'Ansiedad',
    'emotional',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'sadness',
    'Tristeza',
    'emotional',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'apathy',
    'Apatía',
    'emotional',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'euphoria',
    'Euforia o ánimo inusualmente elevado',
    'emotional',
    PREMONITORY_POSTDROME,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'emotionalSensitivity',
    'Mayor sensibilidad emocional',
    'emotional',
    PREMONITORY_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'restlessness',
    'Inquietud',
    'emotional',
    PREMONITORY,
  ),

  defineSymptom(
    'fear',
    'Miedo',
    'emotional',
    CRISIS,
  ),

  defineSymptom(
    'panic',
    'Sensación de pánico',
    'emotional',
    CRISIS,
  ),

  defineSymptom(
    'agitation',
    'Agitación',
    'emotional',
    CRISIS,
  ),

  // ----------------------------------------
  // ENERGY AND SLEEP
  // ----------------------------------------

  defineSymptom(
    'fatigue',
    'Fatiga o cansancio',
    'energy',
    PREMONITORY_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'sleepiness',
    'Somnolencia',
    'sleep',
    PREMONITORY_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'yawning',
    'Bostezos frecuentes',
    'sleep',
    PREMONITORY,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'insomnia',
    'Insomnio',
    'sleep',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'unusualEnergy',
    'Energía inusualmente alta',
    'energy',
    PREMONITORY,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'nonRestorativeSleep',
    'Sueño no reparador',
    'sleep',
    PREMONITORY,
  ),

  defineSymptom(
    'extremeExhaustion',
    'Agotamiento extremo',
    'energy',
    POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'weakness',
    'Debilidad',
    'energy',
    POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'generalWeakness',
    'Debilidad general',
    'energy',
    PREMONITORY_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'bodyHeaviness',
    'Sensación de cuerpo pesado',
    'general',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'reducedStamina',
    'Menor resistencia física',
    'energy',
    POSTDROME,
  ),

  defineSymptom(
    'bodyAches',
    'Dolor corporal',
    'general',
    POSTDROME,
  ),

  defineSymptom(
    'muscleAches',
    'Molestias musculares',
    'musculoskeletal',
    PREMONITORY,
  ),

  defineSymptom(
    'excessiveSleep',
    'Necesidad de dormir más de lo habitual',
    'sleep',
    POSTDROME,
  ),

  // ----------------------------------------
  // APPETITE AND DIGESTIVE
  // ----------------------------------------

  defineSymptom(
    'foodCraving',
    'Antojos alimentarios',
    'appetite',
    PREMONITORY,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'sweetCraving',
    'Antojo de alimentos dulces',
    'appetite',
    PREMONITORY,
  ),

  defineSymptom(
    'saltyCraving',
    'Antojo de alimentos salados',
    'appetite',
    PREMONITORY,
  ),

  defineSymptom(
    'increasedHunger',
    'Aumento del hambre',
    'appetite',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'hunger',
    'Hambre',
    'appetite',
    POSTDROME,
  ),

  defineSymptom(
    'lossOfAppetite',
    'Pérdida del apetito',
    'appetite',
    PREMONITORY_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'thirst',
    'Mayor sensación de sed',
    'general',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'mildNausea',
    'Náuseas leves',
    'digestive',
    PREMONITORY,
  ),

  defineSymptom(
    'nausea',
    'Náuseas',
    'digestive',
    CRISIS_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'vomiting',
    'Vómitos',
    'digestive',
    CRISIS,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'bowelChanges',
    'Cambios intestinales',
    'digestive',
    PREMONITORY,
  ),

  defineSymptom(
    'constipation',
    'Estreñimiento',
    'digestive',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'diarrhea',
    'Diarrea',
    'digestive',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'abdominalBloating',
    'Hinchazón abdominal',
    'digestive',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'indigestion',
    'Indigestión',
    'digestive',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'abdominalPain',
    'Dolor abdominal',
    'digestive',
    CRISIS,
  ),

  defineSymptom(
    'slowDigestion',
    'Digestión lenta',
    'digestive',
    CRISIS,
  ),

  defineSymptom(
    'reflux',
    'Reflujo',
    'digestive',
    CRISIS,
  ),

  defineSymptom(
    'specificFoodAversion',
    'Rechazo a un alimento específico',
    'appetite',
    PREMONITORY,
  ),

  defineSymptom(
    'foodAversion',
    'Rechazo a la comida',
    'appetite',
    CRISIS,
  ),

  defineSymptom(
    'inabilityToEat',
    'Imposibilidad de comer',
    'digestive',
    CRISIS,
  ),

  defineSymptom(
    'inabilityToDrink',
    'Imposibilidad de beber',
    'digestive',
    CRISIS,
  ),

  defineSymptom(
    'dehydrationFeeling',
    'Sensación de deshidratación',
    'general',
    POSTDROME,
  ),

  // ----------------------------------------
  // MUSCULOSKELETAL AND MOTOR
  // ----------------------------------------

  defineSymptom(
    'neckStiffness',
    'Rigidez cervical',
    'musculoskeletal',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'cuello rígido',
        'rigidez de cuello',
      ],
    },
  ),

  defineSymptom(
    'neckPain',
    'Dolor cervical',
    'musculoskeletal',
    PREMONITORY_CRISIS,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'neckDiscomfort',
    'Molestia cervical residual',
    'musculoskeletal',
    POSTDROME,
  ),

  defineSymptom(
    'jawTension',
    'Tensión mandibular',
    'musculoskeletal',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'jawPain',
    'Dolor mandibular',
    'musculoskeletal',
    CRISIS,
  ),

  defineSymptom(
    'shoulderTension',
    'Tensión en hombros',
    'musculoskeletal',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'shoulderPain',
    'Dolor de hombro',
    'musculoskeletal',
    CRISIS_POSTDROME,
  ),

  defineSymptom(
    'trapeziusTension',
    'Tensión en trapecios',
    'musculoskeletal',
    PREMONITORY,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'trapeziusPain',
    'Dolor en trapecios',
    'musculoskeletal',
    CRISIS_POSTDROME,
  ),

  defineSymptom(
    'heavyNeckFeeling',
    'Sensación de cuello pesado',
    'musculoskeletal',
    PREMONITORY,
  ),

  defineSymptom(
    'armTingling',
    'Hormigueo en el brazo',
    'sensory',
    AURA_CRISIS,
  ),

  defineSymptom(
    'handTingling',
    'Hormigueo en la mano',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'legTingling',
    'Hormigueo en la pierna',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'facialTingling',
    'Hormigueo facial',
    'sensory',
    AURA_CRISIS,
  ),

  defineSymptom(
    'tongueNumbness',
    'Adormecimiento de la lengua',
    'sensory',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'lipNumbness',
    'Adormecimiento de los labios',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'handWeakness',
    'Debilidad en la mano',
    'motor',
    AURA_CRISIS,
  ),

  defineSymptom(
    'armWeakness',
    'Debilidad en el brazo',
    'motor',
    AURA_CRISIS,
  ),

  defineSymptom(
    'legWeakness',
    'Debilidad en la pierna',
    'motor',
    AURA_CRISIS,
  ),

  defineSymptom(
    'facialWeakness',
    'Debilidad facial',
    'motor',
    AURA_CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'oneSidedWeakness',
    'Debilidad de un lado del cuerpo',
    'motor',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'reducedGripStrength',
    'Disminución de la fuerza de agarre',
    'motor',
    AURA_CRISIS,
  ),

  defineSymptom(
    'fineMotorDifficulty',
    'Dificultad para movimientos finos',
    'motor',
    AURA,
  ),

  defineSymptom(
    'coordinationDifficulty',
    'Dificultad de coordinación',
    'motor',
    AURA,
  ),

  defineSymptom(
    'walkingDifficulty',
    'Dificultad para caminar',
    'motor',
    AURA,
  ),

  defineSymptom(
    'walkingInstability',
    'Inestabilidad al caminar',
    'vestibular',
    CRISIS,
  ),

  defineSymptom(
    'reducedCoordination',
    'Coordinación reducida',
    'motor',
    PREMONITORY,
  ),

  defineSymptom(
    'muscleTremor',
    'Temblor muscular',
    'motor',
    CRISIS,
  ),

  // ----------------------------------------
  // SENSORY AND VISUAL
  // ----------------------------------------

  defineSymptom(
    'lightSensitivity',
    'Sensibilidad a la luz',
    'sensory',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'fotofobia',
      ],
    },
  ),

  defineSymptom(
    'soundSensitivity',
    'Sensibilidad a los sonidos',
    'sensory',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'fonofobia',
        'sensibilidad al ruido',
      ],
    },
  ),

  defineSymptom(
    'smellSensitivity',
    'Sensibilidad a los olores',
    'sensory',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
      searchTerms: [
        'osmofobia',
      ],
    },
  ),

  defineSymptom(
    'touchSensitivity',
    'Sensibilidad al contacto',
    'sensory',
    CRISIS,
  ),

  defineSymptom(
    'skinSensitivity',
    'Sensibilidad de la piel',
    'sensory',
    PREMONITORY,
  ),

  defineSymptom(
    'allodynia',
    'Dolor ante estímulos que normalmente no duelen',
    'sensory',
    CRISIS,
    {
      searchTerms: [
        'alodinia',
        'dolor al peinarse',
      ],
    },
  ),

  defineSymptom(
    'scalpTenderness',
    'Sensibilidad o dolor en el cuero cabelludo',
    'sensory',
    CRISIS_POSTDROME,
  ),

  defineSymptom(
    'facialSensitivity',
    'Sensibilidad facial',
    'sensory',
    CRISIS,
  ),

  defineSymptom(
    'temperatureSensitivity',
    'Sensibilidad a los cambios de temperatura',
    'sensory',
    CRISIS,
  ),

  defineSymptom(
    'blurredVision',
    'Visión borrosa',
    'visual',
    ALL_PHASES,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'visualDiscomfort',
    'Molestia visual',
    'visual',
    PREMONITORY_POSTDROME,
  ),

  defineSymptom(
    'residualVisualDisturbance',
    'Alteración visual residual',
    'visual',
    POSTDROME,
  ),

  defineSymptom(
    'flashes',
    'Destellos de luz',
    'visual',
    AURA,
  ),

  defineSymptom(
    'zigzagLines',
    'Líneas en zigzag',
    'visual',
    AURA,
  ),

  defineSymptom(
    'blindSpots',
    'Puntos ciegos',
    'visual',
    AURA,
  ),

  defineSymptom(
    'tunnelVision',
    'Visión en túnel',
    'visual',
    AURA,
  ),

  defineSymptom(
    'visualSpots',
    'Manchas en la visión',
    'visual',
    AURA,
  ),

  defineSymptom(
    'visualDistortion',
    'Distorsión visual',
    'visual',
    AURA_CRISIS,
  ),

  defineSymptom(
    'partialVisionLoss',
    'Pérdida parcial de la visión',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'focusDifficulty',
    'Dificultad para enfocar',
    'visual',
    AURA_CRISIS,
  ),

  defineSymptom(
    'objectsAppearLarger',
    'Los objetos parecen más grandes',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'objectsAppearSmaller',
    'Los objetos parecen más pequeños',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'scintillatingScotoma',
    'Escotoma centelleante',
    'visual',
    AURA,
  ),

  defineSymptom(
    'fortificationSpectra',
    'Figuras luminosas similares a murallas',
    'visual',
    AURA,
    {
      searchTerms: [
        'espectro de fortificación',
      ],
    },
  ),

  defineSymptom(
    'shimmeringVision',
    'Visión brillante o centelleante',
    'visual',
    AURA,
  ),

  defineSymptom(
    'wavyVision',
    'Visión ondulada',
    'visual',
    AURA,
  ),

  defineSymptom(
    'fragmentedVision',
    'Visión fragmentada',
    'visual',
    AURA,
  ),

  defineSymptom(
    'colorDistortion',
    'Alteración de los colores',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'visualSnow',
    'Nieve visual',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'temporaryMonocularVisionLoss',
    'Pérdida temporal de visión en un ojo',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'temporaryHemifieldLoss',
    'Pérdida temporal de una mitad del campo visual',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'doubleVision',
    'Visión doble',
    'visual',
    AURA_CRISIS,
  ),

  defineSymptom(
    'oscillopsia',
    'Sensación de que el entorno visual se mueve',
    'visual',
    AURA,
    {
      uncommon: true,
    },
  ),

  // ----------------------------------------
  // PAIN AND PRESSURE
  // ----------------------------------------

  defineSymptom(
    'mildHeadache',
    'Cefalea leve',
    'pain',
    PREMONITORY,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'headPressure',
    'Presión en la cabeza',
    'pain',
    PREMONITORY,
  ),

  defineSymptom(
    'eyePressure',
    'Presión ocular',
    'pain',
    PREMONITORY,
  ),

  defineSymptom(
    'earPressure',
    'Presión en el oído',
    'pain',
    PREMONITORY,
  ),

  defineSymptom(
    'facialPressure',
    'Presión facial',
    'pain',
    PREMONITORY,
  ),

  defineSymptom(
    'eyePain',
    'Dolor ocular',
    'pain',
    CRISIS,
  ),

  defineSymptom(
    'residualPain',
    'Dolor residual',
    'pain',
    POSTDROME,
  ),

  // ----------------------------------------
  // VESTIBULAR AND PERCEPTION
  // ----------------------------------------

  defineSymptom(
    'dizziness',
    'Mareo',
    'vestibular',
    PREMONITORY_CRISIS_POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'vertigo',
    'Vértigo',
    'vestibular',
    AURA_CRISIS,
  ),

  defineSymptom(
    'imbalance',
    'Desequilibrio',
    'vestibular',
    ALL_PHASES,
  ),

  defineSymptom(
    'movementSensation',
    'Sensación de movimiento sin moverse',
    'vestibular',
    CRISIS,
  ),

  defineSymptom(
    'faintFeeling',
    'Sensación de desmayo',
    'vestibular',
    AURA_CRISIS,
  ),

  defineSymptom(
    'motionSensitivity',
    'Sensibilidad al movimiento',
    'vestibular',
    AURA_CRISIS_POSTDROME,
  ),

  defineSymptom(
    'tiltingSensation',
    'Sensación de inclinación',
    'vestibular',
    AURA_CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'floatingSensation',
    'Sensación de flotar',
    'vestibular',
    AURA_CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'earFullness',
    'Sensación de oído tapado',
    'vestibular',
    ALL_PHASES,
  ),

  defineSymptom(
    'tinnitus',
    'Zumbido en los oídos',
    'vestibular',
    ALL_PHASES,
  ),

  defineSymptom(
    'hearingChange',
    'Cambio temporal de la audición',
    'vestibular',
    AURA,
    {
      uncommon: true,
    },
  ),

  // ----------------------------------------
  // LANGUAGE
  // ----------------------------------------

  defineSymptom(
    'speechDifficulty',
    'Dificultad para hablar',
    'language',
    AURA_CRISIS,
  ),

  defineSymptom(
    'languageUnderstandingDifficulty',
    'Dificultad para comprender el lenguaje',
    'language',
    AURA,
  ),

  defineSymptom(
    'incorrectWords',
    'Uso involuntario de palabras incorrectas',
    'language',
    AURA,
  ),

  defineSymptom(
    'readingDifficulty',
    'Dificultad para leer',
    'language',
    AURA_CRISIS,
  ),

  defineSymptom(
    'writingDifficulty',
    'Dificultad para escribir',
    'language',
    AURA,
  ),

  defineSymptom(
    'slurredSpeech',
    'Habla arrastrada',
    'language',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'inabilityToSpeak',
    'Incapacidad temporal para hablar',
    'language',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'sentenceFormationDifficulty',
    'Dificultad para formar oraciones',
    'language',
    AURA,
  ),

  defineSymptom(
    'repetitionDifficulty',
    'Dificultad para repetir palabras o frases',
    'language',
    AURA,
  ),

  defineSymptom(
    'nameRecognitionDifficulty',
    'Dificultad para reconocer o recordar nombres',
    'language',
    AURA,
    {
      uncommon: true,
    },
  ),

  // ----------------------------------------
  // SENSORY AURA
  // ----------------------------------------

  defineSymptom(
    'tingling',
    'Hormigueo',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'numbness',
    'Adormecimiento',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'electricSensation',
    'Sensación eléctrica',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'reducedSensation',
    'Disminución de la sensibilidad',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'spreadingParesthesia',
    'Hormigueo que se extiende progresivamente',
    'sensory',
    AURA,
  ),

  defineSymptom(
    'unilateralSensorySpread',
    'Síntomas sensitivos que avanzan por un lado del cuerpo',
    'sensory',
    AURA,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'alteredTemperatureSensation',
    'Alteración de la sensación de frío o calor',
    'sensory',
    AURA,
  ),

  // ----------------------------------------
  // AUTONOMIC
  // ----------------------------------------

  defineSymptom(
    'coldFeeling',
    'Sensación de frío',
    'autonomic',
    PREMONITORY,
  ),

  defineSymptom(
    'chills',
    'Escalofríos',
    'autonomic',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'frequentUrination',
    'Necesidad de orinar con más frecuencia',
    'autonomic',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'fluidRetention',
    'Retención de líquidos',
    'autonomic',
    PREMONITORY,
  ),

  defineSymptom(
    'sweating',
    'Sudoración',
    'autonomic',
    PREMONITORY,
  ),

  defineSymptom(
    'temperatureChange',
    'Cambios en la temperatura corporal percibida',
    'autonomic',
    PREMONITORY,
  ),

  defineSymptom(
    'temperatureFluctuation',
    'Alternancia de frío y calor',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'paleness',
    'Palidez',
    'autonomic',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'nasalCongestion',
    'Congestión nasal',
    'autonomic',
    PREMONITORY_CRISIS,
  ),

  defineSymptom(
    'tearing',
    'Lagrimeo',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'runnyNose',
    'Secreción nasal',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'droopingEyelid',
    'Párpado caído',
    'autonomic',
    CRISIS,
    {
      uncommon: true,
    },
  ),

  defineSymptom(
    'facialSweating',
    'Sudoración facial',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'heatFeeling',
    'Sensación intensa de calor',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'eyelidSwelling',
    'Hinchazón del párpado',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'facialRedness',
    'Enrojecimiento facial',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'coldSweating',
    'Sudor frío',
    'autonomic',
    CRISIS,
  ),

  defineSymptom(
    'palpitations',
    'Palpitaciones',
    'autonomic',
    CRISIS,
  ),

  // ----------------------------------------
  // POSTDROME-SPECIFIC
  // ----------------------------------------

  defineSymptom(
    'residualSensitivity',
    'Sensibilidad residual',
    'sensory',
    POSTDROME,
  ),

  defineSymptom(
    'hangoverFeeling',
    'Sensación similar a una resaca',
    'general',
    POSTDROME,
    {
      frequent: true,
    },
  ),

  defineSymptom(
    'difficultyReturningToActivities',
    'Dificultad para retomar las actividades',
    'general',
    POSTDROME,
    {
      frequent: true,
    },
  ),
];

export const migraineSymptomCatalogById =
  Object.fromEntries(
    migraineSymptomCatalog.map(
      definition => [
        definition.value,
        definition,
      ],
    ),
  ) as Record<
    ClinicalSymptomId,
    SymptomDefinition<
      ClinicalSymptomId
    >
  >;

export function getSymptomDefinition(
  symptom: ClinicalSymptomId,
): SymptomDefinition<
  ClinicalSymptomId
> | undefined {
  return migraineSymptomCatalogById[
    symptom
  ];
}

export function getSymptomsForPhase(
  phase: ClinicalPhase,
  filter: SymptomCatalogFilter = {},
): SymptomDefinition<
  ClinicalSymptomId
>[] {
  const normalizedSearch =
    filter.search
      ?.trim()
      .toLocaleLowerCase('es-AR');

  return migraineSymptomCatalog.filter(
    definition => {
      if (
        !definition.phases.includes(
          phase,
        )
      ) {
        return false;
      }

      if (
        filter.category &&
        definition.category !==
          filter.category
      ) {
        return false;
      }

      if (
        filter.frequentOnly &&
        !definition.frequent
      ) {
        return false;
      }

      if (
        filter.uncommonOnly &&
        !definition.uncommon
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        definition.label,
        definition.value,
        definition.description ?? '',
        ...(definition.searchTerms ??
          []),
      ]
        .join(' ')
        .toLocaleLowerCase(
          'es-AR',
        );

      return searchableText.includes(
        normalizedSearch,
      );
    },
  );
}

export function getFrequentSymptomsForPhase(
  phase: ClinicalPhase,
): SymptomDefinition<
  ClinicalSymptomId
>[] {
  return getSymptomsForPhase(
    phase,
    {
      frequentOnly: true,
    },
  );
}

export function groupSymptomsByCategory(
  symptoms: SymptomDefinition<
    ClinicalSymptomId
  >[],
): Partial<
  Record<
    ClinicalSymptomCategory,
    SymptomDefinition<
      ClinicalSymptomId
    >[]
  >
> {
  return symptoms.reduce<
    Partial<
      Record<
        ClinicalSymptomCategory,
        SymptomDefinition<
          ClinicalSymptomId
        >[]
      >
    >
  >(
    (
      groups,
      definition,
    ) => {
      const currentGroup =
        groups[
          definition.category
        ] ?? [];

      groups[
        definition.category
      ] = [
        ...currentGroup,
        definition,
      ];

      return groups;
    },
    {},
  );
}