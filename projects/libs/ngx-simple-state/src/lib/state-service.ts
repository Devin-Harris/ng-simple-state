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
import { StateSignal, stateSignal, stateSignalView } from './state-signal';

type StateServiceFromInitialValueConstructor<T extends {}> = new (
   ...args: any[]
) => StateServiceBase<T>;

export function StateService<InitialValueType extends {}>(
   intialValue: InitialValueType,
   effects?: (typeof EffectService<InitialValueType>)[]
): StateServiceFromInitialValueConstructor<InitialValueType> {
   return class extends StateServiceBase<InitialValueType> {
      constructor() {
         super(intialValue, effects);
      }
   };
}

export class StateServiceBase<InitialValueType extends {}> {
   /**
    * State object with all fields as signals
    */
   readonly state: StateSignal<InitialValueType>;

   /**
    * State object with values pulled out of all internal signals
    */
   readonly view = computed(() => stateSignalView(this.state));

   protected destroyed = new Subject<void>();

   constructor(
      intialValue: InitialValueType,
      effects?: (typeof EffectService<InitialValueType>)[]
   ) {
      this.state = stateSignal(intialValue);

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

   protected createActionEffect<ActionProps>(
      ...args: ActionEffectArgs<
         InitialValueType,
         CreateAction<ActionProps> | CreateActionNoProps,
         ActionProps
      >
   ) {
      return createActionEffect(this.state, this.destroyed, ...args);
   }

   protected createAsyncActionEffect<ActionProps>(
      ...args: ActionEffectAsyncArgs<
         InitialValueType,
         CreateAction<ActionProps> | CreateActionNoProps,
         ActionProps
      >
   ) {
      return createAsyncActionEffect(this.state, this.destroyed, ...args);
   }
}