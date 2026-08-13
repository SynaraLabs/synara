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

import styles from './TrackingStage.module.css';

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
    <section className={styles.stage}>
      {!crisisFlowIsOpen && (
        <>
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              Episodio en curso
            </p>

            <h1>
              ¿Qué estás sintiendo ahora?
            </h1>

            <p>
              Abrí la fase que quieras
              registrar. Podés volver y
              actualizarla cuando lo
              necesites.
            </p>
          </header>

          <button
            type="button"
            className={styles.crisisAction}
            onClick={onStartCrisis}
          >
            <span className={styles.crisisCopy}>
              <strong>
                Crisis o dolor ahora
              </strong>

              <span>
                Empezá el modo de registro
                rápido y de bajo estímulo.
              </span>
            </span>

            <span
              className={styles.crisisCta}
              aria-hidden="true"
            >
              Iniciar
              <span>→</span>
            </span>
          </button>
        </>
      )}

      {crisisFlowIsOpen && (
        <section
          className={styles.crisisFlow}
          aria-label="Inicio de crisis"
        >
          {showPremonitoryCrisisQuestion && (
            <section className={styles.step}>
              <header>
                <p className={styles.eyebrow}>
                  Antes de iniciar la crisis
                </p>

                <h2>
                  ¿Qué pasó con las señales
                  previas?
                </h2>

                <p>
                  Elegí la opción que mejor
                  describa lo que recordás.
                </p>
              </header>

              <div className={styles.options}>
                <button
                  type="button"
                  onClick={onEndsWithCrisis}
                >
                  Terminaron cuando empezó
                  la crisis
                </button>

                <button
                  type="button"
                  onClick={onEndedAtAnotherTime}
                >
                  Terminaron en otro momento
                </button>

                <button
                  type="button"
                  onClick={onContinuesWithCrisis}
                >
                  Continúan durante la crisis
                </button>

                <button
                  type="button"
                  onClick={onUnknownEnd}
                >
                  No recuerdo cuándo
                  terminaron
                </button>
              </div>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancelCrisisStart}
              >
                Cancelar
              </button>
            </section>
          )}

          {showPremonitoryEndSelector && (
            <section className={styles.step}>
              <PhaseEndSelector
                title="¿Cuándo terminaron las señales previas?"
                startTime={premonitoryStart}
                onConfirm={onPremonitoryEnd}
                onContinue={onContinuesWithCrisis}
              />

              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancelCrisisStart}
              >
                Cancelar inicio de crisis
              </button>
            </section>
          )}

          {showCrisisDate && (
            <section className={styles.step}>
              <PhaseDateSelector
                title="¿Cuándo empezó el dolor?"
                value={episode.crisis.startTime}
                onChange={onCrisisDate}
              />

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'endsWithCrisis' && (
                  <p className={styles.helperText}>
                    Las señales se cerrarán
                    cuando comience la crisis.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'endedAtAnotherTime' &&
                premonitoryEndSelection && (
                  <p className={styles.helperText}>
                    Se conservará la hora de
                    finalización que acabás de
                    registrar.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'continuesWithCrisis' && (
                  <p className={styles.helperText}>
                    Las señales permanecerán
                    abiertas durante la crisis.
                  </p>
                )}

              {hasOpenPremonitory &&
                premonitoryCrisisOutcome ===
                  'unknownEnd' && (
                  <p className={styles.helperText}>
                    Las señales quedarán con
                    hora de finalización
                    desconocida.
                  </p>
                )}

              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancelCrisisStart}
              >
                Cancelar
              </button>
            </section>
          )}
        </section>
      )}

      {!crisisFlowIsOpen && (
        <div className={styles.phaseArea}>
          <p className={styles.phaseLabel}>
            Otras fases
          </p>

          <TrackingPhasePanels
            episode={episode}
          />
        </div>
      )}
    </section>
  );
}