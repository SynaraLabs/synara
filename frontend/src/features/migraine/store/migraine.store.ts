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


  episode: MigraineEpisode;



  updatePremonitory: (
    premonitory: PremonitoryPhase,
  ) => void;



  updateAura: (
    aura: AuraPhase,
  ) => void;



  updateCrisis: (
    crisis: CrisisPhase,
  ) => void;



  updatePostdrome: (
    postdrome: PostdromePhase,
  ) => void;



  updateTriggers: (
    triggers: MigraineTrigger[],
  ) => void;



  updateTreatment: (
    treatment: Treatment,
  ) => void;



  updateNotes: (
    notes:string,
  ) => void;



  completeEpisode: () => void;



  resetEpisode: () => void;


}







const initialEpisode =
():MigraineEpisode => ({


  id:undefined,


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







console.log("STORE SYNARA ACTIVO");

export const useMigraineStore = create<MigraineStore>()(


  persist(


    (set) => ({


      episode:
        initialEpisode(),





      updatePremonitory:

        (premonitory) =>

          set(state => ({


            episode:{


              ...state.episode,


              premonitory,


            },


          })),







      updateAura:

        (aura) =>

          set(state => ({


            episode:{


              ...state.episode,


              aura,


            },


          })),







      updateCrisis:

        (crisis) =>

          set(state => ({


            episode:{


              ...state.episode,


              crisis,


            },


          })),







      updatePostdrome:

        (postdrome) =>

          set(state => ({


            episode:{


              ...state.episode,


              postdrome,


            },


          })),







      updateTriggers:

        (triggers) =>

          set(state => ({


            episode:{


              ...state.episode,


              triggers,


            },


          })),







      updateTreatment:

        (treatment) =>

          set(state => ({


            episode:{


              ...state.episode,


              treatment,


            },


          })),







      updateNotes:

        (notes) =>

          set(state => ({


            episode:{


              ...state.episode,


              notes,


            },


          })),







      completeEpisode:


        () =>

          set(state => ({


            episode:{


              ...state.episode,


              crisis:{


                ...state.episode.crisis,


                active:false,


              },


            },


          })),







      resetEpisode:


        () =>

          set({


            episode:
              initialEpisode(),


          }),



    }),


    {


      name:
        'synara-migraine-storage',


    }


  )


);