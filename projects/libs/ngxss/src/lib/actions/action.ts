import {
   Injector,
   runInInjectionContext,
   signal,
   WritableSignal,
} from '@angular/core';
import { Subject } from 'rxjs';
import { NGX_SIMPLE_STATE_INJECTOR_TOKEN } from '../../public-api';
import {
   NGX_SIMPLE_ACTION_SUBJECT_TOKEN,
   NGX_SIMPLE_ACTION_TOKEN,
} from './tokens/action-tokens';
import {
   Action,
   ActionType,
   CreateAction,
   WithActionSubjectToken,
   WithActionToken,
} from './types/action-types';

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

export function actionToSubject<T, P>(fn: ActionType<T, P>): Subject<P> {
   const subject$ = fn[NGX_SIMPLE_ACTION_SUBJECT_TOKEN];
   let subject = subject$();
   if (!subject) {
      subject = new Subject<P>();
      subject$.set(subject);
   }
   return subject;
}

export function buildActionFn<T, R>(
   state: T & {
      [NGX_SIMPLE_STATE_INJECTOR_TOKEN]?: WritableSignal<Injector | null>;
   },
   value: Action<T, R>
): WithActionSubjectToken<WithActionToken<Function>> {
   const subject$ = signal<Subject<any> | null>(null);

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
         subject$()?.next(props);
      },
      {
         [NGX_SIMPLE_ACTION_TOKEN]: true,
         [NGX_SIMPLE_ACTION_SUBJECT_TOKEN]: subject$,
      } as const
   );
}
