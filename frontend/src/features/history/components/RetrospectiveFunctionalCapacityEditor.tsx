import type {
  MigraineEpisode,
  MigraineEvent,
} from '../../migraine/types/migraine.types';

import {
  FunctionalCapacityCard,
  type AffectedActivity,
  type FunctionalCapacityLevel,
  type FunctionalCapacityRecord,
} from '../../migraine/components/crisis-mode/FunctionalCapacityCard';

interface Props {
  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

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
  value: unknown,
): string | undefined => {
  return typeof value === 'string' &&
    value.trim()
    ? value.trim()
    : undefined;
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

const getAffectedActivities = (
  value: unknown,
): AffectedActivity[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    isAffectedActivity,
  );
};

const getFunctionalCapacityRecords = (
  episode: MigraineEpisode,
): FunctionalCapacityRecord[] => {
  return (
    episode.crisis.events ?? []
  ).flatMap(event => {
    if (
      event.type !== 'note' ||
      event.data.kind !==
        'functionalCapacity'
    ) {
      return [];
    }

    const level =
      event.data.level;

    const occurredAt =
      getStringValue(
        event.data.occurredAt,
      ) ??
      getStringValue(
        event.timestamp,
      );

    if (
      !isFunctionalCapacityLevel(
        level,
      ) ||
      !occurredAt
    ) {
      return [];
    }

    const record:
      FunctionalCapacityRecord = {
      id: event.id,

      level,

      affectedActivities:
        getAffectedActivities(
          event.data
            .affectedActivities,
        ),

      occurredAt,
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
      'functional-capacity',
      Date.now(),
      Math.random()
        .toString(16)
        .slice(2),
    ].join('-');
  };

export function RetrospectiveFunctionalCapacityEditor({
  episode,
  onChange,
}: Props) {
  const records =
    getFunctionalCapacityRecords(
      episode,
    );

  const handleRegister = (
    level:
      FunctionalCapacityLevel,
    affectedActivities:
      AffectedActivity[],
    occurredAt: string,
    notes: string,
  ) => {
    const normalizedOccurredAt =
      normalizeLocalDateTime(
        occurredAt,
      );

    if (!normalizedOccurredAt) {
      return;
    }

    const event:
      MigraineEvent = {
      id: generateEventId(),

      type: 'note',

      timestamp:
        normalizedOccurredAt,

      data: {
        kind:
          'functionalCapacity',

        level,

        affectedActivities: [
          ...affectedActivities,
        ],

        occurredAt:
          normalizedOccurredAt,

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

        unableToFunction:
          level === 'unable',

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
    <FunctionalCapacityCard
      records={records}
      onRegister={
        handleRegister
      }
    />
  );
}