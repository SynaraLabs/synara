import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import type {
  ClinicalReportDateRange,
  ClinicalReportPeriod,
} from '../types/clinicalReport.types';

const PERIOD_DAYS: Record<
  Exclude<
    ClinicalReportPeriod,
    'all'
  >,
  number
> = {
  last30Days: 30,
  last90Days: 90,
  last6Months: 183,
  last12Months: 365,
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

const subtractDays = (
  date: Date,
  days: number,
): Date => {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() - days,
  );

  return result;
};

export const createClinicalReportDateRange =
  (
    period: ClinicalReportPeriod,
    referenceDate = new Date(),
  ): ClinicalReportDateRange => {
    const end =
      referenceDate.toISOString();

    if (period === 'all') {
      return {
        period,
        end,
      };
    }

    const start =
      subtractDays(
        referenceDate,
        PERIOD_DAYS[period],
      ).toISOString();

    return {
      period,
      start,
      end,
    };
  };

export const filterEpisodesByReportPeriod =
  (
    episodes: MigraineEpisode[],
    dateRange:
      ClinicalReportDateRange,
  ): MigraineEpisode[] => {
    const endTimestamp =
      new Date(
        dateRange.end,
      ).getTime();

    const startTimestamp =
      dateRange.start
        ? new Date(
            dateRange.start,
          ).getTime()
        : undefined;

    return episodes.filter(
      episode => {
        if (
          !isValidDate(
            episode.createdAt,
          )
        ) {
          return false;
        }

        const episodeTimestamp =
          new Date(
            episode.createdAt,
          ).getTime();

        if (
          episodeTimestamp >
          endTimestamp
        ) {
          return false;
        }

        if (
          startTimestamp !==
            undefined &&
          episodeTimestamp <
            startTimestamp
        ) {
          return false;
        }

        return true;
      },
    );
  };