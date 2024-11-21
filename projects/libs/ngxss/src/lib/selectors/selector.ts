import { NGX_SIMPLE_SELECTOR_TOKEN } from './tokens/selector-tokens';
import {
   CreateSelector,
   Selector,
   SelectorCallback,
} from './types/selector-types';

export function createSelector<T extends {}, R>(
   fn: SelectorCallback<T, R>
): CreateSelector<T, R> {
   Object.assign(fn, { [NGX_SIMPLE_SELECTOR_TOKEN]: true });
   return fn as CreateSelector<T, R>;
}

export function isSelector<T, R>(fn: any): fn is Selector<T, R> {
   return fn && typeof fn === 'function' && fn[NGX_SIMPLE_SELECTOR_TOKEN];
}
