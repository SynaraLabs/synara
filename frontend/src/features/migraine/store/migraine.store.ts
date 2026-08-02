import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AuraPhase,
  CrisisPhase,
  MigraineEpisode,
  MigraineEpisodeStatus,
  MigraineTimeline,
  MigraineTrigger,
  PhaseTime,
  PostdromePhase,
  PremonitoryPhase,
  RecordMode,
  TimePrecision,
  Treatment,
} from '../types/migraine.types';

import {
  applyFinishCrisisTransition,
} from '../utils/finishCrisisTransition';

export interface FinishCrisisInput {
  endTime: string;

  precision: TimePrecision;

  recordMode?: RecordMode;

  hadPostdrome: boolean;
}

export type PremonitoryResolution =
  | 'endedWithoutCrisis'
  | 'evolvedToAura'
  | 'evolvedToCrisis'
  | 'continuesWithAura'
  | 'continuesWithCrisis'
  | 'uncertain';

export interface ResolvePremonitoryInput {
  outcome: PremonitoryResolution;

  endTime?: string;

  precision?: TimePrecision;

  recordMode?: RecordMode;
}

interface MigraineStore {
  episode: MigraineEpisode;
  activeEpisode: MigraineEpisode | null;
  history: MigraineEpisode[];

  startEpisode: () => void;
  startCrisis: () => void;

  finishCrisis: (
    input?: FinishCrisisInput,
  ) => void;

  resolvePremonitory: (
    input: ResolvePremonitoryInput,
  ) => void;

  updatePremonitory: (
    premonitory: PremonitoryPhase,
  ) => void;

  updateAura: (
    aura: AuraPhase,
  ) => void;

  updateCrisis: (
    crisis: CrisisPhase,
  ) => void;

  updatePostdrome: (
    postdrome: PostdromePhase,
  ) => void;

  updateTriggers: (
    triggers: MigraineTrigger[],
  ) => void;

  updateTreatment: (
    treatment: Treatment,
  ) => void;

  updateNotes: (
    notes: string,
  ) => void;

  updateTimeline: (
    timeline: Partial<MigraineTimeline>,
  ) => void;

  updateStatus: (
    status: MigraineEpisodeStatus,
  ) => void;

  completeEpisode: () => void;
  clearHistory: () => void;
  resetEpisode: () => void;
}

const STORAGE_NAME =
  'synara-migraine-storage';

const STORAGE_VERSION = 8;

const generateId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const isValidDate = (
  value: unknown,
): value is string => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !Number.isNaN(
      new Date(value).getTime(),
    )
  );
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const addMinutes = (
  date: string,
  minutes: number,
): string => {
  const result = new Date(date);

  if (
    Number.isNaN(result.getTime())
  ) {
    return date;
  }

  result.setMinutes(
    result.getMinutes() + minutes,
  );

  return result.toISOString();
};

const subtractMinutes = (
  date: string,
  minutes: number,
): string => {
  return addMinutes(date, -minutes);
};

const getEarliestDate = (
  dates: Array<string | undefined>,
): string | undefined => {
  const validDates = dates.filter(
    isValidDate,
  );

  if (validDates.length === 0) {
    return undefined;
  }

  return validDates.reduce(
    (earliest, current) =>
      new Date(current).getTime() <
      new Date(earliest).getTime()
        ? current
        : earliest,
  );
};

const getLatestDate = (
  dates: Array<string | undefined>,
): string | undefined => {
  const validDates = dates.filter(
    isValidDate,
  );

  if (validDates.length === 0) {
    return undefined;
  }

  return validDates.reduce(
    (latest, current) =>
      new Date(current).getTime() >
      new Date(latest).getTime()
        ? current
        : latest,
  );
};

const calculateEpisodeStart = (
  timeline: MigraineTimeline,
): string | undefined => {
  return getEarliestDate([
    timeline.premonitoryStart,
    timeline.auraStart,
    timeline.crisisStart,
    timeline.postdromeStart,
  ]);
};

