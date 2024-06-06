import {
   Injectable,
   Injector,
   Signal,
   Type,
   WritableSignal,
   computed,
   runInInjectionContext,
   signal,
} from '@angular/core';
import { Subject } from 'rxjs';
import {
   NGX_SIMPLE_STATE_ACTION_TOKEN,
   StateAction,
   WithStateActionToken,
   isStateAction,
} from './state-action';
import { StateSelector, isStateSelector } from './state-selector';

type IsStateActionOnly<T, K extends keyof T> = T[K] extends StateAction<
   any,
   any
>
   ? T[K] extends StateSelector<any, any>
      ? false
      : true
   : false;

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends StateSelector<any, any> | StateAction<any, any>
      ? never
      : K;
}[keyof T];

type ExcludeActionSubject<T> = {
   [x in keyof T]: x extends `$${infer Suffix}`
      ? Suffix extends keyof T
         ? never
         : x
      : x;
}[keyof T];

type ExcludeStateSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StateSignalHelperMethods<T> ? never : x;
}[keyof T];

type StateSignalType<T> = {
   [x in ExcludeStateSignalHelperMethods<
      Pick<T, ExcludeActionSubject<T>>
   >]: T[x] extends StateSelector<T, infer R>
      ? Signal<R>
      : T[x] extends StateAction<T, infer P>
      ? P extends undefined
         ? () => StateAction<T, undefined>
         : (props: P) => StateAction<T, P>
      : WritableSignal<T[x]>;
} & {
   [x in keyof T as IsStateActionOnly<T, x> extends true
      ? `$${string & x}`
      : never]: T[x] extends StateAction<T, infer P> ? Subject<P> : never;
};

type StateSignalPatchParam<T> = Partial<Pick<T, ExcludeSelectorsAndActions<T>>>;

type StateSignalHelperMethods<T> = {
   patch: (value: StateSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export type StateSignal<T> = StateSignalType<T> & StateSignalHelperMethods<T>;

export interface StateSignalConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
}

export type StateSignalInput<T> = Pick<
   Pick<T, ExcludeActionSubject<T>>,
   ExcludeStateSignalHelperMethods<Pick<T, ExcludeActionSubject<T>>>
>;

export function stateSignal<InitialValueType extends {}>(
   intialValue: StateSignalInput<InitialValueType>,
   config?: StateSignalConfig
): Type<StateSignal<InitialValueType>> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StateSignalInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to stateSignal');
   }

   @Injectable({ providedIn: config?.providedIn || null })
   class SignalStore {
      constructor(injector: Injector) {
         // Casting `this` object to any so proper fields can be attached without ts errors
         const store = this as any;

         for (const k of keys) {
            const value = intialValue[k];

            if (store[k]) {
               throw new Error(
                  `Key \`${
                     k as string
                  }\` is trying to be set multiple times within this stateSignal`
               );
            }

            if (isStateSelector(value)) {
               store[k] = computed(() => value(store));
            } else if (isStateAction(value)) {
               const subject: WithStateActionToken<Subject<any>> =
                  Object.assign(new Subject<any>(), {
                     [NGX_SIMPLE_STATE_ACTION_TOKEN]: true,
                  } as const);

               const fn: WithStateActionToken<Function> = Object.assign(
                  (props?: any) => {
                     runInInjectionContext(injector, () => {
                        (value as Function)(this, props);
                     });
                     subject.next(props);
                  },
                  { [NGX_SIMPLE_STATE_ACTION_TOKEN]: true } as const
               );

               store[k] = fn;
               const actionSubjectString = `$${k as string}`;
               if (store[actionSubjectString]) {
                  throw new Error(
                     `Key \`${actionSubjectString}\` is trying to be set multiple times within this stateSignal`
                  );
               }
               store[actionSubjectString] = subject;
            } else {
               store[k] = signal(value);
            }
         }

         if (store['patch']) {
            throw new Error(
               `Key \`patch\` is trying to be set multiple times within this stateSignal`
            );
         }
         store.patch = (value: StateSignalPatchParam<InitialValueType>) => {
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

               (store[k] as WritableSignal<typeof v>).set(v);
            }
         };
         if (store['view']) {
            throw new Error(
               `Key \`view\` is trying to be set multiple times within this stateSignal`
            );
         }
         store.view = computed(() => stateSignalView(store));
      }
   }

   return SignalStore as Type<StateSignal<InitialValueType>>;
}

export function stateSignalView<
   T extends StateSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch', 'view']);
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         if (!isStateAction(state[k])) {
            // @ts-ignore
            o[k] = state[k]();
         }
      });
   return o;
}
