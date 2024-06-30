import { inject } from '@angular/core';
import {
   Action,
   Selector,
   Store,
   StoreInput,
   createAction,
   createSelector,
} from 'projects/libs/ngxss/src/public-api';
import { AsyncLoadApiService } from '../../async-load-example/state/async-load-api.service';

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

export type CallStateStoreType = Store<{
   callState: CallState;

   blah: Action<unknown>;
   setLoaded: Action;
   setLoading: Action;
   setError: Action<{ error: Error }>;

   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;

export const callStateStoreInput: StoreInput<CallStateStoreType> = {
   callState: LoadingState.Init,

   blah: createAction(async (state, _, s = inject(AsyncLoadApiService)) => {
      console.log(await s.getEntity(1));
   }),
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
