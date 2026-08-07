import {
  useState,
} from 'react';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from './NoPostdromeButton.module.css';

interface Props {
  onComplete?: () => void;
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

export function NoPostdromeButton({
  onComplete,
}: Props) {
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

      present: false,

      status: 'notStarted',

      startTime: undefined,

      endTime: undefined,

      time: undefined,

      symptoms: [],

      clinicalSymptoms: [],

      customSymptoms: [],

      updates: [],

      recoveryLevel: undefined,

      recoveryHours: undefined,

      notes: undefined,
    });

    updateTimeline({
      postdromeStart:
        undefined,

      postdromeEnd:
        undefined,

      postdrome: undefined,

      episodeEnd: crisisEnd,
    });

    /*
     * Zustand actualiza el estado de
     * forma sincrónica. El episodio se
     * archivará sin postdromo y su final
     * coincidirá con el final de crisis.
     */
    completeEpisode();

    onComplete?.();
  };

  if (!postdrome.present) {
    return null;
  }

  if (!showConfirmation) {
    return (
      <div
        className={styles.root}
      >
        <button
          type="button"
          className={
            styles.openButton
          }
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
              styles.blockedMessage
            }
          >
            Primero resolvé cuándo
            terminaron las señales
            previas.
          </p>
        )}
      </div>
    );
  }

  return (
    <section
      className={
        styles.confirmation
      }
      aria-labelledby="no-postdrome-title"
    >
      <div
        className={
          styles.confirmationHeader
        }
      >
        <p
          className={styles.eyebrow}
        >
          Corregir recuperación
        </p>

        <h4 id="no-postdrome-title">
          Confirmar que no hubo
          postdromo
        </h4>

        <p
          className={
            styles.description
          }
        >
          El episodio finalizará en el
          mismo momento en que terminó
          la crisis.
        </p>
      </div>

      <p className={styles.notice}>
        Esta opción eliminará las
        actualizaciones de recuperación
        que hayas registrado. Usala
        solamente si no tuviste síntomas
        posteriores a la crisis.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() => {
            setShowConfirmation(
              false,
            );

            setFeedback('');
          }}
        >
          Volver
        </button>

        <button
          type="button"
          className={
            styles.confirmButton
          }
          onClick={handleConfirm}
        >
          Confirmar: no tuve postdromo
        </button>
      </div>

      {feedback && (
        <p
          className={styles.feedback}
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