const calculatePremonitoryTimeline = (
  premonitory: PremonitoryPhase,
  timeline: MigraineTimeline,
): Partial<MigraineTimeline> => {
  if (!premonitory.present) {
    return {
      premonitoryStart: undefined,
      premonitoryEnd: undefined,
    };
  }

  const premonitoryStart =
    premonitory.time?.start?.value ??
    timeline.premonitoryStart;

  const storedPremonitoryEnd =
    premonitory.time?.end?.value;

  const isPremonitoryClosed =
    premonitory.status === 'ended' ||
    premonitory.status ===
      'uncertain' ||
    Boolean(storedPremonitoryEnd);

  /*
   * La fase premonitoria no puede
   * continuar después del inicio de la
   * crisis. Los síntomas que persistan
   * se registrarán dentro de crisis.
   */
  const premonitoryEnd =
    isPremonitoryClosed
      ? (
          storedPremonitoryEnd ??
          timeline.premonitoryEnd
        )
      : isValidDate(
            timeline.crisisStart,
          )
        ? timeline.crisisStart
        : undefined;

  return {
    premonitoryStart:
      isValidDate(premonitoryStart)
        ? premonitoryStart
        : undefined,

    premonitoryEnd:
      isValidDate(premonitoryEnd)
        ? premonitoryEnd
        : undefined,
  };
};

const calculateAuraTimeline = (
  aura: AuraPhase,
  timeline: MigraineTimeline,
): Partial<MigraineTimeline> => {
  const duration =
    aura.durationMinutes;

  if (!aura.present) {
    return {
      auraStart: undefined,
      auraEnd: undefined,
    };
  }

  if (
    timeline.auraStart ||
    timeline.auraEnd
  ) {
    return {
      auraStart: timeline.auraStart,
      auraEnd: timeline.auraEnd,
    };
  }

  if (
    !aura.timing ||
    !duration ||
    duration <= 0
  ) {
    return {};
  }

  if (
    aura.timing === 'beforePain' &&
    timeline.crisisStart
  ) {
    return {
      auraStart: subtractMinutes(
        timeline.crisisStart,
        duration,
      ),

      auraEnd:
        timeline.crisisStart,
    };
  }

  if (
    aura.timing === 'duringPain' &&
    timeline.crisisStart
  ) {
    return {
      auraStart:
        timeline.crisisStart,

      auraEnd: addMinutes(
        timeline.crisisStart,
        duration,
      ),
    };
  }

  if (
    aura.timing === 'afterPain' &&
    timeline.crisisEnd
  ) {
    return {
      auraStart:
        timeline.crisisEnd,

      auraEnd: addMinutes(
        timeline.crisisEnd,
        duration,
      ),
    };
  }

  return {};
};

const buildCalculatedTimeline = (
  episode: MigraineEpisode,
  baseTimeline: MigraineTimeline,
): MigraineTimeline => {
  const premonitoryTimeline =
    calculatePremonitoryTimeline(
      episode.premonitory,
      baseTimeline,
    );

  const timelineWithPremonitory:
    MigraineTimeline = {
    ...baseTimeline,
    ...premonitoryTimeline,
  };

  const auraTimeline =
    calculateAuraTimeline(
      episode.aura,
      timelineWithPremonitory,
    );

  const timeline: MigraineTimeline = {
    ...timelineWithPremonitory,
    ...auraTimeline,
  };

  timeline.episodeStart =
    calculateEpisodeStart(timeline);

  return timeline;
};

const createInitialEpisode =
  (): MigraineEpisode => ({
    schemaVersion: 6,

    id: generateId(),

    createdAt:
      new Date().toISOString(),

    status:
      'tracking' as MigraineEpisodeStatus,

    recordMode: 'realTime',

    timeline: {},

    premonitory: {
      present: false,
      symptoms: [],
      updates: [],
    },

    aura: {
      present: false,
      types: [],
      visualSymptoms: [],
      sensorySymptoms: [],
      languageSymptoms: [],
      motorSymptoms: [],
      vestibularSymptoms: [],
    },

    crisis: {
      active: false,
      startTime: '',
      intensity: 0,
      intensityHistory: [],
      events: [],
      location: [],
      quality: 'pressure',
      symptoms: [],
    },

    postdrome: {
      present: false,
      symptoms: [],
      updates: [],
    },

    triggers: [],

    treatment: {},
  });

