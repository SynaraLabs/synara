import type {
  AnatomicalPainMap,
  BodySide,
  CrisisPhase,
  CrisisSymptom,
  PainIntensity,
  PainLocationPoint,
} from '../types/migraine.types';

import {
  bodySideLabels,
  formatPainLocationPoint,
  painRegionCatalogById,
} from '../data/painLocationCatalog';

import {
  CRISIS_SYMPTOM_LABELS,
} from '../data/crisisSymptomCatalog';

export type CrisisEvolutionType =
  | 'intensity'
  | 'location'
  | 'symptom';

export type CrisisSymptomAction =
  | 'added'
  | 'removed';

export interface CrisisEvolutionRecord {
  id: string;

  timestamp: string;

  type: CrisisEvolutionType;

  intensity?: PainIntensity;

  locations?: string[];

  symptom?: CrisisSymptom;

  symptomLabel?: string;

  symptomAction?:
    CrisisSymptomAction;

  activeSymptoms?:
    CrisisSymptom[];
}

const BODY_SIDES:
  readonly BodySide[] =
  Object.keys(
    bodySideLabels,
  ) as BodySide[];

const CRISIS_SYMPTOMS =
  Object.keys(
    CRISIS_SYMPTOM_LABELS,
  ) as CrisisSymptom[];

const isRecord = (
  value: unknown,
): value is Record<
  string,
  unknown
> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isValidTimestamp = (
  value: unknown,
): value is string => {
  return (
    typeof value === 'string' &&
    !Number.isNaN(
      new Date(value).getTime(),
    )
  );
};

const isPainIntensity = (
  value: unknown,
): value is PainIntensity => {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  );
};

const isBodySide = (
  value: unknown,
): value is BodySide => {
  return (
    typeof value === 'string' &&
    BODY_SIDES.includes(
      value as BodySide,
    )
  );
};

const isCrisisSymptom = (
  value: unknown,
): value is CrisisSymptom => {
  return (
    typeof value === 'string' &&
    CRISIS_SYMPTOMS.includes(
      value as CrisisSymptom,
    )
  );
};

const isSymptomAction = (
  value: unknown,
): value is CrisisSymptomAction => {
  return (
    value === 'added' ||
    value === 'removed'
  );
};

const isPainLocationPoint = (
  value: unknown,
): value is PainLocationPoint => {
  if (!isRecord(value)) {
    return false;
  }

  const region = value.region;

  if (
    typeof region !== 'string' ||
    !(region in painRegionCatalogById)
  ) {
    return false;
  }

  return (
    value.side === undefined ||
    isBodySide(value.side)
  );
};

const getUniqueLocationLabels = (
  points: PainLocationPoint[],
): string[] => {
  return Array.from(
    new Set(
      points.map(
        formatPainLocationPoint,
      ),
    ),
  );
};

const getLocationLabels = (
  value: unknown,
): string[] => {
  if (!isRecord(value)) {
    return [];
  }

  const parts: string[] = [];

  let originLabel:
    string | undefined;

  let primaryLabel:
    string | undefined;

  if (
    isPainLocationPoint(
      value.origin,
    )
  ) {
    originLabel =
      formatPainLocationPoint(
        value.origin,
      );

    parts.push(
      `Inicio: ${originLabel}`,
    );
  }

  if (
    isPainLocationPoint(
      value.primary,
    )
  ) {
    primaryLabel =
      formatPainLocationPoint(
        value.primary,
      );

    parts.push(
      `Principal: ${primaryLabel}`,
    );
  }

  const additionalPoints =
    Array.isArray(value.additional)
      ? value.additional.filter(
          isPainLocationPoint,
        )
      : [];

  const additionalLabels =
    getUniqueLocationLabels(
      additionalPoints,
    ).filter(
      label =>
        label !== originLabel &&
        label !== primaryLabel,
    );

  if (additionalLabels.length > 0) {
    parts.push(
      `Adicionales: ${additionalLabels.join(
        ', ',
      )}`,
    );
  }

  if (parts.length === 0) {
    return [];
  }

  return [parts.join(' · ')];
};

const getSymptoms = (
  value: unknown,
): CrisisSymptom[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    isCrisisSymptom,
  );
};

