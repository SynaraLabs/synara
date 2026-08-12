import {
  TRIGGER_ANSWER_LABELS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerHistoryComparison as TriggerHistoryComparisonData,
  TriggerHistoryComparisonItem,
} from '../utils/triggerHistoryComparison';

import styles from './TriggerHistoryComparison.module.css';

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

const getStatusTone = (
  item:
    TriggerHistoryComparisonItem,
): string => {
  if (
    item.dataQuality ===
    'insufficient'
  ) {
    return 'insufficient';
  }

  if (
    item.alignment ===
    'aligned'
  ) {
    return 'aligned';
  }

  if (
    item.alignment ===
    'different'
  ) {
    return 'different';
  }

  return 'observing';
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

  const hasTriggerData =
    comparison
      .episodesWithTriggerData > 0;

  const hasEnoughData =
    comparison
      .episodesWithTriggerData >=
    comparison
      .minimumEpisodesRequired;

  return (
    <section
      className={styles.root}
      aria-labelledby="trigger-history-comparison-title"
    >
      <header
        className={styles.header}
      >
        <p
          className={styles.eyebrow}
        >
          Percepción y registros
        </p>

        <h2 id="trigger-history-comparison-title">
          Lo que percibís y lo que
          registraste
        </h2>

        <p
          className={styles.lead}
        >
          SYNARA busca coincidencias
          entre tus respuestas y tus
          episodios. Estas observaciones
          ayudan a mirar patrones, pero
          no demuestran causas.
        </p>
      </header>

      <section
        className={styles.dataSummary}
        aria-labelledby="comparison-data-title"
      >
        <div>
          <p
            className={styles.summaryLabel}
            id="comparison-data-title"
          >
            Base disponible
          </p>

          <strong
            className={styles.summaryValue}
          >
            {
              comparison
                .episodesWithTriggerData
            }
            <span>
              {' '}/{' '}
              {
                comparison
                  .totalHistoryEpisodes
              }
            </span>
          </strong>

          <p
            className={styles.summaryText}
          >
            episodios con
            desencadenantes registrados
          </p>
        </div>

        <div
          className={styles.progress}
          aria-hidden="true"
        >
          <span
            style={{
              width:
                comparison
                  .totalHistoryEpisodes > 0
                  ? `${Math.min(
                      100,
                      (
                        comparison
                          .episodesWithTriggerData /
                        comparison
                          .totalHistoryEpisodes
                      ) * 100,
                    )}%`
                  : '0%',
            }}
          />
        </div>

        <p
          className={styles.dataStatus}
          data-ready={
            hasEnoughData
              ? 'true'
              : 'false'
          }
        >
          {hasEnoughData
            ? 'Ya hay una base inicial para describir repeticiones.'
            : `La comparación será más representativa al alcanzar ${comparison.minimumEpisodesRequired} episodios con esta información.`}
        </p>
      </section>

      {!hasTriggerData ? (
        <section
          className={styles.emptyState}
        >
          <p
            className={styles.emptyEyebrow}
          >
            Comparación pendiente
          </p>

          <h3>
            Todavía no hay datos para
            comparar
          </h3>

          <p>
            Tus respuestas personales
            ya están guardadas. La
            comparación comenzará cuando
            registres posibles
            desencadenantes dentro de tus
            episodios.
          </p>

          {comparison
            .totalHistoryEpisodes > 0 && (
            <p
              className={styles.emptyNote}
            >
              Tenés{' '}
              {
                comparison
                  .totalHistoryEpisodes
              }{' '}
              {comparison
                .totalHistoryEpisodes === 1
                ? 'episodio guardado'
                : 'episodios guardados'},
              pero todavía ninguno tiene
              información de
              desencadenantes.
            </p>
          )}

          <p
            className={styles.clinicalNote}
          >
            Un episodio sin esta
            información no se interpreta
            como “factor ausente”: puede
            tratarse de un registro que
            todavía no fue completado.
          </p>
        </section>
      ) : (
        <section
          className={styles.results}
          aria-labelledby="comparison-results-title"
        >
          <div
            className={styles.resultsHeader}
          >
            <div>
              <p
                className={styles.eyebrow}
              >
                Resultados
              </p>

              <h3 id="comparison-results-title">
                Factores para seguir
                observando
              </h3>
            </div>

            <span>
              {relevantItems.length}{' '}
              {relevantItems.length === 1
                ? 'factor'
                : 'factores'}
            </span>
          </div>

          {!hasEnoughData && (
            <p
              className={styles.preliminary}
            >
              Los conteos son
              preliminares. Hasta reunir
              al menos{' '}
              {
                comparison
                  .minimumEpisodesRequired
              }{' '}
              episodios utilizables,
              SYNARA los mantendrá como
              datos insuficientes.
            </p>
          )}

          {relevantItems.length > 0 ? (
            <div
              className={styles.list}
            >
              {relevantItems.map(
                (
                  item,
                  index,
                ) => (
                  <details
                    key={item.questionId}
                    className={styles.item}
                    data-status={
                      getStatusTone(item)
                    }
                    open={
                      index === 0
                        ? true
                        : undefined
                    }
                  >
                    <summary
                      className={styles.itemSummary}
                    >
                      <span
                        className={styles.itemHeading}
                      >
                        <small>
                          {
                            item
                              .categoryTitle
                          }
                        </small>

                        <strong>
                          {item.question}
                        </strong>
                      </span>

                      <span
                        className={styles.itemSide}
                      >
                        <b>
                          {
                            item
                              .matchingPercentage
                          }
                          %
                        </b>

                        <span
                          className={styles.chevron}
                          aria-hidden="true"
                        >
                          ⌄
                        </span>
                      </span>
                    </summary>

                    <div
                      className={styles.itemContent}
                    >
                      <div
                        className={styles.comparisonGrid}
                      >
                        <div>
                          <span>
                            Tu percepción
                          </span>

                          <strong>
                            {
                              TRIGGER_ANSWER_LABELS[
                                item
                                  .perceivedAnswer
                              ]
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            En tus registros
                          </span>

                          <strong>
                            {
                              item
                                .matchingEpisodes
                            }{' '}
                            de{' '}
                            {
                              item
                                .episodesWithTriggerData
                            }{' '}
                            episodios
                          </strong>
                        </div>
                      </div>

                      <div
                        className={styles.interpretation}
                      >
                        <strong>
                          {getStatusLabel(item)}
                        </strong>

                        <p>
                          {getComparisonMessage(item)}
                        </p>
                      </div>

                      {item.mappingKind ===
                        'related' &&
                        item.mappingExplanation && (
                          <p
                            className={styles.mappingNote}
                          >
                            <b>
                              Comparación aproximada:
                            </b>{' '}
                            {
                              item
                                .mappingExplanation
                            }
                          </p>
                        )}
                    </div>
                  </details>
                ),
              )}
            </div>
          ) : (
            <div
              className={styles.noResults}
            >
              <h4>
                No hay factores para
                comparar por ahora
              </h4>

              <p>
                A medida que completes
                la exploración y registres
                episodios, aparecerán acá
                las coincidencias que
                merezcan seguimiento.
              </p>
            </div>
          )}
        </section>
      )}
    </section>
  );
}