const isLegacyEmptyPostdrome = (
  episode: Partial<MigraineEpisode>,
): boolean => {
  const postdrome =
    episode.postdrome;

  if (!postdrome?.present) {
    return false;
  }

  const hasMeaningfulData =
    (postdrome.symptoms?.length ??
      0) > 0 ||
    (postdrome.updates?.length ??
      0) > 0 ||
    postdrome.status === 'active' ||
    postdrome.status === 'ended' ||
    isValidDate(
      postdrome.startTime,
    ) ||
    isValidDate(
      postdrome.endTime,
    ) ||
    isValidDate(
      postdrome.time?.start?.value,
    ) ||
    isValidDate(
      postdrome.time?.end?.value,
    ) ||
    Boolean(
      postdrome.recoveryLevel,
    ) ||
    typeof postdrome.recoveryHours ===
      'number' ||
    Boolean(
      postdrome.notes?.trim(),
    );

  if (hasMeaningfulData) {
    return false;
  }

  const crisisEnd =
    episode.timeline?.crisisEnd ??
    episode.crisis?.endTime ??
    episode.crisis?.time?.end?.value;

  const postdromeStart =
    episode.timeline
      ?.postdromeStart;

  const hasNoPostdromeEnd =
    !isValidDate(
      episode.timeline
        ?.postdromeEnd,
    );

  if (
    !isValidDate(crisisEnd) ||
    !isValidDate(postdromeStart) ||
    !hasNoPostdromeEnd
  ) {
    return false;
  }

  const difference =
    Math.abs(
      new Date(
        postdromeStart,
      ).getTime() -
        new Date(
          crisisEnd,
        ).getTime(),
    );

  return difference <= 1_000;
};

