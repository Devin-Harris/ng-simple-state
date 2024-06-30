import { inject } from '@angular/core';
import { Action, createAction } from 'projects/libs/ngxss/src/lib/action';
import { Selector, createSelector } from 'projects/libs/ngxss/src/lib/selector';
import { Store, createStore } from 'projects/libs/ngxss/src/public-api';
import { AsyncLoadApiService } from './async-load-api.service';
import {
   CallState,
   Error,
   LoadingState,
   isErrorState,
} from './async-load-helper.model';

export type AsyncStoreType = Store<{
   entityName: string | null;
   entityId: number | null;
   callState: CallState;

   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;

   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;

export const AsyncLoadStore = createStore<AsyncStoreType>(
   {
      // Root State
      callState: LoadingState.Init,
      entityName: null,
      entityId: null,

      /**
       * Actions
       * Notice how you can utilize dependency injection in the state action callback
       * function parameters. These items should always be after the required parameters
       * so for actions that do not have props defined the signature should still
       * denote (state, ...rest of injection properties...) => ... but for actions with
       * props defined it should read (state, props, ...rest of injection properties...) => ...
       */
      loadEntity: createAction(
         async (state, props, apiService = inject(AsyncLoadApiService)) => {
            state.callState.set(LoadingState.Loading);
            try {
               const response = await apiService.getEntity(props.id);
               return state.loadEntitySuccess(response);
            } catch (error: any) {
               return state.loadEntityFailure({ error });
            }
         }
      ),
      loadEntitySuccess: createAction((state, props) =>
         state.patch({ ...props, callState: LoadingState.Loaded })
      ),
      loadEntityFailure: createAction((state, props) =>
         state.patch({ callState: { error: props.error } })
      ),

      // Selectors
      loading: createSelector(
         (state) => state.callState() === LoadingState.Loading
      ),
      error: createSelector((state) => {
         const callState = state.callState();
         return isErrorState(callState) ? callState.error : null;
      }),
   },
   { providedIn: 'root' }
);
