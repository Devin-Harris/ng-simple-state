import {
   Action,
   Store,
   createAction,
   store,
} from 'projects/libs/ngxss/src/public-api';

export type CounterStoreType = Store<{
   count: number;
   increment: Action;
}>;

export const counterStateInput: CounterStoreType = {
   count: 0,
   increment: createAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterState = store.injectable<CounterStoreType>(
   counterStateInput,
   {
      providedIn: 'root',
   }
);
export const NonSingletonCounterState =
   store.injectable<CounterStoreType>(counterStateInput);
