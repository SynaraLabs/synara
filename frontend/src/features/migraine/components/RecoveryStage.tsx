import {
  useEffect,
  useRef,
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
  | 'triggers'
  | 'treatment';

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

const hasTreatmentInformation = (
  treatment:
    MigraineEpisode['treatment'],
): boolean => {
  return Boolean(
    treatment.type ||
      treatment.medication?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment.responseTimeMinutes !==
        undefined ||
      treatment.sideEffects?.length ||
      treatment.notes?.trim(),
  );
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

  const panelRefs =
    useRef<
      Partial<
        Record<
          RecoveryPanel,
          HTMLDivElement | null
        >
      >
    >({});

  const previousActivePanel =
    useRef<RecoveryPanel | null>(
      null,
    );

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

  useEffect(() => {
    if (
      !activePanel ||
      previousActivePanel.current ===
        activePanel
    ) {
      previousActivePanel.current =
        activePanel;

      return;
    }

    previousActivePanel.current =
      activePanel;

    const element =
      panelRefs.current[
        activePanel
      ];

    if (!element) {
      return;
    }

    window.requestAnimationFrame(
      () => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      },
    );
  }, [activePanel]);

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

  const treatmentStatus =
    hasTreatmentInformation(
      episode.treatment,
    )
      ? 'Registrado'
      : 'Sin registrar';

  const pendingMessage =
    hasOpenPremonitory
      ? 'Primero registrá cuándo terminaron las señales previas.'
      : isPostdromeActive
        ? 'La recuperación sigue en curso. Finalizá el postdromo o indicá que finalmente no lo tuviste.'
        : '';

  return (
    <section className={styles.root}>
      <header className={styles.intro}>
        <div className={styles.introContent}>
          <p className={styles.eyebrow}>
            Después de la crisis
          </p>

          <h2>
            Recuperación
          </h2>

          <p className={styles.introDescription}>
            Completá la evolución después
            de la crisis y agregá el contexto
            que ayude a comprender este
            episodio.
          </p>
        </div>
      </header>

      <section
        className={styles.workspace}
        aria-labelledby="recovery-follow-up-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.sectionEyebrow}>
              Seguimiento
            </p>

            <h3 id="recovery-follow-up-title">
              Evolución clínica
            </h3>
          </div>

          <p>
            Resolvé primero las fases que
            todavía están abiertas.
          </p>
        </div>

        <div className={styles.panelList}>
          {hasOpenPremonitory && (
            <div
              ref={element => {
                panelRefs.current.premonitory =
                  element;
              }}
              className={styles.panelAnchor}
            >
              <ClinicalPhasePanel
                id="recovery-premonitory-title"
                eyebrow="Fase pendiente"
                tone="premonitory"
                title="Señales premonitorias"
                description="Indicá cuándo terminaron o registrá una nueva actualización."
                icon=""
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
                    className={styles.feedback}
                    aria-live="polite"
                  >
                    {feedback}
                  </p>
                )}
              </ClinicalPhasePanel>
            </div>
          )}

          <div
            ref={element => {
              panelRefs.current.postdrome =
                element;
            }}
            className={styles.panelAnchor}
          >
            <ClinicalPhasePanel
              id="recovery-postdrome-title"
              eyebrow="Recuperación"
              tone="recovery"
              title="Postdromo"
              description="Registrá cómo evoluciona la recuperación después de la crisis."
              icon=""
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
          </div>
        </div>
      </section>

      <section
        className={styles.workspace}
        aria-labelledby="recovery-context-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.sectionEyebrow}>
              Contexto
            </p>

            <h3 id="recovery-context-title">
              Sobre este episodio
            </h3>
          </div>

          <p>
            Estos datos pueden ayudarte a
            reconocer patrones con el
            tiempo.
          </p>
        </div>

        <div className={styles.panelList}>
          <div
            ref={element => {
              panelRefs.current.triggers =
                element;
            }}
            className={styles.panelAnchor}
          >
            <ClinicalPhasePanel
              id="recovery-triggers-title"
              eyebrow="Contexto"
              tone="trigger"
              title="Posibles desencadenantes"
              description="Factores que podrían haber influido."
              icon=""
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

          <div
            ref={element => {
              panelRefs.current.treatment =
                element;
            }}
            className={styles.panelAnchor}
          >
            <ClinicalPhasePanel
              id="recovery-treatment-title"
              eyebrow="Tratamiento"
              tone="treatment"
              title="Tratamiento utilizado"
              description="Qué utilizaste y cómo respondió tu cuerpo."
              icon=""
              status={treatmentStatus}
              isOpen={
                activePanel ===
                'treatment'
              }
              onOpenChange={isOpen =>
                handlePanelChange(
                  'treatment',
                  isOpen,
                )
              }
            >
              <TreatmentSelector
                showHeader={false}
              />
            </ClinicalPhasePanel>
          </div>
        </div>
      </section>

      {pendingMessage && (
        <p
          className={styles.notice}
          role="status"
        >
          <strong>
            Seguimiento pendiente.
          </strong>{' '}

          {pendingMessage}
        </p>
      )}

      <section className={styles.completionArea}>
        <div className={styles.completionText}>
          <p className={styles.sectionEyebrow}>
            Episodio
          </p>

          <h3>
            Cerrar el seguimiento
          </h3>

          <p>
            Cuando termines, todo el
            registro quedará disponible
            en el historial.
          </p>
        </div>

        <button
          type="button"
          className={styles.completeButton}
          disabled={!canCompleteEpisode}
          onClick={handleCompleteEpisode}
        >
          Finalizar episodio
        </button>
      </section>

      <MigraineDevTools />
    </section>
  );
}