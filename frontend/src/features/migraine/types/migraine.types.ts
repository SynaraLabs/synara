// ==========================================
// SYNARA MIGRAINE DOMAIN MODEL v7 FOUNDATION
// ==========================================
//
// Principles:
// - Every phase can exist independently.
// - Records can be created in real time or retrospectively.
// - Dates can be exact, approximate or unknown.
// - Active phases can receive multiple updates.
// - Anatomical region and laterality are separate.
// - Clinical vocabularies can be shared across phases.
// - Previous v6 fields remain available during migration.
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


export type ClinicalPhase =
  | 'premonitory'
  | 'aura'
  | 'crisis'
  | 'postdrome';


export type ClinicalSymptomCategory =
  | 'cognitive'
  | 'emotional'
  | 'energy'
  | 'sleep'
  | 'appetite'
  | 'digestive'
  | 'musculoskeletal'
  | 'sensory'
  | 'visual'
  | 'language'
  | 'motor'
  | 'vestibular'
  | 'autonomic'
  | 'pain'
  | 'general'
  | 'other';


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
// CLINICAL SYMPTOM VOCABULARY
// ------------------------------------------

export interface SymptomDefinition<
  TSymptom extends string = string,
> {
  value: TSymptom;

  label: string;

  category: ClinicalSymptomCategory;

  phases: ClinicalPhase[];

  description?: string;

  searchTerms?: string[];

  frequent?: boolean;

  uncommon?: boolean;

  requiresClinicalAttention?: boolean;

  clinicalAttentionMessage?: string;
}


export interface SymptomSelection<
  TSymptom extends string = string,
> {
  symptom: TSymptom;

  intensity?: PainIntensity;

  side?: BodySide;

  firstObservedAt?: PhaseTime;

  stillPresent?: boolean;

  notes?: string;
}


export interface CustomSymptomRecord {
  id: string;

  label: string;

  category?: ClinicalSymptomCategory;

  phase: ClinicalPhase;

  intensity?: PainIntensity;

  side?: BodySide;

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
// BODY SIDE
// ------------------------------------------

export type BodySide =
  | 'left'
  | 'right'
  | 'bilateral'
  | 'alternating'
  | 'central'
  | 'unknown';


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
  | 'nasalCongestion';


/*
 * Expanded vocabulary prepared for the
 * clinical catalogue. It is not used by
 * the current selectors yet.
 */
export type ExtendedPremonitorySymptom =
  | PremonitorySymptom

  // Pain and pressure
  | 'mildHeadache'
  | 'headPressure'
  | 'eyePressure'
  | 'earPressure'
  | 'facialPressure'

  // Additional cognitive
  | 'decisionDifficulty'
  | 'reducedAttention'
  | 'slowReaction'
  | 'spatialDisorientation'

  // Additional digestive
  | 'constipation'
  | 'diarrhea'
  | 'abdominalBloating'
  | 'indigestion'
  | 'specificFoodAversion'

  // Additional sensory and vestibular
  | 'dizziness'
  | 'imbalance'
  | 'visualDiscomfort'
  | 'skinSensitivity'
  | 'earFullness'
  | 'tinnitus'

  // Additional general symptoms
  | 'muscleAches'
  | 'bodyHeaviness'
  | 'generalWeakness'
  | 'reducedCoordination';


export interface PremonitoryUpdateData {
  symptoms: PremonitorySymptom[];

  clinicalSymptoms?: SymptomSelection<
    ExtendedPremonitorySymptom
  >[];

  symptomsStillActive?: boolean;

  intensity?: PainIntensity;
}


export interface PremonitoryPhase {
  present: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  symptoms: PremonitorySymptom[];

  clinicalSymptoms?: SymptomSelection<
    ExtendedPremonitorySymptom
  >[];

  customSymptoms?: CustomSymptomRecord[];

