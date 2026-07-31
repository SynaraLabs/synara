import type {
  TimePrecision,
} from '../../migraine/types/migraine.types';

export const parseValidDate = (
  value?: string,
): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? undefined
    : date;
};

export const isValidDate = (
  value?: string,
): value is string => {
  return Boolean(
    parseValidDate(value),
  );
};

export const formatCreatedDate = (
  value?: string,
): string => {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Fecha sin registrar';
  }

  return date.toLocaleDateString(
    'es-AR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
};

export const formatDateTime = (
  value?: string,
  precision?: TimePrecision,
): string => {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Sin registrar';
  }

  if (
    precision === 'dateOnly' ||
    precision === 'unknown'
  ) {
    return date.toLocaleDateString(
      'es-AR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  }

  return date.toLocaleString(
    'es-AR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

export const formatTime = (
  value?: string,
): string => {
  const date =
    parseValidDate(value);

  if (!date) {
    return 'Hora sin registrar';
  }

  return date.toLocaleTimeString(
    'es-AR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

export const getTimestamp = (
  value?: string,
): number => {
  return (
    parseValidDate(
      value,
    )?.getTime() ??
    Number.MAX_SAFE_INTEGER
  );
};

export const getLabels = <
  Value extends string,
>(
  values:
    | readonly Value[]
    | undefined,
  labels: Readonly<
    Partial<
      Record<Value, string>
    >
  >,
): string[] => {
  return (values ?? []).map(
    value =>
      labels[value] ?? value,
  );
};