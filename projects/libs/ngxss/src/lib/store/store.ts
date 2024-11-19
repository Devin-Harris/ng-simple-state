import { computed, Injector, signal, Type } from '@angular/core';
import { buildActionFn, isAction } from '../actions/action';
import { isSelector } from '../selectors/selector';
import {
   buildInjectableFn,
   buildPatchFn,
   buildResetFn,
   buildViewFn,
} from './store-helper-methods';
import {
   isStore,
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_STORE_TOKEN,
} from './tokens/store-tokens';
import {
   InjectableConfig,
   StoreInput,
   StoreSignal,
   StoreSignalConfig,
} from './types/store-types';

export const store = addInjectableOptionToStoreCreationFunction(createStore);

function createStore<StoreType extends {}>(
   intialValue: StoreInput<StoreType>,
   config: StoreSignalConfig = {}
): StoreSignal<StoreType> {
   const keys = Object.keys(intialValue) as (keyof StoreInput<StoreType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   const storeObj = Object.create(null);
   const injector = config?.injector ?? null;
   storeObj[NGX_SIMPLE_STATE_INJECTOR_TOKEN] = signal<Injector | null>(
      injector
   );

   for (const k of keys) {
      const value = intialValue[k];

      if (storeObj[k]) {
         throw new Error(
            `Key \`${
               k as string
            }\` is trying to be set multiple times within this store`
         );
      }

      if (isSelector(value)) {
         storeObj[k] = computed(() => value(storeObj));
      } else if (isAction(value)) {
         storeObj[k] = buildActionFn(storeObj, value);
      } else if (isStore(value)) {
         value[NGX_SIMPLE_STATE_INJECTOR_TOKEN].set(injector);
         storeObj[k] = value;
      } else {
         storeObj[k] = signal(value);
      }
   }

   if (storeObj['patch']) {
      throw new Error(
         `Key \`patch\` is trying to be set multiple times within this store`
      );
   }
   storeObj.patch = buildPatchFn(storeObj);
   if (storeObj['view']) {
      throw new Error(
         `Key \`view\` is trying to be set multiple times within this store`
      );
   }
   storeObj.view = buildViewFn(storeObj);
   if (storeObj['reset']) {
      throw new Error(
         `Key \`reset\` is trying to be set multiple times within this store`
      );
   }
   storeObj.reset = buildResetFn(storeObj, intialValue);

   Object.assign(storeObj, {
      [NGX_SIMPLE_STATE_STORE_TOKEN]: true,
   });

   return storeObj;
}

function addInjectableOptionToStoreCreationFunction<
   P extends Function = typeof createStore
>(
   fn: P
): P & {
   injectable: <InitialValueType extends {}>(
      intialValue: StoreInput<InitialValueType>,
      config?: InjectableConfig
   ) => Type<StoreSignal<InitialValueType>>;
} {
   Object.assign(fn, { injectable: buildInjectableFn() });
   return fn as P & {
      injectable: <InitialValueType extends {}>(
         intialValue: StoreInput<InitialValueType>,
         config?: InjectableConfig
      ) => Type<StoreSignal<InitialValueType>>;
   };
}
