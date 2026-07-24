import type {
  MigraineTrigger,
  CrisisSymptom,
} from '../../migraine/types/migraine.types';



export const triggerLabels:
Record<MigraineTrigger,string> = {

  stress:
    'Estrés',

  lackOfSleep:
    'Falta de sueño',

  food:
    'Alimentación',

  caffeine:
    'Cafeína',

  alcohol:
    'Alcohol',

  hormonal:
    'Hormonal',

  weather:
    'Clima',

  smell:
    'Olores',

  noise:
    'Ruido',

  unknown:
    'Desconocido',

};





export const symptomLabels:
Record<CrisisSymptom,string> = {

  nausea:
    'Náuseas',

  vomiting:
    'Vómitos',

  lightSensitivity:
    'Sensibilidad a la luz',

  soundSensitivity:
    'Sensibilidad al sonido',

  smellSensitivity:
    'Sensibilidad a olores',

  dizziness:
    'Mareos',

  confusion:
    'Confusión',

  neckPain:
    'Dolor cervical',

  jawTension:
    'Tensión mandibular',

};