import {
  useState,
} from 'react';

import { AuraSelector } from '../components/AuraSelector';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from '../components/common/PhaseEndSelector';

import { PhaseDateSelector } from '../components/common/PhaseDateSelector';
import { CrisisMode } from '../components/crisis-mode/CrisisMode';
import { MigraineDevTools } from '../components/dev/MigraineDevTools';
import { PremonitorySelector } from '../components/PremonitorySelector';
import { RecoveryStage } from '../components/RecoveryStage';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

type PremonitoryCrisisOutcome =
  | 'endsWithCrisis'
  | 'endedAtAnotherTime'
  | 'continuesWithCrisis'
  | 'unknownEnd';

const createLocalDateTime = (
  date: string,
): string | undefined => {
  const [
    yearValue,
    monthValue,
    dayValue,
  ] = date.split('-');

  const year =
    Number(yearValue);

  const month =
    Number(monthValue);

  const day =
    Number(dayValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return undefined;
  }

  const now = new Date();

  const selectedDate =
    new Date(
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
    selectedDate.getDate() ===
      day;

  if (
    !isValidDate ||
    selectedDate.getTime() >
      Date.now()
  ) {
    return undefined;
  }

  return selectedDate.toISOString();
};

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

  const episode =
    useMigraineStore(
      state =>
        state.activeEpisode,
    );

  const startEpisode =
    useMigraineStore(
      state =>
        state.startEpisode,
    );

  const startCrisis =
    useMigraineStore(
      state =>
        state.startCrisis,
    );

  const resolvePremonitory =
    useMigraineStore(
      state =>
        state.resolvePremonitory,
    );

  const updateTimeline =
    useMigraineStore(
      state =>
        state.updateTimeline,
    );

  const isCrisisActive =
    episode?.crisis.active ===
    true;

  const isRecoveryStage =
    Boolean(episode) &&
    !isCrisisActive &&
    episode?.status ===
      'postdrome';

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

  const handleNewEpisode = () => {
    resetCrisisStartFlow();

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

  const handlePremonitoryEnd = (
    selection:
      PhaseEndSelection,
  ) => {
    setPremonitoryEndSelection(
      selection,
    );

    setShowPremonitoryEndSelector(
      false,
    );

    setShowCrisisDate(true);
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

        endTime:
          crisisStart,

        precision:
          'exact',
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

        precision:
          'unknown',

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
      createLocalDateTime(
        date,
      );

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

      crisisStart:
        selectedDate,
    });

    startCrisis();

    resetCrisisStartFlow();
  };

  return (
    <section
      className={
        styles.container
      }
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
            onClick={
              handleNewEpisode
            }
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
                    Esto permite saber
                    si terminaron antes
                    del dolor o si
                    continúan durante la
                    crisis.
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
                      handleContinuesWithCrisis
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
                        cerrarán cuando
                        comience la
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
                        abiertas durante
                        la crisis.
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
                        quedarán con hora
                        de finalización
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
          <RecoveryStage
            episode={episode}
          />
        )}
    </section>
  );
}