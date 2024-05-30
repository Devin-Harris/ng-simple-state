import { StateSignal } from './state-signal';

export type StateSelector<InitialValueType, ReturnType> = (
   state: StateSignal<InitialValueType>
) => ReturnType;

export const NGX_SIMPLE_STATE_SELECTOR_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_SELECTOR_TOKEN'
);

type CreateStateSelectorFn<T, R> = ((state: StateSignal<T>) => R) & {
   [NGX_SIMPLE_STATE_SELECTOR_TOKEN]?: true;
};

export function createStateSelector<T extends {}, R>(
   fn: CreateStateSelectorFn<T, R>
) {
   Object.assign(fn, { [NGX_SIMPLE_STATE_SELECTOR_TOKEN]: true });
   return fn;
}

export function isStateSelector<T, R>(fn: any): fn is StateSelector<T, R> {
   return fn && typeof fn === 'function' && fn[NGX_SIMPLE_STATE_SELECTOR_TOKEN];
}
