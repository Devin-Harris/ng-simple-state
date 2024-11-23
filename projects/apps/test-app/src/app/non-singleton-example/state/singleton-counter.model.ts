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

export const counterStoreInput: CounterStoreType = {
   count: 0,
   increment: createAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterStore = store.injectable<CounterStoreType>(
   { ...counterStoreInput },
   {
      providedIn: 'root',
   }
);
export const NonSingletonCounterStore = store.injectable<CounterStoreType>({
   ...counterStoreInput,
});
