import { Signal, Type } from '@angular/core';
import { CreateAction, CreateSelector } from '../../../public-api';
import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from '../tokens/store-tokens';
import { InjectableConfig, Store, StoreSignal } from './store-types';

type ExcludeActions<T> = {
   [K in keyof T]: T[K] extends CreateAction<any, any> ? never : K;
}[keyof T];

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends CreateSelector<any, any>
      ? never
      : T[K] extends CreateAction<any, any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActionsAndStoreSignals<T> = {
   [K in keyof Pick<T, ExcludeSelectorsAndActions<T>>]: T[K] extends Store<any>
      ? never
      : K;
}[keyof Pick<T, ExcludeSelectorsAndActions<T>>];

export type StoreSignalWritableParam<T> = Pick<
   T,
   ExcludeSelectorsAndActionsAndStoreSignals<T>
> & {
   [x in keyof Pick<T, ExcludeSelectorsAndActions<T>> as T[x] extends Store<any>
      ? x
      : never]: T[x] extends Store<infer T2> ? StoreSignalPatchParam<T2> : T[x];
};

export type StoreSignalPatchParam<T> = Partial<StoreSignalWritableParam<T>>;

type WithHelperMethodToken<T> = T & {
   [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true;
};
export type PatchHelperMethod<T> = WithHelperMethodToken<
   (value: StoreSignalPatchParam<T>) => void
>;
export type ViewHelperMethod<T> = WithHelperMethodToken<
   Signal<{
      [x in ExcludeActions<T>]: T[x] extends CreateSelector<any, infer R>
         ? R
         : T[x];
   }>
>;

export type ResetHelperMethod<T> = WithHelperMethodToken<() => void>;
export type InjectableHelperMethod<T> = WithHelperMethodToken<
   (intialValue: T, config?: InjectableConfig) => Type<StoreSignal<T>>
>;
export type HelperMethodUnion =
   | PatchHelperMethod<any>
   | ViewHelperMethod<any>
   | ResetHelperMethod<any>;
export type StoreSignalHelperMethods<T, Readonly extends boolean = false> = {
   view: ViewHelperMethod<T extends Store<infer T2> ? T2 : T>;
   reset: ResetHelperMethod<T extends Store<infer T2> ? T2 : T>;
} & (Readonly extends false
   ? {
        patch: PatchHelperMethod<T extends Store<infer T2> ? T2 : T>;
     }
   : {});

export type ExcludeStoreSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StoreSignalHelperMethods<T> ? never : x;
}[keyof T];
