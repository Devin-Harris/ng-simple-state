import { StateSignal } from './state-signal';

export type StateAction<InitialValueType, Props = undefined> = (
   state: StateSignal<InitialValueType>,
   props: Props
) => void;

export const NGX_SIMPLE_STATE_ACTION_TOKEN = 'NGX_SIMPLE_STATE_ACTION_TOKEN';

type CreateStateAction<T, P> = (P extends undefined
   ? (state: StateSignal<T>) => void
   : (state: StateSignal<T>, props: P) => void) & {
   NGX_SIMPLE_STATE_ACTION_TOKEN?: 'NGX_SIMPLE_STATE_ACTION_TOKEN';
};

export function createStateAction<T extends {}, P>(
   fn: CreateStateAction<T, P>
) {
   fn['NGX_SIMPLE_STATE_ACTION_TOKEN'] = NGX_SIMPLE_STATE_ACTION_TOKEN;
   return fn;
}

export function isStateAction<T, R>(fn: any): fn is StateAction<T, R> {
   return (
      fn &&
      fn['NGX_SIMPLE_STATE_ACTION_TOKEN'] === NGX_SIMPLE_STATE_ACTION_TOKEN
   );
}
