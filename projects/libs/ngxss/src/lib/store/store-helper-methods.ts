import { computed, isSignal, WritableSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN } from '../../public-api';
import { isAction } from '../actions/action';
import { isSelector } from '../selectors/selector';
import { isStoreSignal } from './store';
import {
   isHelperMethod,
   isInjectableStore,
   isInjector,
   isStore,
   NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN,
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
} from './tokens/store-tokens';
import { StoreEvents } from './types/event-types';
import { StoreSignalPatchParam } from './types/patch-types';
import { StoreSignal } from './types/store-types';

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

         if (isStore(s) || isInjectableStore(s)) {
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

export function buildEventsFn<InitialValueType>(
   store: StoreSignal<InitialValueType>
) {
   const events: StoreEvents<InitialValueType> =
      {} as StoreEvents<InitialValueType>;

   const keys = Object.keys(store) as (keyof typeof store)[];
   keys.forEach((k) => {
      const value = store[k];
      if (isSignal(value)) {
         const injector = store[NGX_SIMPLE_STATE_INJECTOR_TOKEN]();
         if (injector) {
            //@ts-ignore
            events[k] = toObservable(value, { injector });
         } else {
            const subject = new Subject();

            //@ts-ignore
            const recomputeFn = value[SIGNAL].producerRecomputeValue;
            //@ts-ignore
            value[SIGNAL].producerRecomputeValue = (node) => {
               const old = node.value;
               recomputeFn(node);
               if (!node.equal(old, node.value)) {
                  subject.next(node.value);
               }
            };

            if (isStoreSignal(value)) {
               const writableSignal =
                  value[NGX_SIMPLE_ACTION_WRITABLE_SIGNAL_TOKEN];
               const oldSet = writableSignal['set'];
               const oldUpdate = writableSignal['update'];
               //@ts-ignore
               writableSignal['set'] = (v) => {
                  oldSet(v);
                  subject.next(v);
               };
               //@ts-ignore
               writableSignal['update'] = (updateFn) => {
                  oldUpdate(updateFn);
                  subject.next(writableSignal());
               };
            }

            // @ts-ignore
            events[k] = subject;
         }
      }

      if (isAction(value)) {
         // @ts-ignore
         events[k] = value.subject;
      }
      if (isStore(value)) {
         // @ts-ignore
         events[k] = buildEventsFn(value);
      }
   });

   Object.assign(events, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return events;
}
