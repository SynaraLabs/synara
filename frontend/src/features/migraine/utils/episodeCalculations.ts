import type {
  MigraineEpisode,
} from '../types/migraine.types';

// ===============================
// PAIN
// ===============================

export function getMaxPainIntensity(
  episode: MigraineEpisode,
): number {
  const values: number[] = [
    episode.crisis.intensity,

    ...episode.crisis.intensityHistory.map(
      record =>
        record.intensity,
    ),
  ];

  return Math.max(...values);
}

export function getAveragePainIntensity(
  episode: MigraineEpisode,
): number {
  const values: number[] = [
    episode.crisis.intensity,

    ...episode.crisis.intensityHistory.map(
      record =>
        record.intensity,
    ),
  ];

  const total = values.reduce(
    (
      sum: number,
      value: number,
    ) => sum + value,
    0,
  );

  return Number(
    (
      total /
      values.length
    ).toFixed(1),
  );
}

// ===============================
// DATE CALCULATIONS
// ===============================

const getMinuteTimestamp = (
  value: string,
): number | undefined => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  /*
   * La interfaz registra y muestra
   * horarios con precisión de minutos.
   * Los segundos internos no deben
   * alterar la duración visible.
   */
  date.setSeconds(0, 0);

  return date.getTime();
};

export function calculateMinutes(
  start?: string,
  end?: string,
): number | undefined {
  if (!start || !end) {
    return undefined;
  }

  const startTime =
    getMinuteTimestamp(
      start,
    );

  const endTime =
    getMinuteTimestamp(
      end,
    );

  if (
    startTime === undefined ||
    endTime === undefined
  ) {
    return undefined;
  }

  const difference =
    endTime - startTime;

  if (difference < 0) {
    return undefined;
  }

  return (
    difference /
    60_000
  );
}

// ===============================
// FORMAT DURATION
// ===============================

export function formatDuration(
  minutes?: number,
): string {
  if (minutes === undefined) {
    return 'Sin registrar';
  }

  if (minutes === 0) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

// ===============================
// PHASE DURATIONS
// ===============================

export function getEpisodeDuration(
  episode: MigraineEpisode,
): number | undefined {
  return calculateMinutes(
    episode.timeline
      ?.episodeStart,

    episode.timeline
      ?.episodeEnd,
  );
}

export function getPremonitoryDuration(
  episode: MigraineEpisode,
): number | undefined {
  return calculateMinutes(
    episode.timeline
      ?.premonitoryStart,

    episode.timeline
      ?.premonitoryEnd ??
      episode.timeline
        ?.crisisStart,
  );
}

export function getAuraDuration(
  episode: MigraineEpisode,
): number | undefined {
  return calculateMinutes(
    episode.timeline
      ?.auraStart,

    episode.timeline
      ?.auraEnd ??
      episode.timeline
        ?.crisisStart,
  );
}

export function getCrisisDuration(
  episode: MigraineEpisode,
): number | undefined {
  return calculateMinutes(
    episode.timeline
      ?.crisisStart,

    episode.timeline
      ?.crisisEnd,
  );
}

export function getPostdromeDuration(
  episode: MigraineEpisode,
): number | undefined {
  return calculateMinutes(
    episode.timeline
      ?.postdromeStart,

    episode.timeline
      ?.postdromeEnd,
  );
}

// ===============================
// SUMMARY
// ===============================

export interface EpisodeSummary {
  maxPain: number;

  averagePain: number;

  episodeDuration?: number;

  premonitoryDuration?: number;

  auraDuration?: number;

  crisisDuration?: number;

  postdromeDuration?: number;

  symptomCount: number;

  triggerCount: number;

  medicationCount: number;

  hadPremonitory: boolean;

  hadAura: boolean;

  hadPostdrome: boolean;

  firstMedicationTime?: string;
}

export function getEpisodeSummary(
  episode: MigraineEpisode,
): EpisodeSummary {
  const medicationEvents =
    episode.crisis.events
      .filter(
        event =>
          event.type ===
          'medication',
      )
      .sort(
        (
          first,
          second,
        ) =>
          new Date(
            first.timestamp,
          ).getTime() -
          new Date(
            second.timestamp,
          ).getTime(),
      );

  return {
    maxPain:
      getMaxPainIntensity(
        episode,
      ),

    averagePain:
      getAveragePainIntensity(
        episode,
      ),

    episodeDuration:
      getEpisodeDuration(
        episode,
      ),

    premonitoryDuration:
      getPremonitoryDuration(
        episode,
      ),

    auraDuration:
      getAuraDuration(
        episode,
      ),

    crisisDuration:
      getCrisisDuration(
        episode,
      ),

    postdromeDuration:
      getPostdromeDuration(
        episode,
      ),

    symptomCount:
      episode.crisis.symptoms
        .length,

    triggerCount:
      episode.triggers.length,

    medicationCount:
      medicationEvents.length,

    hadPremonitory:
      episode.premonitory.present,

    hadAura:
      episode.aura.present,

    hadPostdrome:
      episode.postdrome.present,

    firstMedicationTime:
      medicationEvents[0]
        ?.timestamp,
  };
}