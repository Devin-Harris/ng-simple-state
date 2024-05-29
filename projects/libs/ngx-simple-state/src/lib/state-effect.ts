import { StateSignal } from './state-signal';

export type StateEffect<InitialValueType, Props = undefined> = (
   state: StateSignal<InitialValueType>,
   props: Props
) => void;

export const NGX_SIMPLE_STATE_EFFECT_TOKEN = 'NGX_SIMPLE_STATE_EFFECT_TOKEN';

type CreateStateEffect<T, P> = (P extends undefined
   ? (state: StateSignal<T>) => void
   : (state: StateSignal<T>, props: P) => void) & {
   NGX_SIMPLE_STATE_EFFECT_TOKEN?: 'NGX_SIMPLE_STATE_EFFECT_TOKEN';
};

export function createStateEffect<T extends {}, P>(
   fn: CreateStateEffect<T, P>
) {
   fn['NGX_SIMPLE_STATE_EFFECT_TOKEN'] = NGX_SIMPLE_STATE_EFFECT_TOKEN;
   return fn;
}

export function isStateEffect<T, R>(fn: any): fn is StateEffect<T, R> {
   return (
      fn &&
      fn['NGX_SIMPLE_STATE_EFFECT_TOKEN'] === NGX_SIMPLE_STATE_EFFECT_TOKEN
   );
}
