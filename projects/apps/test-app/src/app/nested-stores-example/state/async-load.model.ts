import { inject } from '@angular/core';
import {
   Action,
   createAction,
} from 'projects/libs/ngx-simple-state/src/lib/action';
import {
   StoreSlice,
   createStoreSlice,
   store,
} from 'projects/libs/ngx-simple-state/src/public-api';
import { AsyncLoadApiService } from './async-load-api.service';
import {
   CallStateStore,
   LoadingState,
   callStateStoreInitialValue,
} from './call-state.model';

export interface State {
   callStateStore: StoreSlice<CallStateStore>;

   entityName: string | null;
   entityId: number | null;

   loadEntity: Action<State, { id: number }>;
   loadEntitySuccess: Action<State, { entityName: string; entityId: number }>;
   loadEntityFailure: Action<State, { error: Error }>;
}

export const AsyncLoadWithCallStateStore = store<State>(
   {
      // Store slices
      callStateStore: createStoreSlice(callStateStoreInitialValue),

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
