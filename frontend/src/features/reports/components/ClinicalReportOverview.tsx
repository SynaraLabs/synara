import type {
  ClinicalPhase,
} from '../../migraine/types/migraine.types';

import {
  formatDuration,
} from '../../migraine/utils/episodeCalculations';

import type {
  ClinicalMigraineReport,
} from '../types/clinicalReport.types';

import styles from './ClinicalReportOverview.module.css';

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
        className={styles.emptyState}
      >
        <p
          className={styles.eyebrow}
        >
          Resumen clínico
        </p>

        <h2>
          Todavía no hay episodios en
          este período
        </h2>

        <p>
          Cuando registres episodios,
          SYNARA podrá calcular
          frecuencia, intensidad,
          duración y fases observadas.
        </p>
      </section>
    );
  }

  return (
    <section
      className={styles.report}
      aria-labelledby="clinical-overview-title"
    >
      <header
        className={styles.introduction}
      >
        <div>
          <p
            className={styles.eyebrow}
          >
            Resumen clínico
          </p>

          <h2
            id="clinical-overview-title"
          >
            Panorama del período
          </h2>

          <p
            className={styles.lead}
          >
            Una lectura ordenada de los
            episodios que registraste
            durante el período
            seleccionado.
          </p>
        </div>

        <div
          className={styles.episodeCount}
          role="status"
        >
          <strong>
            {coverage.totalEpisodes}
          </strong>

          <span>
            {coverage.totalEpisodes === 1
              ? 'episodio registrado'
              : 'episodios registrados'}
          </span>
        </div>
      </header>

      <p
        className={styles.disclaimer}
      >
        Este resumen describe los datos
        registrados. No realiza
        diagnósticos ni reemplaza la
        evaluación profesional.
      </p>

      <section
        className={styles.section}
        aria-labelledby="report-coverage-title"
      >
        <div
          className={styles.sectionHeader}
        >
          <div>
            <p
              className={styles.sectionEyebrow}
            >
              Cobertura
            </p>

            <h3
              id="report-coverage-title"
            >
              Episodios analizados
            </h3>
          </div>

          <p>
            Un episodio puede incluir
            varias fases. La crisis es
            solamente la fase de dolor y
            síntomas agudos.
          </p>
        </div>

        <div
          className={styles.metricGrid}
        >
          <article
            className={styles.metric}
          >
            <span>
              Episodios
            </span>

            <strong>
              {coverage.totalEpisodes}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Con crisis
            </span>

            <strong>
              {
                coverage
                  .episodesWithCrisis
              }
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Sin crisis
            </span>

            <strong>
              {
                coverage
                  .episodesWithoutCrisis
              }
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Incompletos
            </span>

            <strong>
              {
                coverage
                  .incompleteEpisodes
              }
            </strong>
          </article>
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="report-frequency-title"
      >
        <div
          className={styles.sectionHeader}
        >
          <div>
            <p
              className={styles.sectionEyebrow}
            >
              Evolución
            </p>

            <h3
              id="report-frequency-title"
            >
              Frecuencia e intensidad
            </h3>
          </div>

          <p>
            Promedios calculados con los
            registros disponibles dentro
            del período.
          </p>
        </div>

        <div
          className={styles.metricGrid}
        >
          <article
            className={styles.metric}
          >
            <span>
              Episodios por mes
            </span>

            <strong>
              {formatMetric(
                frequency
                  .episodesPerMonth,
              )}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Crisis por mes
            </span>

            <strong>
              {formatMetric(
                frequency
                  .crisesPerMonth,
              )}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Intensidad promedio
            </span>

            <strong>
              {formatMetric(
                pain.averageIntensity,
                '/10',
              )}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Intensidad máxima
            </span>

            <strong>
              {formatMetric(
                pain.maximumIntensity,
                '/10',
              )}
            </strong>
          </article>
        </div>

        <p
          className={styles.dataNote}
        >
          La intensidad se calculó con{' '}
          {pain.episodesWithPainData}{' '}
          de{' '}
          {coverage.episodesWithCrisis}{' '}
          crisis.
        </p>
      </section>

      <section
        className={styles.section}
        aria-labelledby="report-duration-title"
      >
        <div
          className={styles.sectionHeader}
        >
          <div>
            <p
              className={styles.sectionEyebrow}
            >
              Tiempo
            </p>

            <h3
              id="report-duration-title"
            >
              Duración de las crisis
            </h3>
          </div>

          <p>
            Solo incluye crisis con
            fechas válidas de inicio y
            finalización.
          </p>
        </div>

        <div
          className={`${styles.metricGrid} ${styles.threeColumns}`}
        >
          <article
            className={styles.metric}
          >
            <span>
              Duración promedio
            </span>

            <strong>
              {formatDuration(
                duration.averageMinutes,
              )}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Crisis más corta
            </span>

            <strong>
              {formatDuration(
                duration.shortestMinutes,
              )}
            </strong>
          </article>

          <article
            className={styles.metric}
          >
            <span>
              Crisis más larga
            </span>

            <strong>
              {formatDuration(
                duration.longestMinutes,
              )}
            </strong>
          </article>
        </div>

        <p
          className={styles.dataNote}
        >
          Hay duración completa en{' '}
          {
            duration
              .crisesWithDurationData
          }{' '}
          de{' '}
          {coverage.episodesWithCrisis}{' '}
          crisis.
        </p>
      </section>

      <section
        className={styles.section}
        aria-labelledby="report-phases-title"
      >
        <div
          className={styles.sectionHeader}
        >
          <div>
            <p
              className={styles.sectionEyebrow}
            >
              Recorrido
            </p>

            <h3
              id="report-phases-title"
            >
              Fases registradas
            </h3>
          </div>

          <p>
            Un mismo episodio puede
            contener más de una fase.
          </p>
        </div>

        <div
          className={styles.phaseGrid}
        >
          {phases.map(
            phase => (
              <article
                key={phase.phase}
                className={styles.phaseCard}
                data-phase={phase.phase}
              >
                <span>
                  {
                    PHASE_LABELS[
                      phase.phase
                    ]
                  }
                </span>

                <strong>
                  {phase.percentage}%
                </strong>

                <small>
                  {phase.count}{' '}
                  {phase.count === 1
                    ? 'episodio'
                    : 'episodios'}
                </small>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.qualitySection}`}
        aria-labelledby="report-quality-title"
      >
        <div
          className={styles.sectionHeader}
        >
          <div>
            <p
              className={styles.sectionEyebrow}
            >
              Calidad del informe
            </p>

            <h3
              id="report-quality-title"
            >
              Cobertura de los datos
            </h3>
          </div>

          <p>
            Una sección no completada se
            considera información
            faltante, no ausencia del
            síntoma o factor.
          </p>
        </div>

        <dl
          className={styles.qualityList}
        >
          <div>
            <dt>
              Síntomas
            </dt>

            <dd>
              {
                dataQuality
                  .episodesWithSymptomData
              }{' '}
              de{' '}
              {coverage.totalEpisodes}
            </dd>
          </div>

          <div>
            <dt>
              Desencadenantes
            </dt>

            <dd>
              {
                dataQuality
                  .episodesWithTriggerData
              }{' '}
              de{' '}
              {coverage.totalEpisodes}
            </dd>
          </div>

          <div>
            <dt>
              Tratamiento
            </dt>

            <dd>
              {
                dataQuality
                  .episodesWithTreatmentData
              }{' '}
              de{' '}
              {coverage.totalEpisodes}
            </dd>
          </div>

          <div>
            <dt>
              Crisis con fechas completas
            </dt>

            <dd>
              {
                dataQuality
                  .episodesWithCompleteCrisisDates
              }{' '}
              de{' '}
              {coverage.episodesWithCrisis}
            </dd>
          </div>
        </dl>
      </section>
    </section>
  );
}