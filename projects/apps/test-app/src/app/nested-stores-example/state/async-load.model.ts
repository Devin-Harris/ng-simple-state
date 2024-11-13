import { inject } from '@angular/core';
import {
   Action,
   State,
   StateSignal,
   createAction,
   createInjectableState,
   createState,
} from 'projects/libs/ngxss/src/public-api';
import { AsyncLoadApiService } from './async-load-api.service';
import {
   CallStateStateType,
   LoadingState,
   callStateStateInput,
} from './call-state.model';

export type NestedAsyncStateType = State<{
   // State slices
   callStateStore: StateSignal<CallStateStateType>;

   // Root State
   entityName: string | null;
   entityId: number | null;

   // Actions
   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;

export const AsyncLoadWithCallStateStore =
   createInjectableState<NestedAsyncStateType>(
      {
         // Store slices
         callStateStore: createState(callStateStateInput),

         // Root State
         entityName: null,
         entityId: null,

         // Actions
         loadEntity: createAction(
            async (state, props, apiService = inject(AsyncLoadApiService)) => {
               state.callStateStore.setLoading();
               try {
                  const response = await apiService.getEntity(props.id);
                  return state.loadEntitySuccess(response);
               } catch (error: any) {
                  return state.loadEntityFailure({ error });
               }
            }
         ),
         loadEntitySuccess: createAction((state, props) => {
            state.patch({
               ...props,
               callStateStore: { callState: LoadingState.Loaded },
            });
         }),
         loadEntityFailure: createAction((state, { error }) => {
            state.callStateStore.setError({ error });
         }),
      },
      {
         providedIn: 'root',
      }
   );
