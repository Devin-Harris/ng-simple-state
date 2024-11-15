import { Subject } from 'rxjs';
import { StoreSignal } from '../../../public-api';
import { NGX_SIMPLE_ACTION_TOKEN } from '../tokens/action-tokens';

export type Action<Props = undefined, T = {}> = InternalAction<T, Props>;

export type InternalAction<InitialValueType, Props = undefined> = (
   store: StoreSignal<InitialValueType>,
   props: Props
) => void;

export type WithActionToken<T> = T & {
   [NGX_SIMPLE_ACTION_TOKEN]?: true;
};

export type CreateAction<T, P> = (P extends undefined
   ? (store: StoreSignal<T>) => void
   : (store: StoreSignal<T>, props: P) => void) & {
   [NGX_SIMPLE_ACTION_TOKEN]?: true;
};

export type WithActionSubject<P> = {
   subject: Subject<P>;
};

export type ActionType<T, P> = (P extends undefined
   ? () => InternalAction<T, undefined>
   : (props: P) => InternalAction<T, P>) &
   WithActionSubject<P>;
