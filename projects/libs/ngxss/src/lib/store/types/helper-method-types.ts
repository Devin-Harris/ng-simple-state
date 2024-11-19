import { Signal, Type } from '@angular/core';
import { ActionCallback, SelectorCallback } from '../../../public-api';
import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from '../tokens/store-tokens';
import {
   InjectableConfig,
   Store,
   StoreInput,
   StoreSignal,
} from './store-types';

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends
      | SelectorCallback<any, any>
      | ActionCallback<any, any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActionsAndStoreSignals<T> = {
   [K in keyof Pick<
      T,
      ExcludeSelectorsAndActions<T>
   >]: T[K] extends StoreSignal<any> ? never : K;
}[keyof Pick<T, ExcludeSelectorsAndActions<T>>];

export type StoreSignalWritableParam<T> = Pick<
   T,
   ExcludeSelectorsAndActionsAndStoreSignals<T>
> & {
   [x in keyof Pick<
      T,
      ExcludeSelectorsAndActions<T>
   > as T[x] extends StoreSignal<Store<any>>
      ? x
      : never]: T[x] extends StoreSignal<Store<infer T2>>
      ? StoreSignalPatchParam<T2>
      : T[x];
};

export type StoreSignalPatchParam<T> = Partial<StoreSignalWritableParam<T>>;

type WithHelperMethodToken<T> = T & {
   [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true;
};
export type PatchHelperMethod<T> = WithHelperMethodToken<
   (value: StoreSignalPatchParam<T>) => void
>;
export type ViewHelperMethod<T> = WithHelperMethodToken<Signal<T>>;
export type ResetHelperMethod<T> = WithHelperMethodToken<() => void>;
export type InjectableHelperMethod<T> = WithHelperMethodToken<
   (
      intialValue: StoreInput<T>,
      config?: InjectableConfig
   ) => Type<StoreSignal<T>>
>;
export type HelperMethodUnion =
   | PatchHelperMethod<any>
   | ViewHelperMethod<any>
   | ResetHelperMethod<any>;
export type StoreSignalHelperMethods<T> = {
   patch: PatchHelperMethod<T>;
   view: ViewHelperMethod<T>;
   reset: ResetHelperMethod<T>;
};

export type ExcludeStoreSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StoreSignalHelperMethods<T> ? never : x;
}[keyof T];
