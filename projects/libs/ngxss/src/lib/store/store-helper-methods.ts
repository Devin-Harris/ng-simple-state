import {
   computed,
   Injectable,
   Injector,
   Type,
   WritableSignal,
} from '@angular/core';
import { isAction } from '../actions/action';
import { isSelector } from '../selectors/selector';
import { store } from './store';
import {
   isHelperMethod,
   isInjector,
   isStore,
   NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN,
} from './tokens/store-tokens';
import { StoreSignalPatchParam } from './types/helper-method-types';
import { InjectableConfig, StoreSignal } from './types/store-types';

export function buildViewFn<InitialValueType>(
   store: StoreSignal<InitialValueType>
) {
   const value = computed(() => storeView(store));
   Object.assign(value, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return value;
}
function storeView<T extends StoreSignal<InitialValueType>, InitialValueType>(
   state: T
) {
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys.forEach((k) => {
      if (isStore(state[k])) {
         // @ts-ignore
         o[k] = storeView(state[k]);
      } else if (!isAction(state[k]) && !isHelperMethod(state[k])) {
         // @ts-ignore
         o[k] = state[k]();
      }
   });
   return o;
}

export function buildPatchFn<InitialValueType>(
   store: StoreSignal<InitialValueType>
) {
   const fn = (value: StoreSignalPatchParam<InitialValueType>) => {
      const keys = Object.keys(
         value
      ) as (keyof StoreSignalPatchParam<InitialValueType>)[];
      for (const k of keys) {
         const v = value[k] as InitialValueType[keyof InitialValueType];

         if (isSelector(store[k])) {
            throw new Error('Patching on selector values is not allowed');
         }
         if (isAction(store[k])) {
            throw new Error('Patching on action values is not allowed');
         }
         if (isStore(store[k])) {
            // @ts-ignore
            store[k].patch(v);
            continue;
         }

         (store[k] as WritableSignal<typeof v>).set(v);
      }
   };
   Object.assign(fn, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return fn;
}
export function buildResetFn<InitialValueType>(
   store: StoreSignal<InitialValueType>,
   intialValue: InitialValueType
) {
   const fn = () => {
      const keys = Object.keys(
         store
      ) as (keyof StoreSignal<InitialValueType>)[];
      for (const k of keys) {
         const v = store[k];
         const s = intialValue[k as keyof InitialValueType];

         if (isStore(s)) {
            // @ts-ignore
            store[k].reset(store[k], intialValue[k]);
            continue;
         }

         if (
            isSelector(s) ||
            isAction(s) ||
            isHelperMethod(v) ||
            isInjector(v)
         ) {
            continue;
         }

         (store[k] as WritableSignal<typeof s>).set(s);
      }
   };
   Object.assign(fn, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return fn;
}
export function buildInjectableFn<InitialValueType extends {}>() {
   const fn = (intialValue: InitialValueType, config?: InjectableConfig) =>
      createInjectableStore(intialValue, config);
   Object.assign(fn, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return fn;
}
function createInjectableStore<InitialValueType extends {}>(
   intialValue: InitialValueType,
   config?: InjectableConfig
): Type<StoreSignal<InitialValueType>> {
   @Injectable({ providedIn: config?.providedIn || null })
   class InjectableStore {
      constructor(injector: Injector) {
         Object.assign(this, store(intialValue, { injector }));
      }
   }

   return InjectableStore as Type<StoreSignal<InitialValueType>>;
}
