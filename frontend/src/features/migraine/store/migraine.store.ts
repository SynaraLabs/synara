import { create } from 'zustand';
import { persist } from 'zustand/middleware';


import type {

  MigraineEpisode,

  MigraineTimeline,

  PremonitoryPhase,

  AuraPhase,

  CrisisPhase,

  PostdromePhase,

  MigraineTrigger,

  Treatment,

  MigraineEpisodeStatus,

} from '../types/migraine.types';







interface MigraineStore {


  episode:MigraineEpisode;


  activeEpisode:MigraineEpisode | null;


  history:MigraineEpisode[];




  startEpisode:
    ()=>void;



  startCrisis:
    ()=>void;



  finishCrisis:
    ()=>void;




  updatePremonitory:
    (premonitory:PremonitoryPhase)=>void;



  updateAura:
    (aura:AuraPhase)=>void;



  updateCrisis:
    (crisis:CrisisPhase)=>void;



  updatePostdrome:
    (postdrome:PostdromePhase)=>void;



  updateTriggers:
    (triggers:MigraineTrigger[])=>void;



  updateTreatment:
    (treatment:Treatment)=>void;



  updateNotes:
    (notes:string)=>void;



  updateTimeline:
    (timeline:Partial<MigraineTimeline>)=>void;



  updateStatus:
    (status:MigraineEpisodeStatus)=>void;




  completeEpisode:
    ()=>void;



  clearHistory:
    ()=>void;



  resetEpisode:
    ()=>void;


}









const generateId = ()=>{


  if(

    typeof crypto !== 'undefined'

    &&

    crypto.randomUUID

  ){

    return crypto.randomUUID();

  }


  return Date.now().toString();


};









const createInitialEpisode =
():MigraineEpisode => ({


  id:
    generateId(),



  createdAt:
    new Date().toISOString(),



  status:
    'active' as MigraineEpisodeStatus,



  timeline:{},




  premonitory:{


    present:false,


    symptoms:[],


  },




  aura:{


    present:false,


    types:[],


    visualSymptoms:[],


    sensorySymptoms:[],


    languageSymptoms:[],


  },




  crisis:{


  active:false,


  startTime:'',


  intensity:0,


  intensityHistory:[],


  events:[],


  location:[],


  quality:'pressure',


  symptoms:[],


},




  postdrome:{


    present:false,


    symptoms:[],


  },




  triggers:[],



  treatment:{},


});









export const useMigraineStore = create<MigraineStore>()(


persist(


(set)=>(


{


episode:
createInitialEpisode(),



activeEpisode:null,



history:[],







startEpisode:()=>


set(()=>{


const episode =
createInitialEpisode();



return {


episode,


activeEpisode:episode,


};


}),

startCrisis:()=>


set(state=>{


const now =
new Date().toISOString();




const updatedEpisode = {


...state.episode,



status:
'crisis' as MigraineEpisodeStatus,




crisis:{


...state.episode.crisis,


active:true,


startTime:
state.episode.crisis.startTime
??
now,


},




timeline:{


...(state.episode.timeline ?? {}),


crisisStart:
state.episode.timeline?.crisisStart
??
now,


},



};





return {


episode:updatedEpisode,


activeEpisode:updatedEpisode,


};


}),







finishCrisis:()=>


set(state=>{


const now =
new Date().toISOString();





const updatedEpisode = {


...state.episode,



status:
'postdrome' as MigraineEpisodeStatus,




crisis:{


...state.episode.crisis,


active:false,


endTime:now,


},





postdrome:{


...state.episode.postdrome,


present:true,


},





timeline:{


...(state.episode.timeline ?? {}),


crisisEnd:now,


postdromeStart:now,


},



};






return {


episode:updatedEpisode,


activeEpisode:updatedEpisode,


};



}),

updatePremonitory:(premonitory)=>


set(state=>({


episode:{


...state.episode,


premonitory,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


premonitory,


}
:
null,


})),










updateAura:(aura)=>


set(state=>({


episode:{


...state.episode,


aura,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


aura,


}
:
null,


})),










updateCrisis:(crisis)=>


set(state=>({


episode:{


...state.episode,


crisis,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


crisis,


}
:
null,


})),










updatePostdrome:(postdrome)=>


set(state=>({


episode:{


...state.episode,


postdrome,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


postdrome,


}
:
null,


})),










updateTriggers:(triggers)=>


set(state=>({


episode:{


...state.episode,


triggers,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


triggers,


}
:
null,


})),










updateTreatment:(treatment)=>


set(state=>({


episode:{


...state.episode,


treatment,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


treatment,


}
:
null,


})),










updateNotes:(notes)=>


set(state=>({


episode:{


...state.episode,


notes,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


notes,


}
:
null,


})),










updateTimeline:(timeline)=>


set(state=>({


episode:{


...state.episode,



timeline:{


...state.episode.timeline,


...timeline,


},


},



activeEpisode:state.activeEpisode
?


{


...state.activeEpisode,



timeline:{


...state.activeEpisode.timeline,


...timeline,


},


}


:


null,


})),










updateStatus:(status)=>


set(state=>({


episode:{


...state.episode,


status,


},


activeEpisode:state.activeEpisode
?
{


...state.activeEpisode,


status,


}
:
null,


})),










completeEpisode:()=>


set(state=>{


const completed = {


...state.episode,



status:
'completed' as MigraineEpisodeStatus,



timeline:{


...state.episode.timeline,


episodeEnd:
new Date().toISOString(),


},


};





return {


history:[


...state.history,


completed,


],



episode:
createInitialEpisode(),



activeEpisode:null,


};


}),










clearHistory:()=>


set({


history:[],


}),










resetEpisode:()=>


set({


episode:
createInitialEpisode(),


activeEpisode:null,


}),










}


),


{


name:'synara-migraine-storage',


}


)


);