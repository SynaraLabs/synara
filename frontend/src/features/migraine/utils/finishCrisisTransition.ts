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

  hadPostdrome: boolean;

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
    hadPostdrome,
    updatedAt,
  } = input;

  const crisisStart =
    getCrisisStart(episode);

  const crisisStartTime =
    crisisStart
      ? buildPhaseTime(
          crisisStart,
          episode.crisis.time?.start
            ?.precision ?? 'exact',
          episode.crisis.time?.start
            ?.recordMode ??
            episode.recordMode ??
            'realTime',
        )
      : episode.crisis.time?.start;

  const crisisEndTime =
    buildPhaseTime(
      endTime,
      precision,
      recordMode,
    );

  const postdromeStartTime =
    hadPostdrome
      ? buildPhaseTime(
          endTime,
          precision,
          recordMode,
        )
      : undefined;

  const timeline:
    MigraineTimeline = {
    ...(episode.timeline ?? {}),

    crisisEnd: endTime,

    postdromeStart:
      hadPostdrome
        ? endTime
        : undefined,

    postdromeEnd: undefined,

    crisis: {
      ...episode.timeline?.crisis,

      start: crisisStartTime,

      end: crisisEndTime,
    },

    postdrome:
      hadPostdrome
        ? {
            start:
              postdromeStartTime,

            end: undefined,
          }
        : undefined,
  };

  return {
    ...episode,

    updatedAt,

    /*
     * Se mantiene esta etapa para que
     * la pantalla pueda cerrar otras
     * fases abiertas antes de completar
     * definitivamente el episodio.
     */
    status: 'postdrome',

    completionReason:
      hadPostdrome
        ? undefined
        : 'crisisWithoutPostdrome',

    timeline,

    crisis: {
      ...episode.crisis,

      active: false,

      status: 'ended',

      endTime,

      durationMinutes:
        calculateDurationMinutes(
          crisisStart,
          endTime,
        ),

      time: {
        ...episode.crisis.time,

        start: crisisStartTime,

        end: crisisEndTime,
      },
    },

    postdrome: hadPostdrome
      ? {
          ...episode.postdrome,

          present: true,

          status: 'active',

          /*
           * El inicio del postdromo
           * coincide siempre con el
           * final de la crisis.
           */
          startTime: endTime,

          endTime: undefined,

          time: {
            ...episode.postdrome.time,

            start:
              postdromeStartTime,

            end: undefined,
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
        }
      : {
          ...episode.postdrome,

          present: false,

          status: 'notStarted',

          startTime: undefined,

          endTime: undefined,

          time: undefined,

          symptoms: [],

          updates: [],

          recoveryLevel:
            undefined,

          recoveryHours:
            undefined,

          notes: undefined,
        },
  };
}