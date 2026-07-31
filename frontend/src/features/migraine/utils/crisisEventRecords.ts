import type {
  CrisisPhase,
} from '../types/migraine.types';

import {
  NON_PHARMACOLOGICAL_MEASURE_CATALOG,
  type NonPharmacologicalMeasure,
} from '../data/nonPharmacologicalMeasureCatalog';

import type {
  CrisisMedicationRecord,
} from '../components/crisis-mode/MedicationCard';

import type {
  NonPharmacologicalRecord,
} from '../components/crisis-mode/NonPharmacologicalCard';

import type {
  AffectedActivity,
  FunctionalCapacityLevel,
  FunctionalCapacityRecord,
} from '../components/crisis-mode/FunctionalCapacityCard';

const FUNCTIONAL_CAPACITY_LEVELS:
  readonly FunctionalCapacityLevel[] = [
  'normal',
  'limited',
  'veryLimited',
  'unable',
];

const AFFECTED_ACTIVITIES:
  readonly AffectedActivity[] = [
  'personalCare',
  'walking',
  'eatingDrinking',
  'communicating',
  'usingScreens',
  'workingStudying',
  'householdTasks',
  'driving',
];

const getStringValue = (
  data: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = data[key];

  if (
    typeof value !== 'string'
  ) {
    return undefined;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue ||
    undefined;
};

const isNonPharmacologicalMeasure = (
  value: unknown,
): value is NonPharmacologicalMeasure => {
  return (
    typeof value === 'string' &&
    NON_PHARMACOLOGICAL_MEASURE_CATALOG.some(
      definition =>
        definition.value === value,
    )
  );
};

const isFunctionalCapacityLevel = (
  value: unknown,
): value is FunctionalCapacityLevel => {
  return (
    typeof value === 'string' &&
    FUNCTIONAL_CAPACITY_LEVELS.includes(
      value as FunctionalCapacityLevel,
    )
  );
};

const isAffectedActivity = (
  value: unknown,
): value is AffectedActivity => {
  return (
    typeof value === 'string' &&
    AFFECTED_ACTIVITIES.includes(
      value as AffectedActivity,
    )
  );
};

const sortByDate = <
  TRecord,
>(
  records: TRecord[],
  getDate: (
    record: TRecord,
  ) => string,
): TRecord[] => {
  return records.sort(
    (first, second) =>
      new Date(
        getDate(first),
      ).getTime() -
      new Date(
        getDate(second),
      ).getTime(),
  );
};

export const getMedicationRecords = (
  crisis: CrisisPhase,
): CrisisMedicationRecord[] => {
  const records:
    CrisisMedicationRecord[] = [];

  for (
    const event
    of crisis.events ?? []
  ) {
    if (
      event.type !== 'medication'
    ) {
      continue;
    }

    const medication =
      getStringValue(
        event.data,
        'medication',
      );

    if (!medication) {
      continue;
    }

    records.push({
      id: event.id,

      medication,

      dose:
        getStringValue(
          event.data,
          'dose',
        ),

      takenAt:
        getStringValue(
          event.data,
          'takenAt',
        ) ??
        event.timestamp,

      notes:
        getStringValue(
          event.data,
          'notes',
        ),
    });
  }

  return sortByDate(
    records,
    record =>
      record.takenAt,
  );
};

export const getNonPharmacologicalRecords =
  (
    crisis: CrisisPhase,
  ): NonPharmacologicalRecord[] => {
    const records:
      NonPharmacologicalRecord[] = [];

    for (
      const event
      of crisis.events ?? []
    ) {
      if (
        event.type !== 'note' ||
        event.data.kind !==
          'nonPharmacological'
      ) {
        continue;
      }

      const rawMeasures =
        event.data.measures;

      if (
        !Array.isArray(
          rawMeasures,
        )
      ) {
        continue;
      }

      const measures =
        rawMeasures.filter(
          isNonPharmacologicalMeasure,
        );

      if (
        measures.length === 0
      ) {
        continue;
      }

      records.push({
        id: event.id,

        measures,

        appliedAt:
          getStringValue(
            event.data,
            'appliedAt',
          ) ??
          event.timestamp,

        notes:
          getStringValue(
            event.data,
            'notes',
          ),
      });
    }

    return sortByDate(
      records,
      record =>
        record.appliedAt,
    );
  };

export const getFunctionalCapacityRecords =
  (
    crisis: CrisisPhase,
  ): FunctionalCapacityRecord[] => {
    const records:
      FunctionalCapacityRecord[] = [];

    for (
      const event
      of crisis.events ?? []
    ) {
      if (
        event.type !== 'note' ||
        event.data.kind !==
          'functionalCapacity'
      ) {
        continue;
      }

      const level =
        event.data.level;

      if (
        !isFunctionalCapacityLevel(
          level,
        )
      ) {
        continue;
      }

      const rawActivities =
        event.data
          .affectedActivities;

      const affectedActivities =
        Array.isArray(
          rawActivities,
        )
          ? rawActivities.filter(
              isAffectedActivity,
            )
          : [];

      records.push({
        id: event.id,

        level,

        affectedActivities,

        occurredAt:
          getStringValue(
            event.data,
            'occurredAt',
          ) ??
          event.timestamp,

        notes:
          getStringValue(
            event.data,
            'notes',
          ),
      });
    }

    return sortByDate(
      records,
      record =>
        record.occurredAt,
    );
  };