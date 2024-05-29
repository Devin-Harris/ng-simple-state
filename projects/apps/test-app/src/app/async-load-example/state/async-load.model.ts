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

   loading: StateSelector<State, boolean>;
   error: StateSelector<State, Error | null>;
}

export const initialValue: State = {
   callState: LoadingState.Init,
   entityName: null,
   entityId: null,

   loading: createStateSelector(
      (state) => state.callState() === LoadingState.Loading
   ),
   error: createStateSelector((state) => {
      const callState = state.callState();
      return isErrorState(callState) ? callState.error : null;
   }),
};
