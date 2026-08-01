import {
  useState,
  type ReactNode,
} from 'react';

import styles from './ClinicalPhasePanel.module.css';

interface Props {
  id: string;

  eyebrow: string;

  title: string;

  description: string;

  icon: string;

  status?: string;

  defaultOpen?: boolean;

  children: ReactNode;
}

export function ClinicalPhasePanel({
  id,
  eyebrow,
  title,
  description,
  icon,
  status,
  defaultOpen = false,
  children,
}: Props) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(
    defaultOpen,
  );

  return (
    <details
      className={
        styles.panel
      }
      open={isOpen}
      onToggle={event =>
        setIsOpen(
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