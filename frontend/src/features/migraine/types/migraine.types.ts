// ==========================================
// SYNARA MIGRAINE DOMAIN MODEL v6
// ==========================================
//
// Principles:
// - Every phase can exist independently.
// - Records can be created in real time or retrospectively.
// - Dates can be exact, approximate or unknown.
// - Active phases can receive multiple updates.
// - Previous v5 fields remain available during migration.
//
// ==========================================


// ------------------------------------------
// SHARED VALUES
// ------------------------------------------

export type PainIntensity =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;


export type RecordMode =
  | 'realTime'
  | 'retrospective';


export type TimePrecision =
  | 'exact'
  | 'approximate'
  | 'dateOnly'
  | 'unknown';


export type DayPeriod =
  | 'earlyMorning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'unknown';


export type PhaseStatus =
  | 'notStarted'
  | 'active'
  | 'ended'
  | 'uncertain';


export interface PhaseTime {
  value?: string;

  precision: TimePrecision;

  recordMode: RecordMode;

  dayPeriod?: DayPeriod;
}


export interface PhaseTimeRange {
  start?: PhaseTime;

  end?: PhaseTime;
}


export interface PhaseUpdate<
  TData = Record<string, unknown>,
> {
  id: string;

  createdAt: string;

  occurredAt: PhaseTime;

  data: TData;

  notes?: string;
}


// ------------------------------------------
// EPISODE STATUS
// ------------------------------------------

export type MigraineEpisodeStatus =
  | 'tracking'
  | 'crisis'
  | 'postdrome'
  | 'incomplete'
  | 'completed'
  | 'discarded';


export type MigraineEpisodeEntryPoint =
  | 'premonitory'
  | 'aura'
  | 'crisis'
  | 'postdrome'
  | 'retrospective';


export type EpisodeCompletionReason =
  | 'recovered'
  | 'phaseEndedWithoutCrisis'
  | 'auraWithoutPain'
  | 'crisisWithoutPostdrome'
  | 'retrospectiveRecord'
  | 'cancelled'
  | 'other';


// ------------------------------------------
// PREMONITORY
// ------------------------------------------

export type PremonitorySymptomCategory =
  | 'cognitive'
  | 'emotional'
  | 'energy'
  | 'sleep'
  | 'appetite'
  | 'digestive'
  | 'muscular'
  | 'sensory'
  | 'autonomic'
  | 'other';


export type PremonitorySymptom =
  // Cognitive
  | 'brainFog'
  | 'concentrationDifficulty'
  | 'mentalSlowness'
  | 'wordFindingDifficulty'
  | 'memoryDifficulty'
  | 'disconnectionFeeling'
  | 'clumsiness'

  // Emotional
  | 'moodChange'
  | 'irritability'
  | 'anxiety'
  | 'sadness'
  | 'apathy'
  | 'euphoria'
  | 'emotionalSensitivity'
  | 'restlessness'

  // Energy and sleep
  | 'fatigue'
  | 'sleepiness'
  | 'yawning'
  | 'insomnia'
  | 'unusualEnergy'
  | 'nonRestorativeSleep'

  // Appetite and digestion
  | 'foodCraving'
  | 'sweetCraving'
  | 'saltyCraving'
  | 'increasedHunger'
  | 'lossOfAppetite'
  | 'thirst'
  | 'mildNausea'
  | 'bowelChanges'

  // Muscular
  | 'neckStiffness'
  | 'neckPain'
  | 'jawTension'
  | 'shoulderTension'
  | 'trapeziusTension'
  | 'heavyNeckFeeling'

  // Sensory
  | 'lightSensitivity'
  | 'soundSensitivity'
  | 'smellSensitivity'
  | 'blurredVision'
  | 'coldFeeling'
  | 'chills'

  // Autonomic
  | 'frequentUrination'
  | 'fluidRetention'
  | 'sweating'
  | 'temperatureChange'
  | 'paleness'
  | 'nasalCongestion'

  // Compatibility
  | 'neckStiffness'
  | 'concentrationDifficulty';


export interface PremonitoryUpdateData {
  symptoms: PremonitorySymptom[];

  symptomsStillActive?: boolean;

  intensity?: PainIntensity;
}


export interface PremonitoryPhase {
  present: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  symptoms: PremonitorySymptom[];

  updates?: PhaseUpdate<PremonitoryUpdateData>[];

  hoursBeforeAttack?: number;

  evolvedToAura?: boolean;

  evolvedToCrisis?: boolean;

  endedWithoutCrisis?: boolean;

  notes?: string;
}


