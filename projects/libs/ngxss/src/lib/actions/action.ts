import { Subject } from 'rxjs';
import {
   NGX_SIMPLE_ACTION_SUBJECT_TOKEN,
   NGX_SIMPLE_ACTION_TOKEN,
} from './tokens/action-tokens';
import {
   Action,
   ActionType,
   CreateAction,
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
   // @ts-ignore
   return fn[NGX_SIMPLE_ACTION_SUBJECT_TOKEN];
}
