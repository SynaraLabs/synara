import {
  useState,
} from 'react';

import type {
  PhaseEndSelection,
} from '../components/common/PhaseEndSelector';

import {
  CrisisMode,
} from '../components/crisis-mode/CrisisMode';

import {
  MigraineDevTools,
} from '../components/dev/MigraineDevTools';

import {
  EmptyEpisodeState,
} from '../components/EmptyEpisodeState';

import {
  RecoveryStage,
} from '../components/RecoveryStage';

import {
  TrackingStage,
  type PremonitoryCrisisOutcome,
} from '../components/TrackingStage';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

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

  const now =
    new Date();

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

  const handleNewEpisode =
    () => {
      resetCrisisStartFlow();

      startEpisode();
    };

  const handleStartCrisis =
    () => {
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

  const handleUnknownEnd =
    () => {
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
      {!episode && (
        <EmptyEpisodeState
          onStart={handleNewEpisode}
        />
      )}

      {episode &&
        isCrisisActive && (
          <>
            <CrisisMode />

            <MigraineDevTools />
          </>
        )}

      {episode &&
        isTrackingStage && (
          <>
            <TrackingStage
              episode={episode}
              hasOpenPremonitory={
                hasOpenPremonitory
              }
              premonitoryStart={
                premonitoryStart
              }
              showCrisisDate={
                showCrisisDate
              }
              showPremonitoryCrisisQuestion={
                showPremonitoryCrisisQuestion
              }
              showPremonitoryEndSelector={
                showPremonitoryEndSelector
              }
              premonitoryCrisisOutcome={
                premonitoryCrisisOutcome
              }
              premonitoryEndSelection={
                premonitoryEndSelection
              }
              onStartCrisis={
                handleStartCrisis
              }
              onCancelCrisisStart={
                handleCancelCrisisStart
              }
              onEndsWithCrisis={
                handleEndsWithCrisis
              }
              onEndedAtAnotherTime={
                handleEndedAtAnotherTime
              }
              onContinuesWithCrisis={
                handleContinuesWithCrisis
              }
              onUnknownEnd={
                handleUnknownEnd
              }
              onPremonitoryEnd={
                handlePremonitoryEnd
              }
              onCrisisDate={
                handleCrisisDate
              }
            />

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