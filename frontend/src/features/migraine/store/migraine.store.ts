import { create } from 'zustand';
import { persist } from 'zustand/middleware';


import type {
  MigraineEpisode,
  PremonitoryPhase,
  AuraPhase,
  CrisisPhase,
  PostdromePhase,
  MigraineTrigger,
  Treatment,
} from '../types/migraine.types';





interface MigraineStore {


  episode:MigraineEpisode;


  history:MigraineEpisode[];




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


  completeEpisode:
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



history:[],







updatePremonitory:
(premonitory)=>

set(state=>({

episode:{

...state.episode,

premonitory,

},

})),








updateAura:
(aura)=>

set(state=>({

episode:{

...state.episode,

aura,

},

})),








updateCrisis:
(crisis)=>

set(state=>({

episode:{

...state.episode,

crisis,

},

})),








updatePostdrome:
(postdrome)=>

set(state=>({

episode:{

...state.episode,

postdrome,

},

})),








updateTriggers:
(triggers)=>

set(state=>({

episode:{

...state.episode,

triggers,

},

})),








updateTreatment:
(treatment)=>

set(state=>({

episode:{

...state.episode,

treatment,

},

})),








updateNotes:
(notes)=>

set(state=>({

episode:{

...state.episode,

notes,

},

})),










completeEpisode:
()=>


set(state=>{



const crisis =
state.episode.crisis;



let completedCrisis =
crisis;




if(
crisis.startTime
&&
crisis.endTime
){


const start =
new Date(
crisis.startTime,
).getTime();



const end =
new Date(
crisis.endTime,
).getTime();




completedCrisis={


...crisis,


durationMinutes:

Math.max(

0,

Math.round(
(end-start)/(1000*60)
)

),


};

}



const completedEpisode:MigraineEpisode={


...state.episode,


id:
generateId(),


createdAt:
new Date().toISOString(),


crisis:
completedCrisis,


};





return{


history:[

...state.history,

completedEpisode,

],



episode:
createInitialEpisode(),


};



}),







resetEpisode:
()=>


set({

episode:
createInitialEpisode(),

}),



}

),


{


name:
'synara-migraine-storage',


}


)


);