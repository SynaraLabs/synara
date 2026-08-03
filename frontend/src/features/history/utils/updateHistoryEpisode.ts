import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

export type HistoryEpisodeUpdater = (
  episode: MigraineEpisode,
) => MigraineEpisode;

export type HistoryEpisodeUpdateError =
  | 'invalidId'
  | 'notFound'
  | 'invalidUpdate';

export interface HistoryEpisodeUpdateResult {
  ok: boolean;

  episode?: MigraineEpisode;

  error?: HistoryEpisodeUpdateError;
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

const isValidEpisode = (
  episode: MigraineEpisode,
): boolean => {
  return Boolean(
    episode &&
      typeof episode.createdAt ===
        'string' &&
      episode.premonitory &&
      episode.aura &&
      episode.crisis &&
      episode.postdrome,
  );
};

export const getHistoryEpisode = (
  episodeId: string,
): MigraineEpisode | null => {
  const normalizedId =
    episodeId.trim();

  if (!normalizedId) {
    return null;
  }

  const episode =
    useMigraineStore
      .getState()
      .history.find(
        historyEpisode =>
          historyEpisode.id ===
          normalizedId,
      );

  return episode
    ? cloneEpisode(episode)
    : null;
};

export const updateHistoryEpisode = (
  episodeId: string,
  updater: HistoryEpisodeUpdater,
): HistoryEpisodeUpdateResult => {
  const normalizedId =
    episodeId.trim();

  if (!normalizedId) {
    return {
      ok: false,
      error: 'invalidId',
    };
  }

  const currentHistory =
    useMigraineStore
      .getState()
      .history;

  const currentEpisode =
    currentHistory.find(
      episode =>
        episode.id ===
        normalizedId,
    );

  if (!currentEpisode) {
    return {
      ok: false,
      error: 'notFound',
    };
  }

  let updatedEpisode:
    MigraineEpisode;

  try {
    updatedEpisode = updater(
      cloneEpisode(
        currentEpisode,
      ),
    );
  } catch {
    return {
      ok: false,
      error: 'invalidUpdate',
    };
  }

  if (
    !isValidEpisode(
      updatedEpisode,
    )
  ) {
    return {
      ok: false,
      error: 'invalidUpdate',
    };
  }

  const normalizedEpisode:
    MigraineEpisode = {
    ...updatedEpisode,

    /*
     * La identidad y la fecha de
     * creación pertenecen al registro
     * original y nunca deben cambiar
     * durante una corrección.
     */
    id: currentEpisode.id,

    createdAt:
      currentEpisode.createdAt,

    updatedAt:
      new Date().toISOString(),
  };

  useMigraineStore.setState(
    state => ({
      history:
        state.history.map(
          episode =>
            episode.id ===
            normalizedId
              ? normalizedEpisode
              : episode,
        ),
    }),
  );

  return {
    ok: true,
    episode:
      cloneEpisode(
        normalizedEpisode,
      ),
  };
};