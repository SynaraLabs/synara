import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  getCrisisDuration,
} from '../../migraine/utils/episodeCalculations';

import {
  getTopCrisisSymptoms,
  getTopPainLocations,
  getTopTriggers,
  type RankedPattern,
} from './patternRankingCalculations';

import {
  getPhasePatterns,
  type PhasePatterns,
} from './phasePatternCalculations';

import {
  getTreatmentPatterns,
  type TreatmentPatterns,
} from './treatmentPatternCalculations';

export interface BasicMigrainePatterns {
  totalRecords: number;

  crisisCount: number;

  averageMaxPain: number;

  maximumPain: number;

  averageCrisisDurationMinutes?:
    number;

  lastCrisisDate?: string;

  topTriggers: RankedPattern[];

  topCrisisSymptoms:
    RankedPattern[];

  topPainLocations:
    RankedPattern[];

  treatmentPatterns:
    TreatmentPatterns;

  phasePatterns:
    PhasePatterns;
}

const isValidDate = (
  value?: string,
): value is string => {
  if (!value) {
    return false;
  }

  return !Number.isNaN(
    new Date(value).getTime(),
  );
};

const hasCrisisData = (
  episode: MigraineEpisode,
): boolean => {
  const crisis =
    episode.crisis;

  const start =
    episode.timeline?.crisisStart ??
    crisis.startTime ??
    crisis.time?.start?.value;

  const end =
    episode.timeline?.crisisEnd ??
    crisis.endTime ??
    crisis.time?.end?.value;

  return Boolean(
    crisis.active === true ||
      isValidDate(start) ||
      isValidDate(end) ||
      crisis.intensityHistory
        ?.length ||
      crisis.events?.length ||
      crisis.locationHistory
        ?.length,
  );
};

const getEpisodeMaximumPain = (
  episode: MigraineEpisode,
): number => {
  const historyValues =
    episode.crisis
      .intensityHistory ?? [];

  const values = [
    episode.crisis.intensity ?? 0,

    ...historyValues.map(
      record =>
        record.intensity,
    ),
  ];

  return Math.max(
    0,
    ...values,
  );
};

const getValidCrisisDuration = (
  episode: MigraineEpisode,
): number | undefined => {
  const calculatedDuration =
    getCrisisDuration(episode);

  if (
    calculatedDuration !==
      undefined &&
    calculatedDuration >= 0
  ) {
    return calculatedDuration;
  }

  const storedDuration =
    episode.crisis
      .durationMinutes;

  if (
    storedDuration === undefined ||
    !Number.isFinite(
      storedDuration,
    ) ||
    storedDuration < 0
  ) {
    return undefined;
  }

  return storedDuration;
};

const getCrisisDate = (
  episode: MigraineEpisode,
): string | undefined => {
  const candidates = [
    episode.timeline?.crisisStart,
    episode.crisis.startTime,
    episode.crisis.time?.start
      ?.value,
    episode.createdAt,
  ];

  return candidates.find(
    isValidDate,
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

  return Number(
    (
      total / values.length
    ).toFixed(1),
  );
};

export function getBasicMigrainePatterns(
  history: MigraineEpisode[],
): BasicMigrainePatterns {
  const crisisEpisodes =
    history.filter(
      hasCrisisData,
    );

  const maximumPainValues =
    crisisEpisodes.map(
      getEpisodeMaximumPain,
    );

  const durationValues =
    crisisEpisodes
      .map(
        getValidCrisisDuration,
      )
      .filter(
        (
          duration,
        ): duration is number =>
          duration !== undefined,
      );

  const crisisDates =
    crisisEpisodes
      .map(getCrisisDate)
      .filter(
        (
          date,
        ): date is string =>
          date !== undefined,
      )
      .sort(
        (first, second) =>
          new Date(second)
            .getTime() -
          new Date(first)
            .getTime(),
      );

  return {
    totalRecords:
      history.length,

    crisisCount:
      crisisEpisodes.length,

    averageMaxPain:
      calculateAverage(
        maximumPainValues,
      ) ?? 0,

    maximumPain:
      maximumPainValues.length >
      0
        ? Math.max(
            ...maximumPainValues,
          )
        : 0,

    averageCrisisDurationMinutes:
      calculateAverage(
        durationValues,
      ),

    lastCrisisDate:
      crisisDates[0],

    topTriggers:
      getTopTriggers(
        crisisEpisodes,
      ),

    topCrisisSymptoms:
      getTopCrisisSymptoms(
        crisisEpisodes,
      ),

    topPainLocations:
      getTopPainLocations(
        crisisEpisodes,
      ),

    treatmentPatterns:
      getTreatmentPatterns(
        crisisEpisodes,
      ),

    phasePatterns:
      getPhasePatterns(
        crisisEpisodes,
      ),
  };
}