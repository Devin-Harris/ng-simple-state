import {
   computed,
   Injectable,
   Injector,
   signal,
   Type,
   WritableSignal,
} from '@angular/core';
import { buildActionFn, isAction } from '../actions/action';
import { isSelector } from '../selectors/selector';
import {
   buildPatchFn,
   buildResetFn,
   buildViewFn,
   isHelperMethod,
} from './state-helper-methods';
import {
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_TOKEN,
} from './tokens/state-tokens';
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
         state[k] = buildActionFn(state, value);
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
   state.patch = buildPatchFn(state);
   if (state['view']) {
      throw new Error(
         `Key \`view\` is trying to be set multiple times within this state`
      );
   }
   state.view = buildViewFn(state);
   if (state['reset']) {
      throw new Error(
         `Key \`reset\` is trying to be set multiple times within this state`
      );
   }
   state.reset = buildResetFn(state, intialValue);

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

export function isInjector<T>(
   obj: any
): obj is WritableSignal<Injector | null> {
   return obj && obj[NGX_SIMPLE_STATE_INJECTOR_TOKEN];
}

export function stateView<
   T extends StateSignal<InitialValueType>,
   InitialValueType
>(state: T) {
   const o: InitialValueType = Object.create(null);
   const keys = Object.keys(state) as (keyof T)[];
   keys.forEach((k) => {
      if (isState(state[k])) {
         // @ts-ignore
         o[k] = stateView(state[k]);
      } else if (!isAction(state[k]) && !isHelperMethod(state[k])) {
         // @ts-ignore
         o[k] = state[k]();
      }
   });
   return o;
}
