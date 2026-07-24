// ===============================
// SYNARA USER PROFILE DOMAIN v1
// ===============================


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



export interface MigraineHistory {


  onsetAge?: number;


  diagnosed?: boolean;


  type?: MigraineType;


  monthlyFrequency?: number;


  usualDurationHours?: number;


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


  hasMenstrualCycle:boolean;


  averageCycleDays?:number;


  lastPeriodDate?:string;


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



export interface LifestyleProfile {


  averageSleepHours?:number;


  caffeineConsumption?:
    ConsumptionLevel;



  alcoholConsumption?:
    ConsumptionLevel;



  physicalActivity?:
    | 'none'
    | 'low'
    | 'medium'
    | 'high';



}



// -------------------------------
// EMOTIONAL CONTEXT
// -------------------------------


export interface EmotionalContext {


  anxietyHistory?:boolean;


  baselineStress?:number;


}



// -------------------------------
// COMPLETE PROFILE
// -------------------------------


export interface UserProfile {


  id:string;


  createdAt:string;



  // Personal

  name:string;


  birthDate:string;


  sex:UserSex;



  // Medical context

  migraineHistory?:MigraineHistory;



  menstrual?:MenstrualContext;



  lifestyle?:LifestyleProfile;



  emotionalContext?:EmotionalContext;



}