import { Injector, Signal, Type, WritableSignal } from '@angular/core';

import {
   Action,
   ActionType,
   CreateAction,
} from '../../actions/types/action-types';
import { CreateSelector, Selector } from '../../selectors/types/selector-types';
import {
   NGX_SIMPLE_STATE_INJECTABLE_STORE_TOKEN,
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_STORE_TOKEN,
} from '../tokens/store-tokens';
import {
   ExcludeStoreSignalHelperMethods,
   StoreSignalHelperMethods,
} from './helper-method-types';

export interface InjectableConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
}

export type StoreSignalConfig = {
   injector?: Injector | null;
};

export type Store<T> = {
   [x in keyof T]: T[x] extends Selector<infer R>
      ? CreateSelector<Store<T>, R>
      : T[x] extends Action<infer P>
      ? CreateAction<Store<T>, P>
      : T[x] extends Signal<any>
      ? T[x]
      : T[x] extends Store<infer T2>
      ? StoreSignal<Store<T2>, any> | InjectableStoreSignal<Store<T2>, any>
      : T[x] extends InjectableStoreSignal<Store<infer T3>, infer Mutability>
      ? InjectableStoreSignal<Store<T3>, Mutability>
      : T[x] extends StoreSignal<Store<infer T4>, infer Mutability2>
      ? StoreSignal<Store<T4>, Mutability2>
      : x extends keyof StoreSignalHelperMethods<any>
      ? never
      : T[x];
};

type StoreSignalType<
   T,
   Mutability extends StoreMutability = StoreMutability.writable
> = {
   [x in ExcludeStoreSignalHelperMethods<T>]: T[x] extends CreateSelector<
      T,
      infer R
   >
      ? Signal<R>
      : T[x] extends CreateAction<T, infer P>
      ? ActionType<T, P>
      : T[x] extends
           | StoreSignal<Store<infer T2>, infer Mutability2>
           | InjectableStoreSignal<Store<infer T3>, infer Mutability3>
      ? T[x] extends StoreSignal<Store<T2>, Mutability2>
         ? StoreSignal<Store<T2>, Mutability2>
         : StoreSignal<Store<T3>, Mutability3>
      : T[x] extends Signal<any>
      ? T[x]
      : Mutability extends StoreMutability.readonly
      ? Signal<T[x]>
      : WritableSignal<T[x]>;
};

type StoreSignalBase<
   T,
   Mutability extends StoreMutability = StoreMutability.writable
> = StoreSignalType<T, Mutability> & StoreSignalHelperMethods<T, Mutability>;

export type StoreSignal<
   T,
   Mutability extends StoreMutability = StoreMutability.writable
> = StoreSignalBase<T, Mutability> & {
   [NGX_SIMPLE_STATE_STORE_TOKEN]: true;
   [NGX_SIMPLE_STATE_INJECTOR_TOKEN]: WritableSignal<Injector | null>;
};

export type InjectableStoreSignal<
   T,
   Mutability extends StoreMutability = StoreMutability.writable
> = Type<
   StoreSignalBase<T, Mutability> & {
      [NGX_SIMPLE_STATE_INJECTABLE_STORE_TOKEN]: true;
   }
>;

export enum StoreMutability {
   'readonly',
   'writable',
}
