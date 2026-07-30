import type {
  AuraClinicalSymptom,
  AuraPhase,
  AuraTiming,
  AuraType,
  AuraUpdateData,
  BodySide,
  ClinicalSymptomCategory,
  LanguageAura,
  MotorAura,
  PhaseTime,
  RecordMode,
  SensoryAura,
  SymptomDefinition,
  SymptomSelection,
  TimePrecision,
  VestibularAura,
  VisualAura,
} from '../types/migraine.types';

import {
  getSymptomDefinition,
  getSymptomsForPhase,
} from '../data/clinicalSymptomCatalog';


export interface SelectOption<
  T extends string,
> {
  value: T;

  label: string;
}


export interface AuraLegacyFields {
  visualSymptoms:
    VisualAura[];

  sensorySymptoms:
    SensoryAura[];

  languageSymptoms:
    LanguageAura[];

  motorSymptoms:
    MotorAura[];

  vestibularSymptoms:
    VestibularAura[];
}


export const AURA_CATEGORY_ORDER:
  ClinicalSymptomCategory[] = [
  'visual',
  'sensory',
  'language',
  'motor',
  'vestibular',
  'cognitive',
  'general',
  'other',
];


export const AURA_TIMING_OPTIONS:
  ReadonlyArray<
    SelectOption<AuraTiming>
  > = [
  {
    value: 'beforePain',

    label:
      'Antes de que comenzara el dolor',
  },

  {
    value: 'duringPain',

    label:
      'Durante el dolor',
  },

  {
    value: 'overlappingPain',

    label:
      'Comenzó antes y continuó durante el dolor',
  },

  {
    value: 'afterPain',

    label:
      'Después de que terminó el dolor',
  },

  {
    value: 'withoutPain',

    label:
      'Ocurrió sin dolor de cabeza',
  },

  {
    value: 'unknown',

    label:
      'No recuerdo la relación con el dolor',
  },
];


export const AURA_SIDE_OPTIONS:
  ReadonlyArray<
    SelectOption<BodySide>
  > = [
  {
    value: 'left',

    label:
      'Lado izquierdo',
  },

  {
    value: 'right',

    label:
      'Lado derecho',
  },

  {
    value: 'bilateral',

    label:
      'Ambos lados',
  },

  {
    value: 'alternating',

    label:
      'Fue cambiando de lado',
  },

  {
    value: 'central',

    label:
      'Zona central',
  },

  {
    value: 'unknown',

    label:
      'No lo recuerdo',
  },
];


export const AURA_TYPE_LABELS:
  Record<AuraType, string> = {
  visual:
    'Visual',

  sensory:
    'Sensitiva',

  language:
    'Lenguaje',

  motor:
    'Motora',

  vestibular:
    'Vestibular',
};


const LEGACY_VISUAL_SYMPTOMS:
  readonly VisualAura[] = [
  'flashes',
  'zigzagLines',
  'blindSpots',
  'blurredVision',
  'tunnelVision',
  'visualSpots',
  'visualDistortion',
  'partialVisionLoss',
  'focusDifficulty',
  'objectsAppearLarger',
  'objectsAppearSmaller',
];


const LEGACY_SENSORY_SYMPTOMS:
  readonly SensoryAura[] = [
  'tingling',
  'numbness',
  'electricSensation',
  'reducedSensation',
  'spreadingParesthesia',
];


const LEGACY_LANGUAGE_SYMPTOMS:
  readonly LanguageAura[] = [
  'wordFindingDifficulty',
  'speechDifficulty',
  'languageUnderstandingDifficulty',
  'incorrectWords',
  'readingDifficulty',
  'writingDifficulty',
];


const LEGACY_MOTOR_SYMPTOMS:
  readonly MotorAura[] = [
  'handWeakness',
  'armWeakness',
  'facialWeakness',
  'coordinationDifficulty',
  'walkingDifficulty',
];


const LEGACY_VESTIBULAR_SYMPTOMS:
  readonly VestibularAura[] = [
  'vertigo',
  'imbalance',
  'tinnitus',
  'doubleVision',
  'coordinationDifficulty',
  'faintFeeling',
];


const visualSymptomSet =
  new Set<string>(
    LEGACY_VISUAL_SYMPTOMS,
  );


const sensorySymptomSet =
  new Set<string>(
    LEGACY_SENSORY_SYMPTOMS,
  );


const languageSymptomSet =
  new Set<string>(
    LEGACY_LANGUAGE_SYMPTOMS,
  );


const motorSymptomSet =
  new Set<string>(
    LEGACY_MOTOR_SYMPTOMS,
  );


const vestibularSymptomSet =
  new Set<string>(
    LEGACY_VESTIBULAR_SYMPTOMS,
  );


