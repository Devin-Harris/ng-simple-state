import { Injector, WritableSignal } from '@angular/core';
import { HelperMethodUnion } from '../types/helper-method-types';
import { StoreSignal } from '../types/store-types';

export const NGX_SIMPLE_STATE_STORE_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_STORE_TOKEN'
);
export function isStore<T>(obj: any): obj is StoreSignal<T> {
   return obj && obj[NGX_SIMPLE_STATE_STORE_TOKEN];
}

export const NGX_SIMPLE_STATE_INJECTOR_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_INJECTOR_TOKEN'
);
export function isInjector<T>(
   obj: any
): obj is WritableSignal<Injector | null> {
   return obj && obj[NGX_SIMPLE_STATE_INJECTOR_TOKEN];
}

export const NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN = Symbol(
   'NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN'
);
export function isHelperMethod<T>(obj: any): obj is HelperMethodUnion {
   return obj && obj[NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN];
}
