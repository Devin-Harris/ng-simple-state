import { StateSignal } from '../../state/types/state-types';
import { NGX_SIMPLE_SELECTOR_TOKEN } from '../tokens/selector-tokens';

export type Selector<ReturnType, InitialValueType = {}> = InternalSelector<
   InitialValueType,
   ReturnType
>;

export type InternalSelector<InitialValueType, ReturnType> = (
   state: StateSignal<InitialValueType>
) => ReturnType;

export type CreateSelectorFn<T, R> = ((state: StateSignal<T>) => R) & {
   [NGX_SIMPLE_SELECTOR_TOKEN]?: true;
};
