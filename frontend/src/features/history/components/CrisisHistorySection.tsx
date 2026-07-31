import type {
  AnatomicalPainMap,
  MigraineEpisode,
  PainLocationRecord,
  Treatment,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getCrisisDuration,
  getMaxPainIntensity,
} from '../../migraine/utils/episodeCalculations';

import {
  convertLegacyLocationRecord,
  formatPainLocationPoint,
  formatPainRadiationPath,
} from '../../migraine/data/painLocationCatalog';

import {
  CRISIS_SYMPTOM_LABELS,
} from '../../migraine/data/crisisSymptomCatalog';

import {
  NON_PHARMACOLOGICAL_MEASURE_LABELS,
} from '../../migraine/data/nonPharmacologicalMeasureCatalog';

import {
  TRIGGER_LABELS,
} from '../../migraine/data/triggerCatalog';

import {
  TREATMENT_EFFECTIVENESS_LABELS,
  TREATMENT_TYPE_LABELS,
} from '../../migraine/data/treatmentCatalog';

import {
  getFunctionalCapacityRecords,
  getMedicationRecords,
  getNonPharmacologicalRecords,
} from '../../migraine/utils/crisisEventRecords';

import {
  getCrisisEvolution,
} from '../../migraine/utils/crisisEvolution';

import type {
  AffectedActivity,
  FunctionalCapacityLevel,
} from '../../migraine/components/crisis-mode/FunctionalCapacityCard';

interface Props {
  episode: MigraineEpisode;
}

const FUNCTIONAL_LEVEL_LABELS:
  Record<
    FunctionalCapacityLevel,
    string
  > = {
  normal:
    'Pudo realizar sus actividades habituales',

  limited:
    'Tuvo limitaciones',

  veryLimited:
    'Estuvo muy limitada',

  unable:
    'No pudo realizar sus actividades',
};

const AFFECTED_ACTIVITY_LABELS:
  Record<
    AffectedActivity,
    string
  > = {
  personalCare:
    'Cuidado personal',

  walking:
    'Caminar o moverse',

  eatingDrinking:
    'Comer o beber',

  communicating:
    'Hablar o comunicarse',

  usingScreens:
    'Usar pantallas',

  workingStudying:
    'Trabajar o estudiar',

  householdTasks:
    'Tareas del hogar',

  driving:
    'Conducir',
};

const parseValidDate = (
  value?: string,
): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? undefined
    : date;
};

const formatDateTime = (
  value?: string,
): string => {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Sin registrar';
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
};

