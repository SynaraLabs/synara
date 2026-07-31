import {
  useState,
} from 'react';

import type {
  RankedPattern,
} from '../utils/patternRankingCalculations';

import styles from './PatternRankingList.module.css';

interface Props {
  id: string;

  eyebrow: string;

  title: string;

  hint: string;

  icon: string;

  patterns: RankedPattern[];

  totalEpisodes: number;

  emptyTitle: string;

  emptyDescription: string;

  footer?: string;
}

const INITIAL_VISIBLE_PATTERNS =
  3;

export function PatternRankingList({
  id,
  eyebrow,
  title,
  hint,
  icon,
  patterns,
  totalEpisodes,
  emptyTitle,
  emptyDescription,
  footer,
}: Props) {
  const [
    showAll,
    setShowAll,
  ] = useState(false);

  const hasPatterns =
    patterns.length > 0;

  const canExpand =
    patterns.length >
    INITIAL_VISIBLE_PATTERNS;

  const visiblePatterns =
    showAll
      ? patterns
      : patterns.slice(
          0,
          INITIAL_VISIBLE_PATTERNS,
        );

  const leadingPattern =
    patterns[0];

  const preview =
    leadingPattern
      ? `${leadingPattern.label} · ${leadingPattern.percentage}%`
      : 'Aún sin datos';

  return (
    <section
      className={
        styles.section
      }
    >
      <details
        className={
          styles.panel
        }
      >
        <summary
          className={
            styles.summary
          }
        >
          <span
            className={
              styles.heading
            }
          >
            <span
              className={
                styles.icon
              }
              aria-hidden="true"
            >
              {icon}
            </span>

            <span>
              <span
                className={
                  styles.eyebrow
                }
              >
                {eyebrow}
              </span>

              <span
                id={id}
                className={
                  styles.title
                }
              >
                {title}
              </span>
            </span>
          </span>

          <span
            className={
              styles.preview
            }
          >
            <span
              className={
                styles.previewText
              }
            >
              {preview}
            </span>

            <span
              className={
                styles.chevron
              }
              aria-hidden="true"
            >
              ⌄
            </span>
          </span>
        </summary>

        <div
          className={
            styles.content
          }
          aria-labelledby={id}
        >
          <p
            className={
              styles.hint
            }
          >
            {hint}
          </p>

          {hasPatterns ? (
            <>
              <div
                className={
                  styles.list
                }
              >
                {visiblePatterns.map(
                  pattern => (
                    <article
                      key={
                        pattern.value
                      }
                      className={
                        styles.row
                      }
                    >
                      <div
                        className={
                          styles.rowMain
                        }
                      >
                        <strong
                          className={
                            styles.rowTitle
                          }
                        >
                          {
                            pattern.label
                          }
                        </strong>

                        <span
                          className={
                            styles.rowMeta
                          }
                        >
                          En{' '}
                          {
                            pattern.count
                          }{' '}
                          de{' '}
                          {
                            totalEpisodes
                          }{' '}
                          crisis analizadas
                        </span>
                      </div>

                      <strong
                        className={
                          styles.percentage
                        }
                        aria-label={`${pattern.percentage} por ciento de las crisis`}
                      >
                        {
                          pattern.percentage
                        }
                        %
                      </strong>
                    </article>
                  ),
                )}
              </div>

              {canExpand && (
                <button
                  type="button"
                  className={
                    styles.toggle
                  }
                  aria-expanded={
                    showAll
                  }
                  onClick={() =>
                    setShowAll(
                      current =>
                        !current,
                    )
                  }
                >
                  {showAll
                    ? 'Mostrar menos'
                    : `Ver todos (${patterns.length})`}
                </button>
              )}

              {footer && (
                <p
                  className={
                    styles.footer
                  }
                >
                  {footer}
                </p>
              )}
            </>
          ) : (
            <div>
              <strong>
                {emptyTitle}
              </strong>

              <p
                className={
                  styles.empty
                }
              >
                {
                  emptyDescription
                }
              </p>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}