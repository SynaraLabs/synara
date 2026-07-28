import { useState } from 'react';

import { AuraSelector } from '../components/AuraSelector';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from '../components/common/PhaseEndSelector';

import { PhaseDateSelector } from '../components/common/PhaseDateSelector';
import { CrisisMode } from '../components/crisis-mode/CrisisMode';
import { MigraineDevTools } from '../components/dev/MigraineDevTools';
import { PostdromeSelector } from '../components/PostdromeSelector';
import { PremonitorySelector } from '../components/PremonitorySelector';
import { TreatmentSelector } from '../components/TreatmentSelector';
import { TriggerSelector } from '../components/TriggerSelector';

import { useMigraineStore } from '../store/migraine.store';

import styles from '../migraine.module.css';

type PremonitoryCrisisOutcome =
  | 'endsWithCrisis'
  | 'endedAtAnotherTime'
  | 'continuesWithCrisis'
  | 'unknownEnd';

function createLocalDateTime(
  date: string,
): string | undefined {
  const [
    yearValue,
    monthValue,
    dayValue,
  ] = date.split('-');

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return undefined;
  }

  const now = new Date();

  const selectedDate = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    0,
  );

  const isValidDate =
    !Number.isNaN(
      selectedDate.getTime(),
    ) &&
    selectedDate.getFullYear() ===
      year &&
    selectedDate.getMonth() ===
      month - 1 &&
    selectedDate.getDate() === day;

  if (
    !isValidDate ||
    selectedDate.getTime() >
      Date.now()
  ) {
    return undefined;
  }

  return selectedDate.toISOString();
}

