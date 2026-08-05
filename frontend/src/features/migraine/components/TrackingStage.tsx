import type {
  MigraineEpisode,
} from '../types/migraine.types';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import {
  PhaseDateSelector,
} from './common/PhaseDateSelector';

import {
  TrackingPhasePanels,
} from './TrackingPhasePanels';

import styles from '../migraine.module.css';

export type PremonitoryCrisisOutcome =
  | 'endsWithCrisis'
  | 'endedAtAnotherTime'
  | 'continuesWithCrisis'
  | 'unknownEnd';

interface Props {
  episode: MigraineEpisode;

  hasOpenPremonitory: boolean;

  premonitoryStart?: string;

  showCrisisDate: boolean;

  showPremonitoryCrisisQuestion:
    boolean;

  showPremonitoryEndSelector:
    boolean;

  premonitoryCrisisOutcome:
    PremonitoryCrisisOutcome | null;

  premonitoryEndSelection:
    PhaseEndSelection | null;

  onStartCrisis: () => void;

  onCancelCrisisStart: () => void;

  onEndsWithCrisis: () => void;

  onEndedAtAnotherTime: () => void;

  onContinuesWithCrisis: () => void;

  onUnknownEnd: () => void;

  onPremonitoryEnd: (
    selection: PhaseEndSelection,
  ) => void;

  onCrisisDate: (
    date: string,
  ) => void;
}

export function TrackingStage({
  episode,
  hasOpenPremonitory,
  premonitoryStart,
  showCrisisDate,
  showPremonitoryCrisisQuestion,
  showPremonitoryEndSelector,
  premonitoryCrisisOutcome,
  premonitoryEndSelection,
  onStartCrisis,
  onCancelCrisisStart,
  onEndsWithCrisis,
  onEndedAtAnotherTime,
  onContinuesWithCrisis,
  onUnknownEnd,
  onPremonitoryEnd,
  onCrisisDate,
}: Props) {
  const crisisFlowIsOpen =
    showCrisisDate ||
    showPremonitoryCrisisQuestion ||
    showPremonitoryEndSelector;

  return (
    <>
      {!crisisFlowIsOpen && (
        <div>
          <button
            type="button"
            onClick={
              onStartCrisis
            }
          >
            Estoy entrando en crisis
          </button>
        </div>
      )}

      {crisisFlowIsOpen && (
        <section>
          {showPremonitoryCrisisQuestion && (
            <section>
              <h3>
                ¿Qué pasó con las señales
                previas?
              </h3>

              <p>
                Elegí la opción que mejor
                describa lo que recordás.
              </p>

              <button
                type="button"
                onClick={
                  onEndsWithCrisis
                }
              >
                Terminaron cuando empezó
                la crisis
              </button>

              <button
                type="button"
                onClick={
                  onEndedAtAnotherTime
                }
              >
                Terminaron en otro momento
              </button>

              <button
                type="button"
                onClick={
                  onContinuesWithCrisis
                }
              >
                Continúan durante la crisis
              </button>

              <button
                type="button"
                onClick={
                  onUnknownEnd
                }
              >
                No recuerdo cuándo
                terminaron
              </button>

              <button
                type="button"
                onClick={
                  onCancelCrisisStart
                }
              >
                Cancelar
              </button>
            </section>
          )}

          {showPremonitoryEndSelector && (
            <section>
              <PhaseEndSelector
                title="¿Cuándo terminaron las señales previas?"
                startTime={
                  premonitoryStart
                }
                onConfirm={
                  onPremonitoryEnd
                }
                onContinue={
                  onContinuesWithCrisis
                }
              />

              <button
                type="button"
                onClick={
                  onCancelCrisisStart
                }
              >
                Cancelar inicio de crisis
              </button>
            </section>
          )}

          {showCrisisDate && (
            <section>
              <PhaseDateSelector
                title="¿Cuándo empezó el dolor?"
                value={
                  episode.crisis
                    .startTime
                }
                onChange={
                  onCrisisDate
                }
              />

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'endsWithCrisis' && (
                  <p
                    className={
                      styles.helperText
                    }
                  >
                    Las señales se cerrarán
                    cuando comience la
                    crisis.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'endedAtAnotherTime' &&
                premonitoryEndSelection && (
                  <p
                    className={
                      styles.helperText
                    }
                  >
                    Se conservará la hora
                    de finalización que
                    acabás de registrar.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'continuesWithCrisis' && (
                  <p
                    className={
                      styles.helperText
                    }
                  >
                    Las señales
                    permanecerán abiertas
                    durante la crisis.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'unknownEnd' && (
                  <p
                    className={
                      styles.helperText
                    }
                  >
                    Las señales quedarán
                    con hora de
                    finalización
                    desconocida.
                  </p>
                )}

              <button
                type="button"
                onClick={
                  onCancelCrisisStart
                }
              >
                Cancelar
              </button>
            </section>
          )}
        </section>
      )}

      <TrackingPhasePanels
        episode={episode}
      />
    </>
  );
}