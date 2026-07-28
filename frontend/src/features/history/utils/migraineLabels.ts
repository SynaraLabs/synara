import type {
  AuraType,
  CrisisSymptom,
  LanguageAura,
  MigraineTrigger,
  MotorAura,
  PostdromeSymptom,
  SensoryAura,
  VestibularAura,
  VisualAura,
} from '../../migraine/types/migraine.types';

export const triggerLabels: Record<
  MigraineTrigger,
  string
> = {
  stress: 'Estrés',

  lackOfSleep: 'Falta de sueño',

  excessSleep: 'Exceso de sueño',

  sleepChange: 'Cambio en el sueño',

  fasting: 'Ayuno',

  dehydration: 'Deshidratación',

  food: 'Alimentación',

  chocolate: 'Chocolate',

  iceCream: 'Helado',

  fattyFood: 'Comidas grasas',

  caffeine: 'Cafeína',

  caffeineWithdrawal:
    'Abstinencia de cafeína',

  alcohol: 'Alcohol',

  wine: 'Vino',

  hormonal: 'Cambios hormonales',

  menstruation: 'Menstruación',

  ovulation: 'Ovulación',

  weather: 'Clima',

  heat: 'Calor',

  cold: 'Frío',

  pressureChange:
    'Cambio de presión atmosférica',

  smell: 'Olores',

  sweetSmell:
    'Olores dulces o intensos',

  noise: 'Ruido',

  brightLight: 'Luz intensa',

  screens: 'Pantallas',

  physicalActivity:
    'Actividad física',

  posture: 'Postura',

  neckTension:
    'Tensión cervical',

  travel: 'Viaje',

  unknown: 'Desconocido',

  other: 'Otro',
};

export const crisisSymptomLabels: Record<
  CrisisSymptom,
  string
> = {
  nausea: 'Náuseas',

  vomiting: 'Vómitos',

  abdominalPain: 'Dolor abdominal',

  diarrhea: 'Diarrea',

  lossOfAppetite:
    'Pérdida de apetito',

  slowDigestion: 'Digestión lenta',

  lightSensitivity:
    'Sensibilidad a la luz',

  soundSensitivity:
    'Sensibilidad al sonido',

  smellSensitivity:
    'Sensibilidad a olores',

  touchSensitivity:
    'Sensibilidad al tacto',

  allodynia: 'Alodinia',

  blurredVision: 'Visión borrosa',

  focusDifficulty:
    'Dificultad para enfocar',

  dizziness: 'Mareos',

  vertigo: 'Vértigo',

  imbalance: 'Inestabilidad',

  movementSensation:
    'Sensación de movimiento',

  faintFeeling:
    'Sensación de desmayo',

  brainFog: 'Niebla mental',

  confusion: 'Confusión',

  speechDifficulty:
    'Dificultad para hablar',

  readingDifficulty:
    'Dificultad para leer',

  workDifficulty:
    'Dificultad para trabajar o estudiar',

  disconnectionFeeling:
    'Sensación de desconexión',

  neckPain: 'Dolor cervical',

  neckStiffness:
    'Rigidez cervical',

  jawTension:
    'Tensión mandibular',

  jawPain: 'Dolor mandibular',

  trapeziusPain:
    'Dolor de trapecio',

  shoulderPain:
    'Dolor de hombro',

  armTingling:
    'Hormigueo en el brazo',

  handWeakness:
    'Debilidad en la mano',

  tearing: 'Lagrimeo',

  nasalCongestion:
    'Congestión nasal',

  runnyNose: 'Secreción nasal',

  droopingEyelid:
    'Párpado caído',

  facialSweating:
    'Sudoración facial',

  paleness: 'Palidez',

  chills: 'Escalofríos',

  heatFeeling:
    'Sensación de calor',

  anxiety: 'Ansiedad',

  irritability: 'Irritabilidad',

  fear: 'Miedo',
};

/**
 * Temporary compatibility alias.
 * Existing components may still import symptomLabels.
 */
