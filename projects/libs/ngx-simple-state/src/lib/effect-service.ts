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
import { StateSelectors } from './state-service';
import { StateComputedSignal, StateSignal } from './state-signal';

export abstract class EffectService<
   T extends {},
   S extends StateSelectors<T> = {}
> {
   /**
    * State object with all fields as signals
    */
   protected state: StateSignal<T> & StateComputedSignal<S>;

   protected destroyed = new Subject<void>();

   constructor(
      state: StateSignal<T> & StateComputedSignal<S>,
      destroyed: Subject<void>
   ) {
      this.state = state;
      this.destroyed = destroyed;
   }

   abstract registerCounterEffects(): void;

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