// ------------------------------------------
// AURA
// ------------------------------------------

export type AuraType =
  | 'visual'
  | 'sensory'
  | 'language'
  | 'motor'
  | 'vestibular';


export type VisualAura =
  | 'flashes'
  | 'zigzagLines'
  | 'blindSpots'
  | 'blurredVision'
  | 'tunnelVision'
  | 'visualSpots'
  | 'visualDistortion'
  | 'partialVisionLoss'
  | 'focusDifficulty'
  | 'objectsAppearLarger'
  | 'objectsAppearSmaller';


export type SensoryAura =
  | 'tingling'
  | 'numbness'
  | 'electricSensation'
  | 'reducedSensation'
  | 'spreadingParesthesia';


export type LanguageAura =
  | 'wordFindingDifficulty'
  | 'speechDifficulty'
  | 'languageUnderstandingDifficulty'
  | 'incorrectWords'
  | 'readingDifficulty'
  | 'writingDifficulty';


export type MotorAura =
  | 'handWeakness'
  | 'armWeakness'
  | 'facialWeakness'
  | 'coordinationDifficulty'
  | 'walkingDifficulty';


export type VestibularAura =
  | 'vertigo'
  | 'imbalance'
  | 'tinnitus'
  | 'doubleVision'
  | 'coordinationDifficulty'
  | 'faintFeeling';


export type AuraTiming =
  | 'beforePain'
  | 'duringPain'
  | 'afterPain'
  | 'withoutPain'
  | 'overlappingPain'
  | 'unknown';


export type BodySide =
  | 'left'
  | 'right'
  | 'bilateral'
  | 'alternating'
  | 'central'
  | 'unknown';


export interface AuraUpdateData {
  types: AuraType[];

  visualSymptoms: VisualAura[];

  sensorySymptoms: SensoryAura[];

  languageSymptoms: LanguageAura[];

  motorSymptoms: MotorAura[];

  vestibularSymptoms: VestibularAura[];

  symptomsStillActive?: boolean;
}


export interface AuraPhase {
  present: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  types: AuraType[];

  visualSymptoms: VisualAura[];

  sensorySymptoms: SensoryAura[];

  languageSymptoms: LanguageAura[];

  motorSymptoms?: MotorAura[];

  vestibularSymptoms?: VestibularAura[];

  updates?: PhaseUpdate<AuraUpdateData>[];

  durationMinutes?: number;

  timing?: AuraTiming;

  side?: BodySide;

  occurredWithoutPain?: boolean;

  notes?: string;
}


// ------------------------------------------
// PAIN LOCATION
// ------------------------------------------

export type PainLocation =
  // Compatibility values
  | 'front'
  | 'temple'
  | 'eye'
  | 'neck'
  | 'general'

  // Head
  | 'forehead'
  | 'rightTemple'
  | 'leftTemple'
  | 'bothTemples'
  | 'rightEyeArea'
  | 'leftEyeArea'
  | 'behindRightEye'
  | 'behindLeftEye'
  | 'topOfHead'
  | 'backOfHead'
  | 'baseOfSkull'
  | 'rightSideOfHead'
  | 'leftSideOfHead'
  | 'wholeHead'

  // Face and jaw
  | 'rightJaw'
  | 'leftJaw'
  | 'bothJaws'
  | 'rightCheek'
  | 'leftCheek'
  | 'sinusArea'
  | 'teeth'

  // Neck and upper body
  | 'rightNeck'
  | 'leftNeck'
  | 'centralNeck'
  | 'rightTrapezius'
  | 'leftTrapezius'
  | 'rightShoulder'
  | 'leftShoulder'
  | 'rightShoulderBlade'
  | 'leftShoulderBlade'

  // Other
  | 'diffuse'
  | 'other';


export type PainOrigin =
  | 'head'
  | 'eye'
  | 'temple'
  | 'jaw'
  | 'neck'
  | 'shoulder'
  | 'unknown';


export type PainSpreadPattern =
  | 'staysInPlace'
  | 'spreads'
  | 'changesSide'
  | 'risesFromNeck'
  | 'movesToNeck'
  | 'movesToShoulder'
  | 'startsBehindEye'
  | 'startsAtTemple'
  | 'startsAtNeck'
  | 'other'
  | 'unknown';


export interface PainLocationRecord {
  primary?: PainLocation;

  additional: PainLocation[];

  side?: BodySide;

  origin?: PainOrigin;

  spreadPattern?: PainSpreadPattern;

  notes?: string;
}


// ------------------------------------------
// CRISIS
// ------------------------------------------

