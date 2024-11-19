import { Injector, runInInjectionContext, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { NGX_SIMPLE_STATE_INJECTOR_TOKEN } from '../../public-api';
import { NGX_SIMPLE_ACTION_TOKEN } from './tokens/action-tokens';
import {
   Action,
   ActionCallback,
   ActionType,
   CreateAction,
} from './types/action-types';

export function createAction<T extends {}, P = undefined>(
   fn: ActionCallback<T, P>
): CreateAction<T, P> {
   Object.assign(fn, {
      [NGX_SIMPLE_ACTION_TOKEN]: true,
   });
   return fn as CreateAction<T, P>;
}

export function isAction<T, R>(fn: any): fn is Action<T, R> {
   return fn && fn[NGX_SIMPLE_ACTION_TOKEN];
}

export function buildActionFn<T, P>(
   state: T & {
      [NGX_SIMPLE_STATE_INJECTOR_TOKEN]?: WritableSignal<Injector | null>;
   },
   value: Action<T, P>
): ActionType<T, P> {
   const subject = new Subject<any>();

   const fn = (props?: P) => {
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
   };

   Object.assign(fn, {
      [NGX_SIMPLE_ACTION_TOKEN]: true,
      subject,
   });

   return fn as ActionType<T, P>;
}