export const AURA_CATALOG:
  SymptomDefinition<
    AuraClinicalSymptom
  >[] =
  getSymptomsForPhase(
    'aura',
  ).map(definition => ({
    ...definition,

    value:
      definition.value as
        AuraClinicalSymptom,
  }));


export function generateAuraRecordId():
  string {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}


function padNumber(
  value: number,
): string {
  return String(value).padStart(
    2,
    '0',
  );
}


export function toLocalDateTimeValue(
  isoDate?: string,
): string {
  if (!isoDate) {
    return '';
  }

  const date =
    new Date(isoDate);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const localDate =
    `${date.getFullYear()}-` +
    `${padNumber(
      date.getMonth() + 1,
    )}-` +
    `${padNumber(
      date.getDate(),
    )}`;

  const localTime =
    `${padNumber(
      date.getHours(),
    )}:` +
    `${padNumber(
      date.getMinutes(),
    )}`;

  return `${localDate}T${localTime}`;
}


export function getCurrentLocalDateTimeValue():
  string {
  return toLocalDateTimeValue(
    new Date().toISOString(),
  );
}


export function parseLocalDateTime(
  value: string,
): Date | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  ] = match;

  const year =
    Number(yearValue);

  const month =
    Number(monthValue);

  const day =
    Number(dayValue);

  const hour =
    Number(hourValue);

  const minute =
    Number(minuteValue);

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  );

  const isValid =
    !Number.isNaN(
      date.getTime(),
    ) &&
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() ===
      day &&
    date.getHours() ===
      hour &&
    date.getMinutes() ===
      minute;

  return isValid
    ? date
    : undefined;
}


export function isValidAuraDate(
  value?: string,
): value is string {
  return Boolean(
    value &&
      !Number.isNaN(
        new Date(value).getTime(),
      ),
  );
}


export function buildAuraPhaseTime(
  value: string,

  precision:
    TimePrecision,

  recordMode:
    RecordMode,
): PhaseTime {
  return {
    value,
    precision,
    recordMode,
  };
}


export function inferAuraRecordMode(
  occurredAt: string,
): RecordMode {
  const difference =
    Math.abs(
      Date.now() -
        new Date(
          occurredAt,
        ).getTime(),
    );

  return difference <= 60_000
    ? 'realTime'
    : 'retrospective';
}


export function getEarlierAuraDate(
  first?: string,

  second?: string,
): string | undefined {
  if (
    !isValidAuraDate(first)
  ) {
    return isValidAuraDate(
      second,
    )
      ? second
      : undefined;
  }

  if (
    !isValidAuraDate(second)
  ) {
    return first;
  }

  return (
    new Date(first).getTime() <=
    new Date(second).getTime()
      ? first
      : second
  );
}


export function calculateAuraDurationMinutes(
  startTime?: string,

  endTime?: string,
): number | undefined {
  if (
    !isValidAuraDate(
      startTime,
    ) ||
    !isValidAuraDate(
      endTime,
    )
  ) {
    return undefined;
  }

  const difference =
    new Date(
      endTime,
    ).getTime() -
    new Date(
      startTime,
    ).getTime();

  return difference < 0
    ? undefined
    : Math.round(
        difference / 60_000,
      );
}