  updates?: PhaseUpdate<
    PremonitoryUpdateData
  >[];

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


export type ExtendedVisualAura =
  | VisualAura
  | 'scintillatingScotoma'
  | 'fortificationSpectra'
  | 'shimmeringVision'
  | 'wavyVision'
  | 'fragmentedVision'
  | 'colorDistortion'
  | 'visualSnow'
  | 'temporaryMonocularVisionLoss'
  | 'temporaryHemifieldLoss';


export type SensoryAura =
  | 'tingling'
  | 'numbness'
  | 'electricSensation'
  | 'reducedSensation'
  | 'spreadingParesthesia';


export type ExtendedSensoryAura =
  | SensoryAura
  | 'facialTingling'
  | 'tongueNumbness'
  | 'lipNumbness'
  | 'handTingling'
  | 'armTingling'
  | 'legTingling'
  | 'unilateralSensorySpread'
  | 'alteredTemperatureSensation';


export type LanguageAura =
  | 'wordFindingDifficulty'
  | 'speechDifficulty'
  | 'languageUnderstandingDifficulty'
  | 'incorrectWords'
  | 'readingDifficulty'
  | 'writingDifficulty';


export type ExtendedLanguageAura =
  | LanguageAura
  | 'slurredSpeech'
  | 'inabilityToSpeak'
  | 'sentenceFormationDifficulty'
  | 'repetitionDifficulty'
  | 'nameRecognitionDifficulty';


export type MotorAura =
  | 'handWeakness'
  | 'armWeakness'
  | 'facialWeakness'
  | 'coordinationDifficulty'
  | 'walkingDifficulty';


export type ExtendedMotorAura =
  | MotorAura
  | 'legWeakness'
  | 'oneSidedWeakness'
  | 'reducedGripStrength'
  | 'fineMotorDifficulty';


export type VestibularAura =
  | 'vertigo'
  | 'imbalance'
  | 'tinnitus'
  | 'doubleVision'
  | 'coordinationDifficulty'
  | 'faintFeeling';


export type ExtendedVestibularAura =
  | VestibularAura
  | 'oscillopsia'
  | 'motionSensitivity'
  | 'tiltingSensation'
  | 'floatingSensation'
  | 'earFullness'
  | 'hearingChange';


export type AuraClinicalSymptom =
  | ExtendedVisualAura
  | ExtendedSensoryAura
  | ExtendedLanguageAura
  | ExtendedMotorAura
  | ExtendedVestibularAura;


export type AuraTiming =
  | 'beforePain'
  | 'duringPain'
  | 'afterPain'
  | 'withoutPain'
  | 'overlappingPain'
  | 'unknown';


export interface AuraUpdateData {
  types: AuraType[];

  visualSymptoms: VisualAura[];

  sensorySymptoms: SensoryAura[];

  languageSymptoms: LanguageAura[];

  motorSymptoms: MotorAura[];

  vestibularSymptoms: VestibularAura[];

  clinicalSymptoms?: SymptomSelection<
    AuraClinicalSymptom
  >[];

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

  clinicalSymptoms?: SymptomSelection<
    AuraClinicalSymptom
  >[];

  customSymptoms?: CustomSymptomRecord[];

  updates?: PhaseUpdate<
    AuraUpdateData
  >[];

  durationMinutes?: number;

  timing?: AuraTiming;

  side?: BodySide;

  occurredWithoutPain?: boolean;

  notes?: string;
}


// ------------------------------------------
// LEGACY PAIN LOCATION
// ------------------------------------------
//
// These values remain available while
// current components are migrated.
//

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


// ------------------------------------------
// ANATOMICAL PAIN MAPPING v7
// ------------------------------------------

export type PainRegionCategory =
  | 'head'
  | 'eye'
  | 'face'
  | 'ear'
  | 'jaw'
  | 'neck'
  | 'upperBody'
  | 'diffuse'
  | 'other';


export type PainAnatomicalRegion =
  // Head
  | 'forehead'
  | 'temple'
  | 'crown'
  | 'parietal'
  | 'occipital'
  | 'baseOfSkull'
  | 'wholeHead'

  // Eye
  | 'aroundEye'
  | 'behindEye'
  | 'eyebrow'
  | 'eyeSocket'

  // Face
  | 'cheek'
  | 'sinus'
  | 'nose'
  | 'face'
  | 'teeth'

  // Ear and jaw
  | 'ear'
  | 'aroundEar'
  | 'jaw'
  | 'temporomandibularJoint'

  // Neck and upper body
  | 'upperNeck'
  | 'middleNeck'
  | 'lowerNeck'
  | 'trapezius'
  | 'shoulder'
  | 'shoulderBlade'

  // Other
  | 'diffuse'
  | 'other';


export type PainLocationRole =
  | 'primary'
  | 'additional'
  | 'origin'
  | 'radiationTarget';


export interface PainLocationPoint {
  region: PainAnatomicalRegion;

  category?: PainRegionCategory;

  side?: BodySide;

  role?: PainLocationRole;

  intensity?: PainIntensity;

  notes?: string;
}


export type PainRadiationDirection =
  | 'frontToBack'
  | 'backToFront'
  | 'eyeToTemple'
  | 'templeToEye'
  | 'headToNeck'
  | 'neckToHead'
  | 'neckToShoulder'
  | 'shoulderToNeck'
  | 'changesSide'
  | 'diffuseSpread'
  | 'other'
  | 'unknown';


export interface PainRadiationPath {
  from: PainLocationPoint;

  to: PainLocationPoint;

  direction?:
    PainRadiationDirection;

  notes?: string;
}


export interface AnatomicalPainMap {
  primary?: PainLocationPoint;

  additional: PainLocationPoint[];

  origin?: PainLocationPoint;

  radiation?: PainRadiationPath[];

  spreadPattern?: PainSpreadPattern;

  changesSide?: boolean;

  notes?: string;
}


// ------------------------------------------
// COMPATIBLE LOCATION RECORD
// ------------------------------------------

export interface PainLocationRecord {
  /*
   * Legacy fields used by the current
   * interface.
   */
  primary?: PainLocation;

  additional: PainLocation[];

