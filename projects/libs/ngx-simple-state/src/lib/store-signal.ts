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

type ExcludeSelectorsAndActionsAndSlices<T> = {
   [K in keyof T]: T[K] extends
      | Selector<any, any>
      | Action<any, any>
      | WithActionToken<Subject<any>>
      | StoreSlice<T[K]>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends
      | Selector<any, any>
      | Action<any, any>
      | WithActionToken<Subject<any>>
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
      : T[x] extends StoreSlice<infer T2>
      ? StoreSignalType<T2>
      : WritableSignal<T[x]>;
} & {
   [x in keyof T as IsActionOnly<T, x> extends true
      ? T[x] extends WithActionToken<Subject<any>>
         ? never
         : x extends string
         ? `$${x}`
         : never
      : never]: T[x] extends Action<T, infer P>
      ? WithActionToken<Subject<P>>
      : never;
};

type StoreSignalPatchParam<T> = Partial<
   Pick<T, ExcludeSelectorsAndActionsAndSlices<T>> & {
      [x in keyof Pick<
         T,
         ExcludeSelectorsAndActions<T>
      > as T[x] extends StoreSlice<any> ? x : never]: T[x] extends StoreSlice<
         infer T2
      >
         ? StoreSignalPatchParam<T2>
         : T[x];
   }
>;

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

export const NGX_SIMPLE_STORE_SLICE_TOKEN = Symbol(
   'NGX_SIMPLE_STORE_SLICE_TOKEN'
);

export type StoreSlice<T> = T & { [NGX_SIMPLE_STORE_SLICE_TOKEN]: true };

export function isStoreSlice<T>(obj: any): obj is StoreSlice<T> {
   return obj && obj[NGX_SIMPLE_STORE_SLICE_TOKEN];
}

export function createStoreSlice<T>(
   featureInitialValue: StoreSignalInput<T>
): StoreSlice<T> {
   Object.assign(featureInitialValue, { [NGX_SIMPLE_STORE_SLICE_TOKEN]: true });
   return featureInitialValue as StoreSlice<T>;
}

export function storeSlice<InitialValueType extends {}>(
   intialValue: StoreSignalInput<InitialValueType>,
   injector: Injector | null = null
) {
   const keys = Object.keys(
      intialValue
   ) as (keyof StoreSignalInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   const store = Object.create(null);
   for (const k of keys) {
      const value = intialValue[k];

      if (store[k]) {
         throw new Error(
            `Key \`${
               k as string
            }\` is trying to be set multiple times within this store`
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
               if (injector) {
                  runInInjectionContext(injector, () => {
                     (value as Function)(store, props);
                  });
               } else {
                  (value as Function)(store, props);
               }
               subject.next(props);
            },
            { [NGX_SIMPLE_ACTION_TOKEN]: true } as const
         );

         store[k] = fn;
         const actionSubjectString = `$${k as string}`;
         if (store[actionSubjectString]) {
            throw new Error(
               `Key \`${actionSubjectString}\` is trying to be set multiple times within this store`
            );
         }
         store[actionSubjectString] = subject;
      } else if (isStoreSlice(value)) {
         store[k] = Object.assign(storeSlice(value, injector), {
            [NGX_SIMPLE_STORE_SLICE_TOKEN]: true,
         } as const);
      } else {
         store[k] = signal(value);
      }
   }

   if (store['patch']) {
      throw new Error(
         `Key \`patch\` is trying to be set multiple times within this store`
      );
   }
   store.patch = (value: StoreSignalPatchParam<InitialValueType>) => {
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
         if (isStoreSlice(store[k])) {
            store[k].patch(v);
            continue;
         }

         (store[k] as WritableSignal<typeof v>).set(v);
      }
   };
   if (store['view']) {
      throw new Error(
         `Key \`view\` is trying to be set multiple times within this store`
      );
   }
   store.view = computed(() => storeView(store));
   return store;
}

export function store<InitialValueType extends {}>(
   intialValue: StoreSignalInput<InitialValueType>,
   config?: StoreSignalConfig
): Type<StoreSignal<InitialValueType>> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StoreSignalInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   @Injectable({ providedIn: config?.providedIn || null })
   class SignalStore {
      constructor(injector: Injector) {
         Object.assign(this, storeSlice(intialValue, injector));
      }
   }

   return SignalStore as Type<StoreSignal<InitialValueType>>;
}

export function storeView<
   T extends StoreSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch', 'view']);
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         if (isStoreSlice(state[k])) {
            // @ts-ignore
            o[k] = storeView(state[k]);
         } else if (!isAction(state[k])) {
            // @ts-ignore
            o[k] = state[k]();
         }
      });
   return o;
}
