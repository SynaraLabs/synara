import {
  useState,
  type ReactNode,
} from 'react';

import styles from './ClinicalPhasePanel.module.css';

export type ClinicalPhaseTone =
  | 'premonitory'
  | 'aura'
  | 'crisis'
  | 'recovery'
  | 'trigger'
  | 'treatment';

interface Props {
  id: string;

  eyebrow?: string;

  title: string;

  description: string;

  icon: string;

  status?: string;

  tone?: ClinicalPhaseTone;

  defaultOpen?: boolean;

  isOpen?: boolean;

  onOpenChange?: (
    isOpen: boolean,
  ) => void;

  children: ReactNode;
}

export function ClinicalPhasePanel({
  id,
  eyebrow,
  title,
  description,
  icon,
  status,
  tone,
  defaultOpen = false,
  isOpen,
  onOpenChange,
  children,
}: Props) {
  const [
    internalIsOpen,
    setInternalIsOpen,
  ] = useState(defaultOpen);

  const resolvedIsOpen =
    isOpen ?? internalIsOpen;

  const handleToggle = (
    nextIsOpen: boolean,
  ) => {
    if (isOpen === undefined) {
      setInternalIsOpen(
        nextIsOpen,
      );
    }

    onOpenChange?.(
      nextIsOpen,
    );
  };

  return (
    <details
      className={
        styles.panel
      }
      data-tone={tone}
      open={resolvedIsOpen}
      onToggle={event =>
        handleToggle(
          event.currentTarget.open,
        )
      }
    >
      <summary
        className={
          styles.summary
        }
      >
        <span
          className={
            styles.main
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
            {eyebrow && (
              <span
                className={
                  styles.eyebrow
                }
              >
                {eyebrow}
              </span>
            )}

            <span
              id={id}
              className={
                styles.title
              }
            >
              {title}
            </span>

            <span
              className={
                styles.description
              }
            >
              {description}
            </span>
          </span>
        </span>

        <span
          className={
            styles.side
          }
        >
          {status && (
            <span
              className={
                styles.status
              }
            >
              {status}
            </span>
          )}

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
        {children}
      </div>
    </details>
  );
}