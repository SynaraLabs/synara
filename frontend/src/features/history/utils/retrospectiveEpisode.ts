import type {
  AuraClinicalSymptom,
  ClinicalPhase,
  ExtendedCrisisSymptom,
  ExtendedPostdromeSymptom,
  ExtendedPremonitorySymptom,
  MigraineEpisode,
  PhaseTime,
  PhaseTimeRange,
  SymptomSelection,
} from '../../migraine/types/migraine.types';

import type {
  ClinicalSymptomId,
} from '../../migraine/data/clinicalSymptomCatalog';

export type PhaseBoundary =
  | 'start'
  | 'end';

const createRetrospectiveTime = (
  value: string,
): PhaseTime => {
  return {
    value,
    precision: 'exact',
    recordMode:
      'retrospective',
  };
};

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

const getLatestDate = (
  values:
    (string | undefined)[],
): string | undefined => {
  const validValues =
    values.filter(
      isValidDate,
    );

  if (
    validValues.length === 0
  ) {
    return undefined;
  }

  return validValues.reduce(
    (
      latest,
      current,
    ) =>
      new Date(current).getTime() >
      new Date(latest).getTime()
        ? current
        : latest,
  );
};

const mergeSelections = (
  legacySymptoms:
    ClinicalSymptomId[],
  clinicalSymptoms:
    SymptomSelection<
      ClinicalSymptomId
    >[],
): SymptomSelection<
  ClinicalSymptomId
>[] => {
  const selections =
    new Map<
      ClinicalSymptomId,
      SymptomSelection<
        ClinicalSymptomId
      >
    >();

  legacySymptoms.forEach(
    symptom => {
      selections.set(
        symptom,
        {
          symptom,
        },
      );
    },
  );

  clinicalSymptoms.forEach(
    selection => {
      selections.set(
        selection.symptom,
        selection,
      );
    },
  );

  return Array.from(
    selections.values(),
  );
};

export const getRetrospectivePhaseSymptoms =
  (
    episode: MigraineEpisode,
    phase: ClinicalPhase,
  ): SymptomSelection<
    ClinicalSymptomId
  >[] => {
    if (
      phase === 'premonitory'
    ) {
      return mergeSelections(
        episode.premonitory
          .symptoms,
        (
          episode.premonitory
            .clinicalSymptoms ??
          []
        ) as SymptomSelection<
          ClinicalSymptomId
        >[],
      );
    }

    if (phase === 'aura') {
      return mergeSelections(
        [
          ...episode.aura
            .visualSymptoms,
          ...episode.aura
            .sensorySymptoms,
          ...episode.aura
            .languageSymptoms,
          ...(
            episode.aura
              .motorSymptoms ??
            []
          ),
          ...(
            episode.aura
              .vestibularSymptoms ??
            []
          ),
        ] as ClinicalSymptomId[],
        (
          episode.aura
            .clinicalSymptoms ??
          []
        ) as SymptomSelection<
          ClinicalSymptomId
        >[],
      );
    }

    if (phase === 'crisis') {
      return mergeSelections(
        episode.crisis
          .symptoms,
        (
          episode.crisis
            .clinicalSymptoms ??
          []
        ) as SymptomSelection<
          ClinicalSymptomId
        >[],
      );
    }

    return mergeSelections(
      episode.postdrome
        .symptoms,
      (
        episode.postdrome
          .clinicalSymptoms ??
        []
      ) as SymptomSelection<
        ClinicalSymptomId
      >[],
    );
  };

export const setRetrospectivePhaseSymptoms =
  (
    episode: MigraineEpisode,
    phase: ClinicalPhase,
    selections:
      SymptomSelection<
        ClinicalSymptomId
      >[],
  ): MigraineEpisode => {
    if (
      phase === 'premonitory'
    ) {
      return {
        ...episode,

        premonitory: {
          ...episode.premonitory,

          present: true,

          symptoms: [],

          clinicalSymptoms:
            selections as SymptomSelection<
              ExtendedPremonitorySymptom
            >[],
        },
      };
    }

    if (phase === 'aura') {
      return {
        ...episode,

        aura: {
          ...episode.aura,

          present: true,

          types: [],

          visualSymptoms: [],

          sensorySymptoms: [],

          languageSymptoms: [],

          motorSymptoms: [],

          vestibularSymptoms: [],

          clinicalSymptoms:
            selections as SymptomSelection<
              AuraClinicalSymptom
            >[],
        },
      };
    }

    if (phase === 'crisis') {
      return {
        ...episode,

        crisis: {
          ...episode.crisis,

          symptoms: [],

          clinicalSymptoms:
            selections as SymptomSelection<
              ExtendedCrisisSymptom
            >[],
        },
      };
    }

    return {
      ...episode,

      postdrome: {
        ...episode.postdrome,

        present: true,

        symptoms: [],

        clinicalSymptoms:
          selections as SymptomSelection<
            ExtendedPostdromeSymptom
          >[],
      },
    };
  };

