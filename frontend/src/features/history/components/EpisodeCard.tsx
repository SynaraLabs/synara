import styles from '../history.module.css';

import type {
  AuraType,
  CrisisSymptom,
  LanguageAura,
  MigraineEpisode,
  MigraineTrigger,
  PostdromeSymptom,
  SensoryAura,
  VisualAura,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getAuraDuration,
  getCrisisDuration,
  getEpisodeDuration,
  getMaxPainIntensity,
  getPostdromeDuration,
  getPremonitoryDuration,
} from '../../migraine/utils/episodeCalculations';

interface Props {
  episode: MigraineEpisode;
}

const triggerLabels: Record<
  MigraineTrigger,
  string
> = {
  stress: 'Estrés',
  lackOfSleep: 'Falta de sueño',
  food: 'Alimentación',
  caffeine: 'Cafeína',
  alcohol: 'Alcohol',
  hormonal: 'Hormonal',
  weather: 'Clima',
  smell: 'Olores',
  noise: 'Ruido',
  unknown: 'Desconocido',
};

const crisisSymptomLabels: Record<
  CrisisSymptom,
  string
> = {
  nausea: 'Náuseas',
  vomiting: 'Vómitos',
  lightSensitivity:
    'Sensibilidad a la luz',
  soundSensitivity:
    'Sensibilidad al sonido',
  smellSensitivity:
    'Sensibilidad a olores',
  dizziness: 'Mareos',
  confusion: 'Confusión',
  neckPain: 'Dolor cervical',
  jawTension: 'Tensión mandibular',
};

const postdromeSymptomLabels: Record<
  PostdromeSymptom,
  string
> = {
  fatigue: 'Fatiga',
  brainFog: 'Niebla mental',
  weakness: 'Debilidad',
  moodChange: 'Cambios de ánimo',
  residualSensitivity:
    'Sensibilidad residual',
  neckDiscomfort:
    'Molestia cervical',
};

const auraTypeLabels: Record<
  AuraType,
  string
> = {
  visual: 'Visual',
  sensory: 'Sensitiva',
  language: 'Lenguaje',
};

const visualAuraLabels: Record<
  VisualAura,
  string
> = {
  flashes: 'Destellos de luz',
  zigzagLines: 'Líneas zigzag',
  blindSpots: 'Puntos ciegos',
  blurredVision: 'Visión borrosa',
};

const sensoryAuraLabels: Record<
  SensoryAura,
  string
> = {
  tingling: 'Hormigueo',
  numbness: 'Entumecimiento',
  electricSensation:
    'Sensación eléctrica',
};

const languageAuraLabels: Record<
  LanguageAura,
  string
> = {
  wordFindingDifficulty:
    'Dificultad para encontrar palabras',
  speechDifficulty:
    'Dificultad al hablar',
};

