import type {
  ClinicalPhase,
  MigraineEpisode,
  MigraineTrigger,
  TreatmentType,
} from '../../migraine/types/migraine.types';

import {
  migraineSymptomCatalog,
} from '../../migraine/data/clinicalSymptomCatalog';

import {
  TRIGGER_LABELS,
} from '../../migraine/data/triggerCatalog';

import {
  TREATMENT_TYPE_LABELS,
} from '../../migraine/data/treatmentCatalog';

import {
  getAveragePainIntensity,
  getCrisisDuration,
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import type {
  ClinicalMigraineReport,
  ClinicalReportPeriod,
  ClinicalReportTreatment,
} from '../types/clinicalReport.types';

import {
  createClinicalReportDateRange,
  filterEpisodesByReportPeriod,
} from './clinicalReportPeriod';

const PHASES:
  ClinicalPhase[] = [
  'premonitory',
  'aura',
  'crisis',
  'postdrome',
];

const roundToOneDecimal = (
  value: number,
): number => {
  return Number(
    value.toFixed(1),
  );
};

const calculatePercentage = (
  count: number,
  total: number,
): number => {
  if (total === 0) {
    return 0;
  }

  return roundToOneDecimal(
    (
      count /
      total
    ) * 100,
  );
};

const calculateAverage = (
  values: number[],
): number | undefined => {
  if (values.length === 0) {
    return undefined;
  }

  const total =
    values.reduce(
      (
        sum,
        value,
      ) => sum + value,
      0,
    );

  return roundToOneDecimal(
    total / values.length,
  );
};

const isValidDate = (
  value: unknown,
): value is string => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !Number.isNaN(
      new Date(value).getTime(),
    )
  );
};

const episodeHasCrisis = (
  episode: MigraineEpisode,
): boolean => {
  return Boolean(
    episode.timeline
      ?.crisisStart ||
    episode.crisis
      .startTime ||
    episode.crisis.time
      ?.start?.value ||
    episode.crisis.events
      ?.length ||
    episode.crisis
      .intensityHistory
      ?.length ||
    episode.crisis.active ||
    episode.crisis.status ===
      'active' ||
    episode.crisis.status ===
      'ended' ||
    episode.status ===
      'crisis' ||
    episode.status ===
      'postdrome',
  );
};

const phaseIsPresent = (
  episode: MigraineEpisode,
  phase: ClinicalPhase,
): boolean => {
  if (
    phase === 'premonitory'
  ) {
    return (
      episode.premonitory
        .present === true
    );
  }

  if (phase === 'aura') {
    return (
      episode.aura.present ===
      true
    );
  }

  if (phase === 'crisis') {
    return episodeHasCrisis(
      episode,
    );
  }

  return (
    episode.postdrome.present ===
    true
  );
};

const getAuraSymptoms = (
  episode: MigraineEpisode,
): string[] => {
  return [
    ...episode.aura.types,

    ...episode.aura
      .visualSymptoms,

    ...episode.aura
      .sensorySymptoms,

    ...episode.aura
      .languageSymptoms,

    ...(
      episode.aura
        .motorSymptoms ?? []
    ),

    ...(
      episode.aura
        .vestibularSymptoms ?? []
    ),

    ...(
      episode.aura
        .clinicalSymptoms ?? []
    ).map(
      selection =>
        selection.symptom,
    ),

    ...(
      episode.aura
        .customSymptoms ?? []
    ).map(
      symptom =>
        symptom.label,
    ),
  ];
};

const getEpisodeSymptoms = (
  episode: MigraineEpisode,
): string[] => {
  return Array.from(
    new Set([
      ...episode.premonitory
        .symptoms,

      ...getAuraSymptoms(
        episode,
      ),

      ...episode.crisis
        .symptoms,

      ...episode.postdrome
        .symptoms,
    ]),
  );
};

const getSymptomLabel = (
  symptomId: string,
): string => {
  return (
    migraineSymptomCatalog.find(
      definition =>
        definition.value ===
        symptomId,
    )?.label ?? symptomId
  );
};

