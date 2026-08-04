export type TriggerQuestionAnswer =
  | 'often'
  | 'sometimes'
  | 'never'
  | 'unknown';

export type TriggerEducationCategory =
  | 'routine'
  | 'sleep'
  | 'foodHydration'
  | 'stress'
  | 'hormonal'
  | 'substances'
  | 'environment'
  | 'physical';

export type TriggerQuestionId =
  | 'routineChange'
  | 'weekendChange'
  | 'lessSleep'
  | 'moreSleep'
  | 'irregularSleep'
  | 'skippedMeals'
  | 'longFasting'
  | 'lowHydration'
  | 'highStress'
  | 'stressRelease'
  | 'menstruationTiming'
  | 'ovulationTiming'
  | 'caffeineIncrease'
  | 'caffeineReduction'
  | 'alcoholUse'
  | 'strongLight'
  | 'strongSounds'
  | 'strongSmells'
  | 'weatherChange'
  | 'neckTension'
  | 'unusualExercise';

export interface TriggerQuestion {
  id: TriggerQuestionId;

  question: string;

  explanation: string;
}

export interface TriggerEducationSection {
  id: TriggerEducationCategory;

  title: string;

  shortTitle: string;

  icon: string;

  introduction: string;

  questions: TriggerQuestion[];
}

export const TRIGGER_ANSWER_LABELS:
  Record<
    TriggerQuestionAnswer,
    string
  > = {
  often:
    'Me pasa con frecuencia',

  sometimes:
    'Me pasó algunas veces',

  never:
    'No lo observé',

  unknown:
    'Todavía no lo sé',
};

