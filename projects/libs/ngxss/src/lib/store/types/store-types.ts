import { Injector, Signal, Type, WritableSignal } from '@angular/core';

import { ActionType, InternalAction } from '../../actions/types/action-types';
import { InternalSelector } from '../../selectors/types/selector-types';
import {
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
   [x in keyof T]: T[x] extends InternalAction<any, infer P>
      ? T[x] extends InternalSelector<any, infer R>
         ? InternalSelector<Store<T>, R>
         : InternalAction<Store<T>, P>
      : T[x] extends InternalSelector<any, infer R>
      ? InternalSelector<Store<T>, R>
      : T[x];
};

type StoreSignalType<T> = {
   [x in ExcludeStoreSignalHelperMethods<T>]: T[x] extends InternalSelector<
      any,
      infer R
   >
      ? Signal<R>
      : T[x] extends InternalAction<any, infer P>
      ? ActionType<T, P>
      : T[x] extends StoreSignal<Store<infer T2>>
      ? StoreSignal<T2>
      : WritableSignal<T[x]>;
};

export type StoreSignal<T> = StoreSignalType<T> &
   StoreSignalHelperMethods<T> & {
      [NGX_SIMPLE_STATE_STORE_TOKEN]: true;
      [NGX_SIMPLE_STATE_INJECTOR_TOKEN]: WritableSignal<Injector | null>;
   };

export type StoreInput<T> = Pick<T, ExcludeStoreSignalHelperMethods<T>>;
