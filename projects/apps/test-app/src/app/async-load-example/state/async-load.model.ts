import { inject } from '@angular/core';
import {
   StateAction,
   createStateAction,
} from 'projects/libs/ngx-simple-state/src/lib/state-action';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
import { stateSignal } from 'projects/libs/ngx-simple-state/src/public-api';
import { AsyncLoadApiService } from './async-load-api.service';
import {
   CallState,
   Error,
   LoadingState,
   isErrorState,
} from './async-load-helper.model';

export interface State {
   entityName: string | null;
   entityId: number | null;
   callState: CallState;

   loadEntity: StateAction<State, { id: number }>;
   loadEntitySuccess: StateAction<
      State,
      { entityName: string; entityId: number }
   >;
   loadEntityFailure: StateAction<State, { error: Error }>;

   loading: StateSelector<State, boolean>;
   error: StateSelector<State, Error | null>;
}

export const AsyncLoadStore = stateSignal<State>(
   {
      // Root State
      callState: LoadingState.Init,
      entityName: null,
      entityId: null,

      // Actions
      // Notice how you can utilize dependency injection in the state action callback
      // function parameters. These items should always be after the second parameter
      // so for actions that do not have props defined the signature should still
      // denote (state, _, ...rest of injection properties...) => ...
      loadEntity: createStateAction(
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
      loadEntitySuccess: createStateAction((state, props) =>
         state.patch({ ...props, callState: LoadingState.Loaded })
      ),
      loadEntityFailure: createStateAction((state, props) =>
         state.patch({ callState: { error: props.error } })
      ),

      // Selectors
      loading: createStateSelector(
         (state) => state.callState() === LoadingState.Loading
      ),
      error: createStateSelector((state) => {
         const callState = state.callState();
         return isErrorState(callState) ? callState.error : null;
      }),
   },
   { providedIn: 'root' }
);
