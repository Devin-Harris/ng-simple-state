import {
   computed,
   Injectable,
   Injector,
   runInInjectionContext,
   signal,
   Type,
   WritableSignal,
} from '@angular/core';
import { Subject } from 'rxjs';
import { isAction } from '../actions/action';
import {
   NGX_SIMPLE_ACTION_SUBJECT_TOKEN,
   NGX_SIMPLE_ACTION_TOKEN,
} from '../actions/tokens/action-tokens';
import { WithActionToken } from '../actions/types/action-types';
import { isSelector } from '../selectors/selector';
import {
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_TOKEN,
} from './tokens/state-tokens';
import { StateSignalPatchParam } from './types/helper-method-types';
import {
   InjectableConfig,
   StateInput,
   StateSignal,
   StateSignalConfig,
} from './types/state-types';

export function createState<InitialValueType extends {}>(
   intialValue: StateInput<InitialValueType>,
   config: StateSignalConfig | null = null
): StateSignal<InitialValueType> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StateInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   const state = Object.create(null);
   const injector = config?.injector ?? null;
   state[NGX_SIMPLE_STATE_INJECTOR_TOKEN] = signal<Injector | null>(injector);

   for (const k of keys) {
      const value = intialValue[k];

      if (state[k]) {
         throw new Error(
            `Key \`${
               k as string
            }\` is trying to be set multiple times within this store`
         );
      }

      if (isSelector(value)) {
         state[k] = computed(() => value(state));
      } else if (isAction(value)) {
         const subject: WithActionToken<Subject<any>> = new Subject<any>();

         const fn: WithActionToken<Function> = Object.assign(
            (props?: any) => {
               const stateInjector = state[NGX_SIMPLE_STATE_INJECTOR_TOKEN]();
               if (stateInjector) {
                  runInInjectionContext(stateInjector, () => {
                     (value as Function)(state, props);
                  });
               } else {
                  (value as Function)(state, props);
               }
               subject.next(props);
            },
            {
               [NGX_SIMPLE_ACTION_TOKEN]: true,
               [NGX_SIMPLE_ACTION_SUBJECT_TOKEN]: subject,
            } as const
         );

         state[k] = fn;
      } else if (isState(value)) {
         value[NGX_SIMPLE_STATE_INJECTOR_TOKEN].set(injector);
         state[k] = value;
      } else {
         state[k] = signal(value);
      }
   }

   if (state['patch']) {
      throw new Error(
         `Key \`patch\` is trying to be set multiple times within this state`
      );
   }
   state.patch = (value: StateSignalPatchParam<InitialValueType>) => {
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
   if (state['view']) {
      throw new Error(
         `Key \`view\` is trying to be set multiple times within this state`
      );
   }
   state.view = computed(() => stateView(state));

   Object.assign(state, {
      [NGX_SIMPLE_STATE_TOKEN]: true,
   });

   return state;
}

export function createInjectableState<InitialValueType extends {}>(
   intialValue: StateInput<InitialValueType>,
   config?: InjectableConfig
): Type<StateSignal<InitialValueType>> {
   const keys = Object.keys(
      intialValue
   ) as (keyof StateInput<InitialValueType>)[];

   if (!intialValue || keys.length === 0) {
      throw new Error('Must provide an inital object value to store');
   }

   @Injectable({ providedIn: config?.providedIn || null })
   class InjectableState {
      constructor(injector: Injector) {
         Object.assign(this, createState(intialValue, { injector }));
      }
   }

   return InjectableState as Type<StateSignal<InitialValueType>>;
}

export function isState<T>(obj: any): obj is StateSignal<T> {
   return obj && obj[NGX_SIMPLE_STATE_TOKEN];
}

export function stateView<
   T extends StateSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const excludedKeys = new Set<keyof T>(['patch', 'view']);
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys
      .filter((k) => !excludedKeys.has(k))
      .forEach((k) => {
         if (isState(state[k])) {
            // @ts-ignore
            o[k] = stateView(state[k]);
         } else if (!isAction(state[k])) {
            // @ts-ignore
            o[k] = state[k]();
         }
      });
   return o;
}
