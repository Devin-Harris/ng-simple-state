import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { CreateAction, CreateActionNoProps } from './state-action';
import { StateSignal } from './state-signal';

export type NotPromise<T> = T extends Promise<any> ? never : T;

export type ActionEffectArgs<
   InitialValueType extends {},
   Action extends CreateAction<ActionProps> | CreateActionNoProps,
   ActionProps
> = [
   actions: Action | Action[],
   cb: (
      state: StateSignal<InitialValueType>,
      action: { type: string; payload: ActionProps }
   ) => NotPromise<any>
];
export type ActionEffectAsyncArgs<
   InitialValueType extends {},
   Action extends CreateAction<ActionProps> | CreateActionNoProps,
   ActionProps
> = [
   actions: Action | Action[],
   cb: (
      state: StateSignal<InitialValueType>,
      action: { type: string; payload: ActionProps }
   ) => Promise<any>
];

export function createActionEffect<
   InitialValueType extends {},
   Action extends CreateAction<ActionProps> | CreateActionNoProps,
   ActionProps
>(
   state: StateSignal<InitialValueType>,
   destroy$: Subject<void>,
   ...args: ActionEffectArgs<InitialValueType, Action, ActionProps>
) {
   const actions = Array.isArray(args[0]) ? args[0] : [args[0]];
   const cb = args[1];

   const subscriptions: { subscription: Subscription; action: Action }[] = [];
   for (let a of actions) {
      const subscription = (a.subject as Observable<any>)
         .pipe(takeUntil(destroy$))
         .subscribe((action) => {
            cb(state, action as { type: string; payload: ActionProps });
         });
      subscriptions.push({ subscription, action: a });
   }
   return [subscriptions, state];
}

export function createAsyncActionEffect<
   InitialValueType extends {},
   Action extends CreateAction<ActionProps> | CreateActionNoProps,
   ActionProps
>(
   state: StateSignal<InitialValueType>,
   destroy$: Subject<void>,
   ...args: ActionEffectAsyncArgs<InitialValueType, Action, ActionProps>
) {
   const actions = Array.isArray(args[0]) ? args[0] : [args[0]];
   const cb = args[1];

   const subscriptions: { subscription: Subscription; action: Action }[] = [];
   for (let a of actions) {
      const subscription = (a.subject as Observable<any>)
         .pipe(takeUntil(destroy$))
         .subscribe(async (action) => {
            await cb(state, action as { type: string; payload: ActionProps });
         });
      subscriptions.push({ subscription, action: a });
   }
   return [subscriptions, state];
}
