import type {
  MigraineEpisode,
  MigraineTimeline,
  PhaseTime,
  RecordMode,
  TimePrecision,
} from '../types/migraine.types';

export interface FinishCrisisTransitionInput {
  endTime: string;

  precision: TimePrecision;

  recordMode: RecordMode;

  /*
   * Campo temporal de compatibilidad.
   * La transición ya no utiliza este
   * valor: el postdromo siempre inicia.
   */
  hadPostdrome?: boolean;

  updatedAt: string;
}

const isValidDate = (
  value?: string,
): value is string => {
  return Boolean(
    value &&
      !Number.isNaN(
        new Date(value).getTime(),
      ),
  );
};

const buildPhaseTime = (
  value: string,
  precision: TimePrecision,
  recordMode: RecordMode,
): PhaseTime => {
  return {
    value,
    precision,
    recordMode,
  };
};

const getCrisisStart = (
  episode: MigraineEpisode,
): string | undefined => {
  const candidates = [
    episode.timeline?.crisisStart,
    episode.crisis.startTime,
    episode.crisis.time?.start
      ?.value,
  ];

  return candidates.find(
    isValidDate,
  );
};

const calculateDurationMinutes = (
  startTime?: string,
  endTime?: string,
): number | undefined => {
  if (
    !isValidDate(startTime) ||
    !isValidDate(endTime)
  ) {
    return undefined;
  }

  const difference =
    new Date(endTime).getTime() -
    new Date(startTime).getTime();

  if (difference < 0) {
    return undefined;
  }

  return Math.round(
    difference / 60_000,
  );
};

export function applyFinishCrisisTransition(
  episode: MigraineEpisode,
  input: FinishCrisisTransitionInput,
): MigraineEpisode {
  const {
    endTime,
    precision,
    recordMode,
    updatedAt,
  } = input;

  const crisisStart =
    getCrisisStart(episode);

  const crisisStartTime =
    crisisStart
      ? buildPhaseTime(
          crisisStart,

          episode.crisis.time?.start
            ?.precision ??
            'exact',

          episode.crisis.time?.start
            ?.recordMode ??
            episode.recordMode ??
            'realTime',
        )
      : episode.crisis.time
          ?.start;

  const crisisEndTime =
    buildPhaseTime(
      endTime,
      precision,
      recordMode,
    );

  /*
   * El postdromo comienza siempre en
   * el mismo instante en que termina
   * la crisis.
   */
  const postdromeStartTime =
    buildPhaseTime(
      endTime,
      precision,
      recordMode,
    );

  const timeline:
    MigraineTimeline = {
    ...(episode.timeline ?? {}),

    crisisEnd:
      endTime,

    postdromeStart:
      endTime,

    postdromeEnd:
      undefined,

    crisis: {
      ...episode.timeline?.crisis,

      start:
        crisisStartTime,

      end:
        crisisEndTime,
    },

    postdrome: {
      start:
        postdromeStartTime,

      end:
        undefined,
    },
  };

  return {
    ...episode,

    updatedAt,

    status:
      'postdrome',

    completionReason:
      undefined,

    timeline,

    crisis: {
      ...episode.crisis,

      active:
        false,

      status:
        'ended',

      endTime,

      durationMinutes:
        calculateDurationMinutes(
          crisisStart,
          endTime,
        ),

      time: {
        ...episode.crisis.time,

        start:
          crisisStartTime,

        end:
          crisisEndTime,
      },
    },

    postdrome: {
      ...episode.postdrome,

      present:
        true,

      status:
        'active',

      startTime:
        endTime,

      endTime:
        undefined,

      time: {
        ...episode.postdrome.time,

        start:
          postdromeStartTime,

        end:
          undefined,
      },

      symptoms:
        episode.postdrome
          .symptoms ?? [],

      updates:
        episode.postdrome
          .updates ?? [],

      recoveryLevel:
        undefined,

      recoveryHours:
        undefined,
    },
  };
}