import { Injector, runInInjectionContext, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { NGX_SIMPLE_STATE_INJECTOR_TOKEN } from '../../public-api';
import { NGX_SIMPLE_ACTION_TOKEN } from './tokens/action-tokens';
import { Action, CreateAction, WithActionToken } from './types/action-types';

export function createAction<T extends {}, P = undefined>(
   fn: CreateAction<T, P>
): WithActionToken<CreateAction<T, P>> {
   Object.assign(fn, {
      [NGX_SIMPLE_ACTION_TOKEN]: true,
   });
   return fn;
}

export function isAction<T, R>(fn: any): fn is Action<T, R> {
   return fn && fn[NGX_SIMPLE_ACTION_TOKEN];
}

export function buildActionFn<T, R>(
   state: T & {
      [NGX_SIMPLE_STATE_INJECTOR_TOKEN]?: WritableSignal<Injector | null>;
   },
   value: Action<T, R>
): WithActionToken<Function> {
   const subject = new Subject<any>();

   return Object.assign(
      (props?: any) => {
         const injector$ = state[NGX_SIMPLE_STATE_INJECTOR_TOKEN];
         const injector = injector$ ? injector$() : null;
         if (injector) {
            runInInjectionContext(injector, () => {
               (value as Function)(state, props);
            });
         } else {
            (value as Function)(state, props);
         }
         subject.next(props);
      },
      {
         [NGX_SIMPLE_ACTION_TOKEN]: true,
         subject,
      } as const
   );
}
