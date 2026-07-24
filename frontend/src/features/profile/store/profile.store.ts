import { create } from 'zustand';
import { persist } from 'zustand/middleware';


import type {
  UserProfile,
  MigraineHistory,
  MenstrualContext,
} from '../types/profile.types';








interface ProfileStore {


  profile:UserProfile;



  updateProfile:
    (
      profile:UserProfile
    ) => void;




  updateField:
    (
      field:keyof UserProfile,
      value:unknown
    ) => void;




  updateMigraineHistory:
    (
      migraineHistory:Partial<MigraineHistory>
    ) => void;




  updateMenstrualContext:
    (
      menstrual:Partial<MenstrualContext>
    ) => void;




  resetProfile:
    () => void;


}









const createInitialProfile =
():UserProfile => ({


  id:
    crypto.randomUUID(),



  createdAt:
    new Date().toISOString(),



  name:'',



  birthDate:'',



  sex:
    'preferNotToSay',



});









export const useProfileStore =
create<ProfileStore>()(


persist(


(set)=>( {


  profile:
    createInitialProfile(),







  updateProfile:
    (profile)=>


      set({


        profile,


      }),







  updateField:
    (
      field,
      value,
    ) =>


      set(state => ({


        profile:{


          ...state.profile,


          [field]:
            value,


        },


      })),









  updateMigraineHistory:
    (migraineHistory)=>


      set(state => ({


        profile:{


          ...state.profile,


          migraineHistory:{


            ...state.profile.migraineHistory,


            ...migraineHistory,


          },


        },


      })),









  updateMenstrualContext:
    (menstrual)=>


      set(state => ({


        profile:{


          ...state.profile,


          menstrual:{


            hasMenstrualCycle:


              state.profile.menstrual?.hasMenstrualCycle

              ??

              false,



            ...state.profile.menstrual,


            ...menstrual,


          },


        },


      })),









  resetProfile:
    () =>


      set({


        profile:
          createInitialProfile(),


      }),




}),



{


  name:
    'synara-profile-storage',


}



)


);