// import { Action } from '@ngrx/store';
import { Subject } from 'rxjs';
// import { ActionEffectRegisterType } from './state-effect';
import { CreateAction, CreateActionNoProps } from './state-action';
import {
   ActionEffectArgs,
   ActionEffectAsyncArgs,
   createActionEffect,
   createAsyncActionEffect,
} from './state-effect';
import { StateSignal } from './state-signal';

export abstract class EffectService<InitialValueType extends {}> {
   /**
    * State object with all fields as signals
    */
   protected state: StateSignal<InitialValueType>;

   protected destroyed = new Subject<void>();

   constructor(state: StateSignal<InitialValueType>, destroyed: Subject<void>) {
      this.state = state;
      this.destroyed = destroyed;
   }

   abstract registerCounterEffects(): void;

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
