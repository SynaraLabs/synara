import type {
  MigraineEpisode,
  RecoveryLevel,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getPostdromeDuration,
} from '../../migraine/utils/episodeCalculations';

import {
  getSymptomDefinition,
} from '../../migraine/data/clinicalSymptomCatalog';

import {
  postdromeSymptomLabels,
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

const RECOVERY_LEVEL_LABELS:
  Record<
    RecoveryLevel,
    string
  > = {
  minimal:
    'Recuperación mínima',

  partial:
    'Recuperación parcial',

  mostlyRecovered:
    'Casi completamente recuperada',

  fullyRecovered:
    'Recuperación completa',
};

export function PostdromeHistorySection({
  episode,
}: Props) {
  const postdrome =
    episode.postdrome;

  const timeline =
    episode.timeline;

  const start =
    timeline?.postdromeStart ??
    postdrome.startTime ??
    postdrome.time?.start
      ?.value;

  const end =
    timeline?.postdromeEnd ??
    postdrome.endTime ??
    postdrome.time?.end
      ?.value;

  const duration =
    getPostdromeDuration(
      episode,
    );

  const currentSymptoms =
    Array.from(
      new Set([
        ...getLabels(
          postdrome.symptoms,
          postdromeSymptomLabels,
        ),

        ...(
          postdrome
            .clinicalSymptoms ??
          []
        ).map(
          selection =>
            getSymptomDefinition(
              selection.symptom,
            )?.label ??
            selection.symptom,
        ),
      ]),
    );

  const updates =
    [
      ...(postdrome.updates ??
        []),
    ]
      .filter(update => {
        return Boolean(
          update.data?.symptoms
            ?.length ||
            update.data
              ?.clinicalSymptoms
              ?.length ||
            update.data
              ?.recoveryLevel ||
            update.data
              ?.symptomsStillActive ===
              false ||
            update.notes?.trim(),
        );
      })
      .sort(
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

  const isOpen =
    postdrome.present === true &&
    !isValidDate(end);

  return (
    <section>
      <h4>Postdromo</h4>

      <p>
        <b>
          Inicio del postdromo:
        </b>{' '}
        {formatDateTime(
          start,
          postdrome.time?.start
            ?.precision,
        )}
      </p>

      {isValidDate(end) && (
        <p>
          <b>
            Recuperación completa:
          </b>{' '}
          {formatDateTime(
            end,
            postdrome.time?.end
              ?.precision,
          )}
        </p>
      )}

      {isOpen && (
        <p>
          <b>Estado:</b>{' '}
          Recuperación en curso
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

      <div>
        <p>
          <b>
            Último estado registrado:
          </b>
        </p>

        {currentSymptoms.length > 0 ? (
          <ul>
            {currentSymptoms.map(
              symptom => (
                <li key={symptom}>
                  {symptom}
                </li>
              ),
            )}
          </ul>
        ) : (
          <p>
            Sin síntomas activos
            registrados.
          </p>
        )}
      </div>

      {updates.length > 0 && (
        <div>
          <p>
            <b>
              Evolución del postdromo:
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
                  Array.from(
                    new Set([
                      ...getLabels(
                        update.data
                          ?.symptoms,
                        postdromeSymptomLabels,
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
                    ]),
                  );

                const recoveryLevel =
                  update.data
                    ?.recoveryLevel;

                const recoveryComplete =
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
                        {recoveryComplete
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
                      <b>Síntomas:</b>{' '}
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
                          RECOVERY_LEVEL_LABELS[
                            recoveryLevel
                          ]
                        }
                      </p>
                    )}

                    {update.notes?.trim() && (
                      <p>
                        <b>Nota:</b>{' '}
                        {
                          update.notes
                        }
                      </p>
                    )}

                    {recoveryComplete && (
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

      {postdrome.notes?.trim() && (
        <p>
          <b>
            Notas del postdromo:
          </b>{' '}
          {postdrome.notes.trim()}
        </p>
      )}
    </section>
  );
}