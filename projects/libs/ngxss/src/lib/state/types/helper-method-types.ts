import { Signal } from '@angular/core';
import { InternalAction } from '../../actions/types/action-types';
import { InternalSelector } from '../../selectors/types/selector-types';
import { State, StateSignal } from './state-types';

type ExcludeSelectorsAndActionsAndStateSignals<T> = {
   [K in keyof T]: T[K] extends
      | InternalSelector<any, any>
      | InternalAction<any, any>
      | StateSignal<any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends
      | InternalSelector<any, any>
      | InternalAction<any, any>
      ? never
      : K;
}[keyof T];

export type StateSignalPatchParam<T> = Partial<
   Pick<T, ExcludeSelectorsAndActionsAndStateSignals<T>> & {
      [x in keyof Pick<
         T,
         ExcludeSelectorsAndActions<T>
      > as T[x] extends StateSignal<State<any>>
         ? x
         : never]: T[x] extends StateSignal<State<infer T2>>
         ? StateSignalPatchParam<T2>
         : T[x];
   }
>;

export type StateSignalHelperMethods<T> = {
   patch: (value: StateSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export type ExcludeStateSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StateSignalHelperMethods<T> ? never : x;
}[keyof T];
