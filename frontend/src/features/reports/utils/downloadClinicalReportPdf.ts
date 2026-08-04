import {
  jsPDF,
} from 'jspdf';

import autoTable from 'jspdf-autotable';

import type {
  UserProfile,
} from '../../profile/types/profile.types';

import {
  TREATMENT_EFFECTIVENESS_LABELS,
} from '../../migraine/data/treatmentCatalog';

import {
  formatDuration,
} from '../../migraine/utils/episodeCalculations';

import {
  registerPdfFonts,
} from './registerPdfFonts';

import type {
  ClinicalMigraineReport,
} from '../types/clinicalReport.types';

interface DownloadClinicalReportPdfOptions {
  report:
    ClinicalMigraineReport;

  profile:
    UserProfile;
}

interface ReportRow {
  label: string;

  value: string;
}

const CLINICAL_ANSWER_LABELS = {
  yes: 'Sí',
  no: 'No',
  unknown: 'No sabe / sin confirmar',
} as const;

const SEX_LABELS = {
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
  preferNotToSay:
    'Prefiere no informarlo',
} as const;

const DIAGNOSIS_LABELS = {
  diagnosed:
    'Migraña diagnosticada',

  suspected:
    'Migraña sospechada',

  notDiagnosed:
    'Sin diagnóstico de migraña',

  unknown:
    'Sin confirmar',
} as const;

const PROFESSIONAL_LABELS = {
  neurologist: 'Neurología',

  headacheSpecialist:
    'Especialista en cefaleas',

  generalPractitioner:
    'Medicina general',

  other: 'Otro profesional',

  unknown: 'Sin confirmar',
} as const;

const AURA_PATTERN_LABELS = {
  never: 'Nunca',

  sometimes:
    'En algunos episodios',

  usually:
    'En la mayoría de los episodios',

  always:
    'En todos los episodios',

  unknown:
    'Sin confirmar',
} as const;

const COURSE_LABELS = {
  episodic: 'Episódica',

  chronic: 'Crónica',

  variable: 'Variable',

  unknown: 'Sin confirmar',
} as const;

const HORMONAL_RELATION_LABELS = {
  menstruation:
    'Alrededor de la menstruación',

  ovulation:
    'Alrededor de la ovulación',

  both:
    'Menstruación y ovulación',

  none:
    'Sin relación observada',

  unknown:
    'Sin confirmar',
} as const;

const PERIOD_LABELS = {
  last30Days:
    'Últimos 30 días',

  last90Days:
    'Últimos 90 días',

  last6Months:
    'Últimos 6 meses',

  last12Months:
    'Últimos 12 meses',

  all:
    'Todo el historial',
} as const;

const formatDate = (
  value: string | undefined,
): string => {
  if (!value) {
    return 'Sin registrar';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Sin registrar';
  }

  return new Intl.DateTimeFormat(
    'es-AR',
    {
      dateStyle: 'medium',
    },
  ).format(date);
};

const formatNumber = (
  value: number | undefined,
  suffix = '',
): string => {
  if (value === undefined) {
    return 'Sin registrar';
  }

  return `${value}${suffix}`;
};

const formatList = (
  values: string[] | undefined,
): string => {
  if (
    !values ||
    values.length === 0
  ) {
    return 'Sin registrar';
  }

  return values.join(', ');
};

const formatSymptomLabel = (
  label: string,
): string => {
  if (label === 'visual') {
    return 'Aura visual';
  }

  if (label === 'vestibular') {
    return 'Aura vestibular';
  }

  return label;
};

const calculateAge = (
  birthDate: string,
  referenceDate: string,
): number | undefined => {
  if (!birthDate) {
    return undefined;
  }

  const birth =
    new Date(
      `${birthDate}T12:00:00`,
    );

  const reference =
    new Date(referenceDate);

  if (
    Number.isNaN(
      birth.getTime(),
    ) ||
    Number.isNaN(
      reference.getTime(),
    )
  ) {
    return undefined;
  }

  let age =
    reference.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    reference.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      reference.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0
    ? age
    : undefined;
};

const sanitizeFileName = (
  value: string,
): string => {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-zA-Z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
    .toLowerCase();
};

