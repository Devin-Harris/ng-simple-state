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
   Action,
   NGX_SIMPLE_ACTION_TOKEN,
   WithActionToken,
   isAction,
} from './action';
import { Selector, isSelector } from './selector';

type IsActionOnly<T, K extends keyof T> = T[K] extends Action<any, any>
   ? T[K] extends Selector<any, any>
      ? false
      : true
   : false;

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends Selector<any, any> | Action<any, any>
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

type ExcludeStoreSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StoreSignalHelperMethods<T> ? never : x;
}[keyof T];

type StoreSignalType<T> = {
   [x in ExcludeStoreSignalHelperMethods<
      Pick<T, ExcludeActionSubject<T>>
   >]: T[x] extends Selector<T, infer R>
      ? Signal<R>
      : T[x] extends Action<T, infer P>
      ? P extends undefined
         ? () => Action<T, undefined>
         : (props: P) => Action<T, P>
      : WritableSignal<T[x]>;
} & {
   [x in keyof T as IsActionOnly<T, x> extends true
      ? `$${string & x}`
      : never]: T[x] extends Action<T, infer P> ? Subject<P> : never;
};

type StoreSignalPatchParam<T> = Partial<Pick<T, ExcludeSelectorsAndActions<T>>>;

type StoreSignalHelperMethods<T> = {
   patch: (value: StoreSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export type StoreSignal<T> = StoreSignalType<T> & StoreSignalHelperMethods<T>;

export interface StoreSignalConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
}

export type StoreSignalInput<T> = Pick<
   Pick<T, ExcludeActionSubject<T>>,
   ExcludeStoreSignalHelperMethods<Pick<T, ExcludeActionSubject<T>>>
>;

export function storeSignal<InitialValueType extends {}>(
   intialValue: StoreSignalInput<InitialValueType>,
   config?: StoreSignalConfig
): Type<StoreSignal<InitialValueType>> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StoreSignalInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to storeSignal');
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
                  }\` is trying to be set multiple times within this storeSignal`
               );
            }

            if (isSelector(value)) {
               store[k] = computed(() => value(store));
            } else if (isAction(value)) {
               const subject: WithActionToken<Subject<any>> = Object.assign(
                  new Subject<any>(),
                  {
                     [NGX_SIMPLE_ACTION_TOKEN]: true,
                  } as const
               );

               const fn: WithActionToken<Function> = Object.assign(
                  (props?: any) => {
                     runInInjectionContext(injector, () => {
                        (value as Function)(this, props);
                     });
                     subject.next(props);
                  },
                  { [NGX_SIMPLE_ACTION_TOKEN]: true } as const
               );

               store[k] = fn;
               const actionSubjectString = `$${k as string}`;
               if (store[actionSubjectString]) {
                  throw new Error(
                     `Key \`${actionSubjectString}\` is trying to be set multiple times within this storeSignal`
                  );
               }
               store[actionSubjectString] = subject;
            } else {
               store[k] = signal(value);
            }
         }

         if (store['patch']) {
            throw new Error(
               `Key \`patch\` is trying to be set multiple times within this storeSignal`
            );
         }
         store.patch = (value: StoreSignalPatchParam<InitialValueType>) => {
            const keys = Object.keys(
               value
            ) as (keyof StoreSignalPatchParam<InitialValueType>)[];
            for (const k of keys) {
               const v = value[k] as InitialValueType[keyof InitialValueType];

               if (isSelector(v)) {
                  throw new Error('Patching on selector values is not allowed');
               }
               if (isAction(v)) {
                  throw new Error('Patching on action values is not allowed');
               }

               (store[k] as WritableSignal<typeof v>).set(v);
            }
         };
         if (store['view']) {
            throw new Error(
               `Key \`view\` is trying to be set multiple times within this storeSignal`
            );
         }
         store.view = computed(() => storeSignalView(store));
      }
   }

   return SignalStore as Type<StoreSignal<InitialValueType>>;
}

export function storeSignalView<
   T extends StoreSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch', 'view']);
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         if (!isAction(state[k])) {
            // @ts-ignore
            o[k] = state[k]();
         }
      });
   return o;
}
