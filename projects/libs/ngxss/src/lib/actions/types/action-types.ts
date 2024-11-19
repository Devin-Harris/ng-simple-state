import { Subject } from 'rxjs';
import { StoreSignal } from '../../../public-api';
import { NGX_SIMPLE_ACTION_TOKEN } from '../tokens/action-tokens';

export type Action<Props = undefined, T = {}> = CreateAction<T, Props>;

export type ActionCallback<T, P> = P extends undefined
   ? (store: StoreSignal<T>) => void
   : (store: StoreSignal<T>, props: P) => void;

export type CreateAction<T, P> = ActionCallback<T, P> & {
   [NGX_SIMPLE_ACTION_TOKEN]: true;
};

export type ActionType<T, P> = (P extends undefined
   ? () => ActionCallback<T, undefined>
   : (props: P) => ActionCallback<T, P>) & {
   subject: Subject<P>;
};