export type PainQuality =
  | 'pulsating'
  | 'pressure'
  | 'stabbing'
  | 'burning'
  | 'electric'
  | 'throbbing'
  | 'piercing'
  | 'heavy'
  | 'explosive'
  | 'tightening'
  | 'other';


export type MigraineEventType =
  | 'intensity'
  | 'medication'
  | 'symptom'
  | 'location'
  | 'note';


export type CrisisSymptomCategory =
  | 'digestive'
  | 'sensory'
  | 'vestibular'
  | 'cognitive'
  | 'muscular'
  | 'autonomic'
  | 'emotional'
  | 'other';


export type CrisisSymptom =
  // Digestive
  | 'nausea'
  | 'vomiting'
  | 'abdominalPain'
  | 'diarrhea'
  | 'lossOfAppetite'
  | 'slowDigestion'

  // Sensory
  | 'lightSensitivity'
  | 'soundSensitivity'
  | 'smellSensitivity'
  | 'touchSensitivity'
  | 'allodynia'
  | 'blurredVision'
  | 'focusDifficulty'

  // Vestibular
  | 'dizziness'
  | 'vertigo'
  | 'imbalance'
  | 'movementSensation'
  | 'faintFeeling'

  // Cognitive
  | 'brainFog'
  | 'confusion'
  | 'speechDifficulty'
  | 'readingDifficulty'
  | 'workDifficulty'
  | 'disconnectionFeeling'

  // Muscular and cervical
  | 'neckPain'
  | 'neckStiffness'
  | 'jawTension'
  | 'jawPain'
  | 'trapeziusPain'
  | 'shoulderPain'
  | 'armTingling'
  | 'handWeakness'

  // Autonomic
  | 'tearing'
  | 'nasalCongestion'
  | 'runnyNose'
  | 'droopingEyelid'
  | 'facialSweating'
  | 'paleness'
  | 'chills'
  | 'heatFeeling'

  // Emotional
  | 'anxiety'
  | 'irritability'
  | 'fear'

  // Compatibility
  | 'neckPain'
  | 'jawTension';


export interface PainRecord {
  id?: string;

  time: string;

  intensity: PainIntensity;

  location?: PainLocationRecord;

  notes?: string;
}


export interface MigraineEvent {
  id: string;

  type: MigraineEventType;

  timestamp: string;

  data: Record<string, unknown>;
}


export interface CrisisUpdateData {
  intensity?: PainIntensity;

  location?: PainLocationRecord;

  quality?: PainQuality;

  symptoms?: CrisisSymptom[];

  unableToFunction?: boolean;
}


export interface CrisisPhase {
  active: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  startTime: string;

  endTime?: string;

  events: MigraineEvent[];

  updates?: PhaseUpdate<CrisisUpdateData>[];

  intensity: PainIntensity;

  intensityHistory: PainRecord[];

  location: PainLocation[];

  locationDetails?: PainLocationRecord;

  quality: PainQuality;

  symptoms: CrisisSymptom[];

  unableToFunction?: boolean;

  durationMinutes?: number;

  notes?: string;
}


// ------------------------------------------
// POSTDROME
// ------------------------------------------

export type PostdromeSymptomCategory =
  | 'energy'
  | 'cognitive'
  | 'sensory'
  | 'muscular'
  | 'emotional'
  | 'sleep'
  | 'digestive'
  | 'other';


export type PostdromeSymptom =
  // Energy
  | 'fatigue'
  | 'extremeExhaustion'
  | 'weakness'

  // Cognitive
  | 'brainFog'
  | 'concentrationDifficulty'
  | 'mentalSlowness'

  // Sensory
  | 'residualSensitivity'
  | 'lightSensitivity'
  | 'soundSensitivity'
  | 'smellSensitivity'
  | 'scalpTenderness'
  | 'residualPain'
  | 'dizziness'

  // Muscular
  | 'neckDiscomfort'
  | 'neckStiffness'
  | 'shoulderPain'

  // Emotional
  | 'moodChange'
  | 'sadness'
  | 'irritability'
  | 'euphoria'

  // Sleep
  | 'sleepiness'
  | 'excessiveSleep'
  | 'insomnia'

  // Digestive and general
  | 'hunger'
  | 'thirst'
  | 'hangoverFeeling'
  | 'difficultyReturningToActivities';


export type RecoveryLevel =
  | 'minimal'
  | 'partial'
  | 'mostlyRecovered'
  | 'fullyRecovered';


export interface PostdromeUpdateData {
  symptoms: PostdromeSymptom[];

