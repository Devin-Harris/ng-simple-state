import { Signal, WritableSignal, computed, signal } from '@angular/core';

export type StateSelector<InitialValueType, ReturnType> = (
   state: StateSignal<InitialValueType>
) => ReturnType;

export type StateSignalType<T> = {
   [x in keyof T]: T[x] extends StateSelector<T, infer R>
      ? Signal<R>
      : WritableSignal<T[x]>;
};

export type StateSignal<T> = StateSignalType<T> & {
   patch: (value: Partial<T>) => void;
};

export type StateComputedSignalType<T> = {
   [x in keyof T]: Signal<T[x]>;
};

export type StateComputedSignal<T> = StateComputedSignalType<T>;

const NGX_SIMPLE_STATE_SELECTOR_TOKEN = 'NGX_SIMPLE_STATE_SELECTOR_TOKEN';
export function createStateSelector<InitialValueType extends {}, ReturnType>(
   fn: (state: StateSignal<InitialValueType>) => ReturnType
) {
   // @ts-ignore
   fn['NGX_SIMPLE_STATE_SELECTOR_TOKEN'] = NGX_SIMPLE_STATE_SELECTOR_TOKEN;
   return fn;
}

function isStateSelector<T, R>(fn: any): fn is StateSelector<T, R> {
   return (
      typeof fn === 'function' &&
      fn.length === 1 &&
      // @ts-ignore
      fn['NGX_SIMPLE_STATE_SELECTOR_TOKEN'] === NGX_SIMPLE_STATE_SELECTOR_TOKEN
   );
}

export function stateSignal<InitialValueType extends {}>(
   intialValue: InitialValueType
): StateSignal<InitialValueType> {
   let state: StateSignalType<InitialValueType> =
      {} as StateSignalType<InitialValueType>;
   const keys = Object.keys(intialValue) as (keyof InitialValueType)[];
   keys.forEach((k: keyof InitialValueType) => {
      const value = intialValue[k];

      let s = undefined;
      if (isStateSelector(value)) {
         s = computed(() =>
            // @ts-ignore
            value(state)
         );
      } else {
         s = signal(value);
      }

      // @ts-ignore
      state[k] = s;
   });

   if (state === null) {
      throw new Error('Must provide an inital object value to stateSignal');
   }

   // @ts-ignore
   state.patch = (value: Partial<InitialValueType>) => {
      if (state) {
         const keys = Object.keys(value) as (keyof InitialValueType)[];
         for (const k of keys) {
            const v = value[k] as InitialValueType[keyof InitialValueType];

            if (isStateSelector(v)) {
               throw new Error('Patching on selector values is not allowed');
            }

            (state[k] as WritableSignal<typeof v>).set(v);
         }
      }
   };

   return state as StateSignal<InitialValueType>;
}

export function stateSignalView<
   T extends StateSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch']);
   const o: { [x: string]: T[keyof T] } = {};
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         // @ts-ignore
         o[k] = state[k]();
      });
   return o;
}
