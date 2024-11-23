import { inject } from '@angular/core';
import {
   Action,
   createAction,
   Store,
   store,
} from 'projects/libs/ngxss/src/public-api';
import { AsyncLoadApiService } from './async-load-api.service';
import { callStateStoreInput, LoadingState } from './call-state.model';

export const CallStateStore = store.injectable(callStateStoreInput);

export type NestedAsyncStoreType = Store<{
   // State slices
   callStateStore: typeof CallStateStore;

   // Root State
   entityName: string | null;
   entityId: number | null;

   // Actions
   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;

export const AsyncLoadWithCallStateStore =
   store.injectable<NestedAsyncStoreType>({
      // Store slices
      callStateStore: CallStateStore,

      // Root State
      entityName: null,
      entityId: null,

      // Actions
      loadEntity: createAction(async (state, props) => {
         const apiService = inject(AsyncLoadApiService);
         state.callStateStore.setLoading();
         try {
            const response = await apiService.getEntity(props.id);
            return state.loadEntitySuccess(response);
         } catch (error: any) {
            return state.loadEntityFailure({ error });
         }
      }),
      loadEntitySuccess: createAction((state, props) => {
         state.patch({
            ...props,
            callStateStore: { callState: LoadingState.Loaded },
         });
      }),
      loadEntityFailure: createAction((state, { error }) => {
         state.callStateStore.setError({ error });
      }),
   });
