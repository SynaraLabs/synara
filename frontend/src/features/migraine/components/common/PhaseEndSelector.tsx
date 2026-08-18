import {
  useMemo,
  useState,
} from 'react';

import type {
  RecordMode,
  TimePrecision,
} from '../../types/migraine.types';

import styles from './PhaseEndSelector.module.css';

export interface PhaseEndSelection {
  endTime: string;
  precision: TimePrecision;
  recordMode: RecordMode;
}

interface PhaseEndSelectorProps {
  title?: string;
  startTime?: string;

  onConfirm: (
    selection: PhaseEndSelection,
  ) => void;

  onContinue?: () => void;
}

type EndOption =
  | 'now'
  | 'custom'
  | 'dateOnly'
  | null;

function padNumber(
  value: number,
): string {
  return String(value).padStart(
    2,
    '0',
  );
}

function formatLocalDate(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = padNumber(
    date.getMonth() + 1,
  );

  const day = padNumber(
    date.getDate(),
  );

  return `${year}-${month}-${day}`;
}

function formatLocalDateTimeInput(
  date: Date,
): string {
  const hours = padNumber(
    date.getHours(),
  );

  const minutes = padNumber(
    date.getMinutes(),
  );

  return `${formatLocalDate(
    date,
  )}T${hours}:${minutes}`;
}

function parseStoredDate(
  value?: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function parseLocalDateTime(
  value: string,
): Date | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
  ] = match;

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(
    minuteValue,
  );

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  );

  const isValid =
    !Number.isNaN(
      date.getTime(),
    ) &&
    date.getFullYear() === year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;

  if (!isValid) {
    return undefined;
  }

  return date;
}

function parseLocalDate(
  value: string,
): Date | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
  ] = match;

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  const now = new Date();

  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;

  /*
   * Si la fecha seleccionada es hoy,
   * usamos la hora actual para evitar
   * crear accidentalmente una hora
   * futura.
   *
   * Para días anteriores usamos el
   * mediodía como referencia neutral.
   */
  const date = isToday
    ? now
    : new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0,
      );

  const isValid =
    !Number.isNaN(
      date.getTime(),
    ) &&
    date.getFullYear() === year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() === day;

  if (!isValid) {
    return undefined;
  }

  return date;
}

function formatDateTime(
  value?: string,
  precision:
    TimePrecision = 'exact',
): string {
  const date =
    parseStoredDate(value);

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
}

function formatDuration(
  startValue?: string,
  endValue?: string,
  estimated = false,
): string {
  const start =
    parseStoredDate(startValue);

  const end =
    parseStoredDate(endValue);

  if (!start || !end) {
    return 'No se puede calcular';
  }

  const difference =
    end.getTime() -
    start.getTime();

  if (difference < 0) {
    return 'La finalización no puede ser anterior al inicio';
  }

  const totalMinutes =
    Math.floor(
      difference / 60_000,
    );

  const days = Math.floor(
    totalMinutes / 1_440,
  );

  const hours = Math.floor(
    (totalMinutes % 1_440) /
      60,
  );

  const minutes =
    totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(
      `${days} ${
        days === 1
          ? 'día'
          : 'días'
      }`,
    );
  }

  if (hours > 0) {
    parts.push(`${hours} h`);
  }

  if (
    minutes > 0 ||
    parts.length === 0
  ) {
    parts.push(
      `${minutes} min`,
    );
  }

  const duration =
    parts.join(' ');

  return estimated
    ? `${duration} aproximadamente`
    : duration;
}

