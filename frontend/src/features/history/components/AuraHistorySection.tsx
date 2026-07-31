import type {
  AuraTiming,
  BodySide,
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getAuraDuration,
} from '../../migraine/utils/episodeCalculations';

import {
  getSymptomDefinition,
} from '../../migraine/data/clinicalSymptomCatalog';

import {
  auraTypeLabels,
  languageAuraLabels,
  motorAuraLabels,
  sensoryAuraLabels,
  vestibularAuraLabels,
  visualAuraLabels,
} from '../utils/migraineLabels';

import {
  formatDateTime,
  getLabels,
  getTimestamp,
  isValidDate,
} from '../utils/historyFormatters';

interface Props {
  episode: MigraineEpisode;
}

const AURA_TIMING_LABELS:
  Record<
    AuraTiming,
    string
  > = {
  beforePain:
    'Antes del dolor',

  duringPain:
    'Durante el dolor',

  afterPain:
    'Después del dolor',

  withoutPain:
    'Sin dolor',

  overlappingPain:
    'Se superpuso con el dolor',

  unknown:
    'Relación temporal no determinada',
};

const BODY_SIDE_LABELS:
  Record<
    BodySide,
    string
  > = {
  left:
    'Izquierda',

  right:
    'Derecha',

  bilateral:
    'Ambos lados',

  alternating:
    'Cambió de lado',

  central:
    'Centro',

  unknown:
    'No determinado',
};

const removeDuplicates = (
  values: string[],
): string[] => {
  return Array.from(
    new Set(values),
  );
};

export function AuraHistorySection({
  episode,
}: Props) {
  const aura =
    episode.aura;

  const timeline =
    episode.timeline;

  const start =
    timeline?.auraStart ??
    aura.time?.start?.value;

  const end =
    timeline?.auraEnd ??
    aura.time?.end?.value;

  const duration =
    getAuraDuration(
      episode,
    );

  const currentSymptoms =
    removeDuplicates([
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

      ...(
        aura.clinicalSymptoms ??
        []
      ).map(
        selection =>
          getSymptomDefinition(
            selection.symptom,
          )?.label ??
          selection.symptom,
      ),
    ]);

  const updates =
    [
      ...(aura.updates ?? []),
    ].sort(
      (
        first,
        second,
      ) => {
        const firstTime =
          first.occurredAt
            ?.value ??
          first.createdAt;

        const secondTime =
          second.occurredAt
            ?.value ??
          second.createdAt;

        return (
          getTimestamp(firstTime) -
          getTimestamp(secondTime)
        );
      },
    );

  return (
    <section>
      <h4>Aura</h4>

      <p>
        <b>
          Inicio del aura:
        </b>{' '}
        {formatDateTime(
          start,
          aura.time?.start
            ?.precision,
        )}
      </p>

      {isValidDate(end) && (
        <p>
          <b>
            Final del aura:
          </b>{' '}
          {formatDateTime(
            end,
            aura.time?.end
              ?.precision,
          )}
        </p>
      )}

      {duration !== undefined && (
        <p>
          <b>Duración:</b>{' '}
          {formatDuration(
            duration,
          )}
        </p>
      )}

      {aura.timing && (
        <p>
          <b>
            Relación con el dolor:
          </b>{' '}
          {
            AURA_TIMING_LABELS[
              aura.timing
            ]
          }
        </p>
      )}

      {aura.side && (
        <p>
          <b>Lado afectado:</b>{' '}
          {
            BODY_SIDE_LABELS[
              aura.side
            ]
          }
        </p>
      )}

      {currentSymptoms.length > 0 && (
        <div>
          <p>
            <b>
              Último estado registrado:
            </b>
          </p>

          <ul>
            {currentSymptoms.map(
              symptom => (
                <li key={symptom}>
                  {symptom}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {updates.length > 0 && (
        <div>
          <p>
            <b>
              Evolución del aura:
            </b>
          </p>

          <ul>
            {updates.map(
              (
                update,
                index,
              ) => {
                const updateTime =
                  update.occurredAt
                    ?.value ??
                  update.createdAt;

                const symptoms =
                  removeDuplicates([
                    ...getLabels(
                      update.data
                        ?.types,
                      auraTypeLabels,
                    ),

                    ...getLabels(
                      update.data
                        ?.visualSymptoms,
                      visualAuraLabels,
                    ),

                    ...getLabels(
                      update.data
                        ?.sensorySymptoms,
                      sensoryAuraLabels,
                    ),

                    ...getLabels(
                      update.data
                        ?.languageSymptoms,
                      languageAuraLabels,
                    ),

                    ...getLabels(
                      update.data
                        ?.motorSymptoms,
                      motorAuraLabels,
                    ),

                    ...getLabels(
                      update.data
                        ?.vestibularSymptoms,
                      vestibularAuraLabels,
                    ),

                    ...(
                      update.data
                        ?.clinicalSymptoms ??
                      []
                    ).map(
                      selection =>
                        getSymptomDefinition(
                          selection.symptom,
                        )?.label ??
                        selection.symptom,
                    ),
                  ]);

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
                      <b>Síntomas:</b>{' '}
                      {symptoms.length >
                      0
                        ? symptoms.join(
                            ', ',
                          )
                        : 'Sin síntomas seleccionados'}
                    </p>

                    {update.notes?.trim() && (
                      <p>
                        <b>Nota:</b>{' '}
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

      {aura.notes?.trim() && (
        <p>
          <b>Notas del aura:</b>{' '}
          {aura.notes.trim()}
        </p>
      )}
    </section>
  );
}