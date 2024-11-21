import { Injectable, Injector, Type } from '@angular/core';
import { createStore } from '../../public-api';
import { store } from './store';
import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from './tokens/store-tokens';
import {
   InjectableConfig,
   Store,
   StoreSignal,
   StoreSignalConfig,
} from './types/store-types';

type ReadonlyStoreVariantType = typeof createReadonlyStore & {
   injectable: typeof createReadonlyInjectableStore;
};
function buildReadonlyFn<InitialValueType extends {}>() {
   const fn = (intialValue: InitialValueType, config?: StoreSignalConfig) =>
      createReadonlyStore(intialValue, config);
   Object.assign(fn, {
      injectable: (intialValue: InitialValueType, config?: InjectableConfig) =>
         createReadonlyInjectableStore(intialValue, config),
      [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true,
   });
   return fn as ReadonlyStoreVariantType;
}
function createReadonlyStore<InitialValueType extends {}>(
   intialValue: InitialValueType,
   config?: StoreSignalConfig
): StoreSignal<InitialValueType, true> {
   const readonlyStore = createStore(intialValue, config, true);
   return readonlyStore as StoreSignal<InitialValueType, true>;
}

export type InjectableStoreVariantType = typeof createInjectableStore & {
   readonly: typeof createReadonlyInjectableStore;
};
function buildInjectableFn<InitialValueType extends {}>() {
   const fn = (intialValue: InitialValueType, config?: InjectableConfig) =>
      createInjectableStore(intialValue, config);
   Object.assign(fn, {
      readonly: (intialValue: InitialValueType, config?: InjectableConfig) =>
         createReadonlyInjectableStore(intialValue, config),
      [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true,
   });
   return fn as InjectableStoreVariantType;
}
function createReadonlyInjectableStore<InitialValueType extends {}>(
   intialValue: InitialValueType,
   config?: InjectableConfig
) {
   return createInjectableStore(intialValue, config, true);
}
function createInjectableStore<
   InitialValueType extends {},
   Readonly extends boolean = false
>(
   intialValue: InitialValueType,
   config?: InjectableConfig,
   readonly?: Readonly
): Type<StoreSignal<InitialValueType, Readonly>> {
   @Injectable({ providedIn: config?.providedIn || null })
   class InjectableStore {
      constructor(injector: Injector) {
         Object.assign(
            this,
            readonly
               ? store.readonly(intialValue, { injector })
               : store(intialValue, { injector })
         );
      }
   }

   return InjectableStore as Type<StoreSignal<InitialValueType, Readonly>>;
}

function createWritableStore<StoreType extends Store<T>, T extends {} = {}>(
   intialValue: StoreType,
   config: StoreSignalConfig = {}
): StoreSignal<StoreType> {
   return createStore(intialValue, config, false);
}

function addStoreVariants<P extends Function = typeof createWritableStore>(
   fn: P
) {
   Object.assign(fn, {
      injectable: buildInjectableFn(),
      readonly: buildReadonlyFn(),
   });

   return fn as P & {
      injectable: InjectableStoreVariantType;
      readonly: ReadonlyStoreVariantType;
   };
}

export const storeWithVariants = addStoreVariants(createWritableStore);
