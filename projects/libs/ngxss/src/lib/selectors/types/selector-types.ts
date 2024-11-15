import { StoreSignal } from '../../../public-api';
import { NGX_SIMPLE_SELECTOR_TOKEN } from '../tokens/selector-tokens';

export type Selector<ReturnType, InitialValueType = {}> = InternalSelector<
   InitialValueType,
   ReturnType
>;

export type InternalSelector<InitialValueType, ReturnType> = (
   store: StoreSignal<InitialValueType>
) => ReturnType;

export type CreateSelectorFn<T, R> = ((store: StoreSignal<T>) => R) & {
   [NGX_SIMPLE_SELECTOR_TOKEN]?: true;
};
