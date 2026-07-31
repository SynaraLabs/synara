import {
  useState,
} from 'react';

import type {
  MigraineEpisode,
} from '../types/migraine.types';

import {
  useMigraineStore,
} from '../store/migraine.store';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import { MigraineDevTools } from './dev/MigraineDevTools';
import { PostdromeTrackingSection } from './PostdromeTrackingSection';
import { PremonitorySelector } from './PremonitorySelector';
import { TreatmentSelector } from './TreatmentSelector';
import { TriggerSelector } from './TriggerSelector';

import styles from '../migraine.module.css';

interface Props {
  episode: MigraineEpisode;
}

export function RecoveryStage({
  episode,
}: Props) {
  const [
    showPremonitoryOptions,
    setShowPremonitoryOptions,
  ] = useState(false);

  const [
    showPremonitoryEnd,
    setShowPremonitoryEnd,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState('');

  const resolvePremonitory =
    useMigraineStore(
      state =>
        state.resolvePremonitory,
    );

  const completeEpisode =
    useMigraineStore(
      state =>
        state.completeEpisode,
    );

  const premonitoryEnd =
    episode.timeline
      ?.premonitoryEnd ??
    episode.premonitory.time
      ?.end?.value;

  const hasOpenPremonitory =
    episode.premonitory.present ===
      true &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain' &&
    !premonitoryEnd;

  const premonitoryStart =
    episode.timeline
      ?.premonitoryStart ??
    episode.premonitory.time
      ?.start?.value;

  const crisisEnd =
    episode.timeline
      ?.crisisEnd ??
    episode.crisis.endTime ??
    episode.crisis.time?.end
      ?.value;

  const postdromeStart =
    episode.timeline
      ?.postdromeStart ??
    episode.postdrome.startTime ??
    episode.postdrome.time?.start
      ?.value;

  const postdromeEnd =
    episode.timeline
      ?.postdromeEnd ??
    episode.postdrome.endTime ??
    episode.postdrome.time?.end
      ?.value;

  const hasPostdrome =
    episode.postdrome.present ===
      true ||
    Boolean(postdromeStart);

  const isPostdromeEnded =
    episode.postdrome.status ===
      'ended' ||
    Boolean(postdromeEnd);

  const isPostdromeActive =
    hasPostdrome &&
    !isPostdromeEnded;

  const canCompleteEpisode =
    !hasOpenPremonitory &&
    !isPostdromeActive;

  const handleOpenResolution =
    () => {
      setShowPremonitoryOptions(
        true,
      );

      setShowPremonitoryEnd(
        false,
      );

      setFeedback('');
    };

  const handleCancelResolution =
    () => {
      setShowPremonitoryOptions(
        false,
      );

      setShowPremonitoryEnd(
        false,
      );
    };

  const handleEndedWithCrisis =
    () => {
      if (!crisisEnd) {
        setFeedback(
          'No se encontró la hora de finalización de la crisis.',
        );

        return;
      }

      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        endTime:
          crisisEnd,

        precision:
          episode.crisis.time?.end
            ?.precision ??
          'exact',

        recordMode:
          episode.crisis.time?.end
            ?.recordMode,
      });

      setShowPremonitoryOptions(
        false,
      );

      setFeedback(
        'Las señales quedaron cerradas al finalizar la crisis.',
      );
    };

  const handleEndedDuringCrisis =
    () => {
      setShowPremonitoryOptions(
        false,
      );

      setShowPremonitoryEnd(
        true,
      );

      setFeedback('');
    };

  const handlePremonitoryEnd = (
    selection:
      PhaseEndSelection,
  ) => {
    resolvePremonitory({
      outcome:
        'evolvedToCrisis',

      endTime:
        selection.endTime,

      precision:
        selection.precision,

      recordMode:
        selection.recordMode,
    });

    setShowPremonitoryEnd(
      false,
    );

    setShowPremonitoryOptions(
      false,
    );

    setFeedback(
      'Final de las señales registrado.',
    );
  };

  const handleContinuesAfterCrisis =
    () => {
      resolvePremonitory({
        outcome:
          'continuesWithCrisis',
      });

      setShowPremonitoryOptions(
        false,
      );

      setShowPremonitoryEnd(
        false,
      );

      setFeedback(
        'Las señales continúan abiertas después de la crisis.',
      );
    };

  const handleUnknownEnd =
    () => {
      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        precision:
          'unknown',

        recordMode:
          'retrospective',
      });

      setShowPremonitoryOptions(
        false,
      );

      setShowPremonitoryEnd(
        false,
      );

      setFeedback(
        'Las señales quedaron cerradas con hora de finalización desconocida.',
      );
    };

  const handleCompleteEpisode =
    () => {
      if (!canCompleteEpisode) {
        return;
      }

      completeEpisode();
    };

  return (
    <>
      <section>
        <h2>
          Recuperación después de la
          crisis
        </h2>

        <p>
          La crisis terminó y el
          postdromo comenzó en ese
          mismo momento. Registrá su
          evolución o indicá que
          finalmente no tuviste
          postdromo.
        </p>
      </section>

      {hasOpenPremonitory && (
        <section>
          <h2>
            Señales previas todavía
            abiertas
          </h2>

          <p>
            Antes de finalizar el
            episodio debemos registrar
            qué ocurrió con estas
            señales.
          </p>

          <PremonitorySelector
            context="recovery"
          />

          {!showPremonitoryOptions &&
            !showPremonitoryEnd && (
              <button
                type="button"
                onClick={
                  handleOpenResolution
                }
              >
                Indicar cuándo
                terminaron las señales
              </button>
            )}

          {showPremonitoryOptions && (
            <section>
              <h3>
                ¿Qué pasó con las
                señales?
              </h3>

              <button
                type="button"
                onClick={
                  handleEndedWithCrisis
                }
              >
                Terminaron cuando
                terminó la crisis
              </button>

              <button
                type="button"
                onClick={
                  handleEndedDuringCrisis
                }
              >
                Terminaron en otro
                momento
              </button>

              <button
                type="button"
                onClick={
                  handleContinuesAfterCrisis
                }
              >
                Continúan después de la
                crisis
              </button>

              <button
                type="button"
                onClick={
                  handleUnknownEnd
                }
              >
                No recuerdo cuándo
                terminaron
              </button>

              <button
                type="button"
                onClick={
                  handleCancelResolution
                }
              >
                Cancelar
              </button>
            </section>
          )}

          {showPremonitoryEnd && (
            <PhaseEndSelector
              title="¿Cuándo terminaron las señales previas?"
              startTime={
                premonitoryStart
              }
              onConfirm={
                handlePremonitoryEnd
              }
              onContinue={
                handleContinuesAfterCrisis
              }
            />
          )}

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
      )}

      <PostdromeTrackingSection />

      <TriggerSelector />

      <TreatmentSelector />

      {hasOpenPremonitory && (
        <p
          className={
            styles.helperText
          }
        >
          Las señales previas todavía
          continúan. Primero debés
          registrar cuándo terminaron.
        </p>
      )}

      {isPostdromeActive && (
        <p
          className={
            styles.helperText
          }
        >
          El postdromo todavía
          continúa. Registrá la
          recuperación completa o
          indicá que no tuviste
          postdromo.
        </p>
      )}

      <button
        type="button"
        disabled={
          !canCompleteEpisode
        }
        onClick={
          handleCompleteEpisode
        }
      >
        Finalizar episodio
      </button>

      <MigraineDevTools />
    </>
  );
}