export const getRetrospectivePhaseTime =
  (
    episode: MigraineEpisode,
    phase: ClinicalPhase,
  ): PhaseTimeRange => {
    if (
      phase === 'premonitory'
    ) {
      return (
        episode.premonitory
          .time ?? {}
      );
    }

    if (phase === 'aura') {
      return (
        episode.aura.time ?? {}
      );
    }

    if (phase === 'crisis') {
      return {
        ...(
          episode.crisis.time ??
          {}
        ),

        start:
          episode.crisis.time
            ?.start ??
          (
            episode.crisis
              .startTime
              ? createRetrospectiveTime(
                  episode.crisis
                    .startTime,
                )
              : undefined
          ),

        end:
          episode.crisis.time
            ?.end ??
          (
            episode.crisis
              .endTime
              ? createRetrospectiveTime(
                  episode.crisis
                    .endTime,
                )
              : undefined
          ),
      };
    }

    return {
      ...(
        episode.postdrome.time ??
        {}
      ),

      start:
        episode.postdrome.time
          ?.start ??
        (
          episode.postdrome
            .startTime
            ? createRetrospectiveTime(
                episode.postdrome
                  .startTime,
              )
            : undefined
        ),

      end:
        episode.postdrome.time
          ?.end ??
        (
          episode.postdrome
            .endTime
            ? createRetrospectiveTime(
                episode.postdrome
                  .endTime,
              )
            : undefined
        ),
    };
  };

export const setRetrospectivePhaseTime =
  (
    episode: MigraineEpisode,
    phase: ClinicalPhase,
    boundary: PhaseBoundary,
    value: string,
  ): MigraineEpisode => {
    const normalizedValue =
      value.trim();

    const phaseTime =
      normalizedValue
        ? createRetrospectiveTime(
            normalizedValue,
          )
        : undefined;

    const currentTime =
      getRetrospectivePhaseTime(
        episode,
        phase,
      );

    const updatedTime:
      PhaseTimeRange = {
      ...currentTime,

      [boundary]:
        phaseTime,
    };

    const timeline = {
      ...(episode.timeline ?? {}),
    };

    if (
      phase === 'premonitory'
    ) {
      if (
        boundary === 'start'
      ) {
        timeline.premonitoryStart =
          normalizedValue ||
          undefined;
      } else {
        timeline.premonitoryEnd =
          normalizedValue ||
          undefined;
      }

      return {
        ...episode,

        timeline,

        premonitory: {
          ...episode.premonitory,

          present: true,

          status:
            updatedTime.end
              ? 'ended'
              : 'active',

          time:
            updatedTime,
        },
      };
    }

    if (phase === 'aura') {
      if (
        boundary === 'start'
      ) {
        timeline.auraStart =
          normalizedValue ||
          undefined;
      } else {
        timeline.auraEnd =
          normalizedValue ||
          undefined;
      }

      return {
        ...episode,

        timeline,

        aura: {
          ...episode.aura,

          present: true,

          status:
            updatedTime.end
              ? 'ended'
              : 'active',

          time:
            updatedTime,
        },
      };
    }

    if (phase === 'crisis') {
      if (
        boundary === 'start'
      ) {
        timeline.crisisStart =
          normalizedValue ||
          undefined;
      } else {
        timeline.crisisEnd =
          normalizedValue ||
          undefined;
      }

      return {
        ...episode,

        timeline,

        crisis: {
          ...episode.crisis,

          active: false,

          status:
            updatedTime.end
              ? 'ended'
              : 'uncertain',

          time:
            updatedTime,

          startTime:
            updatedTime.start
              ?.value ?? '',

          endTime:
            updatedTime.end
              ?.value,
        },
      };
    }

    if (
      boundary === 'start'
    ) {
      timeline.postdromeStart =
        normalizedValue ||
        undefined;
    } else {
      timeline.postdromeEnd =
        normalizedValue ||
        undefined;
    }

    return {
      ...episode,

      timeline,

      postdrome: {
        ...episode.postdrome,

        present: true,

        status:
          updatedTime.end
            ? 'ended'
            : 'uncertain',

        time:
          updatedTime,

        startTime:
          updatedTime.start
            ?.value,

        endTime:
          updatedTime.end
            ?.value,
      },
    };
  };

