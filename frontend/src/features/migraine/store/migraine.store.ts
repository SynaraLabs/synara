import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AuraPhase,
  CrisisPhase,
  MigraineEpisode,
  MigraineEpisodeStatus,
  MigraineTimeline,
  MigraineTrigger,
  PostdromePhase,
  PremonitoryPhase,
  Treatment,
} from '../types/migraine.types';

interface MigraineStore {
  episode: MigraineEpisode;
  activeEpisode: MigraineEpisode | null;
  history: MigraineEpisode[];

  startEpisode: () => void;
  startCrisis: () => void;
  finishCrisis: () => void;

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

const generateId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return Date.now().toString();
};

const addMinutes = (
  date: string,
  minutes: number,
): string => {
  const result = new Date(date);

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
    (date): date is string =>
      typeof date === 'string' &&
      !Number.isNaN(
        new Date(date).getTime(),
      ),
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

const calculateEpisodeStart = (
  timeline: MigraineTimeline,
): string | undefined => {
  return getEarliestDate([
    timeline.premonitoryStart,
    timeline.auraStart,
    timeline.crisisStart,
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

  if (!timeline.premonitoryStart) {
    return {
      premonitoryEnd: undefined,
    };
  }

  if (!timeline.crisisStart) {
    return {
      premonitoryStart:
        timeline.premonitoryStart,

      premonitoryEnd: undefined,
    };
  }

  return {
    premonitoryStart:
      timeline.premonitoryStart,

    premonitoryEnd:
      timeline.crisisStart,
  };
};

const calculateAuraTimeline = (
  aura: AuraPhase,
  timeline: MigraineTimeline,
): Partial<MigraineTimeline> => {
  const duration =
    aura.durationMinutes;

  if (
    !aura.present ||
    !aura.timing ||
    !duration ||
    duration <= 0
  ) {
    return {
      auraStart: undefined,
      auraEnd: undefined,
    };
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

  return {
    auraStart: undefined,
    auraEnd: undefined,
  };
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
    id: generateId(),

    createdAt:
      new Date().toISOString(),

    status:
      'tracking' as MigraineEpisodeStatus,

    timeline: {},

    premonitory: {
      present: false,
      symptoms: [],
    },

    aura: {
      present: false,
      types: [],
      visualSymptoms: [],
      sensorySymptoms: [],
      languageSymptoms: [],
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
    },

    triggers: [],

    treatment: {},
  });

const synchronizeEpisode = (
  state: MigraineStore,
  episode: MigraineEpisode,
) => ({
  episode,

  activeEpisode:
    state.activeEpisode
      ? episode
      : null,
});

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
              now;

            const baseTimeline:
              MigraineTimeline = {
              ...currentTimeline,
              crisisStart,
            };

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,

              status:
                'crisis' as MigraineEpisodeStatus,

              crisis: {
                ...state.episode.crisis,

                active: true,

                startTime:
                  state.episode.crisis
                    .startTime ||
                  crisisStart,
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

        finishCrisis: () =>
          set(state => {
            const now =
              new Date().toISOString();

            const currentTimeline =
              state.episode.timeline ?? {};

            const baseTimeline:
              MigraineTimeline = {
              ...currentTimeline,

              crisisEnd: now,

              postdromeStart: now,
            };

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,

              status:
                'postdrome' as MigraineEpisodeStatus,

              crisis: {
                ...state.episode.crisis,

                active: false,

                endTime: now,
              },

              postdrome: {
                ...state.episode.postdrome,

                present: true,
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

        updatePremonitory: premonitory =>
          set(state => {
            const currentTimeline =
              state.episode.timeline ?? {};

            const episodeBeforeCalculation:
              MigraineEpisode = {
              ...state.episode,
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

            const postdromeStart =
              currentTimeline.postdromeStart;

            const requestedPostdromeEnd =
              currentTimeline.postdromeEnd;

            const hasValidPostdromeEnd =
              Boolean(
                postdromeStart &&
                  requestedPostdromeEnd &&
                  new Date(
                    requestedPostdromeEnd,
                  ).getTime() >=
                    new Date(
                      postdromeStart,
                    ).getTime(),
              );

            const episodeEnd =
              hasValidPostdromeEnd
                ? requestedPostdromeEnd
                : now;

            const completed: MigraineEpisode = {
              ...state.episode,

              status:
                'completed' as MigraineEpisodeStatus,

              timeline: {
                ...currentTimeline,

                postdromeEnd:
                  episodeEnd,

                episodeEnd,
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
        name:
          'synara-migraine-storage',
      },
    ),
  );