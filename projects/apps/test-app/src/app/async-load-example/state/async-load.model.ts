import {
   StateAction,
   createStateAction,
} from 'projects/libs/ngx-simple-state/src/lib/state-action';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
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

export const initialValue: State = {
   // Root State
   callState: LoadingState.Init,
   entityName: null,
   entityId: null,

   // Actions
   loadEntity: createStateAction((state, props) =>
      state.callState.set(LoadingState.Loading)
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
};
