import type {
  AnatomicalPainMap,
  CrisisSymptom,
  MigraineEpisode,
  MigraineTrigger,
  PainLocationPoint,
  PainLocationRecord,
} from '../../migraine/types/migraine.types';

import {
  CRISIS_SYMPTOM_CATALOG,
  CRISIS_SYMPTOM_LABELS,
} from '../../migraine/data/crisisSymptomCatalog';

import {
  formatPainLocationPoint,
} from '../../migraine/data/painLocationCatalog';

import {
  TRIGGER_LABELS,
} from '../../migraine/data/triggerCatalog';

export interface RankedPattern {
  value: string;

  label: string;

  count: number;

  percentage: number;
}

const sortRanking = (
  patterns: RankedPattern[],
): RankedPattern[] => {
  return patterns
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

const buildRanking = <
  TValue extends string,
>(
  counts: Map<TValue, number>,
  labels: Record<TValue, string>,
  episodeCount: number,
): RankedPattern[] => {
  if (episodeCount === 0) {
    return [];
  }

  return sortRanking(
    Array.from(
      counts.entries(),
    ).map(
      (
        [
          value,
          count,
        ],
      ): RankedPattern => ({
        value,

        label:
          labels[value],

        count,

        percentage:
          Math.round(
            (
              count /
              episodeCount
            ) * 100,
          ),
      }),
    ),
  );
};

const isCrisisSymptom = (
  value: unknown,
): value is CrisisSymptom => {
  return (
    typeof value === 'string' &&
    CRISIS_SYMPTOM_CATALOG.some(
      definition =>
        definition.value === value,
    )
  );
};

const getEpisodeSymptoms = (
  episode: MigraineEpisode,
): Set<CrisisSymptom> => {
  const symptoms =
    new Set<CrisisSymptom>(
      episode.crisis.symptoms ??
        [],
    );

  for (
    const event
    of episode.crisis.events ?? []
  ) {
    if (
      event.type !== 'symptom' ||
      event.data.action !==
        'added'
    ) {
      continue;
    }

    const symptom =
      event.data.symptom;

    if (
      isCrisisSymptom(
        symptom,
      )
    ) {
      symptoms.add(symptom);
    }
  }

  return symptoms;
};

const getLocationKey = (
  point: PainLocationPoint,
): string => {
  return [
    point.region,
    point.side ?? 'unknown',
  ].join('::');
};

const addPoint = (
  points: Map<
    string,
    PainLocationPoint
  >,
  point?: PainLocationPoint,
) => {
  if (!point) {
    return;
  }

  points.set(
    getLocationKey(point),
    point,
  );
};

const addMapPoints = (
  points: Map<
    string,
    PainLocationPoint
  >,
  map?: AnatomicalPainMap,
) => {
  if (!map) {
    return;
  }

  addPoint(
    points,
    map.primary,
  );

  addPoint(
    points,
    map.origin,
  );

  (
    map.additional ?? []
  ).forEach(
    point =>
      addPoint(
        points,
        point,
      ),
  );

  (
    map.radiation ?? []
  ).forEach(
    path => {
      addPoint(
        points,
        path.from,
      );

      addPoint(
        points,
        path.to,
      );
    },
  );
};

const addRecordPoints = (
  points: Map<
    string,
    PainLocationPoint
  >,
  record?: PainLocationRecord,
) => {
  if (!record) {
    return;
  }

  addMapPoints(
    points,
    record.anatomicalMap,
  );

  (
    record.anatomicalPoints ??
    []
  ).forEach(
    point =>
      addPoint(
        points,
        point,
      ),
  );

  addPoint(
    points,
    record.onsetPoint,
  );

  (
    record.radiationPaths ??
    []
  ).forEach(
    path => {
      addPoint(
        points,
        path.from,
      );

      addPoint(
        points,
        path.to,
      );
    },
  );
};

const getEpisodePainLocations = (
  episode: MigraineEpisode,
): Map<
  string,
  PainLocationPoint
> => {
  const points =
    new Map<
      string,
      PainLocationPoint
    >();

  addMapPoints(
    points,
    episode.crisis
      .anatomicalLocation,
  );

  addRecordPoints(
    points,
    episode.crisis
      .locationDetails,
  );

  (
    episode.crisis
      .locationHistory ?? []
  ).forEach(
    snapshot =>
      addRecordPoints(
        points,
        snapshot.location,
      ),
  );

  return points;
};

export const getTopTriggers = (
  episodes: MigraineEpisode[],
): RankedPattern[] => {
  const counts =
    new Map<
      MigraineTrigger,
      number
    >();

  episodes.forEach(
    episode => {
      const uniqueTriggers =
        new Set(
          episode.triggers ?? [],
        );

      uniqueTriggers.delete(
        'unknown',
      );

      uniqueTriggers.forEach(
        trigger => {
          counts.set(
            trigger,
            (
              counts.get(
                trigger,
              ) ?? 0
            ) + 1,
          );
        },
      );
    },
  );

  return buildRanking(
    counts,
    TRIGGER_LABELS,
    episodes.length,
  );
};

export const getTopCrisisSymptoms =
  (
    episodes: MigraineEpisode[],
  ): RankedPattern[] => {
    const counts =
      new Map<
        CrisisSymptom,
        number
      >();

    episodes.forEach(
      episode => {
        const symptoms =
          getEpisodeSymptoms(
            episode,
          );

        symptoms.forEach(
          symptom => {
            counts.set(
              symptom,
              (
                counts.get(
                  symptom,
                ) ?? 0
              ) + 1,
            );
          },
        );
      },
    );

    return buildRanking(
      counts,
      CRISIS_SYMPTOM_LABELS,
      episodes.length,
    );
  };

export const getTopPainLocations =
  (
    episodes: MigraineEpisode[],
  ): RankedPattern[] => {
    if (episodes.length === 0) {
      return [];
    }

    const locations =
      new Map<
        string,
        {
          point: PainLocationPoint;
          count: number;
        }
      >();

    episodes.forEach(
      episode => {
        const episodeLocations =
          getEpisodePainLocations(
            episode,
          );

        episodeLocations.forEach(
          (
            point,
            key,
          ) => {
            const current =
              locations.get(key);

            locations.set(
              key,
              {
                point,

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

    return sortRanking(
      Array.from(
        locations.entries(),
      ).map(
        (
          [
            value,
            location,
          ],
        ): RankedPattern => ({
          value,

          label:
            formatPainLocationPoint(
              location.point,
            ),

          count:
            location.count,

          percentage:
            Math.round(
              (
                location.count /
                episodes.length
              ) * 100,
            ),
        }),
      ),
    );
  };