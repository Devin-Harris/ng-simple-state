import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
   NGX_SIMPLE_STATE_ACTION_TOKEN,
   StateAction,
   isStateAction,
} from './state-action';
import { StateSelector, isStateSelector } from './state-selector';

// Helper type to check if P is undefined
type IsUndefined<P> = P extends undefined ? true : false;
// Helper type to exclude StateSelector from the check
type IsStateActionOnly<T, K extends keyof T> = T[K] extends StateAction<
   any,
   any
>
   ? T[K] extends StateSelector<any, any>
      ? false
      : true
   : false;
// Helper type to exclude StateSelector and StateAction
type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends StateSelector<any, any> | StateAction<any, any>
      ? never
      : K;
}[keyof T];

type StateSignalType<T> = {
   [x in keyof T]: T[x] extends StateSelector<T, infer R>
      ? Signal<R>
      : T[x] extends StateAction<T, infer P>
      ? IsUndefined<P> extends true
         ? () => StateAction<T, undefined>
         : (props: P) => StateAction<T, P>
      : WritableSignal<T[x]>;
} & {
   [x in keyof T as IsStateActionOnly<T, x> extends true
      ? `$${string & x}`
      : never]: T[x] extends StateAction<T, infer P> ? Subject<P> : never;
};

type StateSignalPatchParam<T> = Partial<Pick<T, ExcludeSelectorsAndActions<T>>>;

export type StateSignal<T> = StateSignalType<T> & {
   patch: (value: StateSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export function stateSignal<InitialValueType extends {}>(
   intialValue: InitialValueType
): StateSignal<InitialValueType> {
   let state: StateSignal<InitialValueType> = Object.create(
      null
   ) as StateSignal<InitialValueType>;
   const keys = Object.keys(intialValue) as (keyof InitialValueType)[];
   keys.forEach((k: keyof InitialValueType) => {
      const value = intialValue[k];
      if (isStateSelector(value)) {
         // @ts-ignore
         state[k] = computed(() => value(state));
      } else if (isStateAction(value)) {
         let subject: Subject<any> & {
            NGX_SIMPLE_STATE_ACTION_TOKEN?: 'NGX_SIMPLE_STATE_ACTION_TOKEN';
         } = new Subject<any>();
         subject['NGX_SIMPLE_STATE_ACTION_TOKEN'] =
            NGX_SIMPLE_STATE_ACTION_TOKEN;

         let fn: Function & {
            NGX_SIMPLE_STATE_ACTION_TOKEN?: 'NGX_SIMPLE_STATE_ACTION_TOKEN';
         } = (props?: any) => {
            (value as Function)(state, props);
            subject.next(props);
         };
         fn['NGX_SIMPLE_STATE_ACTION_TOKEN'] = NGX_SIMPLE_STATE_ACTION_TOKEN;

         // @ts-ignore
         state[k] = fn;
         // @ts-ignore
         state[`$${k}`] = subject;
      } else {
         // @ts-ignore
         state[k] = signal(value);
      }
   });

   if (state === null) {
      throw new Error('Must provide an inital object value to stateSignal');
   }

   state.patch = (value: StateSignalPatchParam<InitialValueType>) => {
      if (state) {
         const keys = Object.keys(
            value
         ) as (keyof StateSignalPatchParam<InitialValueType>)[];
         for (const k of keys) {
            const v = value[k] as InitialValueType[keyof InitialValueType];

            if (isStateSelector(v)) {
               throw new Error('Patching on selector values is not allowed');
            }
            if (isStateAction(v)) {
               throw new Error('Patching on action values is not allowed');
            }

            (state[k] as WritableSignal<typeof v>).set(v);
         }
      }
   };

   state.view = computed(() => stateSignalView(state));

   Object.freeze(state);

   return state;
}

export function stateSignalView<
   T extends StateSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch', 'view']);
   const o: { [x: string]: T[keyof T] } = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         if (!isStateAction(state[k])) {
            // @ts-ignore
            o[k] = state[k]();
         }
      });
   return o as InitialValueType;
}
