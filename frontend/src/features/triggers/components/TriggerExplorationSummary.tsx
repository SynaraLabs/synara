import {
  TRIGGER_ANSWER_LABELS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerExplorationSummary as TriggerExplorationSummaryData,
  TriggerSummaryItem,
} from '../utils/triggerExplorationSummary';

import styles from './TriggerExplorationSummary.module.css';

interface Props {
  summary: TriggerExplorationSummaryData;
  completedAt?: string;
  onReturnToQuestions: () => void;
}

interface SummaryGroupProps {
  title: string;
  description: string;
  items: TriggerSummaryItem[];
  emptyMessage: string;
  defaultOpen?: boolean;
}

const formatCompletedDate = (
  value?: string,
): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCount = (
  count: number,
  singular: string,
  plural: string,
): string => {
  return `${count} ${
    count === 1 ? singular : plural
  }`;
};

function SummaryGroup({
  title,
  description,
  items,
  emptyMessage,
  defaultOpen = false,
}: SummaryGroupProps) {
  return (
    <details
      className={styles.group}
      open={defaultOpen}
    >
      <summary>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>

        <b>{items.length}</b>
      </summary>

      <div className={styles.groupContent}>
        {items.length > 0 ? (
          <ul className={styles.itemList}>
            {items.map(item => (
              <li key={item.questionId}>
                <div
                  className={styles.itemHeader}
                >
                  <span>
                    {item.categoryTitle}
                  </span>

                  <small>
                    {
                      TRIGGER_ANSWER_LABELS[
                        item.answer
                      ]
                    }
                  </small>
                </div>

                <p>{item.question}</p>

                {item.notes && (
                  <blockquote>
                    <b>Tu observación</b>
                    {item.notes}
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            {emptyMessage}
          </p>
        )}
      </div>
    </details>
  );
}

export function TriggerExplorationSummary({
  summary,
  completedAt,
  onReturnToQuestions,
}: Props) {
  const completedDate =
    formatCompletedDate(completedAt);

  const observedCategories =
    summary.categories.filter(
      category =>
        category.observedCount > 0,
    );

  const isComplete =
    summary.answeredCount ===
    summary.totalCount;

  return (
    <section
      className={styles.summary}
      aria-labelledby="trigger-summary-title"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          Exploración personal
        </p>

        <h2 id="trigger-summary-title">
          Lo que observaste hasta ahora
        </h2>

        <p className={styles.description}>
          Este resumen organiza tus
          percepciones. No confirma que
          estos factores sean la causa de
          tus crisis.
        </p>

        <div
          className={styles.completion}
          role="status"
        >
          <div>
            <strong>
              {summary.answeredCount} de{' '}
              {summary.totalCount}
            </strong>

            <span>
              {isComplete
                ? 'Exploración completa'
                : 'Preguntas respondidas'}
            </span>
          </div>

          {completedDate && (
            <time dateTime={completedAt}>
              Finalizada el {completedDate}
            </time>
          )}
        </div>
      </header>

      <section
        className={styles.ranking}
        aria-labelledby="trigger-ranking-title"
      >
        <header>
          <p>Primera lectura</p>

          <h3 id="trigger-ranking-title">
            Asociaciones que más percibís
          </h3>

          <span>
            Ordenadas según tus respuestas
            “con frecuencia” y “algunas
            veces”. Todavía no están
            comparadas con el historial.
          </span>
        </header>

        {observedCategories.length > 0 ? (
          <ol>
            {observedCategories.map(
              (category, index) => (
                <li
                  key={category.categoryId}
                >
                  <span
                    className={styles.position}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>

                  <div>
                    <strong>
                      {category.title}
                    </strong>

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
                  </div>

                  <b>
                    {category.observedCount}
                  </b>
                </li>
              ),
            )}
          </ol>
        ) : (
          <p className={styles.emptyRanking}>
            Todavía no registraste
            asociaciones percibidas.
          </p>
        )}
      </section>

      <section
        className={styles.detailGroups}
        aria-label="Detalle de respuestas"
      >
        <SummaryGroup
          title="Con frecuencia"
          description="Factores que elegiste observar especialmente."
          items={summary.frequent}
          emptyMessage="No marcaste factores frecuentes."
          defaultOpen
        />

        <SummaryGroup
          title="Algunas veces"
          description="Coincidencias que todavía no forman un patrón claro."
          items={summary.occasional}
          emptyMessage="No marcaste factores ocasionales."
        />

        <SummaryGroup
          title="Todavía inciertos"
          description="Los futuros registros pueden aportar más información."
          items={summary.uncertain}
          emptyMessage="No dejaste factores como inciertos."
        />
      </section>

      <aside className={styles.nextStep}>
        <p>Próximo paso</p>

        <h3>
          Comparar percepción e historial
        </h3>

        <span>
          SYNARA contrastará estas hipótesis
          con los factores registrados en tus
          episodios. Una asociación gana
          relevancia cuando se repite en
          varios registros.
        </span>

        <small>
          Algunos factores también pueden ser
          señales premonitorias. Por eso ambas
          observaciones permanecen separadas.
        </small>
      </aside>

      <button
        type="button"
        className={styles.reviewButton}
        onClick={onReturnToQuestions}
      >
        Revisar o cambiar respuestas
      </button>
    </section>
  );
}