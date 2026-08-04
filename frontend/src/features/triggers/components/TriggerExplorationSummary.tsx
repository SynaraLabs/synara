import {
  TRIGGER_ANSWER_LABELS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerExplorationSummary as TriggerExplorationSummaryData,
  TriggerSummaryItem,
} from '../utils/triggerExplorationSummary';

import styles from '../../migraine/migraine.module.css';

interface Props {
  summary:
    TriggerExplorationSummaryData;

  completedAt?: string;

  onReturnToQuestions:
    () => void;
}

interface SummaryGroupProps {
  title: string;

  description: string;

  items:
    TriggerSummaryItem[];

  emptyMessage: string;
}

const formatCompletedDate = (
  value?: string,
): string | null => {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
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

const formatCount = (
  count: number,
  singular: string,
  plural: string,
): string => {
  return `${count} ${
    count === 1
      ? singular
      : plural
  }`;
};

function SummaryGroup({
  title,
  description,
  items,
  emptyMessage,
}: SummaryGroupProps) {
  return (
    <section
      className={
        styles.symptomSelector
      }
    >
      <div>
        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>

      {items.length > 0 ? (
        <ul>
          {items.map(
            item => (
              <li
                key={
                  item.questionId
                }
              >
                <p>
                  <b>
                    {item.categoryIcon}{' '}
                    {
                      item.categoryTitle
                    }
                  </b>
                </p>

                <p>
                  {item.question}
                </p>

                <small>
                  {
                    TRIGGER_ANSWER_LABELS[
                      item.answer
                    ]
                  }
                </small>

                {item.notes && (
                  <p>
                    <b>
                      Observación:
                    </b>{' '}
                    {item.notes}
                  </p>
                )}
              </li>
            ),
          )}
        </ul>
      ) : (
        <p>
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export function TriggerExplorationSummary({
  summary,
  completedAt,
  onReturnToQuestions,
}: Props) {
  const completedDate =
    formatCompletedDate(
      completedAt,
    );

  const observedCategories =
    summary.categories.filter(
      category =>
        category.observedCount >
        0,
    );

  return (
    <section
      className={
        styles.phaseFlow
      }
      aria-labelledby="trigger-summary-title"
    >
      <header
        className={
          styles.symptomSelector
        }
      >
        <div>
          <p>
            Exploración personal
          </p>

          <h2 id="trigger-summary-title">
            Resumen de posibles
            desencadenantes
          </h2>

          <p>
            Este resumen refleja lo que
            observaste hasta ahora. No
            confirma que estos factores
            sean la causa de tus crisis.
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
            {summary.answeredCount ===
            summary.totalCount
              ? '✓'
              : '◷'}
          </span>

          <p>
            {summary.answeredCount} de{' '}
            {summary.totalCount}{' '}
            preguntas respondidas
          </p>
        </div>

        {completedDate && (
          <p>
            Exploración finalizada el{' '}
            {completedDate}
          </p>
        )}
      </header>

      <section
        className={
          styles.symptomSelector
        }
      >
        <div>
          <h3>
            Categorías con más
            asociaciones percibidas
          </h3>

          <p>
            El orden se basa solamente
            en tus respuestas “con
            frecuencia” y “algunas
            veces”. Todavía no se
            comparó con tus episodios.
          </p>
        </div>

        {observedCategories.length >
        0 ? (
          <ul>
            {observedCategories.map(
              category => (
                <li
                  key={
                    category.categoryId
                  }
                >
                  <b>
                    {category.icon}{' '}
                    {category.title}
                  </b>

                  <p>
                    {formatCount(
                      category.observedCount,
                      'asociación percibida',
                      'asociaciones percibidas',
                    )}
                  </p>

                  <small>
                    {formatCount(
                      category.frequentCount,
                      'frecuente',
                      'frecuentes',
                    )}
                    {' · '}
                    {formatCount(
                      category.occasionalCount,
                      'ocasional',
                      'ocasionales',
                    )}
                  </small>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p>
            Todavía no registraste
            asociaciones percibidas.
          </p>
        )}
      </section>

      <SummaryGroup
        title="Factores que observás con frecuencia"
        description="Son los factores que elegiste observar especialmente. Siguen siendo hipótesis personales."
        items={summary.frequent}
        emptyMessage="No marcaste factores frecuentes."
      />

      <SummaryGroup
        title="Factores observados algunas veces"
        description="Pueden haber coincidido con algunos episodios, pero todavía no forman un patrón claro."
        items={summary.occasional}
        emptyMessage="No marcaste factores ocasionales."
      />

      <SummaryGroup
        title="Factores todavía inciertos"
        description="Son preguntas que todavía no podés responder. Los futuros registros pueden aportar más información."
        items={summary.uncertain}
        emptyMessage="No dejaste factores como inciertos."
      />

      <section
        className={
          styles.symptomSelector
        }
      >
        <div>
          <h3>
            Qué hará SYNARA con este
            resumen
          </h3>

          <p>
            Comparará estas hipótesis
            con los factores registrados
            en tus episodios. Un patrón
            solo ganará relevancia si se
            repite en varios registros.
          </p>
        </div>

        <p>
          Algunos factores también
          pueden ser señales
          premonitorias. Por eso SYNARA
          mantendrá separadas tus
          percepciones personales y las
          coincidencias observadas en el
          historial.
        </p>
      </section>

      <button
        type="button"
        onClick={
          onReturnToQuestions
        }
      >
        Revisar o cambiar respuestas
      </button>
    </section>
  );
}