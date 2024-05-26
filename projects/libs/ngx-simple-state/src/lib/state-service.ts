import { computed } from '@angular/core';
import { Subject } from 'rxjs';
import { EffectService } from './effect-service';
import { CreateAction, CreateActionNoProps } from './state-action';
import {
   ActionEffectArgs,
   ActionEffectAsyncArgs,
   createActionEffect,
   createAsyncActionEffect,
} from './state-effect';
import {
   StateComputedSignal,
   StateSignal,
   stateSignal,
   stateSignalView,
} from './state-signal';

type StateServiceFromInitialValueConstructor<
   T extends {},
   P extends StateSelectors<T>
> = new (...args: any[]) => StateService<T, P>;

export type StateSelectors<T extends {}> = {
   [k: string]: (state: StateSignal<T>) => any;
};

export function StateServiceFromInitialValue<
   T extends {},
   P extends StateSelectors<T>
>(
   intialValue: T,
   selectors?: P,
   effects?: (typeof EffectService<T>)[]
): StateServiceFromInitialValueConstructor<T, P> {
   return class extends StateService<T, P> {
      constructor() {
         super(intialValue, selectors, effects);
      }
   };
}

export class StateService<T extends {}, S extends StateSelectors<T>> {
   /**
    * State object with all fields as signals
    */
   readonly state: StateSignal<T> & StateComputedSignal<S>;

   /**
    * State object with values pulled out of all internal signals
    */
   readonly view = computed(() => {
      return stateSignalView(this.state);
   });

   protected destroyed = new Subject<void>();

   constructor(
      intialValue: T,
      selectors?: S,
      effects?: (typeof EffectService<T>)[]
   ) {
      this.state = stateSignal(intialValue, selectors);

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
            this.state[selector] = computed(() => {
               return selectors[selector](this.state);
            });
         }
      }

      if (effects) {
         for (const effect of effects) {
            // @ts-ignore
            new effect(this.state, this.destroyed).registerCounterEffects();
         }
      }
   }

   /**
    * Method for nexting internal destroyed subject.
    * Useful for services that may want to run some cleanup code when they are set to destroy.
    * Clears all subscriptions to effects build with createActionEffect and createAsyncActionEffect methods
    */
   destroy(): void {
      this.destroyed.next();
   }

   protected createActionEffect<P>(
      ...args: ActionEffectArgs<T, S, CreateAction<P> | CreateActionNoProps, P>
   ) {
      // @ts-ignore
      return createActionEffect(this.state, this.destroyed, ...args);
   }

   protected createAsyncActionEffect<P>(
      ...args: ActionEffectAsyncArgs<
         T,
         S,
         CreateAction<P> | CreateActionNoProps,
         P
      >
   ) {
      // @ts-ignore
      return createAsyncActionEffect(this.state, this.destroyed, ...args);
   }
}
