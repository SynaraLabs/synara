import styles from '../../migraine.module.css';

interface PhaseDateSelectorProps {
  title: string;
  value?: string;
  onChange: (date: string) => void;
}

function formatLocalDate(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeDateValue(
  value?: string,
): string {
  if (!value) {
    return '';
  }

  /*
   * El valor ya tiene el formato
   * requerido por input type="date".
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return value;
  }

  /*
   * Conservamos compatibilidad cuando
   * el valor almacenado es una fecha
   * ISO completa.
   */
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatLocalDate(date);
}

export function PhaseDateSelector({
  title,
  value,
  onChange,
}: PhaseDateSelectorProps) {
  const today = formatLocalDate(
    new Date(),
  );

  const selectedValue =
    normalizeDateValue(value);

  const setRelativeDate = (
    daysAgo: number,
  ) => {
    const date = new Date();

    date.setHours(12, 0, 0, 0);

    date.setDate(
      date.getDate() - daysAgo,
    );

    onChange(
      formatLocalDate(date),
    );
  };

  const handleDateChange = (
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate =
      event.target.value;

    if (!selectedDate) {
      return;
    }

    onChange(selectedDate);
  };

  return (
    <section
      className={styles.dateSelector}
    >
      <h4>{title}</h4>

      <div>
        <button
          type="button"
          onClick={() =>
            setRelativeDate(0)
          }
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={() =>
            setRelativeDate(1)
          }
        >
          Ayer
        </button>

        <button
          type="button"
          onClick={() =>
            setRelativeDate(2)
          }
        >
          Hace 2 días
        </button>
      </div>

      <label>
        Elegir fecha

        <input
          type="date"
          max={today}
          value={selectedValue}
          onChange={
            handleDateChange
          }
        />
      </label>
    </section>
  );
}