export const TRIGGER_EDUCATION_SECTIONS:
  TriggerEducationSection[] = [
  {
    id: 'routine',

    title:
      'Cambios de rutina',

    shortTitle:
      'Rutina',

    icon: '↔',

    introduction:
      'A veces el factor relevante no es una actividad concreta, sino un cambio respecto de tu rutina habitual.',

    questions: [
      {
        id: 'routineChange',

        question:
          '¿Tus episodios aparecen después de cambios importantes en horarios, comidas o actividades?',

        explanation:
          'Observá especialmente viajes, feriados, jornadas diferentes o cambios repentinos en tus hábitos.',
      },
      {
        id: 'weekendChange',

        question:
          '¿Notás más episodios durante fines de semana, vacaciones o días de descanso?',

        explanation:
          'La modificación del sueño, las comidas, la cafeína o la disminución del estrés puede coincidir con esos días.',
      },
    ],
  },

  {
    id: 'sleep',

    title:
      'Sueño y descanso',

    shortTitle:
      'Sueño',

    icon: '◐',

    introduction:
      'Tanto dormir menos como dormir más de lo habitual puede coincidir con episodios en algunas personas.',

    questions: [
      {
        id: 'lessSleep',

        question:
          '¿Los episodios aparecen después de dormir menos de lo habitual?',

        explanation:
          'Compará con tu propio descanso habitual, no solamente con una cantidad ideal de horas.',
      },
      {
        id: 'moreSleep',

        question:
          '¿Los episodios aparecen después de dormir más de lo habitual?',

        explanation:
          'Dormir hasta más tarde o cambiar el horario de despertar también modifica la rutina.',
      },
      {
        id: 'irregularSleep',

        question:
          '¿Notás relación con horarios de sueño irregulares o despertares frecuentes?',

        explanation:
          'El cambio de horario puede ser tan importante como la cantidad total de sueño.',
      },
    ],
  },

  {
    id: 'foodHydration',

    title:
      'Comidas e hidratación',

    shortTitle:
      'Alimentación',

    icon: '◇',

    introduction:
      'La regularidad de las comidas y la hidratación suele ser más informativa que culpar a un alimento aislado.',

    questions: [
      {
        id: 'skippedMeals',

        question:
          '¿Los episodios aparecen en días en los que salteaste alguna comida?',

        explanation:
          'Registrá el horario y cuánto tiempo pasó hasta el inicio de los síntomas.',
      },
      {
        id: 'longFasting',

        question:
          '¿Notás episodios después de pasar muchas horas sin comer?',

        explanation:
          'El intervalo entre comidas puede ser más relevante que un alimento específico.',
      },
      {
        id: 'lowHydration',

        question:
          '¿Los episodios coinciden con días en los que bebiste menos líquido de lo habitual?',

        explanation:
          'Calor, ejercicio, enfermedad o mayor consumo de alcohol y cafeína también pueden modificar la hidratación.',
      },
    ],
  },

  {
    id: 'stress',

    title:
      'Estrés y relajación',

    shortTitle:
      'Estrés',

    icon: '≈',

    introduction:
      'Algunas personas observan episodios durante el estrés y otras cuando la exigencia disminuye.',

    questions: [
      {
        id: 'highStress',

        question:
          '¿Tus episodios aparecen durante períodos de mayor tensión o exigencia?',

        explanation:
          'Considerá trabajo, estudio, conflictos, preocupaciones y sobrecarga emocional.',
      },
      {
        id: 'stressRelease',

        question:
          '¿Los episodios aparecen cuando termina un período estresante y finalmente descansás?',

        explanation:
          'Este patrón puede aparecer al comenzar el fin de semana, vacaciones o después de una situación exigente.',
      },
    ],
  },

  {
    id: 'hormonal',

    title:
      'Contexto hormonal',

    shortTitle:
      'Hormonal',

    icon: '○',

    introduction:
      'Las asociaciones hormonales requieren observar varios ciclos; una sola coincidencia no confirma un patrón.',

    questions: [
      {
        id: 'menstruationTiming',

        question:
          '¿Tus episodios se repiten alrededor del inicio de la menstruación?',

        explanation:
          'Registrá las fechas durante varios ciclos para poder comparar el patrón.',
      },
      {
        id: 'ovulationTiming',

        question:
          '¿Notás episodios que se repiten alrededor de la ovulación?',

        explanation:
          'Si no conocés el momento de ovulación, podés elegir “Todavía no lo sé”.',
      },
    ],
  },

  {
    id: 'substances',

    title:
      'Cafeína y alcohol',

    shortTitle:
      'Sustancias',

    icon: '⌁',

    introduction:
      'La cantidad, la frecuencia y los cambios respecto del consumo habitual pueden influir de maneras diferentes.',

    questions: [
      {
        id: 'caffeineIncrease',

        question:
          '¿Notás episodios después de consumir más cafeína de lo habitual?',

        explanation:
          'Incluí café, mate, té, bebidas energéticas y algunos analgésicos.',
      },
      {
        id: 'caffeineReduction',

        question:
          '¿Notás episodios cuando consumís menos cafeína o la suspendés de manera repentina?',

        explanation:
          'La reducción brusca también puede coincidir con dolor de cabeza.',
      },
      {
        id: 'alcoholUse',

        question:
          '¿Los episodios aparecen después de consumir alcohol?',

        explanation:
          'Registrá tipo, cantidad, hidratación, sueño y otros factores presentes ese día.',
      },
    ],
  },

  {
    id: 'environment',

    title:
      'Ambiente y sentidos',

    shortTitle:
      'Ambiente',

    icon: '☼',

    introduction:
      'Luz, sonidos y olores pueden actuar como posibles factores, pero una mayor sensibilidad también puede ser una señal temprana del episodio.',

    questions: [
      {
        id: 'strongLight',

        question:
          '¿Los episodios parecen relacionarse con luces intensas, parpadeantes o muchas horas de pantalla?',

        explanation:
          'Observá si la molestia apareció antes del dolor, porque también podría formar parte de la fase premonitoria.',
      },
      {
        id: 'strongSounds',

        question:
          '¿Notás relación con ambientes especialmente ruidosos?',

        explanation:
          'La sensibilidad al sonido puede ser un factor posible o un síntoma temprano del episodio.',
      },
      {
        id: 'strongSmells',

        question:
          '¿Notás relación con perfumes, humo, combustibles u otros olores intensos?',

        explanation:
          'Registrá el olor y si la sensibilidad ya había comenzado antes de la exposición.',
      },
      {
        id: 'weatherChange',

        question:
          '¿Tus episodios coinciden con cambios marcados de temperatura, presión o clima?',

        explanation:
          'Estos factores no siempre pueden evitarse; el objetivo es observar patrones, no controlar todo el ambiente.',
      },
    ],
  },

  {
    id: 'physical',

    title:
      'Cuello y esfuerzo físico',

    shortTitle:
      'Físico',

    icon: '⌖',

    introduction:
      'La tensión corporal y el ejercicio pueden coincidir con episodios, pero el dolor cervical también puede ser una señal premonitoria.',

    questions: [
      {
        id: 'neckTension',

        question:
          '¿Notás episodios después de tensión cervical, posturas sostenidas o molestias de cuello?',

        explanation:
          'Registrá cuándo comenzó la molestia. Si apareció sin una causa clara antes del dolor, podría ser parte del episodio.',
      },
      {
        id: 'unusualExercise',

        question:
          '¿Los episodios aparecen después de ejercicio más intenso o diferente de lo habitual?',

        explanation:
          'Considerá también hidratación, alimentación, temperatura y descanso antes del ejercicio.',
      },
    ],
  },
];

export const TRIGGER_EDUCATION_PRINCIPLES = [
  'Un factor aislado no demuestra que haya causado una crisis.',

  'Los desencadenantes pueden actuar en combinación y variar entre episodios.',

  'Algunas señales premonitorias pueden confundirse con desencadenantes.',

  'No es necesario evitar de forma preventiva todo lo que aparece en esta guía.',

  'Los patrones se vuelven más confiables cuando se repiten en varios registros.',
] as const;