  recoveryLevel?: RecoveryLevel;

  symptomsStillActive?: boolean;
}


export interface PostdromePhase {
  present: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  startTime?: string;

  endTime?: string;

  symptoms: PostdromeSymptom[];

  updates?: PhaseUpdate<PostdromeUpdateData>[];

  recoveryLevel?: RecoveryLevel;

  recoveryHours?: number;

  notes?: string;
}


// ------------------------------------------
// TRIGGERS
// ------------------------------------------

export type MigraineTrigger =
  | 'stress'
  | 'lackOfSleep'
  | 'excessSleep'
  | 'sleepChange'
  | 'fasting'
  | 'dehydration'
  | 'food'
  | 'chocolate'
  | 'iceCream'
  | 'fattyFood'
  | 'caffeine'
  | 'caffeineWithdrawal'
  | 'alcohol'
  | 'wine'
  | 'hormonal'
  | 'menstruation'
  | 'ovulation'
  | 'weather'
  | 'heat'
  | 'cold'
  | 'pressureChange'
  | 'smell'
  | 'sweetSmell'
  | 'noise'
  | 'brightLight'
  | 'screens'
  | 'physicalActivity'
  | 'posture'
  | 'neckTension'
  | 'travel'
  | 'unknown'
  | 'other';


export interface TriggerRecord {
  trigger: MigraineTrigger;

  notes?: string;

  confidence?: PainIntensity;
}


// ------------------------------------------
// TREATMENT
// ------------------------------------------

export type TreatmentEffectiveness =
  | 'none'
  | 'low'
  | 'medium'
  | 'high';


export type TreatmentType =
  | 'medication'
  | 'supplement'
  | 'hydration'
  | 'rest'
  | 'darkRoom'
  | 'cold'
  | 'heat'
  | 'stretching'
  | 'food'
  | 'other';


export interface Treatment {
  id?: string;

  type?: TreatmentType;

  medication?: string;

  dose?: string;

  takenAt?: string;

  takenAtTime?: PhaseTime;

  effectiveness?: TreatmentEffectiveness;

  responseTimeMinutes?: number;

  sideEffects?: string[];

  notes?: string;
}


// ------------------------------------------
// CONTEXT
// ------------------------------------------

export interface LifestyleContext {
  sleepHours?: number;

  sleepQuality?:
    | 'poor'
    | 'normal'
    | 'good';

  hydration?:
    | 'low'
    | 'normal'
    | 'high';

  stressLevel?: PainIntensity;

  physicalActivity?: boolean;

  menstrualCyclePhase?:
    | 'menstruation'
    | 'follicular'
    | 'ovulation'
    | 'luteal'
    | 'unknown';

  weatherNotes?: string;

  foodNotes?: string;
}


// ------------------------------------------
// IMPACT
// ------------------------------------------

export interface EpisodeImpact {
  interruptedActivities: boolean;

  missedWorkOrStudy: boolean;

  neededRest: boolean;

  neededDarkRoom: boolean;

  requiredHelp?: boolean;

  emergencyCare?: boolean;
}


// ------------------------------------------
// EPISODE TIMELINE
// ------------------------------------------

export interface MigraineTimeline {
  episodeStart?: string;

  episodeEnd?: string;

  premonitoryStart?: string;

  premonitoryEnd?: string;

  auraStart?: string;

  auraEnd?: string;

  crisisStart?: string;

  crisisEnd?: string;

  postdromeStart?: string;

  postdromeEnd?: string;

  episode?: PhaseTimeRange;

  premonitory?: PhaseTimeRange;

  aura?: PhaseTimeRange;

  crisis?: PhaseTimeRange;

  postdrome?: PhaseTimeRange;
}


// ------------------------------------------
// COMPLETE EPISODE
// ------------------------------------------

export interface MigraineEpisode {
  schemaVersion?: 6;

  id?: string;

  createdAt: string;

  updatedAt?: string;

  status: MigraineEpisodeStatus;

  entryPoint?: MigraineEpisodeEntryPoint;

  recordMode?: RecordMode;

  timeline?: MigraineTimeline;

  premonitory: PremonitoryPhase;

  aura: AuraPhase;

  crisis: CrisisPhase;

  postdrome: PostdromePhase;

  triggers: MigraineTrigger[];

  triggerRecords?: TriggerRecord[];

  treatment: Treatment;

  treatments?: Treatment[];

  lifestyle?: LifestyleContext;

  impact?: EpisodeImpact;

  completionReason?: EpisodeCompletionReason;

  notes?: string;
}