const getEpisodeTreatmentType =
  (
    episode: MigraineEpisode,
  ): TreatmentType | undefined => {
    const treatment =
      episode.treatment;

    if (treatment.type) {
      return treatment.type;
    }

    if (
      treatment.medication
        ?.trim() ||
      treatment.dose?.trim()
    ) {
      return 'medication';
    }

    return undefined;
  };

const episodeHasTreatmentData =
  (
    episode: MigraineEpisode,
  ): boolean => {
    const treatment =
      episode.treatment;

    return Boolean(
      treatment.type ||
      treatment.medication
        ?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment
        .responseTimeMinutes !==
        undefined ||
      treatment.sideEffects
        ?.length ||
      treatment.notes?.trim(),
    );
  };

const calculateMonthsObserved = (
  episodes: MigraineEpisode[],
  rangeStart: string | undefined,
  rangeEnd: string,
): number => {
  if (episodes.length === 0) {
    return 0;
  }

  const episodeDates =
    episodes
      .map(
        episode =>
          episode.createdAt,
      )
      .filter(isValidDate)
      .map(
        value =>
          new Date(
            value,
          ).getTime(),
      );

  if (
    episodeDates.length === 0
  ) {
    return 0;
  }

  const firstTimestamp =
    rangeStart
      ? new Date(
          rangeStart,
        ).getTime()
      : Math.min(
          ...episodeDates,
        );

  const endTimestamp =
    new Date(
      rangeEnd,
    ).getTime();

  const elapsedDays =
    Math.max(
      1,
      (
        endTimestamp -
        firstTimestamp
      ) /
        86_400_000,
    );

  return Math.max(
    1,
    roundToOneDecimal(
      elapsedDays / 30.4375,
    ),
  );
};

const createTreatmentSummary = (
  episodes: MigraineEpisode[],
): ClinicalReportTreatment[] => {
  const treatments =
    new Map<
      TreatmentType,
      ClinicalReportTreatment
    >();

  episodes.forEach(
    episode => {
      const type =
        getEpisodeTreatmentType(
          episode,
        );

      if (!type) {
        return;
      }

      const current =
        treatments.get(type) ?? {
          type,

          label:
            TREATMENT_TYPE_LABELS[
              type
            ],

          episodeCount: 0,

          effectiveness: {},
        };

      current.episodeCount += 1;

      const effectiveness =
        episode.treatment
          .effectiveness;

      if (effectiveness) {
        current.effectiveness[
          effectiveness
        ] =
          (
            current.effectiveness[
              effectiveness
            ] ?? 0
          ) + 1;
      }

      treatments.set(
        type,
        current,
      );
    },
  );

  return Array.from(
    treatments.values(),
  ).sort(
    (
      first,
      second,
    ) =>
      second.episodeCount -
      first.episodeCount,
  );
};

