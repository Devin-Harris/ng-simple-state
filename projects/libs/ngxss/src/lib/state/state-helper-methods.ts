import { computed, WritableSignal } from '@angular/core';
import { isAction } from '../actions/action';
import { isSelector } from '../selectors/selector';
import { isInjector, isState, stateView } from './state';
import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from './tokens/state-tokens';
import {
   HelperMethodUnion,
   StateSignalPatchParam,
} from './types/helper-method-types';
import { StateSignal } from './types/state-types';

export function buildViewFn<InitialValueType>(
   state: StateSignal<InitialValueType>
) {
   const value = computed(() => stateView(state));
   Object.assign(value, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return value;
}
export function buildPatchFn<InitialValueType>(
   state: StateSignal<InitialValueType>
) {
   const fn = (value: StateSignalPatchParam<InitialValueType>) => {
      const keys = Object.keys(
         value
      ) as (keyof StateSignalPatchParam<InitialValueType>)[];
      for (const k of keys) {
         const v = value[k] as InitialValueType[keyof InitialValueType];

         if (isSelector(state[k])) {
            throw new Error('Patching on selector values is not allowed');
         }
         if (isAction(state[k])) {
            throw new Error('Patching on action values is not allowed');
         }
         if (isState(state[k])) {
            // @ts-ignore
            state[k].patch(v);
            continue;
         }

         (state[k] as WritableSignal<typeof v>).set(v);
      }
   };
   Object.assign(fn, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return fn;
}
export function buildResetFn<InitialValueType>(
   state: StateSignal<InitialValueType>,
   intialValue: InitialValueType
) {
   const fn = () => {
      const keys = Object.keys(
         state
      ) as (keyof StateSignal<InitialValueType>)[];
      for (const k of keys) {
         const v = state[k];
         const s = intialValue[k as keyof InitialValueType];

         if (isState(s)) {
            // @ts-ignore
            state[k].reset(state[k], intialValue[k]);
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

         (state[k] as WritableSignal<typeof s>).set(s);
      }
   };
   Object.assign(fn, { [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true });
   return fn;
}

export function isHelperMethod<T>(obj: any): obj is HelperMethodUnion {
   return obj && obj[NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN];
}
