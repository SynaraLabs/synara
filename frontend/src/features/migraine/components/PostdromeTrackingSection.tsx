import {
  NoPostdromeButton,
} from './NoPostdromeButton';

import {
  PostdromeSelector,
} from './PostdromeSelector';

import {
  useMigraineStore,
} from '../store/migraine.store';

export function PostdromeTrackingSection() {
  const postdromeIsActive =
    useMigraineStore(
      state => {
        const postdrome =
          state.episode.postdrome;

        const end =
          state.episode.timeline
            ?.postdromeEnd ??
          postdrome.endTime ??
          postdrome.time?.end
            ?.value;

        return (
          postdrome.present ===
            true &&
          postdrome.status !==
            'ended' &&
          !end
        );
      },
    );

  return (
    <section>
      <PostdromeSelector />

      {postdromeIsActive && (
        <NoPostdromeButton />
      )}
    </section>
  );
}