export const createClinicalMigraineReport =
  (
    allEpisodes:
      MigraineEpisode[],
    period:
      ClinicalReportPeriod,
    referenceDate = new Date(),
  ): ClinicalMigraineReport => {
    const dateRange =
      createClinicalReportDateRange(
        period,
        referenceDate,
      );

    const episodes =
      filterEpisodesByReportPeriod(
        allEpisodes,
        dateRange,
      );

    const crisisEpisodes =
      episodes.filter(
        episodeHasCrisis,
      );

    const episodesWithoutCrisis =
      episodes.length -
      crisisEpisodes.length;

    const monthsObserved =
      calculateMonthsObserved(
        episodes,
        dateRange.start,
        dateRange.end,
      );

    const painEpisodes =
      crisisEpisodes.filter(
        episode =>
          Number.isFinite(
            episode.crisis
              .intensity,
          ),
      );

    const averagePainValues =
      painEpisodes.map(
        getAveragePainIntensity,
      );

    const maximumPainValues =
      painEpisodes.map(
        getMaxPainIntensity,
      );

    const crisisDurations =
      crisisEpisodes
        .map(
          getCrisisDuration,
        )
        .filter(
          (
            duration,
          ): duration is number =>
            duration !==
            undefined,
        );

    const symptomCounts =
      new Map<string, number>();

    episodes.forEach(
      episode => {
        getEpisodeSymptoms(
          episode,
        ).forEach(
          symptom => {
            symptomCounts.set(
              symptom,
              (
                symptomCounts.get(
                  symptom,
                ) ?? 0
              ) + 1,
            );
          },
        );
      },
    );

    const triggerCounts =
      new Map<
        MigraineTrigger,
        number
      >();

    episodes.forEach(
      episode => {
        new Set(
          episode.triggers,
        ).forEach(
          trigger => {
            triggerCounts.set(
              trigger,
              (
                triggerCounts.get(
                  trigger,
                ) ?? 0
              ) + 1,
            );
          },
        );
      },
    );

    const episodesWithSymptomData =
      episodes.filter(
        episode =>
          getEpisodeSymptoms(
            episode,
          ).length > 0,
      ).length;

    const episodesWithTriggerData =
      episodes.filter(
        episode =>
          episode.triggers
            .length > 0,
      ).length;

    const episodesWithTreatmentData =
      episodes.filter(
        episodeHasTreatmentData,
      ).length;

    return {
      generatedAt:
        referenceDate.toISOString(),

      dateRange,

      coverage: {
        totalEpisodes:
          episodes.length,

        episodesWithCrisis:
          crisisEpisodes.length,

        episodesWithoutCrisis,

        incompleteEpisodes:
          episodes.filter(
            episode =>
              episode.status ===
              'incomplete',
          ).length,

        monthsObserved,
      },

      frequency: {
        episodesPerMonth:
          monthsObserved > 0
            ? roundToOneDecimal(
                episodes.length /
                  monthsObserved,
              )
            : undefined,

        crisesPerMonth:
          monthsObserved > 0
            ? roundToOneDecimal(
                crisisEpisodes.length /
                  monthsObserved,
              )
            : undefined,
      },

      pain: {
        episodesWithPainData:
          painEpisodes.length,

        averageIntensity:
          calculateAverage(
            averagePainValues,
          ),

        maximumIntensity:
          maximumPainValues.length >
          0
            ? Math.max(
                ...maximumPainValues,
              )
            : undefined,
      },

      duration: {
        crisesWithDurationData:
          crisisDurations.length,

        averageMinutes:
          calculateAverage(
            crisisDurations,
          ),

        shortestMinutes:
          crisisDurations.length >
          0
            ? Math.min(
                ...crisisDurations,
              )
            : undefined,

        longestMinutes:
          crisisDurations.length >
          0
            ? Math.max(
                ...crisisDurations,
              )
            : undefined,
      },

      phases:
        PHASES.map(
          phase => {
            const count =
              episodes.filter(
                episode =>
                  phaseIsPresent(
                    episode,
                    phase,
                  ),
              ).length;

            return {
              phase,
              count,

              percentage:
                calculatePercentage(
                  count,
                  episodes.length,
                ),
            };
          },
        ),

      symptoms:
        Array.from(
          symptomCounts.entries(),
        )
          .map(
            ([
              id,
              episodeCount,
            ]) => ({
              id,

              label:
                getSymptomLabel(
                  id,
                ),

              episodeCount,

              percentage:
                calculatePercentage(
                  episodeCount,
                  episodes.length,
                ),
            }),
          )
          .sort(
            (
              first,
              second,
            ) =>
              second.episodeCount -
                first.episodeCount ||
              first.label.localeCompare(
                second.label,
                'es',
              ),
          ),

      triggers:
        Array.from(
          triggerCounts.entries(),
        )
          .map(
            ([
              trigger,
              episodeCount,
            ]) => ({
              trigger,

              label:
                TRIGGER_LABELS[
                  trigger
                ],

              episodeCount,

              percentage:
                calculatePercentage(
                  episodeCount,
                  episodesWithTriggerData,
                ),
            }),
          )
          .sort(
            (
              first,
              second,
            ) =>
              second.episodeCount -
                first.episodeCount ||
              first.label.localeCompare(
                second.label,
                'es',
              ),
          ),

      treatments:
        createTreatmentSummary(
          episodes,
        ),

      dataQuality: {
        episodesWithSymptomData,

        episodesWithTriggerData,

        episodesWithTreatmentData,

        episodesWithCompleteCrisisDates:
          crisisDurations.length,
      },
    };
  };