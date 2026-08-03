import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

export type ReactivateHistoryEpisodeError =
  | 'invalidId'
  | 'notFound'
  | 'anotherEpisodeIsActive';

export interface ReactivateHistoryEpisodeResult {
  ok: boolean;

  episode?: MigraineEpisode;

  error?:
    ReactivateHistoryEpisodeError;
}

const cloneEpisode = (
  episode: MigraineEpisode,
): MigraineEpisode => {
  if (
    typeof structuredClone ===
    'function'
  ) {
    return structuredClone(
      episode,
    );
  }

  return JSON.parse(
    JSON.stringify(
      episode,
    ),
  ) as MigraineEpisode;
};

export const reactivateHistoryEpisode = (
  episodeId: string,
  episode: MigraineEpisode,
): ReactivateHistoryEpisodeResult => {
  const normalizedId =
    episodeId.trim();

  if (!normalizedId) {
    return {
      ok: false,
      error: 'invalidId',
    };
  }

  const state =
    useMigraineStore.getState();

  const storedEpisode =
    state.history.find(
      historyEpisode =>
        historyEpisode.id ===
        normalizedId,
    );

  if (!storedEpisode) {
    return {
      ok: false,
      error: 'notFound',
    };
  }

  if (
    state.activeEpisode &&
    state.activeEpisode.id !==
      normalizedId
  ) {
    return {
      ok: false,
      error:
        'anotherEpisodeIsActive',
    };
  }

  const reopenedEpisode:
    MigraineEpisode = {
    ...cloneEpisode(episode),

    id: storedEpisode.id,

    createdAt:
      storedEpisode.createdAt,

    updatedAt:
      new Date().toISOString(),

    status: 'crisis',

    completionReason:
      undefined,

    crisis: {
      ...episode.crisis,

      active: true,

      status: 'active',

      endTime:
        undefined,

      time: {
        ...episode.crisis.time,

        end: undefined,
      },
    },

    postdrome: {
      ...episode.postdrome,

      present: false,

      status: 'notStarted',

      time: {
        ...episode.postdrome.time,

        start: undefined,
        end: undefined,
      },
    },

    timeline: {
      ...episode.timeline,

      crisisEnd:
        undefined,

      postdromeStart:
        undefined,

      postdromeEnd:
        undefined,

      episodeEnd:
        undefined,
    },
  };

  useMigraineStore.setState(
    currentState => ({
      episode:
        reopenedEpisode,

      activeEpisode:
        reopenedEpisode,

      history:
        currentState.history.filter(
          historyEpisode =>
            historyEpisode.id !==
            normalizedId,
        ),
    }),
  );

  /*
   * startCrisis aplica además las
   * normalizaciones internas del store
   * y conserva el inicio ya cargado.
   */
  useMigraineStore
    .getState()
    .startCrisis();

  const activeEpisode =
    useMigraineStore
      .getState()
      .activeEpisode;

  return {
    ok: true,

    episode:
      activeEpisode
        ? cloneEpisode(
            activeEpisode,
          )
        : cloneEpisode(
            reopenedEpisode,
          ),
  };
};