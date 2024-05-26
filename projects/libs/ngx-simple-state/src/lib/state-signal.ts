import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { StateSelectors } from './state-service';

export type StateSignalType<T> = {
   [x in keyof T]: WritableSignal<T[x]>;
};

export type StateSignal<T> = StateSignalType<T> & {
   patch: (value: Partial<T>) => void;
};

export type StateComputedSignalType<T> = {
   [x in keyof T]: Signal<T[x]>;
};

export type StateComputedSignal<T> = StateComputedSignalType<T>;

export function stateSignal<T extends {}, P extends StateSelectors<T>>(
   intialValue: T,
   selectors?: P
): StateSignal<T> & StateComputedSignal<P> {
   let state: StateSignalType<T> | null = null;
   const keys = Object.keys(intialValue) as (keyof T)[];
   keys.forEach((k: keyof T) => {
      const s = signal(intialValue[k]);
      if (state) {
         state[k] = s;
      } else {
         state = { [k]: s } as StateSignalType<T>;
      }
   });

   if (state === null) {
      throw new Error('Must provide an inital object value to stateSignal');
   }

   const returnValue = {
      ...(state as StateSignalType<T & P>),
      patch: (value: Partial<T>) => {
         if (state) {
            const keys = Object.keys(value) as (keyof T)[];
            for (const k of keys) {
               const v = value[k] as T[keyof T];
               state[k].set(v);
            }
         }
      },
   };

   if (selectors) {
      const keys = Object.keys(selectors);
      const stateKeys = new Set(Object.keys(intialValue));
      for (const selector of keys) {
         if (stateKeys.has(selector)) {
            throw new Error(
               'Selector names must not already be defined from the state object'
            );
         }

         // @ts-ignore
         returnValue[selector] = computed(() => {
            return selectors[selector](returnValue);
         });
      }
   }

   return returnValue;
}

export function stateSignalView<T>(state: StateSignal<T>) {
   const excludedKeys = new Set<keyof StateSignal<T>>(['patch']);
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
