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

export type StateSignal<T> = StateSignalType<T> & {
   patch: (value: StateSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export interface StateSignalConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
}

export function stateSignal<InitialValueType extends {}>(
   intialValue: InitialValueType,
   config?: StateSignalConfig
): Type<StateSignal<InitialValueType>> {
   const keys = Object.keys(intialValue) as (keyof InitialValueType)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to stateSignal');
   }

   @Injectable({ providedIn: config?.providedIn || null })
   class SignalStore {
      constructor(injector: Injector) {
         for (const k of keys) {
            const value = intialValue[k];
            if (isStateSelector(value)) {
               (this as any)[k] = computed(() => value(this as any));
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

               (this as any)[k] = fn;
               (this as any)[`$${k as string}`] = subject;
            } else {
               (this as any)[k] = signal(value);
            }
         }

         (this as any).patch = (
            value: StateSignalPatchParam<InitialValueType>
         ) => {
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

               ((this as any)[k] as WritableSignal<typeof v>).set(v);
            }
         };

         (this as any).view = computed(() => stateSignalView(this as any));
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
