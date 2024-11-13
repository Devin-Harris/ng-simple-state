import { Injector, Signal, Type, WritableSignal } from '@angular/core';

import { ActionType, InternalAction } from '../../actions/types/action-types';
import { InternalSelector } from '../../selectors/types/selector-types';
import {
   NGX_SIMPLE_STATE_INJECTOR_TOKEN,
   NGX_SIMPLE_STATE_TOKEN,
} from '../tokens/state-tokens';
import {
   ExcludeStateSignalHelperMethods,
   StateSignalHelperMethods,
} from './helper-method-types';

export interface InjectableConfig {
   providedIn: Type<any> | 'root' | 'platform' | 'any' | null; // Pulled from angulars Injectable interface options
}

export type StateSignalConfig = {
   injector?: Injector | null;
};

export type State<T> = {
   [x in keyof T]: T[x] extends InternalAction<any, infer P>
      ? T[x] extends InternalSelector<any, infer R>
         ? InternalSelector<State<T>, R>
         : InternalAction<State<T>, P>
      : T[x] extends InternalSelector<any, infer R>
      ? InternalSelector<State<T>, R>
      : T[x];
};

type StateSignalType<T> = {
   [x in ExcludeStateSignalHelperMethods<T>]: T[x] extends InternalSelector<
      any,
      infer R
   >
      ? Signal<R>
      : T[x] extends InternalAction<any, infer P>
      ? ActionType<T, P>
      : T[x] extends StateSignal<State<infer T2>>
      ? StateSignalType<T2>
      : WritableSignal<T[x]>;
};

export type StateSignal<T> = StateSignalType<T> &
   StateSignalHelperMethods<T> & {
      [NGX_SIMPLE_STATE_TOKEN]: true;
      [NGX_SIMPLE_STATE_INJECTOR_TOKEN]: WritableSignal<Injector | null>;
   };

export type StateInput<T> = Pick<T, ExcludeStateSignalHelperMethods<T>>;
