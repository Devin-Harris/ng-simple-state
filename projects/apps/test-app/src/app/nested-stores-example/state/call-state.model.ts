import {
   Action,
   Selector,
   StoreSignalInput,
   createAction,
   createSelector,
} from 'projects/libs/ngx-simple-state/src/public-api';

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
export function isErrorState(callstate: CallState): callstate is ErrorState {
   return !!Object.hasOwn(callstate as object, 'error');
}

export interface CallStateStore {
   callState: CallState;

   setLoaded: Action<CallStateStore>;
   setLoading: Action<CallStateStore>;
   setError: Action<CallStateStore, { error: Error }>;

   loading: Selector<CallStateStore, boolean>;
   error: Selector<CallStateStore, Error | null>;
}

export const callStateStoreInitialValue: StoreSignalInput<CallStateStore> = {
   callState: LoadingState.Init,

   setLoaded: createAction((state) => {
      state.patch({ callState: LoadingState.Loaded });
   }),
   setLoading: createAction((state) => {
      state.patch({ callState: LoadingState.Loading });
   }),
   setError: createAction((state, props) => {
      state.patch({ callState: { error: props.error } });
   }),

   loading: createSelector(
      (state) => state.callState() === LoadingState.Loading
   ),
   error: createSelector((state) => {
      const callState = state.callState();
      return isErrorState(callState) ? callState.error : null;
   }),
};
