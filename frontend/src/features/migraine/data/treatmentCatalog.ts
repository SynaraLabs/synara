import type {
  TreatmentEffectiveness,
  TreatmentType,
} from '../types/migraine.types';

export interface TreatmentTypeDefinition {
  value: TreatmentType;

  label: string;

  requiresMedicationDetails?: boolean;
}

export interface TreatmentEffectivenessDefinition {
  value: TreatmentEffectiveness;

  label: string;
}

export const TREATMENT_TYPE_OPTIONS:
  readonly TreatmentTypeDefinition[] = [
  {
    value: 'medication',
    label: 'Medicación',
    requiresMedicationDetails: true,
  },
  {
    value: 'supplement',
    label: 'Suplemento',
    requiresMedicationDetails: true,
  },
  {
    value: 'hydration',
    label: 'Hidratación',
  },
  {
    value: 'rest',
    label: 'Reposo o sueño',
  },
  {
    value: 'darkRoom',
    label: 'Habitación oscura',
  },
  {
    value: 'cold',
    label: 'Aplicación de frío',
  },
  {
    value: 'heat',
    label: 'Aplicación de calor',
  },
  {
    value: 'stretching',
    label: 'Estiramientos',
  },
  {
    value: 'food',
    label: 'Alimentación',
  },
  {
    value: 'other',
    label: 'Otro tratamiento',
  },
];

export const TREATMENT_TYPE_LABELS:
  Record<
    TreatmentType,
    string
  > = TREATMENT_TYPE_OPTIONS.reduce(
  (
    labels,
    definition,
  ) => {
    labels[definition.value] =
      definition.label;

    return labels;
  },
  {} as Record<
    TreatmentType,
    string
  >,
);

export const TREATMENT_EFFECTIVENESS_OPTIONS:
  readonly TreatmentEffectivenessDefinition[] = [
  {
    value: 'none',
    label: 'No funcionó',
  },
  {
    value: 'low',
    label: 'Funcionó poco',
  },
  {
    value: 'medium',
    label: 'Funcionó moderadamente',
  },
  {
    value: 'high',
    label: 'Funcionó mucho',
  },
];

export const TREATMENT_EFFECTIVENESS_LABELS:
  Record<
    TreatmentEffectiveness,
    string
  > =
  TREATMENT_EFFECTIVENESS_OPTIONS.reduce(
    (
      labels,
      definition,
    ) => {
      labels[definition.value] =
        definition.label;

      return labels;
    },
    {} as Record<
      TreatmentEffectiveness,
      string
    >,
  );

export const treatmentRequiresMedicationDetails =
  (
    type?: TreatmentType,
  ): boolean => {
    if (!type) {
      return true;
    }

    return (
      TREATMENT_TYPE_OPTIONS.find(
        definition =>
          definition.value === type,
      )
        ?.requiresMedicationDetails ===
      true
    );
  };