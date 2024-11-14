import { Signal } from '@angular/core';
import { InternalAction } from '../../actions/types/action-types';
import { InternalSelector } from '../../selectors/types/selector-types';
import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from '../tokens/state-tokens';
import { State, StateSignal } from './state-types';

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends
      | InternalSelector<any, any>
      | InternalAction<any, any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActionsAndStateSignals<T> = {
   [K in keyof Pick<
      T,
      ExcludeSelectorsAndActions<T>
   >]: T[K] extends StateSignal<any> ? never : K;
}[keyof Pick<T, ExcludeSelectorsAndActions<T>>];

export type StateSignalWritableParam<T> = Pick<
   T,
   ExcludeSelectorsAndActionsAndStateSignals<T>
> & {
   [x in keyof Pick<
      T,
      ExcludeSelectorsAndActions<T>
   > as T[x] extends StateSignal<State<any>>
      ? x
      : never]: T[x] extends StateSignal<State<infer T2>>
      ? StateSignalPatchParam<T2>
      : T[x];
};

export type StateSignalPatchParam<T> = Partial<StateSignalWritableParam<T>>;

type WithHelperMethodToken<T> = T & {
   [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true;
};
export type PatchHelperMethod<T> = WithHelperMethodToken<
   (value: StateSignalPatchParam<T>) => void
>;
export type ViewHelperMethod<T> = WithHelperMethodToken<Signal<T>>;
export type ResetHelperMethod<T> = WithHelperMethodToken<() => void>;
export type HelperMethodUnion =
   | PatchHelperMethod<any>
   | ViewHelperMethod<any>
   | ResetHelperMethod<any>;
export type StateSignalHelperMethods<T> = {
   patch: PatchHelperMethod<T>;
   view: ViewHelperMethod<T>;
   reset: ResetHelperMethod<T>;
};

export type ExcludeStateSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StateSignalHelperMethods<T> ? never : x;
}[keyof T];
