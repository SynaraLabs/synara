import {
  TRIGGER_ANSWER_LABELS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerHistoryComparison as TriggerHistoryComparisonData,
  TriggerHistoryComparisonItem,
} from '../utils/triggerHistoryComparison';

import styles from '../../migraine/migraine.module.css';

interface Props {
  comparison:
    TriggerHistoryComparisonData;
}

const formatEpisodeCount = (
  count: number,
): string => {
  return `${count} ${
    count === 1
      ? 'episodio'
      : 'episodios'
  }`;
};

const getComparisonMessage = (
  item:
    TriggerHistoryComparisonItem,
): string => {
  if (
    item.dataQuality ===
    'insufficient'
  ) {
    return `Se registró en ${formatEpisodeCount(
      item.matchingEpisodes,
    )}, pero todavía hay pocos episodios con información para interpretar el resultado.`;
  }

  if (
    item.alignment ===
      'aligned' &&
    item.occurrence ===
      'repeated'
  ) {
    return `Tu percepción coincide con una repetición en el historial: aparece en ${formatEpisodeCount(
      item.matchingEpisodes,
    )}.`;
  }

  if (
    item.alignment ===
      'aligned' &&
    item.occurrence ===
      'none'
  ) {
    return 'Tu percepción de no haberlo observado coincide con los registros disponibles.';
  }

  if (
    item.alignment ===
      'different' &&
    item.perceivedAnswer ===
      'never'
  ) {
    return `Aunque no lo habías identificado, aparece en ${formatEpisodeCount(
      item.matchingEpisodes,
    )} del historial. Conviene seguir observándolo.`;
  }

  if (
    item.alignment ===
      'different' &&
    item.occurrence ===
      'none'
  ) {
    return 'Lo percibís como posible, pero todavía no aparece en los episodios con desencadenantes registrados.';
  }

  if (
    item.occurrence ===
    'isolated'
  ) {
    return 'Existe una sola coincidencia registrada. Todavía no alcanza para hablar de repetición.';
  }

  return `Aparece en ${formatEpisodeCount(
    item.matchingEpisodes,
  )} de ${formatEpisodeCount(
    item.episodesWithTriggerData,
  )} con información de desencadenantes.`;
};

const getStatusLabel = (
  item:
    TriggerHistoryComparisonItem,
): string => {
  if (
    item.dataQuality ===
    'insufficient'
  ) {
    return 'Datos insuficientes';
  }

  if (
    item.alignment ===
    'aligned'
  ) {
    return 'Coincidencia observada';
  }

  if (
    item.alignment ===
    'different'
  ) {
    return 'Diferencia para revisar';
  }

  return 'En observación';
};

const getAnswerPriority = (
  item:
    TriggerHistoryComparisonItem,
): number => {
  if (
    item.perceivedAnswer ===
    'often'
  ) {
    return 0;
  }

  if (
    item.perceivedAnswer ===
    'sometimes'
  ) {
    return 1;
  }

  if (
    item.alignment ===
    'different'
  ) {
    return 2;
  }

  return 3;
};

