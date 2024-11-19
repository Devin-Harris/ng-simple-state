import { StoreSignal } from '../../../public-api';
import { NGX_SIMPLE_SELECTOR_TOKEN } from '../tokens/selector-tokens';

export type Selector<ReturnType, InitialValueType = {}> = CreateSelector<
   InitialValueType,
   ReturnType
>;

export type SelectorCallback<InitialValueType, ReturnType> = (
   store: StoreSignal<InitialValueType>
) => ReturnType;

export type CreateSelector<T, R> = SelectorCallback<T, R> & {
   [NGX_SIMPLE_SELECTOR_TOKEN]: true;
};