  side?: BodySide;

  origin?: PainOrigin;

  spreadPattern?: PainSpreadPattern;

  notes?: string;

  /*
   * New structured anatomical model.
   */
  anatomicalMap?: AnatomicalPainMap;

  anatomicalPoints?: PainLocationPoint[];

  onsetPoint?: PainLocationPoint;

  radiationPaths?:
    PainRadiationPath[];

  changedOverTime?: boolean;
}


export interface PainLocationSnapshot {
  id: string;

  occurredAt: PhaseTime;

  location: PainLocationRecord;

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
  | 'fear';


export type ExtendedCrisisSymptom =
  | CrisisSymptom

  // Additional digestive
  | 'constipation'
  | 'abdominalBloating'
  | 'reflux'
  | 'foodAversion'
  | 'inabilityToEat'
  | 'inabilityToDrink'

  // Additional sensory
  | 'scalpTenderness'
  | 'facialSensitivity'
  | 'temperatureSensitivity'
  | 'visualDistortion'
  | 'doubleVision'
  | 'eyePain'
  | 'earFullness'
  | 'tinnitus'

  // Additional vestibular
  | 'motionSensitivity'
  | 'floatingSensation'
  | 'tiltingSensation'
  | 'walkingInstability'

  // Additional cognitive
  | 'mentalSlowness'
  | 'memoryDifficulty'
  | 'wordFindingDifficulty'
  | 'decisionDifficulty'
  | 'timePerceptionChange'
  | 'depersonalization'
  | 'derealization'

  // Additional muscular and motor
  | 'facialTingling'
  | 'facialWeakness'
  | 'armWeakness'
  | 'legWeakness'
  | 'generalWeakness'
  | 'reducedGripStrength'
  | 'muscleTremor'

  // Additional autonomic
  | 'eyelidSwelling'
  | 'facialRedness'
  | 'coldSweating'
  | 'palpitations'
  | 'temperatureFluctuation'
  | 'frequentUrination'

  // Additional emotional
  | 'panic'
  | 'agitation'
  | 'emotionalSensitivity';


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

  anatomicalLocation?:
    AnatomicalPainMap;

  quality?: PainQuality;

  symptoms?: CrisisSymptom[];

  clinicalSymptoms?: SymptomSelection<
    ExtendedCrisisSymptom
  >[];

  unableToFunction?: boolean;
}


export interface CrisisPhase {
  active: boolean;

  status?: PhaseStatus;

  time?: PhaseTimeRange;

  startTime: string;

  endTime?: string;

  events: MigraineEvent[];

  updates?: PhaseUpdate<
    CrisisUpdateData
  >[];

  intensity: PainIntensity;

  intensityHistory: PainRecord[];

  location: PainLocation[];

  locationDetails?:
    PainLocationRecord;

  anatomicalLocation?:
    AnatomicalPainMap;

  locationHistory?:
    PainLocationSnapshot[];

  quality: PainQuality;

  symptoms: CrisisSymptom[];

  clinicalSymptoms?: SymptomSelection<
    ExtendedCrisisSymptom
  >[];

  customSymptoms?: CustomSymptomRecord[];

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


export type ExtendedPostdromeSymptom =
  | PostdromeSymptom

  // Additional energy and general
  | 'generalWeakness'
  | 'bodyHeaviness'
  | 'reducedStamina'
  | 'dehydrationFeeling'
  | 'bodyAches'

  // Additional cognitive
  | 'memoryDifficulty'
  | 'wordFindingDifficulty'
  | 'decisionDifficulty'
  | 'slowReaction'
  | 'disconnectionFeeling'

  // Additional sensory
  | 'visualDiscomfort'
  | 'blurredVision'
  | 'residualVisualDisturbance'
  | 'motionSensitivity'
  | 'imbalance'
  | 'earFullness'
  | 'tinnitus'

  // Additional muscular
  | 'jawTension'
  | 'trapeziusPain'
  | 'shoulderTension'

  // Additional emotional
  | 'anxiety'
  | 'apathy'
  | 'emotionalSensitivity'

  // Additional digestive
  | 'nausea'
  | 'lossOfAppetite'
  | 'increasedHunger'
  | 'indigestion';


export type RecoveryLevel =
  | 'minimal'
  | 'partial'
  | 'mostlyRecovered'
  | 'fullyRecovered';


export interface PostdromeUpdateData {
  symptoms: PostdromeSymptom[];

  clinicalSymptoms?: SymptomSelection<
    ExtendedPostdromeSymptom
  >[];

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

  clinicalSymptoms?: SymptomSelection<
    ExtendedPostdromeSymptom
  >[];

  customSymptoms?: CustomSymptomRecord[];

  updates?: PhaseUpdate<
    PostdromeUpdateData
  >[];

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
  /*
   * The store still persists schema 6.
   * Schema 7 becomes active after the
   * migration step.
   */
  schemaVersion?: 6 | 7;

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

  completionReason?:
    EpisodeCompletionReason;

  notes?: string;
}