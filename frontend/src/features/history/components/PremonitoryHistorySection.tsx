import type {
  MigraineEpisode,
  PremonitorySymptom,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
  getPremonitoryDuration,
} from '../../migraine/utils/episodeCalculations';

import {
  getSymptomDefinition,
} from '../../migraine/data/clinicalSymptomCatalog';

import {
  formatDateTime,
  getTimestamp,
  isValidDate,
} from '../utils/historyFormatters';

interface Props {
  episode: MigraineEpisode;

  hasCrisis: boolean;

  hasAura: boolean;
}

const getSymptomLabel = (
  symptom: PremonitorySymptom,
): string => {
  return (
    getSymptomDefinition(
      symptom,
    )?.label ??
    symptom
  );
};

export function PremonitoryHistorySection({
  episode,
  hasCrisis,
  hasAura,
}: Props) {
  const premonitory =
    episode.premonitory;

  const timeline =
    episode.timeline;

  const start =
    timeline?.premonitoryStart ??
    premonitory.time?.start
      ?.value;

  const end =
    timeline?.premonitoryEnd ??
    premonitory.time?.end
      ?.value;

  const endIsUnknown =
    premonitory.time?.end
      ?.precision === 'unknown' &&
    !isValidDate(end);

  const duration =
    getPremonitoryDuration(
      episode,
    );

  const updates =
    [
      ...(premonitory.updates ??
        []),
    ].sort(
      (
        first,
        second,
      ) => {
        const firstDate =
          first.occurredAt
            ?.value ??
          first.createdAt;

        const secondDate =
          second.occurredAt
            ?.value ??
          second.createdAt;

        return (
          getTimestamp(firstDate) -
          getTimestamp(secondDate)
        );
      },
    );

  const isUncertainRecord =
    episode.status ===
      'incomplete' ||
    premonitory.status ===
      'uncertain';

  const getResult =
    (): string | undefined => {
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
        return (
          premonitory.status ===
            'active' &&
          hasCrisis
        )
          ? 'Las señales continuaron durante la crisis.'
          : 'Las señales evolucionaron a crisis.';
      }

      if (
        premonitory
          .evolvedToAura
      ) {
        return (
          premonitory.status ===
            'active' &&
          hasAura
        )
          ? 'Las señales continuaron durante el aura.'
          : 'Las señales evolucionaron a aura.';
      }

      if (isUncertainRecord) {
        return 'No se pudo confirmar si las señales estuvieron relacionadas con una migraña.';
      }

      if (
        premonitory.status ===
        'active'
      ) {
        return 'Las señales permanecen abiertas.';
      }

      return undefined;
    };

  const result = getResult();

  return (
    <section>
      <h4>Señales previas</h4>

      <p>
        <b>
          Inicio de las señales:
        </b>{' '}
        {formatDateTime(
          start,
          premonitory.time?.start
            ?.precision,
        )}
      </p>

      {isValidDate(end) && (
        <p>
          <b>
            Final de las señales:
          </b>{' '}
          {formatDateTime(
            end,
            premonitory.time?.end
              ?.precision,
          )}
        </p>
      )}

      {endIsUnknown && (
        <p>
          <b>
            Final de las señales:
          </b>{' '}
          Hora desconocida
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

      {updates.length > 0 ? (
        <div>
          <p>
            <b>
              Evolución de las señales:
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
                  (
                    update.data
                      ?.symptoms ??
                    []
                  ).map(
                    getSymptomLabel,
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
                      <b>Señales:</b>{' '}
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
                        {intensity}/10
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
                  </li>
                );
              },
            )}
          </ul>
        </div>
      ) : (
        <p>
          {premonitory.symptoms
            .length > 0
            ? `Señales registradas: ${premonitory.symptoms
                .map(
                  getSymptomLabel,
                )
                .join(', ')}`
            : 'Sin actualizaciones registradas.'}
        </p>
      )}

      {result && (
        <p>
          <b>Resultado:</b>{' '}
          {result}
        </p>
      )}
    </section>
  );
}