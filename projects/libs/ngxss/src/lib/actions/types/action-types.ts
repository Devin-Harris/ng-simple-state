import { Subject } from 'rxjs';
import { StateSignal } from '../../state/types/state-types';
import {
   NGX_SIMPLE_ACTION_SUBJECT_TOKEN,
   NGX_SIMPLE_ACTION_TOKEN,
} from '../tokens/action-tokens';

export type Action<Props = undefined, T = {}> = InternalAction<T, Props>;

export type InternalAction<InitialValueType, Props = undefined> = (
   state: StateSignal<InitialValueType>,
   props: Props
) => void;

export type WithActionToken<T> = T & {
   [NGX_SIMPLE_ACTION_TOKEN]?: true;
};

export type CreateAction<T, P> = (P extends undefined
   ? (state: StateSignal<T>) => void
   : (state: StateSignal<T>, props: P) => void) & {
   [NGX_SIMPLE_ACTION_TOKEN]?: true;
};

export type ActionType<T, P> = P extends undefined
   ? () => InternalAction<T, undefined> & {
        [NGX_SIMPLE_ACTION_SUBJECT_TOKEN]: Subject<any>;
     }
   : (props: P) => InternalAction<T, P> & {
        [NGX_SIMPLE_ACTION_SUBJECT_TOKEN]: Subject<P>;
     };