export function TriggerHistoryComparison({
  comparison,
}: Props) {
  const relevantItems =
    comparison.items
      .filter(
        item =>
          item.perceivedAnswer ===
            'often' ||
          item.perceivedAnswer ===
            'sometimes' ||
          item.alignment ===
            'different',
      )
      .sort(
        (
          first,
          second,
        ) => {
          const priorityDifference =
            getAnswerPriority(first) -
            getAnswerPriority(second);

          if (
            priorityDifference !== 0
          ) {
            return priorityDifference;
          }

          if (
            second.matchingEpisodes !==
            first.matchingEpisodes
          ) {
            return (
              second.matchingEpisodes -
              first.matchingEpisodes
            );
          }

          return first.question.localeCompare(
            second.question,
            'es-AR',
          );
        },
      );

  return (
    <section
      className={
        styles.phaseFlow
      }
      aria-labelledby="trigger-history-comparison-title"
    >
      <header
        className={
          styles.symptomSelector
        }
      >
        <div>
          <p>
            Percepción y registros
          </p>

          <h2 id="trigger-history-comparison-title">
            Comparación con tus
            episodios
          </h2>

          <p>
            SYNARA compara lo que
            percibís con los
            desencadenantes que
            registraste en cada
            episodio. Esto describe
            coincidencias, no demuestra
            causas.
          </p>
        </div>

        <div
          className={
            styles.selectionSummary
          }
          role="status"
        >
          <span
            aria-hidden="true"
          >
            {comparison
              .episodesWithTriggerData >=
            comparison
              .minimumEpisodesRequired
              ? '✓'
              : '◷'}
          </span>

          <p>
            {
              comparison
                .episodesWithTriggerData
            }{' '}
            de{' '}
            {
              comparison
                .totalHistoryEpisodes
            }{' '}
            episodios tienen
            desencadenantes registrados
          </p>
        </div>
      </header>

      {comparison
        .episodesWithTriggerData ===
      0 ? (
        <section
          className={
            styles.symptomSelector
          }
        >
          <div>
            <h3>
              Todavía no hay datos para
              comparar
            </h3>

            <p>
              Tus respuestas personales
              ya están guardadas. La
              comparación comenzará
              cuando registres posibles
              desencadenantes dentro de
              tus episodios.
            </p>
          </div>

          {comparison
            .totalHistoryEpisodes >
            0 && (
            <p>
              Tenés{' '}
              {
                comparison
                  .totalHistoryEpisodes
              }{' '}
              {comparison
                .totalHistoryEpisodes ===
              1
                ? 'episodio guardado'
                : 'episodios guardados'},
              pero ninguno contiene
              información de
              desencadenantes.
            </p>
          )}

          <p>
            Los episodios sin esa
            información no se
            interpretan como “factor
            ausente”, porque simplemente
            podrían no haber sido
            completados.
          </p>
        </section>
      ) : (
        <>
          {comparison
            .episodesWithTriggerData <
          comparison
            .minimumEpisodesRequired ? (
            <section
              className={
                styles.symptomSelector
              }
            >
              <h3>
                Comparación preliminar
              </h3>

              <p>
                Hay{' '}
                {
                  comparison
                    .episodesWithTriggerData
                }{' '}
                episodios utilizables.
                SYNARA mostrará los
                conteos, pero mantendrá
                la clasificación “Datos
                insuficientes” hasta
                contar con al menos{' '}
                {
                  comparison
                    .minimumEpisodesRequired
                }.
              </p>
            </section>
          ) : (
            <section
              className={
                styles.symptomSelector
              }
            >
              <h3>
                Base disponible
              </h3>

              <p>
                Ya existen suficientes
                episodios con
                información para
                describir repeticiones
                iniciales. Los
                resultados siguen
                siendo observaciones,
                no conclusiones
                clínicas.
              </p>
            </section>
          )}

          {relevantItems.length > 0 ? (
            relevantItems.map(
              item => (
                <article
                  key={
                    item.questionId
                  }
                  className={
                    styles.symptomSelector
                  }
                >
                  <div>
                    <p>
                      <b>
                        {
                          item.categoryIcon
                        }{' '}
                        {
                          item.categoryTitle
                        }
                      </b>
                    </p>

                    <h3>
                      {item.question}
                    </h3>
                  </div>

                  <p>
                    <b>
                      Tu percepción:
                    </b>{' '}

                    {
                      TRIGGER_ANSWER_LABELS[
                        item
                          .perceivedAnswer
                      ]
                    }
                  </p>

                  <p>
                    <b>
                      En tus registros:
                    </b>{' '}

                    {
                      item
                        .matchingEpisodes
                    }{' '}
                    de{' '}
                    {
                      item
                        .episodesWithTriggerData
                    }{' '}
                    episodios (
                    {
                      item
                        .matchingPercentage
                    }
                    %)
                  </p>

                  <div
                    className={
                      styles.selectionSummary
                    }
                  >
                    <strong>
                      {getStatusLabel(
                        item,
                      )}
                    </strong>

                    <p>
                      {getComparisonMessage(
                        item,
                      )}
                    </p>
                  </div>

                  {item.mappingKind ===
                    'related' &&
                    item.mappingExplanation && (
                      <p>
                        <b>
                          Comparación
                          aproximada:
                        </b>{' '}

                        {
                          item
                            .mappingExplanation
                        }
                      </p>
                    )}
                </article>
              ),
            )
          ) : (
            <section
              className={
                styles.symptomSelector
              }
            >
              <p>
                No hay factores
                percibidos para comparar
                por el momento.
              </p>
            </section>
          )}
        </>
      )}
    </section>
  );
}