export function PhaseEndSelector({
  title = '¿Cuándo terminó?',
  startTime,
  onConfirm,
  onContinue,
}: PhaseEndSelectorProps) {
  const [
    option,
    setOption,
  ] = useState<EndOption>(null);

  const [
    nowValue,
    setNowValue,
  ] = useState('');

  const [
    customDateTime,
    setCustomDateTime,
  ] = useState('');

  const [
    dateOnly,
    setDateOnly,
  ] = useState('');

  const maximumDate =
    formatLocalDate(new Date());

  const maximumDateTime =
    formatLocalDateTimeInput(
      new Date(),
    );

  const selection =
    useMemo<
      PhaseEndSelection | undefined
    >(() => {
      if (
        option === 'now' &&
        nowValue
      ) {
        return {
          endTime: nowValue,
          precision: 'exact',
          recordMode: 'realTime',
        };
      }

      if (
        option === 'custom'
      ) {
        const date =
          parseLocalDateTime(
            customDateTime,
          );

        if (!date) {
          return undefined;
        }

        return {
          endTime:
            date.toISOString(),

          precision: 'exact',

          recordMode:
            'retrospective',
        };
      }

      if (
        option === 'dateOnly'
      ) {
        const date =
          parseLocalDate(
            dateOnly,
          );

        if (!date) {
          return undefined;
        }

        return {
          endTime:
            date.toISOString(),

          precision: 'dateOnly',

          recordMode:
            'retrospective',
        };
      }

      return undefined;
    }, [
      option,
      nowValue,
      customDateTime,
      dateOnly,
    ]);

  const startDate =
    parseStoredDate(startTime);

  const endDate =
    parseStoredDate(
      selection?.endTime,
    );

  const endIsBeforeStart =
    Boolean(
      startDate &&
        endDate &&
        endDate.getTime() <
          startDate.getTime(),
    );

  const endIsFuture =
    Boolean(
      endDate &&
        endDate.getTime() >
          Date.now(),
    );

  const canConfirm =
    Boolean(selection) &&
    !endIsBeforeStart &&
    !endIsFuture;

  const reset = () => {
    setOption(null);
    setNowValue('');
    setCustomDateTime('');
    setDateOnly('');
  };

  const handleNow = () => {
    setNowValue(
      new Date().toISOString(),
    );

    setOption('now');
  };

  const handleContinue = () => {
    reset();
    onContinue?.();
  };

  const handleConfirm = () => {
    if (
      !selection ||
      !canConfirm
    ) {
      return;
    }

    onConfirm(selection);

    reset();
  };

  return (
    <section
      className={styles.root}
      aria-labelledby="phase-end-title"
    >
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          Finalización de fase
        </p>

        <h3 id="phase-end-title">
          {title}
        </h3>

        <p>
          Elegí la opción que mejor
          describa cuándo terminó.
        </p>
      </div>

      <div
        className={styles.optionGrid}
        role="group"
        aria-label="Momento de finalización"
      >
        <button
          type="button"
          className={styles.optionButton}
          aria-pressed={
            option === 'now'
          }
          onClick={handleNow}
        >
          <strong>
            Terminó ahora
          </strong>

          <span>
            Usar este momento.
          </span>
        </button>

        <button
          type="button"
          className={styles.optionButton}
          aria-pressed={
            option === 'custom'
          }
          onClick={() =>
            setOption('custom')
          }
        >
          <strong>
            Terminó en otro momento
          </strong>

          <span>
            Elegir fecha y hora.
          </span>
        </button>

        <button
          type="button"
          className={styles.optionButton}
          aria-pressed={
            option === 'dateOnly'
          }
          onClick={() =>
            setOption('dateOnly')
          }
        >
          <strong>
            No recuerdo la hora exacta
          </strong>

          <span>
            Registrar solo la fecha.
          </span>
        </button>

        <button
          type="button"
          className={
            styles.continueButton
          }
          onClick={handleContinue}
        >
          <strong>
            Todavía continúa
          </strong>

          <span>
            Mantener la fase abierta.
          </span>
        </button>
      </div>

      {option === 'custom' && (
        <label
          className={styles.field}
        >
          <span>
            Fecha y hora de finalización
          </span>

          <input
            type="datetime-local"
            max={maximumDateTime}
            value={customDateTime}
            onChange={event =>
              setCustomDateTime(
                event.target.value,
              )
            }
          />
        </label>
      )}

      {option ===
        'dateOnly' && (
        <label
          className={styles.field}
        >
          <span>
            Fecha de finalización
          </span>

          <input
            type="date"
            max={maximumDate}
            value={dateOnly}
            onChange={event =>
              setDateOnly(
                event.target.value,
              )
            }
          />
        </label>
      )}

      {selection && (
        <section
          className={
            styles.review
          }
          aria-labelledby="phase-end-review-title"
        >
          <h4
            id="phase-end-review-title"
          >
            Revisá antes de confirmar
          </h4>

          <div
            className={
              styles.reviewGrid
            }
          >
            <div>
              <span>Inicio</span>

              <strong>
                {formatDateTime(
                  startTime,
                )}
              </strong>
            </div>

            <div>
              <span>Final</span>

              <strong>
                {formatDateTime(
                  selection.endTime,
                  selection.precision,
                )}
              </strong>
            </div>

            <div>
              <span>Duración</span>

              <strong>
                {formatDuration(
                  startTime,
                  selection.endTime,
                  selection.precision ===
                    'dateOnly',
                )}
              </strong>
            </div>
          </div>

          {selection.precision ===
            'dateOnly' && (
            <p
              className={
                styles.helperText
              }
            >
              La duración es estimada
              porque no se registró una
              hora exacta.
            </p>
          )}

          {endIsBeforeStart && (
            <p
              className={
                styles.alert
              }
              role="alert"
            >
              La finalización no puede
              ser anterior al inicio.
            </p>
          )}

          {endIsFuture && (
            <p
              className={
                styles.alert
              }
              role="alert"
            >
              La finalización no puede
              estar en el futuro.
            </p>
          )}
        </section>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={
            styles.primaryAction
          }
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          Confirmar finalización
        </button>

        <button
          type="button"
          className={
            styles.cancelButton
          }
          onClick={reset}
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}