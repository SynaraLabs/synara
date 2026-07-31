import type {
  RankedPattern,
} from '../utils/patternRankingCalculations';

import styles from '../dashboard.module.css';

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
  const hasPatterns =
    patterns.length > 0;

  return (
    <section
      className={
        styles.section
      }
      aria-labelledby={id}
    >
      <div
        className={
          styles.sectionHeader
        }
      >
        <div>
          <p
            className={
              styles.sectionEyebrow
            }
          >
            {eyebrow}
          </p>

          <h2 id={id}>
            {title}
          </h2>
        </div>

        <span
          className={
            styles.sectionHint
          }
        >
          {hint}
        </span>
      </div>

      {hasPatterns ? (
        <div
          className={
            styles.episodesList
          }
        >
          {patterns.map(
            pattern => (
              <article
                key={
                  pattern.value
                }
                className={
                  styles.episodeCard
                }
              >
                <div
                  className={
                    styles.episodeMain
                  }
                >
                  <span
                    className={
                      styles.episodeIcon
                    }
                    aria-hidden="true"
                  >
                    {icon}
                  </span>

                  <div>
                    <h3>
                      {pattern.label}
                    </h3>

                    <div
                      className={
                        styles.episodeDetails
                      }
                    >
                      <span>
                        Registrado en{' '}
                        <strong>
                          {
                            pattern.count
                          }
                        </strong>{' '}
                        {pattern.count ===
                        1
                          ? 'crisis'
                          : 'crisis'}
                      </span>

                      <span>
                        De{' '}
                        <strong>
                          {
                            totalEpisodes
                          }
                        </strong>{' '}
                        crisis analizadas
                      </span>
                    </div>
                  </div>
                </div>

                <strong
                  className={
                    styles.episodeDate
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
      ) : (
        <div
          className={
            styles.emptyState
          }
        >
          <span
            className={
              styles.emptyStateIcon
            }
            aria-hidden="true"
          >
            {icon}
          </span>

          <div>
            <h3>
              {emptyTitle}
            </h3>

            <p>
              {emptyDescription}
            </p>
          </div>
        </div>
      )}

      {hasPatterns && footer && (
        <p
          className={
            styles.sectionHint
          }
        >
          {footer}
        </p>
      )}
    </section>
  );
}