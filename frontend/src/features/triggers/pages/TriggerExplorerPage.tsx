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

  const [
    activeView,
    setActiveView,
  ] = useState<TriggerExplorerView>(
    exploration.completedAt
      ? 'summary'
      : 'questions',
  );

  const [
    activeQuestionIndex,
    setActiveQuestionIndex,
  ] = useState(0);

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

  const safeQuestionIndex =
    activeSection
      ? Math.min(
          activeQuestionIndex,
          Math.max(
            0,
            activeSection.questions.length -
              1,
          ),
        )
      : 0;

  const activeQuestion =
    activeSection?.questions[
      safeQuestionIndex
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

  const scrollToQuestion = () => {
    window.requestAnimationFrame(() => {
      document
        .getElementById(
          'trigger-question-focus',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  };

  const getFirstPendingQuestionIndex = (
    section:
      (typeof TRIGGER_EDUCATION_SECTIONS)[number],
  ) => {
    const pendingIndex =
      section.questions.findIndex(
        question =>
          !exploration.responses[
            question.id
          ],
      );

    return pendingIndex >= 0
      ? pendingIndex
      : 0;
  };

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
    const targetSection =
      TRIGGER_EDUCATION_SECTIONS.find(
        section =>
          section.id === categoryId,
      );

    setActiveCategory(categoryId);

    if (targetSection) {
      setActiveQuestionIndex(
        getFirstPendingQuestionIndex(
          targetSection,
        ),
      );
    } else {
      setActiveQuestionIndex(0);
    }

    scrollToQuestion();
  };

  const handleCategorySelect = (
    value: string,
  ) => {
    const targetSection =
      TRIGGER_EDUCATION_SECTIONS.find(
        section =>
          section.id === value,
      );

    if (!targetSection) {
      return;
    }

    handleCategoryChange(
      targetSection.id,
    );
  };

  const handlePrevious = () => {
    if (safeQuestionIndex > 0) {
      setActiveQuestionIndex(
        safeQuestionIndex - 1,
      );

      scrollToQuestion();
      return;
    }

    if (!previousSection) {
      return;
    }

    setActiveCategory(
      previousSection.id,
    );

    setActiveQuestionIndex(
      Math.max(
        0,
        previousSection.questions.length -
          1,
      ),
    );

    scrollToQuestion();
  };

  const handleNext = () => {
    if (
      activeSection &&
      safeQuestionIndex <
        activeSection.questions.length - 1
    ) {
      setActiveQuestionIndex(
        safeQuestionIndex + 1,
      );

      scrollToQuestion();
      return;
    }

    if (nextSection) {
      handleCategoryChange(
        nextSection.id,
      );
      return;
    }

    handleComplete();
  };

  const hasPreviousQuestion =
    safeQuestionIndex > 0 ||
    Boolean(previousSection);

  const isFinalQuestion =
    !nextSection &&
    activeSection &&
    safeQuestionIndex ===
      activeSection.questions.length - 1;

  return (
    <section
      className={styles.page}
    >
      <header
        className={styles.pageHeader}
      >
        <div>
          <p
            className={styles.eyebrow}
          >
            Observación personal
          </p>

          <h1>
            Posibles desencadenantes
          </h1>
        </div>

        <p
          className={
            styles.introduction
          }
        >
          Explorá factores que podrían
          relacionarse con tus episodios,
          sin asumir una causa única.
        </p>
      </header>

      {hasCompletedExploration && (
        <nav
          className={
            styles.viewNavigation
          }
          aria-label="Secciones de posibles desencadenantes"
        >
          {EXPLORER_VIEWS.map(
            view => (
              <button
                key={view.id}
                type="button"
                aria-current={
                  activeView ===
                  view.id
                    ? 'page'
                    : undefined
                }
                onClick={() =>
                  setActiveView(
                    view.id,
                  )
                }
              >
                {view.label}
              </button>
            ),
          )}
        </nav>
      )}

      {activeView === 'summary' &&
        exploration.completedAt && (
          <div
            className={
              styles.resultView
            }
          >
            <TriggerExplorationSummary
              summary={summary}
              completedAt={
                exploration.completedAt
              }
              onReturnToQuestions={() =>
                setActiveView(
                  'questions',
                )
              }
            />
          </div>
        )}

      {activeView === 'comparison' &&
        hasCompletedExploration && (
          <div
            className={
              styles.resultView
            }
          >
            <TriggerHistoryComparison
              comparison={
                historyComparison
              }
            />
          </div>
        )}

      {activeView === 'questions' &&
        activeSection &&
        activeQuestion && (
          <div
            className={styles.guide}
          >
            <section
              className={
                styles.progressPanel
              }
              aria-label={`${answeredCount} de ${totalQuestions} preguntas respondidas`}
            >
              <div
                className={
                  styles.progressCopy
                }
              >
                <span>
                  {answeredCount} de{' '}
                  {totalQuestions}{' '}
                  explorados
                </span>

                <strong>
                  {progress}%
                </strong>
              </div>

              <div
                className={
                  styles.progressTrack
                }
                aria-hidden="true"
              >
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </section>

            <div
              className={
                styles.categoryControl
              }
            >
              <div>
                <span>
                  Categoría{' '}
                  {activeSectionIndex +
                    1}{' '}
                  de{' '}
                  {
                    TRIGGER_EDUCATION_SECTIONS.length
                  }
                </span>

                <strong>
                  {
                    activeSection.shortTitle
                  }
                </strong>
              </div>

              <label>
                <span className={styles.srOnly}>
                  Cambiar categoría
                </span>

                <select
                  value={
                    activeSection.id
                  }
                  onChange={event =>
                    handleCategorySelect(
                      event.target.value,
                    )
                  }
                  aria-label="Cambiar categoría"
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
                        <option
                          key={section.id}
                          value={section.id}
                        >
                          {
                            section.shortTitle
                          }{' '}
                          (
                          {
                            sectionAnswered
                          }
                          /
                          {
                            section.questions
                              .length
                          }
                          )
                        </option>
                      );
                    },
                  )}
                </select>
              </label>
            </div>

            <section
              id="trigger-question-focus"
              className={
                styles.activeSection
              }
              aria-labelledby={`trigger-section-${activeSection.id}`}
            >
              <header
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <p>
                    Pregunta{' '}
                    {safeQuestionIndex +
                      1}{' '}
                    de{' '}
                    {
                      activeSection.questions
                        .length
                    }
                  </p>

                  <h2
                    id={`trigger-section-${activeSection.id}`}
                  >
                    {
                      activeSection.title
                    }
                  </h2>
                </div>

                <strong>
                  {activeSectionAnswered}/
                  {
                    activeSection.questions
                      .length
                  }
                </strong>
              </header>

              <div
                className={
                  styles.questionStage
                }
              >
                <TriggerQuestionCard
                  key={activeQuestion.id}
                  question={
                    activeQuestion
                  }
                  response={
                    exploration.responses[
                      activeQuestion.id
                    ]
                  }
                  onAnswer={answer =>
                    updateResponse(
                      activeQuestion.id,
                      answer,
                    )
                  }
                  onNotesChange={notes =>
                    updateResponseNotes(
                      activeQuestion.id,
                      notes,
                    )
                  }
                />
              </div>

              <details
                className={
                  styles.guidance
                }
              >
                <summary>
                  ¿Por qué te preguntamos
                  esto?
                </summary>

                <p>
                  {
                    activeSection.introduction
                  }
                </p>

                <p>
                  Buscamos reconocer patrones
                  y formular hipótesis, no una
                  causa única para cada crisis.
                </p>

                <ul>
                  {TRIGGER_EDUCATION_PRINCIPLES.map(
                    principle => (
                      <li
                        key={
                          principle
                        }
                      >
                        {
                          principle
                        }
                      </li>
                    ),
                  )}
                </ul>
              </details>
            </section>

            <footer
              className={styles.actions}
            >
              <button
                type="button"
                className={
                  styles.previousButton
                }
                disabled={
                  !hasPreviousQuestion
                }
                onClick={
                  handlePrevious
                }
              >
                Anterior
              </button>

              <button
                type="button"
                className={
                  styles.nextButton
                }
                disabled={
                  Boolean(
                    isFinalQuestion &&
                      !isComplete,
                  )
                }
                onClick={
                  handleNext
                }
              >
                {isFinalQuestion
                  ? 'Ver mi resumen'
                  : 'Siguiente'}
              </button>
            </footer>

            {isFinalQuestion &&
              !isComplete && (
                <p
                  className={
                    styles.completionHelp
                  }
                >
                  Todavía quedan preguntas
                  sin responder. Podés
                  cambiar de categoría para
                  completarlas. “Todavía no
                  lo sé” también es una
                  respuesta válida.
                </p>
              )}
          </div>
        )}
    </section>
  );
}