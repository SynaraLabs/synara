import {
  useMemo,
  useState,
} from 'react';

import {
  useMigraineStore,
} from '../features/migraine/store/migraine.store';

import {
  useProfileStore,
} from '../features/profile/store/profile.store';

import {
  ClinicalReportOverview,
} from '../features/reports/components/ClinicalReportOverview';

import type {
  ClinicalReportPeriod,
} from '../features/reports/types/clinicalReport.types';

import {
  createClinicalMigraineReport,
} from '../features/reports/utils/createClinicalMigraineReport';

import {
  downloadClinicalReportPdf,
} from '../features/reports/utils/downloadClinicalReportPdf';

import styles from './Reports.module.css';

interface PeriodOption {
  value: ClinicalReportPeriod;

  label: string;
}

const PERIOD_OPTIONS:
  PeriodOption[] = [
  {
    value: 'last30Days',
    label: 'Últimos 30 días',
  },
  {
    value: 'last90Days',
    label: 'Últimos 90 días',
  },
  {
    value: 'last6Months',
    label: 'Últimos 6 meses',
  },
  {
    value: 'last12Months',
    label: 'Últimos 12 meses',
  },
  {
    value: 'all',
    label: 'Todo el historial',
  },
];

const isClinicalReportPeriod = (
  value: string,
): value is ClinicalReportPeriod => {
  return PERIOD_OPTIONS.some(
    option =>
      option.value === value,
  );
};

const formatReportDate = (
  value: string,
): string => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat(
    'es-AR',
    {
      dateStyle: 'medium',
    },
  ).format(date);
};

export function Reports() {
  const history =
    useMigraineStore(
      state => state.history,
    );

  const profile =
    useProfileStore(
      state => state.profile,
    );

  const [
    period,
    setPeriod,
  ] = useState<ClinicalReportPeriod>(
    'last90Days',
  );

  const [
    downloadFeedback,
    setDownloadFeedback,
  ] = useState('');

  const report =
    useMemo(
      () =>
        createClinicalMigraineReport(
          history,
          period,
        ),
      [
        history,
        period,
      ],
    );

  const selectedPeriod =
    PERIOD_OPTIONS.find(
      option =>
        option.value === period,
    );

  const handleDownload = () => {
    setDownloadFeedback('');

    try {
      downloadClinicalReportPdf({
        report,
        profile,
      });

      setDownloadFeedback(
        'El informe PDF se generó correctamente.',
      );
    } catch {
      setDownloadFeedback(
        'No se pudo generar el informe. Volvé a intentarlo.',
      );
    }
  };

  const downloadFailed =
    downloadFeedback.startsWith(
      'No se pudo',
    );

  return (
    <section
      className={styles.page}
    >
      <header
        className={styles.pageHeader}
      >
        <p
          className={styles.eyebrow}
        >
          Informes para profesionales
        </p>

        <h1>
          Resumen clínico de migrañas
        </h1>

        <p
          className={styles.description}
        >
          Prepará una síntesis de tus
          episodios para revisar o
          compartir durante una consulta.
        </p>
      </header>

      <section
        className={styles.reportControls}
        aria-labelledby="report-preparation-title"
      >
        <div
          className={styles.controlsHeader}
        >
          <div>
            <p
              className={styles.controlEyebrow}
            >
              Preparar informe
            </p>

            <h2
              id="report-preparation-title"
            >
              Elegí el período que querés
              analizar
            </h2>
          </div>

          <p>
            El resumen se actualiza
            automáticamente al cambiar
            el período.
          </p>
        </div>

        <div
          className={styles.controlGrid}
        >
          <label
            className={styles.periodField}
          >
            <span>
              Período analizado
            </span>

            <select
              value={period}
              onChange={event => {
                if (
                  isClinicalReportPeriod(
                    event.target.value,
                  )
                ) {
                  setPeriod(
                    event.target.value,
                  );

                  setDownloadFeedback(
                    '',
                  );
                }
              }}
            >
              {PERIOD_OPTIONS.map(
                option => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <div
            className={styles.reportStatus}
            role="status"
          >
            <span>
              Informe preparado
            </span>

            <strong>
              {selectedPeriod?.label}
            </strong>

            <small>
              Actualizado el{' '}
              {formatReportDate(
                report.generatedAt,
              )}
            </small>
          </div>

          <button
            type="button"
            className={styles.downloadButton}
            onClick={handleDownload}
          >
            Descargar informe PDF
          </button>
        </div>

        {downloadFeedback && (
          <p
            className={
              downloadFailed
                ? styles.errorFeedback
                : styles.successFeedback
            }
            role={
              downloadFailed
                ? 'alert'
                : 'status'
            }
          >
            {downloadFeedback}
          </p>
        )}

        <p
          className={styles.privacyNote}
        >
          El PDF se genera localmente en
          este dispositivo. SYNARA no
          envía tu información médica a
          un servidor.
        </p>
      </section>

      <ClinicalReportOverview
        report={report}
      />
    </section>
  );
}