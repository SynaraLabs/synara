import type {
  ClinicalPhase,
  MigraineTrigger,
  TreatmentEffectiveness,
  TreatmentType,
} from '../../migraine/types/migraine.types';

export type ClinicalReportPeriod =
  | 'last30Days'
  | 'last90Days'
  | 'last6Months'
  | 'last12Months'
  | 'all';

export interface ClinicalReportDateRange {
  period: ClinicalReportPeriod;

  start?: string;

  end: string;
}

export interface ClinicalReportCoverage {
  totalEpisodes: number;

  episodesWithCrisis: number;

  episodesWithoutCrisis: number;

  incompleteEpisodes: number;

  monthsObserved: number;
}

export interface ClinicalReportFrequency {
  episodesPerMonth?: number;

  crisesPerMonth?: number;
}

export interface ClinicalReportPain {
  episodesWithPainData: number;

  averageIntensity?: number;

  maximumIntensity?: number;
}

export interface ClinicalReportDuration {
  crisesWithDurationData: number;

  averageMinutes?: number;

  shortestMinutes?: number;

  longestMinutes?: number;
}

export interface ClinicalReportPhaseCount {
  phase: ClinicalPhase;

  count: number;

  percentage: number;
}

export interface ClinicalReportSymptom {
  id: string;

  label: string;

  episodeCount: number;

  percentage: number;
}

export interface ClinicalReportTrigger {
  trigger: MigraineTrigger;

  label: string;

  episodeCount: number;

  percentage: number;
}

export interface ClinicalReportTreatment {
  type: TreatmentType;

  label: string;

  episodeCount: number;

  effectiveness: Partial<
    Record<
      TreatmentEffectiveness,
      number
    >
  >;
}

export interface ClinicalReportDataQuality {
  episodesWithSymptomData: number;

  episodesWithTriggerData: number;

  episodesWithTreatmentData: number;

  episodesWithCompleteCrisisDates: number;
}

export interface ClinicalMigraineReport {
  generatedAt: string;

  dateRange:
    ClinicalReportDateRange;

  coverage:
    ClinicalReportCoverage;

  frequency:
    ClinicalReportFrequency;

  pain:
    ClinicalReportPain;

  duration:
    ClinicalReportDuration;

  phases:
    ClinicalReportPhaseCount[];

  symptoms:
    ClinicalReportSymptom[];

  triggers:
    ClinicalReportTrigger[];

  treatments:
    ClinicalReportTreatment[];

  dataQuality:
    ClinicalReportDataQuality;
}