const normalizeEpisode = (
  value: unknown,
): MigraineEpisode => {
  const initialEpisode =
    createInitialEpisode();

  if (!isRecord(value)) {
    return initialEpisode;
  }

  const persistedEpisode =
    value as Partial<MigraineEpisode>;

  const clearLegacyPostdrome =
    isLegacyEmptyPostdrome(
      persistedEpisode,
    );

  const persistedCreatedAt =
    persistedEpisode.createdAt;

  const createdAt = isValidDate(
    persistedCreatedAt,
  )
    ? persistedCreatedAt
    : initialEpisode.createdAt;

  const id =
    typeof persistedEpisode.id ===
      'string' &&
    persistedEpisode.id.length > 0
      ? persistedEpisode.id
      : initialEpisode.id;

  const normalizedTimeline:
    MigraineTimeline = {
    ...initialEpisode.timeline,
    ...(persistedEpisode.timeline ??
      {}),

    ...(clearLegacyPostdrome
      ? {
          postdromeStart:
            undefined,

          postdromeEnd:
            undefined,
        }
      : {}),
  };

  const normalizedCrisisStart =
    normalizedTimeline.crisisStart ??
    persistedEpisode.crisis
      ?.startTime ??
    persistedEpisode.crisis
      ?.time?.start?.value;

  const persistedPremonitory:
    PremonitoryPhase = {
    ...initialEpisode.premonitory,
    ...(persistedEpisode.premonitory ??
      {}),

    symptoms:
      persistedEpisode.premonitory
        ?.symptoms ?? [],

    updates:
      persistedEpisode.premonitory
        ?.updates ?? [],
  };

  const premonitoryAlreadyClosed =
    persistedPremonitory.status ===
      'ended' ||
    persistedPremonitory.status ===
      'uncertain' ||
    isValidDate(
      persistedPremonitory.time?.end
        ?.value,
    );

  const shouldClosePremonitoryAtCrisis =
    persistedPremonitory.present ===
      true &&
    !premonitoryAlreadyClosed &&
    isValidDate(
      normalizedCrisisStart,
    );

  const crisisStartPhaseTime =
    shouldClosePremonitoryAtCrisis
      ? buildPhaseTime(
          normalizedCrisisStart,
          persistedEpisode.crisis
            ?.time?.start
            ?.precision ?? 'exact',
          persistedEpisode.crisis
            ?.time?.start
            ?.recordMode ??
            persistedEpisode.recordMode ??
            'realTime',
        )
      : undefined;

  const normalizedPremonitory:
    PremonitoryPhase =
    shouldClosePremonitoryAtCrisis
      ? {
          ...persistedPremonitory,

          status: 'ended',
          evolvedToCrisis: true,
          endedWithoutCrisis: false,

          time: {
            ...persistedPremonitory.time,
            end: crisisStartPhaseTime,
          },
        }
      : persistedPremonitory;

  if (
    shouldClosePremonitoryAtCrisis
  ) {
    normalizedTimeline.crisisStart =
      normalizedCrisisStart;

    normalizedTimeline.premonitoryEnd =
      normalizedCrisisStart;

    normalizedTimeline.premonitory = {
      ...normalizedTimeline.premonitory,
      start:
        normalizedPremonitory.time
          ?.start,
      end: crisisStartPhaseTime,
    };
  }

  const normalizedPostdrome:
    PostdromePhase =
    clearLegacyPostdrome
      ? {
          ...initialEpisode.postdrome,
        }
      : {
          ...initialEpisode.postdrome,
          ...(persistedEpisode
            .postdrome ?? {}),

          symptoms:
            persistedEpisode
              .postdrome?.symptoms ??
            [],

          updates:
            persistedEpisode
              .postdrome?.updates ??
            [],
        };

  return {
    ...initialEpisode,
    ...persistedEpisode,

    schemaVersion: 6,

    id,
    createdAt,

    status:
      persistedEpisode.status ??
      initialEpisode.status,

    timeline:
      normalizedTimeline,

    premonitory:
      normalizedPremonitory,

    aura: {
      ...initialEpisode.aura,
      ...(persistedEpisode.aura ?? {}),

      types:
        persistedEpisode.aura?.types ??
        [],

      visualSymptoms:
        persistedEpisode.aura
          ?.visualSymptoms ?? [],

      sensorySymptoms:
        persistedEpisode.aura
          ?.sensorySymptoms ?? [],

      languageSymptoms:
        persistedEpisode.aura
          ?.languageSymptoms ?? [],

      motorSymptoms:
        persistedEpisode.aura
          ?.motorSymptoms ?? [],

      vestibularSymptoms:
        persistedEpisode.aura
          ?.vestibularSymptoms ?? [],
    },

    crisis: {
      ...initialEpisode.crisis,
      ...(persistedEpisode.crisis ?? {}),

      active:
        persistedEpisode.crisis
          ?.active === true,

      intensityHistory:
        persistedEpisode.crisis
          ?.intensityHistory ?? [],

      events:
        persistedEpisode.crisis
          ?.events ?? [],

      location:
        persistedEpisode.crisis
          ?.location ?? [],

      symptoms:
        persistedEpisode.crisis
          ?.symptoms ?? [],
    },

    postdrome:
      normalizedPostdrome,

    triggers:
      persistedEpisode.triggers ?? [],

    treatment: {
      ...initialEpisode.treatment,
      ...(persistedEpisode.treatment ??
        {}),
    },
  };
};

const normalizeHistory = (
  value: unknown,
): MigraineEpisode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeEpisode);
};

const isTerminalEpisode = (
  episode: MigraineEpisode,
): boolean => {
  return (
    episode.status === 'completed' ||
    episode.status === 'discarded' ||
    episode.status === 'incomplete'
  );
};

const hasRecoverableOpenPhase = (
  episode: MigraineEpisode,
): boolean => {
  const premonitoryOpen =
    episode.premonitory.present &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain';

  const auraOpen =
    episode.aura.present &&
    episode.aura.status !== 'ended' &&
    episode.aura.status !==
      'uncertain';

  const postdromeOpen =
    episode.postdrome.present &&
    episode.postdrome.status !==
      'ended' &&
    !episode.postdrome.endTime &&
    !episode.postdrome.time?.end
      ?.value;

  return (
    premonitoryOpen ||
    auraOpen ||
    episode.crisis.active ||
    postdromeOpen ||
    episode.status === 'crisis' ||
    episode.status === 'postdrome'
  );
};

const resolveActiveEpisode = (
  episode: MigraineEpisode,
  previousActiveEpisode:
    | MigraineEpisode
    | null,
): MigraineEpisode | null => {
  if (isTerminalEpisode(episode)) {
    return null;
  }

  if (episode.crisis.active) {
    return episode;
  }

  if (
    previousActiveEpisode?.id ===
    episode.id
  ) {
    return episode;
  }

  /*
   * Recupera fases activas aunque una
   * versión anterior haya persistido
   * activeEpisode como null.
   */
  if (
    hasRecoverableOpenPhase(episode)
  ) {
    return episode;
  }

  return null;
};

