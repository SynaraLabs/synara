import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

export const deleteHistoryEpisode = (
  episodeId: string,
): boolean => {
  const normalizedId =
    episodeId.trim();

  if (!normalizedId) {
    return false;
  }

  const currentHistory =
    useMigraineStore.getState()
      .history;

  const episodeExists =
    currentHistory.some(
      episode =>
        episode.id ===
        normalizedId,
    );

  if (!episodeExists) {
    return false;
  }

  useMigraineStore.setState(
    state => ({
      history:
        state.history.filter(
          episode =>
            episode.id !==
            normalizedId,
        ),
    }),
  );

  return true;
};