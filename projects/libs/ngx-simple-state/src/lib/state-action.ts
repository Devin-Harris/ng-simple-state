import { Injectable, NgModule, Provider } from '@angular/core';
import { Subject } from 'rxjs';
import { StateSignal } from './state-signal';

@Injectable({ providedIn: 'root' })
export class Actions extends Subject<{ type: string; props?: any }> {}

export const globalAction = new Subject<{ type: string; props?: any }>();

export const ACTIONS_PROVIDER: Provider[] = [
   {
      provide: Actions,
      useValue: globalAction,
   },
];

@NgModule({
   providers: [ACTIONS_PROVIDER],
})
export class ActionsModule {}

export function provideActions() {
   return [ACTIONS_PROVIDER];
}

export type StateAction<InitialValueType, Props = undefined> = (
   state: StateSignal<InitialValueType>,
   props: Props
) => void;

export const NGX_SIMPLE_STATE_ACTION_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_ACTION_TOKEN'
);

export const NGX_SIMPLE_STATE_GLOBAL_ACTION_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_GLOBAL_ACTION_TOKEN'
);

export type WithStateActionToken<T> = T & {
   [NGX_SIMPLE_STATE_ACTION_TOKEN]?: true;
   [NGX_SIMPLE_STATE_GLOBAL_ACTION_TOKEN]?: CreateStateActionOptions;
};

export type CreateStateAction<T, P> = (P extends undefined
   ? (state: StateSignal<T>) => void
   : (state: StateSignal<T>, props: P) => void) & {
   [NGX_SIMPLE_STATE_ACTION_TOKEN]?: true;
   [NGX_SIMPLE_STATE_GLOBAL_ACTION_TOKEN]?: CreateStateActionOptions;
};

export type CreateStateActionOptions =
   | {
        isGlobalAction: true;
        source?: string;
     }
   | {
        isGlobalAction: false;
     };

const defaultCreateStateActionOptions: CreateStateActionOptions = {
   isGlobalAction: true,
};

export function createStateAction<T extends {}, P = undefined>(
   fn: CreateStateAction<T, P>,
   options: Partial<CreateStateActionOptions> = defaultCreateStateActionOptions
): WithStateActionToken<CreateStateAction<T, P>> {
   Object.assign(fn, {
      [NGX_SIMPLE_STATE_ACTION_TOKEN]: true,
      [NGX_SIMPLE_STATE_GLOBAL_ACTION_TOKEN]: {
         ...defaultCreateStateActionOptions,
         ...options,
      },
   });
   return fn;
}

export function isStateAction<T, R>(fn: any): fn is StateAction<T, R> {
   return fn && fn[NGX_SIMPLE_STATE_ACTION_TOKEN];
}
