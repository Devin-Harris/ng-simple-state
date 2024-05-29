import {
   StateEffect,
   createStateEffect,
} from 'projects/libs/ngx-simple-state/src/lib/state-effect';
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

   loadEntity: StateEffect<State, { id: number }>;
   loadEntitySuccess: StateEffect<
      State,
      { entityName: string; entityId: number }
   >;
   loadEntityFailure: StateEffect<State, { error: Error }>;

   loading: StateSelector<State, boolean>;
   error: StateSelector<State, Error | null>;
}

export const initialValue: State = {
   // Root State
   callState: LoadingState.Init,
   entityName: null,
   entityId: null,

   // Effects
   loadEntity: createStateEffect((state, props) =>
      state.callState.set(LoadingState.Loading)
   ),
   loadEntitySuccess: createStateEffect((state, props) =>
      state.patch({ ...props, callState: LoadingState.Loaded })
   ),
   loadEntityFailure: createStateEffect((state, props) =>
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
