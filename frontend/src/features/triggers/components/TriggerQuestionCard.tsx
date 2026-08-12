import {
  TRIGGER_ANSWER_LABELS,
} from '../data/triggerEducationCatalog';

import type {
  TriggerQuestion,
  TriggerQuestionAnswer,
} from '../data/triggerEducationCatalog';

import type {
  TriggerQuestionResponse,
} from '../types/triggerExploration.types';

import styles from './TriggerQuestionCard.module.css';

interface Props {
  question: TriggerQuestion;

  response?: TriggerQuestionResponse;

  onAnswer: (
    answer: TriggerQuestionAnswer,
  ) => void;

  onNotesChange: (
    notes: string,
  ) => void;
}

const ANSWER_ORDER:
  TriggerQuestionAnswer[] = [
  'often',
  'sometimes',
  'never',
  'unknown',
];

export function TriggerQuestionCard({
  question,
  response,
  onAnswer,
  onNotesChange,
}: Props) {
  const showNotes =
    response?.answer === 'often' ||
    response?.answer === 'sometimes';

  const isAnswered =
    Boolean(response?.answer);

  return (
    <article
      className={styles.card}
      data-answered={
        isAnswered ? 'true' : undefined
      }
      aria-labelledby={`trigger-question-${question.id}`}
    >
      <header className={styles.header}>
        <div>
          <h3
            id={`trigger-question-${question.id}`}
          >
            {question.question}
          </h3>

          <p>{question.explanation}</p>
        </div>

        <span
          className={styles.status}
          aria-label={
            isAnswered
              ? 'Pregunta respondida'
              : 'Pregunta pendiente'
          }
        >
          {isAnswered
            ? 'Respondida'
            : 'Pendiente'}
        </span>
      </header>

      <div
        className={styles.answers}
        role="group"
        aria-label={`Respuesta a: ${question.question}`}
      >
        {ANSWER_ORDER.map(answer => {
          const isSelected =
            response?.answer === answer;

          return (
            <button
              key={answer}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                onAnswer(answer)
              }
            >
              {
                TRIGGER_ANSWER_LABELS[
                  answer
                ]
              }
            </button>
          );
        })}
      </div>

      {showNotes && (
        <label className={styles.notes}>
          <span>
            ¿Qué observaste?
          </span>

          <small>
            Opcional. Podés anotar un
            momento, situación o detalle
            que quieras recordar.
          </small>

          <textarea
            value={response?.notes ?? ''}
            rows={3}
            placeholder="Ej.: suele ocurrir los domingos cuando duermo más y desayuno tarde"
            onChange={event =>
              onNotesChange(
                event.target.value,
              )
            }
          />
        </label>
      )}
    </article>
  );
}