import {
   computed,
   inject,
   Injector,
   isSignal,
   runInInjectionContext,
   Signal,
   signal,
   WritableSignal,
} from '@angular/core';
import {
   buildActionFn,
   isAction,
   NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN,
} from '../../public-api';
import { isSelector } from '../selectors/selector';
import {
   buildEventsFn,
   buildPatchFn,
   buildResetFn,
   buildViewFn,
} from './store-helper-methods';
import { storeWithVariants } from './store-variants';
import {
   isInjectableStore,
   isStore,
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_STORE_TOKEN,
} from './tokens/store-tokens';
import {
   Store,
   StoreMutability,
   StoreSignal,
   StoreSignalConfig,
} from './types/store-types';

export const store = storeWithVariants;

export function createStore<
   StoreType extends Store<T>,
   T extends {},
   Mutability extends StoreMutability = StoreMutability.writable
>(
   intialValue: StoreType,
   config: StoreSignalConfig = {},
   mutability: Mutability
): StoreSignal<StoreType, Mutability> {
   const keys = Object.keys(intialValue) as (keyof StoreType)[];

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
      } else if (isInjectableStore(value)) {
         if (injector) {
            runInInjectionContext(injector, () => {
               storeObj[k] = inject(value);
            });
         }
      } else {
         const s = signal(value);
         storeObj[k] =
            mutability === StoreMutability.readonly ? s.asReadonly() : s;
         // Keep writable version of signal so actions can mutate signals
         storeObj[k][NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN] = s;
      }
   }

   if (mutability === StoreMutability.writable) {
      if (storeObj['patch']) {
         throw new Error(
            `Key \`patch\` is trying to be set multiple times within this store`
         );
      }
      storeObj.patch = buildPatchFn(storeObj);
   }
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
   if (storeObj['events']) {
      throw new Error(
         `Key \`events\` is trying to be set multiple times within this store`
      );
   }
   storeObj.events = buildEventsFn(storeObj);

   Object.assign(storeObj, {
      [NGX_SIMPLE_STATE_STORE_TOKEN]: true,
   });

   return storeObj;
}

export function isStoreSignal<T>(obj: any): obj is Signal<T> & {
   [NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN]: WritableSignal<T>;
} {
   return obj && obj[NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN] && isSignal(obj);
}
