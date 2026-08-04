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

import styles from '../features/migraine/migraine.module.css';

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

  return (
    <section
      className={
        styles.phaseFlow
      }
    >
      <header
        className={
          styles.symptomSelector
        }
      >
        <div>
          <p>
            Informes para
            profesionales
          </p>

          <h1>
            Resumen clínico de
            migrañas
          </h1>

          <p>
            Revisá el período y
            descargá un documento con
            tu perfil clínico y los
            episodios registrados para
            compartirlo en consulta.
          </p>
        </div>

        <label>
          Período analizado

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
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </label>

        <div
          className={
            styles.selectionSummary
          }
          role="status"
        >
          <span aria-hidden="true">
            ◷
          </span>

          <p>
            {
              selectedPeriod
                ?.label
            }
            {' · '}
            generado el{' '}
            {formatReportDate(
              report.generatedAt,
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleDownload
          }
        >
          Descargar informe PDF
        </button>

        {downloadFeedback && (
          <p
            role="status"
          >
            {downloadFeedback}
          </p>
        )}

        <small>
          El PDF se genera localmente
          en este dispositivo. SYNARA
          no envía tu información
          médica a un servidor.
        </small>
      </header>

      <ClinicalReportOverview
        report={report}
      />
    </section>
  );
}