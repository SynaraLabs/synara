import type {
  ClinicalPhase,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
} from '../../migraine/utils/episodeCalculations';

import type {
  ClinicalMigraineReport,
} from '../types/clinicalReport.types';

import styles from '../../migraine/migraine.module.css';

interface Props {
  report:
    ClinicalMigraineReport;
}

const PHASE_LABELS: Record<
  ClinicalPhase,
  string
> = {
  premonitory:
    'Señales premonitorias',

  aura: 'Aura',

  crisis: 'Crisis',

  postdrome: 'Postdromo',
};

const formatMetric = (
  value: number | undefined,
  suffix = '',
): string => {
  if (value === undefined) {
    return 'Sin datos';
  }

  return `${value}${suffix}`;
};

export function ClinicalReportOverview({
  report,
}: Props) {
  const {
    coverage,
    frequency,
    pain,
    duration,
    phases,
    dataQuality,
  } = report;

  if (
    coverage.totalEpisodes === 0
  ) {
    return (
      <section
        className={
          styles.symptomSelector
        }
      >
        <div>
          <p>
            Resumen clínico
          </p>

          <h2>
            Todavía no hay episodios
            en este período
          </h2>

          <p>
            Cuando registres episodios,
            SYNARA podrá calcular
            frecuencia, intensidad,
            duración y fases observadas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="clinical-overview-title"
      >
        <div>
          <p>
            Resumen clínico
          </p>

          <h2
            id="clinical-overview-title"
          >
            Panorama del período
          </h2>

          <p>
            Este resumen describe los
            datos registrados. No realiza
            diagnósticos ni reemplaza la
            evaluación profesional.
          </p>
        </div>

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
            {coverage.totalEpisodes ===
            1
              ? '1 episodio registrado'
              : `${coverage.totalEpisodes} episodios registrados`}
          </p>
        </div>
      </section>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="report-terminology-title"
      >
        <div>
          <h3
            id="report-terminology-title"
          >
            Episodio y crisis no
            significan lo mismo
          </h3>

          <p>
            Un episodio puede incluir
            señales premonitorias, aura,
            crisis y postdromo. La crisis
            es solamente la fase de dolor
            y síntomas agudos.
          </p>
        </div>

        <div
          className={
            styles.compactChoiceGrid
          }
        >
          <div>
            <strong>
              {
                coverage.totalEpisodes
              }
            </strong>

            <span>
              Episodios
            </span>
          </div>

          <div>
            <strong>
              {
                coverage
                  .episodesWithCrisis
              }
            </strong>

            <span>
              Con crisis
            </span>
          </div>

          <div>
            <strong>
              {
                coverage
                  .episodesWithoutCrisis
              }
            </strong>

            <span>
              Sin crisis
            </span>
          </div>

          <div>
            <strong>
              {
                coverage
                  .incompleteEpisodes
              }
            </strong>

            <span>
              Incompletos
            </span>
          </div>
        </div>
      </section>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="report-frequency-title"
      >
        <div>
          <h3
            id="report-frequency-title"
          >
            Frecuencia e intensidad
          </h3>

          <p>
            Los promedios se calculan
            solamente con los registros
            disponibles dentro del
            período.
          </p>
        </div>

        <div
          className={
            styles.compactChoiceGrid
          }
        >
          <div>
            <strong>
              {formatMetric(
                frequency
                  .episodesPerMonth,
              )}
            </strong>

            <span>
              Episodios por mes
            </span>
          </div>

          <div>
            <strong>
              {formatMetric(
                frequency
                  .crisesPerMonth,
              )}
            </strong>

            <span>
              Crisis por mes
            </span>
          </div>

          <div>
            <strong>
              {formatMetric(
                pain.averageIntensity,
                '/10',
              )}
            </strong>

            <span>
              Intensidad promedio
            </span>
          </div>

          <div>
            <strong>
              {formatMetric(
                pain.maximumIntensity,
                '/10',
              )}
            </strong>

            <span>
              Intensidad máxima
            </span>
          </div>
        </div>

        <p>
          La intensidad se calculó con{' '}
          {
            pain.episodesWithPainData
          }{' '}
          de{' '}
          {
            coverage
              .episodesWithCrisis
          }{' '}
          crisis.
        </p>
      </section>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="report-duration-title"
      >
        <div>
          <h3
            id="report-duration-title"
          >
            Duración de las crisis
          </h3>

          <p>
            Solo se incluyen crisis con
            fechas válidas de inicio y
            finalización.
          </p>
        </div>

        <div
          className={
            styles.compactChoiceGrid
          }
        >
          <div>
            <strong>
              {formatDuration(
                duration.averageMinutes,
              )}
            </strong>

            <span>
              Duración promedio
            </span>
          </div>

          <div>
            <strong>
              {formatDuration(
                duration.shortestMinutes,
              )}
            </strong>

            <span>
              Crisis más corta
            </span>
          </div>

          <div>
            <strong>
              {formatDuration(
                duration.longestMinutes,
              )}
            </strong>

            <span>
              Crisis más larga
            </span>
          </div>
        </div>

        <p>
          Hay duración completa en{' '}
          {
            duration
              .crisesWithDurationData
          }{' '}
          de{' '}
          {
            coverage
              .episodesWithCrisis
          }{' '}
          crisis.
        </p>
      </section>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="report-phases-title"
      >
        <div>
          <h3
            id="report-phases-title"
          >
            Fases registradas
          </h3>

          <p>
            Un mismo episodio puede
            contener más de una fase.
          </p>
        </div>

        <div
          className={
            styles.compactChoiceGrid
          }
        >
          {phases.map(
            phase => (
              <div
                key={phase.phase}
              >
                <strong>
                  {phase.count}
                </strong>

                <span>
                  {
                    PHASE_LABELS[
                      phase.phase
                    ]
                  }
                </span>

                <small>
                  {phase.percentage}% de
                  los episodios
                </small>
              </div>
            ),
          )}
        </div>
      </section>

      <section
        className={
          styles.symptomSelector
        }
        aria-labelledby="report-quality-title"
      >
        <div>
          <h3
            id="report-quality-title"
          >
            Cobertura de los datos
          </h3>

          <p>
            Una sección no completada se
            considera información
            faltante, no ausencia del
            síntoma o factor.
          </p>
        </div>

        <ul>
          <li>
            Síntomas registrados en{' '}
            {
              dataQuality
                .episodesWithSymptomData
            }{' '}
            de{' '}
            {
              coverage.totalEpisodes
            }{' '}
            episodios.
          </li>

          <li>
            Desencadenantes registrados
            en{' '}
            {
              dataQuality
                .episodesWithTriggerData
            }{' '}
            de{' '}
            {
              coverage.totalEpisodes
            }{' '}
            episodios.
          </li>

          <li>
            Tratamiento registrado en{' '}
            {
              dataQuality
                .episodesWithTreatmentData
            }{' '}
            de{' '}
            {
              coverage.totalEpisodes
            }{' '}
            episodios.
          </li>

          <li>
            Inicio y final de crisis en{' '}
            {
              dataQuality
                .episodesWithCompleteCrisisDates
            }{' '}
            de{' '}
            {
              coverage
                .episodesWithCrisis
            }{' '}
            crisis.
          </li>
        </ul>
      </section>
    </>
  );
}