export function MigrainePage() {
  const [
    showCrisisDate,
    setShowCrisisDate,
  ] = useState(false);

  const [
    showPremonitoryCrisisQuestion,
    setShowPremonitoryCrisisQuestion,
  ] = useState(false);

  const [
    showPremonitoryEndSelector,
    setShowPremonitoryEndSelector,
  ] = useState(false);

  const [
    premonitoryCrisisOutcome,
    setPremonitoryCrisisOutcome,
  ] = useState<
    PremonitoryCrisisOutcome | null
  >(null);

  const [
    premonitoryEndSelection,
    setPremonitoryEndSelection,
  ] = useState<
    PhaseEndSelection | null
  >(null);

  const [
    showRecoveryPremonitoryOptions,
    setShowRecoveryPremonitoryOptions,
  ] = useState(false);

  const [
    showRecoveryPremonitoryEnd,
    setShowRecoveryPremonitoryEnd,
  ] = useState(false);

  const [
    premonitoryRecoveryFeedback,
    setPremonitoryRecoveryFeedback,
  ] = useState('');

  const episode = useMigraineStore(
    state => state.activeEpisode,
  );

  const startEpisode =
    useMigraineStore(
      state => state.startEpisode,
    );

  const startCrisis =
    useMigraineStore(
      state => state.startCrisis,
    );

  const resolvePremonitory =
    useMigraineStore(
      state =>
        state.resolvePremonitory,
    );

  const updateTimeline =
    useMigraineStore(
      state => state.updateTimeline,
    );

  const completeEpisode =
    useMigraineStore(
      state => state.completeEpisode,
    );

  const isCrisisActive =
    episode?.crisis.active === true;

  const isRecoveryStage =
    Boolean(episode) &&
    !isCrisisActive &&
    episode?.status === 'postdrome';

  const isTrackingStage =
    Boolean(episode) &&
    !isCrisisActive &&
    !isRecoveryStage;

  const premonitoryEnd =
    episode?.timeline
      ?.premonitoryEnd ??
    episode?.premonitory.time
      ?.end?.value;

  const hasOpenPremonitory =
    episode?.premonitory.present ===
      true &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain' &&
    !premonitoryEnd;

  const premonitoryStart =
    episode?.timeline
      ?.premonitoryStart ??
    episode?.premonitory.time
      ?.start?.value;

  const crisisEnd =
    episode?.timeline?.crisisEnd ??
    episode?.crisis.endTime ??
    episode?.crisis.time?.end?.value;

  const postdromeStart =
    episode?.timeline
      ?.postdromeStart ??
    episode?.postdrome.startTime ??
    episode?.postdrome.time
      ?.start?.value;

  const postdromeEnd =
    episode?.timeline
      ?.postdromeEnd ??
    episode?.postdrome.endTime ??
    episode?.postdrome.time
      ?.end?.value;

  const hasPostdrome =
    episode?.postdrome.present ===
      true ||
    Boolean(postdromeStart);

  const isPostdromeEnded =
    episode?.postdrome.status ===
      'ended' ||
    Boolean(postdromeEnd);

  const isPostdromeActive =
    hasPostdrome &&
    !isPostdromeEnded;

  const canCompleteEpisode =
    !hasOpenPremonitory &&
    (
      !hasPostdrome ||
      isPostdromeEnded
    );

  const resetCrisisStartFlow =
    () => {
      setShowCrisisDate(false);

      setShowPremonitoryCrisisQuestion(
        false,
      );

      setShowPremonitoryEndSelector(
        false,
      );

      setPremonitoryCrisisOutcome(
        null,
      );

      setPremonitoryEndSelection(
        null,
      );
    };

  const resetRecoveryPremonitoryFlow =
    () => {
      setShowRecoveryPremonitoryOptions(
        false,
      );

      setShowRecoveryPremonitoryEnd(
        false,
      );

      setPremonitoryRecoveryFeedback(
        '',
      );
    };

  const handleNewEpisode = () => {
    resetCrisisStartFlow();

    resetRecoveryPremonitoryFlow();

    startEpisode();
  };

  const handleStartCrisis = () => {
    if (hasOpenPremonitory) {
      setShowPremonitoryCrisisQuestion(
        true,
      );

      setShowCrisisDate(false);

      return;
    }

    setShowCrisisDate(true);
  };

  const handleCancelCrisisStart =
    () => {
      resetCrisisStartFlow();
    };

  const handleEndsWithCrisis =
    () => {
      setPremonitoryCrisisOutcome(
        'endsWithCrisis',
      );

      setShowPremonitoryCrisisQuestion(
        false,
      );

      setShowCrisisDate(true);
    };

  const handleEndedAtAnotherTime =
    () => {
      setPremonitoryCrisisOutcome(
        'endedAtAnotherTime',
      );

      setShowPremonitoryCrisisQuestion(
        false,
      );

      setShowPremonitoryEndSelector(
        true,
      );
    };

  const handleContinuesWithCrisis =
    () => {
      setPremonitoryCrisisOutcome(
        'continuesWithCrisis',
      );

      setPremonitoryEndSelection(
        null,
      );

      setShowPremonitoryCrisisQuestion(
        false,
      );

      setShowPremonitoryEndSelector(
        false,
      );

      setShowCrisisDate(true);
    };

  const handleUnknownEnd = () => {
    setPremonitoryCrisisOutcome(
      'unknownEnd',
    );

    setPremonitoryEndSelection(
      null,
    );

    setShowPremonitoryCrisisQuestion(
      false,
    );

    setShowCrisisDate(true);
  };

  const handlePremonitoryEnd =
    (
      selection: PhaseEndSelection,
    ) => {
      setPremonitoryEndSelection(
        selection,
      );

      setShowPremonitoryEndSelector(
        false,
      );

      setShowCrisisDate(true);
    };

  const handlePremonitoryContinues =
    () => {
      handleContinuesWithCrisis();
    };

  const applyPremonitoryOutcome = (
    crisisStart: string,
  ) => {
    if (!hasOpenPremonitory) {
      return;
    }

    if (
      premonitoryCrisisOutcome ===
      'endsWithCrisis'
    ) {
      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        endTime: crisisStart,

        precision: 'exact',
      });

      return;
    }

    if (
      premonitoryCrisisOutcome ===
        'endedAtAnotherTime' &&
      premonitoryEndSelection
    ) {
      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        endTime:
          premonitoryEndSelection
            .endTime,

        precision:
          premonitoryEndSelection
            .precision,

        recordMode:
          premonitoryEndSelection
            .recordMode,
      });

      return;
    }

    if (
      premonitoryCrisisOutcome ===
      'continuesWithCrisis'
    ) {
      resolvePremonitory({
        outcome:
          'continuesWithCrisis',
      });

      return;
    }

    if (
      premonitoryCrisisOutcome ===
      'unknownEnd'
    ) {
      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        precision: 'unknown',

        recordMode:
          'retrospective',
      });
    }
  };

  const handleCrisisDate = (
    date: string,
  ) => {
    if (!episode) {
      return;
    }

    const selectedDate =
      createLocalDateTime(date);

    if (!selectedDate) {
      return;
    }

    applyPremonitoryOutcome(
      selectedDate,
    );

    updateTimeline({
      episodeStart:
        episode.timeline
          ?.episodeStart ??
        selectedDate,

      crisisStart: selectedDate,
    });

    startCrisis();

    resetCrisisStartFlow();
  };

  const handleOpenRecoveryResolution =
    () => {
      setShowRecoveryPremonitoryOptions(
        true,
      );

      setShowRecoveryPremonitoryEnd(
        false,
      );

      setPremonitoryRecoveryFeedback(
        '',
      );
    };

  const handleCancelRecoveryResolution =
    () => {
      setShowRecoveryPremonitoryOptions(
        false,
      );

      setShowRecoveryPremonitoryEnd(
        false,
      );
    };

  const handleEndedWithCrisis =
    () => {
      if (!crisisEnd) {
        setPremonitoryRecoveryFeedback(
          'No se encontró la hora de finalización de la crisis.',
        );

        return;
      }

      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        endTime: crisisEnd,

        precision:
          episode?.crisis.time?.end
            ?.precision ??
          'exact',

        recordMode:
          episode?.crisis.time?.end
            ?.recordMode,
      });

      setShowRecoveryPremonitoryOptions(
        false,
      );

      setPremonitoryRecoveryFeedback(
        'Las señales quedaron cerradas al finalizar la crisis.',
      );
    };

  const handleEndedDuringCrisis =
    () => {
      setShowRecoveryPremonitoryOptions(
        false,
      );

      setShowRecoveryPremonitoryEnd(
        true,
      );

      setPremonitoryRecoveryFeedback(
        '',
      );
    };

  const handleRecoveryPremonitoryEnd =
    (
      selection: PhaseEndSelection,
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

      setShowRecoveryPremonitoryEnd(
        false,
      );

      setShowRecoveryPremonitoryOptions(
        false,
      );

      setPremonitoryRecoveryFeedback(
        'Final de las señales registrado.',
      );
    };

  const handleContinuesAfterCrisis =
    () => {
      resolvePremonitory({
        outcome:
          'continuesWithCrisis',
      });

      setShowRecoveryPremonitoryOptions(
        false,
      );

      setShowRecoveryPremonitoryEnd(
        false,
      );

      setPremonitoryRecoveryFeedback(
        'Las señales continúan abiertas después de la crisis.',
      );
    };

  const handleUnknownRecoveryEnd =
    () => {
      resolvePremonitory({
        outcome:
          'evolvedToCrisis',

        precision: 'unknown',

        recordMode:
          'retrospective',
      });

      setShowRecoveryPremonitoryOptions(
        false,
      );

      setShowRecoveryPremonitoryEnd(
        false,
      );

      setPremonitoryRecoveryFeedback(
        'Las señales quedaron cerradas con hora de finalización desconocida.',
      );
    };

  const handleCompleteEpisode =
    () => {
      if (!canCompleteEpisode) {
        return;
      }

      completeEpisode();

      resetRecoveryPremonitoryFlow();
    };

  return (
    <section
      className={styles.container}
    >
      <h1>
        Seguimiento de migraña
      </h1>

      <p>
        Acompañamos todo el episodio:
        señales previas, crisis y
        recuperación.
      </p>

      {!episode && (
        <div>
          <h2>
            No hay un episodio activo
          </h2>

          <p>
            Podés comenzar un nuevo
            registro cuando aparezcan
            señales o cuando empiece una
            crisis.
          </p>

          <button
            type="button"
            onClick={handleNewEpisode}
          >
            Registrar nueva migraña
          </button>
        </div>
      )}

      {episode &&
        isCrisisActive && (
          <>
            <CrisisMode />

            {hasOpenPremonitory && (
              <section>
                <h2>
                  Señales previas que
                  continúan
                </h2>

                <p>
                  Las señales no se
                  cerraron al comenzar
                  el dolor. Podés seguir
                  registrando cómo
                  cambian durante la
                  crisis.
                </p>

                <PremonitorySelector
                  context="crisis"
                />
              </section>
            )}

            <MigraineDevTools />
          </>
        )}

      {episode &&
        isTrackingStage && (
          <>
            <section>
              <h2>
                Antes de la crisis
              </h2>

              <p>
                Podés registrar señales
                premonitorias, aura o
                comenzar directamente
                una crisis.
              </p>

              {!showCrisisDate &&
                !showPremonitoryCrisisQuestion &&
                !showPremonitoryEndSelector && (
                  <button
                    type="button"
                    onClick={
                      handleStartCrisis
                    }
                  >
                    Estoy entrando en
                    crisis
                  </button>
                )}

              {showPremonitoryCrisisQuestion && (
                <section>
                  <h3>
                    ¿Qué pasó con las
                    señales previas?
                  </h3>

                  <p>
                    Esto permite saber si
                    terminaron antes del
                    dolor o si continúan
                    durante la crisis.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleEndsWithCrisis
                    }
                  >
                    Terminaron cuando
                    empezó la crisis
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleEndedAtAnotherTime
                    }
                  >
                    Terminaron en otro
                    momento
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleContinuesWithCrisis
                    }
                  >
                    Continúan durante la
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
                      handleCancelCrisisStart
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
                      handlePremonitoryEnd
                    }
                    onContinue={
                      handlePremonitoryContinues
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      handleCancelCrisisStart
                    }
                  >
                    Cancelar inicio de
                    crisis
                  </button>
                </section>
              )}

              {showCrisisDate && (
                <>
                  <PhaseDateSelector
                    title="¿Cuándo empezó el dolor?"
                    value={
                      episode.crisis
                        .startTime
                    }
                    onChange={
                      handleCrisisDate
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
                        Las señales se
                        cerrarán en el
                        mismo momento en
                        que comience la
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
                        Se conservará la
                        hora de
                        finalización que
                        acabás de
                        registrar.
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
                        permanecerán
                        abiertas y podrás
                        actualizarlas
                        durante la
                        crisis.
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
                        Las señales
                        quedarán
                        vinculadas a la
                        crisis, pero con
                        hora de
                        finalización
                        desconocida.
                      </p>
                    )}

                  <button
                    type="button"
                    onClick={
                      handleCancelCrisisStart
                    }
                  >
                    Cancelar
                  </button>
                </>
              )}
            </section>

            <PremonitorySelector
              context="tracking"
            />

            <AuraSelector />

            <MigraineDevTools />
          </>
        )}

      {episode &&
        isRecoveryStage && (
          <>
            <section>
              <h2>
                Recuperación después de
                la crisis
              </h2>

              <p>
                La crisis terminó. Ahora
                podés registrar síntomas
                posteriores o finalizar
                el episodio.
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
                  episodio debemos
                  registrar qué ocurrió
                  con estas señales.
                </p>

                <PremonitorySelector
                  context="recovery"
                />

                {!showRecoveryPremonitoryOptions &&
                  !showRecoveryPremonitoryEnd && (
                    <button
                      type="button"
                      onClick={
                        handleOpenRecoveryResolution
                      }
                    >
                      Indicar cuándo
                      terminaron las
                      señales
                    </button>
                  )}

                {showRecoveryPremonitoryOptions && (
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
                      Continúan después
                      de la crisis
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleUnknownRecoveryEnd
                      }
                    >
                      No recuerdo cuándo
                      terminaron
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCancelRecoveryResolution
                      }
                    >
                      Cancelar
                    </button>
                  </section>
                )}

                {showRecoveryPremonitoryEnd && (
                  <PhaseEndSelector
                    title="¿Cuándo terminaron las señales previas?"
                    startTime={
                      premonitoryStart
                    }
                    onConfirm={
                      handleRecoveryPremonitoryEnd
                    }
                    onContinue={
                      handleContinuesAfterCrisis
                    }
                  />
                )}

                {premonitoryRecoveryFeedback && (
                  <p
                    className={
                      styles.helperText
                    }
                    aria-live="polite"
                  >
                    {
                      premonitoryRecoveryFeedback
                    }
                  </p>
                )}
              </section>
            )}

            <PostdromeSelector />

            <TriggerSelector />

            <TreatmentSelector />

            {hasOpenPremonitory && (
              <p
                className={
                  styles.helperText
                }
              >
                Las señales previas
                todavía continúan.
                Primero debés registrar
                cuándo terminaron.
              </p>
            )}

            {isPostdromeActive && (
              <p
                className={
                  styles.helperText
                }
              >
                El postdromo todavía
                continúa. Primero
                registrá cuándo sentiste
                la recuperación completa.
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
              {hasPostdrome
                ? 'Finalizar episodio'
                : 'Finalizar episodio sin postdromo'}
            </button>

            <MigraineDevTools />
          </>
        )}
    </section>
  );
}