const formatTimeValue = (
  value?: string,
): string => {
  if (!value) {
    return 'Sin registrar';
  }

  if (
    /^\d{2}:\d{2}$/.test(
      value,
    )
  ) {
    return value;
  }

  const date =
    parseValidDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleTimeString(
    'es-AR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

const hasPainLocationData = (
  location?: AnatomicalPainMap,
): location is AnatomicalPainMap => {
  if (!location) {
    return false;
  }

  return Boolean(
    location.primary ||
      location.origin ||
      location.additional.length >
        0 ||
      (
        location.radiation ??
        []
      ).length > 0 ||
      location.changesSide ||
      location.notes?.trim(),
  );
};

const getCurrentPainLocation = (
  episode: MigraineEpisode,
): AnatomicalPainMap | undefined => {
  const crisis =
    episode.crisis;

  if (
    hasPainLocationData(
      crisis.anatomicalLocation,
    )
  ) {
    return crisis.anatomicalLocation;
  }

  if (crisis.locationDetails) {
    const converted =
      convertLegacyLocationRecord(
        crisis.locationDetails,
      );

    if (
      hasPainLocationData(
        converted,
      )
    ) {
      return converted;
    }
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

  const converted =
    convertLegacyLocationRecord(
      legacyRecord,
    );

  return hasPainLocationData(
    converted,
  )
    ? converted
    : undefined;
};

const getPainLocationLines = (
  location?: AnatomicalPainMap,
): string[] => {
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

  const additional =
    Array.from(
      new Set(
        location.additional.map(
          formatPainLocationPoint,
        ),
      ),
    );

  if (additional.length > 0) {
    lines.push(
      `Otras zonas: ${additional.join(
        ', ',
      )}`,
    );
  }

  const radiation =
    Array.from(
      new Set(
        (
          location.radiation ??
          []
        ).map(
          formatPainRadiationPath,
        ),
      ),
    );

  if (radiation.length > 0) {
    lines.push(
      `Extensión: ${radiation.join(
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
};

const hasTreatmentData = (
  treatment?: Treatment,
): boolean => {
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

export function CrisisHistorySection({
  episode,
}: Props) {
  const crisis =
    episode.crisis;

  const timeline =
    episode.timeline;

  const crisisStart =
    timeline?.crisisStart ??
    crisis.startTime ??
    crisis.time?.start?.value;

  const crisisEnd =
    timeline?.crisisEnd ??
    crisis.endTime ??
    crisis.time?.end?.value;

  const crisisDuration =
    getCrisisDuration(
      episode,
    );

  const maxIntensity =
    getMaxPainIntensity(
      episode,
    );

  const locationLines =
    getPainLocationLines(
      getCurrentPainLocation(
        episode,
      ),
    );

  const evolution =
    getCrisisEvolution(
      crisis,
    );

  const medications =
    getMedicationRecords(
      crisis,
    );

  const nonPharmacologicalRecords =
    getNonPharmacologicalRecords(
      crisis,
    );

  const functionalRecords =
    getFunctionalCapacityRecords(
      crisis,
    );

  const crisisSymptoms =
    crisis.symptoms ?? [];

  const triggers =
    episode.triggers ?? [];

  const treatment =
    episode.treatment;

  return (
    <section>
      <h4>Crisis</h4>

      <p>
        <b>
          Inicio de la crisis:
        </b>{' '}
        {formatDateTime(
          crisisStart,
        )}
      </p>

      {crisisEnd && (
        <p>
          <b>
            Final de la crisis:
          </b>{' '}
          {formatDateTime(
            crisisEnd,
          )}
        </p>
      )}

      <p>
        <b>Duración:</b>{' '}
        {formatDuration(
          crisisDuration,
        )}
      </p>

      <p>
        <b>Dolor máximo:</b>{' '}
        {maxIntensity}/10
      </p>

      {locationLines.length > 0 && (
        <div>
          <p>
            <b>
              Localización actual o
              final:
            </b>
          </p>

          <ul>
            {locationLines.map(
              (
                line,
                index,
              ) => (
                <li
                  key={`${line}-${index}`}
                >
                  {line}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {evolution.length > 0 && (
        <div>
          <p>
            <b>
              Evolución conjunta:
            </b>
          </p>

          <ul>
            {evolution.map(
              record => (
                <li key={record.id}>
                  <b>
                    {formatDateTime(
                      record.timestamp,
                    )}
                  </b>

                  {record.type ===
                    'intensity' && (
                    <p>
                      Dolor:{' '}
                      {record.intensity}
                      /10
                    </p>
                  )}

                  {record.type ===
                    'location' && (
                    <p>
                      Localización:{' '}
                      {record.locations?.join(
                        ', ',
                      )}
                    </p>
                  )}

                  {record.type ===
                    'symptom' && (
                    <p>
                      {record.symptomAction ===
                      'removed'
                        ? 'Síntoma retirado'
                        : 'Síntoma agregado'}
                      :{' '}
                      {
                        record.symptomLabel
                      }
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      <p>
        <b>
          Síntomas al último registro:
        </b>{' '}
        {crisisSymptoms.length > 0
          ? crisisSymptoms
              .map(
                symptom =>
                  CRISIS_SYMPTOM_LABELS[
                    symptom
                  ],
              )
              .join(', ')
          : 'Sin síntomas registrados'}
      </p>

      {medications.length > 0 && (
        <div>
          <p>
            <b>
              Medicación durante la
              crisis:
            </b>
          </p>

          <ul>
            {medications.map(
              record => (
                <li key={record.id}>
                  {formatDateTime(
                    record.takenAt,
                  )}
                  {' → '}
                  {record.medication}

                  {record.dose
                    ? ` (${record.dose})`
                    : ''}

                  {record.notes && (
                    <p>
                      Nota:{' '}
                      {record.notes}
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {nonPharmacologicalRecords.length >
        0 && (
        <div>
          <p>
            <b>
              Medidas no farmacológicas:
            </b>
          </p>

          <ul>
            {nonPharmacologicalRecords.map(
              record => (
                <li key={record.id}>
                  {formatDateTime(
                    record.appliedAt,
                  )}
                  {' → '}
                  {record.measures
                    .map(
                      measure =>
                        NON_PHARMACOLOGICAL_MEASURE_LABELS[
                          measure
                        ],
                    )
                    .join(', ')}

                  {record.notes && (
                    <p>
                      Nota:{' '}
                      {record.notes}
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {functionalRecords.length >
        0 && (
        <div>
          <p>
            <b>
              Evolución funcional:
            </b>
          </p>

          <ul>
            {functionalRecords.map(
              record => (
                <li key={record.id}>
                  <b>
                    {formatDateTime(
                      record.occurredAt,
                    )}
                  </b>

                  <p>
                    {
                      FUNCTIONAL_LEVEL_LABELS[
                        record.level
                      ]
                    }
                  </p>

                  {record
                    .affectedActivities
                    .length > 0 && (
                    <p>
                      Actividades
                      afectadas:{' '}
                      {record
                        .affectedActivities
                        .map(
                          activity =>
                            AFFECTED_ACTIVITY_LABELS[
                              activity
                            ],
                        )
                        .join(', ')}
                    </p>
                  )}

                  {record.notes && (
                    <p>
                      Nota:{' '}
                      {record.notes}
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      <p>
        <b>
          Posibles desencadenantes:
        </b>{' '}
        {triggers.length > 0
          ? triggers
              .map(
                trigger =>
                  TRIGGER_LABELS[
                    trigger
                  ],
              )
              .join(', ')
          : 'Sin desencadenantes registrados'}
      </p>

      {hasTreatmentData(
        treatment,
      ) && (
        <div>
          <p>
            <b>
              Tratamiento general del
              episodio:
            </b>
          </p>

          <ul>
            {treatment.type && (
              <li>
                Tipo:{' '}
                {
                  TREATMENT_TYPE_LABELS[
                    treatment.type
                  ]
                }
              </li>
            )}

            {treatment.medication && (
              <li>
                {treatment.medication}

                {treatment.dose
                  ? ` (${treatment.dose})`
                  : ''}
              </li>
            )}

            {treatment.takenAt && (
              <li>
                Hora:{' '}
                {formatTimeValue(
                  treatment.takenAt,
                )}
              </li>
            )}

            {treatment.effectiveness && (
              <li>
                Resultado:{' '}
                {
                  TREATMENT_EFFECTIVENESS_LABELS[
                    treatment
                      .effectiveness
                  ]
                }
              </li>
            )}

            {treatment
              .responseTimeMinutes !==
              undefined && (
              <li>
                Tiempo hasta la
                mejoría:{' '}
                {
                  treatment
                    .responseTimeMinutes
                }{' '}
                minutos
              </li>
            )}

            {treatment.sideEffects &&
              treatment.sideEffects
                .length > 0 && (
                <li>
                  Efectos secundarios:{' '}
                  {treatment.sideEffects.join(
                    ', ',
                  )}
                </li>
              )}

            {treatment.notes?.trim() && (
              <li>
                Nota:{' '}
                {treatment.notes.trim()}
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}