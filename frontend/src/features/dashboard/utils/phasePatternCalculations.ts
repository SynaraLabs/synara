import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

export interface PhasePresencePattern {
  count: number;

  percentage: number;
}

export interface PhasePatterns {
  premonitory:
    PhasePresencePattern;

  aura:
    PhasePresencePattern;

  postdrome:
    PhasePresencePattern;

  crisesLast30Days: number;

  averageCrisesPer30Days?:
    number;

  observationPeriodDays?:
    number;
}

const DAYS_30_IN_MILLISECONDS =
  30 * 24 * 60 * 60 * 1000;

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

const hasPremonitoryData = (
  episode: MigraineEpisode,
): boolean => {
  return Boolean(
    episode.premonitory
      .present === true ||
      episode.premonitory
        .symptoms?.length ||
      episode.premonitory
        .updates?.length ||
      isValidDate(
        episode.timeline
          ?.premonitoryStart ??
          episode.premonitory
            .time?.start?.value,
      ),
  );
};

const hasAuraData = (
  episode: MigraineEpisode,
): boolean => {
  const aura =
    episode.aura;

  return Boolean(
    aura.present === true ||
      aura.types?.length ||
      aura.visualSymptoms?.length ||
      aura.sensorySymptoms?.length ||
      aura.languageSymptoms
        ?.length ||
      aura.motorSymptoms?.length ||
      aura.vestibularSymptoms
        ?.length ||
      aura.clinicalSymptoms
        ?.length ||
      aura.updates?.length ||
      isValidDate(
        episode.timeline
          ?.auraStart ??
          aura.time?.start?.value,
      ),
  );
};

const hasPostdromeData = (
  episode: MigraineEpisode,
): boolean => {
  const postdrome =
    episode.postdrome;

  return Boolean(
    postdrome.present === true ||
      postdrome.symptoms
        ?.length ||
      postdrome
        .clinicalSymptoms
        ?.length ||
      postdrome.updates?.length ||
      isValidDate(
        episode.timeline
          ?.postdromeStart ??
          postdrome.startTime ??
          postdrome.time?.start
            ?.value,
      ),
  );
};

const buildPresencePattern = (
  count: number,
  total: number,
): PhasePresencePattern => {
  return {
    count,

    percentage:
      total > 0
        ? Math.round(
            (
              count /
              total
            ) * 100,
          )
        : 0,
  };
};

const getFrequencyData = (
  episodes: MigraineEpisode[],
): Pick<
  PhasePatterns,
  | 'crisesLast30Days'
  | 'averageCrisesPer30Days'
  | 'observationPeriodDays'
> => {
  const timestamps =
    episodes
      .map(getCrisisDate)
      .filter(
        (
          date,
        ): date is string =>
          date !== undefined,
      )
      .map(
        date =>
          new Date(
            date,
          ).getTime(),
      )
      .sort(
        (
          first,
          second,
        ) => first - second,
      );

  if (
    timestamps.length === 0
  ) {
    return {
      crisesLast30Days: 0,
    };
  }

  const now =
    Date.now();

  const thirtyDaysAgo =
    now -
    DAYS_30_IN_MILLISECONDS;

  const crisesLast30Days =
    timestamps.filter(
      timestamp =>
        timestamp >=
          thirtyDaysAgo &&
        timestamp <= now,
    ).length;

  if (
    timestamps.length < 2
  ) {
    return {
      crisesLast30Days,
    };
  }

  const first =
    timestamps[0];

  const last =
    timestamps[
      timestamps.length - 1
    ];

  const observationPeriodDays =
    Math.max(
      1,
      Math.ceil(
        (
          last - first
        ) /
          (
            24 *
            60 *
            60 *
            1000
          ),
      ) + 1,
    );

  if (
    observationPeriodDays < 7
  ) {
    return {
      crisesLast30Days,

      observationPeriodDays,
    };
  }

  return {
    crisesLast30Days,

    observationPeriodDays,

    averageCrisesPer30Days:
      Number(
        (
          (
            timestamps.length /
            observationPeriodDays
          ) *
          30
        ).toFixed(1),
      ),
  };
};

export function getPhasePatterns(
  crisisEpisodes: MigraineEpisode[],
): PhasePatterns {
  const total =
    crisisEpisodes.length;

  const premonitoryCount =
    crisisEpisodes.filter(
      hasPremonitoryData,
    ).length;

  const auraCount =
    crisisEpisodes.filter(
      hasAuraData,
    ).length;

  const postdromeCount =
    crisisEpisodes.filter(
      hasPostdromeData,
    ).length;

  return {
    premonitory:
      buildPresencePattern(
        premonitoryCount,
        total,
      ),

    aura:
      buildPresencePattern(
        auraCount,
        total,
      ),

    postdrome:
      buildPresencePattern(
        postdromeCount,
        total,
      ),

    ...getFrequencyData(
      crisisEpisodes,
    ),
  };
}