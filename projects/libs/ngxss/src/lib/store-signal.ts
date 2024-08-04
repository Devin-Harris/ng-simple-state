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
   InternalAction,
   NGX_SIMPLE_ACTION_TOKEN,
   NGX_SIMPLE_LAST_ACTION_KEY_TOKEN,
   WithActionToken,
   isAction,
} from './action';
import { StoreLogger } from './logger';
import { InternalSelector, isSelector } from './selector';

type IsActionOnly<T, K extends keyof T> = T[K] extends InternalAction<any, any>
   ? T[K] extends InternalSelector<any, any>
      ? false
      : true
   : false;

type ExcludeSelectorsAndActionsAndSlices<T> = {
   [K in keyof T]: T[K] extends
      | InternalSelector<any, any>
      | InternalAction<any, any>
      | WithActionToken<Subject<any>>
      | StoreSignal<any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends
      | InternalSelector<any, any>
      | InternalAction<any, any>
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
   >]: T[x] extends InternalSelector<any, infer R>
      ? Signal<R>
      : T[x] extends InternalAction<any, infer P>
      ? P extends undefined
         ? () => InternalAction<T, undefined>
         : (props: P) => InternalAction<T, P>
      : T[x] extends StoreSignal<Store<infer T2>>
      ? StoreSignalType<T2>
      : WritableSignal<T[x]>;
} & {
   [x in keyof T as IsActionOnly<T, x> extends true
      ? T[x] extends WithActionToken<Subject<any>>
         ? never
         : x extends string
         ? `$${x}`
         : never
      : never]: T[x] extends InternalAction<any, infer P>
      ? WithActionToken<Subject<P>>
      : never;
};

type StoreSignalPatchParam<T> = Partial<
   Pick<T, ExcludeSelectorsAndActionsAndSlices<T>> & {
      [x in keyof Pick<
         T,
         ExcludeSelectorsAndActions<T>
      > as T[x] extends StoreSignal<Store<any>>
         ? x
         : never]: T[x] extends StoreSignal<Store<infer T2>>
         ? StoreSignalPatchParam<T2>
         : T[x];
   }
>;

type StoreSignalHelperMethods<T> = {
   patch: (value: StoreSignalPatchParam<T>) => void;
   view: Signal<T>;
};

export type Store<T> = {
   [x in keyof T]: T[x] extends InternalAction<any, infer P>
      ? T[x] extends InternalSelector<any, infer R>
         ? InternalSelector<Store<T>, R>
         : InternalAction<Store<T>, P>
      : T[x] extends InternalSelector<any, infer R>
      ? InternalSelector<Store<T>, R>
      : T[x];
};

export type StoreSignal<T> = StoreSignalType<T> &
   StoreSignalHelperMethods<T> & {
      [NGX_SIMPLE_STORE_SLICE_TOKEN]: true;
      [NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN]: WritableSignal<Injector | null>;
      [NGX_SIMPLE_LAST_ACTION_KEY_TOKEN]: WritableSignal<
         string | number | symbol | null
      >;
   };

export interface StoreSignalConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
   logger?: StoreLogger<any>;
}

export type StoreInput<T> = Pick<
   Pick<T, ExcludeActionSubject<T>>,
   ExcludeStoreSignalHelperMethods<Pick<T, ExcludeActionSubject<T>>>
>;

export const NGX_SIMPLE_STORE_SLICE_TOKEN = Symbol(
   'NGX_SIMPLE_STORE_SLICE_TOKEN'
);

export function isStoreSlice<T>(obj: any): obj is StoreSignal<T> {
   return obj && obj[NGX_SIMPLE_STORE_SLICE_TOKEN];
}

export const NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN = Symbol(
   'NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN'
);
export const NGX_SIMPLE_STORE_SLICE_INITIAL_VALUE_TOKEN = Symbol(
   'NGX_SIMPLE_STORE_SLICE_INITIAL_VALUE_TOKEN'
);

export function createStoreSlice<InitialValueType extends {}>(
   intialValue: StoreInput<InitialValueType>,
   injector: Injector | null = null,
   logger: StoreLogger<InitialValueType> | null = null
): StoreSignal<InitialValueType> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StoreInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   const store = Object.create(null);
   store[NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN] = signal<Injector | null>(
      injector
   );
   store[NGX_SIMPLE_LAST_ACTION_KEY_TOKEN] = signal<
      string | number | symbol | null
   >(null);

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
               const storeInjector =
                  store[NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN]();
               if (storeInjector) {
                  runInInjectionContext(storeInjector, () => {
                     (value as Function)(store, props);
                  });
               } else {
                  (value as Function)(store, props);
               }
               subject.next(props);
               store[NGX_SIMPLE_LAST_ACTION_KEY_TOKEN].set(k);
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
         value[NGX_SIMPLE_STORE_SLICE_INJECTOR_TOKEN].set(injector);
         store[k] = value;
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

   Object.assign(store, {
      [NGX_SIMPLE_STORE_SLICE_TOKEN]: true,
   });

   return store;
}

export function createStore<InitialValueType extends {}>(
   intialValue: StoreInput<InitialValueType>,
   config?: StoreSignalConfig
): Type<StoreSignal<InitialValueType>> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StoreInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   @Injectable({ providedIn: config?.providedIn || null })
   class SignalStore {
      constructor(injector: Injector) {
         Object.assign(
            this,
            createStoreSlice(intialValue, injector, config?.logger ?? null)
         );
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
