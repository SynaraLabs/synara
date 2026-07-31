import type {
  MigraineEpisode,
  Treatment,
  TreatmentEffectiveness,
  TreatmentType,
} from '../../migraine/types/migraine.types';

import {
  TREATMENT_TYPE_LABELS,
} from '../../migraine/data/treatmentCatalog';

import type {
  RankedPattern,
} from './patternRankingCalculations';

export interface TreatmentEffectivenessSummary {
  total: number;

  none: number;

  low: number;

  medium: number;

  high: number;

  positivePercentage?: number;
}

export interface TreatmentPatterns {
  topTreatments: RankedPattern[];

  effectiveness:
    TreatmentEffectivenessSummary;

  averageResponseTimeMinutes?:
    number;
}

const EFFECTIVENESS_VALUES:
  readonly TreatmentEffectiveness[] = [
  'none',
  'low',
  'medium',
  'high',
];

const hasTreatmentData = (
  treatment?: Treatment,
): treatment is Treatment => {
  if (!treatment) {
    return false;
  }

  return Boolean(
    treatment.type ||
      treatment.medication?.trim() ||
      treatment.dose?.trim() ||
      treatment.takenAt ||
      treatment.effectiveness ||
      treatment.responseTimeMinutes !==
        undefined ||
      treatment.sideEffects?.length ||
      treatment.notes?.trim(),
  );
};

const getEpisodeTreatments = (
  episode: MigraineEpisode,
): Treatment[] => {
  const multipleTreatments =
    (
      episode.treatments ?? []
    ).filter(
      hasTreatmentData,
    );

  if (
    multipleTreatments.length > 0
  ) {
    return multipleTreatments;
  }

  return hasTreatmentData(
    episode.treatment,
  )
    ? [
        episode.treatment,
      ]
    : [];
};

const normalizeName = (
  value: string,
): string => {
  return value
    .trim()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase(
      'es-AR',
    );
};

const getTreatmentType = (
  treatment: Treatment,
): TreatmentType => {
  return (
    treatment.type ??
    'medication'
  );
};

const getTreatmentIdentity = (
  treatment: Treatment,
): {
  value: string;
  label: string;
} => {
  const type =
    getTreatmentType(
      treatment,
    );

  const medication =
    treatment.medication
      ?.trim();

  if (
    (
      type === 'medication' ||
      type === 'supplement'
    ) &&
    medication
  ) {
    return {
      value: `${type}:${normalizeName(
        medication,
      )}`,

      label: medication,
    };
  }

  return {
    value: `type:${type}`,

    label:
      TREATMENT_TYPE_LABELS[
        type
      ],
  };
};

const buildTreatmentRanking = (
  episodes: MigraineEpisode[],
): RankedPattern[] => {
  if (episodes.length === 0) {
    return [];
  }

  const counts =
    new Map<
      string,
      {
        label: string;
        count: number;
      }
    >();

  episodes.forEach(
    episode => {
      const uniqueTreatments =
        new Map<
          string,
          string
        >();

      getEpisodeTreatments(
        episode,
      ).forEach(
        treatment => {
          const identity =
            getTreatmentIdentity(
              treatment,
            );

          uniqueTreatments.set(
            identity.value,
            identity.label,
          );
        },
      );

      uniqueTreatments.forEach(
        (
          label,
          value,
        ) => {
          const current =
            counts.get(value);

          counts.set(
            value,
            {
              label,

              count:
                (
                  current?.count ??
                  0
                ) + 1,
            },
          );
        },
      );
    },
  );

  return Array.from(
    counts.entries(),
  )
    .map(
      (
        [
          value,
          treatment,
        ],
      ): RankedPattern => ({
        value,

        label:
          treatment.label,

        count:
          treatment.count,

        percentage:
          Math.round(
            (
              treatment.count /
              episodes.length
            ) * 100,
          ),
      }),
    )
    .sort(
      (
        first,
        second,
      ) =>
        second.count -
          first.count ||
        first.label.localeCompare(
          second.label,
          'es-AR',
        ),
    )
    .slice(0, 5);
};

const buildEffectivenessSummary = (
  episodes: MigraineEpisode[],
): TreatmentEffectivenessSummary => {
  const summary:
    TreatmentEffectivenessSummary = {
    total: 0,
    none: 0,
    low: 0,
    medium: 0,
    high: 0,
  };

  episodes.forEach(
    episode => {
      getEpisodeTreatments(
        episode,
      ).forEach(
        treatment => {
          const effectiveness =
            treatment.effectiveness;

          if (
            !effectiveness ||
            !EFFECTIVENESS_VALUES.includes(
              effectiveness,
            )
          ) {
            return;
          }

          summary.total += 1;

          summary[
            effectiveness
          ] += 1;
        },
      );
    },
  );

  if (summary.total > 0) {
    summary.positivePercentage =
      Math.round(
        (
          (
            summary.medium +
            summary.high
          ) /
          summary.total
        ) * 100,
      );
  }

  return summary;
};

const getAverageResponseTime = (
  episodes: MigraineEpisode[],
): number | undefined => {
  const responseTimes =
    episodes
      .flatMap(
        episode =>
          getEpisodeTreatments(
            episode,
          ),
      )
      .map(
        treatment =>
          treatment
            .responseTimeMinutes,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined &&
          Number.isFinite(value) &&
          value >= 0,
      );

  if (
    responseTimes.length === 0
  ) {
    return undefined;
  }

  const total =
    responseTimes.reduce(
      (
        sum,
        value,
      ) => sum + value,
      0,
    );

  return Math.round(
    total /
      responseTimes.length,
  );
};

export function getTreatmentPatterns(
  episodes: MigraineEpisode[],
): TreatmentPatterns {
  return {
    topTreatments:
      buildTreatmentRanking(
        episodes,
      ),

    effectiveness:
      buildEffectivenessSummary(
        episodes,
      ),

    averageResponseTimeMinutes:
      getAverageResponseTime(
        episodes,
      ),
  };
}