const getProfileRows = (
  profile: UserProfile,
  report:
    ClinicalMigraineReport,
): ReportRow[] => {
  const age =
    calculateAge(
      profile.birthDate,
      report.generatedAt,
    );

  return [
    {
      label:
        'Nombre',

      value:
        profile.name.trim() ||
        'Sin registrar',
    },
    {
      label:
        'Fecha de nacimiento',

      value:
        formatDate(
          profile.birthDate,
        ),
    },
    {
      label:
        'Edad al generar el informe',

      value:
        age === undefined
          ? 'Sin registrar'
          : `${age} años`,
    },
    {
      label:
        'Sexo registrado',

      value:
        SEX_LABELS[
          profile.sex
        ],
    },
  ];
};

const getMigraineHistoryRows = (
  profile: UserProfile,
): ReportRow[] => {
  const history =
    profile.migraineHistory;

  if (!history) {
    return [];
  }

  const diagnosisStatus =
    history.diagnosisStatus ??
    (
      history.diagnosed === true
        ? 'diagnosed'
        : history.diagnosed ===
            false
          ? 'notDiagnosed'
          : undefined
    );

  return [
    {
      label:
        'Situación diagnóstica',

      value:
        diagnosisStatus
          ? DIAGNOSIS_LABELS[
              diagnosisStatus
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Edad aproximada de inicio',

      value:
        formatNumber(
          history.onsetAge,
          ' años',
        ),
    },
    {
      label:
        'Año del diagnóstico',

      value:
        formatNumber(
          history.diagnosisYear,
        ),
    },
    {
      label:
        'Profesional que diagnosticó',

      value:
        history.diagnosedBy
          ? PROFESSIONAL_LABELS[
              history.diagnosedBy
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Patrón de aura',

      value:
        history.auraPattern
          ? AURA_PATTERN_LABELS[
              history.auraPattern
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Curso referido',

      value:
        history.course
          ? COURSE_LABELS[
              history.course
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Días de cefalea por mes',

      value:
        formatNumber(
          history
            .headacheDaysPerMonth,
        ),
    },
    {
      label:
        'Días de migraña por mes',

      value:
        formatNumber(
          history
            .migraineDaysPerMonth ??
            history
              .monthlyFrequency,
        ),
    },
    {
      label:
        'Duración habitual',

      value:
        history
          .usualDurationMinHours !==
          undefined ||
        history
          .usualDurationMaxHours !==
          undefined
          ? `${formatNumber(
              history
                .usualDurationMinHours,
              ' h',
            )} a ${formatNumber(
              history
                .usualDurationMaxHours,
              ' h',
            )}`
          : formatNumber(
              history
                .usualDurationHours,
              ' h',
            ),
    },
    {
      label:
        'Antecedentes familiares',

      value:
        history.familyHistory
          ? CLINICAL_ANSWER_LABELS[
              history.familyHistory
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Antecedente de estado migrañoso',

      value:
        history
          .statusMigrainosusHistory
          ? CLINICAL_ANSWER_LABELS[
              history
                .statusMigrainosusHistory
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Consultas de urgencia previas',

      value:
        history
          .emergencyCareHistory
          ? CLINICAL_ANSWER_LABELS[
              history
                .emergencyCareHistory
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Cambio reciente del patrón',

      value:
        history
          .recentPatternChange
          ? CLINICAL_ANSWER_LABELS[
              history
                .recentPatternChange
            ]
          : 'Sin registrar',
    },
  ];
};

const getCareRows = (
  profile: UserProfile,
): ReportRow[] => {
  const care =
    profile.migraineCare;

  if (!care) {
    return [];
  }

  return [
    {
      label:
        'Seguimiento profesional',

      value:
        care.hasProfessionalFollowUp
          ? CLINICAL_ANSWER_LABELS[
              care
                .hasProfessionalFollowUp
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Profesional tratante',

      value:
        care.professionalType
          ? PROFESSIONAL_LABELS[
              care.professionalType
            ]
          : 'Sin registrar',
    },
    {
      label:
        'Última consulta',

      value:
        formatDate(
          care.lastConsultationDate,
        ),
    },
    {
      label:
        'Tratamientos preventivos',

      value:
        formatList(
          care.preventiveTreatments,
        ),
    },
    {
      label:
        'Tratamientos agudos',

      value:
        formatList(
          care.acuteTreatments,
        ),
    },
    {
      label:
        'Medidas no farmacológicas',

      value:
        formatList(
          care
            .nonPharmacologicalTreatments,
        ),
    },
    {
      label:
        'Tratamientos anteriores',

      value:
        formatList(
          care.previousTreatments,
        ),
    },
    {
      label:
        'Notas sobre tratamiento',

      value:
        care.treatmentNotes
          ?.trim() ||
        'Sin registrar',
    },
  ];
};

const getBackgroundRows = (
  profile: UserProfile,
): ReportRow[] => {
  const background =
    profile.clinicalBackground;

  if (!background) {
    return [];
  }

  return [
    {
      label:
        'Otros diagnósticos de cefalea',

      value:
        formatList(
          background
            .otherHeadacheDiagnoses,
        ),
    },
    {
      label:
        'Condiciones relevantes',

      value:
        formatList(
          background
            .relevantConditions,
        ),
    },
    {
      label:
        'Medicación habitual',

      value:
        formatList(
          background
            .currentMedications,
        ),
    },
    {
      label:
        'Alergias medicamentosas',

      value:
        formatList(
          background
            .medicationAllergies,
        ),
    },
    {
      label:
        'Otros antecedentes',

      value:
        background
          .otherRelevantHistory
          ?.trim() ||
        'Sin registrar',
    },
  ];
};

const getHormonalRows = (
  profile: UserProfile,
): ReportRow[] => {
  const menstrual =
    profile.menstrual;

  if (!menstrual) {
    return [];
  }

  return [
    {
      label:
        'Ciclo menstrual',

      value:
        menstrual
          .hasMenstrualCycle
          ? 'Sí'
          : 'No',
    },
    {
      label:
        'Duración promedio del ciclo',

      value:
        menstrual
          .hasMenstrualCycle
          ? formatNumber(
              menstrual
                .averageCycleDays,
              ' días',
            )
          : 'No corresponde',
    },
    {
      label:
        'Última menstruación registrada',

      value:
        menstrual
          .hasMenstrualCycle
          ? formatDate(
              menstrual
                .lastPeriodDate,
            )
          : 'No corresponde',
    },
    {
      label:
        'Relación hormonal percibida',

      value:
        menstrual
          .hasMenstrualCycle &&
        menstrual.hormonalRelation
          ? HORMONAL_RELATION_LABELS[
              menstrual
                .hormonalRelation
            ]
          : menstrual
                .hasMenstrualCycle
            ? 'Sin registrar'
            : 'No corresponde',
    },
  ];
};

export const downloadClinicalReportPdf =
  async ({
    report,
    profile,
  }: DownloadClinicalReportPdfOptions): Promise<void> => {
    const document =
      new jsPDF({
        orientation:
          'portrait',

        unit: 'mm',

        format: 'a4',
      });

    await registerPdfFonts(
      document,
    );

    const pageWidth =
      document.internal.pageSize
        .getWidth();

    const pageHeight =
      document.internal.pageSize
        .getHeight();

    const margin = 16;

    const contentWidth =
      pageWidth -
      margin * 2;

    let cursorY = 18;

    const ensureSpace = (
      requiredHeight: number,
    ) => {
      if (
        cursorY +
          requiredHeight >
        pageHeight - 18
      ) {
        document.addPage();

        cursorY = 18;
      }
    };

    const addSectionTitle = (
      title: string,
    ) => {
      ensureSpace(14);

      document.setFont(
        'NotoSans',
        'bold',
      );

      document.setFontSize(13);

      document.setTextColor(
        31,
        77,
        82,
      );

      document.text(
        title,
        margin,
        cursorY,
      );

      cursorY += 3;

      document.setDrawColor(
        174,
        211,
        207,
      );

      document.line(
        margin,
        cursorY,
        pageWidth - margin,
        cursorY,
      );

      cursorY += 6;
    };

    const addParagraph = (
      text: string,
    ) => {
      ensureSpace(16);

      document.setFont(
        'NotoSans',
        'normal',
      );

      document.setFontSize(9);

      document.setTextColor(
        68,
        80,
        82,
      );

      const lines =
        document.splitTextToSize(
          text,
          contentWidth,
        );

      document.text(
        lines,
        margin,
        cursorY,
      );

      cursorY +=
        lines.length * 4.2 +
        3;
    };

    const addRowsTable = (
      rows: ReportRow[],
    ) => {
      if (rows.length === 0) {
        addParagraph(
          'No hay información registrada en esta sección.',
        );

        return;
      }

      autoTable(
        document,
        {
          startY: cursorY,

          margin: {
            left: margin,
            right: margin,
          },

          head: [[
            'Dato',
            'Información registrada',
          ]],

          body:
            rows.map(
              row => [
                row.label,
                row.value,
              ],
            ),

          theme: 'grid',

          styles: {
            font:
              'NotoSans',

            fontSize: 8,

            cellPadding: 2.5,

            textColor: [
              47,
              61,
              63,
            ],

            lineColor: [
              215,
              226,
              225,
            ],

            lineWidth: 0.2,

            overflow:
              'linebreak',
          },

          headStyles: {
            fillColor: [
              31,
              77,
              82,
            ],

            textColor: [
              255,
              255,
              255,
            ],

            fontStyle:
              'bold',
          },

          alternateRowStyles: {
            fillColor: [
              245,
              249,
              248,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 58,

              fontStyle:
                'bold',
            },
          },
        },
      );

      const tableDocument =
        document as typeof document & {
          lastAutoTable?: {
            finalY: number;
          };
        };

      cursorY =
        (
          tableDocument
            .lastAutoTable
            ?.finalY ??
          cursorY
        ) + 7;
    };

    document.setFillColor(
      31,
      77,
      82,
    );

    document.rect(
      0,
      0,
      pageWidth,
      44,
      'F',
    );

    document.setFont(
      'NotoSans',
      'bold',
    );

    document.setFontSize(10);

    document.setTextColor(
      190,
      229,
      224,
    );

    document.text(
      'SYNARA',
      margin,
      14,
    );

    document.setFontSize(21);

    document.setTextColor(
      255,
      255,
      255,
    );

    document.text(
      'Informe clínico de migrañas',
      margin,
      25,
    );

    document.setFont(
      'NotoSans',
      'normal',
    );

    document.setFontSize(9);

    document.text(
      `${PERIOD_LABELS[
        report.dateRange.period
      ]} · Generado el ${formatDate(
        report.generatedAt,
      )}`,
      margin,
      34,
    );

    cursorY = 54;

    addParagraph(
      'Este documento organiza la información registrada por la persona usuaria para facilitar su revisión durante una consulta. No realiza diagnósticos, no confirma causalidad y no reemplaza la evaluación de un profesional de salud.',
    );

    addSectionTitle(
      'Datos personales',
    );

    addRowsTable(
      getProfileRows(
        profile,
        report,
      ),
    );

    addSectionTitle(
      'Historia de migraña referida',
    );

    addRowsTable(
      getMigraineHistoryRows(
        profile,
      ),
    );

    addSectionTitle(
      'Seguimiento y tratamientos habituales',
    );

    addRowsTable(
      getCareRows(profile),
    );

    addSectionTitle(
      'Antecedentes clínicos relevantes',
    );

    addRowsTable(
      getBackgroundRows(
        profile,
      ),
    );

    addSectionTitle(
      'Contexto hormonal',
    );

    addRowsTable(
      getHormonalRows(
        profile,
      ),
    );

    addSectionTitle(
      'Resumen del período',
    );

    addParagraph(
      'Un episodio puede incluir señales premonitorias, aura, crisis y postdromo. La crisis es solamente la fase de dolor y síntomas agudos.',
    );

    addRowsTable([
      {
        label:
          'Período analizado',

        value:
          PERIOD_LABELS[
            report.dateRange
              .period
          ],
      },
      {
        label:
          'Episodios registrados',

        value:
          String(
            report.coverage
              .totalEpisodes,
          ),
      },
      {
        label:
          'Episodios con crisis',

        value:
          String(
            report.coverage
              .episodesWithCrisis,
          ),
      },
      {
        label:
          'Episodios sin crisis',

        value:
          String(
            report.coverage
              .episodesWithoutCrisis,
          ),
      },
      {
        label:
          'Registros incompletos',

        value:
          String(
            report.coverage
              .incompleteEpisodes,
          ),
      },
      {
        label:
          'Episodios por mes',

        value:
          formatNumber(
            report.frequency
              .episodesPerMonth,
          ),
      },
      {
        label:
          'Crisis por mes',

        value:
          formatNumber(
            report.frequency
              .crisesPerMonth,
          ),
      },
      {
        label:
          'Intensidad promedio',

        value:
          formatNumber(
            report.pain
              .averageIntensity,
            '/10',
          ),
      },
      {
        label:
          'Intensidad máxima',

        value:
          formatNumber(
            report.pain
              .maximumIntensity,
            '/10',
          ),
      },
      {
        label:
          'Duración promedio de crisis',

        value:
          formatDuration(
            report.duration
              .averageMinutes,
          ),
      },
      {
        label:
          'Crisis más corta',

        value:
          formatDuration(
            report.duration
              .shortestMinutes,
          ),
      },
      {
        label:
          'Crisis más larga',

        value:
          formatDuration(
            report.duration
              .longestMinutes,
          ),
      },
    ]);

    addSectionTitle(
      'Fases registradas',
    );

    addRowsTable(
      report.phases.map(
        phase => ({
          label:
            phase.phase ===
            'premonitory'
              ? 'Señales premonitorias'
              : phase.phase ===
                  'aura'
                ? 'Aura'
                : phase.phase ===
                    'crisis'
                  ? 'Crisis'
                  : 'Postdromo',

          value:
            `${phase.count} episodios (${phase.percentage}%)`,
        }),
      ),
    );

    addSectionTitle(
      'Síntomas más registrados',
    );

    addRowsTable(
      report.symptoms
        .slice(0, 15)
        .map(
          symptom => ({
            label:
              formatSymptomLabel(
                symptom.label,
              ),

            value:
              `${symptom.episodeCount} episodios (${symptom.percentage}%)`,
          }),
        ),
    );

    addSectionTitle(
      'Posibles desencadenantes registrados',
    );

    addParagraph(
      'Los porcentajes se calculan solamente sobre episodios que tienen desencadenantes completados. Las coincidencias registradas no demuestran causalidad.',
    );

    addRowsTable(
      report.triggers
        .slice(0, 15)
        .map(
          trigger => ({
            label:
              trigger.label,

            value:
              `${trigger.episodeCount} episodios (${trigger.percentage}%)`,
          }),
        ),
    );

    addSectionTitle(
      'Tratamientos utilizados durante episodios',
    );

    addRowsTable(
      report.treatments.map(
        treatment => {
          const effectiveness =
            Object.entries(
              treatment
                .effectiveness,
            )
              .map(
                ([
                  value,
                  count,
                ]) =>
                  `${
                    TREATMENT_EFFECTIVENESS_LABELS[
                      value as keyof typeof TREATMENT_EFFECTIVENESS_LABELS
                    ]
                  }: ${count}`,
              )
              .join(' · ');

          return {
            label:
              treatment.label,

            value:
              `${treatment.episodeCount} episodios${
                effectiveness
                  ? ` · ${effectiveness}`
                  : ''
              }`,
          };
        },
      ),
    );

    addSectionTitle(
      'Cobertura de la información',
    );

    addRowsTable([
      {
        label:
          'Episodios con síntomas',

        value:
          `${report.dataQuality.episodesWithSymptomData} de ${report.coverage.totalEpisodes}`,
      },
      {
        label:
          'Episodios con desencadenantes',

        value:
          `${report.dataQuality.episodesWithTriggerData} de ${report.coverage.totalEpisodes}`,
      },
      {
        label:
          'Episodios con tratamiento',

        value:
          `${report.dataQuality.episodesWithTreatmentData} de ${report.coverage.totalEpisodes}`,
      },
      {
        label:
          'Crisis con inicio y final',

        value:
          `${report.dataQuality.episodesWithCompleteCrisisDates} de ${report.coverage.episodesWithCrisis}`,
      },
    ]);

    addParagraph(
      'Una sección no completada se considera información faltante. No se interpreta automáticamente como ausencia del síntoma, desencadenante, tratamiento o fase.',
    );

    const pageCount =
      document.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page += 1
    ) {
      document.setPage(page);

      document.setDrawColor(
        215,
        226,
        225,
      );

      document.line(
        margin,
        pageHeight - 13,
        pageWidth - margin,
        pageHeight - 13,
      );

      document.setFont(
        'NotoSans',
        'normal',
      );

      document.setFontSize(7);

      document.setTextColor(
        104,
        117,
        119,
      );

      document.text(
        'SYNARA · Registro personal para revisión profesional',
        margin,
        pageHeight - 8,
      );

      document.text(
        `Página ${page} de ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        {
          align: 'right',
        },
      );
    }

    const profileName =
      sanitizeFileName(
        profile.name,
      );

    const date =
      report.generatedAt.slice(
        0,
        10,
      );

    const fileName =
      profileName
        ? `informe-migranas-${profileName}-${date}.pdf`
        : `informe-migranas-${date}.pdf`;

    document.save(fileName);
  };
