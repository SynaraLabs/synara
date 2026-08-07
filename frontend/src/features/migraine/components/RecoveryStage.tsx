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
  ClinicalPhasePanel,
} from './common/ClinicalPhasePanel';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import {
  MigraineDevTools,
} from './dev/MigraineDevTools';

import {
  PostdromeTrackingSection,
} from './PostdromeTrackingSection';

import {
  PremonitorySelector,
} from './PremonitorySelector';

import {
  TreatmentSelector,
} from './TreatmentSelector';

import {
  TriggerSelector,
} from './TriggerSelector';

import styles from './RecoveryStage.module.css';

interface Props {
  episode: MigraineEpisode;
}

type RecoveryPanel =
  | 'premonitory'
  | 'postdrome'
  | 'triggers';

const getTriggerStatus = (
  count: number,
): string => {
  if (count === 0) {
    return 'Sin registrar';
  }

  return count === 1
    ? '1 seleccionado'
    : `${count} seleccionados`;
};

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

  const getInitialPanel =
    (): RecoveryPanel | null => {
      if (isPostdromeActive) {
        return 'postdrome';
      }

      if (hasOpenPremonitory) {
        return 'premonitory';
      }

      return null;
    };

  const [
    activePanel,
    setActivePanel,
  ] = useState<
    RecoveryPanel | null
  >(
    getInitialPanel,
  );

  const handlePanelChange = (
    panel: RecoveryPanel,
    isOpen: boolean,
  ) => {
    setActivePanel(
      currentPanel => {
        if (isOpen) {
          return panel;
        }

        return currentPanel === panel
          ? null
          : currentPanel;
      },
    );
  };

  const closeActivePanel = () => {
    setActivePanel(null);
  };

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

      closeActivePanel();
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

    closeActivePanel();
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

      closeActivePanel();
    };

  const handleCompleteEpisode =
    () => {
      if (!canCompleteEpisode) {
        return;
      }

      completeEpisode();
    };

  const postdromeStatus =
    !hasPostdrome
      ? 'Sin postdromo'
      : isPostdromeEnded
        ? 'Finalizado'
        : 'En curso';

  const triggerCount =
    episode.triggers?.length ?? 0;

  return (
    <section className={styles.root}>
      <header className={styles.intro}>
        <span
          className={styles.introIcon}
          aria-hidden="true"
        >
          ◇
        </span>

        <div className={styles.introContent}>
          <p className={styles.eyebrow}>
            Después de la crisis
          </p>

          <h2>
            Recuperación
          </h2>

          <p className={styles.introDescription}>
            La crisis terminó y el
            postdromo comenzó en ese
            mismo momento. Registrá su
            evolución o indicá que
            finalmente no tuviste
            postdromo.
          </p>
        </div>
      </header>

      <div
        className={
          styles.panelList
        }
      >
        {hasOpenPremonitory && (
          <ClinicalPhasePanel
            id="recovery-premonitory-title"
            eyebrow="Fase pendiente"
            tone="premonitory"
            title="Señales premonitorias"
            description="Indicá cuándo terminaron o registrá una nueva actualización."
            icon="◌"
            status="En curso"
            isOpen={
              activePanel ===
              'premonitory'
            }
            onOpenChange={isOpen =>
              handlePanelChange(
                'premonitory',
                isOpen,
              )
            }
          >
            <PremonitorySelector
              context="recovery"
              onComplete={
                closeActivePanel
              }
            />

            {!showPremonitoryOptions &&
              !showPremonitoryEnd && (
                <button
                  type="button"
                  className={
                    styles.resolutionAction
                  }
                  onClick={
                    handleOpenResolution
                  }
                >
                  Indicar cuándo
                  terminaron las señales
                </button>
              )}

            {showPremonitoryOptions && (
              <section
                className={
                  styles.resolutionOptions
                }
              >
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
                  Continúan después de
                  la crisis
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
                  styles.feedback
                }
                aria-live="polite"
              >
                {feedback}
              </p>
            )}
          </ClinicalPhasePanel>
        )}

      <ClinicalPhasePanel
          id="recovery-postdrome-title"
        eyebrow="Recuperación"
        tone="recovery"
          title="Postdromo"
          description="Registrá cómo evoluciona la recuperación después de la crisis."
          icon="◇"
          status={postdromeStatus}
          isOpen={
            activePanel ===
            'postdrome'
          }
          onOpenChange={isOpen =>
            handlePanelChange(
              'postdrome',
              isOpen,
            )
          }
        >
          <PostdromeTrackingSection
            onComplete={
              closeActivePanel
            }
          />
        </ClinicalPhasePanel>

      <ClinicalPhasePanel
          id="recovery-triggers-title"
        eyebrow="Contexto"
        tone="recovery"
          title="Posibles desencadenantes"
          description="Registrá factores que podrían haber influido en este episodio."
          icon="⌁"
          status={
            getTriggerStatus(
              triggerCount,
            )
          }
          isOpen={
            activePanel ===
            'triggers'
          }
          onOpenChange={isOpen =>
            handlePanelChange(
              'triggers',
              isOpen,
            )
          }
        >
          <TriggerSelector
            onComplete={
              closeActivePanel
            }
          />
        </ClinicalPhasePanel>
      </div>

      <TreatmentSelector />

      {hasOpenPremonitory && (
        <p
          className={
          styles.notice
          }
        >
        <strong>
          Señales previas pendientes.
        </strong>{' '}

        Primero debés registrar cuándo
        terminaron.
        </p>
      )}

      {isPostdromeActive && (
        <p
          className={
          styles.notice
          }
        >
        <strong>
          La recuperación continúa.
        </strong>{' '}

        Registrá la recuperación
        completa o indicá que no
        tuviste postdromo.
        </p>
      )}

      <section
        className={
          styles.completionArea
        }
      >
        <div
          className={
            styles.completionText
          }
        >
          <h3>
            Cerrar el seguimiento
          </h3>

          <p>
            Podrás consultar todo el
            episodio desde el historial.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.completeButton
          }
          disabled={
            !canCompleteEpisode
          }
          onClick={
            handleCompleteEpisode
          }
        >
          Finalizar episodio
        </button>
      </section>

      <MigraineDevTools />
    </section>
  );
}