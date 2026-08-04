import {
  useMemo,
  useState,
} from 'react';

import {
  TRIGGER_EDUCATION_PRINCIPLES,
  TRIGGER_EDUCATION_SECTIONS,
} from '../data/triggerEducationCatalog';

import {
  useTriggerExplorationStore,
} from '../store/triggerExploration.store';

import {
  TriggerExplorationSummary,
} from '../components/TriggerExplorationSummary';

import {
  TriggerQuestionCard,
} from '../components/TriggerQuestionCard';

import {
  createTriggerExplorationSummary,
} from '../utils/triggerExplorationSummary';

import styles from '../../migraine/migraine.module.css';

export function TriggerExplorerPage() {
  const exploration =
    useTriggerExplorationStore(
      state =>
        state.exploration,
    );

  const setActiveCategory =
    useTriggerExplorationStore(
      state =>
        state.setActiveCategory,
    );

  const updateResponse =
    useTriggerExplorationStore(
      state =>
        state.updateResponse,
    );

  const updateResponseNotes =
    useTriggerExplorationStore(
      state =>
        state.updateResponseNotes,
    );

  const completeExploration =
    useTriggerExplorationStore(
      state =>
        state.completeExploration,
    );

  const [
    showSummary,
    setShowSummary,
  ] = useState(
    Boolean(
      exploration.completedAt,
    ),
  );

  const summary =
    useMemo(
      () =>
        createTriggerExplorationSummary(
          exploration.responses,
        ),
      [
        exploration.responses,
      ],
    );

  const answeredCount =
    summary.answeredCount;

  const totalQuestions =
    summary.totalCount;

  const isComplete =
    answeredCount ===
    totalQuestions;

  const activeSectionIndex =
    Math.max(
      0,
      TRIGGER_EDUCATION_SECTIONS.findIndex(
        section =>
          section.id ===
          exploration.activeCategory,
      ),
    );

  const activeSection =
    TRIGGER_EDUCATION_SECTIONS[
      activeSectionIndex
    ];

  const previousSection =
    TRIGGER_EDUCATION_SECTIONS[
      activeSectionIndex - 1
    ];

  const nextSection =
    TRIGGER_EDUCATION_SECTIONS[
      activeSectionIndex + 1
    ];

  if (
    showSummary &&
    exploration.completedAt
  ) {
    return (
      <TriggerExplorationSummary
        summary={summary}
        completedAt={
          exploration.completedAt
        }
        onReturnToQuestions={() =>
          setShowSummary(false)
        }
      />
    );
  }

  if (!activeSection) {
    return null;
  }

  const activeAnsweredCount =
    activeSection.questions.filter(
      question =>
        exploration.responses[
          question.id
        ],
    ).length;

  const handleComplete = () => {
    if (!isComplete) {
      return;
    }

    completeExploration();

    setShowSummary(true);
  };

  return (
    <section
      className={
        styles.phaseFlow
      }
    >
      <header
        className={
          styles.symptomSelector
        }
      >
        <div>
          <p>
            Aprender y observar
          </p>

          <h1>
            Posibles desencadenantes
          </h1>

          <p>
            Respondé según lo que hayas
            observado hasta ahora. No
            hace falta completar todo de
            una vez.
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
            {isComplete
              ? '✓'
              : '◷'}
          </span>

          <p>
            {answeredCount} de{' '}
            {totalQuestions}{' '}
            preguntas respondidas
          </p>
        </div>
      </header>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="trigger-principles-title"
      >
        <div>
          <h2 id="trigger-principles-title">
            Cómo usar esta guía
          </h2>

          <p>
            El objetivo es formular
            hipótesis y reconocer
            patrones, no buscar una
            causa única para cada
            crisis.
          </p>
        </div>

        <ul>
          {TRIGGER_EDUCATION_PRINCIPLES.map(
            principle => (
              <li key={principle}>
                {principle}
              </li>
            ),
          )}
        </ul>
      </section>

      <nav
        className={
          styles.compactCategories
        }
        aria-label="Categorías de posibles desencadenantes"
      >
        {TRIGGER_EDUCATION_SECTIONS.map(
          section => {
            const sectionAnswered =
              section.questions.filter(
                question =>
                  exploration.responses[
                    question.id
                  ],
              ).length;

            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={
                  section.id ===
                  activeSection.id
                }
                onClick={() =>
                  setActiveCategory(
                    section.id,
                  )
                }
              >
                {section.icon}{' '}
                {section.shortTitle}
                {' · '}
                {sectionAnswered}/
                {
                  section.questions
                    .length
                }
              </button>
            );
          },
        )}
      </nav>

      <section
        aria-labelledby={`trigger-section-${activeSection.id}`}
      >
        <header
          className={
            styles.symptomSelector
          }
        >
          <div>
            <p>
              Categoría{' '}
              {activeSectionIndex + 1}{' '}
              de{' '}
              {
                TRIGGER_EDUCATION_SECTIONS.length
              }
            </p>

            <h2
              id={`trigger-section-${activeSection.id}`}
            >
              {activeSection.icon}{' '}
              {activeSection.title}
            </h2>

            <p>
              {
                activeSection.introduction
              }
            </p>
          </div>

          <div
            className={
              styles.selectionSummary
            }
          >
            <p>
              {activeAnsweredCount} de{' '}
              {
                activeSection.questions
                  .length
              } respondidas
            </p>
          </div>
        </header>

        {activeSection.questions.map(
          question => (
            <TriggerQuestionCard
              key={question.id}
              question={question}
              response={
                exploration.responses[
                  question.id
                ]
              }
              onAnswer={answer =>
                updateResponse(
                  question.id,
                  answer,
                )
              }
              onNotesChange={notes =>
                updateResponseNotes(
                  question.id,
                  notes,
                )
              }
            />
          ),
        )}
      </section>

      <footer
        className={
          styles.selectionSummary
        }
      >
        <button
          type="button"
          disabled={
            !previousSection
          }
          onClick={() => {
            if (
              previousSection
            ) {
              setActiveCategory(
                previousSection.id,
              );
            }
          }}
        >
          Categoría anterior
        </button>

        {nextSection ? (
          <button
            type="button"
            onClick={() =>
              setActiveCategory(
                nextSection.id,
              )
            }
          >
            Siguiente categoría
          </button>
        ) : (
          <button
            type="button"
            disabled={!isComplete}
            onClick={
              handleComplete
            }
          >
            Ver mi resumen
          </button>
        )}
      </footer>

      {!isComplete &&
        !nextSection && (
          <p>
            Para ver el resumen,
            respondé todas las
            preguntas. Siempre podés
            elegir “Todavía no lo sé”.
          </p>
        )}
    </section>
  );
}