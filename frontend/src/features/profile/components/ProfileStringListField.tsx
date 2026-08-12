import {
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import styles from './ProfileStringListField.module.css';

interface Props {
  label: string;

  value?: string[];

  placeholder?: string;

  rows?: number;

  onChange: (
    values: string[],
  ) => void;
}

const formatValues = (
  values?: string[],
): string => {
  return (
    values ?? []
  ).join('\n');
};

const parseValues = (
  value: string,
): string[] => {
  return Array.from(
    new Set(
      value
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean),
    ),
  );
};

export function ProfileStringListField({
  label,
  value,
  placeholder,
  rows = 4,
  onChange,
}: Props) {
  const fieldId = useId();

  const [draft, setDraft] =
    useState(
      formatValues(value),
    );

  useEffect(() => {
    setDraft(
      formatValues(value),
    );
  }, [value]);

  const draftCount =
    useMemo(
      () =>
        parseValues(draft)
          .length,
      [draft],
    );

  const saveDraft = () => {
    const normalizedValues =
      parseValues(draft);

    setDraft(
      formatValues(
        normalizedValues,
      ),
    );

    onChange(
      normalizedValues,
    );
  };

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <label htmlFor={fieldId}>
          {label}
        </label>

        <span aria-live="polite">
          {draftCount === 0
            ? 'Sin datos'
            : draftCount === 1
              ? '1 registro'
              : `${draftCount} registros`}
        </span>
      </div>

      <textarea
        id={fieldId}
        value={draft}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={`${fieldId}-help`}
        onChange={event =>
          setDraft(
            event.target.value,
          )
        }
        onBlur={saveDraft}
      />

      <small id={`${fieldId}-help`}>
        Escribí un dato por línea. Se guarda automáticamente
        al salir del campo.
      </small>
    </div>
  );
}