export function formatAuraDateTime(
  value?: string,

  precision?:
    TimePrecision,
): string {
  if (
    !isValidAuraDate(value)
  ) {
    return 'Sin registrar';
  }

  const date =
    new Date(value);

  if (
    precision ===
      'dateOnly' ||
    precision ===
      'unknown'
  ) {
    return date.toLocaleDateString(
      'es-AR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}


export function normalizeAuraSearch(
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


function isVisualAura(
  symptom:
    AuraClinicalSymptom,
): symptom is VisualAura {
  return visualSymptomSet.has(
    symptom,
  );
}


function isSensoryAura(
  symptom:
    AuraClinicalSymptom,
): symptom is SensoryAura {
  return sensorySymptomSet.has(
    symptom,
  );
}


function isLanguageAura(
  symptom:
    AuraClinicalSymptom,
): symptom is LanguageAura {
  return languageSymptomSet.has(
    symptom,
  );
}


function isMotorAura(
  symptom:
    AuraClinicalSymptom,
): symptom is MotorAura {
  return motorSymptomSet.has(
    symptom,
  );
}


function isVestibularAura(
  symptom:
    AuraClinicalSymptom,
): symptom is VestibularAura {
  return vestibularSymptomSet.has(
    symptom,
  );
}


export function buildAuraLegacyFields(
  symptoms:
    readonly AuraClinicalSymptom[],
): AuraLegacyFields {
  return {
    visualSymptoms:
      symptoms.filter(
        isVisualAura,
      ),

    sensorySymptoms:
      symptoms.filter(
        isSensoryAura,
      ),

    languageSymptoms:
      symptoms.filter(
        isLanguageAura,
      ),

    motorSymptoms:
      symptoms.filter(
        isMotorAura,
      ),

    vestibularSymptoms:
      symptoms.filter(
        isVestibularAura,
      ),
  };
}


function getLegacySymptoms(
  aura:
    AuraLegacyFields,
): AuraClinicalSymptom[] {
  return Array.from(
    new Set<AuraClinicalSymptom>([
      ...aura.visualSymptoms,
      ...aura.sensorySymptoms,
      ...aura.languageSymptoms,
      ...aura.motorSymptoms,
      ...aura.vestibularSymptoms,
    ]),
  );
}


export function getSelectedAuraSymptoms(
  aura: AuraPhase,
): AuraClinicalSymptom[] {
  if (
    aura.clinicalSymptoms &&
    aura.clinicalSymptoms
      .length > 0
  ) {
    return Array.from(
      new Set(
        aura.clinicalSymptoms.map(
          selection =>
            selection.symptom,
        ),
      ),
    );
  }

  return getLegacySymptoms({
    visualSymptoms:
      aura.visualSymptoms,

    sensorySymptoms:
      aura.sensorySymptoms,

    languageSymptoms:
      aura.languageSymptoms,

    motorSymptoms:
      aura.motorSymptoms ?? [],

    vestibularSymptoms:
      aura.vestibularSymptoms ??
      [],
  });
}


export function getAuraUpdateSymptoms(
  update: AuraUpdateData,
): AuraClinicalSymptom[] {
  if (
    update.clinicalSymptoms &&
    update.clinicalSymptoms
      .length > 0
  ) {
    return Array.from(
      new Set(
        update.clinicalSymptoms.map(
          selection =>
            selection.symptom,
        ),
      ),
    );
  }

  return getLegacySymptoms({
    visualSymptoms:
      update.visualSymptoms,

    sensorySymptoms:
      update.sensorySymptoms,

    languageSymptoms:
      update.languageSymptoms,

    motorSymptoms:
      update.motorSymptoms,

    vestibularSymptoms:
      update.vestibularSymptoms,
  });
}


export function createAuraClinicalSelections(
  symptoms:
    readonly AuraClinicalSymptom[],

  side:
    | BodySide
    | undefined,

  previousSelections?:
    readonly SymptomSelection<
      AuraClinicalSymptom
    >[],

  stillPresent = true,
): SymptomSelection<
  AuraClinicalSymptom
>[] {
  const previousBySymptom =
    new Map(
      (
        previousSelections ?? []
      ).map(selection => [
        selection.symptom,
        selection,
      ]),
    );

  return symptoms.map(
    symptom => ({
      ...previousBySymptom.get(
        symptom,
      ),

      symptom,

      side,

      stillPresent,
    }),
  );
}


function getAuraTypeFromCategory(
  category:
    ClinicalSymptomCategory,
): AuraType | undefined {
  if (
    category === 'visual' ||
    category === 'sensory' ||
    category === 'language' ||
    category === 'motor' ||
    category === 'vestibular'
  ) {
    return category;
  }

  return undefined;
}


export function getAuraTypes(
  symptoms:
    readonly AuraClinicalSymptom[],

  previousTypes:
    readonly AuraType[],
): AuraType[] {
  const types =
    new Set<AuraType>();

  symptoms.forEach(
    symptom => {
      const definition =
        getSymptomDefinition(
          symptom,
        );

      const categoryType =
        definition
          ? getAuraTypeFromCategory(
              definition.category,
            )
          : undefined;

      if (categoryType) {
        types.add(
          categoryType,
        );
      }

      if (
        isVisualAura(
          symptom,
        )
      ) {
        types.add('visual');
      }

      if (
        isSensoryAura(
          symptom,
        )
      ) {
        types.add('sensory');
      }

      if (
        isLanguageAura(
          symptom,
        )
      ) {
        types.add('language');
      }

      if (
        isMotorAura(
          symptom,
        )
      ) {
        types.add('motor');
      }

      if (
        isVestibularAura(
          symptom,
        )
      ) {
        types.add(
          'vestibular',
        );
      }
    },
  );

  if (types.size === 0) {
    previousTypes.forEach(
      type =>
        types.add(type),
    );
  }

  return Array.from(types);
}


export function getAuraSymptomLabel(
  symptom:
    AuraClinicalSymptom,
): string {
  return (
    getSymptomDefinition(
      symptom,
    )?.label ??
    symptom
  );
}