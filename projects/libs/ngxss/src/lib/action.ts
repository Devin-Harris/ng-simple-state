import { StoreSignal } from './store-signal';

export type Action<Props = undefined, T = {}> = InternalAction<T, Props>;

export type InternalAction<InitialValueType, Props = undefined> = (
   state: StoreSignal<InitialValueType>,
   props: Props
) => void;

export const NGX_SIMPLE_ACTION_TOKEN = Symbol('NGX_SIMPLE_ACTION_TOKEN');
export const NGX_SIMPLE_LAST_ACTION_KEY_TOKEN = Symbol(
   'NGX_SIMPLE_LAST_ACTION_KEY_TOKEN'
);

export type WithActionToken<T> = T & {
   NGX_SIMPLE_ACTION_TOKEN?: true;
};

type CreateAction<T, P> = (P extends undefined
   ? (state: StoreSignal<T>) => void
   : (state: StoreSignal<T>, props: P) => void) & {
   NGX_SIMPLE_ACTION_TOKEN?: true;
};

export function createAction<T extends {}, P = undefined>(
   fn: CreateAction<T, P>
): WithActionToken<CreateAction<T, P>> {
   Object.assign(fn, { [NGX_SIMPLE_ACTION_TOKEN]: true });
   return fn;
}

export function isAction<T, R>(fn: any): fn is Action<T, R> {
   return fn && fn[NGX_SIMPLE_ACTION_TOKEN];
}
