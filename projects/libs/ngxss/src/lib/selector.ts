import { StoreSignal } from './store-signal';

export type Selector<ReturnType, InitialValueType = {}> = InternalSelector<
   InitialValueType,
   ReturnType
>;

export type InternalSelector<InitialValueType, ReturnType> = (
   state: StoreSignal<InitialValueType>
) => ReturnType;

export const NGX_SIMPLE_SELECTOR_TOKEN = Symbol('NGX_SIMPLE_SELECTOR_TOKEN');

type CreateSelectorFn<T, R> = ((state: StoreSignal<T>) => R) & {
   [NGX_SIMPLE_SELECTOR_TOKEN]?: true;
};

export function createSelector<T extends {}, R>(fn: CreateSelectorFn<T, R>) {
   Object.assign(fn, { [NGX_SIMPLE_SELECTOR_TOKEN]: true });
   return fn;
}

export function isSelector<T, R>(fn: any): fn is Selector<T, R> {
   return fn && typeof fn === 'function' && fn[NGX_SIMPLE_SELECTOR_TOKEN];
}
