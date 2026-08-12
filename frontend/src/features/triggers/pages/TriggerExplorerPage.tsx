import {
  useMemo,
  useState,
} from 'react';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

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
  TriggerHistoryComparison,
} from '../components/TriggerHistoryComparison';

import {
  TriggerQuestionCard,
} from '../components/TriggerQuestionCard';

import {
  createTriggerExplorationSummary,
} from '../utils/triggerExplorationSummary';

import {
  compareTriggerExplorationWithHistory,
} from '../utils/triggerHistoryComparison';

import styles from './TriggerExplorerPage.module.css';

type TriggerExplorerView =
  | 'questions'
  | 'summary'
  | 'comparison';

interface TriggerExplorerViewDefinition {
  id: TriggerExplorerView;
  label: string;
}

const EXPLORER_VIEWS:
  TriggerExplorerViewDefinition[] = [
  {
    id: 'questions',
    label: 'Explorar',
  },
  {
    id: 'summary',
    label: 'Resumen',
  },
  {
    id: 'comparison',
    label: 'Comparar',
  },
];

export function TriggerExplorerPage() {
  const history = useMigraineStore(
    state => state.history,
  );

  const exploration =
    useTriggerExplorationStore(
      state => state.exploration,
    );

  const setActiveCategory =
    useTriggerExplorationStore(
      state => state.setActiveCategory,
    );

  const updateResponse =
    useTriggerExplorationStore(
      state => state.updateResponse,
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

  const [activeView, setActiveView] =
    useState<TriggerExplorerView>(
      exploration.completedAt
        ? 'summary'
        : 'questions',
    );

  const summary = useMemo(
    () =>
      createTriggerExplorationSummary(
        exploration.responses,
      ),
    [exploration.responses],
  );

  const historyComparison = useMemo(
    () =>
      compareTriggerExplorationWithHistory(
        exploration.responses,
        history,
      ),
    [exploration.responses, history],
  );

  const answeredCount =
    summary.answeredCount;
  const totalQuestions =
    summary.totalCount;

  const isComplete =
    answeredCount === totalQuestions;

  const hasCompletedExploration =
    Boolean(exploration.completedAt);

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100,
        )
      : 0;

  const activeSectionIndex = Math.max(
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

  const activeSectionAnswered =
    activeSection
      ? activeSection.questions.filter(
          question =>
            exploration.responses[
              question.id
            ],
        ).length
      : 0;

  const handleComplete = () => {
    if (!isComplete) {
      return;
    }

    completeExploration();
    setActiveView('summary');
  };

  const handleCategoryChange = (
    categoryId:
      (typeof TRIGGER_EDUCATION_SECTIONS)[number]['id'],
  ) => {
    setActiveCategory(categoryId);

    window.requestAnimationFrame(() => {
      document
        .getElementById(
          'trigger-active-section',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>
          Observación personal
        </p>

        <h1>Posibles desencadenantes</h1>

        <p className={styles.introduction}>
          Explorá qué factores podrían
          relacionarse con tus episodios.
          No hace falta completar todo de
          una vez.
        </p>
      </header>

      <nav
        className={styles.viewNavigation}
        aria-label="Secciones de posibles desencadenantes"
      >
        {EXPLORER_VIEWS.map(view => {
          const isDisabled =
            view.id !== 'questions' &&
            !hasCompletedExploration;

          return (
            <button
              key={view.id}
              type="button"
              disabled={isDisabled}
              aria-current={
                activeView === view.id
                  ? 'page'
                  : undefined
              }
              onClick={() =>
                setActiveView(view.id)
              }
            >
              {view.label}
            </button>
          );
        })}
      </nav>

      {activeView === 'summary' &&
        exploration.completedAt && (
          <div className={styles.resultView}>
            <TriggerExplorationSummary
              summary={summary}
              completedAt={
                exploration.completedAt
              }
              onReturnToQuestions={() =>
                setActiveView('questions')
              }
            />
          </div>
        )}

      {activeView === 'comparison' &&
        hasCompletedExploration && (
          <div className={styles.resultView}>
            <TriggerHistoryComparison
              comparison={
                historyComparison
              }
            />
          </div>
        )}

      {activeView === 'questions' &&
        activeSection && (
          <div className={styles.guide}>
            <section
              className={styles.progressPanel}
              aria-label={`${answeredCount} de ${totalQuestions} preguntas respondidas`}
            >
              <div
                className={
                  styles.progressHeading
                }
              >
                <div>
                  <strong>
                    Tu exploración
                  </strong>

                  <span>
                    {answeredCount} de{' '}
                    {totalQuestions}{' '}
                    respondidas
                  </span>
                </div>

                <b>{progress}%</b>
              </div>

              <div
                className={styles.progressTrack}
                aria-hidden="true"
              >
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </section>

            <details
              className={styles.guidance}
            >
              <summary>
                Cómo usar esta guía
              </summary>

              <p>
                Buscamos reconocer patrones
                y formular hipótesis, no una
                causa única para cada crisis.
              </p>

              <ul>
                {TRIGGER_EDUCATION_PRINCIPLES.map(
                  principle => (
                    <li key={principle}>
                      {principle}
                    </li>
                  ),
                )}
              </ul>
            </details>

            <nav
              className={
                styles.categoryNavigation
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
                      aria-current={
                        section.id ===
                        activeSection.id
                          ? 'step'
                          : undefined
                      }
                      onClick={() =>
                        handleCategoryChange(
                          section.id,
                        )
                      }
                    >
                      <span>
                        {section.shortTitle}
                      </span>

                      <small>
                        {sectionAnswered}/
                        {
                          section.questions
                            .length
                        }
                      </small>
                    </button>
                  );
                },
              )}
            </nav>

            <section
              id="trigger-active-section"
              className={styles.activeSection}
              aria-labelledby={`trigger-section-${activeSection.id}`}
            >
              <header
                className={styles.sectionHeader}
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
                    {activeSection.title}
                  </h2>

                  <span>
                    {
                      activeSection.introduction
                    }
                  </span>
                </div>

                <strong>
                  {activeSectionAnswered}/
                  {activeSection.questions.length}
                </strong>
              </header>

              <div
                className={styles.questions}
              >
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
              </div>
            </section>

            <footer
              className={styles.actions}
            >
              <button
                type="button"
                className={styles.previousButton}
                disabled={!previousSection}
                onClick={() => {
                  if (previousSection) {
                    handleCategoryChange(
                      previousSection.id,
                    );
                  }
                }}
              >
                Anterior
              </button>

              {nextSection ? (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    handleCategoryChange(
                      nextSection.id,
                    )
                  }
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.nextButton}
                  disabled={!isComplete}
                  onClick={handleComplete}
                >
                  Ver mi resumen
                </button>
              )}
            </footer>

            {!isComplete &&
              !nextSection && (
                <p
                  className={
                    styles.completionHelp
                  }
                >
                  Para ver el resumen,
                  respondé todas las
                  preguntas. “Todavía no lo
                  sé” también es una respuesta
                  válida.
                </p>
              )}
          </div>
        )}
    </section>
  );
}