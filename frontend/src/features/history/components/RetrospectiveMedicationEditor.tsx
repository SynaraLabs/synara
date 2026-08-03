import type {
  MigraineEpisode,
  MigraineEvent,
} from '../../migraine/types/migraine.types';

import {
  MedicationCard,
  type CrisisMedicationRecord,
} from '../../migraine/components/crisis-mode/MedicationCard';

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

const getMedicationRecords = (
  episode: MigraineEpisode,
): CrisisMedicationRecord[] => {
  return (
    episode.crisis.events ?? []
  ).flatMap(event => {
    if (
      event.type !==
      'medication'
    ) {
      return [];
    }

    const medication =
      getStringValue(
        event.data.medication,
      );

    const takenAt =
      getStringValue(
        event.data.takenAt,
      ) ??
      getStringValue(
        event.timestamp,
      );

    if (
      !medication ||
      !takenAt
    ) {
      return [];
    }

    const record:
      CrisisMedicationRecord = {
      id: event.id,
      medication,
      takenAt,
    };

    const dose =
      getStringValue(
        event.data.dose,
      );

    const notes =
      getStringValue(
        event.data.notes,
      );

    if (dose) {
      record.dose = dose;
    }

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

const generateEventId = (): string => {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID();
  }

  return [
    'medication',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2),
  ].join('-');
};

export function RetrospectiveMedicationEditor({
  episode,
  onChange,
}: Props) {
  const records =
    getMedicationRecords(
      episode,
    );

  const handleRegister = (
    medication: string,
    dose: string,
    takenAt: string,
    notes: string,
  ) => {
    const normalizedMedication =
      medication.trim();

    const normalizedTakenAt =
      normalizeLocalDateTime(
        takenAt,
      );

    if (
      !normalizedMedication ||
      !normalizedTakenAt
    ) {
      return;
    }

    const event:
      MigraineEvent = {
      id: generateEventId(),

      type: 'medication',

      timestamp:
        normalizedTakenAt,

      data: {
        medication:
          normalizedMedication,

        dose:
          dose.trim(),

        takenAt:
          normalizedTakenAt,

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
    <MedicationCard
      records={records}
      onRegister={
        handleRegister
      }
    />
  );
}