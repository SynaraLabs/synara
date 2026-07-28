import styles from '../history.module.css';

import type {
  AnatomicalPainMap,
  MigraineEpisode,
  PainLocationRecord,
  PremonitorySymptom,
  RecoveryLevel,
  TimePrecision,
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

import {
  convertLegacyLocationRecord,
  formatPainLocationPoint,
  formatPainRadiationPath,
} from '../../migraine/data/painLocationCatalog';

import {
  auraTypeLabels,
  crisisSymptomLabels,
  languageAuraLabels,
  motorAuraLabels,
  postdromeSymptomLabels,
  sensoryAuraLabels,
  triggerLabels,
  vestibularAuraLabels,
  visualAuraLabels,
} from '../utils/migraineLabels';


interface Props {
  episode: MigraineEpisode;
}


const recoveryLevelLabels: Record<
  RecoveryLevel,
  string
> = {
  minimal: 'Recuperación mínima',
  partial: 'Recuperación parcial',
  mostlyRecovered:
    'Casi completamente recuperada',
  fullyRecovered:
    'Recuperación completa',
};


const premonitorySymptomLabels:
  Partial<
    Record<
      PremonitorySymptom,
      string
    >
  > = {
  fatigue: 'Fatiga o cansancio',
  yawning: 'Bostezos frecuentes',
  moodChange: 'Cambios de ánimo',
  irritability: 'Irritabilidad',
  brainFog: 'Niebla mental',
  foodCraving:
    'Antojos alimentarios',
  neckStiffness:
    'Rigidez cervical',
  neckPain: 'Dolor cervical',
  thirst:
    'Mayor sensación de sed',
  sleepiness: 'Somnolencia',
  concentrationDifficulty:
    'Dificultad para concentrarse',
  mentalSlowness:
    'Lentitud mental',
  jawTension:
    'Tensión mandibular',
  shoulderTension:
    'Tensión en hombros',
  trapeziusTension:
    'Tensión en trapecios',
  lightSensitivity:
    'Sensibilidad a la luz',
  soundSensitivity:
    'Sensibilidad al sonido',
  smellSensitivity:
    'Sensibilidad a olores',
  mildNausea: 'Náuseas leves',
  frequentUrination:
    'Orinar con más frecuencia',
};


function parseValidDate(
  value?: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}


function isValidDate(
  value?: string,
): value is string {
  return Boolean(
    parseValidDate(value),
  );
}


function formatCreatedDate(
  value?: string,
): string {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Fecha sin registrar';
  }

  return date.toLocaleDateString(
    'es-AR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
}


function formatDateTime(
  value?: string,
  precision?: TimePrecision,
): string {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Sin registrar';
  }

  if (
    precision === 'dateOnly' ||
    precision === 'unknown'
  ) {
    return date.toLocaleDateString(
      'es-AR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}


function formatTime(
  value?: string,
): string {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Hora sin registrar';
  }

  return date.toLocaleTimeString(
    'es-AR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}


function getTimestamp(
  value?: string,
): number {
  return (
    parseValidDate(
      value,
    )?.getTime() ??
    Number.MAX_SAFE_INTEGER
  );
}


function getMedicationData(
  data: unknown,
): {
  medication: string;
  dose: string;
} {
  if (
    typeof data !== 'object' ||
    data === null
  ) {
    return {
      medication:
        'Medicamento no especificado',
      dose: '',
    };
  }

  const record =
    data as Record<
      string,
      unknown
    >;

  return {
    medication:
      typeof record.medication ===
      'string'
        ? record.medication
        : 'Medicamento no especificado',

    dose:
      typeof record.dose ===
      'string'
        ? record.dose
        : '',
  };
}


function getLabels<
  Value extends string,
>(
  values:
    | readonly Value[]
    | undefined,
  labels: Readonly<
    Record<Value, string>
  >,
): string[] {
  return (values ?? []).map(
    value =>
      labels[value] ?? value,
  );
}


function getPremonitoryLabels(
  symptoms:
    | readonly PremonitorySymptom[]
    | undefined,
): string[] {
  return (symptoms ?? []).map(
    symptom =>
      premonitorySymptomLabels[
        symptom
      ] ?? symptom,
  );
}


function getAuraDetails(
  episode: MigraineEpisode,
): string[] {
  const aura = episode.aura;

  if (!aura) {
    return [];
  }

  return [
    ...getLabels(
      aura.types,
      auraTypeLabels,
    ),

    ...getLabels(
      aura.visualSymptoms,
      visualAuraLabels,
    ),

    ...getLabels(
      aura.sensorySymptoms,
      sensoryAuraLabels,
    ),

    ...getLabels(
      aura.languageSymptoms,
      languageAuraLabels,
    ),

    ...getLabels(
      aura.motorSymptoms,
      motorAuraLabels,
    ),

    ...getLabels(
      aura.vestibularSymptoms,
      vestibularAuraLabels,
    ),
  ];
}


function getPostdromeDetails(
  episode: MigraineEpisode,
): string[] {
  return getLabels(
    episode.postdrome
      ?.symptoms,
    postdromeSymptomLabels,
  );
}


// ------------------------------------------
// PAIN LOCATION
// ------------------------------------------

function hasPainLocationData(
  location?: AnatomicalPainMap,
): location is AnatomicalPainMap {
  if (!location) {
    return false;
  }

  return Boolean(
    location.primary ||
      location.origin ||
      location.additional
        .length > 0 ||
      (
        location.radiation ??
        []
      ).length > 0 ||
      location.changesSide ||
      location.notes?.trim(),
  );
}


function getLocationFromRecord(
  record?: PainLocationRecord,
): AnatomicalPainMap | undefined {
  if (!record) {
    return undefined;
  }

  const location =
    convertLegacyLocationRecord(
      record,
    );

  return hasPainLocationData(
    location,
  )
    ? location
    : undefined;
}


function getCurrentPainLocation(
  episode: MigraineEpisode,
): AnatomicalPainMap | undefined {
  const crisis =
    episode.crisis;

  if (
    hasPainLocationData(
      crisis.anatomicalLocation,
    )
  ) {
    return crisis.anatomicalLocation;
  }

  const recordLocation =
    getLocationFromRecord(
      crisis.locationDetails,
    );

  if (recordLocation) {
    return recordLocation;
  }

  const legacyLocations =
    crisis.location ?? [];

  if (
    legacyLocations.length === 0
  ) {
    return undefined;
  }

  const legacyRecord:
    PainLocationRecord = {
    primary:
      legacyLocations[0],

    additional:
      legacyLocations.slice(1),
  };

  return getLocationFromRecord(
    legacyRecord,
  );
}


function removeRepeatedLabels(
  values: string[],
): string[] {
  return Array.from(
    new Set(values),
  );
}


function getPainLocationLines(
  location?: AnatomicalPainMap,
): string[] {
  if (
    !hasPainLocationData(
      location,
    )
  ) {
    return [];
  }

  const lines: string[] = [];

  if (location.primary) {
    lines.push(
      `Zona principal: ${formatPainLocationPoint(
        location.primary,
      )}`,
    );
  }

  if (location.origin) {
    lines.push(
      `Punto de inicio: ${formatPainLocationPoint(
        location.origin,
      )}`,
    );
  }

  const additionalLocations =
    removeRepeatedLabels(
      location.additional.map(
        point =>
          formatPainLocationPoint(
            point,
          ),
      ),
    );

  if (
    additionalLocations.length >
    0
  ) {
    lines.push(
      `Otras zonas: ${additionalLocations.join(
        ', ',
      )}`,
    );
  }

  const radiationPaths =
    removeRepeatedLabels(
      (
        location.radiation ??
        []
      ).map(path =>
        formatPainRadiationPath(
          path,
        ),
      ),
    );

  if (
    radiationPaths.length > 0
  ) {
    lines.push(
      `Extensión del dolor: ${radiationPaths.join(
        '; ',
      )}`,
    );
  }

  if (location.changesSide) {
    lines.push(
      'El dolor cambió de lado.',
    );
  }

  if (location.notes?.trim()) {
    lines.push(
      `Nota: ${location.notes.trim()}`,
    );
  }

  return lines;
}


export function EpisodeCard({
  episode,
}: Props) {
  const premonitory =
    episode.premonitory;

  const aura = episode.aura;

  const crisis =
    episode.crisis;

  const postdrome =
    episode.postdrome;

  const timeline =
    episode.timeline;


  const createdDate =
    formatCreatedDate(
      episode.createdAt,
    );


  const crisisStart =
    timeline?.crisisStart ??
    crisis.startTime ??
    crisis.time?.start?.value;

  const crisisEnd =
    timeline?.crisisEnd ??
    crisis.endTime ??
    crisis.time?.end?.value;


  const hasCrisis =
    crisis.active === true ||
    isValidDate(crisisStart) ||
    isValidDate(crisisEnd);


  const auraStart =
    timeline?.auraStart ??
    aura.time?.start?.value;

  const auraEnd =
    timeline?.auraEnd ??
    aura.time?.end?.value;


  const auraDetails =
    getAuraDetails(episode);


  const hasAura =
    aura.present === true ||
    auraDetails.length > 0 ||
    isValidDate(auraStart) ||
    isValidDate(auraEnd);


  const premonitoryStart =
    timeline?.premonitoryStart ??
    premonitory.time?.start
      ?.value;

  const premonitoryEnd =
    timeline?.premonitoryEnd ??
    premonitory.time?.end?.value;


  const premonitoryEndUnknown =
    premonitory.time?.end
      ?.precision === 'unknown' &&
    !isValidDate(
      premonitoryEnd,
    );


  const isUncertainRecord =
    episode.status ===
      'incomplete' ||
    premonitory.status ===
      'uncertain';


  const endedWithoutCrisis =
    premonitory
      .endedWithoutCrisis === true ||
    episode.completionReason ===
      'phaseEndedWithoutCrisis';


  const recordTitle =
    hasCrisis
      ? 'Migraña'
      : endedWithoutCrisis
        ? 'Señales previas sin crisis'
        : isUncertainRecord
          ? 'Registro de señales — desenlace incierto'
          : hasAura
            ? 'Aura sin crisis confirmada'
            : 'Registro de señales previas';


  const headerStatus =
    hasCrisis
      ? `${getMaxPainIntensity(
          episode,
        )}/10`
      : isUncertainRecord
        ? 'Incierto'
        : 'Sin crisis';


  const maxIntensity =
    getMaxPainIntensity(
      episode,
    );

  const premonitoryDuration =
    getPremonitoryDuration(
      episode,
    );

  const auraDuration =
    getAuraDuration(
      episode,
    );

  const crisisDuration =
    getCrisisDuration(
      episode,
    );

  const postdromeDuration =
    getPostdromeDuration(
      episode,
    );

  const episodeDuration =
    getEpisodeDuration(
      episode,
    );


  const triggers =
    episode.triggers ?? [];

  const crisisSymptoms =
    crisis.symptoms ?? [];

  const intensityHistory =
    crisis.intensityHistory ??
    [];

  const crisisEvents =
    crisis.events ?? [];


  const currentPainLocation =
    getCurrentPainLocation(
      episode,
    );

  const currentPainLocationLines =
    getPainLocationLines(
      currentPainLocation,
    );


  const locationHistory =
    [
      ...(crisis.locationHistory ??
        []),
    ]
      .filter(snapshot =>
        Boolean(
          getLocationFromRecord(
            snapshot.location,
          ),
        ),
      )
      .sort(
        (
          firstSnapshot,
          secondSnapshot,
        ) => {
          const firstDate =
            firstSnapshot
              .occurredAt?.value;

          const secondDate =
            secondSnapshot
              .occurredAt?.value;

          return (
            getTimestamp(
              firstDate,
            ) -
            getTimestamp(
              secondDate,
            )
          );
        },
      );


  const premonitoryUpdates =
    [
      ...(premonitory.updates ??
        []),
    ].sort(
      (
        firstUpdate,
        secondUpdate,
      ) => {
        const firstDate =
          firstUpdate.occurredAt
            ?.value ??
          firstUpdate.createdAt;

        const secondDate =
          secondUpdate.occurredAt
            ?.value ??
          secondUpdate.createdAt;

        return (
          getTimestamp(
            firstDate,
          ) -
          getTimestamp(
            secondDate,
          )
        );
      },
    );


  const postdromeUpdates =
    [
      ...(postdrome.updates ??
        []),
    ]
      .filter(update => {
        const symptoms =
          update.data?.symptoms ??
          [];

        return (
          symptoms.length > 0 ||
          Boolean(
            update.data
              ?.recoveryLevel,
          ) ||
          update.data
            ?.symptomsStillActive ===
            false ||
          Boolean(
            update.notes?.trim(),
          )
        );
      })
      .sort(
        (
          firstUpdate,
          secondUpdate,
        ) => {
          const firstDate =
            firstUpdate.occurredAt
              ?.value ??
            firstUpdate.createdAt;

          const secondDate =
            secondUpdate.occurredAt
              ?.value ??
            secondUpdate.createdAt;

          return (
            getTimestamp(
              firstDate,
            ) -
            getTimestamp(
              secondDate,
            )
          );
        },
      );


  const formattedTriggers =
    triggers.length > 0
      ? getLabels(
          triggers,
          triggerLabels,
        ).join(', ')
      : 'Sin triggers registrados';


  const formattedCrisisSymptoms =
    crisisSymptoms.length > 0
      ? getLabels(
          crisisSymptoms,
          crisisSymptomLabels,
        ).join(', ')
      : 'Sin síntomas registrados';


  const postdromeDetails =
    getPostdromeDetails(
      episode,
    );


  const postdromeStart =
    timeline?.postdromeStart ??
    postdrome.startTime ??
    postdrome.time?.start
      ?.value;

  const postdromeEnd =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end?.value;


  const hasPostdrome =
    postdrome.present === true ||
    postdromeDetails.length >
      0 ||
    postdromeUpdates.length >
      0 ||
    Boolean(
      postdromeStart ||
        postdromeEnd,
    );


  const medicationEvents =
    crisisEvents
      .filter(
        event =>
          event.type ===
          'medication',
      )
      .sort(
        (
          firstEvent,
          secondEvent,
        ) =>
          getTimestamp(
            firstEvent.timestamp,
          ) -
          getTimestamp(
            secondEvent.timestamp,
          ),
      );


  const getPremonitoryResult =
    ():
      | string
      | undefined => {
      if (
        premonitory
          .endedWithoutCrisis
      ) {
        return 'Las señales terminaron sin evolucionar a crisis.';
      }

      if (
        premonitory
          .evolvedToCrisis
      ) {
        if (
          premonitory.status ===
            'active' &&
          hasCrisis
        ) {
          return 'Las señales continuaron durante la crisis.';
        }

        return 'Las señales evolucionaron a crisis.';
      }

      if (
        premonitory
          .evolvedToAura
      ) {
        if (
          premonitory.status ===
            'active' &&
          hasAura
        ) {
          return 'Las señales continuaron durante el aura.';
        }

        return 'Las señales evolucionaron a aura.';
      }

      if (
        isUncertainRecord
      ) {
        return 'No se pudo confirmar si las señales estuvieron relacionadas con una migraña.';
      }

      if (
        premonitory.status ===
        'active'
      ) {
        return 'Las señales permanecían abiertas al momento del registro.';
      }

      return undefined;
    };


  const premonitoryResult =
    getPremonitoryResult();


  return (
    <article
      className={
        styles.episodeCard
      }
    >
      <header
        className={
          styles.episodeHeader
        }
      >
        <div>
          <h3>
            {recordTitle}
          </h3>

          <span>
            {createdDate}
          </span>
        </div>

        <strong>
          {headerStatus}
        </strong>
      </header>


      <div
        className={
          styles.episodeInfo
        }
      >
        <p>
          <b>
            Inicio del registro:
          </b>{' '}
          {formatDateTime(
            timeline?.episodeStart ??
              premonitoryStart ??
              auraStart ??
              crisisStart,
          )}
        </p>


        {premonitory.present && (
          <section>
            <h4>
              Señales previas
            </h4>

            <p>
              <b>
                Inicio de las señales:
              </b>{' '}
              {formatDateTime(
                premonitoryStart,
                premonitory.time
                  ?.start?.precision,
              )}
            </p>

            {isValidDate(
              premonitoryEnd,
            ) && (
              <p>
                <b>
                  Final de las señales:
                </b>{' '}
                {formatDateTime(
                  premonitoryEnd,
                  premonitory.time
                    ?.end
                    ?.precision,
                )}
              </p>
            )}

            {premonitoryEndUnknown && (
              <p>
                <b>
                  Final de las señales:
                </b>{' '}
                Hora desconocida
              </p>
            )}

            {premonitoryDuration !==
              undefined && (
              <p>
                <b>
                  Duración:
                </b>{' '}
                {formatDuration(
                  premonitoryDuration,
                )}
              </p>
            )}

            {premonitoryUpdates.length >
              0 && (
              <div>
                <p>
                  <b>
                    Evolución de las
                    señales:
                  </b>
                </p>

                <ul>
                  {premonitoryUpdates.map(
                    (
                      update,
                      index,
                    ) => {
                      const updateTime =
                        update
                          .occurredAt
                          ?.value ??
                        update
                          .createdAt;

                      const symptoms =
                        getPremonitoryLabels(
                          update.data
                            ?.symptoms ??
                            [],
                        );

                      const intensity =
                        update.data
                          ?.intensity;

                      return (
                        <li
                          key={
                            update.id ??
                            `${
                              updateTime ??
                              'sin-fecha'
                            }-${index}`
                          }
                        >
                          <p>
                            <b>
                              {formatDateTime(
                                updateTime,
                                update
                                  .occurredAt
                                  ?.precision,
                              )}
                            </b>
                          </p>

                          <p>
                            <b>
                              Señales:
                            </b>{' '}
                            {symptoms.length >
                            0
                              ? symptoms.join(
                                  ', ',
                                )
                              : 'Sin señales seleccionadas'}
                          </p>

                          {intensity !==
                            undefined && (
                            <p>
                              <b>
                                Intensidad:
                              </b>{' '}
                              {intensity}
                              /10
                            </p>
                          )}

                          {update.notes && (
                            <p>
                              <b>
                                Nota:
                              </b>{' '}
                              {
                                update.notes
                              }
                            </p>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}

            {premonitoryResult && (
              <p>
                <b>
                  Resultado:
                </b>{' '}
                {
                  premonitoryResult
                }
              </p>
            )}
          </section>
        )}


        {hasAura && (
          <section>
            <h4>Aura</h4>

            {isValidDate(
              auraStart,
            ) && (
              <p>
                <b>
                  Inicio del aura:
                </b>{' '}
                {formatDateTime(
                  auraStart,
                  aura.time?.start
                    ?.precision,
                )}
              </p>
            )}

            {auraDuration !==
              undefined && (
              <p>
                <b>
                  Duración:
                </b>{' '}
                {formatDuration(
                  auraDuration,
                )}
              </p>
            )}

            {auraDetails.length >
              0 && (
              <ul>
                {auraDetails.map(
                  (
                    detail,
                    index,
                  ) => (
                    <li
                      key={`${detail}-${index}`}
                    >
                      {detail}
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        )}


        {hasCrisis && (
          <section>
            <h4>Crisis</h4>

            <p>
              <b>
                Inicio de la crisis:
              </b>{' '}
              {formatDateTime(
                crisisStart,
                crisis.time?.start
                  ?.precision,
              )}
            </p>

            <p>
              <b>
                Duración de la crisis:
              </b>{' '}
              {formatDuration(
                crisisDuration,
              )}
            </p>

            <p>
              <b>
                Dolor máximo:
              </b>{' '}
              {maxIntensity}/10
            </p>


            {currentPainLocationLines.length >
              0 && (
              <div>
                <p>
                  <b>
                    Localización actual
                    o final:
                  </b>
                </p>

                <ul>
                  {currentPainLocationLines.map(
                    (
                      detail,
                      index,
                    ) => (
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


            {locationHistory.length >
              0 && (
              <div>
                <p>
                  <b>
                    Evolución de la
                    localización:
                  </b>
                </p>

                <ul>
                  {locationHistory.map(
                    (
                      snapshot,
                      index,
                    ) => {
                      const location =
                        getLocationFromRecord(
                          snapshot.location,
                        );

                      const details =
                        getPainLocationLines(
                          location,
                        );

                      const snapshotTime =
                        snapshot
                          .occurredAt
                          ?.value;

                      return (
                        <li
                          key={
                            snapshot.id ??
                            `${
                              snapshotTime ??
                              'sin-fecha'
                            }-${index}`
                          }
                        >
                          <p>
                            <b>
                              {formatDateTime(
                                snapshotTime,
                                snapshot
                                  .occurredAt
                                  ?.precision,
                              )}
                            </b>
                          </p>

                          {details.length >
                          0 ? (
                            <ul>
                              {details.map(
                                (
                                  detail,
                                  detailIndex,
                                ) => (
                                  <li
                                    key={`${detail}-${detailIndex}`}
                                  >
                                    {
                                      detail
                                    }
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p>
                              Sin una
                              localización
                              determinada.
                            </p>
                          )}

                          {snapshot
                            .notes && (
                            <p>
                              <b>
                                Nota:
                              </b>{' '}
                              {
                                snapshot
                                  .notes
                              }
                            </p>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}


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
                    (
                      record,
                      index,
                    ) => {
                      const recordLocation =
                        getLocationFromRecord(
                          record.location,
                        );

                      const locationLines =
                        getPainLocationLines(
                          recordLocation,
                        );

                      return (
                        <li
                          key={
                            record.id ??
                            `${
                              record.time ??
                              'sin-hora'
                            }-${index}`
                          }
                        >
                          <p>
                            {formatTime(
                              record.time,
                            )}
                            {' → '}
                            {
                              record.intensity
                            }
                            /10
                          </p>

                          {locationLines.length >
                            0 && (
                            <p>
                              <b>
                                Zona:
                              </b>{' '}
                              {locationLines.join(
                                ' · ',
                              )}
                            </p>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}


            {medicationEvents.length >
              0 && (
              <div>
                <p>
                  <b>
                    Medicación durante
                    la crisis:
                  </b>
                </p>

                <ul>
                  {medicationEvents.map(
                    (
                      event,
                      index,
                    ) => {
                      const medication =
                        getMedicationData(
                          event.data,
                        );

                      return (
                        <li
                          key={
                            event.id ??
                            `${
                              event.timestamp ??
                              'sin-hora'
                            }-${index}`
                          }
                        >
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


            <p>
              <b>
                Síntomas de crisis:
              </b>{' '}
              {
                formattedCrisisSymptoms
              }
            </p>

            <p>
              <b>Triggers:</b>{' '}
              {formattedTriggers}
            </p>
          </section>
        )}


        {!hasCrisis &&
          triggers.length > 0 && (
            <p>
              <b>
                Factores registrados:
              </b>{' '}
              {formattedTriggers}
            </p>
          )}


        {hasPostdrome && (
          <section>
            <h4>Postdromo</h4>

            <p>
              <b>
                Inicio del postdromo:
              </b>{' '}
              {formatDateTime(
                postdromeStart,
                postdrome.time
                  ?.start?.precision,
              )}
            </p>

            {postdromeDuration !==
              undefined && (
              <p>
                <b>
                  Duración:
                </b>{' '}
                {formatDuration(
                  postdromeDuration,
                )}
              </p>
            )}

            {postdromeEnd && (
              <p>
                <b>
                  Recuperación completa:
                </b>{' '}
                {formatDateTime(
                  postdromeEnd,
                  postdrome.time
                    ?.end?.precision,
                )}
              </p>
            )}

            <p>
              <b>
                Último estado:
              </b>
            </p>

            {postdromeDetails.length >
            0 ? (
              <ul>
                {postdromeDetails.map(
                  (
                    symptom,
                    index,
                  ) => (
                    <li
                      key={`${symptom}-${index}`}
                    >
                      {symptom}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                Sin síntomas activos al
                finalizar.
              </p>
            )}

            {postdromeUpdates.length >
              0 && (
              <div>
                <p>
                  <b>
                    Evolución del
                    postdromo:
                  </b>
                </p>

                <ul>
                  {postdromeUpdates.map(
                    (
                      update,
                      index,
                    ) => {
                      const updateTime =
                        update
                          .occurredAt
                          ?.value ??
                        update
                          .createdAt;

                      const symptoms =
                        getLabels(
                          update.data
                            ?.symptoms ??
                            [],
                          postdromeSymptomLabels,
                        );

                      const recoveryLevel =
                        update.data
                          ?.recoveryLevel;

                      const isRecoveryComplete =
                        update.data
                          ?.symptomsStillActive ===
                        false;

                      return (
                        <li
                          key={
                            update.id ??
                            `${
                              updateTime ??
                              'sin-fecha'
                            }-${index}`
                          }
                        >
                          <p>
                            <b>
                              {isRecoveryComplete
                                ? 'Cierre — '
                                : 'Actualización — '}

                              {formatDateTime(
                                updateTime,
                                update
                                  .occurredAt
                                  ?.precision,
                              )}
                            </b>
                          </p>

                          <p>
                            <b>
                              Síntomas:
                            </b>{' '}
                            {symptoms.length >
                            0
                              ? symptoms.join(
                                  ', ',
                                )
                              : 'Sin síntomas seleccionados'}
                          </p>

                          {recoveryLevel && (
                            <p>
                              <b>
                                Recuperación:
                              </b>{' '}
                              {
                                recoveryLevelLabels[
                                  recoveryLevel
                                ]
                              }
                            </p>
                          )}

                          {update.notes && (
                            <p>
                              <b>
                                Nota:
                              </b>{' '}
                              {
                                update.notes
                              }
                            </p>
                          )}

                          {isRecoveryComplete && (
                            <p>
                              Recuperación
                              completa.
                            </p>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}
          </section>
        )}


        {episodeDuration !==
          undefined && (
          <p>
            <b>
              Duración total del
              registro:
            </b>{' '}
            {formatDuration(
              episodeDuration,
            )}
          </p>
        )}


        {episodeDuration ===
          undefined &&
          isUncertainRecord && (
            <p>
              <b>
                Duración total:
              </b>{' '}
              No determinada
            </p>
          )}
      </div>
    </article>
  );
}