const synchronizeEpisode = (
  state: MigraineStore,
  episode: MigraineEpisode,
): Pick<
  MigraineStore,
  'episode' | 'activeEpisode'
> => {
  return {
    episode,

    activeEpisode:
      resolveActiveEpisode(
        episode,
        state.activeEpisode,
      ),
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

const getPremonitoryStart = (
  episode: MigraineEpisode,
): string | undefined => {
  const candidates = [
    episode.timeline
      ?.premonitoryStart,

    episode.premonitory.time
      ?.start?.value,

    episode.premonitory.updates?.[0]
      ?.occurredAt.value,
  ];

  return candidates.find(
    isValidDate,
  );
};

const inferRecordMode = (
  eventTime: string,
  requestedMode?: RecordMode,
): RecordMode => {
  if (requestedMode) {
    return requestedMode;
  }

  const eventTimestamp =
    new Date(eventTime).getTime();

  const difference =
    Math.abs(
      Date.now() - eventTimestamp,
    );

  return difference <= 60_000
    ? 'realTime'
    : 'retrospective';
};

const buildPhaseTime = (
  value: string | undefined,
  precision: TimePrecision,
  recordMode: RecordMode,
): PhaseTime => {
  return {
    value,
    precision,
    recordMode,
  };
};

const requiresPremonitoryEnd =
  (
    outcome: PremonitoryResolution,
  ): boolean => {
    return (
      outcome ===
        'endedWithoutCrisis' ||
      outcome ===
        'evolvedToAura' ||
      outcome ===
        'evolvedToCrisis' ||
      outcome === 'uncertain'
    );
  };

const evolvesToAura = (
  outcome: PremonitoryResolution,
): boolean => {
  return (
    outcome === 'evolvedToAura' ||
    outcome ===
      'continuesWithAura'
  );
};

const evolvesToCrisis = (
  outcome: PremonitoryResolution,
): boolean => {
  return (
    outcome ===
      'evolvedToCrisis' ||
    outcome ===
      'continuesWithCrisis'
  );
};

export const useMigraineStore =
  create<MigraineStore>()(
    persist(
      set => ({
        episode:
          createInitialEpisode(),

        activeEpisode: null,

        history: [],

        startEpisode: () =>
          set(() => {
            const episode =
              createInitialEpisode();

            return {
              episode,
              activeEpisode: episode,
            };
          }),

        startCrisis: () =>
          set(state => {
            const now =
              new Date().toISOString();

            const currentTimeline =
              state.episode.timeline ?? {};

            const crisisStart =
              currentTimeline.crisisStart ??
              (
                state.episode.crisis
                  .startTime || now
              );

            const premonitoryIsOpen =
              state.episode.premonitory
                .present &&
              state.episode.premonitory
                .status !== 'ended' &&
              state.episode.premonitory
                .status !==
                'uncertain' &&
              !state.episode.premonitory
                .time?.end;

            const baseTimeline:
              MigraineTimeline = {
              ...currentTimeline,

              crisisStart,

              crisisEnd: undefined,

              ...(premonitoryIsOpen
                ? {
                    premonitoryEnd:
                      crisisStart,

                    premonitory: {
                      ...currentTimeline
                        .premonitory,

                      start:
                        state.episode
                          .premonitory
                          .time?.start,

                      end:
                        buildPhaseTime(
                          crisisStart,
                          'exact',
                          state.episode
                            .recordMode ??
                            'realTime',
                        ),
                    },
                  }
                : {}),
            };

            const startRecordMode =
              state.episode.recordMode ??
              'realTime';

            const existingCrisisTime =
              state.episode.crisis.time;

            const premonitory =
              state.episode.premonitory
                .present
                ? {
                    ...state.episode
                      .premonitory,

                    status:
                      premonitoryIsOpen
                        ? 'ended' as const
                        : state.episode
                            .premonitory
                            .status,

                    evolvedToCrisis:
                      true,

                    endedWithoutCrisis:
                      false,

                    time:
                      premonitoryIsOpen
                        ? {
                            ...state
                              .episode
                              .premonitory
                              .time,

                            end:
                              buildPhaseTime(
                                crisisStart,
                                'exact',
                                startRecordMode,
                              ),
                          }
                        : state.episode
                            .premonitory
                            .time,
                  }
                : state.episode
                    .premonitory;

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,

              updatedAt: now,

              status:
                'crisis' as MigraineEpisodeStatus,

              premonitory,

              crisis: {
                ...state.episode.crisis,

                active: true,

                status: 'active',

                startTime:
                  state.episode.crisis
                    .startTime ||
                  crisisStart,

                endTime: undefined,

                time: {
                  ...existingCrisisTime,

                  start:
                    existingCrisisTime
                      ?.start ??
                    buildPhaseTime(
                      crisisStart,
                      'exact',
                      startRecordMode,
                    ),

                  end: undefined,
                },
              },
            };

            const timeline =
              buildCalculatedTimeline(
                episodeBeforeCalculation,
                baseTimeline,
              );

            const episode: MigraineEpisode = {
              ...episodeBeforeCalculation,
              timeline,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        finishCrisis: input =>
          set(state => {
            if (!input) {
              return state;
            }

            const {
              endTime,
              precision,
              hadPostdrome,
            } = input;

            if (
              !isValidDate(endTime)
            ) {
              return state;
            }

            const endTimestamp =
              new Date(
                endTime,
              ).getTime();

            if (
              endTimestamp >
              Date.now()
            ) {
              return state;
            }

            const crisisStart =
              getCrisisStart(
                state.episode,
              );

            if (
              crisisStart &&
              endTimestamp <
                new Date(
                  crisisStart,
                ).getTime()
            ) {
              return state;
            }

            const recordMode =
              inferRecordMode(
                endTime,
                input.recordMode,
              );

            const transitionedEpisode =
              applyFinishCrisisTransition(
                state.episode,
                {
                  endTime,
                  precision,
                  recordMode,
                  hadPostdrome,

                  updatedAt:
                    new Date()
                      .toISOString(),
                },
              );

            const timeline =
              buildCalculatedTimeline(
                transitionedEpisode,

                transitionedEpisode
                  .timeline ?? {},
              );

            const episode:
              MigraineEpisode = {
              ...transitionedEpisode,
              timeline,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        resolvePremonitory: input =>
          set(state => {
            const premonitory =
              state.episode.premonitory;

            if (!premonitory.present) {
              return state;
            }

            const now =
              new Date().toISOString();

            const {
              outcome,
            } = input;

            const shouldClose =
              requiresPremonitoryEnd(
                outcome,
              );

            const requestedPrecision =
              input.precision ??
              (
                input.endTime
                  ? 'exact'
                  : 'unknown'
              );

            const endTime =
              isValidDate(
                input.endTime,
              )
                ? input.endTime
                : undefined;

            if (
              shouldClose &&
              requestedPrecision !==
                'unknown' &&
              !endTime
            ) {
              return state;
            }

            if (
              endTime &&
              new Date(
                endTime,
              ).getTime() >
                Date.now()
            ) {
              return state;
            }

            const premonitoryStart =
              getPremonitoryStart(
                state.episode,
              );

            if (
              endTime &&
              premonitoryStart &&
              new Date(
                endTime,
              ).getTime() <
                new Date(
                  premonitoryStart,
                ).getTime()
            ) {
              return state;
            }

            const recordMode =
              input.recordMode ??
              (
                endTime
                  ? inferRecordMode(
                      endTime,
                    )
                  : 'retrospective'
              );

            const currentTimeline =
              state.episode.timeline ?? {};

            const startPhaseTime =
              premonitory.time?.start ??
              (
                premonitoryStart
                  ? buildPhaseTime(
                      premonitoryStart,
                      'exact',
                      state.episode
                        .recordMode ??
                        'realTime',
                    )
                  : undefined
              );

            const endPhaseTime =
              shouldClose
                ? buildPhaseTime(
                    endTime,
                    requestedPrecision,
                    recordMode,
                  )
                : undefined;

            const phaseStatus =
              outcome === 'uncertain'
                ? 'uncertain' as const
                : shouldClose
                  ? 'ended' as const
                  : 'active' as const;

            const updatedPremonitory:
              PremonitoryPhase = {
              ...premonitory,

              status: phaseStatus,

              evolvedToAura:
                evolvesToAura(
                  outcome,
                ),

              evolvedToCrisis:
                evolvesToCrisis(
                  outcome,
                ),

              endedWithoutCrisis:
                outcome ===
                'endedWithoutCrisis',

              time: {
                ...premonitory.time,

                start:
                  startPhaseTime,

                end:
                  endPhaseTime,
              },
            };

            const updatedTimeline:
              MigraineTimeline = {
              ...currentTimeline,

              premonitoryStart:
                premonitoryStart,

              premonitoryEnd:
                shouldClose &&
                endTime
                  ? endTime
                  : undefined,

              premonitory: {
                ...currentTimeline
                  .premonitory,

                start:
                  startPhaseTime,

                end:
                  endPhaseTime,
              },
            };

            updatedTimeline.episodeStart =
              calculateEpisodeStart(
                updatedTimeline,
              );

            if (
              outcome ===
              'endedWithoutCrisis'
            ) {
              const completed:
                MigraineEpisode = {
                ...state.episode,

                updatedAt: now,

                status:
                  'completed',

                completionReason:
                  'phaseEndedWithoutCrisis',

                premonitory:
                  updatedPremonitory,

                timeline: {
                  ...updatedTimeline,

                  ...(endTime
                    ? {
                        episodeEnd:
                          endTime,
                      }
                    : {}),
                },
              };

              return {
                history: [
                  ...state.history,
                  completed,
                ],

                episode:
                  createInitialEpisode(),

                activeEpisode: null,
              };
            }

            if (
              outcome === 'uncertain'
            ) {
              const incomplete:
                MigraineEpisode = {
                ...state.episode,

                updatedAt: now,

                status:
                  'incomplete',

                completionReason:
                  'other',

                premonitory:
                  updatedPremonitory,

                timeline: {
                  ...updatedTimeline,

                  ...(endTime
                    ? {
                        episodeEnd:
                          endTime,
                      }
                    : {}),
                },
              };

              return {
                history: [
                  ...state.history,
                  incomplete,
                ],

                episode:
                  createInitialEpisode(),

                activeEpisode: null,
              };
            }

            const nextStatus:
              MigraineEpisodeStatus =
              state.episode.crisis.active
                ? 'crisis'
                : state.episode.status;

            const episode:
              MigraineEpisode = {
              ...state.episode,

              updatedAt: now,

              status: nextStatus,

              premonitory:
                updatedPremonitory,

              timeline:
                updatedTimeline,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updatePremonitory: premonitory =>
          set(state => {
            const currentTimeline =
              state.episode.timeline ?? {};

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              premonitory,
            };

            const timeline =
              buildCalculatedTimeline(
                episodeBeforeCalculation,
                currentTimeline,
              );

            const episode: MigraineEpisode = {
              ...episodeBeforeCalculation,
              timeline,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateAura: aura =>
          set(state => {
            const currentTimeline =
              state.episode.timeline ?? {};

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              aura,
            };

            const timeline =
              buildCalculatedTimeline(
                episodeBeforeCalculation,
                currentTimeline,
              );

            const episode: MigraineEpisode = {
              ...episodeBeforeCalculation,
              timeline,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateCrisis: crisis =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              crisis,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updatePostdrome: postdrome =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              postdrome,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateTriggers: triggers =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              triggers,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateTreatment: treatment =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              treatment,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateNotes: notes =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              notes,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        updateTimeline:
          timelineUpdates =>
            set(state => {
              const currentTimeline =
                state.episode.timeline ?? {};

              const baseTimeline:
                MigraineTimeline = {
                ...currentTimeline,
                ...timelineUpdates,
              };

              const timeline =
                buildCalculatedTimeline(
                  state.episode,
                  baseTimeline,
                );

              const episode: MigraineEpisode = {
                ...state.episode,

                updatedAt:
                  new Date().toISOString(),

                timeline,
              };

              return synchronizeEpisode(
                state,
                episode,
              );
            }),

        updateStatus: status =>
          set(state => {
            const episode: MigraineEpisode = {
              ...state.episode,

              updatedAt:
                new Date().toISOString(),

              status,
            };

            return synchronizeEpisode(
              state,
              episode,
            );
          }),

        completeEpisode: () =>
          set(state => {
            const now =
              new Date().toISOString();

            const currentTimeline =
              state.episode.timeline ?? {};

            const hasPostdrome =
              state.episode.postdrome
                .present ||
              Boolean(
                currentTimeline
                  .postdromeStart ||
                  state.episode
                    .postdrome
                    .startTime ||
                  state.episode
                    .postdrome.time
                    ?.start?.value,
              );

            const postdromeStart =
              currentTimeline
                .postdromeStart ??
              state.episode.postdrome
                .startTime ??
              state.episode.postdrome
                .time?.start?.value;

            const requestedPostdromeEnd =
              currentTimeline
                .postdromeEnd ??
              state.episode.postdrome
                .endTime ??
              state.episode.postdrome
                .time?.end?.value;

            const hasValidPostdromeEnd =
              Boolean(
                isValidDate(
                  requestedPostdromeEnd,
                ) &&
                  (
                    !isValidDate(
                      postdromeStart,
                    ) ||
                    new Date(
                      requestedPostdromeEnd,
                    ).getTime() >=
                      new Date(
                        postdromeStart,
                      ).getTime()
                  ),
              );

            if (
              hasPostdrome &&
              !hasValidPostdromeEnd
            ) {
              return state;
            }

            const postdromeEnd =
              hasPostdrome
                ? requestedPostdromeEnd
                : undefined;

            const episodeEnd =
              postdromeEnd ??
              getLatestDate([
                currentTimeline
                  .crisisEnd,

                state.episode.crisis
                  .endTime,

                state.episode.crisis
                  .time?.end?.value,

                currentTimeline.auraEnd,

                state.episode.aura
                  .time?.end?.value,

                currentTimeline
                  .premonitoryEnd,

                state.episode
                  .premonitory.time
                  ?.end?.value,
              ]) ??
              now;

            const completionReason =
              state.episode
                .completionReason ??
              (
                hasPostdrome
                  ? 'recovered'
                  : currentTimeline
                        .crisisEnd ||
                      state.episode
                        .crisis.endTime ||
                      state.episode
                        .crisis.time
                        ?.end?.value
                    ? 'crisisWithoutPostdrome'
                    : undefined
              );

            const completedTimeline:
              MigraineTimeline = {
              ...currentTimeline,

              episodeEnd,

              ...(postdromeEnd
                ? {
                    postdromeEnd,
                  }
                : {}),
            };

            const completed: MigraineEpisode = {
              ...state.episode,

              updatedAt: now,

              status:
                'completed' as MigraineEpisodeStatus,

              completionReason,

              crisis: {
                ...state.episode.crisis,

                active: false,
              },

              postdrome: hasPostdrome
                ? {
                    ...state.episode
                      .postdrome,

                    endTime:
                      postdromeEnd,

                    status: 'ended',
                  }
                : {
                    ...state.episode
                      .postdrome,

                    present: false,
                  },

              timeline:
                completedTimeline,
            };

            return {
              history: [
                ...state.history,
                completed,
              ],

              episode:
                createInitialEpisode(),

              activeEpisode: null,
            };
          }),

        clearHistory: () =>
          set({
            history: [],
          }),

        resetEpisode: () =>
          set({
            episode:
              createInitialEpisode(),

            activeEpisode: null,
          }),
      }),

      {
        name: STORAGE_NAME,

        version: STORAGE_VERSION,

        migrate: persistedState =>
          persistedState,

        merge: (
          persistedState,
          currentState,
        ) => {
          if (
            !isRecord(persistedState)
          ) {
            return currentState;
          }

          const persistedEpisode =
            normalizeEpisode(
              persistedState.episode,
            );

          const persistedActiveEpisode =
            persistedState.activeEpisode
              ? normalizeEpisode(
                  persistedState
                    .activeEpisode,
                )
              : null;

          const episode =
            persistedActiveEpisode
              ?.crisis.active
              ? persistedActiveEpisode
              : persistedEpisode;

          const history =
            normalizeHistory(
              persistedState.history,
            );

          return {
            ...currentState,

            episode,

            history,

            activeEpisode:
              resolveActiveEpisode(
                episode,
                persistedActiveEpisode,
              ),
          };
        },
      },
    ),
  );