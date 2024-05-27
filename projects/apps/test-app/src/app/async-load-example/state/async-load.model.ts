import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface Error {
   message: string;
}

export enum LoadingState {
   Init,
   Loading,
   Loaded,
}
export type ErrorState = { error: Error };
export type CallState = LoadingState | ErrorState;
function isErrorState(callstate: CallState): callstate is ErrorState {
   // @ts-ignore
   return !!callstate.error;
}

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
