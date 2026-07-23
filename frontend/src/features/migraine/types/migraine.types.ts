// ===============================
// SYNARA MIGRAINE DOMAIN MODEL v3
// ===============================


// -------------------------------
// GENERAL
// -------------------------------

export type PainIntensity =
  | 0 | 1 | 2 | 3 | 4
  | 5 | 6 | 7 | 8 | 9 | 10;



// -------------------------------
// PREMONITORY
// -------------------------------

export type PremonitorySymptom =
  | 'fatigue'
  | 'yawning'
  | 'moodChange'
  | 'irritability'
  | 'brainFog'
  | 'foodCraving'
  | 'neckStiffness'
  | 'thirst'
  | 'sleepiness'
  | 'concentrationDifficulty';



export interface PremonitoryPhase {

  present:boolean;

  symptoms:PremonitorySymptom[];

  hoursBeforeAttack?:number;

  notes?:string;

}



// -------------------------------
// AURA
// -------------------------------


export type AuraType =
  | 'visual'
  | 'sensory'
  | 'language';



export type VisualAura =
  | 'flashes'
  | 'zigzagLines'
  | 'blindSpots'
  | 'blurredVision';



export type SensoryAura =
  | 'tingling'
  | 'numbness'
  | 'electricSensation';



export type LanguageAura =
  | 'wordFindingDifficulty'
  | 'speechDifficulty';



export type AuraTiming =
  | 'beforePain'
  | 'duringPain'
  | 'afterPain';



export interface AuraPhase {

  present:boolean;

  types:AuraType[];

  visualSymptoms:VisualAura[];

  sensorySymptoms:SensoryAura[];

  languageSymptoms:LanguageAura[];

  durationMinutes?:number;

  timing?:AuraTiming;

}



// -------------------------------
// CRISIS
// -------------------------------


export type PainLocation =
  | 'front'
  | 'temple'
  | 'eye'
  | 'neck'
  | 'general';



export type PainQuality =
  | 'pulsating'
  | 'pressure'
  | 'stabbing'
  | 'burning';



export type CrisisSymptom =
  | 'nausea'
  | 'vomiting'
  | 'lightSensitivity'
  | 'soundSensitivity'
  | 'smellSensitivity'
  | 'dizziness'
  | 'confusion'
  | 'neckPain'
  | 'jawTension';



export interface PainRecord {

  time:string;

  intensity:PainIntensity;

}



export interface CrisisPhase {

  active:boolean;

  startTime:string;

  intensity:PainIntensity;

  intensityHistory: PainRecord[];

  location: PainLocation[];

  quality: PainQuality;

  symptoms:CrisisSymptom[];

  unableToFunction?:boolean;

  durationMinutes?:number;

}



// -------------------------------
// POSTDROME
// -------------------------------


export type PostdromeSymptom =
  | 'fatigue'
  | 'brainFog'
  | 'weakness'
  | 'moodChange'
  | 'residualSensitivity'
  | 'neckDiscomfort';



export interface PostdromePhase {

  present:boolean;

  symptoms:PostdromeSymptom[];

  recoveryHours?:number;

}



// -------------------------------
// TRIGGERS
// -------------------------------


export type MigraineTrigger =
  | 'stress'
  | 'lackOfSleep'
  | 'food'
  | 'caffeine'
  | 'alcohol'
  | 'hormonal'
  | 'weather'
  | 'smell'
  | 'noise'
  | 'unknown';



// -------------------------------
// TREATMENT
// -------------------------------


export type TreatmentEffectiveness =
  | 'none'
  | 'low'
  | 'medium'
  | 'high';



export interface Treatment {

  medication?:string;

  dose?:string;

  takenAt?:string;

  effectiveness?:TreatmentEffectiveness;

  responseTimeMinutes?:number;

}



// -------------------------------
// CONTEXT
// -------------------------------


export interface LifestyleContext {

  sleepHours?:number;

  sleepQuality?:
    | 'poor'
    | 'normal'
    | 'good';


  hydration?:
    | 'low'
    | 'normal'
    | 'high';


  stressLevel?:PainIntensity;


  physicalActivity?:boolean;


  menstrualCyclePhase?:
    | 'menstruation'
    | 'follicular'
    | 'ovulation'
    | 'luteal'
    | 'unknown';

}



// -------------------------------
// IMPACT
// -------------------------------


export interface EpisodeImpact {

  interruptedActivities:boolean;

  missedWorkOrStudy:boolean;

  neededRest:boolean;

  neededDarkRoom:boolean;

}



// -------------------------------
// COMPLETE EPISODE
// -------------------------------


export interface MigraineEpisode {

  id?:string;

  createdAt:string;


  premonitory:PremonitoryPhase;


  aura:AuraPhase;


  crisis:CrisisPhase;


  postdrome:PostdromePhase;


  triggers:MigraineTrigger[];


  treatment:Treatment;


  lifestyle?:LifestyleContext;


  impact?:EpisodeImpact;


  notes?:string;

}