function formatDateTime(
  date?: string,
): string {
  if (!date) {
    return 'Sin registrar';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin registrar';
  }

  return parsedDate.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function formatTime(
  date?: string,
): string {
  if (!date) {
    return 'Sin hora';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin hora';
  }

  return parsedDate.toLocaleTimeString(
    'es-AR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function getMedicationData(
  data?: Record<string, unknown>,
) {
  return {
    medication:
      typeof data?.medication === 'string'
        ? data.medication
        : 'Medicamento no especificado',

    dose:
      typeof data?.dose === 'string'
        ? data.dose
        : '',
  };
}

function getAuraDetails(
  episode: MigraineEpisode,
): string[] {
  const auraTypes =
    episode.aura?.types ?? [];

  const visualSymptoms =
    episode.aura?.visualSymptoms ?? [];

  const sensorySymptoms =
    episode.aura?.sensorySymptoms ?? [];

  const languageSymptoms =
    episode.aura?.languageSymptoms ?? [];

  return [
    ...auraTypes.map(
      type => auraTypeLabels[type],
    ),

    ...visualSymptoms.map(
      symptom =>
        visualAuraLabels[symptom],
    ),

    ...sensorySymptoms.map(
      symptom =>
        sensoryAuraLabels[symptom],
    ),

    ...languageSymptoms.map(
      symptom =>
        languageAuraLabels[symptom],
    ),
  ];
}

function getPostdromeDetails(
  episode: MigraineEpisode,
): string[] {
  const symptoms =
    episode.postdrome?.symptoms ?? [];

  return symptoms.map(
    symptom =>
      postdromeSymptomLabels[symptom],
  );
}

export function EpisodeCard({
  episode,
}: Props) {
  const crisis = episode.crisis;

  const timeline =
    episode.timeline ?? {};

  const intensityHistory =
    crisis?.intensityHistory ?? [];

  const crisisEvents =
    crisis?.events ?? [];

  const crisisSymptoms =
    crisis?.symptoms ?? [];

  const triggers =
    episode.triggers ?? [];

  const createdDate = new Date(
    episode.createdAt,
  ).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const maxIntensity =
    getMaxPainIntensity(episode);

  const premonitoryDuration =
    getPremonitoryDuration(episode);

  const auraDuration =
    getAuraDuration(episode);

  const crisisDuration =
    getCrisisDuration(episode);

  const postdromeDuration =
    getPostdromeDuration(episode);

  const episodeDuration =
    getEpisodeDuration(episode);

  const formattedTriggers =
    triggers.length > 0
      ? triggers
          .map(
            trigger =>
              triggerLabels[trigger],
          )
          .join(', ')
      : 'Sin triggers registrados';

  const formattedCrisisSymptoms =
    crisisSymptoms.length > 0
      ? crisisSymptoms
          .map(
            symptom =>
              crisisSymptomLabels[
                symptom
              ],
          )
          .join(', ')
      : 'Sin síntomas registrados';

  const auraDetails =
    getAuraDetails(episode);

  const postdromeDetails =
    getPostdromeDetails(episode);

  const medicationEvents =
    crisisEvents
      .filter(
        event =>
          event.type === 'medication',
      )
      .sort(
        (a, b) =>
          new Date(
            a.timestamp,
          ).getTime() -
          new Date(
            b.timestamp,
          ).getTime(),
      );

  return (
    <article
      className={styles.episodeCard}
    >
      <header
        className={styles.episodeHeader}
      >
        <div>
          <h3>Migraña</h3>
          <span>{createdDate}</span>
        </div>

        <strong>
          {maxIntensity}/10
        </strong>
      </header>

      <div
        className={styles.episodeInfo}
      >
        <p>
          <b>Inicio del episodio:</b>{' '}
          {formatDateTime(
            timeline.episodeStart,
          )}
        </p>

        {timeline.premonitoryStart && (
          <>
            <p>
              <b>
                Inicio premonitorio:
              </b>{' '}
              {formatDateTime(
                timeline.premonitoryStart,
              )}
            </p>

            {premonitoryDuration !==
              undefined && (
              <p>
                <b>
                  Duración premonitoria:
                </b>{' '}
                {formatDuration(
                  premonitoryDuration,
                )}
              </p>
            )}
          </>
        )}

        {timeline.auraStart && (
          <>
            <p>
              <b>Inicio aura:</b>{' '}
              {formatDateTime(
                timeline.auraStart,
              )}
            </p>

            {auraDuration !==
              undefined && (
              <p>
                <b>Duración aura:</b>{' '}
                {formatDuration(
                  auraDuration,
                )}
              </p>
            )}
          </>
        )}

        <p>
          <b>Inicio de crisis:</b>{' '}
          {formatDateTime(
            timeline.crisisStart,
          )}
        </p>

        <p>
          <b>
            Duración de crisis:
          </b>{' '}
          {formatDuration(
            crisisDuration,
          )}
        </p>

        {timeline.postdromeStart && (
          <>
            <p>
              <b>
                Inicio postdromo:
              </b>{' '}
              {formatDateTime(
                timeline.postdromeStart,
              )}
            </p>

            {postdromeDuration !==
              undefined && (
              <p>
                <b>
                  Duración postdromo:
                </b>{' '}
                {formatDuration(
                  postdromeDuration,
                )}
              </p>
            )}

            {timeline.postdromeEnd && (
              <p>
                <b>
                  Recuperación completa:
                </b>{' '}
                {formatDateTime(
                  timeline.postdromeEnd,
                )}
              </p>
            )}
          </>
        )}

        <p>
          <b>
            Duración total del episodio:
          </b>{' '}
          {formatDuration(
            episodeDuration,
          )}
        </p>

        <p>
          <b>Dolor máximo:</b>{' '}
          {maxIntensity}/10
        </p>

        {intensityHistory.length >
          0 && (
          <div>
            <p>
              <b>
                Evolución del dolor:
              </b>
            </p>

            <ul>
              {intensityHistory.map(
                (record, index) => (
                  <li
                    key={`${record.time}-${index}`}
                  >
                    {formatTime(
                      record.time,
                    )}
                    {' → '}
                    {record.intensity}/10
                  </li>
                ),
              )}
            </ul>
          </div>
        )}

        {medicationEvents.length > 0 && (
          <div>
            <p>
              <b>
                Medicación durante la
                crisis:
              </b>
            </p>

            <ul>
              {medicationEvents.map(
                event => {
                  const medication =
                    getMedicationData(
                      event.data,
                    );

                  return (
                    <li key={event.id}>
                      {formatTime(
                        event.timestamp,
                      )}
                      {' → '}
                      {
                        medication.medication
                      }
                      {medication.dose
                        ? ` (${medication.dose})`
                        : ''}
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        )}

        {auraDetails.length > 0 && (
          <div>
            <p>
              <b>Aura:</b>
            </p>

            <ul>
              {auraDetails.map(
                (detail, index) => (
                  <li
                    key={`${detail}-${index}`}
                  >
                    {detail}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}

        <p>
          <b>
            Síntomas de crisis:
          </b>{' '}
          {formattedCrisisSymptoms}
        </p>

        <p>
          <b>Triggers:</b>{' '}
          {formattedTriggers}
        </p>

        {episode.postdrome?.present && (
          <div>
            <p>
              <b>
                Síntomas postdromo:
              </b>
            </p>

            {postdromeDetails.length >
            0 ? (
              <ul>
                {postdromeDetails.map(
                  symptom => (
                    <li key={symptom}>
                      {symptom}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                Sin síntomas registrados.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}