const hasEquivalentRecord = (
  records:
    CrisisEvolutionRecord[],
  candidate:
    CrisisEvolutionRecord,
): boolean => {
  return records.some(
    record =>
      record.type ===
        candidate.type &&
      record.timestamp ===
        candidate.timestamp &&
      record.intensity ===
        candidate.intensity,
  );
};

const getEventRecords = (
  crisis: CrisisPhase,
): CrisisEvolutionRecord[] => {
  const records:
    CrisisEvolutionRecord[] = [];

  for (
    const event
    of crisis.events ?? []
  ) {
    if (
      !isValidTimestamp(
        event.timestamp,
      )
    ) {
      continue;
    }

    if (
      event.type === 'intensity'
    ) {
      const intensity =
        event.data.intensity;

      if (
        !isPainIntensity(
          intensity,
        )
      ) {
        continue;
      }

      records.push({
        id: event.id,
        timestamp: event.timestamp,
        type: 'intensity',
        intensity,
      });

      continue;
    }

    if (
      event.type === 'location'
    ) {
      const locations =
        getLocationLabels(
          event.data
            .anatomicalLocation,
        );

      if (locations.length === 0) {
        continue;
      }

      records.push({
        id: event.id,
        timestamp: event.timestamp,
        type: 'location',
        locations,
      });

      continue;
    }

    if (
      event.type === 'symptom'
    ) {
      const symptom =
        event.data.symptom;

      const action =
        event.data.action;

      if (
        !isCrisisSymptom(
          symptom,
        ) ||
        !isSymptomAction(action)
      ) {
        continue;
      }

      records.push({
        id: event.id,
        timestamp: event.timestamp,
        type: 'symptom',
        symptom,
        symptomLabel:
          CRISIS_SYMPTOM_LABELS[
            symptom
          ],
        symptomAction: action,
        activeSymptoms:
          getSymptoms(
            event.data.symptoms,
          ),
      });
    }
  }

  return records;
};

const addLegacyIntensityRecords = (
  crisis: CrisisPhase,
  records:
    CrisisEvolutionRecord[],
): void => {
  for (
    const [index, painRecord]
    of (
      crisis.intensityHistory ?? []
    ).entries()
  ) {
    if (
      !isValidTimestamp(
        painRecord.time,
      ) ||
      !isPainIntensity(
        painRecord.intensity,
      )
    ) {
      continue;
    }

    const candidate:
      CrisisEvolutionRecord = {
      id:
        painRecord.id ??
        `legacy-intensity-${index}-${painRecord.time}`,
      timestamp: painRecord.time,
      type: 'intensity',
      intensity:
        painRecord.intensity,
    };

    if (
      !hasEquivalentRecord(
        records,
        candidate,
      )
    ) {
      records.push(candidate);
    }
  }
};

const addLegacyLocationRecords = (
  crisis: CrisisPhase,
  records:
    CrisisEvolutionRecord[],
): void => {
  for (
    const [index, snapshot]
    of (
      crisis.locationHistory ?? []
    ).entries()
  ) {
    const timestamp =
      snapshot.occurredAt.value;

    if (
      !isValidTimestamp(timestamp)
    ) {
      continue;
    }

    const anatomicalMap:
      AnatomicalPainMap | undefined =
      snapshot.location
        .anatomicalMap;

    const locations =
      getLocationLabels(
        anatomicalMap,
      );

    if (locations.length === 0) {
      continue;
    }

    const alreadyExists =
      records.some(
        record =>
          record.type ===
            'location' &&
          record.timestamp ===
            timestamp,
      );

    if (alreadyExists) {
      continue;
    }

    records.push({
      id:
        snapshot.id ??
        `legacy-location-${index}-${timestamp}`,
      timestamp,
      type: 'location',
      locations,
    });
  }
};

export const getCrisisEvolution = (
  crisis: CrisisPhase,
): CrisisEvolutionRecord[] => {
  const records =
    getEventRecords(crisis);

  addLegacyIntensityRecords(
    crisis,
    records,
  );

  addLegacyLocationRecords(
    crisis,
    records,
  );

  return records.sort(
    (first, second) =>
      new Date(
        first.timestamp,
      ).getTime() -
      new Date(
        second.timestamp,
      ).getTime(),
  );
};