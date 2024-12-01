import { Injectable, Injector } from '@angular/core';
import { createStore } from '../../public-api';
import { store } from './store';
import {
   NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN,
   NGX_SIMPLE_STATE_INJECTABLE_STORE_TOKEN,
} from './tokens/store-tokens';
import {
   InjectableConfig,
   InjectableStoreSignal,
   Store,
   StoreMutability,
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
): StoreSignal<InitialValueType, StoreMutability.readonly> {
   const readonlyStore = createStore(
      intialValue,
      config,
      StoreMutability.readonly
   );
   return readonlyStore as StoreSignal<
      InitialValueType,
      StoreMutability.readonly
   >;
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
   return createInjectableStore(intialValue, config, StoreMutability.readonly);
}
function createInjectableStore<
   InitialValueType extends {},
   Mutability extends StoreMutability = StoreMutability.writable
>(
   intialValue: InitialValueType,
   config?: InjectableConfig,
   mutability?: Mutability
): InjectableStoreSignal<InitialValueType, Mutability> {
   @Injectable({ providedIn: config?.providedIn || null })
   class InjectableStore {
      constructor(injector: Injector) {
         Object.assign(
            this,
            mutability === StoreMutability.readonly
               ? store.readonly(intialValue, { injector })
               : store(intialValue, { injector })
         );
      }
   }
   Object.assign(InjectableStore, {
      [NGX_SIMPLE_STATE_INJECTABLE_STORE_TOKEN]: true,
   });

   return InjectableStore as InjectableStoreSignal<
      InitialValueType,
      Mutability
   >;
}

function createWritableStore<StoreType extends Store<T>, T extends {} = {}>(
   intialValue: StoreType,
   config: StoreSignalConfig = {}
): StoreSignal<StoreType, StoreMutability.writable> {
   return createStore(intialValue, config, StoreMutability.writable);
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
