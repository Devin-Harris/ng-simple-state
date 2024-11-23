import { CreateAction, CreateSelector } from '../../../public-api';
import { WithHelperMethodToken } from './helper-method-types';
import { InjectableStoreSignal, Store, StoreMutability } from './store-types';

type ExcludeSelectorsAndActions<T> = {
   [K in keyof T]: T[K] extends CreateSelector<any, any>
      ? never
      : T[K] extends CreateAction<any, any>
      ? never
      : K;
}[keyof T];

type ExcludeSelectorsAndActionsAndStoreSignals<T> = {
   [K in keyof Pick<T, ExcludeSelectorsAndActions<T>>]: T[K] extends Store<any>
      ? never
      : T[K] extends InjectableStoreSignal<any, any>
      ? never
      : K;
}[keyof Pick<T, ExcludeSelectorsAndActions<T>>];

export type StoreSignalWritableParam<T> = Pick<
   T,
   ExcludeSelectorsAndActionsAndStoreSignals<T>
> & {
   [x in keyof Pick<
      T,
      ExcludeSelectorsAndActions<T>
   > as T[x] extends InjectableStoreSignal<any, infer Mutability>
      ? Mutability extends StoreMutability.writable
         ? x
         : never
      : T[x] extends Store<any>
      ? x
      : never]: T[x] extends Store<infer T2>
      ? StoreSignalPatchParam<T2>
      : T[x] extends InjectableStoreSignal<infer T2, infer Mutability>
      ? Mutability extends StoreMutability.writable
         ? StoreSignalPatchParam<T2>
         : never
      : T[x];
};
export type StoreSignalPatchParam<T> = Partial<StoreSignalWritableParam<T>>;

export type PatchHelperMethod<T> = WithHelperMethodToken<
   (value: StoreSignalPatchParam<T>) => void
>;
