import { Subject, Subscription, takeUntil } from 'rxjs';
import { CreateAction, CreateActionNoProps } from './state-action';
import { StateComputedSignal, StateSignal } from './state-signal';

export type NotPromise<T> = T extends Promise<any> ? never : T;

export type ActionEffectArgs<
   S extends {},
   U extends {},
   T extends CreateAction<P> | CreateActionNoProps,
   P
> = [
   actions: T | T[],
   cb: (
      state: StateSignal<S> & StateComputedSignal<U>,
      action: { type: string; payload: P }
   ) => NotPromise<any>
];
export type ActionEffectAsyncArgs<
   S extends {},
   U extends {},
   T extends CreateAction<P> | CreateActionNoProps,
   P
> = [
   actions: T | T[],
   cb: (
      state: StateSignal<S> & StateComputedSignal<U>,
      action: { type: string; payload: P }
   ) => Promise<any>
];

export function createActionEffect<
   S extends {},
   U extends {},
   T extends CreateAction<P> | CreateActionNoProps,
   P
>(
   state: StateSignal<S> & StateComputedSignal<U>,
   destroy$: Subject<void>,
   ...args: ActionEffectArgs<S, U, T, P>
) {
   const actions = Array.isArray(args[0]) ? args[0] : [args[0]];
   const cb = args[1];

   const subscriptions: { subscription: Subscription; action: T }[] = [];
   for (let a of actions) {
      const subscription = a.subject
         .pipe(
            // @ts-ignore
            takeUntil(destroy$)
         )
         .subscribe((action) => {
            cb(state, action as { type: string; payload: P });
         });
      subscriptions.push({ subscription, action: a });
   }
   return [subscriptions, state];
}

export function createAsyncActionEffect<
   S extends {},
   U extends {},
   T extends CreateAction<P> | CreateActionNoProps,
   P
>(
   state: StateSignal<S> & StateComputedSignal<U>,
   destroy$: Subject<void>,
   ...args: ActionEffectAsyncArgs<S, U, T, P>
) {
   const actions = Array.isArray(args[0]) ? args[0] : [args[0]];
   const cb = args[1];

   const subscriptions: { subscription: Subscription; action: T }[] = [];
   for (let a of actions) {
      const subscription = a.subject
         .pipe(
            // @ts-ignore
            takeUntil(destroy$)
         )
         .subscribe(async (action) => {
            await cb(state, action as { type: string; payload: P });
         });
      subscriptions.push({ subscription, action: a });
   }
   return [subscriptions, state];
}