export const setRetrospectivePhaseNotes =
  (
    episode: MigraineEpisode,
    phase: ClinicalPhase,
    notes: string,
  ): MigraineEpisode => {
    if (
      phase === 'premonitory'
    ) {
      return {
        ...episode,

        premonitory: {
          ...episode.premonitory,
          notes,
        },
      };
    }

    if (phase === 'aura') {
      return {
        ...episode,

        aura: {
          ...episode.aura,
          notes,
        },
      };
    }

    if (phase === 'crisis') {
      return {
        ...episode,

        crisis: {
          ...episode.crisis,
          notes,
        },
      };
    }

    return {
      ...episode,

      postdrome: {
        ...episode.postdrome,
        notes,
      },
    };
  };

export const normalizeRetrospectiveEpisode =
  (
    episode: MigraineEpisode,
  ): MigraineEpisode => {
    const timeline = {
      ...(episode.timeline ?? {}),
    };

    const crisisStart =
      timeline.crisisStart ??
      episode.crisis
        .startTime ??
      episode.crisis.time
        ?.start?.value;

    const crisisEnd =
      timeline.crisisEnd ??
      episode.crisis
        .endTime ??
      episode.crisis.time
        ?.end?.value;

    const hasCrisis =
      isValidDate(crisisStart);

    const hasPostdrome =
      episode.postdrome
        .present === true;

    let normalizedEpisode = {
      ...episode,

      timeline,

      recordMode:
        episode.recordMode,

      crisis: {
        ...episode.crisis,

        active: false,
      },
    };

    if (hasCrisis) {
      normalizedEpisode = {
        ...normalizedEpisode,

        status:
          isValidDate(crisisEnd)
            ? 'completed'
            : 'incomplete',

        completionReason:
          hasPostdrome
            ? 'recovered'
            : 'crisisWithoutPostdrome',

        premonitory:
          episode.premonitory
            .present
            ? {
                ...episode
                  .premonitory,

                status:
                  episode
                    .premonitory
                    .time?.end ||
                  timeline
                    .premonitoryEnd
                    ? 'ended'
                    : 'ended',

                evolvedToCrisis:
                  true,

                endedWithoutCrisis:
                  false,
              }
            : episode.premonitory,
      };
    }

    if (
      hasPostdrome &&
      isValidDate(crisisEnd)
    ) {
      const postdromeStart =
        timeline.postdromeStart ??
        episode.postdrome
          .startTime ??
        episode.postdrome.time
          ?.start?.value ??
        crisisEnd;

      timeline.postdromeStart =
        postdromeStart;

      normalizedEpisode = {
        ...normalizedEpisode,

        timeline,

        postdrome: {
          ...normalizedEpisode
            .postdrome,

          startTime:
            postdromeStart,

          time: {
            ...(
              normalizedEpisode
                .postdrome.time ??
              {}
            ),

            start:
              normalizedEpisode
                .postdrome.time
                ?.start ??
              createRetrospectiveTime(
                postdromeStart,
              ),
          },
        },
      };
    }

    const episodeEnd =
      getLatestDate([
        timeline.postdromeEnd,
        normalizedEpisode
          .postdrome.endTime,
        normalizedEpisode
          .postdrome.time?.end
          ?.value,
        crisisEnd,
        timeline.auraEnd,
        normalizedEpisode.aura
          .time?.end?.value,
        timeline.premonitoryEnd,
        normalizedEpisode
          .premonitory.time?.end
          ?.value,
      ]);

    return {
      ...normalizedEpisode,

      timeline: {
        ...timeline,

        episodeStart:
          timeline.episodeStart ??
          timeline.premonitoryStart ??
          normalizedEpisode
            .premonitory.time
            ?.start?.value ??
          timeline.auraStart ??
          normalizedEpisode.aura
            .time?.start?.value ??
          crisisStart ??
          normalizedEpisode
            .createdAt,

        episodeEnd:
          episodeEnd ??
          timeline.episodeEnd,
      },
    };
  };