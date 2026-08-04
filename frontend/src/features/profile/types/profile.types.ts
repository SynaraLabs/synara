// ===============================
// SYNARA USER PROFILE DOMAIN v2
// ===============================

// -------------------------------
// SHARED CLINICAL VALUES
// -------------------------------

export type ClinicalAnswer =
  | 'yes'
  | 'no'
  | 'unknown';

// -------------------------------
// SEX
// -------------------------------

export type UserSex =
  | 'female'
  | 'male'
  | 'other'
  | 'preferNotToSay';

// -------------------------------
// MIGRAINE HISTORY
// -------------------------------

export type MigraineType =
  | 'withAura'
  | 'withoutAura'
  | 'unknown';

export type MigraineDiagnosisStatus =
  | 'diagnosed'
  | 'suspected'
  | 'notDiagnosed'
  | 'unknown';

export type MigraineAuraPattern =
  | 'never'
  | 'sometimes'
  | 'usually'
  | 'always'
  | 'unknown';

export type MigraineCourse =
  | 'episodic'
  | 'chronic'
  | 'variable'
  | 'unknown';

export type DiagnosingProfessional =
  | 'neurologist'
  | 'headacheSpecialist'
  | 'generalPractitioner'
  | 'other'
  | 'unknown';

export interface MigraineHistory {
  onsetAge?: number;

  diagnosisStatus?:
    MigraineDiagnosisStatus;

  diagnosisYear?: number;

  diagnosedBy?:
    DiagnosingProfessional;

  auraPattern?:
    MigraineAuraPattern;

  course?:
    MigraineCourse;

  headacheDaysPerMonth?: number;

  migraineDaysPerMonth?: number;

  usualDurationMinHours?: number;

  usualDurationMaxHours?: number;

  familyHistory?:
    ClinicalAnswer;

  statusMigrainosusHistory?:
    ClinicalAnswer;

  emergencyCareHistory?:
    ClinicalAnswer;

  recentPatternChange?:
    ClinicalAnswer;

  /*
   * Campos de compatibilidad con
   * perfiles creados en la versión 1.
   * Se conservarán hasta completar
   * la normalización del store.
   */
  diagnosed?: boolean;

  type?: MigraineType;

  monthlyFrequency?: number;

  usualDurationHours?: number;
}

// -------------------------------
// MIGRAINE CARE AND TREATMENT
// -------------------------------

export type TreatingProfessional =
  | 'neurologist'
  | 'headacheSpecialist'
  | 'generalPractitioner'
  | 'other';

export interface MigraineCare {
  hasProfessionalFollowUp?:
    ClinicalAnswer;

  professionalType?:
    TreatingProfessional;

  lastConsultationDate?: string;

  preventiveTreatments?: string[];

  acuteTreatments?: string[];

  nonPharmacologicalTreatments?:
    string[];

  previousTreatments?: string[];

  treatmentNotes?: string;
}

// -------------------------------
// CLINICAL BACKGROUND
// -------------------------------

export interface ClinicalBackground {
  otherHeadacheDiagnoses?:
    string[];

  relevantConditions?:
    string[];

  currentMedications?:
    string[];

  medicationAllergies?:
    string[];

  otherRelevantHistory?: string;
}

// -------------------------------
// MENSTRUAL / HORMONAL CONTEXT
// -------------------------------

export type MigraineHormonalRelation =
  | 'menstruation'
  | 'ovulation'
  | 'both'
  | 'none'
  | 'unknown';

export interface MenstrualContext {
  hasMenstrualCycle: boolean;

  averageCycleDays?: number;

  lastPeriodDate?: string;

  hormonalRelation?:
    MigraineHormonalRelation;
}

// -------------------------------
// LIFESTYLE
// -------------------------------

export type ConsumptionLevel =
  | 'none'
  | 'low'
  | 'medium'
  | 'high';

export type PhysicalActivityLevel =
  | 'none'
  | 'low'
  | 'medium'
  | 'high';

export interface LifestyleProfile {
  averageSleepHours?: number;

  caffeineConsumption?:
    ConsumptionLevel;

  alcoholConsumption?:
    ConsumptionLevel;

  physicalActivity?:
    PhysicalActivityLevel;
}

// -------------------------------
// EMOTIONAL CONTEXT
// -------------------------------

export interface EmotionalContext {
  anxietyHistory?: boolean;

  baselineStress?: number;
}

// -------------------------------
// COMPLETE PROFILE
// -------------------------------

export interface UserProfile {
  id: string;

  createdAt: string;

  updatedAt?: string;

  // Personal

  name: string;

  birthDate: string;

  sex: UserSex;

  // Medical context

  migraineHistory?:
    MigraineHistory;

  migraineCare?:
    MigraineCare;

  clinicalBackground?:
    ClinicalBackground;

  menstrual?:
    MenstrualContext;

  lifestyle?:
    LifestyleProfile;

  emotionalContext?:
    EmotionalContext;
}