import {
  useEffect,
  useState,
} from 'react';

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
        .map(
          item =>
            item.trim(),
        )
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
  const [
    draft,
    setDraft,
  ] = useState(
    formatValues(value),
  );

  useEffect(() => {
    setDraft(
      formatValues(value),
    );
  }, [
    value,
  ]);

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
    <label>
      {label}

      <textarea
        value={draft}
        rows={rows}
        placeholder={placeholder}
        onChange={event =>
          setDraft(
            event.target.value,
          )
        }
        onBlur={saveDraft}
      />
    </label>
  );
}