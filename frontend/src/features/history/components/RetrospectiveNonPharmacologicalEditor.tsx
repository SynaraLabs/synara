import type {
  MigraineEpisode,
  MigraineEvent,
} from '../../migraine/types/migraine.types';

import {
  NON_PHARMACOLOGICAL_MEASURE_CATALOG,
  type NonPharmacologicalMeasure,
} from '../../migraine/data/nonPharmacologicalMeasureCatalog';

import {
  NonPharmacologicalCard,
  type NonPharmacologicalRecord,
} from '../../migraine/components/crisis-mode/NonPharmacologicalCard';

interface Props {
  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

const getStringValue = (
  value: unknown,
): string | undefined => {
  return typeof value === 'string' &&
    value.trim()
    ? value.trim()
    : undefined;
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

const getMeasures = (
  value: unknown,
): NonPharmacologicalMeasure[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    isNonPharmacologicalMeasure,
  );
};

const getNonPharmacologicalRecords = (
  episode: MigraineEpisode,
): NonPharmacologicalRecord[] => {
  return (
    episode.crisis.events ?? []
  ).flatMap(event => {
    if (
      event.type !== 'note' ||
      event.data.kind !==
        'nonPharmacological'
    ) {
      return [];
    }

    const measures =
      getMeasures(
        event.data.measures,
      );

    const appliedAt =
      getStringValue(
        event.data.appliedAt,
      ) ??
      getStringValue(
        event.timestamp,
      );

    if (
      measures.length === 0 ||
      !appliedAt
    ) {
      return [];
    }

    const record:
      NonPharmacologicalRecord = {
      id: event.id,
      measures,
      appliedAt,
    };

    const notes =
      getStringValue(
        event.data.notes,
      );

    if (notes) {
      record.notes = notes;
    }

    return [record];
  });
};

const normalizeLocalDateTime = (
  value: string,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date.toISOString();
};

const generateEventId =
  (): string => {
    if (
      typeof crypto !==
        'undefined' &&
      typeof crypto.randomUUID ===
        'function'
    ) {
      return crypto.randomUUID();
    }

    return [
      'non-pharmacological',
      Date.now(),
      Math.random()
        .toString(16)
        .slice(2),
    ].join('-');
  };

export function RetrospectiveNonPharmacologicalEditor({
  episode,
  onChange,
}: Props) {
  const records =
    getNonPharmacologicalRecords(
      episode,
    );

  const handleRegister = (
    measures:
      NonPharmacologicalMeasure[],
    appliedAt: string,
    notes: string,
  ) => {
    const normalizedAppliedAt =
      normalizeLocalDateTime(
        appliedAt,
      );

    if (
      measures.length === 0 ||
      !normalizedAppliedAt
    ) {
      return;
    }

    const event:
      MigraineEvent = {
      id: generateEventId(),

      type: 'note',

      timestamp:
        normalizedAppliedAt,

      data: {
        kind:
          'nonPharmacological',

        measures: [
          ...measures,
        ],

        appliedAt:
          normalizedAppliedAt,

        recordedAt:
          new Date()
            .toISOString(),

        recordMode:
          'retrospective',

        notes:
          notes.trim(),
      },
    };

    onChange({
      ...episode,

      crisis: {
        ...episode.crisis,

        events: [
          ...(
            episode.crisis
              .events ?? []
          ),

          event,
        ],
      },
    });
  };

  return (
    <NonPharmacologicalCard
      records={records}
      onRegister={
        handleRegister
      }
    />
  );
}