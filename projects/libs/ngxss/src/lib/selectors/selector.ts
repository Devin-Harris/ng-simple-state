import { NGX_SIMPLE_SELECTOR_TOKEN } from './tokens/selector-tokens';
import { CreateSelectorFn, Selector } from './types/selector-types';

export function createSelector<T extends {}, R>(fn: CreateSelectorFn<T, R>) {
   Object.assign(fn, { [NGX_SIMPLE_SELECTOR_TOKEN]: true });
   return fn;
}

export function isSelector<T, R>(fn: any): fn is Selector<T, R> {
   return fn && typeof fn === 'function' && fn[NGX_SIMPLE_SELECTOR_TOKEN];
}