export const symptomLabels =
  crisisSymptomLabels;

export const postdromeSymptomLabels: Record<
  PostdromeSymptom,
  string
> = {
  fatigue: 'Fatiga',

  extremeExhaustion:
    'Agotamiento extremo',

  weakness: 'Debilidad',

  brainFog: 'Niebla mental',

  concentrationDifficulty:
    'Dificultad para concentrarse',

  mentalSlowness:
    'Lentitud mental',

  residualSensitivity:
    'Sensibilidad residual',

  lightSensitivity:
    'Sensibilidad a la luz',

  soundSensitivity:
    'Sensibilidad al sonido',

  smellSensitivity:
    'Sensibilidad a olores',

  scalpTenderness:
    'Sensibilidad en el cuero cabelludo',

  residualPain:
    'Dolor residual',

  dizziness: 'Mareos',

  neckDiscomfort:
    'Molestia cervical',

  neckStiffness:
    'Rigidez cervical',

  shoulderPain:
    'Dolor de hombro',

  moodChange:
    'Cambios de ánimo',

  sadness: 'Tristeza',

  irritability: 'Irritabilidad',

  euphoria: 'Euforia',

  sleepiness: 'Somnolencia',

  excessiveSleep:
    'Sueño excesivo',

  insomnia: 'Insomnio',

  hunger: 'Hambre',

  thirst: 'Sed',

  hangoverFeeling:
    'Sensación de resaca',

  difficultyReturningToActivities:
    'Dificultad para retomar actividades',
};

export const auraTypeLabels: Record<
  AuraType,
  string
> = {
  visual: 'Visual',

  sensory: 'Sensitiva',

  language: 'Lenguaje',

  motor: 'Motora',

  vestibular: 'Vestibular',
};

export const visualAuraLabels: Record<
  VisualAura,
  string
> = {
  flashes: 'Destellos de luz',

  zigzagLines: 'Líneas en zigzag',

  blindSpots: 'Puntos ciegos',

  blurredVision: 'Visión borrosa',

  tunnelVision: 'Visión en túnel',

  visualSpots:
    'Manchas en la visión',

  visualDistortion:
    'Distorsión visual',

  partialVisionLoss:
    'Pérdida parcial de visión',

  focusDifficulty:
    'Dificultad para enfocar',

  objectsAppearLarger:
    'Objetos más grandes',

  objectsAppearSmaller:
    'Objetos más pequeños',
};

export const sensoryAuraLabels: Record<
  SensoryAura,
  string
> = {
  tingling: 'Hormigueo',

  numbness: 'Entumecimiento',

  electricSensation:
    'Sensación eléctrica',

  reducedSensation:
    'Disminución de la sensibilidad',

  spreadingParesthesia:
    'Hormigueo que se desplaza',
};

export const languageAuraLabels: Record<
  LanguageAura,
  string
> = {
  wordFindingDifficulty:
    'Dificultad para encontrar palabras',

  speechDifficulty:
    'Dificultad para hablar',

  languageUnderstandingDifficulty:
    'Dificultad para comprender el lenguaje',

  incorrectWords:
    'Uso de palabras incorrectas',

  readingDifficulty:
    'Dificultad para leer',

  writingDifficulty:
    'Dificultad para escribir',
};

export const motorAuraLabels: Record<
  MotorAura,
  string
> = {
  handWeakness:
    'Debilidad en la mano',

  armWeakness:
    'Debilidad en el brazo',

  facialWeakness:
    'Debilidad facial',

  coordinationDifficulty:
    'Dificultad de coordinación',

  walkingDifficulty:
    'Dificultad para caminar',
};

export const vestibularAuraLabels: Record<
  VestibularAura,
  string
> = {
  vertigo: 'Vértigo',

  imbalance: 'Desequilibrio',

  tinnitus: 'Zumbido en los oídos',

  doubleVision: 'Visión doble',

  coordinationDifficulty:
    'Dificultad de coordinación',

  faintFeeling:
    'Sensación de desmayo',
};