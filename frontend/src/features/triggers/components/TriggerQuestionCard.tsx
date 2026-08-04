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

import styles from '../../migraine/migraine.module.css';

interface Props {
  question:
    TriggerQuestion;

  response?:
    TriggerQuestionResponse;

  onAnswer: (
    answer:
      TriggerQuestionAnswer,
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
    response?.answer ===
      'often' ||
    response?.answer ===
      'sometimes';

  return (
    <article
      className={
        styles.symptomSelector
      }
      aria-labelledby={`trigger-question-${question.id}`}
    >
      <div>
        <h3
          id={`trigger-question-${question.id}`}
        >
          {question.question}
        </h3>

        <p>
          {question.explanation}
        </p>
      </div>

      <div
        className={
          styles.compactChoiceGrid
        }
        role="group"
        aria-label="Respuesta"
      >
        {ANSWER_ORDER.map(
          answer => (
            <button
              key={answer}
              type="button"
              className={
                styles.compactChoice
              }
              aria-pressed={
                response?.answer ===
                answer
              }
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
          ),
        )}
      </div>

      {showNotes && (
        <label>
          ¿Qué observaste?

          <textarea
            value={
              response?.notes ??
              ''
            }
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