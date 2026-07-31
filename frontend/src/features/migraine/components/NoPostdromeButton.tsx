import {
  useState,
} from 'react';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

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

export function NoPostdromeButton() {
  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState('');

  const postdrome =
    useMigraineStore(
      state =>
        state.episode.postdrome,
    );

  const crisisEnd =
    useMigraineStore(
      state =>
        state.episode.timeline
          ?.crisisEnd ??
        state.episode.crisis
          .endTime ??
        state.episode.crisis.time
          ?.end?.value,
    );

  const hasOpenPremonitory =
    useMigraineStore(
      state => {
        const premonitory =
          state.episode
            .premonitory;

        const end =
          state.episode.timeline
            ?.premonitoryEnd ??
          premonitory.time?.end
            ?.value;

        return (
          premonitory.present ===
            true &&
          premonitory.status !==
            'ended' &&
          premonitory.status !==
            'uncertain' &&
          !end
        );
      },
    );

  const updatePostdrome =
    useMigraineStore(
      state =>
        state.updatePostdrome,
    );

  const updateTimeline =
    useMigraineStore(
      state =>
        state.updateTimeline,
    );

  const completeEpisode =
    useMigraineStore(
      state =>
        state.completeEpisode,
    );

  const handleConfirm = () => {
    if (hasOpenPremonitory) {
      setFeedback(
        'Primero indicá cuándo terminaron las señales previas.',
      );

      return;
    }

    if (
      !isValidDate(
        crisisEnd,
      )
    ) {
      setFeedback(
        'No se encontró la hora de finalización de la crisis.',
      );

      return;
    }

    updatePostdrome({
      ...postdrome,

      present:
        false,

      status:
        'notStarted',

      startTime:
        undefined,

      endTime:
        undefined,

      time:
        undefined,

      symptoms:
        [],

      clinicalSymptoms:
        [],

      customSymptoms:
        [],

      updates:
        [],

      recoveryLevel:
        undefined,

      recoveryHours:
        undefined,

      notes:
        undefined,
    });

    updateTimeline({
      postdromeStart:
        undefined,

      postdromeEnd:
        undefined,

      postdrome:
        undefined,

      episodeEnd:
        crisisEnd,
    });

    /*
     * Zustand actualiza el estado de
     * forma sincrónica. El episodio se
     * archivará sin postdromo y su final
     * coincidirá con el final de crisis.
     */
    completeEpisode();
  };

  if (!postdrome.present) {
    return null;
  }

  if (!showConfirmation) {
    return (
      <>
        <button
          type="button"
          disabled={
            hasOpenPremonitory
          }
          onClick={() => {
            setShowConfirmation(
              true,
            );

            setFeedback('');
          }}
        >
          No tuve postdromo
        </button>

        {hasOpenPremonitory && (
          <p
            className={
              styles.helperText
            }
          >
            Primero resolvé cuándo
            terminaron las señales
            previas.
          </p>
        )}
      </>
    );
  }

  return (
    <section>
      <h4>
        Confirmar que no hubo
        postdromo
      </h4>

      <p>
        El episodio finalizará en el
        mismo momento en que terminó la
        crisis.
      </p>

      <p>
        Usá esta opción solamente si no
        tuviste un período de
        recuperación con síntomas
        posteriores.
      </p>

      <button
        type="button"
        onClick={handleConfirm}
      >
        Confirmar: no tuve postdromo
      </button>

      <button
        type="button"
        onClick={() => {
          setShowConfirmation(
            false,
          );

          setFeedback('');
        }}
      >
        Volver
      </button>

      {feedback && (
        <p
          className={
            styles.helperText
          }
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}